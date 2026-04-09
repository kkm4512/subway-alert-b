import { Injectable } from '@nestjs/common';
import sql from 'mssql';
import { MssqlConnectionManager } from '../config/mssql-connection.manager';

/** SUBWAY_FIRST_LAST_TRAIN 조회 결과 타입 */
export interface SubwayFirstLastTrainRecord {
  readonly seq: number;
  readonly lineNm: string;
  readonly updownCd: number;
  readonly dayCd: number;
  readonly statnCd: string;
  readonly extCd: string;
  readonly statnNm: string;
  readonly firstTime: string;
  readonly firstDepNm: string;
  readonly firstArrNm: string;
  readonly lastTime: string;
  readonly lastDepNm: string;
  readonly lastArrNm: string;
}

/**
 * SUBWAY_FIRST_LAST_TRAIN 테이블 접근 전용 Repository
 *
 * 첫차/막차 시각 조회 쿼리를 담당합니다.
 */
@Injectable()
export class SubwayFirstLastTrainRepository {
  constructor(
    private readonly connectionManager: MssqlConnectionManager,
  ) {}

  /**
   * 역코드/상하행/요일 조건으로 첫차/막차 정보를 조회합니다.
   * @param statnCd - 역코드
   * @param updownCd - 상하행 코드 (1:상행, 2:하행)
   * @param dayCd - 요일 코드 (1:평일, 2:토, 3:일/공휴일)
   * @returns 첫차/막차 정보 또는 null
   */
  async readByCondition(
    statnCd: string,
    updownCd: number,
    dayCd: number,
  ): Promise<SubwayFirstLastTrainRecord | null> {
    const pool = await this.connectionManager.getPool();
    const result = await pool
      .request()
      .input('statnCd', sql.VarChar(4), statnCd)
      .input('updownCd', sql.TinyInt, updownCd)
      .input('dayCd', sql.TinyInt, dayCd)
      .query(`
        SELECT TOP (1)
          SEQ AS seq,
          LINE_NM AS lineNm,
          UPDOWN_CD AS updownCd,
          DAY_CD AS dayCd,
          STATN_CD AS statnCd,
          EXT_CD AS extCd,
          STATN_NM AS statnNm,
          FIRST_TIME AS firstTime,
          FIRST_DEP_NM AS firstDepNm,
          FIRST_ARR_NM AS firstArrNm,
          LAST_TIME AS lastTime,
          LAST_DEP_NM AS lastDepNm,
          LAST_ARR_NM AS lastArrNm
        FROM [SubwayDB].[dbo].[SUBWAY_FIRST_LAST_TRAIN]
        WHERE STATN_CD = @statnCd
          AND UPDOWN_CD = @updownCd
          AND DAY_CD = @dayCd
        ORDER BY SEQ ASC
      `);

    if (result.recordset.length === 0) {
      return null;
    }

    return result.recordset[0] as SubwayFirstLastTrainRecord;
  }
}
