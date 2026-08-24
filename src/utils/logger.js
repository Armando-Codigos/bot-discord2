import dotenv from 'dotenv';
import { EmbedBuilder } from 'discord.js';

dotenv.config();

export async function logAction({ interaction, action, details = '' }) {
  const channelId = process.env.LOG_CHANNEL_ID;
  if (!channelId) return;
  const channel = await interaction.client.channels.fetch(channelId).catch(() => null);
  if (!channel || !channel.isTextBased?.()) return;

  const embed = new EmbedBuilder()
    .setTitle('🛡️ ACCIÓN ADMINISTRATIVA')
    .addFields(
      { name: 'Usuario', value: interaction.user.tag, inline: true },
      { name: 'Servidor', value: interaction.guild?.name ?? 'Desconocido', inline: true },
      { name: 'Acción', value: action, inline: true },
      { name: 'Detalle', value: details || 'Sin detalles', inline: false },
      { name: 'Fecha', value: new Date().toLocaleDateString('es-ES'), inline: true }
    )
    .setColor('#7289DA');

  await channel.send({ embeds: [embed] });
}
