import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('limpiar')
    .setDescription('Eliminar mensajes recientes del canal actual.')
    .addIntegerOption(option =>
      option.setName('cantidad')
        .setDescription('Cantidad de mensajes a eliminar (máximo 100).')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    const cantidad = interaction.options.getInteger('cantidad');
    await interaction.reply({ content: '🧹 Limpiando mensajes...', ephemeral: true });
    try {
      const deleted = await interaction.channel.bulkDelete(cantidad, true);
      const reply = await interaction.editReply({ content: `✅ Se eliminaron ${deleted.size} mensajes.` });
      setTimeout(() => {
        reply.delete().catch(() => {});
      }, 7000);
    } catch (error) {
      console.error(error);
      await interaction.editReply({ content: '❌ No se pudieran eliminar los mensajes. Asegúrate de que el bot tenga permisos y que los mensajes no sean muy antiguos.' });
    }
  }
};
