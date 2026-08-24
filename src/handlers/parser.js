import { isValidHexColor } from '../utils/colors.js';

const roleLineRegex = /^@\s*([^#\n]+?)(?:\s*#([0-9A-Fa-f]{6}))?\s*$/;

export function parseStructure(text) {
  const lines = text.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);
  const items = [];
  let currentCategory = null;

  for (const line of lines) {
    if (line.startsWith('- ')) {
      currentCategory = line.slice(2).trim();
      if (currentCategory.length === 0) continue;
      items.push({ type: 'category', name: currentCategory, children: [] });
      continue;
    }

    if (line.startsWith('+ ')) {
      items.push({ type: 'text', name: line.slice(2).trim(), parent: currentCategory });
      continue;
    }

    if (line.startsWith('> ')) {
      items.push({ type: 'voice', name: line.slice(2).trim(), parent: currentCategory });
      continue;
    }

    if (line.startsWith('# ')) {
      items.push({ type: 'announcement', name: line.slice(2).trim(), parent: currentCategory });
      continue;
    }

    if (line.startsWith('! ')) {
      items.push({ type: 'forum', name: line.slice(2).trim(), parent: currentCategory });
      continue;
    }

    if (line.startsWith('^ ')) {
      items.push({ type: 'stage', name: line.slice(2).trim(), parent: currentCategory });
      continue;
    }

    if (line.startsWith('% ')) {
      items.push({ type: 'media', name: line.slice(2).trim(), parent: currentCategory });
      continue;
    }

    if (line.startsWith('@ ')) {
      const match = line.match(roleLineRegex);
      if (!match) {
        throw new Error(`Formato de rol inválido: ${line}`);
      }

      const name = match[1].trim();
      const colorInput = match[2];
      const color = colorInput ? `#${colorInput.toUpperCase()}` : undefined;

      if (color && !isValidHexColor(color)) {
        throw new Error(`Color inválido para el rol: ${color}`);
      }

      items.push({ type: 'role', name, color });
      continue;
    }

    throw new Error(`Línea no reconocida: ${line}`);
  }

  return items;
}

export function buildPreview(items) {
  const lines = ['📋 PREVISUALIZACIÓN', ''];
  const roles = [];
  let currentCategory = null;
  const grouped = [];

  for (const item of items) {
    if (item.type === 'category') {
      currentCategory = { name: item.name, children: [] };
      grouped.push(currentCategory);
      continue;
    }

    if (item.type === 'role') {
      roles.push(item);
      continue;
    }

    const entry = { type: item.type, name: item.name };
    if (currentCategory) {
      currentCategory.children.push(entry);
    } else {
      grouped.push({ name: null, children: [entry] });
    }
  }

  for (const group of grouped) {
    if (group.name) {
      lines.push(`📁 ${group.name}`);
    }
    group.children.forEach((child, index) => {
      const prefix = index === group.children.length - 1 ? ' └─' : ' ├─';
      lines.push(`${prefix} ${previewIcon(child.type)} ${child.name}`);
    });
    lines.push('');
  }

  if (roles.length) {
    lines.push('🛡️ ROLES');
    roles.forEach((role, index) => {
      const prefix = index === roles.length - 1 ? ' └─' : ' ├─';
      lines.push(`${prefix} ${colorEmoji(role.color)} ${role.name}`);
    });
  }

  return lines.filter(Boolean).join('\n');
}

function previewIcon(type) {
  switch (type) {
    case 'text': return '💬';
    case 'voice': return '🔊';
    case 'announcement': return '📢';
    case 'forum': return '🗣️';
    case 'stage': return '🎙️';
    case 'media': return '🖼️';
    default: return '❓';
  }
}

function colorEmoji(color) {
  const lower = color?.toLowerCase();
  if (lower === '#ff0000') return '🔴';
  if (lower === '#00ff00') return '🟢';
  if (lower === '#0000ff') return '🔵';
  if (lower === '#ffffff') return '⚪';
  if (lower === '#000000') return '⚫';
  if (lower === '#7289da') return '🟣';
  return '🛡️';
}
