function log(message: string, ...args: unknown[]) {
  const now = new Date().toISOString();
  console.log(`[TV] ${now} - ${message}`, ...args);
}

export function info(message: string, ...args: unknown[]) {
  const now = new Date().toISOString();
  console.info(`[TV] ${now} - ${message}`, ...args);
}

export function err(message: string, ...args: unknown[]) {
  const now = new Date().toISOString();
  console.error(`[TV] ${now} - ${message}`, ...args);
}

export function warn(message: string, ...args: unknown[]) {
  const now = new Date().toISOString();
  console.warn(`[TV] ${now} - ${message}`, ...args);
}
