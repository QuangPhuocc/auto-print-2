
export interface InsuranceData {
  qrCode: string;
  serialNumber: string;
  ownerName: string;
  address: string;
  licensePlate: string;
  chassisNumber: string;
  engineNumber: string;
  vehicleType: string;
  weight: string;
  seats: string;
  purpose: string;
  // Thời hạn bảo hiểm
  startHour: string;
  startMinute: string;
  startDay: string;
  startMonth: string;
  startYear: string;
  endHour: string;
  endMinute: string;
  endDay: string;
  endMonth: string;
  endYear: string;
  fee: string;
  // Ngày cấp
  issueDay: string;
  issueMonth: string;
  issueYear: string;
  // Bảo hiểm tai nạn
  accidentSeats: string;
  accidentAmount: string;
  accidentFee: string;
}

export interface PrintableElement {
  id: string;
  key: keyof InsuranceData | 'isBusiness' | 'isNotBusiness' | 'isAgent' | 'custom';
  label: string;
  x: number;
  y: number;
  fontSize: number;
  size?: number; // Dành cho mã QR hoặc các phần tử cần kích thước riêng
  fontWeight: string;
  isVisible: boolean;
  isCustom?: boolean;
  content?: string;
}

export type TabType = 'list' | 'print';
