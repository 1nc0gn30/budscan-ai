import { GoogleGenAI, Type } from '@google/genai';

export interface ScanResult {
  quality: 'fire' | 'suspect' | 'moldy' | 'pgr';
  confidence: number;
  details: string;
  terpenes?: string[];
  visualNotes: string;
  warnings: string[];
}

export async function analyzeBud(imageBase64: string, apiKey: string): Promise<ScanResult> {
  const ai = new GoogleGenAI({ apiKey });

  const stage1Response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } },
        { text: 'Analyze this cannabis bud. Identify visual characteristics: trichome coverage, color, structure, and any suspicious signs like white fuzz (mold) or excessive brown hairs/dense structure (PGR). Provide a detailed technical description.' }
      ]
    }
  });

  const visualDescription = stage1Response.text;

  const stage2Response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } },
        { text: `Based on this image and the initial observation: "${visualDescription}", perform a critical quality assessment. Focus specifically on identifying if it's PGR (Plant Growth Regulators), Moldy, Suspect, or Fire (High Quality). Be extremely objective. List specific red flags or quality markers.` }
      ]
    }
  });

  const criticalAnalysis = stage2Response.text;

  const stage3Response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { text: `You are a professional cannabis sommelier and safety expert. Based on the following visual analysis:

Initial Scan: ${visualDescription}
Critical Analysis: ${criticalAnalysis}

Format a final report as a JSON object.
The 'quality' must be one of: 'fire', 'suspect', 'moldy', 'pgr'.
'confidence' should be a number between 0 and 1.
'details' should be a punchy, social-media-ready summary.
'visualNotes' should be a brief technical summary of what was seen.
'warnings' should be a list of safety concerns if any.
'terpenes' should be a list of likely dominant terpenes based on visual cues (if possible).` }
      ]
    },
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          quality: { type: Type.STRING, enum: ['fire', 'suspect', 'moldy', 'pgr'] },
          confidence: { type: Type.NUMBER },
          details: { type: Type.STRING },
          visualNotes: { type: Type.STRING },
          warnings: { type: Type.ARRAY, items: { type: Type.STRING } },
          terpenes: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ['quality', 'confidence', 'details', 'visualNotes', 'warnings']
      }
    }
  });

  return JSON.parse(stage3Response.text || '{}') as ScanResult;
}
