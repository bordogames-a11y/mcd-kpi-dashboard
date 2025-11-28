export function generateDeviceFingerprint(): string {
  const ua = navigator.userAgent;
  const screen_width = window.screen.width;
  const screen_height = window.screen.height;
  const lang = navigator.language;
  
  const fingerprint = `${ua}-${screen_width}x${screen_height}-${lang}`;
  
  // Simple hash
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  return Math.abs(hash).toString(16);
}

export function getDeviceName(): string {
  const ua = navigator.userAgent;
  if (ua.indexOf("Windows") > -1) return "Windows Device";
  if (ua.indexOf("Mac") > -1) return "Mac Device";
  if (ua.indexOf("iPhone") > -1) return "iPhone";
  if (ua.indexOf("iPad") > -1) return "iPad";
  if (ua.indexOf("Android") > -1) return "Android Device";
  if (ua.indexOf("Linux") > -1) return "Linux Device";
  return "Unknown Device";
}
