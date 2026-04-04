import { Injectable } from '@nestjs/common';
import { ILogWriter, LogLevel } from './interface/log-writer.interface';
import { ConsoleLogWriter } from './writer/console.log-writer';
import { FileLogWriter } from './writer/file.log-writer';
import { Profile } from '../constant/profile.constant';

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
    this.writers = this.resolveWritersByProfile();
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

  /**
   * PROFILE 환경변수에 따라 사용할 writer를 결정합니다.
   * - LOCAL: console
   * - DEV: console + file
   * - PRD: 전체 writer (현재 console + file)
   */
  private resolveWritersByProfile(): ILogWriter[] {
    const profile = this.resolveProfile(process.env.PROFILE);

    if (profile === Profile.LOCAL) {
      return [this.consoleWriter];
    }

    if (profile === Profile.DEV) {
      return [this.consoleWriter, this.fileWriter];
    }

    // PRD는 등록된 모든 writer를 사용합니다.
    return [this.consoleWriter, this.fileWriter];
  }

  /**
   * PROFILE 문자열을 Profile enum으로 변환합니다.
   * 값이 없거나 잘못된 경우 LOCAL을 기본값으로 사용합니다.
   */
  private resolveProfile(value?: string): Profile {
    const normalized = (value ?? Profile.LOCAL).toUpperCase();

    if (normalized === Profile.LOCAL) {
      return Profile.LOCAL;
    }

    if (normalized === Profile.DEV) {
      return Profile.DEV;
    }

    if (normalized === Profile.PRD) {
      return Profile.PRD;
    }

    return Profile.LOCAL;
  }
}
