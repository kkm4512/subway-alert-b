import * as fs from 'fs';
import * as path from 'path';
import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
import * as XLSX from 'xlsx';

/**
 * SQL 문자열 특수문자 이스케이프
 */
function escapeString(str: string): string {
  return str.replace(/'/g, "''");
}

/**
 * Excel 파일을 읽어서 SQLite 데이터베이스로 변환합니다.
 */
async function migrateXlsxToSqlite() {
  const dbPath = path.join(process.cwd(), 'data', 'subway.db');
  const fileDir = path.join(process.cwd(), 'file');

  // data 디렉토리 생성
  const dataDir = path.dirname(dbPath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // 기존 DB 파일 삭제 (새로 생성)
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
    console.log('기존 데이터베이스 파일 삭제됨');
  }

  // sql.js 초기화
  const SQL = await initSqlJs();
  const db = new SQL.Database();
  console.log('SQLite 데이터베이스 생성됨:', dbPath);

  try {
    // 스키마 생성
    db.run(`
      CREATE TABLE SUBWAY_STATION (
        STATN_ID INTEGER NOT NULL PRIMARY KEY,
        SUBWAY_ID INTEGER NOT NULL,
        STATN_NM TEXT NOT NULL,
        LINE_NM TEXT NOT NULL
      );
      CREATE INDEX IX_SUBWAY_STATION_STATN_NM ON SUBWAY_STATION(STATN_NM);

      CREATE TABLE SUBWAY_STATION_EXT (
        STATN_CD TEXT NOT NULL PRIMARY KEY,
        STATN_NM TEXT NOT NULL,
        LINE_NM TEXT NOT NULL,
        EXT_CD TEXT NOT NULL
      );
      CREATE INDEX IX_SUBWAY_STATION_EXT_NM_LINE ON SUBWAY_STATION_EXT(STATN_NM, LINE_NM);

      CREATE TABLE SUBWAY_FIRST_LAST_TRAIN (
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
      CREATE INDEX IX_SUBWAY_FIRST_LAST_TRAIN_LOOKUP 
        ON SUBWAY_FIRST_LAST_TRAIN(STATN_CD, UPDOWN_CD, DAY_CD);
    `);
    console.log('스키마 생성 완료');

    // SUBWAY_STATION 마이그레이션
    console.log('\n[1/3] SUBWAY_STATION.xlsx 마이그레이션 중...');
    const stationFilePath = path.join(fileDir, 'SUBWAY_STATION.xlsx');
    if (fs.existsSync(stationFilePath)) {
      const workbook = XLSX.readFile(stationFilePath);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(worksheet) as any[];

      let count = 0;
      for (const row of data) {
        const statnId = Number(row['STATN_ID'] || row['statnId']);
        const subwayId = Number(row['SUBWAY_ID'] || row['subwayId']);
        const statnNm = escapeString(String(row['STATN_NM'] || row['statnNm']));
        const lineNm = escapeString(String(row['LINE_NM'] || row['lineNm']));

        db.run(
          `INSERT INTO SUBWAY_STATION (STATN_ID, SUBWAY_ID, STATN_NM, LINE_NM)
           VALUES (${statnId}, ${subwayId}, '${statnNm}', '${lineNm}')`
        );
        count++;
      }
      console.log(`✓ ${count}개 행 삽입됨`);
    } else {
      console.warn(`⚠ 파일 없음: ${stationFilePath}`);
    }

    // SUBWAY_STATION_EXT 마이그레이션
    console.log('\n[2/3] SUBWAY_STATION_EXT.xlsx 마이그레이션 중...');
    const stationExtFilePath = path.join(fileDir, 'SUBWAY_STATION_EXT.xlsx');
    if (fs.existsSync(stationExtFilePath)) {
      const workbook = XLSX.readFile(stationExtFilePath);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(worksheet) as any[];

      let count = 0;
      for (const row of data) {
        const statnCd = escapeString(String(row['STATN_CD'] || row['statnCd']));
        const statnNm = escapeString(String(row['STATN_NM'] || row['statnNm']));
        const lineNm = escapeString(String(row['LINE_NM'] || row['lineNm']));
        const extCd = escapeString(String(row['EXT_CD'] || row['extCd']));

        db.run(
          `INSERT INTO SUBWAY_STATION_EXT (STATN_CD, STATN_NM, LINE_NM, EXT_CD)
           VALUES ('${statnCd}', '${statnNm}', '${lineNm}', '${extCd}')`
        );
        count++;
      }
      console.log(`✓ ${count}개 행 삽입됨`);
    } else {
      console.warn(`⚠ 파일 없음: ${stationExtFilePath}`);
    }

    // SUBWAY_FIRST_LAST_TRAIN 마이그레이션
    console.log('\n[3/3] SUBWAY_FIRST_LAST_TRAIN.xlsx 마이그레이션 중...');
    const firstLastTrainFilePath = path.join(fileDir, 'SUBWAY_FIRST_LAST_TRAIN.xlsx');
    if (fs.existsSync(firstLastTrainFilePath)) {
      const workbook = XLSX.readFile(firstLastTrainFilePath);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(worksheet) as any[];

      let count = 0;
      for (const row of data) {
        const lineNm = escapeString(String(row['LINE_NM'] || row['lineNm']));
        const updnCd = Number(row['UPDOWN_CD'] || row['updownCd']);
        const dayCd = Number(row['DAY_CD'] || row['dayCd']);
        const statnCd = escapeString(String(row['STATN_CD'] || row['statnCd']));
        const extCd = escapeString(String(row['EXT_CD'] || row['extCd']));
        const statnNm = escapeString(String(row['STATN_NM'] || row['statnNm']));
        const firstTime = escapeString(String(row['FIRST_TIME'] || row['firstTime']));
        const firstDepNm = escapeString(String(row['FIRST_DEP_NM'] || row['firstDepNm']));
        const firstArrNm = escapeString(String(row['FIRST_ARR_NM'] || row['firstArrNm']));
        const lastTime = escapeString(String(row['LAST_TIME'] || row['lastTime']));
        const lastDepNm = escapeString(String(row['LAST_DEP_NM'] || row['lastDepNm']));
        const lastArrNm = escapeString(String(row['LAST_ARR_NM'] || row['lastArrNm']));

        db.run(
          `INSERT INTO SUBWAY_FIRST_LAST_TRAIN 
           (LINE_NM, UPDOWN_CD, DAY_CD, STATN_CD, EXT_CD, STATN_NM, FIRST_TIME, FIRST_DEP_NM, FIRST_ARR_NM, LAST_TIME, LAST_DEP_NM, LAST_ARR_NM)
           VALUES ('${lineNm}', ${updnCd}, ${dayCd}, '${statnCd}', '${extCd}', '${statnNm}', '${firstTime}', '${firstDepNm}', '${firstArrNm}', '${lastTime}', '${lastDepNm}', '${lastArrNm}')`
        );
        count++;
      }
      console.log(`✓ ${count}개 행 삽입됨`);
    } else {
      console.warn(`⚠ 파일 없음: ${firstLastTrainFilePath}`);
    }

    // 데이터 검증
    console.log('\n[검증] 삽입된 데이터 확인 중...');
    const stationCountResult = db.exec('SELECT COUNT(*) as cnt FROM SUBWAY_STATION');
    const stationExtCountResult = db.exec('SELECT COUNT(*) as cnt FROM SUBWAY_STATION_EXT');
    const firstLastTrainCountResult = db.exec('SELECT COUNT(*) as cnt FROM SUBWAY_FIRST_LAST_TRAIN');

    const stationCount = stationCountResult[0]?.values[0]?.[0] ?? 0;
    const stationExtCount = stationExtCountResult[0]?.values[0]?.[0] ?? 0;
    const firstLastTrainCount = firstLastTrainCountResult[0]?.values[0]?.[0] ?? 0;

    console.log(`  - SUBWAY_STATION: ${stationCount}개`);
    console.log(`  - SUBWAY_STATION_EXT: ${stationExtCount}개`);
    console.log(`  - SUBWAY_FIRST_LAST_TRAIN: ${firstLastTrainCount}개`);

    // 디스크에 저장
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
    console.log(`\n✅ 마이그레이션 완료! (${dbPath})`);
  } catch (error) {
    console.error('❌ 마이그레이션 실패:', error);
    throw error;
  }
}

// 실행
migrateXlsxToSqlite().catch((error) => {
  console.error(error);
  process.exit(1);
});
