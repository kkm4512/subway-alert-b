import { Injectable } from '@nestjs/common';
import sql from 'mssql';
import { MssqlConnectionManager } from '../config/mssql-connection.manager';

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
    private readonly connectionManager: MssqlConnectionManager,
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
    const pool = await this.connectionManager.getPool();
    const result = await pool
      .request()
      .input('statnNm', sql.NVarChar(100), statnNm)
      .input('lineNm', sql.NVarChar(100), lineNm)
      .query(`
        SELECT TOP (1000)
          STATN_ID AS statnId,
          SUBWAY_ID AS subwayId,
          STATN_NM AS statnNm,
          LINE_NM AS lineNm
        FROM [SubwayDB].[dbo].[SUBWAY_STATION]
        WHERE STATN_NM = @statnNm
          AND LINE_NM = @lineNm
      `);

    if (result.recordset.length === 0) {
      return null;
    }

    return result.recordset[0] as SubwayStationRecord;
  }
}
