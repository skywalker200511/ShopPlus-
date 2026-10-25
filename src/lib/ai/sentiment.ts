/**
 * Sentiment analysis for complaint text.
 * Uses rule-based analysis as a fallback when no AI provider is configured.
 * Designed to be replaced with a real ML model later.
 */

export interface SentimentResult {
  sentiment: "positive" | "neutral" | "negative";
  confidence: number;
  explanation: string;
  method: "rule-based" | "ai-model";
}

const NEGATIVE_WORDS = [
  "angry", "furious", "terrible", "awful", "worst", "horrible", "unacceptable",
  "frustrated", "disappointed", "broken", "failed", "useless", "scam", "fraud",
  "never", "hate", "disgusted", "outraged", "ridiculous", "incompetent",
  "unprofessional", "pathetic", "annoying", "damaged", "defective", "wrong",
  "slow", "rude", "ignored", "waiting", "still", "again", "refund", "cancel",
];

const POSITIVE_WORDS = [
  "thank", "thanks", "great", "excellent", "amazing", "wonderful", "helpful",
  "appreciate", "happy", "satisfied", "resolved", "fixed", "good", "love",
  "perfect", "awesome", "fantastic", "pleased", "grateful", "impressive",
  "outstanding", "professional", "quick", "efficient", "recommend",
];

export function analyzeSentiment(text: string): SentimentResult {
  const lower = text.toLowerCase();
  const words = lower.split(/\s+/);

  let negScore = 0;
  let posScore = 0;
  const matchedNeg: string[] = [];
  const matchedPos: string[] = [];

  for (const word of words) {
    const cleanWord = word.replace(/[^a-z]/g, "");
    if (NEGATIVE_WORDS.includes(cleanWord)) {
      negScore++;
      if (!matchedNeg.includes(cleanWord)) matchedNeg.push(cleanWord);
    }
    if (POSITIVE_WORDS.includes(cleanWord)) {
      posScore++;
      if (!matchedPos.includes(cleanWord)) matchedPos.push(cleanWord);
    }
  }

  // Check for intensifiers
  if (lower.includes("!!!") || lower.includes("???")) negScore += 0.5;
  if (lower.toUpperCase() === lower && lower.length > 20) negScore += 0.5;

  const total = negScore + posScore;
  if (total === 0) {
    return {
      sentiment: "neutral",
      confidence: 0.5,
      explanation: "No strong sentiment indicators found in the text.",
      method: "rule-based",
    };
  }

  const negRatio = negScore / total;
  const posRatio = posScore / total;

  if (negRatio > 0.6) {
    return {
      sentiment: "negative",
      confidence: Math.min(0.95, 0.5 + negScore * 0.1),
      explanation: `Negative language detected: ${matchedNeg.slice(0, 4).join(", ")}. ${negScore} negative indicator(s) vs ${posScore} positive.`,
      method: "rule-based",
    };
  }

  if (posRatio > 0.6) {
    return {
      sentiment: "positive",
      confidence: Math.min(0.95, 0.5 + posScore * 0.1),
      explanation: `Positive language detected: ${matchedPos.slice(0, 4).join(", ")}. ${posScore} positive indicator(s) vs ${negScore} negative.`,
      method: "rule-based",
    };
  }

  return {
    sentiment: "neutral",
    confidence: 0.4,
    explanation: `Mixed signals: ${matchedPos.length} positive and ${matchedNeg.length} negative indicators found.`,
    method: "rule-based",
  };
}
