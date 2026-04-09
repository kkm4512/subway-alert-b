import { Injectable } from '@nestjs/common';

/** 지원하는 HTTP 메서드 타입 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * 공통 REST API 요청 파라미터
 */
export interface RestApiRequestOptions {
  /** 호출 대상 URL (쿼리스트링 제외 원본 URL) */
  readonly url: string;
  /** HTTP 메서드 */
  readonly method: HttpMethod;
  /** 요청 헤더 */
  readonly headers?: Record<string, string>;
  /** URL 쿼리 파라미터 */
  readonly queryParams?: Record<string, string | number | boolean | null | undefined>;
  /** 요청 바디(JSON 직렬화 대상) */
  readonly body?: unknown;
  /** 요청 타임아웃(ms), 기본값 5000 */
  readonly timeoutMs?: number;
}

/**
 * 공통 REST API 응답 타입
 */
export interface RestApiResponse<T> {
  /** HTTP 상태 코드 */
  readonly status: number;
  /** 응답 헤더 */
  readonly headers: Record<string, string>;
  /** 파싱된 응답 데이터(JSON 가능 시 JSON, 아니면 raw 문자열) */
  readonly data: T | string;
}

/**
 * 외부 REST API 호출 공통 서비스
 *
 * url, method, header 등 요청 옵션을 받아 표준화된 방식으로 외부 API를 호출합니다.
 */
@Injectable()
export class RestApiService {
  private static readonly DEFAULT_TIMEOUT_MS = 5000;

  /**
   * 외부 REST API를 호출합니다.
   * @param options - 요청 옵션(url, method, headers, body 등)
   * @returns 상태코드/헤더/응답데이터
   */
  async request<T>(options: RestApiRequestOptions): Promise<RestApiResponse<T>> {
    const timeoutMs = options.timeoutMs ?? RestApiService.DEFAULT_TIMEOUT_MS;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const url = this.buildUrl(options.url, options.queryParams);
      const headers = options.headers ?? {};
      const hasBody = options.body !== undefined;
      const normalizedHeaders = this.normalizeHeaders(headers, hasBody);

      const response = await fetch(url, {
        method: options.method,
        headers: normalizedHeaders,
        body: hasBody ? JSON.stringify(options.body) : undefined,
        signal: controller.signal,
      });

      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      const rawText = await response.text();
      const parsedData = this.parseResponse<T>(rawText, response.headers.get('content-type'));

      if (!response.ok) {
        throw new Error(
          `REST API 호출 실패: ${response.status} ${response.statusText} (url: ${url})`,
        );
      }

      return {
        status: response.status,
        headers: responseHeaders,
        data: parsedData,
      };
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`REST API 호출 타임아웃 (${timeoutMs}ms): ${options.url}`);
      }

      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /** 쿼리 파라미터를 포함한 최종 URL을 생성합니다. */
  private buildUrl(
    baseUrl: string,
    queryParams?: Record<string, string | number | boolean | null | undefined>,
  ): string {
    if (!queryParams) {
      return baseUrl;
    }

    const searchParams = new URLSearchParams();
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value === undefined || value === null) {
        return;
      }

      searchParams.append(key, String(value));
    });

    const query = searchParams.toString();
    if (!query) {
      return baseUrl;
    }

    return `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}${query}`;
  }

  /** body가 존재할 때 Content-Type이 없으면 JSON 타입을 기본 설정합니다. */
  private normalizeHeaders(headers: Record<string, string>, hasBody: boolean): Record<string, string> {
    const hasContentTypeHeader = Object.keys(headers).some(
      (key) => key.toLowerCase() === 'content-type',
    );

    if (!hasBody || hasContentTypeHeader) {
      return headers;
    }

    return {
      ...headers,
      'Content-Type': 'application/json',
    };
  }

  /** 응답 Content-Type에 따라 JSON 파싱 또는 문자열 반환을 수행합니다. */
  private parseResponse<T>(rawText: string, contentType: string | null): T | string {
    if (!rawText) {
      return '';
    }

    const isJson = (contentType ?? '').toLowerCase().includes('application/json');
    if (!isJson) {
      return rawText;
    }

    return JSON.parse(rawText) as T;
  }
}
