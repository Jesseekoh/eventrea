'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const bannerImages = [
  '/event-banner-1.png',
  '/event-banner-2.png',
  '/event-banner-3.png',
];

export function EventBanner() {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const nextImage = () => {
    setSelectedIndex((prev) => (prev + 1) % bannerImages.length);
  };

  const prevImage = () => {
    setSelectedIndex(
      (prev) => (prev - 1 + bannerImages.length) % bannerImages.length
    );
  };

  return (
    <div className="w-full space-y-3 mb-4">
      {/* Main Image */}
      <div className="relative group aspect-video w-full overflow-hidden rounded-xl">
        <Image
          src={bannerImages[selectedIndex]}
          alt={`Event banner ${selectedIndex + 1}`}
          fill
          className="object-cover"
          priority
        />

        {/* Navigation Arrows */}
        <button
          onClick={prevImage}
          className="absolute top-1/2 left-4 -translate-y-1/2 bg-white/20 dark:bg-black/20 backdrop-blur-sm p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Previous image"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          onClick={nextImage}
          className="absolute top-1/2 right-4 -translate-y-1/2 bg-white/20 dark:bg-black/20 backdrop-blur-sm p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Next image"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      {/* Thumbnail Gallery */}
      <div className="flex overflow-x-auto gap-3 p-1">
        {bannerImages.map((image, index) => (
          <button
            key={index}
            onClick={() => setSelectedIndex(index)}
            className={cn(
              'relative w-32 h-20 shrink-0 overflow-hidden rounded-lg transition-all',
              selectedIndex === index
                ? 'ring-2 ring-primary'
                : 'opacity-70 hover:opacity-100'
            )}
            aria-label={`View image ${index + 1}`}
          >
            <Image
              src={image}
              alt={`Event thumbnail ${index + 1}`}
              fill
              className="object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
