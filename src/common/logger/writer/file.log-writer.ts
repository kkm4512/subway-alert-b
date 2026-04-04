import { Injectable } from '@nestjs/common';
import { appendFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { ILogWriter, LogLevel } from '../interface/log-writer.interface';

/**
 * 파일 로그 writer
 *
 * 날짜별로 logs/{YYYY-MM-DD}.log 파일에 로그를 기록합니다.
 * 파일이 없으면 자동으로 생성하고, logs 폴더도 없으면 생성합니다.
 */
@Injectable()
export class FileLogWriter implements ILogWriter {
  /** 로그 파일 저장 경로 */
  private readonly logDir = join(process.cwd(), 'logs');

  /**
   * 로그 메시지를 날짜별 파일에 기록합니다.
   * @param level - 로그 레벨
   * @param message - 로그 메시지
   * @param context - 로그 발생 위치
   */
  write(level: LogLevel, message: string, context?: string): void {
    const formatted = this.format(level, message, context);
    const filePath = this.resolveFilePath();

    this.ensureLogDir();
    appendFileSync(filePath, formatted + '\n', 'utf-8');
  }

  /**
   * 로그 디렉토리가 없으면 생성합니다.
   */
  private ensureLogDir(): void {
    if (!existsSync(this.logDir)) {
      mkdirSync(this.logDir, { recursive: true });
    }
  }

  /**
   * 오늘 날짜 기준 로그 파일 경로를 반환합니다.
   */
  private resolveFilePath(): string {
    const date = new Date().toISOString().slice(0, 10);
    return join(this.logDir, `${date}.log`);
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
