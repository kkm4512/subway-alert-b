/**
 * API 응답 코드 및 메시지 상수
 *
 * code: HTTP 상태 코드
 * message: 응답 메시지
 */
export enum ResponseCode {
  SUCCESS = 'SUCCESS',
  CREATED = 'CREATED',
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
}

/**
 * 서비스 전반에서 재사용하는 메시지 상수
 */
export enum AppMessage {
  SUCCESS = 'SUCCESS',
  CREATED = 'CREATED',
  BAD_REQUEST = 'BAD REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  DATA_NOT_FOUND = '데이터를 찾을 수 없습니다!',
  INTERNAL_SERVER_ERROR = 'INTERNAL SERVER ERROR',
}

/** 응답 코드 상세 정보 타입 */
export class ResponseCodeDetail {
  constructor(
    readonly code: number,
    readonly status: string,
    readonly message: string,
  ) {}
}

/**
 * ResponseCode enum에 대한 code/message 조회 클래스
 */
export class ResponseCodeMapper {
  private static readonly MAP: Record<ResponseCode, ResponseCodeDetail> = {
    [ResponseCode.SUCCESS]: new ResponseCodeDetail(200, 'SUCCESS', AppMessage.SUCCESS),
    [ResponseCode.CREATED]: new ResponseCodeDetail(201, 'CREATED', AppMessage.CREATED),
    [ResponseCode.BAD_REQUEST]: new ResponseCodeDetail(400, 'BAD_REQUEST', AppMessage.BAD_REQUEST),
    [ResponseCode.UNAUTHORIZED]: new ResponseCodeDetail(401, 'UNAUTHORIZED', AppMessage.UNAUTHORIZED),
    [ResponseCode.FORBIDDEN]: new ResponseCodeDetail(403, 'FORBIDDEN', AppMessage.FORBIDDEN),
    [ResponseCode.NOT_FOUND]: new ResponseCodeDetail(404, 'NOT_FOUND', AppMessage.DATA_NOT_FOUND),
    [ResponseCode.INTERNAL_SERVER_ERROR]: new ResponseCodeDetail(500, 'INTERNAL_SERVER_ERROR', AppMessage.INTERNAL_SERVER_ERROR),
  };

  static get(responseCode: ResponseCode): ResponseCodeDetail {
    return this.MAP[responseCode];
  }
}
