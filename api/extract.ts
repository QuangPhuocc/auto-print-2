
import { GoogleGenAI, Type } from "@google/genai";

// Always initialize GoogleGenAI with a named parameter using process.env.API_KEY directly.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
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

    const geminiResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
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

    const result = JSON.parse(geminiResponse.text || '{}');
    return res.status(200).json(result);
  } catch (error: any) {
    console.error("Extraction Error:", error);
    return res.status(500).json({ error: error.message || "Lỗi xử lý dữ liệu từ AI." });
  }
}
