
import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { 
  FileText, 
  Printer, 
  Layout, 
  List, 
  Upload, 
  Settings,
  AlertCircle,
  Loader2,
  Edit3,
  Calendar,
  Clock,
  MousePointer2,
  Type as TypeIcon,
  PlusCircle,
  Trash2,
  Link as LinkIcon,
  Search,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Eye,
  Download
} from 'lucide-react';
import { InsuranceData, PrintableElement, TabType } from './types';
import { DEFAULT_ELEMENTS_NEW, DEFAULT_ELEMENTS_OLD, DEFAULT_ELEMENTS_VASS_RED, DEFAULT_ELEMENTS_CATHAY, EMPTY_INSURANCE, LABEL_MAP } from './constants';
import { extractInsuranceData } from './services/geminiService';
import { DraggableItem } from './components/DraggableItem';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('list');
  const [data, setData] = useState<InsuranceData>(EMPTY_INSURANCE);
  const [layouts, setLayouts] = useState<Record<string, PrintableElement[]>>(() => {
    const defaultLayouts = { 
      print_new: DEFAULT_ELEMENTS_NEW, 
      print_old: DEFAULT_ELEMENTS_OLD,
      print_vass_red: DEFAULT_ELEMENTS_VASS_RED,
      print_cathay: DEFAULT_ELEMENTS_CATHAY
    };
    try {
      const saved = localStorage.getItem('insurance_print_layouts');
      if (saved) {
        const parsed = JSON.parse(saved);
        const merged: Record<string, PrintableElement[]> = { 
          print_new: [], 
          print_old: [],
          print_vass_red: [],
          print_cathay: []
        };
        
        const processLayout = (defaults: PrintableElement[], savedItems: PrintableElement[]) => {
          if (!savedItems || !Array.isArray(savedItems)) return defaults;
          const result = defaults.map(def => {
            const found = savedItems.find((s: PrintableElement) => s.id === def.id && !s.isCustom);
            return found ? { 
              ...def, 
              x: found.x, 
              y: found.y, 
              fontSize: found.fontSize ?? def.fontSize, 
              fontFamily: found.fontFamily ?? def.fontFamily,
              fontWeight: found.fontWeight ?? def.fontWeight,
              color: found.color ?? def.color,
              isVisible: found.isVisible ?? def.isVisible, 
              size: found.size ?? def.size 
            } : def;
          });
          const customElements = savedItems.filter((s: PrintableElement) => s.isCustom);
          return [...result, ...customElements];
        };

        merged.print_new = processLayout(DEFAULT_ELEMENTS_NEW, parsed.print_new);
        merged.print_old = processLayout(DEFAULT_ELEMENTS_OLD, parsed.print_old);
        merged.print_vass_red = processLayout(DEFAULT_ELEMENTS_VASS_RED, parsed.print_vass_red);
        merged.print_cathay = processLayout(DEFAULT_ELEMENTS_CATHAY, parsed.print_cathay);
        return merged;
      }
    } catch (e) {
      console.error('Failed to load layouts:', e);
    }
    return defaultLayouts;
  });

  useEffect(() => {
    try {
      localStorage.setItem('insurance_print_layouts', JSON.stringify(layouts));
    } catch (e) {
      console.error('Failed to save layouts:', e);
    }
  }, [layouts]);
  
  const getDefaultForTab = (tabId: string) => {
    switch (tabId) {
      case 'print_new': return DEFAULT_ELEMENTS_NEW;
      case 'print_old': return DEFAULT_ELEMENTS_OLD;
      case 'print_vass_red': return DEFAULT_ELEMENTS_VASS_RED;
      case 'print_cathay': return DEFAULT_ELEMENTS_CATHAY;
      default: return DEFAULT_ELEMENTS_NEW;
    }
  };

  const activeLayoutKey = activeTab === 'list' ? 'print_new' : activeTab;
  const elements = layouts[activeLayoutKey] || getDefaultForTab(activeLayoutKey);

  const setElements = useCallback((action: React.SetStateAction<PrintableElement[]>) => {
    setLayouts(prev => ({
      ...prev,
      [activeLayoutKey]: typeof action === 'function' ? action(prev[activeLayoutKey] || getDefaultForTab(activeLayoutKey)) : action
    }));
  }, [activeLayoutKey]);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  useEffect(() => {
    setSelectedIds([]);
  }, [activeTab]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState('');
  
  const containerRef = useRef<HTMLDivElement>(null);
  
  const isEditingLayout = selectedIds.length > 0;

  const applyVehicleTypeLogic = (weightValue: string): string => {
    return weightValue && weightValue.trim() !== '' ? 'Xe tải' : 'Xe ô tô con';
  };

  /**
   * Đảm bảo các giá trị nhận được từ AI không bao giờ là null hoặc chuỗi "null"
   */
  const sanitizeData = (raw: any): InsuranceData => {
    const sanitized = { ...EMPTY_INSURANCE };
    Object.keys(EMPTY_INSURANCE).forEach((key) => {
      const val = raw[key];
      if (val === null || val === undefined || String(val).toLowerCase() === 'null') {
        (sanitized as any)[key] = '';
      } else {
        (sanitized as any)[key] = String(val);
      }
    });
    return sanitized;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = (event.target?.result as string).split(',')[1];
        try {
          const result = await extractInsuranceData({ base64, mimeType: file.type });
          const sanitized = sanitizeData(result);
          sanitized.vehicleType = applyVehicleTypeLogic(sanitized.weight);
          setData(sanitized);
        } catch (err: any) {
          setError(err.message || "Không thể trích xuất dữ liệu");
        } finally {
          setIsLoading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError("Lỗi khi đọc tệp tin.");
      setIsLoading(false);
    }
  };

  const handleUrlExtract = async () => {
    if (!pdfUrl) return;
    setIsLoading(true);
    setError(null);

    try {
      const result = await extractInsuranceData({ url: pdfUrl });
      const sanitized = sanitizeData(result);
      sanitized.vehicleType = applyVehicleTypeLogic(sanitized.weight);
      setData(sanitized);
    } catch (err: any) {
      setError(err.message || "Không thể trích xuất từ link này");
    } finally {
      setIsLoading(false);
    }
  };

  const updateElement = useCallback((id: string, updates: Partial<PrintableElement>) => {
    setElements(prev => prev.map(el => el.id === id ? { ...el, ...updates } : el));
  }, [setElements]);

  const deleteElement = (id: string) => {
    setElements(prev => prev.filter(el => el.id !== id));
    setSelectedIds(prev => prev.filter(x => x !== id));
  };

  const addCustomElement = () => {
    const newId = `custom-${Date.now()}`;
    const newElement: PrintableElement = {
      id: newId,
      key: 'custom',
      label: 'Nhãn mới',
      content: 'Nội dung...',
      x: 100,
      y: 100,
      fontSize: 16,
      fontWeight: 'bold',
      isVisible: true,
      isCustom: true
    };
    setElements(prev => [...prev, newElement]);
    setSelectedIds([newId]);
    setIsEditingLayout(true);
  };

  const handleSelect = useCallback((id: string, multi: boolean = false, toggle: boolean = false) => {
    setSelectedIds(prev => {
      if (multi) {
        return prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      }
      if (toggle && prev.includes(id) && prev.length === 1) {
        return [];
      }
      return [id];
    });
  }, []);

  // Keyboard controls for layout
  useEffect(() => {
    if (selectedIds.length === 0) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const step = e.shiftKey ? 10 : 1;
      let dx = 0;
      let dy = 0;

      if (e.key === 'ArrowUp') dy = -step;
      else if (e.key === 'ArrowDown') dy = step;
      else if (e.key === 'ArrowLeft') dx = -step;
      else if (e.key === 'ArrowRight') dx = step;
      else if (e.key === 'Delete' || e.key === 'Backspace') {
        selectedIds.forEach(id => {
          const el = elements.find(e => e.id === id);
          if (el?.isCustom) deleteElement(id);
        });
        return;
      }
      else if (e.key === 'Escape') {
        setSelectedIds([]);
        return;
      } else return;

      e.preventDefault();
      setElements(prev => prev.map(el => 
        selectedIds.includes(el.id) 
          ? { ...el, x: Math.max(0, el.x + dx), y: Math.max(0, el.y + dy) } 
          : el
      ));
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIds, elements]);

  const handlePrint = () => {
    window.print();
  };

  const handleDataChange = (key: keyof InsuranceData, value: string) => {
    setData(prev => {
      const newData = { ...prev, [key]: value };
      if (key === 'weight') newData.vehicleType = applyVehicleTypeLogic(value);
      return newData;
    });
  };

  const resetLayout = () => {
    setElements(getDefaultForTab(activeLayoutKey));
    setSelectedIds([]);
  };

  const exportLayout = () => {
    const lines = elements.map(el => {
      let text = `Nhãn: ${el.label}\n`;
      text += `Tọa độ: X: ${el.x}, Y: ${el.y}\n`;
      text += `Cỡ chữ: ${el.fontSize}px\n`;
      text += `Font chữ: ${el.fontFamily || 'Inter'}\n`;
      if (el.key === 'qrCode') text += `Kích cỡ QR: ${el.size || 0}px\n`;
      text += `Trạng thái: ${el.isVisible ? 'Hiển thị' : 'Ẩn'}`;
      return text;
    });
    const blob = new Blob([lines.join('\n\n--------------------------\n\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `layout_${activeTab}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  /**
   * Logic: Nếu nội dung QR trích xuất trống, 
   * hệ thống sẽ tự động tạo link tra cứu dựa trên Số seri.
   */
  const finalQrValue = useMemo(() => {
    if (data.qrCode && data.qrCode.trim() !== '') {
      return data.qrCode.trim();
    }
    if (data.serialNumber && data.serialNumber.trim() !== '') {
      // Đảm bảo có path /a/ ở giữa host và seri
      return `https://tracuu.vass.com.vn/a/${data.serialNumber.trim()}`;
    }
    return '';
  }, [data.qrCode, data.serialNumber]);

  const renderInput = (key: keyof InsuranceData, placeholder = "...", customLabel?: string) => (
    <div className="flex flex-col space-y-1 w-full">
      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">{customLabel || LABEL_MAP[key] || key}</label>
      <input
        type="text"
        value={data[key] || ''}
        onChange={(e) => handleDataChange(key, e.target.value)}
        className={`w-full px-4 py-2 border border-gray-100 rounded-xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-sm outline-none font-semibold ${key === 'qrCode' ? 'bg-emerald-50/50 border-emerald-100 italic text-emerald-700' : 'bg-gray-50/50'}`}
        placeholder={placeholder}
      />
    </div>
  );

  const selectedElements = elements.filter(el => selectedIds.includes(el.id));

  const getSpecialValue = (key: string) => {
    const purpose = (data.purpose || '').toLowerCase();
    if (key === 'isBusiness') {
      return (purpose.includes('kinh doanh') && !purpose.includes('không kinh doanh')) ? 'x' : '';
    }
    if (key === 'isNotBusiness') {
      return purpose.includes('không kinh doanh') ? 'x' : '';
    }
    if (key === 'isAgent') {
      return 'x';
    }
    return '';
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden relative">
      <header className="no-print bg-white border-b shrink-0 z-50">
        <div className="max-w-full mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-emerald-600 p-2.5 rounded-xl text-white shadow-sm">
              <FileText size={28} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800 leading-tight">Webapp in thẻ điện tử VASS có QR CODE nhanh</h1>
              <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">AUTO PRINT BY LEPS - V20.12.18</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2 px-6 py-2.5 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded-full cursor-pointer transition-all text-sm font-bold border border-emerald-100">
              <Upload size={18} />
              <span>UPLOAD file bảo hiểm ở đây</span>
              <input type="file" className="hidden" accept="application/pdf,image/*" onChange={handleFileUpload} />
            </label>
            <button onClick={handlePrint} className="flex items-center space-x-2 px-6 py-2.5 bg-gray-800 text-white hover:bg-gray-900 rounded-full transition-all text-sm font-bold shadow-lg shadow-gray-200 active:scale-95 border border-gray-700">
              <Printer size={18} />
              <span>In thẻ</span>
            </button>
          </div>
        </div>
      </header>

      <nav className="no-print bg-white border-b shrink-0 px-6">
        <div className="flex space-x-6">
          {[
            { id: 'list', label: 'Thông tin bảo hiểm', icon: <List size={18} /> },
            { id: 'print_new', label: 'ĐT VASS mới', icon: <Layout size={18} /> },
            { id: 'print_old', label: 'ĐT VASS cũ', icon: <Layout size={18} /> },
            { id: 'print_vass_red', label: 'VASS SERI ĐỎ', icon: <Layout size={18} /> },
            { id: 'print_cathay', label: 'CATHAY', icon: <Layout size={18} /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`py-4 px-2 font-bold text-sm flex items-center space-x-2 border-b-[3px] transition-all ${
                activeTab === tab.id ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <main className="flex-1 overflow-hidden relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-[100] flex flex-col items-center justify-center text-center">
            <div className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center border border-emerald-50 scale-110">
              <Loader2 className="animate-spin text-emerald-600 mb-4" size={48} />
              <p className="text-lg font-bold text-gray-800">Đang trích xuất dữ liệu AI...</p>
              <p className="text-xs text-gray-400 mt-2 font-medium">Vui lòng chờ trong giây lát</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[101] bg-red-50 text-red-600 px-6 py-3 rounded-2xl border border-red-100 shadow-xl flex items-center gap-3 animate-bounce">
            <AlertCircle size={20} />
            <span className="font-bold text-sm">{error}</span>
            <button onClick={() => setError(null)} className="ml-4 text-xs font-black uppercase">Đóng</button>
          </div>
        )}

        <div className="h-full w-full flex flex-col">
          <div className={`flex-1 overflow-y-auto p-6 no-print ${activeTab === 'list' ? 'block' : 'hidden'} custom-scrollbar`}>
            <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 p-8 h-fit">
              <div className="flex items-center justify-between mb-8 pb-4 border-b">
                <h3 className="text-xl font-bold text-gray-800 flex items-center space-x-3">
                  <Edit3 size={24} className="text-emerald-600" />
                  <span>UPLOAD file bảo hiểm điện tử cần in và dán link QR CODE nếu có</span>
                </h3>
                <button onClick={() => { setData(EMPTY_INSURANCE); setPdfUrl(''); }} className="px-6 py-2.5 text-xs font-bold text-[#e15252] bg-[#fdf2f2] hover:bg-[#fae6e6] rounded-xl transition-colors uppercase">Làm mới</button>
              </div>

              <div className="flex flex-col space-y-5">
                <div className="w-full">{renderInput('qrCode', 'Dữ liệu mã QR', 'QR CODE LINK')}</div>
                <div className="flex gap-4">
                  {renderInput('serialNumber')}
                  {renderInput('licensePlate')}
                </div>
                <div className="w-full">{renderInput('ownerName')}</div>
                <div className="flex gap-4">
                  {renderInput('cccdMst')}
                  {renderInput('phone')}
                </div>
                <div className="w-full">{renderInput('address')}</div>
                <div className="flex gap-4">
                  {renderInput('chassisNumber')}
                  {renderInput('engineNumber')}
                </div>
                <div className="flex gap-4">
                  {renderInput('vehicleType')}
                  {renderInput('weight')}
                  {renderInput('seats', '...', 'Số chỗ ngồi')}
                </div>
                <div className="flex gap-4">
                  {renderInput('purpose')}
                  {renderInput('fee', '...', 'Phí TNDS (Tổng có VAT)')}
                </div>

                <div className="flex items-center gap-4 p-3 bg-emerald-50/20 rounded-xl border border-emerald-100/30">
                  <div className="flex items-center gap-2 w-28 shrink-0 font-bold text-emerald-700 text-[11px] uppercase tracking-wider">
                    <Clock size={14} /> <span>Bắt đầu:</span>
                  </div>
                  {renderInput('startHour', 'Giờ')}
                  {renderInput('startMinute', 'Phút')}
                  {renderInput('startDay', 'Ngày')}
                  {renderInput('startMonth', 'Tháng')}
                  {renderInput('startYear', 'Năm')}
                </div>

                <div className="flex items-center gap-4 p-3 bg-red-50/20 rounded-xl border border-red-100/30">
                  <div className="flex items-center gap-2 w-28 shrink-0 font-bold text-red-700 text-[11px] uppercase tracking-wider">
                    <Calendar size={14} /> <span>Kết thúc:</span>
                  </div>
                  {renderInput('endHour', 'Giờ')}
                  {renderInput('endMinute', 'Phút')}
                  {renderInput('endDay', 'Ngày')}
                  {renderInput('endMonth', 'Tháng')}
                  {renderInput('endYear', 'Năm')}
                </div>

                <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-2 w-28 shrink-0 font-bold text-gray-700 text-[11px] uppercase tracking-wider">
                    <Calendar size={14} /> <span>Ngày cấp:</span>
                  </div>
                  {renderInput('issueDay', 'Ngày')}
                  {renderInput('issueMonth', 'Tháng')}
                  {renderInput('issueYear', 'Năm')}
                </div>

                <div className="p-5 border border-gray-100 rounded-2xl bg-gray-50/30 space-y-4">
                  <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Tai nạn lái phụ xe...</h4>
                  <div className="flex gap-4">
                    {renderInput('accidentSeats', 'Số chỗ')}
                    {renderInput('accidentAmount', 'Mức tiền')}
                    {renderInput('accidentFee', 'Tổng phí TN')}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={`flex-1 overflow-hidden flex no-print ${activeTab !== 'list' ? 'flex' : 'hidden'}`}>
            <div className="w-[360px] shrink-0 bg-white border-r flex flex-col z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
              <div className="flex-1 overflow-y-auto w-full custom-scrollbar bg-gray-50">
                <div className="p-5 space-y-6">
                  <div className={`bg-white rounded-2xl border ${selectedIds.length > 0 ? 'border-emerald-200' : 'border-gray-200'} shadow-sm p-4 space-y-4 transition-colors`}>
                    <h4 className={`text-xs font-black uppercase tracking-widest flex items-center gap-2 ${selectedIds.length > 0 ? 'text-emerald-700' : 'text-gray-800'}`}>
                      <Settings size={14} className={selectedIds.length > 0 ? 'text-emerald-500' : 'text-gray-400'}/>
                      {selectedIds.length > 0 ? `THAO TÁC NHANH (${selectedIds.length} NHÃN)` : 'SỬA TẤT CẢ'}
                    </h4>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-gray-600">Di chuyển</span>
                        <div className="flex bg-gray-100 p-0.5 rounded-lg gap-0.5">
                          <button onClick={() => setElements(prev => prev.map(el => (selectedIds.length === 0 || selectedIds.includes(el.id)) ? { ...el, y: Math.max(0, el.y - 1) } : el))} className="p-1 min-w-[28px] flex justify-center bg-white rounded shadow-sm hover:text-emerald-600 transition-colors" title="Lên"><ArrowUp size={14}/></button>
                          <button onClick={() => setElements(prev => prev.map(el => (selectedIds.length === 0 || selectedIds.includes(el.id)) ? { ...el, y: Math.max(0, el.y + 1) } : el))} className="p-1 min-w-[28px] flex justify-center bg-white rounded shadow-sm hover:text-emerald-600 transition-colors" title="Xuống"><ArrowDown size={14}/></button>
                          <button onClick={() => setElements(prev => prev.map(el => (selectedIds.length === 0 || selectedIds.includes(el.id)) ? { ...el, x: Math.max(0, el.x - 1) } : el))} className="p-1 min-w-[28px] flex justify-center bg-white rounded shadow-sm hover:text-emerald-600 transition-colors" title="Trái"><ArrowLeft size={14}/></button>
                          <button onClick={() => setElements(prev => prev.map(el => (selectedIds.length === 0 || selectedIds.includes(el.id)) ? { ...el, x: Math.max(0, el.x + 1) } : el))} className="p-1 min-w-[28px] flex justify-center bg-white rounded shadow-sm hover:text-emerald-600 transition-colors" title="Phải"><ArrowRight size={14}/></button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-gray-600">Cỡ chữ chung</span>
                        <div className="flex bg-gray-100 p-0.5 rounded-lg gap-0.5">
                          <button onClick={() => setElements(prev => prev.map(el => (selectedIds.length === 0 || selectedIds.includes(el.id)) ? { ...el, fontSize: el.key !== 'qrCode' ? Math.max(8, el.fontSize - 1) : el.fontSize, size: el.key === 'qrCode' ? Math.max(8, (el.size || 80) - 1) : el.size } : el))} className="min-w-[28px] px-2 py-1 bg-white rounded shadow-sm font-bold text-sm leading-none hover:text-emerald-600 transition-colors">-</button>
                          <button onClick={() => setElements(prev => prev.map(el => (selectedIds.length === 0 || selectedIds.includes(el.id)) ? { ...el, fontSize: el.key !== 'qrCode' ? Math.max(8, el.fontSize + 1) : el.fontSize, size: el.key === 'qrCode' ? Math.max(8, (el.size || 80) + 1) : el.size } : el))} className="min-w-[28px] px-2 py-1 bg-white rounded shadow-sm font-bold text-sm leading-none hover:text-emerald-600 transition-colors">+</button>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <select
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val) setElements(prev => prev.map(el => (selectedIds.length === 0 || selectedIds.includes(el.id)) ? { ...el, fontFamily: val } : el));
                            e.target.value = ""; // Reset
                          }}
                          className="flex-1 w-full py-2 px-3 text-xs font-bold text-gray-700 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-all"
                        >
                          <option value="">Đổi Font...</option>
                          <option value="Inter">Inter</option>
                          <option value="Oswald">Oswald</option>
                          <option value="Anton">Anton</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className={`bg-white rounded-2xl border ${selectedElements.length > 0 ? 'border-emerald-200 shadow-sm' : 'border-gray-200 opacity-60 pointer-events-none'} overflow-hidden relative transition-all`}>
                      <div className={`px-4 py-3 border-b flex items-center gap-2 ${selectedElements.length > 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-gray-50 border-gray-100'}`}>
                        <MousePointer2 size={16} className={selectedElements.length > 0 ? 'text-emerald-600' : 'text-gray-400'} />
                        <span className={`font-bold text-sm ${selectedElements.length > 0 ? 'text-emerald-800' : 'text-gray-500'}`}>
                          {selectedElements.length === 1 ? selectedElements[0].label : selectedElements.length > 0 ? `${selectedElements.length} nhãn được chọn` : 'Chọn nhãn bên dưới để sửa'}
                        </span>
                      </div>
                      
                      <div className="p-4 space-y-4">
                        {selectedElements[0]?.isCustom && (
                          <div className="space-y-3">
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-gray-500 uppercase">Tên nhãn</label>
                              <input 
                                type="text" 
                                value={selectedElements[0].label}
                                onChange={(e) => updateElement(selectedElements[0].id, { label: e.target.value })}
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-gray-500 uppercase">Nội dung hiển thị</label>
                              <textarea 
                                value={selectedElements[0].content}
                                onChange={(e) => updateElement(selectedElements[0].id, { content: e.target.value })}
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none h-20 resize-none transition-all"
                              />
                            </div>
                          </div>
                        )}

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1.5">
                            <TypeIcon size={12}/> {(selectedElements.length > 0 && selectedElements.some(el => el.key === 'qrCode')) ? 'Cỡ chữ / Size QR' : 'Định dạng chữ'}
                          </label>
                          <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                              <input 
                                type="number" 
                                min="8" max="500" 
                                value={selectedElements.length > 0 ? (selectedElements[0].key === 'qrCode' ? (selectedElements[0].size || 80) : selectedElements[0].fontSize) : ''}
                                onChange={(e) => {
                                  let val = parseInt(e.target.value);
                                  if (isNaN(val)) val = 0;
                                  setElements(prev => prev.map(el => {
                                    if (selectedIds.includes(el.id)) {
                                      return el.key === 'qrCode' ? { ...el, size: val } : { ...el, fontSize: val };
                                    }
                                    return el;
                                  }));
                                }}
                                className="w-full pl-3 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                placeholder={selectedElements.length > 0 ? "" : "--"}
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">px</span>
                            </div>
                            
                            {!(selectedElements.length > 0 && selectedElements.some(el => el.key === 'qrCode')) && (
                              <select
                                value={selectedElements.length > 0 ? (selectedElements[0].fontFamily || 'Inter') : 'Inter'}
                                onChange={(e) => {
                                  selectedIds.forEach(id => updateElement(id, { fontFamily: e.target.value }));
                                }}
                                className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                              >
                                  <option value="Inter">Inter</option>
                                  <option value="Oswald">Oswald</option>
                                  <option value="Anton">Anton</option>
                              </select>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-4 py-3 border-b bg-gray-50 flex items-center justify-between">
                      <h4 className="text-xs font-black text-gray-800 uppercase tracking-widest flex items-center gap-2">
                        <List size={14} className="text-gray-400"/> Danh sách hiển thị
                      </h4>
                      <input 
                        type="checkbox"
                        title="Ẩn/Hiện tất cả"
                        checked={elements.every(e => e.isVisible)}
                        ref={input => {
                          if (input) {
                            input.indeterminate = elements.some(e => e.isVisible) && !elements.every(e => e.isVisible);
                          }
                        }}
                        onChange={(e) => {
                          setElements(prev => prev.map(el => ({ ...el, isVisible: e.target.checked })));
                        }}
                        className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      />
                    </div>
                    <div className="p-3 bg-white border-b">
                      <button 
                        onClick={addCustomElement}
                        className="w-full py-2 px-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100/50 transition-all flex items-center justify-center gap-2"
                      >
                        <PlusCircle size={16} />
                        <span className="font-bold text-xs uppercase tracking-wide">Thêm nhãn tùy chỉnh</span>
                      </button>
                    </div>
                    <div className="p-2 space-y-1">
                      {elements.filter(e => !e.isCustom).map((el) => (
                        <div 
                          key={el.id} 
                          className={`flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer group ${selectedIds.includes(el.id) ? 'bg-emerald-50 text-emerald-800 font-extrabold' : 'hover:bg-gray-50 font-bold text-gray-600 hover:text-gray-900'}`}
                          onClick={(e) => handleSelect(el.id, e.shiftKey, true)}
                        >
                          <span className="text-sm">{el.label}</span>
                          <input 
                            type="checkbox" 
                            checked={el.isVisible} 
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => updateElement(el.id, { isVisible: e.target.checked })}
                            className="w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-4 border-t bg-white shrink-0 flex gap-3">
                <button onClick={resetLayout} className="flex-1 py-3 text-[10px] font-bold text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 border border-gray-200 rounded-xl transition-all uppercase tracking-widest text-center shadow-sm">Khôi phục</button>
                <button onClick={exportLayout} className="flex-1 flex items-center justify-center gap-1 py-3 text-[10px] font-bold text-white bg-gray-800 hover:bg-gray-900 rounded-xl transition-all uppercase tracking-widest shadow-lg shadow-gray-200"><Download size={14} /> Xuất Layout</button>
              </div>
            </div>
            
            <div 
              className="flex-1 bg-gray-200/50 overflow-auto p-8 flex justify-center items-start custom-scrollbar"
              onMouseDown={(e) => { if(e.target === e.currentTarget) setSelectedIds([]); }}
            >
              <div 
                ref={containerRef}
                className="print-area bg-white shadow-2xl relative"
                style={{
                  width: '297mm',
                  height: '210mm',
                  minWidth: '297mm',
                  minHeight: '210mm',
                  backgroundImage: isEditingLayout ? 'radial-gradient(circle, #e5e7eb 1.5px, transparent 1.5px)' : 'none',
                  backgroundSize: '30px 30px'
                }}
              >
                {elements.map((el) => {
                  let value = '';
                  const isAccidentField = ['accidentSeats', 'accidentAmount', 'accidentFee'].includes(el.key as string);
                  const accidentFeeNum = parseFloat(data.accidentFee.replace(/[^0-9.-]+/g,""));
                  const hasNoAccidentInsurance = isNaN(accidentFeeNum) || accidentFeeNum === 0 || data.accidentFee === '' || data.accidentFee === '0';

                  if (el.isCustom) {
                    value = el.content || '';
                  } else if (['isBusiness', 'isNotBusiness', 'isAgent'].includes(el.key)) {
                    value = getSpecialValue(el.key);
                  } else if (el.key === 'qrCode') {
                    value = finalQrValue;
                  } else if (isAccidentField && hasNoAccidentInsurance) {
                    value = 'x';
                  } else {
                    value = (data[el.key as keyof InsuranceData] || '');
                  }

                  return (
                    <DraggableItem
                      key={el.id}
                      element={el}
                      value={value}
                      onUpdate={updateElement}
                      containerRef={containerRef}
                      isEditing={isEditingLayout}
                      isSelected={selectedIds.includes(el.id)}
                      onSelect={handleSelect}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          <div className="hidden print:block print-only">
             <div className="print-area bg-white relative" style={{ width: '297mm', height: '210mm' }}>
                {elements.map((el) => {
                  let value = '';
                  const isAccidentField = ['accidentSeats', 'accidentAmount', 'accidentFee'].includes(el.key as string);
                  const accidentFeeNum = parseFloat(data.accidentFee.replace(/[^0-9.-]+/g,""));
                  const hasNoAccidentInsurance = isNaN(accidentFeeNum) || accidentFeeNum === 0 || data.accidentFee === '' || data.accidentFee === '0';

                  if (el.isCustom) {
                    value = el.content || '';
                  } else if (['isBusiness', 'isNotBusiness', 'isAgent'].includes(el.key)) {
                    value = getSpecialValue(el.key);
                  } else if (el.key === 'qrCode') {
                    value = finalQrValue;
                  } else if (isAccidentField && hasNoAccidentInsurance) {
                    value = 'x';
                  } else {
                    value = (data[el.key as keyof InsuranceData] || '');
                  }

                  return (
                    <DraggableItem
                      key={el.id}
                      element={el}
                      value={value}
                      onUpdate={updateElement}
                      containerRef={containerRef}
                      isEditing={false}
                      isSelected={false}
                      onSelect={() => {}}
                    />
                  );
                })}
             </div>
          </div>
        </div>
      </main>
      <style dangerouslySetInnerHTML={{ __html: `.custom-scrollbar::-webkit-scrollbar { width: 5px; } .custom-scrollbar::-webkit-scrollbar-track { background: transparent; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }` }} />
    </div>
  );
};

export default App;
