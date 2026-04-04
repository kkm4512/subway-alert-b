/**
 * API 응답 코드 및 메시지 상수
 *
 * code: HTTP 상태 코드
 * message: 응답 메시지
 */
export const CODE = {
  SUCCESS: { code: 200, message: 'success' },
  CREATED: { code: 201, message: 'created' },
  BAD_REQUEST: { code: 400, message: 'bad request' },
  UNAUTHORIZED: { code: 401, message: 'unauthorized' },
  FORBIDDEN: { code: 403, message: 'forbidden' },
  NOT_FOUND: { code: 404, message: 'not found' },
  INTERNAL_SERVER_ERROR: { code: 500, message: 'internal server error' },
} as const;

/** CODE 값의 타입 */
export type ResponseCode = (typeof CODE)[keyof typeof CODE];
