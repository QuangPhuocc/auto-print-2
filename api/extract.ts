import { GoogleGenAI, Type } from "@google/genai";

// Helper to parse multiple comma-separated keys
const getApiKeys = (): string[] => {
  const keysStr = process.env.GEMINI_API_KEYS || process.env.API_KEY || process.env.GEMINI_API_KEY || "";
  return keysStr
    .split(",")
    .map(k => k.trim())
    .filter(k => k.length > 0 && k !== "PLACEHOLDER_API_KEY");
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 1. Chặn IP nước ngoài (Qua Header của Vercel) - Hoàn toàn tự động, không hiện popup phiền phức
  const ipCountry = req.headers['x-vercel-ip-country'];
  if (ipCountry && typeof ipCountry === 'string' && ipCountry.toUpperCase() !== 'VN') {
    return res.status(403).json({ error: "Máy chủ không hợp lệ hoặc đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên." });
  }

  const { fileBase64, mimeType, url } = req.body;
  let finalBase64 = fileBase64;
  let finalMimeType = mimeType;

  try {
    // Nếu người dùng gửi URL, server sẽ tự tải file về
    if (url && !fileBase64) {
      console.log("Fetching remote PDF:", url);
      const response = await fetch(url);
      if (!response.ok) throw new Error("Không thể tải file từ link cung cấp.");
      
      const arrayBuffer = await response.arrayBuffer();
      
      const bytes = new Uint8Array(arrayBuffer);
      let binary = '';
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      finalBase64 = btoa(binary);
      finalMimeType = response.headers.get('content-type') || 'application/pdf';
    }

    if (!finalBase64) {
      return res.status(400).json({ error: 'Thiếu dữ liệu file hoặc URL' });
    }
  } catch (err: any) {
    return res.status(400).json({ error: "Quét không thành công. Vui lòng thử lại." });
  }

  const apiKeys = getApiKeys();
  if (apiKeys.length === 0) {
    return res.status(500).json({ error: "Không tìm thấy máy chủ. Vui lòng liên hệ quản trị viên." });
  }

  let lastError: any = null;
  let successResult: any = null;

  for (let idx = 0; idx < apiKeys.length; idx++) {
    const key = apiKeys[idx];
    try {
      console.log(`Trying API key index ${idx + 1} of ${apiKeys.length}`);
      
      // Luôn gán cho process.env.API_KEY để đáp ứng yêu cầu khởi tạo trực tiếp qua process.env.API_KEY
      process.env.API_KEY = key;
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

      const geminiResponse = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: {
          parts: [
            {
              text: `Hãy phân tích tài liệu bảo hiểm xe cơ giới này và trích xuất thông tin vào JSON:
              1. Thời hạn: startHour, startMinute (phút), startDay, startMonth, startYear, endHour, endMinute (phút), endDay, endMonth, endYear.
              2. Phí TNDS (fee): TRÍCH XUẤT TỔNG PHÍ CUỐI CÙNG (đã bao gồm thuế GTGT/VAT 10%). Tìm giá trị lớn nhất trong phần phí TNDS hoặc dòng ghi "Tổng cộng tiền phí".
              3. Ngày cấp (Issue Date): Trích xuất ngày, tháng, năm cấp bảo hiểm (issueDay, issueMonth, issueYear).
              4. Tai nạn lái phụ xe: accidentSeats, accidentAmount, accidentFee.
              5. Xe: serialNumber, ownerName, cccdMst (Số CCCD hoặc MST nếu có), phone (Số điện thoại nếu có), address, licensePlate, chassisNumber, engineNumber, vehicleType, weight, seats, purpose.
              6. QR Code: Nội dung chuỗi QR.
              
              QUY TẮC QUAN TRỌNG: 
              - Nếu bất kỳ thông tin nào không tìm thấy, không đọc được hoặc không có trong tài liệu, hãy để giá trị là chuỗi trống "". 
              - TUYỆT ĐỐI KHÔNG sử dụng giá trị null hoặc chuỗi "null".
              - Chỉ trả về JSON hợp lệ, không chứa văn bản thừa.`
            },
            {
              inlineData: {
                data: finalBase64,
                mimeType: finalMimeType
              }
            }
          ]
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              qrCode: { type: Type.STRING },
              serialNumber: { type: Type.STRING },
              ownerName: { type: Type.STRING },
              cccdMst: { type: Type.STRING },
              address: { type: Type.STRING },
              licensePlate: { type: Type.STRING },
              chassisNumber: { type: Type.STRING },
              engineNumber: { type: Type.STRING },
              vehicleType: { type: Type.STRING },
              weight: { type: Type.STRING },
              seats: { type: Type.STRING },
              purpose: { type: Type.STRING },
              startHour: { type: Type.STRING },
              startMinute: { type: Type.STRING },
              startDay: { type: Type.STRING },
              startMonth: { type: Type.STRING },
              startYear: { type: Type.STRING },
              endHour: { type: Type.STRING },
              endMinute: { type: Type.STRING },
              endDay: { type: Type.STRING },
              endMonth: { type: Type.STRING },
              endYear: { type: Type.STRING },
              fee: { type: Type.STRING },
              issueDay: { type: Type.STRING },
              issueMonth: { type: Type.STRING },
              issueYear: { type: Type.STRING },
              accidentSeats: { type: Type.STRING },
              accidentAmount: { type: Type.STRING },
              accidentFee: { type: Type.STRING },
            }
          }
        }
      });

      successResult = JSON.parse(geminiResponse.text || '{}');
      break; // Thành công thì dừng thử các khóa tiếp theo
    } catch (error: any) {
      console.error(`API key index ${idx + 1} failed:`, error);
      lastError = error;
      // Gặp lỗi (ví dụ: cạn hạn mức) thì tự động bỏ qua để chuyển sang key tiếp theo
      continue;
    }
  }

  if (successResult) {
    return res.status(200).json(successResult);
  }

  // Khi tất cả API Key đều thất bại
  let userMessage = "Quét không thành công. Vui lòng thử lại.";
  if (lastError && lastError.message) {
    userMessage = lastError.message;
    try {
      const parsed = JSON.parse(lastError.message);
      if (parsed?.error?.message) {
        userMessage = parsed.error.message;
      }
    } catch (e) {
      // Ignored
    }
  }

  // Dịch và ẩn các thông tin kỹ thuật liên quan đến AI/Gemini/Google
  const lowerMsg = userMessage.toLowerCase();
  if (
    lowerMsg.includes("prepayment") ||
    lowerMsg.includes("credits") ||
    lowerMsg.includes("exhausted") ||
    lowerMsg.includes("429")
  ) {
    userMessage = "Tính năng OCR đã quá tải. Vui lòng liên hệ quản trị viên.";
  } else if (
    lowerMsg.includes("quota") ||
    lowerMsg.includes("limit") ||
    lowerMsg.includes("too many")
  ) {
    userMessage = "Tính năng OCR đang có quá nhiều lượt truy cập. Vui lòng đợi 1-2 phút hoặc nhập tay.";
  } else if (
    lowerMsg.includes("api key") ||
    lowerMsg.includes("invalid") ||
    lowerMsg.includes("not valid") ||
    lowerMsg.includes("key")
  ) {
    userMessage = "Máy chủ không hợp lệ hoặc đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên.";
  } else if (
    lowerMsg.includes("gemini") ||
    lowerMsg.includes("google") ||
    lowerMsg.includes("ai") ||
    lowerMsg.includes("model")
  ) {
    userMessage = "Nhấn F5 để thử lại sau vài phút. Nếu không được, vui lòng liên hệ quản trị viên.";
  } else {
    userMessage = "Quét không thành công. Vui lòng thử lại.";
  }

  return res.status(500).json({ error: userMessage });
}
