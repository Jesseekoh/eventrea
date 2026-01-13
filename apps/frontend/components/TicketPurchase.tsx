'use client';

import { useState } from 'react';
import { Calendar, Link as LinkIcon, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function TicketPurchase() {
  const [quantity, setQuantity] = useState(1);
  const ticketPrice = 99.0;

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="font-medium">General Admission</div>
            <div className="text-lg font-semibold">
              Starts at ${ticketPrice.toFixed(2)}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quantity Selector */}
        <div className="space-y-2">
          <label htmlFor="quantity" className="text-sm font-medium">
            Quantity
          </label>
          <select
            id="quantity"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
              <option key={num} value={num}>
                {num}
              </option>
            ))}
          </select>
        </div>

        {/* Buy Button */}
        <Button className="w-full" size="lg">
          Buy Tickets
        </Button>

        {/* Add to Calendar */}
        <button className="flex w-full items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <Calendar className="h-4 w-4" />
          Add to Calendar
        </button>

        {/* Share with friends */}
        <div className="border-t pt-4">
          <div className="text-sm font-medium mb-3">Share with friends</div>
          <div className="flex items-center gap-3">
            <button
              className="flex items-center justify-center h-8 w-8 rounded-full hover:bg-muted transition-colors"
              aria-label="Share via link"
            >
              <LinkIcon className="h-4 w-4" />
            </button>
            <button
              className="flex items-center justify-center h-8 w-8 rounded-full hover:bg-muted transition-colors"
              aria-label="Copy link"
            >
              <LinkIcon className="h-4 w-4" />
            </button>
            <button
              className="flex items-center justify-center h-8 w-8 rounded-full hover:bg-muted transition-colors"
              aria-label="Share via email"
            >
              <Mail className="h-4 w-4" />
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
