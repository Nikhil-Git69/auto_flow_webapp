import { GoogleGenerativeAI } from "@google/generative-ai";
import { Issue, IssueSeverity, IssueType } from "../types";

const API_KEY = process.env.REACT_APP_GEMINI_API_KEY || "AIzaSyBeLEBuYssphBe6zJtHU9cTQH6YHIZJIns";
const genAI = new GoogleGenerativeAI(API_KEY);

const parseGeminiResponse = (text: string) => {
  try {
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) ||
      text.match(/```\n([\s\S]*?)\n```/) ||
      text.match(/{[\s\S]*?}/);

    if (!jsonMatch) throw new Error("No JSON found");

    const jsonStr = jsonMatch[1] || jsonMatch[0];
    const parsed = JSON.parse(jsonStr);

    const issues: Issue[] = (parsed.issues || []).map((issue: any, index: number) => {
      // STRICT MAPPING: Ensure AI strings match your IssueType enum keys
      let type = IssueType.STRUCTURE;
      const aiType = issue.type?.toUpperCase();
      if (aiType === 'LAYOUT') type = IssueType.LAYOUT;
      else if (aiType === 'GRAMMAR') type = IssueType.GRAMMAR;
      else if (aiType === 'ACCESSIBILITY') type = IssueType.ACCESSIBILITY;

      let severity = IssueSeverity.RECOMMENDED;
      const aiSev = issue.severity?.toUpperCase();
      if (aiSev === 'CRITICAL') severity = IssueSeverity.CRITICAL;
      else if (aiSev === 'COSMETIC') severity = IssueSeverity.COSMETIC;

      return {
        id: `gemini-${Date.now()}-${index}`,
        type,
        severity,
        description: issue.description || "Issue detected",
        suggestion: issue.suggestion || "Review this section",
        location: issue.location || `Page ${issue.pageNumber || '1'}`,
        // Ensure numbers are treated as numbers for the CSS percentages
        position: issue.position ? {
          top: Number(issue.position.top),
          left: Number(issue.position.left),
          width: Number(issue.position.width),
          height: Number(issue.position.height),
        } : undefined,
        isFixed: false
      };
    });

    return {
      score: Math.min(Math.max(Number(parsed.score), 0), 100), // Clamp 0-100
      issues: issues,
      summary: parsed.summary || "Analysis completed."
    };
  } catch (e) {
    console.error("Parsing error:", e);
    throw e;
  }
};

export const analyzeDocumentWithGemini = async (
  base64Data: string,
  mimeType: string
): Promise<{ score: number; issues: Issue[]; summary: string }> => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const pureBase64 = base64Data.includes('base64,')
      ? base64Data.split('base64,')[1]
      : base64Data;

    // STRICT PROMPT: Forces the AI to find errors and use coordinates
    const prompt = `
      You are a strict Document QA Auditor. 
      Analyze this ${mimeType} for errors in Layout, Grammar, Accessibility, and Structure.
      
      IMPORTANT:
      1. Be highly critical. If there are minor alignment issues or grammar slips, deduct points from the score.
      2. For every issue, you MUST provide "position" coordinates {top, left, width, height} as percentages (0-100) relative to the page.
      3. A score of 100 means perfection. Most documents should score between 60-90.
      
      Return ONLY JSON:
      {
        "score": number,
        "summary": "detailed summary",
        "issues": [
          {
            "type": "Layout" | "Grammar" | "Accessibility" | "Structure",
            "severity": "Critical" | "Recommended" | "Cosmetic",
            "description": "string",
            "suggestion": "string",
            "pageNumber": 1,
            "position": { "top": 20.5, "left": 10.0, "width": 80.0, "height": 5.5 }
          }
        ]
      }
    `;

    const result = await model.generateContent([
      prompt,
      { inlineData: { data: pureBase64, mimeType } }
    ]);

    return parseGeminiResponse(result.response.text());

  } catch (error) {
    console.error("Gemini API error:", error);
    return getRealisticMockAnalysis(mimeType);
  }
};

const getRealisticMockAnalysis = (mimeType: string) => {
  return {
    score: 0,
    issues: [],
    summary: "The AI service is currently unavailable. Please check your API key or connection."
  };
};