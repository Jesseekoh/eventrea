import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto, UpdateEventDto, QueryEventsDto } from './dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import {
  CurrentUser,
  type JwtUser,
} from 'src/auth/decorators/current-user.decorator';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  // ── Authenticated routes ─────────────────────────────────────────────────────

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@CurrentUser() user: JwtUser, @Body() dto: CreateEventDto) {
    return this.eventsService.create(user.sub, user.role, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-events')
  findMyEvents(@CurrentUser() user: JwtUser, @Query() query: QueryEventsDto) {
    return this.eventsService.findMyEvents(user.sub, query);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: JwtUser,
    @Body() dto: UpdateEventDto,
  ) {
    return this.eventsService.update(id, user.sub, user.role, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/publish')
  publish(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.eventsService.publish(id, user.sub, user.role);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.eventsService.remove(id, user.sub, user.role);
  }

  // ── Attendee routes ──────────────────────────────────────────────────────────

  @UseGuards(JwtAuthGuard)
  @Post(':id/register')
  register(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.eventsService.register(id, user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/register')
  cancelRegistration(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.eventsService.cancelRegistration(id, user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/attendees')
  getAttendees(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.eventsService.getAttendees(id, user.sub, user.role);
  }

  // ── Public routes ────────────────────────────────────────────────────────────

  @Get()
  findAll(@Query() query: QueryEventsDto) {
    return this.eventsService.findAll(query);
  }

  @Get('organizer/:organizerId')
  findByOrganizer(
    @Param('organizerId') organizerId: string,
    @Query() query: QueryEventsDto,
  ) {
    return this.eventsService.findByOrganizer(organizerId, query);
  }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.eventsService.findBySlug(slug);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }
}
