const HANGUL_BASE = 0xac00;
const HANGUL_END = 0xd7a3;
const CHO_SUNG = [
  'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ',
  'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ',
];

/**
 * 한글 문자열에서 각 음절의 초성만 추출합니다.
 * 한글 음절이 아닌 문자는 그대로 유지합니다.
 * @param text 검색 대상 문자열
 */
export function extractHangulInitials(text: string): string {
  if (!text) {
    return '';
  }

  return Array.from(text)
    .map((char) => {
      const code = char.charCodeAt(0);
      if (code >= HANGUL_BASE && code <= HANGUL_END) {
        const syllableIndex = code - HANGUL_BASE;
        const choIndex = Math.floor(syllableIndex / 588);
        return CHO_SUNG[choIndex] ?? '';
      }
      return char;
    })
    .join('');
}

const COMPATIBILITY_JAMO_REGEX = /^[\u3131-\u314E\s]+$/;

/**
 * 사용자 입력값이 호환 자모(ㄱ-ㅎ)로만 이루어졌는지 확인합니다.
 * @param text 사용자 입력값
 */
export function isCompatibilityJamoQuery(text: string): boolean {
  return COMPATIBILITY_JAMO_REGEX.test(text.trim());
}

/**
 * LIKE 검색을 위해 입력값의 '%' '_' 문자와 따옴표를 이스케이프합니다.
 * @param value SQL LIKE 패턴으로 사용하는 문자열
 */
export function escapeLikePattern(value: string): string {
  return value
    .replace(/([%_\\])/g, '\\$1')
    .replace(/'/g, "''");
}
