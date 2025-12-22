import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { apiClient } from "../../lib/rpc";
import AreaScanHeader from "../../components/area-scan/area-scan-header";
import AreaScanResults from "../../components/area-scan/area-scan-results";
import { toast } from "sonner";

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

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    toast.info("AI Agent is starting analysis...", {
      description: "This might take 10-15 seconds as it processes regional scan data."
    });

    try {
      const res = await apiClient.api.admin.analysis.run.$post();
      const data = await res.json();

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
        <AreaScanResults analysis={analysis} />
      </div>
    </div>
  );
}
