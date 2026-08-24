import {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder
} from 'discord.js';

const sections = {
  overview: {
    title: '📘 Centro de ayuda',
    description: 'Selecciona una sección para consultar el flujo correcto y los permisos necesarios.',
    fields: [
      ['🧭 Flujo recomendado', '`/panel` para empezar, `/crear preview` para revisar y después `/crear` para aplicar.', false],
      ['🔐 Seguridad', 'Las acciones destructivas muestran un resumen y piden confirmación antes de ejecutarse.', false],
      ['📊 Progreso', 'Las operaciones largas muestran una barra privada con avance, elemento actual y errores puntuales.', false]
    ]
  },
  creation: {
    title: '🏗️ Crear estructuras',
    description: 'El parser lee una línea por elemento y conserva la categoría activa para los canales siguientes.',
    fields: [
      ['📝 `/crear`', 'Envía la estructura en el siguiente mensaje. Con `preview: true` solo genera una vista previa.', false],
      ['📋 Sintaxis', '```\n- Categoría\n+ Canal de texto\n> Canal de voz\n# Canal de anuncios\n! Canal de foro\n^ Canal de escenario\n% Canal multimedia\n@ Rol #00FF00\n```', false],
      ['💡 Consejo', 'Escribe primero `- Categoría` y después sus canales. Los roles pueden ir al final o entre categorías.', false]
    ]
  },
  deletion: {
    title: '🧹 Limpieza controlada',
    description: 'Cada comando calcula el alcance antes de borrar y excluye elementos protegidos por Discord.',
    fields: [
      ['🗑️ `/eliminar`', 'Borra canales, categorías y roles que el bot puede gestionar.', false],
      ['📁 `/eliminar-categoria`', 'Borra solo categorías.', true],
      ['💬 `/eliminar-canales`', 'Borra canales de texto, voz, anuncios y foros.', true],
      ['🛡️ `/eliminar-roles`', 'Borra roles no gestionados que estén por debajo del rol más alto del bot.', true]
    ]
  },
  admin: {
    title: '🛡️ Administración',
    description: 'Herramientas para moderación, anuncios y configuración de roles.',
    fields: [
      ['🧼 `/limpiar cantidad`', 'Elimina entre 1 y 100 mensajes recientes. Requiere Gestionar mensajes.', false],
      ['📣 `/mensaje`', 'Abre un formulario para publicar un anuncio con título, descripción, imagen y pie.', false],
      ['🎨 `/permisos asignar rol`', 'Aplica permisos y color hexadecimal a un rol. Usa `/permisos help` para ver todos los formatos.', false],
      ['📚 `/explicacion`', 'Consulta los nombres de permisos admitidos por `/permisos`.', false]
    ]
  }
};

export default {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Abrir una guía interactiva con secciones de uso y permisos.'),

  async execute(interaction) {
    await interaction.reply({ ...renderHelp('overview'), ephemeral: true });
  },

  async selectHandler(interaction, client, values) {
    await interaction.update({ ...renderHelp(values[0] ?? 'overview'), ephemeral: true });
  },

  async buttonHandler(interaction) {
    if (interaction.customId.startsWith('close:')) {
      await interaction.update({ content: '✅ Guía cerrada.', embeds: [], components: [] });
    }
  },

  render: renderHelp
};

function renderHelp(sectionName) {
  const section = sections[sectionName] ?? sections.overview;
  const embed = new EmbedBuilder()
    .setTitle(section.title)
    .setDescription(section.description)
    .setColor('#5865F2')
    .setTimestamp();

  for (const [name, value, inline] of section.fields) {
    embed.addFields({ name, value, inline });
  }

  const menu = new StringSelectMenuBuilder()
    .setCustomId('section:help')
    .setPlaceholder('Cambiar sección')
    .addOptions(
      { label: 'Resumen', value: 'overview', emoji: '🧭' },
      { label: 'Crear estructuras', value: 'creation', emoji: '🏗️' },
      { label: 'Limpieza controlada', value: 'deletion', emoji: '🧹' },
      { label: 'Administración', value: 'admin', emoji: '🛡️' }
    );
  const close = new ButtonBuilder()
    .setCustomId('close:help')
    .setLabel('Cerrar guía')
    .setStyle(ButtonStyle.Secondary);

  return {
    embeds: [embed],
    components: [new ActionRowBuilder().addComponents(menu), new ActionRowBuilder().addComponents(close)]
  };
}
