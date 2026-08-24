import { EmbedBuilder } from 'discord.js';

const PROGRESS_COLOR = '#57F287';
const UPDATE_INTERVAL = 900;

// Actualiza una respuesta efimera sin convertir un fallo visual en un fallo de la operacion.
export function createProgressReporter(interaction, title) {
  let lastUpdate = 0;
  let pendingUpdate = null;

  return async progress => {
    const now = Date.now();
    const isFinal = progress.completed >= progress.total;
    if (!isFinal && now - lastUpdate < UPDATE_INTERVAL) return;

    lastUpdate = now;
    const percent = progress.total ? Math.round((progress.completed / progress.total) * 100) : 100;
    const bar = makeProgressBar(percent);
    const embed = new EmbedBuilder()
      .setTitle(`⏳ ${title}`)
      .setDescription(`**${bar}**\n\n**${percent}%** · ${progress.completed}/${progress.total}\n${progress.error ? `⚠️ ${progress.error}` : `Trabajando en: ${progress.current}`}`)
      .setColor(progress.error ? '#FEE75C' : PROGRESS_COLOR)
      .setFooter({ text: 'La respuesta es privada y permanece aunque se elimine el canal de origen.' });

    pendingUpdate = interaction.editReply({ embeds: [embed], content: '', components: [] }).catch(() => null);
    await pendingUpdate;
  };
}

function makeProgressBar(percent, length = 18) {
  const filled = Math.round((percent / 100) * length);
  return `[${'█'.repeat(filled)}${'░'.repeat(length - filled)}]`;
}
