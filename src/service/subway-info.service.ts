import { Injectable } from '@nestjs/common';
import {
  SubwayFirstLastTrainRecord,
} from '../repository/subway-first-last-train.repository';
import {
  SubwayStationExtRecord,
  SubwayStationExtRepository,
} from '../repository/subway-station-ext.repository';
import { SubwayFirstLastTrainRepository } from '../repository/subway-first-last-train.repository';
import { RestApiService } from '../common/rest-api/rest-api.service';
import { ARVL_CD_LABEL, DAY_CD_LABEL, UPDN_LINE_CODE } from '../common/constant/subway-code.constant';
import { SubwayStationRepository } from '../repository/subway-station.repository';

/** 첫차/막차 응답 타입 */
export interface SubwayFirstLastTimeResult {
  readonly dayType: string;
  readonly firstTime: string;
  readonly lastTime: string;
}

/** 서울시 지하철 실시간 도착 정보 단건 타입 */
export interface SubwayRealtimeArrivalRecord {
  readonly rowNum: number | string;
  readonly selectedCount: number | string;
  readonly totalCount: number | string;
  readonly subwayId: string;
  readonly updnLine: string;
  readonly trainLineNm: string;
  readonly statnFid: string;
  readonly statnTid: string;
  readonly statnId: string;
  readonly statnNm: string;
  readonly trnsitCo: number | string;
  readonly ordkey: string;
  readonly subwayList: string;
  readonly statnList: string;
  readonly btrainSttus: string;
  readonly barvlDt: string;
  readonly btrainNo: string;
  readonly bstatnId: string;
  readonly bstatnNm: string;
  readonly recptnDt: string;
  readonly arvlMsg2: string;
  readonly arvlMsg3: string;
  readonly arvlCd: string;
  readonly lstcarAt: string;
}

/** 서울시 지하철 실시간 도착 API 응답 타입 */
export interface SeoulMetroRealtimeResponse {
  readonly errorMessage?: Record<string, unknown>;
  readonly realtimeArrivalList?: SubwayRealtimeArrivalRecord[];
}

/** 실시간 도착 정보 응답 타입 (필요 필드만 추출) */
export interface SubwayRealtimeArrivalResult {
  /** 방향 코드 (1:상행/내선, 2:하행/외선) */
  readonly updnLine: number;
  /** 출발 측 정보 (예: 응암순환(상선)행) */
  readonly start: string;
  /** 도착/방면 정보 (예: 상월곡(한국과학기술연구원)방면) */
  readonly end: string;
  /** 수신 시각 기준 남은 도착 시간(분), 음수이면 0 */
  readonly arrivalMinute: number;
  /** 열차 종류 (일반/급행 등) */
  readonly btrainSttus: string;
  /** 도착 상태 (진입/도착/출발/전역출발/전역진입/전역도착/운행중) */
  readonly arvlCd: string;
}

/**
 * 지하철 정보 비즈니스 서비스
 *
 * 비즈니스 흐름을 담당하며 DB 접근은 Repository에 위임합니다.
 */
@Injectable()
export class SubwayInfoService {
  constructor(
    private readonly restApiService: RestApiService,
    private readonly subwayStationExtRepository: SubwayStationExtRepository,
    private readonly subwayStationRepository: SubwayStationRepository,
    private readonly subwayFirstLastTrainRepository: SubwayFirstLastTrainRepository,
  ) {}

  /**
   * 지하철명으로 SUBWAY_STATION_EXT 데이터를 조회합니다.
   * @param name - 조회할 지하철명
   * @returns 조회 결과 목록 (없으면 빈 배열)
   */
  async getStationsByName(name: string): Promise<SubwayStationExtRecord[]> {
    return this.subwayStationExtRepository.readByStationName(name);
  }

  /**
   * 역코드/상하행으로 첫차/막차 시간을 조회합니다.
   * @param statnCd - 역코드
   * @param updnLine - 상하행 코드 (1:상행/내선, 2:하행/외선)
   * @returns 첫차/막차 결과 또는 null
   */
  async readFirstLastTimeByStationCode(
    statnCd: string,
    updnLine: number,
  ): Promise<SubwayFirstLastTimeResult | null> {
    const dayCd = this.resolveDayCode();
    const record = await this.subwayFirstLastTrainRepository.readByCondition(statnCd, updnLine, dayCd);

    if (!record) {
      return null;
    }

    return this.toFirstLastResult(record);
  }

  /**
   * 역코드로 서울시 지하철 실시간 도착 정보를 조회합니다.
   * 1) SUBWAY_STATION_EXT에서 역명/호선 조회
   * 2) SUBWAY_STATION에서 subwayId 조회
   * 3) 실시간 API 호출 후 subwayId가 같은 항목만 반환
   * @param statnCd - 역코드
   * @returns 실시간 도착 정보 목록
   */
  async getRealtimeArrivalByStationCode(statnCd: string): Promise<SubwayRealtimeArrivalResult[]> {
    const stationExtRecord = await this.subwayStationExtRepository.readByStationCode(statnCd);
    if (!stationExtRecord) {
      return [];
    }

    const stationRecord = await this.subwayStationRepository.readByStationNameAndLine(
      stationExtRecord.statnNm,
      stationExtRecord.lineNm,
    );
    if (!stationRecord) {
      return [];
    }

    const baseUrl = process.env.SEOUL_METRO_REALTIME_URL;
    if (!baseUrl) {
      throw new Error('SEOUL_METRO_REALTIME_URL 환경변수가 설정되어 있지 않습니다.');
    }

    const requestUrl = `${baseUrl}/0/100/${encodeURIComponent(stationExtRecord.statnNm)}`;
    const response = await this.restApiService.request<SeoulMetroRealtimeResponse>({
      url: requestUrl,
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.data || typeof response.data === 'string') {
      return [];
    }

    const rawList = response.data.realtimeArrivalList ?? [];
    return rawList
      .filter((record) => Number(record.subwayId) === stationRecord.subwayId)
      .map((record) => this.toRealtimeArrivalResult(record));
  }

  /**
   * 실시간 도착 raw 데이터를 응답 형태로 변환합니다.
   * arrivalMinute = floor((barvlDt - 수신 후 경과 초) / 60), 음수이면 0
   */
  private toRealtimeArrivalResult(record: SubwayRealtimeArrivalRecord): SubwayRealtimeArrivalResult {
    const elapsedSeconds = (Date.now() - new Date(record.recptnDt).getTime()) / 1000;
    const remainingSeconds = Number(record.barvlDt) - elapsedSeconds;
    const arrivalMinute = Math.max(0, Math.floor(remainingSeconds / 60));
    const parsedTrainLine = this.parseTrainLineName(record.trainLineNm);

    return {
      updnLine: UPDN_LINE_CODE[record.updnLine] ?? 0,
      start: parsedTrainLine.start,
      end: parsedTrainLine.end,
      arrivalMinute,
      btrainSttus: record.btrainSttus,
      arvlCd: ARVL_CD_LABEL[record.arvlCd] ?? record.arvlCd,
    };
  }

  /** trainLineNm 문자열을 start/end로 분리합니다. */
  private parseTrainLineName(trainLineNm: string): { start: string; end: string } {
    const separator = ' - ';
    const separatorIndex = trainLineNm.indexOf(separator);

    if (separatorIndex < 0) {
      return {
        start: trainLineNm.trim(),
        end: '',
      };
    }

    const start = trainLineNm.slice(0, separatorIndex).trim();
    const end = trainLineNm.slice(separatorIndex + separator.length).trim();

    return { start, end };
  }

  /**
   * 현재 날짜를 DAY_CD로 변환합니다.
   * - 1: 평일, 2: 토요일, 3: 일요일/공휴일(일요일 기준)
   */
  private resolveDayCode(): number {
    const day = new Date().getDay();

    if (day === 6) {
      return 2;
    }

    if (day === 0) {
      return 3;
    }

    return 1;
  }

  /** Repository 조회 결과를 API 응답 형태로 변환합니다. */
  private toFirstLastResult(record: SubwayFirstLastTrainRecord): SubwayFirstLastTimeResult {
    return {
      dayType: DAY_CD_LABEL[record.dayCd] ?? String(record.dayCd),
      firstTime: record.firstTime,
      lastTime: record.lastTime,
    };
  }
}
