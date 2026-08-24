import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { parseStructure, buildPreview } from '../handlers/parser.js';
import { createStructure } from '../handlers/creator.js';
import { logAction } from '../utils/logger.js';
import { confirmPermission } from '../utils/permissions.js';
import { createProgressReporter } from '../utils/progress.js';

export default {
  data: new SlashCommandBuilder()
    .setName('crear')
    .setDescription('Crear una estructura completa de servidor.')
    .addBooleanOption(option =>
      option.setName('preview')
        .setDescription('Mostrar previsualización sin crear nada.')
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction, client) {
    await confirmPermission(interaction);
    const preview = interaction.options.getBoolean('preview') ?? false;

    client.pendingCreations ??= new Map();
    const key = `${interaction.guildId}:${interaction.channelId}:${interaction.user.id}`;
    client.pendingCreations.set(key, { preview, createdAt: Date.now() });

    await interaction.reply({
      content: '✍️ Envía la estructura en el siguiente mensaje. Puedes usar saltos de línea y espacios.\nEjemplo:\n```\n- Categoría\n+ Canal de texto\n> Canal de voz\n# Canal de anuncios\n! Canal de foro\n^ Canal de escenario\n% Canal multimedia\n@ Moderador #00FF00\n```',
      ephemeral: true
    });
  },

  async buttonHandler() {
    // no aplica para este comando
  },

  async handleStructureInput(source, structure, preview) {
    await submitCreateAction(source, structure, preview);
  }
};

async function submitCreateAction(source, structure, preview) {
  try {
    const items = parseStructure(structure);
    if (preview) {
      const previewText = buildPreview(items);
      if (source.isChatInputCommand?.()) {
        await source.reply({ content: previewText, ephemeral: true });
      } else {
        await source.reply({ content: previewText });
      }
      return;
    }

    if (source.isChatInputCommand?.()) {
      await source.deferReply({ ephemeral: true });
    }

    const progress = source.isChatInputCommand?.()
      ? createProgressReporter(source, 'Creando estructura')
      : null;
    const report = await createStructure(source.guild, items, {
      onProgress: progress ?? undefined
    });
    const summary = `✅ Estructura creada: ${report.created}${report.errors.length ? `\n❌ Errores:\n${report.errors.map(e => `- ${e}`).join('\n')}` : ''}`;

    if (source.isChatInputCommand?.()) {
      await source.editReply({ content: summary });
    } else {
      await source.reply({ content: summary });
    }

    const logContext = source.isChatInputCommand?.()
      ? source
      : { user: source.author, guild: source.guild, client: source.client };

    await logAction({ interaction: logContext, action: 'Crear estructura', details: summary });
  } catch (error) {
    if (source.isChatInputCommand?.()) {
      if (source.replied || source.deferred) {
        await source.editReply({ content: `❌ ${error.message}` });
      } else {
        await source.reply({ content: `❌ ${error.message}`, ephemeral: true });
      }
    } else {
      await source.reply({ content: `❌ ${error.message}` });
    }
  }
}
