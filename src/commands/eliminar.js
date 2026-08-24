import { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { countGuildStructure } from '../handlers/deleter.js';
import { logAction } from '../utils/logger.js';
import { createProgressReporter } from '../utils/progress.js';

export default {
  data: new SlashCommandBuilder()
    .setName('eliminar')
    .setDescription('Eliminar toda la estructura del servidor.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const summary = await countGuildStructure(interaction.guild, interaction.client.user.id);
    const embed = new EmbedBuilder()
      .setTitle('⚠️ ELIMINACIÓN TOTAL')
      .setDescription('Se eliminarán todos los elementos que el bot pueda gestionar.')
      .addFields(
        { name: '📁 Categorías', value: `${summary.categories}`, inline: true },
        { name: '💬 Canales de texto', value: `${summary.textChannels}`, inline: true },
        { name: '🔊 Canales de voz', value: `${summary.voiceChannels}`, inline: true },
        { name: '📢 Canales de anuncios', value: `${summary.announcementChannels}`, inline: true },
        { name: '🗣️ Foros', value: `${summary.forumChannels}`, inline: true },
        { name: '🛡️ Roles eliminables', value: `${summary.deletableRoles}`, inline: true }
      )
      .setColor('#FF0000');

    const confirmButton = new ButtonBuilder()
      .setCustomId('confirm:eliminar')
      .setLabel('🗑️ ELIMINAR TODO')
      .setStyle(ButtonStyle.Danger);

    const cancelButton = new ButtonBuilder()
      .setCustomId('cancel:eliminar')
      .setLabel('❌ CANCELAR')
      .setStyle(ButtonStyle.Secondary);

    const row = new ActionRowBuilder().addComponents(confirmButton, cancelButton);
    await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
  },

  async buttonHandler(interaction, client, args) {
    if (interaction.customId === 'confirm:eliminar') {
      await interaction.deferReply({ ephemeral: true });
      const { deleteAllStructure } = await import('../handlers/deleter.js');
      const result = await deleteAllStructure(interaction.guild, interaction.client.user.id, {
        onProgress: createProgressReporter(interaction, 'Eliminando estructura')
      });
      const summary = resultSummary(result);
      await interaction.editReply({ content: summary, embeds: [], components: [] });
      await logAction({
        interaction,
        action: 'Eliminación total',
        details: summary
      });
    } else if (interaction.customId === 'cancel:eliminar') {
      await interaction.reply({ content: '❌ Operación cancelada.', ephemeral: true });
    }
  }
};

function resultSummary(result) {
  const lines = [
    '🛡️ **Eliminación completada**',
    `✅ Eliminados: ${result.deleted}`
  ];
  if (result.errors.length) {
    lines.push(`❌ No eliminados: ${result.errors.length}`);
    lines.push('Motivos:');
    result.errors.forEach(err => lines.push(`- ${err}`));
  }
  return lines.join('\n');
}
