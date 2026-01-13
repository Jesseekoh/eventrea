import { headers } from 'next/headers';
import Link from 'next/link';
export default async function EventsPage() {
  // Use the headers() helper to get the incoming request headers
  const nextHeaders = await headers();

  const response = await fetch('http://localhost:3000/api/events', {
    method: 'GET',
    headers: nextHeaders, // This passes all headers, including Cookies correctly
  });

  if (!response.ok) return <div>Failed to load events</div>;

  const data = await response.json();

  return (
    <div>
      <h1>Events</h1>
      {data.map((event: any) => (
        <Link href={`/events/${event.slug}`} key={event._id}>
          <h3>{event.title}</h3>
        </Link>
      ))}
    </div>
  );
}
