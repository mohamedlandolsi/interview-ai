import React from 'react';

interface ErrorLogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  source: string;
  message: string;
  details?: any;
  stack?: string;
  userAgent?: string;
  url?: string;
}

class ErrorLogger {
  private logs: ErrorLogEntry[] = [];
  private maxLogs = 100;

  private createLogEntry(
    level: ErrorLogEntry['level'],
    source: string,
    message: string,
    details?: any,
    error?: Error
  ): ErrorLogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      source,
      message,
      details,
      stack: error?.stack,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
    };
  }

  private addLog(entry: ErrorLogEntry) {
    this.logs.push(entry);
    
    // Keep only the latest logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Also log to console for immediate visibility
    const consoleMethod = console[entry.level] || console.log;
    consoleMethod(`[${entry.source}] ${entry.message}`, entry.details || '');
  }

  info(source: string, message: string, details?: any) {
    this.addLog(this.createLogEntry('info', source, message, details));
  }

  warn(source: string, message: string, details?: any) {
    this.addLog(this.createLogEntry('warn', source, message, details));
  }

  error(source: string, message: string, details?: any, error?: Error) {
    this.addLog(this.createLogEntry('error', source, message, details, error));
  }

  debug(source: string, message: string, details?: any) {
    this.addLog(this.createLogEntry('debug', source, message, details));
  }

  // Method to export logs for debugging
  exportLogs(): ErrorLogEntry[] {
    return [...this.logs];
  }

  // Method to clear logs
  clearLogs() {
    this.logs = [];
  }

  // Method to get recent errors
  getRecentErrors(count: number = 10): ErrorLogEntry[] {
    return this.logs
      .filter(log => log.level === 'error')
      .slice(-count);
  }

  // Method to send logs to external service (placeholder)
  async sendToErrorService(logs?: ErrorLogEntry[]) {
    const logsToSend = logs || this.getRecentErrors();
    
    try {
      // This would be where you send to an error tracking service
      // For now, just log that we would send
      console.log('Would send to error service:', {
        count: logsToSend.length,
        logs: logsToSend
      });
      
      // Example: send to your error tracking API
      // await fetch('/api/error-tracking', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ logs: logsToSend })
      // });
      
    } catch (error) {
      console.error('Failed to send logs to error service:', error);
    }
  }
}

// Create a singleton instance
export const errorLogger = new ErrorLogger();

export default ErrorLogger;
