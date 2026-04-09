import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';

/**
 * SQLite 연결 관리 클래스 (sql.js 기반)
 *
 * 데이터베이스 파일을 메모리에 로드하고 생명주기를 관리합니다.
 */
@Injectable()
export class SqliteConnectionManager implements OnModuleInit, OnModuleDestroy {
  private db: SqlJsDatabase | null = null;
  private dbPath: string = '';

  /**
   * 데이터베이스 인스턴스를 반환합니다.
   */
  getDb(): SqlJsDatabase {
    if (!this.db) {
      throw new Error('SQLite 데이터베이스가 초기화되지 않았습니다.');
    }
    return this.db;
  }

  /**
   * 모듈 초기화 시 데이터베이스를 로드합니다.
   */
  async onModuleInit(): Promise<void> {
    this.dbPath = path.join(process.cwd(), 'data', 'subway.db');

    // data 디렉토리 생성
    const dataDir = path.dirname(this.dbPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // sql.js 초기화
    const SQL = await initSqlJs();

    // 기존 DB 파일 있으면 로드, 없으면 새로 생성
    let db: SqlJsDatabase;
    if (fs.existsSync(this.dbPath)) {
      const filebuffer = fs.readFileSync(this.dbPath);
      db = new SQL.Database(filebuffer);
    } else {
      db = new SQL.Database();
      this.initializeSchema(db);
      this.saveToDisk(db);
    }

    this.db = db;
  }

  /**
   * 데이터베이스 스키마를 초기화합니다.
   */
  private initializeSchema(db: SqlJsDatabase): void {
    // SUBWAY_STATION 테이블
    db.run(`
      CREATE TABLE IF NOT EXISTS SUBWAY_STATION (
        STATN_ID INTEGER NOT NULL PRIMARY KEY,
        SUBWAY_ID INTEGER NOT NULL,
        STATN_NM TEXT NOT NULL,
        LINE_NM TEXT NOT NULL
      );
    `);
    db.run(`CREATE INDEX IF NOT EXISTS IX_SUBWAY_STATION_STATN_NM ON SUBWAY_STATION(STATN_NM);`);

    // SUBWAY_STATION_EXT 테이블
    db.run(`
      CREATE TABLE IF NOT EXISTS SUBWAY_STATION_EXT (
        STATN_CD TEXT NOT NULL PRIMARY KEY,
        STATN_NM TEXT NOT NULL,
        LINE_NM TEXT NOT NULL,
        EXT_CD TEXT NOT NULL
      );
    `);
    db.run(`CREATE INDEX IF NOT EXISTS IX_SUBWAY_STATION_EXT_NM_LINE ON SUBWAY_STATION_EXT(STATN_NM, LINE_NM);`);

    // SUBWAY_FIRST_LAST_TRAIN 테이블
    db.run(`
      CREATE TABLE IF NOT EXISTS SUBWAY_FIRST_LAST_TRAIN (
        SEQ INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        LINE_NM TEXT NOT NULL,
        UPDOWN_CD INTEGER NOT NULL,
        DAY_CD INTEGER NOT NULL,
        STATN_CD TEXT NOT NULL,
        EXT_CD TEXT NOT NULL,
        STATN_NM TEXT NOT NULL,
        FIRST_TIME TEXT NOT NULL,
        FIRST_DEP_NM TEXT NOT NULL,
        FIRST_ARR_NM TEXT NOT NULL,
        LAST_TIME TEXT NOT NULL,
        LAST_DEP_NM TEXT NOT NULL,
        LAST_ARR_NM TEXT NOT NULL
      );
    `);
    db.run(`CREATE INDEX IF NOT EXISTS IX_SUBWAY_FIRST_LAST_TRAIN_LOOKUP 
      ON SUBWAY_FIRST_LAST_TRAIN(STATN_CD, UPDOWN_CD, DAY_CD);`);
  }

  /**
   * 데이터베이스를 디스크에 저장합니다.
   */
  private saveToDisk(db: SqlJsDatabase): void {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(this.dbPath, buffer);
  }

  /**
   * 모듈 종료 시 데이터베이스를 저장하고 닫습니다.
   */
  async onModuleDestroy(): Promise<void> {
    if (this.db) {
      this.saveToDisk(this.db);
      this.db.close();
      this.db = null;
    }
  }
}
