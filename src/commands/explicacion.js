import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('explicacion')
    .setDescription('Muestra una guía de permisos que se pueden asignar a los roles.'),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('📘 Explicación de permisos para roles')
      .setDescription('Aquí tienes todos los permisos que puedes asignar a un rol.')
      .setColor('#5865F2')
      .setTimestamp();

    const permissionNames = Object.keys(PermissionFlagsBits);
    const permissionLines = permissionNames.map(name => `\`${name}\``);
    let page = [];
    let pageLength = 0;
    const pages = [];

    for (const line of permissionLines) {
      if (pageLength + line.length + 2 > 1000) {
        pages.push(page.join(', '));
        page = [];
        pageLength = 0;
      }

      page.push(line);
      pageLength += line.length + 2;
    }

    if (page.length) pages.push(page.join(', '));

    pages.forEach((value, index) => {
      embed.addFields({
        name: `🔐 Todos los permisos (${permissionNames.length}) · ${index + 1}/${pages.length}`,
        value,
        inline: false
      });
    });

    embed.addFields({
      name: '💡 Uso',
      value: 'Usa `/permisos help` para ver la plantilla completa y `/permisos asignar rol:@NombreDelRol` para abrir el formulario.',
      inline: false
    });

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
