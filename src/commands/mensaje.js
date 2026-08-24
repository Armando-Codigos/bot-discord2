import { SlashCommandBuilder, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, EmbedBuilder } from 'discord.js';
import { isValidHexColor } from '../utils/colors.js';

export default {
  data: new SlashCommandBuilder()
    .setName('mensaje')
    .setDescription('Crear un anuncio con título, descripción, imagen y pie de página.')
    .addBooleanOption(option =>
      option.setName('preview')
        .setDescription('Ver el anuncio antes de publicarlo.')
        .setRequired(false)
    ),

  async execute(interaction) {
    const preview = interaction.options.getBoolean('preview') ?? false;

    const modal = new ModalBuilder()
      .setCustomId(`mensaje_modal:${preview}`)
      .setTitle(preview ? 'Previsualizar anuncio' : 'Crear anuncio');

    const titleInput = new TextInputBuilder()
      .setCustomId('announcement_title')
      .setLabel('Título del anuncio')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('Ejemplo: Nueva actualización del servidor')
      .setRequired(true)
      .setMaxLength(100);

    const descriptionInput = new TextInputBuilder()
      .setCustomId('announcement_description')
      .setLabel('Descripción del anuncio')
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder('Escribe el contenido principal del anuncio...')
      .setRequired(true)
      .setMinLength(10)
      .setMaxLength(1024);

    const imageInput = new TextInputBuilder()
      .setCustomId('announcement_image')
      .setLabel('URL de imagen (opcional)')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('https://ejemplo.com/imagen.png')
      .setRequired(false)
      .setMaxLength(200);

    const footerInput = new TextInputBuilder()
      .setCustomId('announcement_footer')
      .setLabel('Pie de página (opcional)')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('Publicado por el equipo de staff')
      .setRequired(false)
      .setMaxLength(80);

    const colorInput = new TextInputBuilder()
      .setCustomId('announcement_color')
      .setLabel('Color lateral hexadecimal (opcional)')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('#5865F2')
      .setRequired(false)
      .setMaxLength(7);

    const row1 = new ActionRowBuilder().addComponents(titleInput);
    const row2 = new ActionRowBuilder().addComponents(descriptionInput);
    const row3 = new ActionRowBuilder().addComponents(imageInput);
    const row4 = new ActionRowBuilder().addComponents(footerInput);
    const row5 = new ActionRowBuilder().addComponents(colorInput);

    modal.addComponents(row1, row2, row3, row4, row5);
    await interaction.showModal(modal);
  },

  async modalSubmitHandler(interaction) {
    const preview = interaction.customId.split(':')[1] === 'true';
    const title = interaction.fields.getTextInputValue('announcement_title');
    const description = interaction.fields.getTextInputValue('announcement_description');
    const image = interaction.fields.getTextInputValue('announcement_image').trim();
    const footer = interaction.fields.getTextInputValue('announcement_footer').trim();
    const colorInput = interaction.fields.getTextInputValue('announcement_color').trim();
    const color = colorInput || '#7289DA';

    if (!isValidHexColor(color)) {
      throw new Error('El color debe estar en formato hexadecimal, por ejemplo #5865F2.');
    }

    const embed = new EmbedBuilder()
      .setTitle(title)
      .setDescription(description)
      .setColor(color)
      .setTimestamp();

    if (image) {
      try {
        embed.setImage(image);
      } catch {
        // Mantener si la URL no es válida, Discord lanzará un error al enviar.
      }
    }

    if (footer) {
      embed.setFooter({ text: footer });
    }

    if (preview) {
      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }

    await interaction.reply({ embeds: [embed] });
  }
};
