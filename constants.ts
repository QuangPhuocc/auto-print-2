
import { PrintableElement, InsuranceData } from './types';

export const DEFAULT_ELEMENTS: PrintableElement[] = [
  { id: '1', key: 'serialNumber', label: 'Số seri', x: 553, y: 189, fontSize: 15, fontWeight: 'bold', isVisible: true },
  { id: '2', key: 'ownerName', label: 'Tên chủ xe', x: 536, y: 211, fontSize: 18, fontWeight: 'bold', isVisible: true },
  { id: '3', key: 'address', label: 'Địa chỉ', x: 536, y: 241, fontSize: 13, fontWeight: 'bold', isVisible: true },
  { id: '4', key: 'licensePlate', label: 'Biển số xe', x: 622, y: 280, fontSize: 22, fontWeight: 'bold', isVisible: true },
  { id: '5', key: 'chassisNumber', label: 'Số khung', x: 556, y: 314, fontSize: 14, fontWeight: 'bold', isVisible: true },
  { id: '6', key: 'engineNumber', label: 'Số máy', x: 546, y: 339, fontSize: 14, fontWeight: 'bold', isVisible: true },
  { id: '7', key: 'vehicleType', label: 'Loại xe', x: 555, y: 359, fontSize: 14, fontWeight: 'bold', isVisible: true },
  { id: '8', key: 'seats', label: 'Số chỗ (TNDS)', x: 607, y: 411, fontSize: 14, fontWeight: 'bold', isVisible: true },
  { id: '9', key: 'weight', label: 'Trọng tải', x: 555, y: 384, fontSize: 14, fontWeight: 'bold', isVisible: true },
  
  // Thời hạn bảo hiểm Bắt đầu
  { id: '10h', key: 'startHour', label: 'Giờ BĐ', x: 852, y: 214, fontSize: 14, fontWeight: 'bold', isVisible: true },
  { id: '10m', key: 'startMinute', label: 'Phút BĐ', x: 899, y: 214, fontSize: 14, fontWeight: 'bold', isVisible: true },
  { id: '11d', key: 'startDay', label: 'Ngày BĐ', x: 945, y: 214, fontSize: 14, fontWeight: 'bold', isVisible: true },
  { id: '11mo', key: 'startMonth', label: 'Tháng BĐ', x: 1000, y: 214, fontSize: 14, fontWeight: 'bold', isVisible: true },
  { id: '11y', key: 'startYear', label: 'Năm BĐ', x: 1068, y: 214, fontSize: 14, fontWeight: 'bold', isVisible: true },
  
  // Thời hạn bảo hiểm Kết thúc
  { id: '12h', key: 'endHour', label: 'Giờ KT', x: 852, y: 238, fontSize: 14, fontWeight: 'bold', isVisible: true },
  { id: '12m', key: 'endMinute', label: 'Phút KT', x: 899, y: 238, fontSize: 14, fontWeight: 'bold', isVisible: true },
  { id: '13d', key: 'endDay', label: 'Ngày KT', x: 945, y: 238, fontSize: 14, fontWeight: 'bold', isVisible: true },
  { id: '13mo', key: 'endMonth', label: 'Tháng KT', x: 1000, y: 238, fontSize: 14, fontWeight: 'bold', isVisible: true },
  { id: '13y', key: 'endYear', label: 'Năm KT', x: 1068, y: 238, fontSize: 14, fontWeight: 'bold', isVisible: true },

  // Phí bảo hiểm TNDS (Có VAT)
  { id: '14', key: 'fee', label: 'Phí TNDS (Tổng)', x: 988, y: 302, fontSize: 10, fontWeight: 'bold', isVisible: true },
  
  // Các ô đánh dấu x (Kinh doanh, Không KD, Đại lý)
  { id: 'biz', key: 'isBusiness', label: 'Kinh doanh', x: 552, y: 462, fontSize: 16, fontWeight: 'bold', isVisible: true },
  { id: 'nobiz', key: 'isNotBusiness', label: 'Không Kinh doanh', x: 720, y: 462, fontSize: 16, fontWeight: 'bold', isVisible: true },
  { id: 'agent', key: 'isAgent', label: 'Đại lý', x: 861, y: 394, fontSize: 16, fontWeight: 'bold', isVisible: true },

  // Ngày cấp
  { id: 'issue_d', key: 'issueDay', label: 'Ngày cấp', x: 973, y: 434, fontSize: 13, fontWeight: 'bold', isVisible: true },
  { id: 'issue_m', key: 'issueMonth', label: 'Tháng cấp', x: 1020, y: 434, fontSize: 13, fontWeight: 'bold', isVisible: true },
  { id: 'issue_y', key: 'issueYear', label: 'Năm cấp', x: 1086, y: 434, fontSize: 13, fontWeight: 'bold', isVisible: true },

  // Bảo hiểm tai nạn
  { id: '16', key: 'accidentSeats', label: 'Số chỗ TN', x: 325, y: 293, fontSize: 14, fontWeight: 'bold', isVisible: true },
  { id: '17', key: 'accidentAmount', label: 'Mức TN (Triệu)', x: 281, y: 325, fontSize: 14, fontWeight: 'bold', isVisible: true },
  { id: '18', key: 'accidentFee', label: 'Phí TN', x: 294, y: 359, fontSize: 14, fontWeight: 'bold', isVisible: true },
  
  // Gạch chéo
  { id: 'strikeLine', key: 'accidentFee', label: 'Gạch chéo', x: 359, y: 214, fontSize: 0, fontWeight: 'bold', isVisible: true },

  { id: '20', key: 'qrCode', label: 'Mã QR', x: 324, y: 540, fontSize: 0, size: 80, fontWeight: 'bold', isVisible: true },
];

export const EMPTY_INSURANCE: InsuranceData = {
  qrCode: '',
  serialNumber: '',
  ownerName: '',
  address: '',
  licensePlate: '',
  chassisNumber: '',
  engineNumber: '',
  vehicleType: '',
  weight: '',
  seats: '',
  purpose: '',
  startHour: '',
  startMinute: '00',
  startDay: '',
  startMonth: '',
  startYear: '',
  endHour: '',
  endMinute: '00',
  endDay: '',
  endMonth: '',
  endYear: '',
  fee: '',
  issueDay: '',
  issueMonth: '',
  issueYear: '',
  accidentSeats: '',
  accidentAmount: '',
  accidentFee: '',
};

export const LABEL_MAP: Record<string, string> = {
  serialNumber: 'Số seri',
  ownerName: 'Tên chủ xe',
  address: 'Địa chỉ',
  licensePlate: 'Biển số xe',
  chassisNumber: 'Số khung',
  engineNumber: 'Số máy',
  vehicleType: 'Loại xe',
  weight: 'Trọng tải',
  seats: 'Số chỗ ngồi',
  purpose: 'Mục đích sử dụng',
  startHour: 'Giờ BĐ',
  startMinute: 'Phút BĐ',
  startDay: 'Ngày BĐ',
  startMonth: 'Tháng BĐ',
  startYear: 'Năm BĐ',
  endHour: 'Giờ KT',
  endMinute: 'Phút KT',
  endDay: 'Ngày KT',
  endMonth: 'Tháng KT',
  endYear: 'Năm KT',
  fee: 'Phí TNDS (VAT)',
  issueDay: 'Ngày cấp',
  issueMonth: 'Tháng cấp',
  issueYear: 'Năm cấp',
  accidentSeats: 'Số chỗ (TN)',
  accidentAmount: 'Mức tiền (TN)',
  accidentFee: 'Tổng phí (TN)',
  qrCode: 'Nội dung mã QR',
  isBusiness: 'Dấu x Kinh doanh',
  isNotBusiness: 'Dấu x Không KD',
  isAgent: 'Dấu x Đại lý'
};
