import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('panel')
    .setDescription('Mostrar el panel de control interactivo del bot.'),

  async execute(interaction) {
    await interaction.reply({ ...renderPanel(), ephemeral: true });
  },

  async buttonHandler(interaction, client) {
    const action = interaction.customId.split(':')[0];
    if (action === 'showhelp') {
      const help = client.commands.get('help');
      await interaction.update({ ...(help?.render?.('overview') ?? renderPanel()), ephemeral: true });
      return;
    }
    if (action === 'showinfo') {
      await interaction.update({
        embeds: [new EmbedBuilder()
          .setTitle('💡 Cómo usar el panel')
          .setDescription('Elige una acción desde los comandos slash. Las operaciones delicadas siempre muestran una confirmación.')
          .addFields(
            { name: '🏗️ Construcción', value: '`/crear` admite categorías, texto, voz, anuncios, foros, escenarios, multimedia y roles.', inline: false },
            { name: '🧹 Limpieza', value: 'El progreso se actualiza en esta respuesta privada, incluso si el canal de origen desaparece.', inline: false },
            { name: '🔑 Acceso', value: 'Todos los comandos y acciones del bot requieren permisos de Administrador.', inline: false }
          )
          .setColor('#2F3136')],
        components: [new ActionRowBuilder().addComponents(backButton(), closeButton())]
      });
      return;
    }
    if (action === 'back') {
      await interaction.update({ ...renderPanel(), ephemeral: true });
      return;
    }
    if (action === 'close') {
      await interaction.update({ content: '✅ Panel cerrado.', embeds: [], components: [] });
    }
  }
};

function renderPanel() {
  const embed = new EmbedBuilder()
    .setTitle('🛠️ Panel de control')
    .setDescription('Un punto de entrada claro para construir, limpiar y administrar tu servidor.')
    .addFields(
      { name: '🏗️ Crear', value: '`/crear` · `/crear preview`', inline: true },
      { name: '🧹 Limpiar', value: '`/eliminar` · comandos específicos', inline: true },
      { name: '🛡️ Administrar', value: '`/permisos` · `/mensaje` · `/limpiar`', inline: true },
      { name: '📘 Orientación', value: 'Usa **Ver ayuda** para consultar cada flujo por secciones.', inline: false }
    )
    .setColor('#2F3136')
    .setFooter({ text: 'Panel privado para la persona que lo abrió.' });

  return {
    embeds: [embed],
    components: [new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('showhelp:panel').setLabel('Ver ayuda').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('showinfo:panel').setLabel('Información').setStyle(ButtonStyle.Secondary),
      closeButton()
    )]
  };
}

function backButton() {
  return new ButtonBuilder().setCustomId('back:panel').setLabel('Volver al panel').setStyle(ButtonStyle.Primary);
}

function closeButton() {
  return new ButtonBuilder().setCustomId('close:panel').setLabel('Cerrar').setStyle(ButtonStyle.Danger);
}
