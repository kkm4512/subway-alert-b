import { Injectable } from '@nestjs/common';
import { SqliteConnectionManager } from '../config/sqlite-connection.manager';

/** SUBWAY_STATION 조회 결과 타입 */
export interface SubwayStationRecord {
  readonly statnId: number;
  readonly subwayId: number;
  readonly statnNm: string;
  readonly lineNm: string;
}

/**
 * SUBWAY_STATION 테이블 접근 전용 Repository
 *
 * 역/호선의 노선 ID 조회 쿼리를 담당합니다.
 */
@Injectable()
export class SubwayStationRepository {
  constructor(
    private readonly connectionManager: SqliteConnectionManager,
  ) {}

  /**
   * 역명/호선명으로 SUBWAY_STATION 데이터를 조회합니다.
   * @param statnNm - 역명
   * @param lineNm - 호선명
   * @returns 조회 결과 또는 null
   */
  async readByStationNameAndLine(
    statnNm: string,
    lineNm: string,
  ): Promise<SubwayStationRecord | null> {
    const db = this.connectionManager.getDb();
    
    const query = `
      SELECT
        STATN_ID AS statnId,
        SUBWAY_ID AS subwayId,
        STATN_NM AS statnNm,
        LINE_NM AS lineNm
      FROM SUBWAY_STATION
      WHERE STATN_NM = '${this.escapeString(statnNm)}' AND LINE_NM = '${this.escapeString(lineNm)}'
      LIMIT 1
    `;

    const results = db.exec(query);
    if (!results || results.length === 0 || !results[0].values || results[0].values.length === 0) {
      return null;
    }

    const [statnId, subwayId, recordStatnNm, recordLineNm] = results[0].values[0];
    return {
      statnId: Number(statnId),
      subwayId: Number(subwayId),
      statnNm: String(recordStatnNm),
      lineNm: String(recordLineNm),
    };
  }

  /**
   * SQL 문자열 특수문자 이스케이프
   */
  private escapeString(str: string): string {
    return str.replace(/'/g, "''");
  }
}
