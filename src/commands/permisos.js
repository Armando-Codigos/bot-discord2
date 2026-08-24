import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  PermissionsBitField
} from 'discord.js';
import { confirmPermission } from '../utils/permissions.js';

export default {
  data: new SlashCommandBuilder()
    .setName('permisos')
    .setDescription('Consultar permisos o asignarlos a un rol.')
    .addSubcommand(subcommand =>
      subcommand
        .setName('help')
        .setDescription('Muestra todos los permisos y formatos aceptados.')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('asignar')
        .setDescription('Abre el formulario para asignar permisos a un rol.')
        .addRoleOption(option =>
          option
            .setName('rol')
            .setDescription('Selecciona el rol al que quieres aplicar permisos')
            .setRequired(true)
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    await confirmPermission(interaction);

    if (interaction.options.getSubcommand() === 'help') {
      await interaction.reply({ embeds: [buildPermissionHelpEmbed()], ephemeral: true });
      return;
    }

    const role = interaction.options.getRole('rol', true);
    if (!role) {
      await interaction.reply({ content: '❌ No se encontró el rol seleccionado.', ephemeral: true });
      return;
    }

    const modal = new ModalBuilder()
      .setCustomId(`permisos_modal:${role.id}`)
      .setTitle('Aplicar permisos al rol');

    const permissionsInput = new TextInputBuilder()
      .setCustomId('permissions_input')
      .setLabel('Permisos en texto o código')
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder('PermissionsBitField.Flags.Administrator\nPermissionsBitField.Flags.ManageChannels\n...')
      .setRequired(true);

    const colorInput = new TextInputBuilder()
      .setCustomId('color_input')
      .setLabel('Color del rol (hex opcional)')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('#FF3333')
      .setRequired(false);

    modal.addComponents(
      new ActionRowBuilder().addComponents(permissionsInput),
      new ActionRowBuilder().addComponents(colorInput)
    );

    await interaction.showModal(modal);
  },

  async modalSubmitHandler(interaction) {
    await confirmPermission(interaction);

    try {
      const roleId = interaction.customId.split(':')[1];
      const role = interaction.guild.roles.cache.get(roleId);
      if (!role) {
        throw new Error('No se encontró el rol seleccionado.');
      }

      const permissionsInput = interaction.fields.getTextInputValue('permissions_input').trim();
      const colorInput = interaction.fields.getTextInputValue('color_input').trim();
      const permissions = parsePermissionInput(permissionsInput);
      await role.setPermissions(new PermissionsBitField(permissions));
      if (colorInput) {
        const color = normalizeColor(colorInput);
        await role.setColor(color);
      }

      await interaction.reply({ content: `✅ Permisos aplicados y color actualizado para el rol ${role.name}.`, ephemeral: true });
    } catch (error) {
      await interaction.reply({ content: `❌ ${error.message}`, ephemeral: true });
    }
  }
};

function parsePermissionInput(input) {
  const sanitized = input
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '')
    .replace(/permissions\s*:\s*/gi, '')
    .replace(/[()[\]{}]/g, ' ')
    .replace(/[:=]/g, ' ');

  const tokens = sanitized
    .split(/\r?\n|[\s,;]+/)
    .map(token => token.trim())
    .filter(Boolean);

  if (!tokens.length) {
    throw new Error('Escribe al menos un permiso.');
  }

  const knownPermissions = Object.entries(PermissionFlagsBits)
    .filter(([, value]) => typeof value === 'bigint' || typeof value === 'number')
    .map(([name, value]) => [normalizePermissionName(name), BigInt(value)]);

  let bitfield = 0n;

  for (const token of tokens) {
    if (['PERMISSIONS', 'PERMISSION', 'FLAGS', 'BITFIELD', 'ROLE'].includes(normalizePermissionName(token))) {
      continue;
    }

    const normalized = normalizePermissionName(token);

    if (normalized === 'ALL' || normalized === 'EVERYTHING') {
      bitfield |= PermissionFlagsBits.Administrator;
      continue;
    }

    const directMatch = knownPermissions.find(([name]) => name === normalized);
    if (directMatch) {
      bitfield |= directMatch[1];
      continue;
    }

    const codeMatch = token.match(/(?:PermissionsBitField|PermissionFlagsBits)\.Flags\.([A-Za-z0-9_]+)/);
    if (codeMatch) {
      const codeName = normalizePermissionName(codeMatch[1]);
      const codeEntry = knownPermissions.find(([name]) => name === codeName);
      if (codeEntry) {
        bitfield |= codeEntry[1];
        continue;
      }
    }

    if (/^0x[0-9a-f]+$/i.test(token) || /^\d+$/.test(token)) {
      bitfield |= BigInt(token);
      continue;
    }

    throw new Error(`Permiso no reconocido: ${token}`);
  }

  return bitfield;
}

function normalizePermissionName(value) {
  return String(value)
    .replace(/[^a-zA-Z0-9]+/g, '')
    .toUpperCase();
}

function normalizeColor(value) {
  const color = value.trim().toUpperCase();
  if (!/^#[0-9A-F]{6}$/.test(color)) {
    throw new Error('Color inválido. Usa un valor hexadecimal como #FF3333.');
  }
  return color;
}

function buildPermissionHelpEmbed() {
  const permissionNames = Object.keys(PermissionFlagsBits);
  const permissionLines = permissionNames.map(name => `PermissionsBitField.Flags.${name}`);
  const permissionFields = [];
  let permissionPage = [];
  let permissionPageLength = 0;

  for (const line of permissionLines) {
    if (permissionPageLength + line.length + 1 > 1000) {
      permissionFields.push(permissionPage.join('\n'));
      permissionPage = [];
      permissionPageLength = 0;
    }

    permissionPage.push(line);
    permissionPageLength += line.length + 1;
  }

  if (permissionPage.length) {
    permissionFields.push(permissionPage.join('\n'));
  }

  return {
    title: '📚 Ayuda de /permisos',
    description: `Hay ${permissionNames.length} permisos disponibles. Copia una o varias líneas de la plantilla en el formulario de /permisos asignar.`,
    color: 0x5865F2,
    fields: [
      {
        name: '🧭 Comandos',
        value: '`/permisos help`\n`/permisos asignar rol:@NombreDelRol`',
        inline: false
      },
      {
        name: '📋 Comandos del bot',
        value: '`/panel`\n`/help`\n`/crear` o `/crear preview:true`\n`/eliminar`\n`/eliminar-categoria`\n`/eliminar-canales`\n`/eliminar-roles`\n`/limpiar cantidad:100`\n`/mensaje`\n`/explicacion`\n`/permisos help` o `/permisos asignar rol:@Rol`',
        inline: false
      },
      {
        name: '✍️ Formatos aceptados',
        value: 'También puedes usar nombres simples separados por comas:\n`ManageChannels, SendMessages`\n\nPara todos los permisos usa `ALL` o `EVERYTHING` (equivale a Administrador).',
        inline: false
      },
      ...permissionFields.map((value, index) => ({
        name: `📋 Plantilla completa · ${index + 1}/${permissionFields.length}`,
        value: `\`\`\`js\n${value}\n\`\`\``,
        inline: false
      }))
    ]
  };
}
