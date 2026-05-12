
import { PrintableElement, InsuranceData } from './types';

export const DEFAULT_ELEMENTS_OLD: PrintableElement[] = [
  { id: '1', key: 'serialNumber', label: 'Số seri', x: 553, y: 189, fontSize: 15, fontWeight: 'bold', isVisible: true },
  { id: '2', key: 'ownerName', label: 'Tên chủ xe', x: 536, y: 211, fontSize: 14, fontWeight: 'bold', isVisible: true },
  { id: '3', key: 'address', label: 'Địa chỉ', x: 536, y: 241, fontSize: 13, fontWeight: 'bold', isVisible: true },
  { id: '3_phone', key: 'phone', label: 'Điện thoại', x: 562, y: 264, fontSize: 13, fontWeight: 'bold', isVisible: true },
  { id: '4', key: 'licensePlate', label: 'Biển số xe', x: 622, y: 280, fontSize: 18, fontWeight: 'bold', isVisible: true },
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
  { id: '11y', key: 'startYear', label: 'Năm BĐ', x: 1073, y: 214, fontSize: 14, fontWeight: 'bold', isVisible: true },
  
  // Thời hạn bảo hiểm Kết thúc
  { id: '12h', key: 'endHour', label: 'Giờ KT', x: 852, y: 238, fontSize: 14, fontWeight: 'bold', isVisible: true },
  { id: '12m', key: 'endMinute', label: 'Phút KT', x: 899, y: 238, fontSize: 14, fontWeight: 'bold', isVisible: true },
  { id: '13d', key: 'endDay', label: 'Ngày KT', x: 945, y: 238, fontSize: 14, fontWeight: 'bold', isVisible: true },
  { id: '13mo', key: 'endMonth', label: 'Tháng KT', x: 1000, y: 238, fontSize: 14, fontWeight: 'bold', isVisible: true },
  { id: '13y', key: 'endYear', label: 'Năm KT', x: 1073, y: 238, fontSize: 14, fontWeight: 'bold', isVisible: true },

  // Phí bảo hiểm TNDS (Có VAT)
  { id: '14', key: 'fee', label: 'Phí TNDS (Tổng)', x: 988, y: 302, fontSize: 10, fontWeight: 'bold', isVisible: true },
  
  // Các ô đánh dấu x (Kinh doanh, Không KD, Đại lý)
  { id: 'biz', key: 'isBusiness', label: 'Kinh doanh', x: 560, y: 460, fontSize: 16, fontWeight: 'bold', isVisible: true },
  { id: 'nobiz', key: 'isNotBusiness', label: 'Không Kinh doanh', x: 728, y: 460, fontSize: 16, fontWeight: 'bold', isVisible: true },
  { id: 'agent', key: 'isAgent', label: 'Đại lý', x: 864, y: 393, fontSize: 16, fontWeight: 'bold', isVisible: true },

  // Ngày cấp
  { id: 'issue_d', key: 'issueDay', label: 'Ngày cấp', x: 973, y: 434, fontSize: 13, fontWeight: 'bold', isVisible: true },
  { id: 'issue_m', key: 'issueMonth', label: 'Tháng cấp', x: 1020, y: 434, fontSize: 13, fontWeight: 'bold', isVisible: true },
  { id: 'issue_y', key: 'issueYear', label: 'Năm cấp', x: 1091, y: 434, fontSize: 13, fontWeight: 'bold', isVisible: true },

  // Bảo hiểm tai nạn
  { id: '16', key: 'accidentSeats', label: 'Số chỗ TN', x: 325, y: 293, fontSize: 14, fontWeight: 'bold', isVisible: true },
  { id: '17', key: 'accidentAmount', label: 'Mức TN (Triệu)', x: 281, y: 325, fontSize: 14, fontWeight: 'bold', isVisible: true },
  { id: '18', key: 'accidentFee', label: 'Phí TN', x: 294, y: 359, fontSize: 14, fontWeight: 'bold', isVisible: true },

  { id: '20', key: 'qrCode', label: 'Mã QR', x: 324, y: 540, fontSize: 0, size: 80, fontWeight: 'bold', isVisible: true },
];

export const DEFAULT_ELEMENTS_NEW: PrintableElement[] = [
  { id: '1', key: 'serialNumber', label: 'Số seri', x: 529, y: 184, fontSize: 15, fontWeight: 'bold', isVisible: true },
  { id: '2', key: 'ownerName', label: 'Tên chủ xe', x: 536, y: 209, fontSize: 14, fontWeight: 'bold', isVisible: true },
  { id: '2_cccd', key: 'cccdMst', label: 'CCCD/MST', x: 552, y: 236, fontSize: 13, fontWeight: 'bold', isVisible: true },
  { id: '3', key: 'address', label: 'Địa chỉ', x: 527, y: 261, fontSize: 11, fontWeight: 'bold', isVisible: true },
  { id: '3_phone', key: 'phone', label: 'Điện thoại', x: 560, y: 279, fontSize: 13, fontWeight: 'bold', isVisible: true },
  { id: '4', key: 'licensePlate', label: 'Biển số xe', x: 619, y: 300, fontSize: 17, fontWeight: 'bold', isVisible: true },
  { id: '5', key: 'chassisNumber', label: 'Số khung', x: 556, y: 329, fontSize: 14, fontWeight: 'bold', isVisible: true },
  { id: '6', key: 'engineNumber', label: 'Số máy', x: 546, y: 354, fontSize: 14, fontWeight: 'bold', isVisible: true },
  { id: '7', key: 'vehicleType', label: 'Loại xe', x: 555, y: 378, fontSize: 14, fontWeight: 'bold', isVisible: true },
  { id: '8', key: 'seats', label: 'Số chỗ (TNDS)', x: 592, y: 423, fontSize: 14, fontWeight: 'bold', isVisible: true },
  { id: '9', key: 'weight', label: 'Trọng tải', x: 545, y: 401, fontSize: 14, fontWeight: 'bold', isVisible: true },
  
  // Thời hạn bảo hiểm Bắt đầu
  { id: '10h', key: 'startHour', label: 'Giờ BĐ', x: 847, y: 207, fontSize: 14, fontWeight: 'bold', isVisible: true },
  { id: '10m', key: 'startMinute', label: 'Phút BĐ', x: 884, y: 207, fontSize: 14, fontWeight: 'bold', isVisible: true },
  { id: '11d', key: 'startDay', label: 'Ngày BĐ', x: 942, y: 211, fontSize: 14, fontWeight: 'bold', isVisible: true },
  { id: '11mo', key: 'startMonth', label: 'Tháng BĐ', x: 996, y: 211, fontSize: 14, fontWeight: 'bold', isVisible: true },
  { id: '11y', key: 'startYear', label: 'Năm BĐ', x: 1063, y: 211, fontSize: 14, fontWeight: 'bold', isVisible: true },
  
  // Thời hạn bảo hiểm Kết thúc
  { id: '12h', key: 'endHour', label: 'Giờ KT', x: 847, y: 231, fontSize: 14, fontWeight: 'bold', isVisible: true },
  { id: '12m', key: 'endMinute', label: 'Phút KT', x: 884, y: 231, fontSize: 14, fontWeight: 'bold', isVisible: true },
  { id: '13d', key: 'endDay', label: 'Ngày KT', x: 942, y: 235, fontSize: 14, fontWeight: 'bold', isVisible: true },
  { id: '13mo', key: 'endMonth', label: 'Tháng KT', x: 996, y: 235, fontSize: 14, fontWeight: 'bold', isVisible: true },
  { id: '13y', key: 'endYear', label: 'Năm KT', x: 1063, y: 235, fontSize: 14, fontWeight: 'bold', isVisible: true },

  // Phí bảo hiểm TNDS (Có VAT)
  { id: '14', key: 'fee', label: 'Phí TNDS (Tổng)', x: 977, y: 302, fontSize: 12, fontWeight: 'bold', isVisible: true },
  
  // Các ô đánh dấu x (Kinh doanh, Không KD, Đại lý)
  { id: 'biz', key: 'isBusiness', label: 'Kinh doanh', x: 548, y: 472, fontSize: 16, fontWeight: 'bold', isVisible: true },
  { id: 'nobiz', key: 'isNotBusiness', label: 'Không Kinh doanh', x: 716, y: 472, fontSize: 16, fontWeight: 'bold', isVisible: true },
  { id: 'agent', key: 'isAgent', label: 'Đại lý', x: 853, y: 391, fontSize: 16, fontWeight: 'bold', isVisible: true },

  // Ngày cấp
  { id: 'issue_d', key: 'issueDay', label: 'Ngày cấp', x: 963, y: 433, fontSize: 13, fontWeight: 'bold', isVisible: true },
  { id: 'issue_m', key: 'issueMonth', label: 'Tháng cấp', x: 1010, y: 433, fontSize: 13, fontWeight: 'bold', isVisible: true },
  { id: 'issue_y', key: 'issueYear', label: 'Năm cấp', x: 1078, y: 433, fontSize: 13, fontWeight: 'bold', isVisible: true },

  // Bảo hiểm tai nạn
  { id: '16', key: 'accidentSeats', label: 'Số chỗ TN', x: 325, y: 290, fontSize: 14, fontWeight: 'bold', isVisible: true },
  { id: '17', key: 'accidentAmount', label: 'Mức TN (Triệu)', x: 278, y: 322, fontSize: 14, fontWeight: 'bold', isVisible: true },
  { id: '18', key: 'accidentFee', label: 'Phí TN', x: 294, y: 355, fontSize: 14, fontWeight: 'bold', isVisible: true },

  { id: '20', key: 'qrCode', label: 'Mã QR', x: 324, y: 533, fontSize: 0, size: 80, fontWeight: 'bold', isVisible: true },
];

export const DEFAULT_ELEMENTS_CATHAY: PrintableElement[] = [
  ...DEFAULT_ELEMENTS_OLD
];

export const DEFAULT_ELEMENTS_VASS_RED: PrintableElement[] = [
  { id: '1', key: 'serialNumber', label: 'Số seri', x: 553, y: 189, fontSize: 15, fontWeight: 'bold', isVisible: false },
  { id: '2', key: 'ownerName', label: 'Tên chủ xe', x: 536, y: 211, fontSize: 14, fontWeight: 'bold', isVisible: true },
  { id: '3', key: 'address', label: 'Địa chỉ', x: 536, y: 241, fontSize: 11, fontWeight: 'bold', isVisible: true },
  { id: '3_phone', key: 'phone', label: 'Điện thoại', x: 562, y: 264, fontSize: 13, fontWeight: 'bold', isVisible: true },
  { id: '4', key: 'licensePlate', label: 'Biển số xe', x: 622, y: 280, fontSize: 18, fontWeight: 'bold', isVisible: true },
  { id: '5', key: 'chassisNumber', label: 'Số khung', x: 560, y: 310, fontSize: 14, fontWeight: 'bold', isVisible: true },
  { id: '6', key: 'engineNumber', label: 'Số máy', x: 546, y: 332, fontSize: 14, fontWeight: 'bold', isVisible: true },
  { id: '7', key: 'vehicleType', label: 'Loại xe', x: 555, y: 356, fontSize: 14, fontWeight: 'bold', isVisible: true },
  { id: '8', key: 'seats', label: 'Số chỗ (TNDS)', x: 607, y: 400, fontSize: 14, fontWeight: 'bold', isVisible: true },
  { id: '9', key: 'weight', label: 'Trọng tải', x: 555, y: 379, fontSize: 14, fontWeight: 'bold', isVisible: true },
  
  // Thời hạn bảo hiểm Bắt đầu
  { id: '10h', key: 'startHour', label: 'Giờ BĐ', x: 852, y: 208, fontSize: 14, fontWeight: 'bold', isVisible: true },
  { id: '10m', key: 'startMinute', label: 'Phút BĐ', x: 899, y: 208, fontSize: 14, fontWeight: 'bold', isVisible: true },
  { id: '11d', key: 'startDay', label: 'Ngày BĐ', x: 945, y: 208, fontSize: 14, fontWeight: 'bold', isVisible: true },
  { id: '11mo', key: 'startMonth', label: 'Tháng BĐ', x: 1000, y: 208, fontSize: 14, fontWeight: 'bold', isVisible: true },
  { id: '11y', key: 'startYear', label: 'Năm BĐ', x: 1073, y: 208, fontSize: 14, fontWeight: 'bold', isVisible: true },
  
  // Thời hạn bảo hiểm Kết thúc
  { id: '12h', key: 'endHour', label: 'Giờ KT', x: 852, y: 232, fontSize: 14, fontWeight: 'bold', isVisible: true },
  { id: '12m', key: 'endMinute', label: 'Phút KT', x: 899, y: 232, fontSize: 14, fontWeight: 'bold', isVisible: true },
  { id: '13d', key: 'endDay', label: 'Ngày KT', x: 945, y: 232, fontSize: 14, fontWeight: 'bold', isVisible: true },
  { id: '13mo', key: 'endMonth', label: 'Tháng KT', x: 1000, y: 232, fontSize: 14, fontWeight: 'bold', isVisible: true },
  { id: '13y', key: 'endYear', label: 'Năm KT', x: 1073, y: 232, fontSize: 14, fontWeight: 'bold', isVisible: true },

  // Phí bảo hiểm TNDS (Có VAT)
  { id: '14', key: 'fee', label: 'Phí TNDS (Tổng)', x: 988, y: 296, fontSize: 12, fontWeight: 'bold', isVisible: true },
  
  // Các ô đánh dấu x (Kinh doanh, Không KD, Đại lý)
  { id: 'biz', key: 'isBusiness', label: 'Kinh doanh', x: 563, y: 451, fontSize: 16, fontWeight: 'bold', isVisible: true },
  { id: 'nobiz', key: 'isNotBusiness', label: 'Không Kinh doanh', x: 731, y: 451, fontSize: 16, fontWeight: 'bold', isVisible: true },
  { id: 'agent', key: 'isAgent', label: 'Đại lý', x: 864, y: 387, fontSize: 16, fontWeight: 'bold', isVisible: true },

  // Ngày cấp
  { id: 'issue_d', key: 'issueDay', label: 'Ngày cấp', x: 973, y: 428, fontSize: 13, fontWeight: 'bold', isVisible: true },
  { id: 'issue_m', key: 'issueMonth', label: 'Tháng cấp', x: 1020, y: 428, fontSize: 13, fontWeight: 'bold', isVisible: true },
  { id: 'issue_y', key: 'issueYear', label: 'Năm cấp', x: 1091, y: 428, fontSize: 13, fontWeight: 'bold', isVisible: true },

  // Bảo hiểm tai nạn
  { id: '16', key: 'accidentSeats', label: 'Số chỗ TN', x: 325, y: 293, fontSize: 14, fontWeight: 'bold', isVisible: true },
  { id: '17', key: 'accidentAmount', label: 'Mức TN (Triệu)', x: 281, y: 325, fontSize: 14, fontWeight: 'bold', isVisible: true },
  { id: '18', key: 'accidentFee', label: 'Phí TN', x: 294, y: 359, fontSize: 14, fontWeight: 'bold', isVisible: true },

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
  cccdMst: '',
  phone: '',
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
  cccdMst: 'CCCD/MST',
  phone: 'Điện thoại',
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
