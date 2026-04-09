# Subway Alert API

서울 지하철 역 정보를 조회하는 NestJS 기반 백엔드 프로젝트입니다.
이 프로젝트는 데이터 적재/수정 없이 조회(SELECT) 중심으로 동작하며, 아래 정보를 API로 제공합니다.

- 역명 기준 역/호선 기본 정보
- 역코드 기준 실시간 도착 정보
- 역코드 + 상하행 기준 첫차/막차 정보

## 1) 프로젝트 개요

### 목적

클라이언트가 역명 또는 역코드를 전달하면, 내부 MSSQL 데이터와 외부 서울 열린데이터 API를 조합해
표준 응답 포맷으로 지하철 정보를 반환합니다.

### 동작 방식

- DB 조회 테이블
  - `SUBWAY_STATION_EXT`: 역코드/역명/호선 기본 정보
  - `SUBWAY_STATION`: 노선 식별자(subwayId) 조회
  - `SUBWAY_FIRST_LAST_TRAIN`: 첫차/막차 시각 조회
- 외부 API 조회
  - 서울시 실시간 도착 API(`SEOUL_METRO_REALTIME_URL`)

## 2) 기술 스택

- Node.js 22
- NestJS 11
- TypeScript
- MSSQL (`mssql` 패키지)

## 3) 로컬 실행 방법

```bash
npm install
npm run start:dev
```

기본 포트는 `SERVER_PORT` 환경변수 값을 사용합니다.

## 4) 환경변수

필수 환경변수는 아래와 같습니다.

- `SERVER_PORT`: 서버 포트 (예: `3000`)
- `DB_MSSQL_HOST`: MSSQL 호스트
- `DB_MSSQL_PORT`: MSSQL 포트
- `DB_MSSQL_NAME`: DB 이름
- `DB_MSSQL_USER`: DB 계정
- `DB_MSSQL_PASSWORD`: DB 비밀번호
- `SEOUL_METRO_REALTIME_URL`: 서울시 실시간 도착 API Base URL

## 5) 공통 응답 스펙

모든 API는 동일한 JSON 구조로 응답합니다.

```json
{
  "code": 200,
  "message": "SUCCESS",
  "items": null
}
```

응답 필드 설명:

- `code`: HTTP 성격의 숫자 코드
- `message`: 응답 메시지
- `items`: 실제 데이터(객체/배열), 없으면 `null`

### 공통 코드/메시지

- `200 / SUCCESS`
- `400 / BAD REQUEST`
- `404 / 데이터를 찾을 수 없습니다!`
- `500 / INTERNAL SERVER ERROR`

## 6) API 명세

### 6-1. 헬스체크

- Method/Path: `GET /`
- 설명: 서버 정상 동작 여부 확인

요청 예시:

```bash
curl "http://localhost:3000/"
```

응답 예시:

```json
{
  "code": 200,
  "message": "SUCCESS",
  "items": null
}
```

---

### 6-2. 역명으로 역 정보 조회

- Method/Path: `GET /subway-info`
- Query Params
  - `statnNm` (string, required): 역명
- 검증 규칙
  - 공백 불가
  - 한글/공백만 허용

요청 예시:

```bash
curl "http://localhost:3000/subway-info?statnNm=강남"
```

성공 응답 예시 (`200`):

```json
{
  "code": 200,
  "message": "SUCCESS",
  "items": [
    {
      "statnCd": "0222",
      "statnNm": "강남",
      "lineNm": "2호선",
      "extCd": "1002"
    }
  ]
}
```

실패 응답 예시 (`400`):

```json
{
  "code": 400,
  "message": "BAD REQUEST",
  "items": null
}
```

실패 응답 예시 (`404`):

```json
{
  "code": 404,
  "message": "데이터를 찾을 수 없습니다!",
  "items": null
}
```

---

### 6-3. 역코드로 실시간 도착 조회

- Method/Path: `GET /subway-realtime-arrival`
- Query Params
  - `statnCd` (string, required): 4자리 역코드
- 검증 규칙
  - 정확히 4자리 숫자만 허용 (예: `0200`, `0002`)

요청 예시:

```bash
curl "http://localhost:3000/subway-realtime-arrival?statnCd=0200"
```

성공 응답 예시 (`200`):

```json
{
  "code": 200,
  "message": "SUCCESS",
  "items": [
    {
      "updnLine": 1,
      "start": "응암순환(상선)행",
      "end": "상월곡(한국과학기술연구원)방면",
      "arrivalMinute": 2,
      "btrainSttus": "일반",
      "arvlCd": "전역출발"
    }
  ]
}
```

응답 필드 설명:

- `updnLine`: 방향 코드 (`1: 상행/내선`, `2: 하행/외선`)
- `start`: 출발 측 정보
- `end`: 도착/방면 정보
- `arrivalMinute`: 남은 도착 시간(분), 음수면 `0`
- `btrainSttus`: 열차 종류 (일반/급행 등)
- `arvlCd`: 도착 상태 (진입/도착/출발/전역출발/전역진입/전역도착/운행중)

실패 응답 예시 (`400`):

```json
{
  "code": 400,
  "message": "BAD REQUEST",
  "items": null
}
```

실패 응답 예시 (`404`):

```json
{
  "code": 404,
  "message": "데이터를 찾을 수 없습니다!",
  "items": null
}
```

---

### 6-4. 역코드/상하행으로 첫차·막차 조회

- Method/Path: `GET /subway-first-last-time`
- Query Params
  - `statnCd` (string, required): 4자리 역코드
  - `updnLine` (string, required): `1` 또는 `2`
- 검증 규칙
  - `statnCd`: 정확히 4자리 숫자
  - `updnLine`: `1(상행/내선)` 또는 `2(하행/외선)`

요청 예시:

```bash
curl "http://localhost:3000/subway-first-last-time?statnCd=0200&updnLine=1"
```

성공 응답 예시 (`200`):

```json
{
  "code": 200,
  "message": "SUCCESS",
  "items": {
    "dayType": "평일",
    "firstTime": "05:31",
    "lastTime": "24:11"
  }
}
```

응답 필드 설명:

- `dayType`: 요일 구분 (`평일`, `토요일`, `휴일/일요일`)
- `firstTime`: 첫차 시각
- `lastTime`: 막차 시각

실패 응답 예시 (`400`):

```json
{
  "code": 400,
  "message": "BAD REQUEST",
  "items": null
}
```

실패 응답 예시 (`404`):

```json
{
  "code": 404,
  "message": "데이터를 찾을 수 없습니다!",
  "items": null
}
```

## 7) 참고 사항

- 본 서비스는 조회 중심 서비스이며, 기본 비즈니스 로직에서 데이터 INSERT/UPDATE/DELETE를 수행하지 않습니다.
- 실시간 도착 API는 외부 연동 상태에 따라 응답 지연/누락이 발생할 수 있습니다.
