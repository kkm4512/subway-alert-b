import * as fs from 'fs';
import initSqlJs from 'sql.js';

(async () => {
  const dbFilePath = 'data/subway.db';
  const buffer = fs.readFileSync(dbFilePath);
  const SQL = await initSqlJs();
  const db = new SQL.Database(buffer);
  const query = `SELECT STATN_CD, STATN_NM, LINE_NM, EXT_CD, INITIALS FROM SUBWAY_STATION_SEARCH WHERE STATN_NM LIKE '%돌곶이%' OR INITIALS LIKE '%ㄷㄱㅇ%' ORDER BY STATN_NM LIMIT 1000;`;
  const result = db.exec(query);
  console.log('query:', query);
  console.log(JSON.stringify(result, null, 2));
  const count = db.exec(`SELECT COUNT(*) AS cnt FROM SUBWAY_STATION_SEARCH WHERE STATN_NM LIKE '%돌곶이%' OR INITIALS LIKE '%ㄷㄱㅇ%';`);
  console.log('count:', count[0]?.values?.[0]?.[0]);
})();
