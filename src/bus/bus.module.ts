import { HttpModule } from '@nestjs/axios';
import { Logger, Module } from '@nestjs/common';
import { BusController } from './bus.controller';
import { BusService } from './bus.service';

@Module({
  imports: [HttpModule],
  controllers: [BusController],
  providers: [BusService, Logger],
})
export class BusModule {}
