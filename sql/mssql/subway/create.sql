-- =============================================
-- 서울 열린 데이터 광장
-- URL: https://data.seoul.go.kr/dataList/OA-12764/A/1/datasetView.do
-- 데이터명: 서울시 지하철 실시간 도착정보
-- =============================================
CREATE TABLE [SubwayDB].[dbo].[SUBWAY_STATION] (
    [STATN_ID]  INT            NOT NULL,
    [SUBWAY_ID] INT            NOT NULL,
    [STATN_NM]  NVARCHAR(100)  NOT NULL,
    [LINE_NM]   NVARCHAR(50)   NOT NULL,

    CONSTRAINT [PK_SUBWAY_STATION] PRIMARY KEY ([STATN_ID])
);

CREATE INDEX [IX_SUBWAY_STATION_STATN_NM]
ON [SubwayDB].[dbo].[SUBWAY_STATION] ([STATN_NM]);


-- =============================================
-- 서울 열린 데이터 광장
-- URL: https://data.seoul.go.kr/dataList/OA-121/S/1/datasetView.do
-- 데이터명: 서울시 지하철 역별 정보
-- =============================================
CREATE TABLE [SubwayDB].[dbo].[SUBWAY_STATION_EXT] (
    [STATN_CD]  CHAR(4)        NOT NULL,
    [STATN_NM]  NVARCHAR(20)   NOT NULL,
    [LINE_NM]   NVARCHAR(20)   NOT NULL,
    [EXT_CD]    VARCHAR(10)    NOT NULL,

    CONSTRAINT [PK_SUBWAY_STATION_EXT] PRIMARY KEY ([STATN_CD])
);

CREATE INDEX [IX_SUBWAY_STATION_EXT_NM_LINE]
ON [SubwayDB].[dbo].[SUBWAY_STATION_EXT] ([STATN_NM], [LINE_NM]);


-- =============================================
-- 서울 열린 데이터 광장
-- URL: https://data.seoul.go.kr/dataList/OA-15492/S/1/datasetView.do
-- 데이터명: 서울시 지하철 호선별 첫차와 막차 정보
-- =============================================
CREATE TABLE [SubwayDB].[dbo].[SUBWAY_FIRST_LAST_TRAIN] (
    [SEQ]              INT IDENTITY(1,1) NOT NULL,  -- 대리키 PK
    [LINE_NM]          NVARCHAR(20)  NOT NULL,       -- 호선 (03호선)
    [UPDOWN_CD]        TINYINT       NOT NULL,       -- 상/하행선 (1:상행, 2:하행)
    [DAY_CD]           TINYINT       NOT NULL,       -- 요일 (1:평일, 2:토, 3:일/공휴일)
    [STATN_CD]         VARCHAR(4)    NOT NULL,       -- 전철역코드 (3~4자리)
    [EXT_CD]           VARCHAR(10)   NOT NULL,       -- 외부코드
    [STATN_NM]         NVARCHAR(20)  NOT NULL,       -- 전철역명
    [FIRST_TIME]       CHAR(6)       NOT NULL,       -- 첫차시간 (050730 = 05:07:30)
    [FIRST_DEP_CD]     INT           NOT NULL,       -- 첫차출발역코드
    [FIRST_ARR_CD]     INT           NOT NULL,       -- 첫차도착역코드
    [FIRST_DEP_NM]     NVARCHAR(20)  NOT NULL,       -- 첫차출발역명
    [FIRST_ARR_NM]     NVARCHAR(20)  NOT NULL,       -- 첫차도착역명
    [LAST_TIME]        CHAR(6)       NOT NULL,       -- 막차시간 (241600 = 24:16:00)
    [LAST_DEP_CD]      INT           NOT NULL,       -- 막차출발역코드
    [LAST_ARR_CD]      INT           NOT NULL,       -- 막차도착역코드
    [LAST_DEP_NM]      NVARCHAR(20)  NOT NULL,       -- 막차출발역명
    [LAST_ARR_NM]      NVARCHAR(20)  NOT NULL,       -- 막차도착역명

    CONSTRAINT [PK_SUBWAY_FIRST_LAST_TRAIN] PRIMARY KEY ([SEQ])
);

CREATE INDEX [IX_SUBWAY_FIRST_LAST_TRAIN_LOOKUP]
ON [SubwayDB].[dbo].[SUBWAY_FIRST_LAST_TRAIN] ([STATN_CD], [UPDOWN_CD], [DAY_CD]);