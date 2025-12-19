import type { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.API_KEY as string
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { fileBase64, mimeType } = req.body;

    if (!fileBase64 || !mimeType) {
      return res.status(400).json({ error: "Missing file data" });
    }

    const model = "gemini-3-flash-preview";

    const response = await ai.models.generateContent({
      model,
      contents: [
        {
          parts: [
            {
              text: `Hãy phân tích tài liệu bảo hiểm xe cơ giới này và trích xuất thông tin vào JSON:
1. Thời hạn: startHour, startMinute (phút), startDay, startMonth, startYear, endHour, endMinute (phút), endDay, endMonth, endYear.
2. Phí TNDS (fee): TRÍCH XUẤT TỔNG PHÍ CUỐI CÙNG (đã bao gồm thuế GTGT/VAT 10%). Tìm giá trị lớn nhất trong phần phí TNDS hoặc dòng ghi "Tổng cộng tiền phí".
3. Ngày cấp (Issue Date): issueDay, issueMonth, issueYear.
4. Tai nạn lái phụ xe: accidentSeats, accidentAmount, accidentFee.
5. Xe: serialNumber, ownerName, address, licensePlate, chassisNumber, engineNumber, vehicleType, weight, seats, purpose.
6. QR Code: Nội dung chuỗi QR.
Chỉ trả về JSON hợp lệ, không chứa văn bản thừa.`
            },
            {
              inlineData: {
                data: fileBase64,
                mimeType
              }
            }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            qrCode: { type: Type.STRING },
            serialNumber: { type: Type.STRING },
            ownerName: { type: Type.STRING },
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
            accidentFee: { type: Type.STRING }
          }
        }
      }
    });

    const text = response.text || "{}";
    const json = JSON.parse(text);

    return res.status(200).json(json);
  } catch (error) {
    console.error("Gemini error:", error);
    return res.status(500).json({ error: "Gemini processing failed" });
  }
}
