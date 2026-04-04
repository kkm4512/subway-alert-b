import { Injectable, OnModuleDestroy } from '@nestjs/common';
import sql, { ConnectionPool } from 'mssql';
import { mssqlConfig } from './mssql.config';

/**
 * MSSQL 커넥션 풀 생명주기 관리 클래스
 */
@Injectable()
export class MssqlConnectionManager implements OnModuleDestroy {
  private pool: ConnectionPool | null = null;

  /**
   * ConnectionPool을 생성하거나 기존 인스턴스를 반환합니다.
   */
  async getPool(): Promise<ConnectionPool> {
    if (this.pool) {
      return this.pool;
    }

    this.pool = await new sql.ConnectionPool(mssqlConfig).connect();
    return this.pool;
  }

  async onModuleDestroy(): Promise<void> {
    if (!this.pool) {
      return;
    }

    await this.pool.close();
    this.pool = null;
  }
}
