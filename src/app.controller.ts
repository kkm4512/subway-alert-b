import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { LogService } from './common/logger/log.service';


@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly logService: LogService,
  ) {}

  @Get()
  getHello(): string {
    this.logService.info('Hello endpoint called');
    this.logService.warn('Hello endpoint called');
    this.logService.error('Hello endpoint called');
    return this.appService.getHello();
  }
}
