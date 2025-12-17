import { useState } from "react";
import { FileText, Briefcase, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { UploadSection } from "@/components/UploadSection";
import { AnalysisResult } from "@/components/AnalysisResult";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AnalysisResultData {
  score: number;
  summary: string;
  matchingSkills: string[];
  missingSkills: string[];
  recommendation: string;
  detailedFeedback: string;
  emailDraft?: string;
}

const Index = () => {
  const [jobDescription, setJobDescription] = useState("");
  const [resume, setResume] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResultData | null>(null);

  const handleAnalyze = async () => {
    if (!jobDescription.trim() || !resume.trim()) {
      toast.error("Please provide both a job description and a resume");
      return;
    }

    setIsAnalyzing(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-resume", {
        body: { jobDescription, resume },
      });

      if (error) {
        throw new Error(error.message || "Analysis failed");
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setResult(data);
      toast.success("Analysis complete!");
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to analyze. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setJobDescription("");
    setResume("");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl gradient-hero shadow-glow">
                <Sparkles className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-display font-bold text-xl">ResuMatch AI</h1>
                <p className="text-muted-foreground text-sm">Smart Resume Analyzer</p>
              </div>
            </div>
            {result && (
              <Button variant="outline" onClick={handleReset}>
                New Analysis
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {!result ? (
          <>
            {/* Hero Section */}
            <div className="text-center mb-10 animate-fade-in">
              <h2 className="font-display text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                AI-Powered Resume Analysis
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Upload a job description and resume to get instant AI analysis with match scores,
                skill assessments, and actionable recommendations.
              </p>
            </div>

            {/* Upload Cards */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <Card className="p-6 shadow-lg border-0 gradient-card animate-slide-up" style={{ animationDelay: "0.1s" }}>
                <UploadSection
                  title="Job Description"
                  placeholder="Paste the job description here...

Example:
We are looking for a Senior Software Engineer with 5+ years of experience in React, TypeScript, and Node.js. The ideal candidate should have experience with cloud services (AWS/GCP), CI/CD pipelines, and agile methodologies..."
                  value={jobDescription}
                  onChange={setJobDescription}
                  icon={<Briefcase className="w-5 h-5" />}
                  mode="paste"
                />
              </Card>

              <Card className="p-6 shadow-lg border-0 gradient-card animate-slide-up" style={{ animationDelay: "0.2s" }}>
                <UploadSection
                  title="Resume / CV"
                  placeholder="Upload the candidate's resume file..."
                  value={resume}
                  onChange={setResume}
                  icon={<FileText className="w-5 h-5" />}
                  mode="upload"
                />
              </Card>
            </div>

            {/* Analyze Button */}
            <div className="flex justify-center animate-slide-up" style={{ animationDelay: "0.3s" }}>
              <Button
                size="lg"
                onClick={handleAnalyze}
                disabled={isAnalyzing || !jobDescription.trim() || !resume.trim()}
                className="gradient-hero text-primary-foreground px-8 py-6 text-lg font-display font-semibold shadow-lg hover:shadow-glow transition-all duration-300 disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Analyze Match
                  </>
                )}
              </Button>
            </div>

            {/* Loading State */}
            {isAnalyzing && (
              <div className="mt-12 text-center animate-fade-in">
                <div className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-primary/5 border border-primary/20">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-foreground">AI is analyzing the documents...</p>
                    <p className="text-sm text-muted-foreground">This usually takes 10-20 seconds</p>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="animate-scale-in">
            <h2 className="font-display text-2xl font-bold mb-6">Analysis Results</h2>
            <AnalysisResult result={result} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t mt-auto py-6">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          <p>Powered by AI • Built for recruiters and hiring managers</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
