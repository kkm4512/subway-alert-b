import { Module } from '@nestjs/common';
import { HealthController } from './controller/health.controller';
import { SubwayController } from './controller/subway.controller';
import { LogService } from './common/logger/log.service';
import { ConsoleLogWriter } from './common/logger/writer/console.log-writer';
import { FileLogWriter } from './common/logger/writer/file.log-writer';
import { RestApiService } from './common/rest-api/rest-api.service';
import { SqliteConnectionManager } from './config/sqlite-connection.manager';
import { SubwayFirstLastTrainRepository } from './repository/subway-first-last-train.repository';
import { SubwayStationRepository } from './repository/subway-station.repository';
import { SubwayStationExtRepository } from './repository/subway-station-ext.repository';
import { SubwayInfoService } from './service/subway-info.service';
import { SubwayValidator } from './service/subway.validator';

@Module({
  imports: [],
  controllers: [HealthController, SubwayController],
  providers: [
    LogService,
    ConsoleLogWriter,
    FileLogWriter,
    RestApiService,
    SubwayValidator,
    SqliteConnectionManager,
    SubwayStationExtRepository,
    SubwayStationRepository,
    SubwayFirstLastTrainRepository,
    SubwayInfoService,
  ],
  exports: [LogService],
})
export class AppModule {}
