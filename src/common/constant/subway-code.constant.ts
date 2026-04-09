/**
 * 지하철 실시간 도착 코드 상수
 *
 * 서울 열린데이터 API의 코드값을 의미 있는 값으로 매핑합니다.
 */

/**
 * updnLine(상하행 문자열) → 방향 코드 매핑
 * - 상행/내선 → 1
 * - 하행/외선 → 2
 */
export const UPDN_LINE_CODE: Record<string, number> = {
  '상행': 1,
  '내선': 1,
  '하행': 2,
  '외선': 2,
} as const;

/**
 * arvlCd(도착 코드) → 도착 상태 문자열 매핑
 * 0:진입, 1:도착, 2:출발, 3:전역출발, 4:전역진입, 5:전역도착, 99:운행중
 */
export const ARVL_CD_LABEL: Record<string, string> = {
  '0': '진입',
  '1': '도착',
  '2': '출발',
  '3': '전역출발',
  '4': '전역진입',
  '5': '전역도착',
  '99': '운행중',
} as const;

/**
 * dayCd(요일 코드) → 요일 문자열 매핑
 * 1:평일, 2:토요일, 3:휴일/일요일
 */
export const DAY_CD_LABEL: Record<number, string> = {
  1: '평일',
  2: '토요일',
  3: '휴일/일요일',
} as const;
