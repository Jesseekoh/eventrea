import { Controller, Body } from '@nestjs/common';

import { EventsService } from './events.service';
import {
  CreateEventDto,
  UpdateEventDto,
  FindEventDto,
  QueryEventDto,
} from '@eventrea/nestjs-common';
import { MessagePattern } from '@nestjs/microservices';
import { Payload } from '@nestjs/microservices';
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @MessagePattern('events.findBySlug')
  findBySlug(@Payload() dto: FindEventDto) {
    return this.eventsService.findBySlug(dto.slug);
  }

  @MessagePattern('events.findAll')
  findAll(@Payload() dto: QueryEventDto) {
    return this.eventsService.findAll(dto);
  }

  @MessagePattern('events.create')
  create(@Payload() dto: CreateEventDto) {
    console.log(dto);
    return this.eventsService.create(dto);
  }

  @MessagePattern('events.update')
  update(@Payload() dto: UpdateEventDto) {
    if (!dto.id) {
      throw new Error('Event ID is required for update');
    }
    return this.eventsService.update(dto.id, dto);
  }

  @MessagePattern('events.remove')
  remove(@Payload() id: string) {
    return this.eventsService.remove(id);
  }
}
