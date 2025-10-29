export class Logger {
  private context: string;
  private isDevelopment: boolean;

  constructor(context: string) {
    this.context = context;
    this.isDevelopment = process.env.NODE_ENV !== 'production';
  }

  info(message: string, ...args: any[]): void {
    if (this.isDevelopment) {
      console.log(`[${this.context}] INFO:`, message, ...args);
    }
  }

  error(message: string, error?: any): void {
    if (this.isDevelopment) {
      console.error(`[${this.context}] ERROR:`, message, error);
    }
  }

  warn(message: string, ...args: any[]): void {
    if (this.isDevelopment) {
      console.warn(`[${this.context}] WARN:`, message, ...args);
    }
  }

  debug(message: string, ...args: any[]): void {
    if (this.isDevelopment) {
      console.debug(`[${this.context}] DEBUG:`, message, ...args);
    }
  }
}

