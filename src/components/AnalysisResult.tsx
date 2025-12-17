import { Check, X, Mail, Calendar, Copy, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { ScoreGauge } from "./ScoreGauge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface AnalysisResultProps {
  result: {
    score: number;
    summary: string;
    matchingSkills: string[];
    missingSkills: string[];
    recommendation: string;
    detailedFeedback: string;
    emailDraft?: string;
  };
}

export function AnalysisResult({ result }: AnalysisResultProps) {
  const [emailCopied, setEmailCopied] = useState(false);

  const getRecommendationStyles = () => {
    switch (result.recommendation) {
      case "Strong Interview":
        return "bg-score-excellent/15 text-score-excellent border-score-excellent/30";
      case "Interview":
        return "bg-score-good/15 text-score-good border-score-good/30";
      case "Further Review":
        return "bg-score-average/15 text-score-average border-score-average/30";
      default:
        return "bg-score-reject/15 text-score-reject border-score-reject/30";
    }
  };

  const copyEmail = () => {
    if (result.emailDraft) {
      navigator.clipboard.writeText(result.emailDraft);
      setEmailCopied(true);
      toast.success("Email draft copied to clipboard!");
      setTimeout(() => setEmailCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Score and Recommendation */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="gradient-card border-0 shadow-lg">
          <CardContent className="pt-6 flex flex-col items-center">
            <ScoreGauge score={result.score} />
          </CardContent>
        </Card>

        <Card className="gradient-card border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-lg">Recommendation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Badge
              className={`text-lg px-4 py-2 font-semibold border ${getRecommendationStyles()}`}
              variant="outline"
            >
              {result.recommendation}
            </Badge>
            <p className="text-muted-foreground leading-relaxed">{result.summary}</p>
          </CardContent>
        </Card>
      </div>

      {/* Skills Analysis */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <Check className="w-5 h-5 text-score-excellent" />
              Matching Skills
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {result.matchingSkills.length > 0 ? (
                result.matchingSkills.map((skill, i) => (
                  <Badge
                    key={i}
                    variant="secondary"
                    className="bg-score-excellent/10 text-score-excellent border-score-excellent/20 border"
                  >
                    {skill}
                  </Badge>
                ))
              ) : (
                <p className="text-muted-foreground text-sm">No matching skills identified</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <X className="w-5 h-5 text-score-reject" />
              Missing Skills
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {result.missingSkills.length > 0 ? (
                result.missingSkills.map((skill, i) => (
                  <Badge
                    key={i}
                    variant="secondary"
                    className="bg-score-reject/10 text-score-reject border-score-reject/20 border"
                  >
                    {skill}
                  </Badge>
                ))
              ) : (
                <p className="text-muted-foreground text-sm">No critical missing skills</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Feedback */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-lg">Detailed Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none text-muted-foreground">
            {result.detailedFeedback.split("\n").map((paragraph, i) => (
              <p key={i} className="mb-3 last:mb-0 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Email Draft */}
      {result.emailDraft && (
        <Card className="border shadow-sm gradient-score">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                Email Draft
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyEmail}
                  className="gap-2"
                >
                  {emailCopied ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  {emailCopied ? "Copied!" : "Copy"}
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <Calendar className="w-4 h-4" />
                  Schedule
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-card rounded-lg p-4 border shadow-inner">
              <pre className="whitespace-pre-wrap font-sans text-sm text-foreground leading-relaxed">
                {result.emailDraft}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
