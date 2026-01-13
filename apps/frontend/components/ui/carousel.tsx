'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

type CarouselApi = {
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: () => boolean;
  canScrollNext: () => boolean;
  scrollTo: (index: number) => void;
  selectedScrollSnap: () => number;
  scrollSnapList: () => number[];
};

type CarouselProps = {
  opts?: {
    loop?: boolean;
    align?: 'start' | 'center' | 'end';
  };
  setApi?: (api: CarouselApi) => void;
  plugins?: any[];
  orientation?: 'horizontal' | 'vertical';
  className?: string;
  children: React.ReactNode;
};

type CarouselContextProps = {
  carouselRef: React.RefObject<HTMLDivElement | null>;
  api: CarouselApi | undefined;
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
  scrollTo: (index: number) => void;
  selectedIndex: number;
  scrollSnaps: number[];
  orientation: 'horizontal' | 'vertical';
};

const CarouselContext = React.createContext<CarouselContextProps | null>(null);

function useCarousel() {
  const context = React.useContext(CarouselContext);
  if (!context) {
    throw new Error('useCarousel must be used within a <Carousel />');
  }
  return context;
}

const Carousel = React.forwardRef<HTMLDivElement, CarouselProps>(
  (
    {
      orientation = 'horizontal',
      opts = { loop: true },
      setApi,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const carouselRef = React.useRef<HTMLDivElement | null>(null);
    const [api, setInternalApi] = React.useState<CarouselApi>();
    const [canScrollPrev, setCanScrollPrev] = React.useState(false);
    const [canScrollNext, setCanScrollNext] = React.useState(false);
    const [selectedIndex, setSelectedIndex] = React.useState(0);
    const [scrollSnaps, setScrollSnaps] = React.useState<number[]>([]);

    const onSelect = React.useCallback((api: CarouselApi) => {
      if (!api) return;
      setCanScrollPrev(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());
      setSelectedIndex(api.selectedScrollSnap());
    }, []);

    const scrollPrev = React.useCallback(() => {
      api?.scrollPrev();
    }, [api]);

    const scrollNext = React.useCallback(() => {
      api?.scrollNext();
    }, [api]);

    const scrollTo = React.useCallback(
      (index: number) => {
        api?.scrollTo(index);
      },
      [api]
    );

    React.useEffect(() => {
      if (!carouselRef.current) return;

      const container = carouselRef.current;
      const slides = Array.from(
        container.querySelectorAll('[data-carousel-item]')
      );

      const carouselApi: CarouselApi = {
        scrollPrev: () => {
          const currentIndex = selectedIndex;
          const newIndex =
            currentIndex === 0 && opts.loop
              ? slides.length - 1
              : Math.max(0, currentIndex - 1);
          scrollToIndex(newIndex);
        },
        scrollNext: () => {
          const currentIndex = selectedIndex;
          const newIndex =
            currentIndex === slides.length - 1 && opts.loop
              ? 0
              : Math.min(slides.length - 1, currentIndex + 1);
          scrollToIndex(newIndex);
        },
        canScrollPrev: () => opts.loop || selectedIndex > 0,
        canScrollNext: () => opts.loop || selectedIndex < slides.length - 1,
        scrollTo: scrollToIndex,
        selectedScrollSnap: () => selectedIndex,
        scrollSnapList: () => slides.map((_, i) => i),
      };

      function scrollToIndex(index: number) {
        if (slides[index]) {
          slides[index].scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'start',
          });
          setSelectedIndex(index);
          onSelect(carouselApi);
        }
      }

      setInternalApi(carouselApi);
      setScrollSnaps(slides.map((_, i) => i));
      setApi?.(carouselApi);
      onSelect(carouselApi);
    }, [opts.loop, selectedIndex, setApi, onSelect]);

    return (
      <CarouselContext.Provider
        value={{
          carouselRef,
          api,
          scrollPrev,
          scrollNext,
          canScrollPrev,
          canScrollNext,
          scrollTo,
          selectedIndex,
          scrollSnaps,
          orientation,
        }}
      >
        <div
          ref={ref}
          className={cn('relative', className)}
          role="region"
          aria-roledescription="carousel"
          {...props}
        >
          {children}
        </div>
      </CarouselContext.Provider>
    );
  }
);
Carousel.displayName = 'Carousel';

const CarouselContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { carouselRef, orientation } = useCarousel();

  return (
    <div ref={carouselRef} className="overflow-hidden">
      <div
        ref={ref}
        className={cn(
          'flex',
          orientation === 'horizontal' ? '-ml-4' : '-mt-4 flex-col',
          className
        )}
        {...props}
      />
    </div>
  );
});
CarouselContent.displayName = 'CarouselContent';

const CarouselItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { orientation } = useCarousel();

  return (
    <div
      ref={ref}
      role="group"
      aria-roledescription="slide"
      data-carousel-item
      className={cn(
        'min-w-0 shrink-0 grow-0 basis-full',
        orientation === 'horizontal' ? 'pl-4' : 'pt-4',
        className
      )}
      {...props}
    />
  );
});
CarouselItem.displayName = 'CarouselItem';

const CarouselPrevious = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>(({ className, variant = 'outline', ...props }, ref) => {
  const { scrollPrev, canScrollPrev } = useCarousel();

  return (
    <Button
      ref={ref}
      variant={variant}
      size="icon"
      className={cn(
        'absolute h-10 w-10 rounded-full',
        'left-4 top-1/2 -translate-y-1/2',
        className
      )}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      {...props}
    >
      <ChevronLeft className="h-5 w-5" />
      <span className="sr-only">Previous slide</span>
    </Button>
  );
});
CarouselPrevious.displayName = 'CarouselPrevious';

const CarouselNext = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>(({ className, variant = 'outline', ...props }, ref) => {
  const { scrollNext, canScrollNext } = useCarousel();

  return (
    <Button
      ref={ref}
      variant={variant}
      size="icon"
      className={cn(
        'absolute h-10 w-10 rounded-full',
        'right-4 top-1/2 -translate-y-1/2',
        className
      )}
      disabled={!canScrollNext}
      onClick={scrollNext}
      {...props}
    >
      <ChevronRight className="h-5 w-5" />
      <span className="sr-only">Next slide</span>
    </Button>
  );
});
CarouselNext.displayName = 'CarouselNext';

const CarouselDots = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { scrollSnaps, selectedIndex, scrollTo } = useCarousel();

  return (
    <div
      ref={ref}
      className={cn(
        'absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2',
        className
      )}
      {...props}
    >
      {scrollSnaps.map((_, index) => (
        <button
          key={index}
          className={cn(
            'h-2 w-2 rounded-full transition-all',
            selectedIndex === index
              ? 'bg-white w-8'
              : 'bg-white/50 hover:bg-white/75'
          )}
          onClick={() => scrollTo(index)}
          aria-label={`Go to slide ${index + 1}`}
        />
      ))}
    </div>
  );
});
CarouselDots.displayName = 'CarouselDots';

export {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  CarouselDots,
};
