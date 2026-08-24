import { ChannelType } from 'discord.js';

export async function countGuildStructure(guild, botId) {
  const botMember = await guild.members.fetch(botId).catch(() => null);
  const categories = guild.channels.cache.filter(c => c.type === ChannelType.GuildCategory).size;
  const textChannels = guild.channels.cache.filter(c => c.type === ChannelType.GuildText).size;
  const voiceChannels = guild.channels.cache.filter(c => c.type === ChannelType.GuildVoice).size;
  const announcementChannels = guild.channels.cache.filter(c => c.type === ChannelType.GuildAnnouncement).size;
  const forumChannels = guild.channels.cache.filter(c => c.type === ChannelType.GuildForum).size;
  const deletableRoles = guild.roles.cache.filter(role => canDeleteRole(role, guild, botId, botMember)).size;
  return { categories, textChannels, voiceChannels, announcementChannels, forumChannels, deletableRoles };
}

export async function deleteAllStructure(guild, botId, options = {}) {
  const result = { deleted: 0, errors: [] };
  const botMember = await guild.members.fetch(botId).catch(() => null);

  const channels = guild.channels.cache.filter(c => c.type !== ChannelType.GuildCategory);
  const categories = guild.channels.cache.filter(c => c.type === ChannelType.GuildCategory);
  const roles = guild.roles.cache.filter(role => canDeleteRole(role, guild, botId, botMember));
  const total = channels.size + categories.size + roles.size;
  const onProgress = options.onProgress ?? (() => {});
  let completed = 0;

  await onProgress({ completed, total, current: 'Preparando eliminación' });
  for (const channel of channels.values()) {
    try {
      await channel.delete('Endral Studio eliminación total');
      result.deleted += 1;
    } catch (error) {
      result.errors.push(`Canal ${channel.name}: ${error.message}`);
    }
    completed += 1;
    await onProgress({ completed, total, current: `Canal: ${channel.name}` });
  }

  for (const category of categories.values()) {
    try {
      await category.delete('Endral Studio eliminación total');
      result.deleted += 1;
    } catch (error) {
      result.errors.push(`Categoría ${category.name}: ${error.message}`);
    }
    completed += 1;
    await onProgress({ completed, total, current: `Categoría: ${category.name}` });
  }

  for (const role of roles.values()) {
    try {
      await role.delete('Endral Studio eliminación total');
      result.deleted += 1;
    } catch (error) {
      result.errors.push(`Rol ${role.name}: ${error.message}`);
    }
    completed += 1;
    await onProgress({ completed, total, current: `Rol: ${role.name}` });
  }

  return result;
}

export async function countCategories(guild) {
  return guild.channels.cache.filter(c => c.type === ChannelType.GuildCategory).size;
}

export async function deleteCategories(guild, options = {}) {
  const result = { deleted: 0, errors: [] };
  const categories = guild.channels.cache.filter(c => c.type === ChannelType.GuildCategory);
  const onProgress = options.onProgress ?? (() => {});
  let completed = 0;
  await onProgress({ completed, total: categories.size, current: 'Preparando eliminación' });
  for (const category of categories.values()) {
    try {
      await category.delete('Endral Studio eliminación de categorías');
      result.deleted += 1;
    } catch (error) {
      result.errors.push(`Categoría ${category.name}: ${error.message}`);
    }
    completed += 1;
    await onProgress({ completed, total: categories.size, current: `Categoría: ${category.name}` });
  }
  return result;
}

export async function countChannels(guild) {
  const textChannels = guild.channels.cache.filter(c => c.type === ChannelType.GuildText).size;
  const voiceChannels = guild.channels.cache.filter(c => c.type === ChannelType.GuildVoice).size;
  const announcementChannels = guild.channels.cache.filter(c => c.type === ChannelType.GuildAnnouncement).size;
  const forumChannels = guild.channels.cache.filter(c => c.type === ChannelType.GuildForum).size;
  return { textChannels, voiceChannels, announcementChannels, forumChannels };
}

export async function deleteChannels(guild, options = {}) {
  const result = { deleted: 0, errors: [] };
  const channels = guild.channels.cache.filter(c => [ChannelType.GuildText, ChannelType.GuildVoice, ChannelType.GuildAnnouncement, ChannelType.GuildForum].includes(c.type));
  const onProgress = options.onProgress ?? (() => {});
  let completed = 0;
  await onProgress({ completed, total: channels.size, current: 'Preparando eliminación' });
  for (const channel of channels.values()) {
    try {
      await channel.delete('Endral Studio eliminación de canales');
      result.deleted += 1;
    } catch (error) {
      result.errors.push(`Canal ${channel.name}: ${error.message}`);
    }
    completed += 1;
    await onProgress({ completed, total: channels.size, current: `Canal: ${channel.name}` });
  }
  return result;
}

export async function countRoles(guild, botId) {
  const botMember = await guild.members.fetch(botId).catch(() => null);
  return guild.roles.cache.filter(role => canDeleteRole(role, guild, botId, botMember)).size;
}

export async function deleteRoles(guild, botId, options = {}) {
  const result = { deleted: 0, errors: [] };
  const botMember = await guild.members.fetch(botId).catch(() => null);
  const roles = guild.roles.cache.filter(role => canDeleteRole(role, guild, botId, botMember));
  const onProgress = options.onProgress ?? (() => {});
  let completed = 0;
  await onProgress({ completed, total: roles.size, current: 'Preparando eliminación' });
  for (const role of roles.values()) {
    try {
      await role.delete('Endral Studio eliminación de roles');
      result.deleted += 1;
    } catch (error) {
      result.errors.push(`Rol ${role.name}: ${error.message}`);
    }
    completed += 1;
    await onProgress({ completed, total: roles.size, current: `Rol: ${role.name}` });
  }
  return result;
}

function canDeleteRole(role, guild, botId, botMember) {
  if (!role || role.managed) return false;
  if (role.id === guild.roles.everyone.id) return false;
  if (!botId) return false;
  if (!botMember) return false;
  if (role.position >= botMember.roles.highest.position) return false;
  return true;
}
