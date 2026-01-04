import { Module } from '@nestjs/common';
import { DatabaseModule } from '@eventrea/nestjs-common/database';
import { EventsModule } from './events/events.module';
@Module({
  imports: [DatabaseModule, EventsModule],
})
export class AppModule {}
