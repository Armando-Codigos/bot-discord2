import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';

export function buildConfirmation(interaction, title, description, confirmId, confirmLabel) {
  const embed = new EmbedBuilder().setTitle(title).setDescription(description).setColor('#FF8800');
  const confirmButton = new ButtonBuilder().setCustomId(confirmId).setLabel(confirmLabel).setStyle(ButtonStyle.Danger);
  const cancelButton = new ButtonBuilder().setCustomId(`cancel:${confirmId.split(':')[1]}`).setLabel('❌ CANCELAR').setStyle(ButtonStyle.Secondary);
  const row = new ActionRowBuilder().addComponents(confirmButton, cancelButton);
  return { embed, row };
}
