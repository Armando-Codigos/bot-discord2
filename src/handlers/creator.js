import { ChannelType } from 'discord.js';

export async function createStructure(guild, items, options = {}) {
  const categories = new Map();
  const report = { created: 0, errors: [] };
  const onProgress = options.onProgress ?? (() => {});
  const total = items.length;

  await onProgress({ completed: 0, total, current: 'Preparando creación' });

  for (const [index, item] of items.entries()) {
    try {
      switch (item.type) {
        case 'category': {
          const channel = await guild.channels.create({
            name: item.name,
            type: ChannelType.GuildCategory
          });
          categories.set(item.name, channel);
          report.created += 1;
          break;
        }
        case 'text': {
          const parent = item.parent ? categories.get(item.parent) : null;
          await guild.channels.create({
            name: item.name,
            type: ChannelType.GuildText,
            parent: parent ?? undefined
          });
          report.created += 1;
          break;
        }
        case 'voice': {
          const parent = item.parent ? categories.get(item.parent) : null;
          await guild.channels.create({
            name: item.name,
            type: ChannelType.GuildVoice,
            parent: parent ?? undefined
          });
          report.created += 1;
          break;
        }
        case 'announcement': {
          const parent = item.parent ? categories.get(item.parent) : null;
          await guild.channels.create({
            name: item.name,
            type: ChannelType.GuildAnnouncement,
            parent: parent ?? undefined
          });
          report.created += 1;
          break;
        }
        case 'forum': {
          const parent = item.parent ? categories.get(item.parent) : null;
          await guild.channels.create({
            name: item.name,
            type: ChannelType.GuildForum,
            parent: parent ?? undefined
          });
          report.created += 1;
          break;
        }
        case 'stage': {
          const parent = item.parent ? categories.get(item.parent) : null;
          await guild.channels.create({
            name: item.name,
            type: ChannelType.GuildStageVoice,
            parent: parent ?? undefined
          });
          report.created += 1;
          break;
        }
        case 'media': {
          const parent = item.parent ? categories.get(item.parent) : null;
          await guild.channels.create({
            name: item.name,
            type: ChannelType.GuildMedia,
            parent: parent ?? undefined
          });
          report.created += 1;
          break;
        }
        case 'role': {
          const roleData = { name: item.name, reason: 'Endral Studio creación de rol' };
          if (item.color) {
            roleData.color = item.color;
          }

          await guild.roles.create(roleData);
          report.created += 1;
          break;
        }
        default:
          break;
      }
        await onProgress({ completed: index + 1, total, current: `${item.type}: ${item.name}` });
    } catch (error) {
      report.errors.push(`${item.type} ${item.name}: ${error.message}`);
        await onProgress({ completed: index + 1, total, current: `${item.type}: ${item.name}`, error: error.message });
    }
  }

  return report;
}
