import { ResponseCode } from '../constant/response-code.constant';

/**
 * 공통 API 응답 모델
 *
 * 모든 API 엔드포인트는 이 형식을 통해 응답을 반환합니다.
 * - code: HTTP 상태 코드
 * - message: 응답 메시지
 * - items: 실제 응답 데이터 (단일 객체 또는 배열)
 */
export class ResponseModel<T = null> {
  /** HTTP 상태 코드 */
  readonly code: number;

  /** 응답 메시지 */
  readonly message: string;

  /** 응답 데이터 */
  readonly items: T;

  private constructor(responseCode: ResponseCode, items: T) {
    this.code = responseCode.code;
    this.message = responseCode.message;
    this.items = items;
  }

  /**
   * 응답 모델을 생성합니다.
   * @param responseCode - 응답 코드 (예: CODE.SUCCESS, CODE.NOT_FOUND)
   * @param items - 응답 데이터 (기본값: null)
   */
  static of<T = null>(responseCode: ResponseCode, items: T = null as T): ResponseModel<T> {
    return new ResponseModel<T>(responseCode, items);
  }
}
