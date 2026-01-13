import { EventsService } from './events.service';
import {
  Get,
  Param,
  Body,
  Delete,
  Controller,
  Post,
  Patch,
  Query,
} from '@nestjs/common';
import {
  CreateEventDto,
  UpdateEventDto,
  QueryEventDto,
} from '@eventrea/nestjs-common/dto';
import { ParseObjectIdPipe } from '@eventrea/nestjs-common/pipes';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.eventsService.findBySlug(slug);
  }

  @Get()
  findAll(@Query() queryEventDto: QueryEventDto) {
    return this.eventsService.findAll(queryEventDto);
  }

  @Post()
  // @UseGuards(AuthGuard)
  create(
    @Body() createEventDto: CreateEventDto,
    @Session() session: UserSession,
  ) {
    return this.eventsService.create(createEventDto, session.user.id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() updateEventDto: UpdateEventDto,
  ) {
    return this.eventsService.update({ ...updateEventDto, id });
  }

  @Delete(':id')
  remove(@Param('id', ParseObjectIdPipe) id: string) {
    return this.eventsService.remove(id);
  }
}
