type LogLevel = 'info' | 'warn' | 'error';

function write(level: LogLevel, message: string, meta?: unknown): void {
  if (import.meta.env.PROD && level === 'info') return;
  const payload = meta ? { message, meta } : { message };
  if (level === 'error') {
    console.error(payload);
  } else if (level === 'warn') {
    console.warn(payload);
  } else {
    console.info(payload);
  }
}

export const logger = {
  info: (message: string, meta?: unknown) => write('info', message, meta),
  warn: (message: string, meta?: unknown) => write('warn', message, meta),
  error: (message: string, meta?: unknown) => write('error', message, meta),
};
