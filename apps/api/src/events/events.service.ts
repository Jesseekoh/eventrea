import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateEventDto, UpdateEventDto, QueryEventsDto } from './dto';
import { EventStatus, Prisma, Role } from '@eventrea/prisma';

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Helpers ──────────────────────────────────────────────────────────────────

  private generateSlug(title: string): string {
    const base = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
    const suffix = Math.random().toString(36).substring(2, 8);
    return `${base}-${suffix}`;
  }

  private assertOwnerOrAdmin(
    organizerId: string,
    userId: string,
    role: Role,
  ): void {
    if (organizerId !== userId && role !== Role.ADMIN) {
      throw new ForbiddenException(
        'You do not have permission to modify this event',
      );
    }
  }

  private buildPublicWhere(
    query: QueryEventsDto,
    extraWhere?: Prisma.EventWhereInput,
  ): Prisma.EventWhereInput {
    const where: Prisma.EventWhereInput = {
      deletedAt: null,
      ...extraWhere,
    };

    if (query.category) {
      where.category = query.category;
    }

    if (query.city) {
      where.city = { contains: query.city, mode: 'insensitive' };
    }

    if (query.isFree !== undefined) {
      where.isFree = query.isFree;
    }

    if (query.isOnline !== undefined) {
      where.isOnline = query.isOnline;
    }

    if (query.startDateFrom || query.startDateTo) {
      where.startDate = {};
      if (query.startDateFrom) {
        where.startDate.gte = new Date(query.startDateFrom);
      }
      if (query.startDateTo) {
        where.startDate.lte = new Date(query.startDateTo);
      }
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    return where;
  }

  private buildOrderBy(
    query: QueryEventsDto,
  ): Prisma.EventOrderByWithRelationInput {
    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder || 'desc';
    return { [sortBy]: sortOrder };
  }

  // ── CRUD ─────────────────────────────────────────────────────────────────────

  async create(userId: string, role: Role, dto: CreateEventDto) {
    // Only ORGANIZER or ADMIN can publish directly
    let status = dto.status || EventStatus.DRAFT;
    if (role === Role.USER && status !== EventStatus.DRAFT) {
      status = EventStatus.DRAFT;
    }

    const slug = this.generateSlug(dto.title);

    return this.prisma.event.create({
      data: {
        title: dto.title,
        slug,
        description: dto.description,
        category: dto.category,
        status,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        venue: dto.venue,
        address: dto.address,
        city: dto.city,
        country: dto.country,
        isOnline: dto.isOnline,
        onlineUrl: dto.onlineUrl,
        capacity: dto.capacity,
        price: dto.price,
        currency: dto.currency,
        isFree: dto.isFree,
        coverImage: dto.coverImage,
        organizerId: userId,
      },
    });
  }

  async findAll(query: QueryEventsDto) {
    const where = this.buildPublicWhere(query, {
      status: EventStatus.PUBLISHED,
    });
    const orderBy = this.buildOrderBy(query);
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const [events, total] = await Promise.all([
      this.prisma.event.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          organizer: {
            select: { id: true, firstName: true, lastName: true, avatar: true },
          },
          _count: { select: { attendees: true } },
        },
      }),
      this.prisma.event.count({ where }),
    ]);

    return {
      data: events,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const event = await this.prisma.event.findFirst({
      where: { id, deletedAt: null },
      include: {
        organizer: {
          select: { id: true, firstName: true, lastName: true, avatar: true },
        },
        _count: { select: { attendees: true } },
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return event;
  }

  async findBySlug(slug: string) {
    const event = await this.prisma.event.findFirst({
      where: { slug, deletedAt: null },
      include: {
        organizer: {
          select: { id: true, firstName: true, lastName: true, avatar: true },
        },
        _count: { select: { attendees: true } },
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return event;
  }

  async findByOrganizer(organizerId: string, query: QueryEventsDto) {
    const where = this.buildPublicWhere(query, {
      status: EventStatus.PUBLISHED,
      organizerId,
    });
    const orderBy = this.buildOrderBy(query);
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const [events, total] = await Promise.all([
      this.prisma.event.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          organizer: {
            select: { id: true, firstName: true, lastName: true, avatar: true },
          },
          _count: { select: { attendees: true } },
        },
      }),
      this.prisma.event.count({ where }),
    ]);

    return {
      data: events,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findMyEvents(userId: string, query: QueryEventsDto) {
    const where: Prisma.EventWhereInput = {
      deletedAt: null,
      organizerId: userId,
    };

    // Allow filtering by status for the owner's dashboard
    if (query.status) {
      where.status = query.status;
    }

    if (query.category) {
      where.category = query.category;
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const orderBy = this.buildOrderBy(query);
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const [events, total] = await Promise.all([
      this.prisma.event.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          _count: { select: { attendees: true } },
        },
      }),
      this.prisma.event.count({ where }),
    ]);

    return {
      data: events,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async update(id: string, userId: string, role: Role, dto: UpdateEventDto) {
    const event = await this.findOne(id);
    this.assertOwnerOrAdmin(event.organizerId, userId, role);

    // Users cannot publish via update
    if (role === Role.USER && dto.status && dto.status !== EventStatus.DRAFT) {
      throw new ForbiddenException('Only organizers can publish events');
    }

    const data: Prisma.EventUpdateInput = { ...dto };

    if (dto.startDate) {
      data.startDate = new Date(dto.startDate);
    }
    if (dto.endDate) {
      data.endDate = new Date(dto.endDate);
    }

    // Regenerate slug if title changes
    if (dto.title) {
      data.slug = this.generateSlug(dto.title);
    }

    return this.prisma.event.update({
      where: { id },
      data,
    });
  }

  async remove(id: string, userId: string, role: Role) {
    const event = await this.findOne(id);
    this.assertOwnerOrAdmin(event.organizerId, userId, role);

    // Soft delete
    return this.prisma.event.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async publish(id: string, userId: string, role: Role) {
    if (role === Role.USER) {
      throw new ForbiddenException('Only organizers can publish events');
    }

    const event = await this.findOne(id);
    this.assertOwnerOrAdmin(event.organizerId, userId, role);

    return this.prisma.event.update({
      where: { id },
      data: { status: EventStatus.PUBLISHED },
    });
  }

  // ── Attendees ────────────────────────────────────────────────────────────────

  async register(eventId: string, userId: string) {
    const event = await this.findOne(eventId);

    if (event.status !== EventStatus.PUBLISHED) {
      throw new BadRequestException(
        'Can only register for published events',
      );
    }

    // Check capacity
    if (event.capacity !== null) {
      const attendeeCount = await this.prisma.eventAttendee.count({
        where: { eventId, status: 'REGISTERED' },
      });
      if (attendeeCount >= event.capacity) {
        throw new BadRequestException('Event is at full capacity');
      }
    }

    // Check for existing registration
    const existing = await this.prisma.eventAttendee.findUnique({
      where: { userId_eventId: { userId, eventId } },
    });

    if (existing) {
      if (existing.status === 'CANCELLED') {
        // Re-register
        return this.prisma.eventAttendee.update({
          where: { id: existing.id },
          data: { status: 'REGISTERED' },
        });
      }
      throw new ConflictException('Already registered for this event');
    }

    return this.prisma.eventAttendee.create({
      data: { userId, eventId },
    });
  }

  async cancelRegistration(eventId: string, userId: string) {
    const attendee = await this.prisma.eventAttendee.findUnique({
      where: { userId_eventId: { userId, eventId } },
    });

    if (!attendee || attendee.status === 'CANCELLED') {
      throw new NotFoundException('Registration not found');
    }

    return this.prisma.eventAttendee.update({
      where: { id: attendee.id },
      data: { status: 'CANCELLED' },
    });
  }

  async getAttendees(eventId: string, userId: string, role: Role) {
    const event = await this.findOne(eventId);
    this.assertOwnerOrAdmin(event.organizerId, userId, role);

    return this.prisma.eventAttendee.findMany({
      where: { eventId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
