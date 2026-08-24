import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { REST, Routes } from 'discord.js';

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

const commands = [];
const commandsPath = path.join(process.cwd(), 'src', 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = await import(`file://${filePath}`);
  if (command && command.default && command.default.data) {
    commands.push(command.default.data.toJSON());
  }
}

const rest = new REST({ version: '10' }).setToken(token);

try {
  if (commands.length === 0) {
    console.error('No se encontraron comandos en src/commands. Revisa que existan archivos .js con data de comando.');
    process.exit(1);
  }

  console.log('Registrando comandos globales para todos los servidores...');
  await rest.put(Routes.applicationCommands(clientId), { body: commands });
  console.log('Comandos registrados correctamente.');
} catch (error) {
  console.error('Error al registrar comandos:', error);
}
