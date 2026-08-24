export function isValidHexColor(value) {
  return /^#[0-9A-Fa-f]{6}$/.test(value);
}
