import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { DatabaseModule } from '@eventrea/nestjs-common/database';
import { Event, EventSchema } from './entities/event.entity';
import { EventsRepository } from './events.repository';

@Module({
  imports: [
    DatabaseModule.forFeature([{ name: Event.name, schema: EventSchema }]),
  ],
  controllers: [EventsController],
  providers: [EventsService, EventsRepository],
})
export class EventsModule {}
