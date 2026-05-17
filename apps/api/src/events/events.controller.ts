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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiCookieAuth,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('Events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  // ── Authenticated routes ─────────────────────────────────────────────────────

  @ApiOperation({ summary: 'Create a new event' })
  @ApiCookieAuth()
  @ApiResponse({ status: 201, description: 'Event created successfully' })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@CurrentUser() user: JwtUser, @Body() dto: CreateEventDto) {
    return this.eventsService.create(user.sub, user.role, dto);
  }

  @ApiOperation({ summary: 'Get events created by the authenticated user' })
  @ApiCookieAuth()
  @ApiResponse({
    status: 200,
    description: "Paginated list of the user's events (all statuses)",
  })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @UseGuards(JwtAuthGuard)
  @Get('my-events')
  findMyEvents(@CurrentUser() user: JwtUser, @Query() query: QueryEventsDto) {
    return this.eventsService.findMyEvents(user.sub, query);
  }

  @ApiOperation({ summary: 'Update an event' })
  @ApiCookieAuth()
  @ApiParam({ name: 'id', description: 'Event ID' })
  @ApiResponse({ status: 200, description: 'Event updated successfully' })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({ status: 403, description: 'Not the event owner or admin' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: JwtUser,
    @Body() dto: UpdateEventDto,
  ) {
    return this.eventsService.update(id, user.sub, user.role, dto);
  }

  @ApiOperation({ summary: 'Publish an event (organizer/admin only)' })
  @ApiCookieAuth()
  @ApiParam({ name: 'id', description: 'Event ID' })
  @ApiResponse({ status: 200, description: 'Event published successfully' })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({
    status: 403,
    description: 'Only organizers or admins can publish events',
  })
  @ApiResponse({ status: 404, description: 'Event not found' })
  @UseGuards(JwtAuthGuard)
  @Patch(':id/publish')
  publish(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.eventsService.publish(id, user.sub, user.role);
  }

  @ApiOperation({ summary: 'Soft delete an event' })
  @ApiCookieAuth()
  @ApiParam({ name: 'id', description: 'Event ID' })
  @ApiResponse({ status: 200, description: 'Event deleted successfully' })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({ status: 403, description: 'Not the event owner or admin' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.eventsService.remove(id, user.sub, user.role);
  }

  // ── Attendee routes ──────────────────────────────────────────────────────────

  @ApiOperation({ summary: 'Register for an event' })
  @ApiCookieAuth()
  @ApiParam({ name: 'id', description: 'Event ID' })
  @ApiResponse({
    status: 201,
    description: 'Successfully registered for the event',
  })
  @ApiResponse({
    status: 400,
    description: 'Event not published or at full capacity',
  })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({
    status: 409,
    description: 'Already registered for this event',
  })
  @UseGuards(JwtAuthGuard)
  @Post(':id/register')
  register(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.eventsService.register(id, user.sub);
  }

  @ApiOperation({ summary: 'Cancel registration for an event' })
  @ApiCookieAuth()
  @ApiParam({ name: 'id', description: 'Event ID' })
  @ApiResponse({
    status: 200,
    description: 'Registration cancelled successfully',
  })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({ status: 404, description: 'Registration not found' })
  @UseGuards(JwtAuthGuard)
  @Delete(':id/register')
  cancelRegistration(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.eventsService.cancelRegistration(id, user.sub);
  }

  @ApiOperation({
    summary: 'Get attendees for an event (organizer/admin only)',
  })
  @ApiCookieAuth()
  @ApiParam({ name: 'id', description: 'Event ID' })
  @ApiResponse({ status: 200, description: 'List of event attendees' })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({ status: 403, description: 'Not the event owner or admin' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  @UseGuards(JwtAuthGuard)
  @Get(':id/attendees')
  getAttendees(@Param('id') id: string, @CurrentUser() user: JwtUser) {
    return this.eventsService.getAttendees(id, user.sub, user.role);
  }

  // ── Public routes ────────────────────────────────────────────────────────────

  @ApiOperation({ summary: 'List all published events' })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of published events',
  })
  @Get()
  findAll(@Query() query: QueryEventsDto) {
    return this.eventsService.findAll(query);
  }

  @ApiOperation({ summary: 'Get published events by a specific organizer' })
  @ApiParam({ name: 'organizerId', description: 'Organizer user ID' })
  @ApiResponse({
    status: 200,
    description: "Paginated list of the organizer's published events",
  })
  @Get('organizer/:organizerId')
  findByOrganizer(
    @Param('organizerId') organizerId: string,
    @Query() query: QueryEventsDto,
  ) {
    return this.eventsService.findByOrganizer(organizerId, query);
  }

  @ApiOperation({ summary: 'Get an event by its slug' })
  @ApiParam({ name: 'slug', description: 'Event URL slug' })
  @ApiResponse({ status: 200, description: 'Event details' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.eventsService.findBySlug(slug);
  }

  @ApiOperation({ summary: 'Get an event by ID' })
  @ApiParam({ name: 'id', description: 'Event ID' })
  @ApiResponse({ status: 200, description: 'Event details' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }
}
