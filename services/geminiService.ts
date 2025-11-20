import { GoogleGenAI, Type } from "@google/genai";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export interface BillAnalysisResult {
  totalAmount: number;
  dueDate: string;
  billingPeriod: string;
  providerName: string;
  confidenceScore: number;
}

export const analyzeElectricityBill = async (file: File): Promise<BillAnalysisResult> => {
  try {
    const base64Data = await fileToBase64(file);

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType: file.type,
                data: base64Data,
              },
            },
            {
              text: "Analyze this electricity bill image. Extract the total amount due, the due date, the billing period, and the utility provider name. Ensure high accuracy. If a field is missing, use a reasonable placeholder or 0.",
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            totalAmount: { type: Type.NUMBER, description: "The total amount to be paid." },
            dueDate: { type: Type.STRING, description: "The due date formatted as YYYY-MM-DD." },
            billingPeriod: { type: Type.STRING, description: "The month or period of the bill." },
            providerName: { type: Type.STRING, description: "Name of the electricity company." },
            confidenceScore: { type: Type.NUMBER, description: "A score from 0 to 1 indicating confidence in extraction." },
          },
          required: ["totalAmount", "dueDate", "providerName"],
        },
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as BillAnalysisResult;
    }
    
    throw new Error("No response from Gemini");

  } catch (error) {
    console.error("Error analyzing bill:", error);
    throw error;
  }
};