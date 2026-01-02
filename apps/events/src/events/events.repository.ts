import { AbstractRepository } from '@eventrea/nestjs-common';
import { Event, EventDocument } from './entities/event.entity';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class EventsRepository extends AbstractRepository<EventDocument> {
  protected readonly logger = new Logger(EventsRepository.name);

  constructor(@InjectModel(Event.name) eventModel: Model<EventDocument>) {
    super(eventModel);
  }
}
