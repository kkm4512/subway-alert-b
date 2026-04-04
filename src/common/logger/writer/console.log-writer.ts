import { Injectable } from '@nestjs/common';
import { ILogWriter, LogLevel } from '../interface/log-writer.interface';

/**
 * 콘솔 로그 writer
 *
 * console.log / console.warn / console.error로 로그를 출력합니다.
 */
@Injectable()
export class ConsoleLogWriter implements ILogWriter {
  /**
   * 로그 레벨에 따라 콘솔에 메시지를 출력합니다.
   * @param level - 로그 레벨
   * @param message - 로그 메시지
   * @param context - 로그 발생 위치
   */
  write(level: LogLevel, message: string, context?: string): void {
    const formatted = this.format(level, message, context);

    if (level === 'error') {
      console.error(formatted);
    } else if (level === 'warn') {
      console.warn(formatted);
    } else {
      console.log(formatted);
    }
  }

  /**
   * 로그 메시지를 포맷합니다.
   * @param level - 로그 레벨
   * @param message - 로그 메시지
   * @param context - 로그 발생 위치
   */
  private format(level: LogLevel, message: string, context?: string): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` [${context}]` : '';
    return `[${timestamp}] [${level.toUpperCase()}]${contextStr} ${message}`;
  }
}
