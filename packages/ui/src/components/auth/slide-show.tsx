import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselPrevious,
    CarouselNext,
} from "@repo/ui/components/carousel" // Adjust import path as needed

export function HeroCarousel() {
    return (
        // 1. Container: Explicit height (e.g., h-[500px] or h-screen) is required
        <div className="relative w-full h-full">

            {/* 2. Carousel: Takes full space */}
            <Carousel className="w-full h-full">

                {/* 3. Content: Needs h-full so slides stretch */}
                <CarouselContent className="h-full ml-0">
                    {Array.from({ length: 5 }).map((_, index) => (
                        <CarouselItem key={index} className="pl-0 h-full w-full">
                            <div className="flex h-full w-full items-center justify-center bg-zinc-100 dark:bg-zinc-900">
                                <span className="text-4xl font-semibold">Slide {index + 1}</span>
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>

                {/* 4. Controls: Overriding default styles to move them to bottom corners */}

                {/* Previous: Bottom Left */}
                <CarouselPrevious
                    className="absolute left-5 bottom-4 top-auto translate-y-0 hover:bg-primary hover:text-white"
                    variant="outline"
                />

                {/* Next: Bottom Right */}
                <CarouselNext
                    className="absolute right-5 bottom-4 top-auto translate-y-0 hover:bg-primary hover:text-white"
                    variant="outline"
                />

            </Carousel>
        </div>
    )
}