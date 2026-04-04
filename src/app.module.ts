import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LogService } from './common/logger/log.service';
import { ConsoleLogWriter } from './common/logger/writer/console.log-writer';
import { FileLogWriter } from './common/logger/writer/file.log-writer';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, LogService, ConsoleLogWriter, FileLogWriter],
  exports: [LogService],
})
export class AppModule {}
