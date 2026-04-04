import { Controller, Get } from '@nestjs/common';
import { LogService } from '../common/logger/log.service';
import { ResponseModel } from '../common/model/response.model';
import { ResponseCode } from '../common/constant/response-code.constant';


@Controller()
export class HealthController {
  constructor(
    private readonly logService: LogService
  ) {}

  @Get()
  healthCheck(): ResponseModel {
    this.logService.info('Health check endpoint called');
    return ResponseModel.of(ResponseCode.SUCCESS);
  }
}
