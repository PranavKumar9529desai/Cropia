import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useCallback } from "react";
import Webcam from "react-webcam";
import { Camera, Image as ImageIcon, RotateCcw, Check } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { Card, CardContent } from "@repo/ui/components/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import { analyzeCrop } from "../../utils/agent.action";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "../../components/page-title-center";

export const Route = createFileRoute("/dashboard/scan")({
  component: ScanPage,
});

type ScanMode = "selection" | "camera" | "preview";

function ScanPage() {
  const [mode, setMode] = useState<ScanMode>("selection");
  const [image, setImage] = useState<string | null>(null);
  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  interface ImageAnalysisResponse {
    isValid: boolean;
    rejectionReason: string | null;
    metadata: {
      crop: string;
      visualIssue: string;
      description: string;
      confidence: number;
    } | null;
    generatedFilename: string | null;
  }

  const [analysisResult, setAnalysisResult] =
    useState<ImageAnalysisResponse | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleConfirm = async () => {
    if (!image) return;

    try {
      setIsAnalyzing(true);
      const result = await analyzeCrop(image);
      setAnalysisResult(result);
      setIsDialogOpen(true);
    } catch (error) {
      console.error("Analysis failed", error);
      toast.error("Failed to analyze crop. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setImage(imageSrc);
      setMode("preview");
    }
  }, [webcamRef]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setMode("preview");
      };
      reader.readAsDataURL(file);
    }
  };

  const retake = () => {
    setImage(null);
    setMode("selection");
  };

  return (
    <div className="flex flex-col h-full w-full p-4 gap-4">
      {/* <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary">Scan Crop</h1>
        {mode !== 'selection' && (
          <Button variant="ghost" size="icon" onClick={reset}>
            <X className="h-6 w-6" />
          </Button>
        )}
      </div> */}

      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md mx-auto">
        {mode === "selection" && (
          <div className="grid grid-cols-1 gap-4 w-full">
            <div className="">

              <PageHeader
                title="Scan Crop"
                subtitle="Analyze your crop health instantly"
              />
            </div>
            <Card
              className="cursor-pointer hover:bg-accent transition-colors"
              onClick={() => setMode("camera")}
            >
              <CardContent className="flex flex-col items-center justify-center p-8 gap-4">
                <div className="p-4 rounded-full bg-primary/10 text-primary">
                  <Camera className="h-12 w-12" />
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-lg">Take Photo</h3>
                  <p className="text-sm text-muted-foreground">
                    Use your camera to scan crop
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:bg-accent transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <CardContent className="flex flex-col items-center justify-center p-8 gap-4">
                <div className="p-4 rounded-full bg-primary/10 text-primary">
                  <ImageIcon className="h-12 w-12" />
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-lg">Upload from Gallery</h3>
                  <p className="text-sm text-muted-foreground">
                    Select an image from your device
                  </p>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileUpload}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {mode === "camera" && (
          <div className="relative w-full h-full flex flex-col items-center justify-center bg-black rounded-xl overflow-hidden">
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="absolute inset-0 w-full h-full object-cover"
              videoConstraints={{
                facingMode: "environment",
              }}
            />

            {/* Overlay Border */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[80%] aspect-[3/4] border-2 border-white/80 rounded-lg shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]">
                <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-primary -mt-1 -ml-1"></div>
                <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-primary -mt-1 -mr-1"></div>
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-primary -mb-1 -ml-1"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-primary -mb-1 -mr-1"></div>
              </div>
            </div>

            <div className="absolute bottom-8 left-0 right-0 flex justify-center z-10">
              <Button
                size="icon"
                className="h-16 w-16 rounded-full border-4 border-white bg-transparent hover:bg-white/20"
                onClick={capture}
              >
                <div className="h-12 w-12 rounded-full bg-white" />
              </Button>
            </div>
          </div>
        )}

        {mode === "preview" && image && (
          <div className="w-full flex flex-col gap-4">
            <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden bg-black">
              <img
                src={image}
                alt="Captured crop"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 w-full">
              <Button variant="outline" onClick={retake} className="w-full">
                <RotateCcw className="mr-2 h-4 w-4" />
                Retake
              </Button>
              <Button
                className="w-full"
                onClick={handleConfirm}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Check className="mr-2 h-4 w-4" />
                )}
                {isAnalyzing ? "Analyzing..." : "Confirm"}
              </Button>
            </div>
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle
              className={
                analysisResult?.isValid ? "text-green-600" : "text-red-600"
              }
            >
              {analysisResult?.isValid
                ? "Analysis Successful"
                : "Issue Detected"}
            </DialogTitle>
            <DialogDescription>
              Here are the results from the crop analysis.
            </DialogDescription>
          </DialogHeader>

          {analysisResult && (
            <div className="flex flex-col gap-4">
              <div
                className={`p-4 rounded-lg border ${analysisResult.isValid ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}
              >
                <h4
                  className={`font-semibold mb-1 ${analysisResult.isValid ? "text-green-800" : "text-red-800"}`}
                >
                  {analysisResult.isValid
                    ? "Valid Crop Detected"
                    : "Invalid Crop"}
                </h4>
                <p
                  className={`text-sm ${analysisResult.isValid ? "text-green-700" : "text-red-700"}`}
                >
                  {analysisResult.isValid
                    ? analysisResult.metadata?.visualIssue
                    : analysisResult.rejectionReason}
                </p>
              </div>

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Confidence Score</span>
                <span className="font-medium text-foreground">
                  {((analysisResult.metadata?.confidence || 0) * 100).toFixed(
                    1,
                  )}
                  %
                </span>
              </div>

              <Button
                onClick={() => setIsDialogOpen(false)}
                className="w-full mt-2"
              >
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
