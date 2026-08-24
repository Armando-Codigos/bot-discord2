import { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { countRoles, deleteRoles } from '../handlers/deleter.js';
import { createProgressReporter } from '../utils/progress.js';

export default {
  data: new SlashCommandBuilder()
    .setName('eliminar-roles')
    .setDescription('Eliminar solo los roles que el bot pueda eliminar.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const count = await countRoles(interaction.guild, interaction.client.user.id);
    const embed = new EmbedBuilder()
      .setTitle('⚠️ ELIMINAR ROLES')
      .setDescription('Se eliminarán solo los roles eliminables sin afectar @everyone ni el rol del bot.')
      .addFields({ name: '🛡️ Roles eliminables', value: `${count}`, inline: true })
      .setColor('#FF8800');

    const confirmButton = new ButtonBuilder()
      .setCustomId('confirm:eliminar-roles')
      .setLabel('🗑️ CONFIRMAR')
      .setStyle(ButtonStyle.Danger);

    const cancelButton = new ButtonBuilder()
      .setCustomId('cancel:eliminar-roles')
      .setLabel('❌ CANCELAR')
      .setStyle(ButtonStyle.Secondary);

    const row = new ActionRowBuilder().addComponents(confirmButton, cancelButton);
    await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
  },

  async buttonHandler(interaction) {
    if (interaction.customId === 'confirm:eliminar-roles') {
      await interaction.deferReply({ ephemeral: true });
      const result = await deleteRoles(interaction.guild, interaction.client.user.id, {
        onProgress: createProgressReporter(interaction, 'Eliminando roles')
      });
      const summary = `✅ Roles eliminados: ${result.deleted}
❌ No eliminados: ${result.errors.length}${result.errors.length ? `\nMotivos:\n${result.errors.map(e => `- ${e}`).join('\n')}` : ''}`;
      await interaction.editReply({ content: summary, embeds: [], components: [] });
    } else if (interaction.customId === 'cancel:eliminar-roles') {
      await interaction.reply({ content: '❌ Operación cancelada.', ephemeral: true });
    }
  }
};
