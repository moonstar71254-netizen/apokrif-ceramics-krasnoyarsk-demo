export function getSiteConfig() {
  return window.SITE_CONFIG || {};
}

export function buildWaUrl(baseUrl, message) {
  const cleanBase = baseUrl || 'https://wa.me/79131080835';
  if (!message) return cleanBase;
  const separator = cleanBase.includes('?') ? '&' : '?';
  return `${cleanBase}${separator}text=${encodeURIComponent(message)}`;
}
