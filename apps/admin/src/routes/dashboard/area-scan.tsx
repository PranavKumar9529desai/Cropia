import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { apiClient } from "../../lib/rpc";
import AreaScanHeader from "../../components/area-scan/area-scan-header";
import AreaScanResults from "../../components/area-scan/area-scan-results";
import { toast } from "sonner";
import AnalysisLoader from "../../components/area-scan/analysis-loader";

export const Route = createFileRoute("/dashboard/area-scan")({
  loader: async ({ context }) => {
    try {
      const res = await apiClient.api.admin.analysis.$get();
      if (!res.ok) {
        throw new Error("Failed to fetch initial analysis");
      }
      const analysis = await res.json();
      return {
        initialAnalysis: analysis,
        jurisdiction: context.auth?.session.jurisdiction,
      };
    } catch (error) {
      console.error("Area Scan Loader Error:", error);
      return {
        initialAnalysis: null,
        jurisdiction: context.auth?.session.jurisdiction,
      };
    }
  },
  component: RouteComponent,
});


function RouteComponent() {
  const { initialAnalysis, jurisdiction } = Route.useLoaderData();
  const [analysis, setAnalysis] = useState<any>(initialAnalysis);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showLoader, setShowLoader] = useState(false);

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    setShowLoader(true);


    try {
      // Run API and minimum timer in parallel
      // TEMPORARY: Commented out API call for loader testing
      const [res] = await Promise.all([
        apiClient.api.admin.analysis.run.$post(),
        new Promise(resolve => setTimeout(resolve, 10000)) // Guarantee 10s wait
      ]);
      // await new Promise(resolve => setTimeout(resolve, 15000));

      const data = await res.json();
      // const data = { success: true, analysis: initialAnalysis }; // Mock success

      if (data.success) {
        setAnalysis(data.analysis);
        toast.success("Analysis Complete!", {
          description: "Fresh insights have been generated for your region."
        });
      } else {
        toast.error("Analysis Failed", {
          description: data.error || "Please try again later."
        });
      }
    } catch (error) {
      console.error("Run Analysis Error:", error);
      toast.error("Deep Analysis Failed", {
        description: "There was a network error or the AI service is currently unavailable."
      });
    } finally {
      setIsAnalyzing(false);
      // Loader hides via its internal completion or we can force it off here
      // But we want to keep it visible if it hasn't finished the animation visually
      // The Promise.all ensures 10s passed, so animation should be at 100%
      setShowLoader(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-7xl animate-in fade-in duration-500">
      <AreaScanHeader
        jurisdiction={jurisdiction}
        onRunAnalysis={handleRunAnalysis}
        isAnalyzing={isAnalyzing}
      />

      <div className="mt-8">
        {showLoader && (
          <AnalysisLoader jurisdiction={jurisdiction?.name || "Target Region"} />
        )}
        <AreaScanResults analysis={analysis} />
      </div>
    </div>
  );
}
