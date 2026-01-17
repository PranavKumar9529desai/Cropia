import * as React from "react";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@repo/ui/components/carousel";
import { cn } from "@repo/ui/lib/utils";

// Define the shape of a single slide
export interface Slide {
  id: number;
  image: string;
  title: string;
  hook: string;
}

interface SlideShowCardProps {
  slides: Slide[];
}

export function SlideShowCard({ slides }: SlideShowCardProps) {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);

  // Autoplay configuration
  const plugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true }),
  );

  React.useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  return (
    <div className="relative w-full h-full overflow-hidden flex flex-col">
      <Carousel
        setApi={setApi}
        plugins={[plugin.current]}
        className="flex-1 w-full"
        opts={{ loop: true }}
      >
        <CarouselContent className="h-full ml-0">
          {slides.map((slide) => (
            <CarouselItem
              key={slide.id}
              className="pl-0 h-full w-full flex flex-col items-center justify-center p-8 md:p-12"
            >
              {/* Image Container with subtle floating animation feel */}
              <div className="flex-1 w-full flex items-center justify-center min-h-0 relative group">
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="max-h-[70vh] w-auto object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.15)] transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                />
              </div>

              {/* Glassmorphism Text Overlay - now consistently positioned */}
              <div className="w-full max-w-lg mt-8 mb-12">
                <div className="bg-white/80 dark:bg-card/40 backdrop-blur-xl border border-white/20 dark:border-border/50 p-8 rounded-[2rem] text-center shadow-[0_8px_32px_rgba(0,0,0,0.05)]">
                  <h3 className="text-3xl font-extrabold tracking-tight text-card-foreground mb-3">
                    {slide.title}
                  </h3>
                  <p className="text-muted-foreground text-base font-medium leading-relaxed">
                    {slide.hook}
                  </p>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {/* Pagination Dots */}
      <div className="absolute bottom-12 left-0 right-0 flex justify-center gap-3 z-20">
        {Array.from({ length: count }).map((_, index) => (
          <button
            key={index}
            onClick={() => api?.scrollTo(index)}
            className={cn(
              "h-1.5 rounded-full transition-all duration-500 focus:outline-none",
              index === current
                ? "bg-primary w-8 shadow-[0_0_10px_-2px_rgba(0,0,0,0.1)]"
                : "bg-primary/20 hover:bg-primary/40 w-4",
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
