import { Injectable } from '@nestjs/common';
import { SqliteConnectionManager } from '../config/sqlite-connection.manager';
import {
  extractHangulInitials,
  escapeLikePattern,
  isCompatibilityJamoQuery,
} from '../common/util/hangul.util';

/** SUBWAY_STATION_EXT 조회 결과 타입 */
export interface SubwayStationExtRecord {
  readonly statnCd: string;
  readonly statnNm: string;
  readonly lineNm: string;
  readonly extCd: string;
}

/**
 * SUBWAY_STATION_EXT 테이블 접근 전용 Repository
 *
 * 역/호선 기본 정보 조회 쿼리를 담당합니다.
 */
@Injectable()
export class SubwayStationExtRepository {
  constructor(
    private readonly connectionManager: SqliteConnectionManager,
  ) {}

  /**
   * 역코드로 SUBWAY_STATION_EXT 데이터를 조회합니다.
   * @param statnCd - 역코드
   * @returns 조회 결과 또는 null
   */
  async readByStationCode(statnCd: string): Promise<SubwayStationExtRecord | null> {
    const db = this.connectionManager.getDb();

    // LINE_NM_MAP을 LEFT JOIN해 호선명 불일치를 자동 보정합니다.
    // 매핑이 있으면 STATION 기준 호선명으로, 없으면 원본 호선명을 그대로 반환합니다.
    const query = `
      SELECT
        e.STATN_CD AS statnCd,
        e.STATN_NM AS statnNm,
        COALESCE(m.STATION_LINE_NM, e.LINE_NM) AS lineNm,
        e.EXT_CD AS extCd
      FROM SUBWAY_STATION_EXT e
      LEFT JOIN LINE_NM_MAP m ON m.EXT_LINE_NM = e.LINE_NM
      WHERE e.STATN_CD = '${this.escapeString(statnCd)}'
      LIMIT 1
    `;

    const results = db.exec(query);
    if (!results || results.length === 0 || !results[0].values || results[0].values.length === 0) {
      return null;
    }

    const [recordStatnCd, recordStatnNm, recordLineNm, recordExtCd] = results[0].values[0];
    return {
      statnCd: String(recordStatnCd),
      statnNm: String(recordStatnNm),
      lineNm: String(recordLineNm),
      extCd: String(recordExtCd),
    };
  }

  /**
   * 역명으로 SUBWAY_STATION_EXT 데이터를 조회합니다.
   * @param name - 조회할 역명
   * @returns 조회 결과 목록 (없으면 빈 배열)
   */
  async readByStationName(name: string): Promise<SubwayStationExtRecord[]> {
    const db = this.connectionManager.getDb();
    const trimmedName = name.trim();
    if (!trimmedName) {
      return [];
    }

    const escapedLikeName = escapeLikePattern(trimmedName);
    const escapedExactName = this.escapeString(trimmedName);

    if (isCompatibilityJamoQuery(trimmedName)) {
      const query = `
        SELECT
          STATN_CD AS statnCd,
          STATN_NM AS statnNm,
          LINE_NM AS lineNm,
          EXT_CD AS extCd
        FROM SUBWAY_STATION_SEARCH
        WHERE INITIALS LIKE '%${escapedLikeName}%' ESCAPE '\\'
        ORDER BY STATN_NM
        LIMIT 1000
      `;
      return this.mapResults(db.exec(query));
    }

    const query = `
      SELECT
        STATN_CD AS statnCd,
        STATN_NM AS statnNm,
        LINE_NM AS lineNm,
        EXT_CD AS extCd,
        CASE WHEN STATN_NM = '${escapedExactName}' THEN 0 ELSE 1 END AS rank_order
      FROM SUBWAY_STATION_SEARCH
      WHERE STATN_NM LIKE '%${escapedLikeName}%' ESCAPE '\\'
      ORDER BY rank_order, STATN_NM
      LIMIT 1000
    `;

    return this.mapResults(db.exec(query));
  }

  private mapResults(results: any[]): SubwayStationExtRecord[] {
    if (!results || results.length === 0 || !results[0].values) {
      return [];
    }

    return results[0].values.map((row) => ({
      statnCd: String(row[0]),
      statnNm: String(row[1]),
      lineNm: String(row[2]),
      extCd: String(row[3]),
    }));
  }

  /**
   * SQL 문자열 특수문자 이스케이프
   */
  private escapeString(str: string): string {
    return str.replace(/'/g, "''");
  }
}
