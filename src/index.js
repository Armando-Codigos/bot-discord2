import dotenv from 'dotenv';
import { Client, GatewayIntentBits, Partials, Collection, Events, REST, Routes, PermissionFlagsBits } from 'discord.js';
import fs from 'fs';
import path from 'path';

dotenv.config();

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;

function validateSnowflake(value) {
  return typeof value === 'string' && /^[0-9]{17,19}$/.test(value);
}

if (!token || token.includes('tu_token') || token === 'tu_token_aqui') {
  console.error('DISCORD_TOKEN no está configurado o parece un valor de ejemplo en .env');
  process.exit(1);
}

if (!clientId || clientId.includes('tu_client_id') || !validateSnowflake(clientId)) {
  console.error('CLIENT_ID no está configurado o no es un ID válido en .env');
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions
  ],
  partials: [Partials.Channel]
});

client.commands = new Collection();
client.pendingCreations = new Map();
const commandsData = [];

const commandsPath = path.join(process.cwd(), 'src', 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = await import(`file://${filePath}`);
  if (command && command.default && command.default.data) {
    command.default.data.setDefaultMemberPermissions(PermissionFlagsBits.Administrator);
    client.commands.set(command.default.data.name, command.default);
    commandsData.push(command.default.data.toJSON());
  }
}

const rest = new REST({ version: '10' }).setToken(token);

const { logAction } = await import('./utils/logger.js');

client.once(Events.ClientReady, async () => {
  console.log(`Bot listo como ${client.user.tag}`);

  try {
    await client.user.setUsername('Endral Studio');
    console.log('Nombre del bot actualizado a Endral Studio');
  } catch (error) {
    console.warn('No se pudo cambiar el nombre del bot:', error.message);
  }

  console.log(`Registrando comandos globales para ${client.guilds.cache.size} servidor(es)...`);
  await rest.put(Routes.applicationCommands(clientId), { body: commandsData });
});

client.on(Events.MessageCreate, async message => {
  if (message.author.bot || !message.guild) return;
  if (!message.member?.permissions.has(PermissionFlagsBits.Administrator)) return;

  const key = `${message.guild.id}:${message.channel.id}:${message.author.id}`;
  const pending = client.pendingCreations.get(key);
  if (!pending) return;

  client.pendingCreations.delete(key);
  const createCommand = client.commands.get('crear');
  if (!createCommand?.handleStructureInput) return;

  const structure = message.content.trim();
  if (!structure) {
    await message.reply('⚠️ No se recibió texto válido. Inténtalo de nuevo.');
    return;
  }

  await createCommand.handleStructureInput(message, structure, pending.preview ?? false);
});

client.on(Events.InteractionCreate, async interaction => {
  if (interaction.guild && !interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
    const response = { content: '❌ Solo los miembros con permisos de Administrador pueden usar este bot.', ephemeral: true };
    if (interaction.isRepliable()) {
      await interaction.reply(response);
    }
    return;
  }

  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;
    try {
      await command.execute(interaction, client);
    } catch (error) {
      console.error(error);
      if (interaction.replied || interaction.deferred) {
        await interaction.editReply({ content: '❌ Ocurrió un error al ejecutar el comando.', embeds: [], components: [] });
      } else {
        await interaction.reply({ content: '❌ Ocurrió un error al ejecutar el comando.', ephemeral: true });
      }
      if (interaction.user && interaction.guild) {
        await logAction({
          interaction,
          action: 'Error al ejecutar comando',
          details: error.message || 'Error desconocido'
        });
      }
    }
  }

  if (interaction.isModalSubmit()) {
    const modalMatch = interaction.customId.match(/^(.+)_modal:(.+)$/);
    if (modalMatch) {
      const commandName = modalMatch[1];
      const command = client.commands.get(commandName);
      if (command?.modalSubmitHandler) {
        try {
          await command.modalSubmitHandler(interaction, client);
        } catch (error) {
          console.error(error);
          if (interaction.replied || interaction.deferred) {
            await interaction.editReply({ content: '❌ Error al procesar el modal.', embeds: [], components: [] });
          } else {
            await interaction.reply({ content: '❌ Error al procesar el modal.', ephemeral: true });
          }
        }
      }
    }
    return;
  }

  if (interaction.isButton()) {
    const customId = interaction.customId;
    const parts = customId.split(':');
    if (parts.length < 2) return;
    const action = parts[0];
    const commandName = parts[1];
    const command = client.commands.get(commandName);
    if (!command || !command.buttonHandler) return;
    try {
      await command.buttonHandler(interaction, client, parts.slice(2));
    } catch (error) {
      console.error(error);
      if (interaction.replied || interaction.deferred) {
        await interaction.editReply({ content: '❌ Error en la acción de confirmación.', embeds: [], components: [] });
      } else {
        await interaction.reply({ content: '❌ Error en la acción de confirmación.', ephemeral: true });
      }
    }
  }

  if (interaction.isStringSelectMenu()) {
    // Los select menus comparten el mismo esquema de IDs que los botones.
    const [action, commandName] = interaction.customId.split(':');
    const command = client.commands.get(commandName);
    if (action !== 'section' || !command?.selectHandler) return;
    try {
      await command.selectHandler(interaction, client, interaction.values);
    } catch (error) {
      console.error(error);
      if (interaction.replied || interaction.deferred) {
        await interaction.editReply({ content: '❌ Error al cambiar de sección.', embeds: [], components: [] });
      } else {
        await interaction.reply({ content: '❌ Error al cambiar de sección.', ephemeral: true });
      }
    }
  }
});

client.login(token);
