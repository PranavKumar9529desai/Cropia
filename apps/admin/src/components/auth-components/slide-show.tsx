import { SlideShowCard } from "@repo/ui/components/auth/slide-show-card";


const SLIDES = [
    {
        id: 1,
        image: import.meta.env.VITE_SLIDE_1,
        title: "Instant Crop Diagnosis",
        hook: "Identify diseases in seconds with lab-grade AI precision."
    },
    {
        id: 2,
        image: import.meta.env.VITE_SLIDE_2,
        title: "Smart Decision Support",
        hook: "Know exactly when to spray and irrigate to save resources."
    },
    {
        id: 3,
        image: import.meta.env.VITE_SLIDE_3,
        title: "Your Personal Agri-Expert",
        hook: "Track health history and get instant advice, 24/7."
    }
];

export function SlideShow() {

    return (
        <SlideShowCard slides={SLIDES} />
    );
}