import { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { countCategories, deleteCategories } from '../handlers/deleter.js';
import { createProgressReporter } from '../utils/progress.js';

export default {
  data: new SlashCommandBuilder()
    .setName('eliminar-categoria')
    .setDescription('Eliminar solo las categorías del servidor.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const count = await countCategories(interaction.guild);
    const embed = new EmbedBuilder()
      .setTitle('⚠️ ELIMINAR CATEGORÍAS')
      .setDescription('Se eliminarán las categorías y se conservarán los canales cuando sea posible.')
      .addFields({ name: '📁 Categorías', value: `${count}`, inline: true })
      .setColor('#FF8800');

    const confirmButton = new ButtonBuilder()
      .setCustomId('confirm:eliminar-categoria')
      .setLabel('🗑️ CONFIRMAR')
      .setStyle(ButtonStyle.Danger);

    const cancelButton = new ButtonBuilder()
      .setCustomId('cancel:eliminar-categoria')
      .setLabel('❌ CANCELAR')
      .setStyle(ButtonStyle.Secondary);

    const row = new ActionRowBuilder().addComponents(confirmButton, cancelButton);
    await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
  },

  async buttonHandler(interaction) {
    if (interaction.customId === 'confirm:eliminar-categoria') {
      await interaction.deferReply({ ephemeral: true });
      const result = await deleteCategories(interaction.guild, {
        onProgress: createProgressReporter(interaction, 'Eliminando categorías')
      });
      const summary = `✅ Categorías eliminadas: ${result.deleted}
❌ No eliminadas: ${result.errors.length}${result.errors.length ? `\nMotivos:\n${result.errors.map(e => `- ${e}`).join('\n')}` : ''}`;
      await interaction.editReply({ content: summary, embeds: [], components: [] });
    } else if (interaction.customId === 'cancel:eliminar-categoria') {
      await interaction.reply({ content: '❌ Operación cancelada.', ephemeral: true });
    }
  }
};
