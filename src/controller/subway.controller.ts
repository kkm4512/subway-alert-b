import { Controller, Get, Query } from '@nestjs/common';
import { LogService } from '../common/logger/log.service';
import { ResponseModel } from '../common/model/response.model';
import { AppMessage, ResponseCode } from '../common/constant/response-code.constant';
import { SubwayValidator } from '../service/subway.validator';
import { SubwayInfoService } from '../service/subway-info.service';

/**
 * 지하철 관련 API 컨트롤러
 */
@Controller()
export class SubwayController {
	constructor(
		private readonly logService: LogService,
		private readonly subwayValidator: SubwayValidator,
		private readonly subwayInfoService: SubwayInfoService,
	) {}

	/**
	 * 사용자로부터 지하철명을 받아 응답합니다.
	 * 예) GET /subway-info?statnNm=강남
	 * @param statnNm - 지하철역/노선명
	 */
	@Get('subway-search')
	async searchSubway(@Query('statnNm') statnNm?: string): Promise<ResponseModel<unknown>> {
		const isValid = this.subwayValidator.validateSubwayName(statnNm);
		if (!isValid) {
			this.logService.warn(AppMessage.BAD_REQUEST, SubwayController.name);
			return ResponseModel.of(ResponseCode.BAD_REQUEST);
		}

		const query = statnNm!.trim();
		const searchResult = await this.subwayInfoService.searchStations(query);
		if (searchResult.length === 0) {
			this.logService.warn(AppMessage.DATA_NOT_FOUND, SubwayController.name);
			return ResponseModel.of(ResponseCode.NOT_FOUND);
		}

		this.logService.info(`Subway search query received: ${query}`, SubwayController.name);
		return ResponseModel.of(ResponseCode.SUCCESS, searchResult);
	}

	@Get('subway-info')
	async getSubwayInfo(@Query('statnNm') statnNm?: string): Promise<ResponseModel<unknown>> {
		const isValid = this.subwayValidator.validateSubwayName(statnNm);
		if (!isValid) {
			this.logService.warn(AppMessage.BAD_REQUEST, SubwayController.name);
			return ResponseModel.of(ResponseCode.BAD_REQUEST);
		}

		const subwayName = statnNm!.trim();
		const subwayInfo = await this.subwayInfoService.getStationsByName(subwayName);
		if (subwayInfo.length === 0) {
			this.logService.warn(AppMessage.DATA_NOT_FOUND, SubwayController.name);
			return ResponseModel.of(ResponseCode.NOT_FOUND);
		}

		this.logService.info(`Subway name received: ${subwayName}`, SubwayController.name);
		return ResponseModel.of(ResponseCode.SUCCESS, subwayInfo);
	}

	/**
	 * 역코드로 실시간 도착 정보를 조회합니다.
	 * 내부적으로 SUBWAY_STATION_EXT/SUBWAY_STATION을 조회해 노선에 맞는 실시간 정보만 반환합니다.
	 * 예) GET /subway-realtime-arrival?statnCd=0200
	 * @param statnCd - 역코드(4자리 숫자)
	 */
	@Get('subway-realtime-arrival')
	async getSubwayRealtimeArrival(
		@Query('statnCd') statnCd?: string,
	): Promise<ResponseModel<unknown>> {
		const isValidStationCode = this.subwayValidator.validateSubwayCode(statnCd);

		if (!isValidStationCode) {
			this.logService.warn(AppMessage.BAD_REQUEST, SubwayController.name);
			return ResponseModel.of(ResponseCode.BAD_REQUEST);
		}

		const realtimeArrival = await this.subwayInfoService.getRealtimeArrivalByStationCode(
			statnCd!.trim(),
		);

		if (realtimeArrival.length === 0) {
			this.logService.warn(AppMessage.DATA_NOT_FOUND, SubwayController.name);
			return ResponseModel.of(ResponseCode.NOT_FOUND);
		}

		return ResponseModel.of(ResponseCode.SUCCESS, realtimeArrival);
	}	

	/**
	 * 역코드/상하행으로 첫차, 막차 시간을 조회합니다.
	 * 예) GET /subway-first-last-time?statnCd=0200&updnLine=1
	 * @param statnCd - 역코드(4자리 숫자)
	 * @param updnLine - 상하행 코드 (1:상행/내선, 2:하행/외선)
	 */
	@Get('subway-first-last-time')
	async getSubwayFirstLastTime(
		@Query('statnCd') statnCd?: string,
		@Query('updnLine') updnLine?: string,
	): Promise<ResponseModel<unknown>> {
		const isValidStationCode = this.subwayValidator.validateSubwayCode(statnCd);
		const isValidUpdnLine = this.subwayValidator.validateUpdnLine(updnLine);

		if (!isValidStationCode || !isValidUpdnLine) {
			this.logService.warn(AppMessage.BAD_REQUEST, SubwayController.name);
			return ResponseModel.of(ResponseCode.BAD_REQUEST);
		}

		const firstLastTime = await this.subwayInfoService.readFirstLastTimeByStationCode(
			statnCd!.trim(),
			Number(updnLine),
		);

		if (!firstLastTime) {
			this.logService.warn(AppMessage.DATA_NOT_FOUND, SubwayController.name);
			return ResponseModel.of(ResponseCode.NOT_FOUND);
		}

		return ResponseModel.of(ResponseCode.SUCCESS, firstLastTime);
	}


}
