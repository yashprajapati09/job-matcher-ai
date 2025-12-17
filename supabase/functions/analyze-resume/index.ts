import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AnalysisRequest {
  jobDescription: string;
  resume: string;
}

interface AnalysisResult {
  score: number;
  summary: string;
  matchingSkills: string[];
  missingSkills: string[];
  recommendation: "Strong Interview" | "Interview" | "Further Review" | "Reject";
  detailedFeedback: string;
  emailDraft?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { jobDescription, resume }: AnalysisRequest = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (!jobDescription || !resume) {
      return new Response(
        JSON.stringify({ error: "Both job description and resume are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Analyzing resume against job description...");

    const systemPrompt = `You are an expert HR analyst and recruiter with years of experience evaluating candidates. Your task is to analyze a resume against a job description and provide a detailed, fair, and actionable assessment.

When analyzing, consider:
- Technical skills match
- Experience relevance and level
- Education and certifications
- Soft skills indicators
- Career progression
- Potential red flags or gaps

Be objective, constructive, and provide specific examples from the resume when possible.`;

    const userPrompt = `Please analyze the following resume against the job description and provide a comprehensive evaluation.

## Job Description:
${jobDescription}

## Resume:
${resume}

Provide your analysis in the following JSON format (respond ONLY with valid JSON, no other text):
{
  "score": <number between 0-100>,
  "summary": "<2-3 sentence executive summary of the candidate's fit>",
  "matchingSkills": ["<skill1>", "<skill2>", ...],
  "missingSkills": ["<skill1>", "<skill2>", ...],
  "recommendation": "<one of: 'Strong Interview', 'Interview', 'Further Review', 'Reject'>",
  "detailedFeedback": "<3-5 paragraphs of detailed analysis covering strengths, areas of concern, and specific recommendations>",
  "emailDraft": "<professional email draft to send to the candidate based on the recommendation - if Interview/Strong Interview: schedule interview; if Further Review: request more info; if Reject: polite rejection>"
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI usage limit reached. Please check your account." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No response from AI model");
    }

    console.log("AI Response received, parsing...");

    // Parse the JSON response - handle potential markdown code blocks
    let cleanedContent = content.trim();
    if (cleanedContent.startsWith("```json")) {
      cleanedContent = cleanedContent.slice(7);
    } else if (cleanedContent.startsWith("```")) {
      cleanedContent = cleanedContent.slice(3);
    }
    if (cleanedContent.endsWith("```")) {
      cleanedContent = cleanedContent.slice(0, -3);
    }
    cleanedContent = cleanedContent.trim();

    let analysis: AnalysisResult;
    try {
      analysis = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", cleanedContent);
      throw new Error("Failed to parse AI analysis response");
    }

    // Validate and sanitize the response
    analysis.score = Math.min(100, Math.max(0, Number(analysis.score) || 0));
    analysis.matchingSkills = Array.isArray(analysis.matchingSkills) ? analysis.matchingSkills : [];
    analysis.missingSkills = Array.isArray(analysis.missingSkills) ? analysis.missingSkills : [];

    console.log("Analysis complete. Score:", analysis.score, "Recommendation:", analysis.recommendation);

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in analyze-resume function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
