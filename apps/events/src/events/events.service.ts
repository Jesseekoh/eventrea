import { Injectable } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { QueryEventDto } from './dto/query-event.dto';
import { EventsRepository } from './events.repository';
import { QueryFilter } from 'mongoose';
import { EventDocument } from './entities/event.entity';
import slugify from 'slugify';
import { randomBytes } from 'crypto';

@Injectable()
export class EventsService {
  constructor(private readonly eventRepository: EventsRepository) {}
  async create(createEventDto: CreateEventDto) {
    const baseSlug = slugify(createEventDto.title, {
      lower: true,
      strict: true,
    });

    let slug = baseSlug;
    let created = false;

    while (!created) {
      try {
        // Try to create the event with the current slug
        await this.eventRepository.create({ ...createEventDto, slug });
        created = true;
      } catch (error: any) {
        // Check if error is a duplicate key error (MongoDB error code 11000)
        if (error?.code === 11000 && error?.keyValue?.slug) {
          // Generate a random string and append to base slug
          const randomString = randomBytes(4).toString('hex'); // 8 character hex string
          slug = `${baseSlug}-${randomString}`;
        } else {
          // If it's not a duplicate error, rethrow it
          throw error;
        }
      }
    }

    return 'Event created successfully';
  }

  findAll(queryEventDto: QueryEventDto) {
    const filter: QueryFilter<EventDocument> = {};

    // Exact match filters

    if (queryEventDto.status) {
      filter.status = queryEventDto.status;
    }

    if (queryEventDto.isActive !== undefined) {
      filter.isActive = queryEventDto.isActive;
    }

    if (queryEventDto.isOnline !== undefined) {
      filter.isOnline = queryEventDto.isOnline;
    }

    // Text search across title and description
    if (queryEventDto.search) {
      filter.$or = [
        { title: { $regex: queryEventDto.search, $options: 'i' } },
        { description: { $regex: queryEventDto.search, $options: 'i' } },
      ];
    }

    // Exact title match (overrides search if both provided)
    if (queryEventDto.title) {
      filter.title = { $regex: queryEventDto.title, $options: 'i' };
    }

    return this.eventRepository.find(filter);
  }

  findBySlug(slug: string) {
    return this.eventRepository.findOne({ slug });
  }

  async findOne(id: string) {
    return this.eventRepository.findOne({ _id: id });
  }

  async update(id: string, updateEventDto: UpdateEventDto) {
    await this.eventRepository.findOneAndUpdate({ _id: id }, updateEventDto);
    return 'Event updated successfully';
  }

  async remove(id: string) {
    await this.eventRepository.findOneAndDelete({ _id: id });
    return 'Event deleted successfully';
  }
}
