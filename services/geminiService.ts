import { InsuranceData } from "../types";

/**
 * Frontend service
 * - KHÔNG chứa API KEY
 * - KHÔNG gọi Gemini trực tiếp
 * - Chỉ gọi API server (/api/extract)
 */
export const extractInsuranceData = async (
  fileBase64: string,
  mimeType: string
): Promise<InsuranceData> => {
  const response = await fetch("/api/extract", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      fileBase64,
      mimeType
    })
  });

  if (!response.ok) {
    throw new Error("Server error khi gọi AI");
  }

  const data = await response.json();
  return data as InsuranceData;
};
