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
}
