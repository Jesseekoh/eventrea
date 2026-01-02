// import { AbstractDocument } from '@repo/';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Types, HydratedDocument } from 'mongoose';

export type EventDocument = HydratedDocument<Event>;

// -------------------------------
// Enums
// -------------------------------
export enum EventStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

// -------------------------------
// Sub-Documents
// -------------------------------
export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Venue {
  name: string;
  address: string;
  city: string;
  state?: string;
  country: string;
  zipCode?: string;
  coordinates?: Coordinates;
}

// -------------------------------
// Event Schema
// -------------------------------
@Schema({
  timestamps: true,
  collection: 'events',
})
export class Event {
  @Prop({ required: true, trim: true, index: true })
  title: string;

  @Prop({ required: true, text: true })
  description: string;

  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  })
  slug: string;

  // @Prop({ required: true, index: true })
  // category: string;

  // @Prop({ type: [String], default: [], index: true })
  // tags: string[];

  // @Prop({
  //   type: {
  //     name: { type: String, required: true, trim: true },
  //     address: { type: String, required: true, trim: true },
  //     city: { type: String, required: true, trim: true },
  //     state: { type: String, trim: true },
  //     country: { type: String, required: true, trim: true },
  //     zipCode: { type: String, trim: true },
  //     coordinates: {
  //       type: {
  //         latitude: { type: Number, min: -90, max: 90 },
  //         longitude: { type: Number, min: -180, max: 180 },
  //       },
  //     },
  //   },
  //   required: true,
  //   _id: false,
  // })
  // venue: Venue;

  // @Prop({ required: true, index: true })
  // startDate: Date; // Stored in UTC

  // @Prop({ index: true })
  // endDate?: Date;

  // @Prop({ required: true })
  // timezone: string; // e.g. "Africa/Lagos"

  // @Prop({ required: true })
  // startTime: string; // "18:00"

  // @Prop()
  // endTime?: string;

  // @Prop({
  //   type: SchemaTypes.ObjectId,
  //   ref: 'User',
  //   required: true,
  //   index: true,
  // })
  // organizerId: Types.ObjectId;

  // @Prop({ trim: true })
  // organizerName?: string;

  // @Prop({ lowercase: true, trim: true })
  // contactEmail?: string;

  // @Prop({ trim: true })
  // contactPhone?: string;

  // @Prop({ trim: true })
  // website?: string;

  // @Prop()
  // coverImage?: string;

  // @Prop({ type: [String], default: [] })
  // images: string[];

  @Prop({ type: Number, min: 0, default: 0 })
  price: number;

  @Prop({ type: String, uppercase: true, default: 'NGN' })
  currency: string;

  @Prop({ type: Number, min: 1 })
  capacity?: number;

  @Prop({ type: Number, min: 0, default: 0 })
  attendeesCount: number;

  @Prop({ default: false })
  isFree: boolean;

  // // -------------------------------
  // // Status / Flags
  // // -------------------------------
  @Prop({
    type: String,
    enum: Object.values(EventStatus),
    default: EventStatus.DRAFT,
    index: true,
  })
  status: EventStatus;

  @Prop({ default: true, index: true })
  isActive: boolean;

  @Prop({ default: false, index: true })
  isOnline: boolean;

  @Prop()
  meetingUrl?: string;

  // // -------------------------------
  // // Analytics
  // // -------------------------------
  // @Prop({ type: Number, min: 0, default: 0 })
  // viewsCount: number;
}

export const EventSchema = SchemaFactory.createForClass(Event);

// -------------------------------
// Indexes
// -------------------------------
EventSchema.index({ slug: 1 }, { unique: true });
// EventSchema.index({ status: 1, startDate: 1 });
// EventSchema.index({ category: 1, status: 1 });
// EventSchema.index({ organizerId: 1, status: 1 });
// EventSchema.index({ 'venue.city': 1, startDate: 1 });
// EventSchema.index({ 'venue.country': 1, status: 1 });
// EventSchema.index({ 'venue.coordinates': '2dsphere' });
