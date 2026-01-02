import { Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import {
  CreateEventDto,
  QueryEventDto,
  UpdateEventDto,
} from '@eventrea/nestjs-common';
@Injectable()
export class EventsService {
  constructor(
    @Inject('EVENTS_SERVICE') private readonly eventClient: ClientProxy,
  ) {}
  findBySlug(slug: string) {
    return this.eventClient.send('events.findBySlug', { slug });
  }

  findAll(queryEventDto: QueryEventDto) {
    return this.eventClient.send('events.findAll', queryEventDto);
  }
  create(createEventDto: CreateEventDto) {
    return this.eventClient.send('events.create', createEventDto);
  }

  update(updateEventDto: UpdateEventDto) {
    return this.eventClient.send('events.update', updateEventDto);
  }

  remove(id: string) {
    return this.eventClient.send('events.remove', id);
  }
}
