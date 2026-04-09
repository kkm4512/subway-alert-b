import { Injectable } from '@nestjs/common';
import sql from 'mssql';
import { MssqlConnectionManager } from '../config/mssql-connection.manager';

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
    private readonly connectionManager: MssqlConnectionManager,
  ) {}

  /**
   * 역코드로 SUBWAY_STATION_EXT 데이터를 조회합니다.
   * @param statnCd - 역코드
   * @returns 조회 결과 또는 null
   */
  async readByStationCode(statnCd: string): Promise<SubwayStationExtRecord | null> {
    const pool = await this.connectionManager.getPool();
    const result = await pool
      .request()
      .input('statnCd', sql.VarChar(4), statnCd)
      .query(`
        SELECT TOP (1)
          STATN_CD AS statnCd,
          STATN_NM AS statnNm,
          LINE_NM AS lineNm,
          EXT_CD AS extCd
        FROM [SubwayDB].[dbo].[SUBWAY_STATION_EXT]
        WHERE STATN_CD = @statnCd
      `);

    if (result.recordset.length === 0) {
      return null;
    }

    return result.recordset[0] as SubwayStationExtRecord;
  }

  /**
   * 역명으로 SUBWAY_STATION_EXT 데이터를 조회합니다.
   * @param name - 조회할 역명
   * @returns 조회 결과 목록 (없으면 빈 배열)
   */
  async readByStationName(name: string): Promise<SubwayStationExtRecord[]> {
    const pool = await this.connectionManager.getPool();
    const result = await pool
      .request()
      .input('name', sql.NVarChar(100), name)
      .query(`
        SELECT TOP (1000)
          STATN_CD AS statnCd,
          STATN_NM AS statnNm,
          LINE_NM AS lineNm,
          EXT_CD AS extCd
        FROM [SubwayDB].[dbo].[SUBWAY_STATION_EXT]
        WHERE STATN_NM = @name
      `);

    return result.recordset as SubwayStationExtRecord[];
  }
}
