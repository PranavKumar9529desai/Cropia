import { useEffect, useState } from "react";
import { Brain, Scan, AlertTriangle, FileText, Loader2 } from "lucide-react";
import { Card, CardContent } from "@repo/ui/components/card";
import { Progress } from "@repo/ui/components/progress";

interface AnalysisLoaderProps {
    jurisdiction: string;
    onComplete?: () => void;
}

export default function AnalysisLoader({ jurisdiction, onComplete }: AnalysisLoaderProps) {
    const [progress, setProgress] = useState(0);
    const [step, setStep] = useState(0);

    const steps = [
        {
            title: "Initializing Agent",
            description: `Connecting to Cropia Neural Network...`,
            icon: Brain,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
            border: "border-blue-500/20"
        },
        {
            title: "Scanning Region",
            description: `Analyzing recent scans in ${jurisdiction}...`,
            icon: Scan,
            color: "text-purple-500",
            bg: "bg-purple-500/10",
            border: "border-purple-500/20"
        },
        {
            title: "Detecting Anomalies",
            description: "Identifying potential crop stress and disease patterns...",
            icon: AlertTriangle,
            color: "text-orange-500",
            bg: "bg-orange-500/10",
            border: "border-orange-500/20"
        },
        {
            title: "Generating Insights",
            description: "Compiling health scores and actionable report...",
            icon: FileText,
            color: "text-green-500",
            bg: "bg-green-500/10",
            border: "border-green-500/20"
        }
    ];

    useEffect(() => {
        const duration = 10000; // 10 seconds total
        const intervalTime = 50;
        const stepsCount = duration / intervalTime;
        let currentStep = 0;

        const timer = setInterval(() => {
            currentStep++;
            const newProgress = Math.min((currentStep / stepsCount) * 100, 100);
            setProgress(newProgress);

            // Calculate current step index (0-3) based on progress
            // 0-25% -> 0, 25-50% -> 1, 50-75% -> 2, 75-100% -> 3
            const calculatedStep = Math.min(Math.floor(newProgress / 25), 3);
            if (newProgress >= 100) {
                // Keep at step 3 when done
            } else {
                setStep(calculatedStep);
            }

            if (currentStep >= stepsCount) {
                clearInterval(timer);
                if (onComplete) {
                    setTimeout(onComplete, 500); // Small buffer before finishing
                }
            }
        }, intervalTime);

        return () => clearInterval(timer);
    }, [onComplete]);

    const currentStepData = steps[step] || steps[3];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm animate-in fade-in duration-300">
            <Card className="w-full max-w-xl mx-4 border  bg-transparent border-none">
                <CardContent className="p-8 md:p-12 flex flex-col items-center text-center space-y-8">

                    {/* Dynamic Icon Ring */}
                    <div className="relative">
                        <div className={`absolute inset-0 rounded-full animate-ping opacity-20 ${currentStepData.bg.replace('/10', '/30')}`}></div>
                        <div className={`h-24 w-24 rounded-full ${currentStepData.bg} ${currentStepData.border} border-4 flex items-center justify-center transition-all duration-500 transform scale-100`}>
                            <currentStepData.icon className={`h-10 w-10 ${currentStepData.color} transition-all duration-500`} />
                        </div>
                        <div className="absolute -bottom-2 -right-2 h-8 w-8 bg-background rounded-full flex items-center justify-center border shadow-sm">
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        </div>
                    </div>

                    <div className="space-y-2 max-w-md animate-in fade-in slide-in-from-bottom-2 duration-500 key={step}">
                        <h2 className="text-2xl font-bold tracking-tight">{currentStepData.title}</h2>
                        <p className="text-muted-foreground text-sm font-medium animate-pulse">
                            {currentStepData.description}
                        </p>
                    </div>

                    <div className="w-full space-y-2">
                        <Progress value={progress} className="h-2" />
                        <div className="flex justify-between text-[10px] text-muted-foreground font-mono uppercase tracking-widest">
                            <span>Process: {Math.round(progress)}%</span>
                            <span>Est. Time: {Math.max(0, 10 - (progress / 10)).toFixed(1)}s</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2 w-full pt-4 opacity-50">
                        {steps.map((s, i) => (
                            <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i <= step ? s.color.replace('text-', 'bg-') : 'bg-muted'}`} />
                        ))}
                    </div>

                </CardContent>
            </Card>
        </div>
    );
}
