import { Module } from '@nestjs/common';
import { HealthController } from './controller/health.controller';
import { SubwayController } from './controller/subway.controller';
import { LogService } from './common/logger/log.service';
import { ConsoleLogWriter } from './common/logger/writer/console.log-writer';
import { FileLogWriter } from './common/logger/writer/file.log-writer';
import { MssqlConnectionManager } from './config/mssql-connection.manager';
import { SubwayRepository } from './repository/subway.repository';
import { SubwayInfoService } from './service/subway-info.service';
import { SubwayValidator } from './service/subway.validator';

@Module({
  imports: [],
  controllers: [HealthController, SubwayController],
  providers: [LogService, ConsoleLogWriter, FileLogWriter, SubwayValidator, MssqlConnectionManager, SubwayRepository, SubwayInfoService],
  exports: [LogService],
})
export class AppModule {}
