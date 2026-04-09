import { Injectable } from '@nestjs/common';

/**
 * 지하철 요청값 검증 클래스
 *
 * 컨트롤러에서 입력값 검증 책임을 분리하기 위해 사용합니다.
 */
@Injectable()
export class SubwayValidator {
  /** 한글(및 공백)만 허용하는 정규식 */
  private static readonly KOREAN_ONLY_REGEX = /^[가-힣\s]+$/;
  /** 한글/숫자(및 공백) 허용 정규식 */
  private static readonly KOREAN_NUMBER_REGEX = /^[0-9가-힣\s]+$/;
  /** 역코드(4자리 숫자) 정규식 */
  private static readonly SUBWAY_CODE_REGEX = /^\d{4}$/;

  /**
   * 지하철명 유효성을 검증합니다.
   * - 공백만 있는 값은 유효하지 않습니다.
   * - 한글(가-힣)과 공백만 허용합니다.
   * @param name - 사용자 입력 지하철명
   * @returns 유효하면 true, 유효하지 않으면 false
   */
  validateSubwayName(name?: string): boolean {
    const subwayName = name?.trim();
    if (!subwayName) {
      return false;
    }

    return SubwayValidator.KOREAN_ONLY_REGEX.test(subwayName);
  }

  /**
   * 호선명 유효성을 검증합니다.
   * - 공백만 있는 값은 유효하지 않습니다.
   * - 한글/숫자(가-힣, 0-9)와 공백만 허용합니다.
   * @param lineNm - 사용자 입력 호선명
   * @returns 유효하면 true, 유효하지 않으면 false
   */
  validateLineName(lineNm?: string): boolean {
    const lineName = lineNm?.trim();
    if (!lineName) {
      return false;
    }

    return SubwayValidator.KOREAN_NUMBER_REGEX.test(lineName);
  }

  /**
   * 지하철 역코드 유효성을 검증합니다.
   * - 공백만 있는 값은 유효하지 않습니다.
   * - 정확히 4자리 숫자 문자열만 허용합니다. (예: 0002, 0200, 1234)
   * @param statnCd - 사용자 입력 역코드
   * @returns 유효하면 true, 유효하지 않으면 false
   */
  validateSubwayCode(statnCd?: string): boolean {
    const stationCode = statnCd?.trim();
    if (!stationCode) {
      return false;
    }

    return SubwayValidator.SUBWAY_CODE_REGEX.test(stationCode);
  }

  /**
   * 상하행 코드 유효성을 검증합니다.
   * - 1(상행/내선) 또는 2(하행/외선)만 허용합니다.
   * @param updnLine - 사용자 입력 상하행 코드
   * @returns 유효하면 true, 유효하지 않으면 false
   */
  validateUpdnLine(updnLine?: string): boolean {
    return updnLine === '1' || updnLine === '2';
  }
}
