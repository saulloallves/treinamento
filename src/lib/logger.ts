const isDev = import.meta.env.DEV;
const isProd = import.meta.env.PROD;

interface LoggerConfig {
  enableConsoleInDev?: boolean;
  enableProductionLogs?: boolean;
  sentryDsn?: string;
}

const config: LoggerConfig = {
  enableConsoleInDev: true,
  enableProductionLogs: false,
};

class Logger {
  private shouldLog(): boolean {
    return (isDev && config.enableConsoleInDev) || (isProd && config.enableProductionLogs);
  }

  private sanitizeData(data: any): any {
    if (typeof data !== 'object' || data === null) return data;

    const sensitiveKeys = ['password', 'token', 'secret', 'apiKey', 'api_key', 'authorization', 'cookie'];
    const sanitized = { ...data };

    Object.keys(sanitized).forEach(key => {
      const lowerKey = key.toLowerCase();
      if (sensitiveKeys.some(sensitive => lowerKey.includes(sensitive))) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
        sanitized[key] = this.sanitizeData(sanitized[key]);
      }
    });

    return sanitized;
  }

  info(...args: any[]): void {
    if (!this.shouldLog()) return;

    const sanitizedArgs = args.map(arg => this.sanitizeData(arg));
    console.info('[INFO]', new Date().toISOString(), ...sanitizedArgs);
  }

  warn(...args: any[]): void {
    if (!this.shouldLog()) return;

    const sanitizedArgs = args.map(arg => this.sanitizeData(arg));
    console.warn('[WARN]', new Date().toISOString(), ...sanitizedArgs);

    if (isProd) {
      this.sendToMonitoring('warning', sanitizedArgs);
    }
  }

  error(...args: any[]): void {
    if (!this.shouldLog()) return;

    const sanitizedArgs = args.map(arg => this.sanitizeData(arg));
    console.error('[ERROR]', new Date().toISOString(), ...sanitizedArgs);

    if (isProd) {
      this.sendToMonitoring('error', sanitizedArgs);
    }
  }

  debug(...args: any[]): void {
    if (!isDev) return;

    const sanitizedArgs = args.map(arg => this.sanitizeData(arg));
    console.debug('[DEBUG]', new Date().toISOString(), ...sanitizedArgs);
  }

  private sendToMonitoring(level: 'warning' | 'error', data: any[]): void {
    if (!config.sentryDsn) return;
  }
}

export const logger = new Logger();

export default logger;
