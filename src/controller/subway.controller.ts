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
	 * 예) GET /subway-info?name=강남
	 * @param name - 지하철역/노선명
	 */
	@Get('subway-info')
	async getSubwayInfo(@Query('name') name?: string): Promise<ResponseModel<unknown>> {
		const isValid = this.subwayValidator.validateSubwayName(name);
		if (!isValid) {
			this.logService.warn(AppMessage.BAD_REQUEST, SubwayController.name);
			return ResponseModel.of(ResponseCode.BAD_REQUEST);
		}

		const subwayName = name!.trim();
		const subwayInfo = await this.subwayInfoService.readByName(subwayName);
		if (subwayInfo.length === 0) {
			this.logService.warn(AppMessage.DATA_NOT_FOUND, SubwayController.name);
			return ResponseModel.of(ResponseCode.NOT_FOUND);
		}

		this.logService.info(`Subway name received: ${subwayName}`, SubwayController.name);
		return ResponseModel.of(ResponseCode.SUCCESS, subwayInfo);
	}
}
