import { Injectable } from '@nestjs/common';
import { SqliteConnectionManager } from '../config/sqlite-connection.manager';

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
    
    const query = `
      SELECT
        STATN_CD AS statnCd,
        STATN_NM AS statnNm,
        LINE_NM AS lineNm,
        EXT_CD AS extCd
      FROM SUBWAY_STATION_EXT
      WHERE STATN_CD = '${this.escapeString(statnCd)}'
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
    
    const query = `
      SELECT
        STATN_CD AS statnCd,
        STATN_NM AS statnNm,
        LINE_NM AS lineNm,
        EXT_CD AS extCd
      FROM SUBWAY_STATION_EXT
      WHERE STATN_NM = '${this.escapeString(name)}'
      LIMIT 1000
    `;

    const results = db.exec(query);
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
