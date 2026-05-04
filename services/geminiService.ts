
import { InsuranceData } from "../types";

export const extractInsuranceData = async (fileData: { base64?: string, mimeType?: string, url?: string }): Promise<InsuranceData> => {
  try {
    const response = await fetch('/api/extract', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        fileBase64: fileData.base64, 
        mimeType: fileData.mimeType,
        url: fileData.url 
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Lỗi máy chủ proxy");
    }

    return await response.json() as InsuranceData;
  } catch (e: any) {
    console.error("Frontend Proxy Error:", e);
    throw new Error(e.message || "Không thể kết nối với dịch vụ trích xuất.");
  }
};
