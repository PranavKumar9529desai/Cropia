import * as React from "react"
import Autoplay from "embla-carousel-autoplay"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    type CarouselApi,
} from "@repo/ui/components/carousel"

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
    const [api, setApi] = React.useState<CarouselApi>()
    const [, setCurrent] = React.useState(0)
    const [, setCount] = React.useState(0)
    // Autoplay configuration
    const plugin = React.useRef(
        Autoplay({ delay: 5000, stopOnInteraction: true })
    )

    React.useEffect(() => {
        if (!api) {
            return
        }

        setCount(api.scrollSnapList().length)
        setCurrent(api.selectedScrollSnap())

        api.on("select", () => {
            setCurrent(api.selectedScrollSnap())
        })
    }, [api])

    return (
        <div className="relative w-full h-full overflow-hidden -mt-10">
            <Carousel
                setApi={setApi}
                plugins={[plugin.current]}
                className="w-full h-full"
                opts={{ loop: true }}
            >
                <CarouselContent className="h-full ml-0 ">
                    {slides.map((slide) => (
                        <CarouselItem key={slide.id} className="pl-0 h-full w-full relative">
                            {/* Image Container */}
                            <div className="flex h-full w-full items-center justify-center p-8 pb-40  ">
                                <img
                                    src={slide.image}
                                    alt={slide.title}
                                    className="h-full w-full object-contain drop-shadow-2xl"
                                />
                            </div>

                            {/* Glassmorphism Text Overlay */}
                            <div className="absolute bottom-24 left-0 right-0 z-10 flex justify-center px-6">
                                <div className="bg-card/60 backdrop-blur-md border border-border/50 p-6 rounded-2xl max-w-md w-full text-center shadow-lg">
                                    <h3 className="text-2xl font-bold text-card-foreground mb-2">
                                        {slide.title}
                                    </h3>
                                    <p className="text-muted-foreground text-sm font-medium">
                                        {slide.hook}
                                    </p>
                                </div>
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>

                {/* Pagination Dots */}
                {/* <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-2 z-20 ">
                    {Array.from({ length: count }).map((_, index) => (
                        <button
                            key={index}
                            onClick={() => api?.scrollTo(index)}
                            className={cn(
                                "h-2 w-2 rounded-full transition-all duration-300 focus:outline-none",
                                index === current
                                    ? "bg-primary w-6"
                                    : "bg-primary hover:bg-primary/50"
                            )}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div> */}
            </Carousel>
        </div>
    )
}