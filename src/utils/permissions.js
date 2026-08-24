import { PermissionFlagsBits } from 'discord.js';

export async function confirmPermission(interaction) {
  if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
    throw new Error('Necesitas permisos de Administrador para usar este comando.');
  }
}

export function hasManageMessages(interaction) {
  return interaction.memberPermissions?.has(PermissionFlagsBits.ManageMessages);
}
