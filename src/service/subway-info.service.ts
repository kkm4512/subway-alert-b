import { Injectable } from '@nestjs/common';
import { SubwayRepository, SubwayStationRecord } from '../repository/subway.repository';

/**
 * 지하철 정보 비즈니스 서비스
 *
 * 비즈니스 흐름을 담당하며 DB 접근은 Repository에 위임합니다.
 */
@Injectable()
export class SubwayInfoService {
  constructor(
    private readonly subwayRepository: SubwayRepository,
  ) {}

  /**
   * 지하철명으로 SUBWAY_STATION 데이터를 조회합니다.
   * @param name - 조회할 지하철명
   * @returns 조회 결과 목록 (없으면 빈 배열)
   */
  async readByName(name: string): Promise<SubwayStationRecord[]> {
    return this.subwayRepository.readByName(name);
  }
}
