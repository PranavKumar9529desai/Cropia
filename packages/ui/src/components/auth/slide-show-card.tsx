import * as React from "react"
import Autoplay from "embla-carousel-autoplay"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselPrevious,
    CarouselNext,
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
    // Autoplay configuration
    const plugin = React.useRef(
        Autoplay({ delay: 5000, stopOnInteraction: false })
    )

    return (
        <div className="relative w-full h-full bg-zinc-900 overflow-hidden">
            <Carousel
                plugins={[plugin.current]}
                className="w-full h-full"
                opts={{ loop: true }}
            >
                <CarouselContent className="h-full ml-0">
                    {slides.map((slide) => (
                        <CarouselItem key={slide.id} className="pl-0 h-full w-full relative">
                            {/* Image Container */}
                            <div className="flex h-full w-full items-center justify-center p-8 pb-32">
                                <img
                                    src={slide.image}
                                    alt={slide.title}
                                    className="h-full w-full object-contain drop-shadow-2xl"
                                />
                            </div>

                            {/* Glassmorphism Text Overlay */}
                            <div className="absolute bottom-20 left-0 right-0 z-10 flex justify-center px-6">
                                <div className="bg-black/40 backdrop-blur-md border border-white/10 p-6 rounded-2xl max-w-md w-full text-center shadow-lg">
                                    <h3 className="text-2xl font-bold text-white mb-2">
                                        {slide.title}
                                    </h3>
                                    <p className="text-zinc-200 text-sm font-medium">
                                        {slide.hook}
                                    </p>
                                </div>
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>

                <CarouselPrevious className="absolute left-6 bottom-6 border-white/20 bg-black/20 text-white hover:bg-white hover:text-black" />
                <CarouselNext className="absolute right-6 bottom-6 border-white/20 bg-black/20 text-white hover:bg-white hover:text-black" />
            </Carousel>
        </div>
    )
}