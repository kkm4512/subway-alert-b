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
 * 지하철 DB 접근 전용 Repository
 *
 * 실제 DB CRUD 쿼리 처리를 담당합니다.
 */
@Injectable()
export class SubwayRepository {
  constructor(
    private readonly connectionManager: MssqlConnectionManager,
  ) {}

  /**
   * 지하철명으로 SUBWAY_STATION 데이터를 조회합니다.
   * @param name - 조회할 지하철명
   * @returns 조회 결과 목록 (없으면 빈 배열)
   */
  async readByName(name: string): Promise<SubwayStationRecord[]> {
    const pool = await this.connectionManager.getPool();
    const result = await pool
      .request()
      .input('name', sql.NVarChar(100), name)
      .query(`
        SELECT
          STATN_ID AS statnId,
          SUBWAY_ID AS subwayId,
          STATN_NM AS statnNm,
          LINE_NM AS lineNm
        FROM [SubwayDB].[dbo].[SUBWAY_STATION]
        WHERE STATN_NM = @name
      `);

    return result.recordset as SubwayStationRecord[];
  }
}
