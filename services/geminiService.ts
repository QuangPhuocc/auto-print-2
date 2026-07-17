
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
      let errorMessage = "Lỗi máy chủ proxy";
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (jsonErr) {
        try {
          const textData = await response.text();
          errorMessage = textData || `Lỗi máy chủ (Mã lỗi: ${response.status})`;
        } catch (textErr) {
          errorMessage = `Lỗi máy chủ (Mã lỗi: ${response.status})`;
        }
      }
      throw new Error(errorMessage);
    }

    try {
      return await response.json() as InsuranceData;
    } catch (parseErr) {
      throw new Error("Dữ liệu trả về từ máy chủ không hợp lệ.");
    }
  } catch (e: any) {
    console.error("Frontend Proxy Error:", e);
    throw new Error(e.message || "Không thể kết nối với dịch vụ trích xuất.");
  }
};
