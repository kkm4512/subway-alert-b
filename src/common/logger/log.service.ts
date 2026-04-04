import { Injectable } from '@nestjs/common';
import { ILogWriter, LogLevel } from './interface/log-writer.interface';
import { ConsoleLogWriter } from './writer/console.log-writer';
import { FileLogWriter } from './writer/file.log-writer';

/**
 * 공통 로그 서비스
 *
 * 등록된 모든 ILogWriter에 로그를 위임합니다.
 * 새로운 writer(DB 등)를 추가할 때 이 서비스를 수정하지 않고
 * writer만 추가하면 됩니다. (Open/Closed Principle)
 */
@Injectable()
export class LogService {
  /** 등록된 로그 writer 목록 */
  private readonly writers: ILogWriter[];

  constructor(
    private readonly consoleWriter: ConsoleLogWriter,
    private readonly fileWriter: FileLogWriter,
  ) {
    this.writers = [this.consoleWriter, this.fileWriter];
  }

  /**
   * INFO 레벨 로그를 기록합니다.
   * @param message - 로그 메시지
   * @param context - 로그 발생 위치 (예: 클래스명)
   */
  info(message: string, context?: string): void {
    this.log('info', message, context);
  }

  /**
   * WARN 레벨 로그를 기록합니다.
   * @param message - 로그 메시지
   * @param context - 로그 발생 위치
   */
  warn(message: string, context?: string): void {
    this.log('warn', message, context);
  }

  /**
   * ERROR 레벨 로그를 기록합니다.
   * @param message - 로그 메시지
   * @param context - 로그 발생 위치
   */
  error(message: string, context?: string): void {
    this.log('error', message, context);
  }

  /**
   * 등록된 모든 writer에 로그를 위임합니다.
   * @param level - 로그 레벨
   * @param message - 로그 메시지
   * @param context - 로그 발생 위치
   */
  private log(level: LogLevel, message: string, context?: string): void {
    this.writers.forEach((writer) => writer.write(level, message, context));
  }
}
