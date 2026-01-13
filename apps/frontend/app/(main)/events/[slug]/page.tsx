import { EventBanner } from '@/components/EventBanner';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  MapPin,
  Users,
  Plus,
  Share,
  Link as LinkIcon,
  Mail,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { headers } from 'next/headers';

interface EventData {
  title: string;
  description: string;
  // API currently only returns title and description
  // These fields will be available when API is updated:
  // date?: string;
  // location?: string;
  // organizerId?: string;
}

export default async function EventPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const nextHeaders = await headers();
  const response = await fetch(`http://localhost:3000/api/events/${slug}`, {
    headers: nextHeaders,
  });

  const event: EventData = await response.json();

  return (
    <main className="py-10">
      <div className="container mx-auto px-4 sm:px-10 lg:px-20">
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-start mb-12">
          {/* Left Column - Event Details */}
          <div className="lg:col-span-2">
            <EventBanner />

            <h1 className="text-4xl font-black tracking-tight mb-4">
              {event.title}
            </h1>

            <div className="flex flex-wrap gap-2 mb-8">
              <Badge className="rounded-full bg-primary/20 text-primary hover:bg-primary/30">
                Technology
              </Badge>
              <Badge className="rounded-full bg-primary/20 text-primary hover:bg-primary/30">
                Conference
              </Badge>
              <Badge className="rounded-full bg-primary/20 text-primary hover:bg-primary/30">
                Innovation
              </Badge>
              <Badge className="rounded-full bg-primary/20 text-primary hover:bg-primary/30">
                AI
              </Badge>
            </div>

            {/* Date & Time and Location */}
            <div className="flex flex-col sm:flex-row gap-8 mb-8">
              <div className="flex-1">
                <h2 className="text-xl font-bold mb-2">Date & Time</h2>
                <div className="flex items-center gap-4 min-h-14">
                  <div className="flex items-center justify-center rounded-lg bg-primary/20 shrink-0 size-10">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-base leading-normal flex-1">
                    Thursday, Oct 26, 2024, 9:00 AM - 5:00 PM EDT
                  </p>
                </div>
              </div>

              <div className="flex-1">
                <h2 className="text-xl font-bold mb-2">Location</h2>
                <div className="flex items-center gap-4 min-h-14">
                  <div className="flex items-center justify-center rounded-lg bg-primary/20 shrink-0 size-10">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-base leading-normal flex-1">
                    The Grand Tech Center, 123 Innovation Drive, Metropolis, USA
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 space-y-6">
              {/* Ticket Purchase Card */}
              <div className="border rounded-xl p-6 bg-card">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-muted-foreground">General Admission</p>
                  <p className="text-xl font-bold">Starts at $99.00</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="quantity"
                      className="text-sm font-medium mb-1 block"
                    >
                      Quantity
                    </label>
                    <select
                      id="quantity"
                      className="w-full rounded-lg border border-input bg-muted px-3 py-2 text-sm focus:border-primary focus:ring-primary"
                    >
                      {[1, 2, 3, 4, 5].map((num) => (
                        <option key={num} value={num}>
                          {num}
                        </option>
                      ))}
                    </select>
                  </div>

                  <Button className="w-full h-12 text-base font-bold">
                    Buy Tickets
                  </Button>
                </div>
              </div>

              {/* Add to Calendar & Share Card */}
              <div className="border rounded-xl p-6 bg-card">
                <button className="w-full flex items-center justify-center gap-2 text-primary text-sm font-bold mb-4">
                  <Plus className="h-4 w-4" />
                  Add to Calendar
                </button>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium">Share with friends</p>
                    <div className="flex gap-3 text-muted-foreground">
                      <button className="hover:text-primary transition-colors">
                        <Share className="h-4 w-4" />
                      </button>
                      <button className="hover:text-primary transition-colors">
                        <LinkIcon className="h-4 w-4" />
                      </button>
                      <button className="hover:text-primary transition-colors">
                        <Mail className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Organizer Card */}
              <div className="border rounded-xl p-6 bg-card">
                <h3 className="text-lg font-bold mb-4">Organizer</h3>
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold">TechVision Events</p>
                    <p className="text-sm text-muted-foreground">
                      2,458 Followers
                    </p>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  Follow
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* About and Map Section */}
        <section className="max-w-4xl mx-auto py-8 lg:py-12">
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">About this event</h2>
            <p className="text-muted-foreground leading-relaxed">
              {event.description}
            </p>
          </div>

          <div className="border-t my-8"></div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Map & Directions</h2>
            <div className="rounded-xl overflow-hidden">
              <div className="w-full h-80 bg-muted flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Map will be displayed here</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
