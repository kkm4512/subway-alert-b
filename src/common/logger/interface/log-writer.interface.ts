/**
 * 로그 작성기 인터페이스
 *
 * 모든 로그 writer는 이 인터페이스를 구현해야 합니다.
 * 새로운 writer(DB, 외부 서비스 등)를 추가할 때 기존 코드를 수정하지 않고
 * 이 인터페이스만 구현하면 됩니다. (Open/Closed Principle)
 */
export interface ILogWriter {
  /**
   * 로그 메시지를 작성합니다.
   * @param level - 로그 레벨 ('info' | 'warn' | 'error')
   * @param message - 로그 메시지
   * @param context - 로그 발생 위치 또는 컨텍스트 (선택)
   */
  write(level: LogLevel, message: string, context?: string): void;
}

/** 로그 레벨 타입 */
export type LogLevel = 'info' | 'warn' | 'error';
