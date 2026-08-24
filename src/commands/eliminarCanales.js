import { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { countChannels, deleteChannels } from '../handlers/deleter.js';
import { createProgressReporter } from '../utils/progress.js';

export default {
  data: new SlashCommandBuilder()
    .setName('eliminar-canales')
    .setDescription('Eliminar solo los canales del servidor.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const summary = await countChannels(interaction.guild);
    const embed = new EmbedBuilder()
      .setTitle('⚠️ ELIMINAR CANALES')
      .setDescription('Se eliminarán los canales, las categorías y roles permanecerán.')
      .addFields(
        { name: '💬 Texto', value: `${summary.textChannels}`, inline: true },
        { name: '🔊 Voz', value: `${summary.voiceChannels}`, inline: true },
        { name: '📢 Anuncios', value: `${summary.announcementChannels}`, inline: true },
        { name: '🗣️ Foros', value: `${summary.forumChannels}`, inline: true }
      )
      .setColor('#FF8800');

    const confirmButton = new ButtonBuilder()
      .setCustomId('confirm:eliminar-canales')
      .setLabel('🗑️ CONFIRMAR')
      .setStyle(ButtonStyle.Danger);

    const cancelButton = new ButtonBuilder()
      .setCustomId('cancel:eliminar-canales')
      .setLabel('❌ CANCELAR')
      .setStyle(ButtonStyle.Secondary);

    const row = new ActionRowBuilder().addComponents(confirmButton, cancelButton);
    await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
  },

  async buttonHandler(interaction) {
    if (interaction.customId === 'confirm:eliminar-canales') {
      await interaction.deferReply({ ephemeral: true });
      const result = await deleteChannels(interaction.guild, {
        onProgress: createProgressReporter(interaction, 'Eliminando canales')
      });
      const summary = `✅ Canales eliminados: ${result.deleted}
❌ No eliminados: ${result.errors.length}${result.errors.length ? `\nMotivos:\n${result.errors.map(e => `- ${e}`).join('\n')}` : ''}`;
      await interaction.editReply({ content: summary, embeds: [], components: [] });
    } else if (interaction.customId === 'cancel:eliminar-canales') {
      await interaction.reply({ content: '❌ Operación cancelada.', ephemeral: true });
    }
  }
};
