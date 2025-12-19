
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
  Trash2
} from 'lucide-react';
import { InsuranceData, PrintableElement, TabType } from './types';
import { DEFAULT_ELEMENTS, EMPTY_INSURANCE, LABEL_MAP } from './constants';
import { extractInsuranceData } from './services/geminiService';
import { DraggableItem } from './components/DraggableItem';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('list');
  const [data, setData] = useState<InsuranceData>(EMPTY_INSURANCE);
  const [elements, setElements] = useState<PrintableElement[]>(DEFAULT_ELEMENTS);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditingLayout, setIsEditingLayout] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);

  const applyVehicleTypeLogic = (weightValue: string): string => {
    return weightValue && weightValue.trim() !== '' ? 'Xe tải' : 'Xe ô tô con';
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
          const result = await extractInsuranceData(base64, file.type);
          result.vehicleType = applyVehicleTypeLogic(result.weight);
          setData(result);
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

  const updateElement = useCallback((id: string, updates: Partial<PrintableElement>) => {
    setElements(prev => prev.map(el => el.id === id ? { ...el, ...updates } : el));
  }, []);

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

  const handleSelect = useCallback((id: string, multi: boolean) => {
    setSelectedIds(prev => {
      if (multi) {
        return prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      }
      return [id];
    });
  }, []);

  // Keyboard controls for layout
  useEffect(() => {
    if (!isEditingLayout || selectedIds.length === 0) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const step = e.shiftKey ? 10 : 1;
      let dx = 0;
      let dy = 0;

      if (e.key === 'ArrowUp') dy = -step;
      else if (e.key === 'ArrowDown') dy = step;
      else if (e.key === 'ArrowLeft') dx = -step;
      else if (e.key === 'ArrowRight') dx = step;
      else if (e.key === 'Delete' || e.key === 'Backspace') {
        // Only delete custom elements with key
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
  }, [isEditingLayout, selectedIds, elements]);

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
    setElements(DEFAULT_ELEMENTS);
    setSelectedIds([]);
  };

  const finalQrValue = useMemo(() => data.qrCode || '', [data.qrCode]);

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

  // Logic hiển thị dấu x cho các ô đặc biệt
  const getSpecialValue = (key: string) => {
    const purpose = (data.purpose || '').toLowerCase();
    if (key === 'isBusiness') {
      return (purpose.includes('kinh doanh') && !purpose.includes('không kinh doanh')) ? 'x' : '';
    }
    if (key === 'isNotBusiness') {
      return purpose.includes('không kinh doanh') ? 'x' : '';
    }
    if (key === 'isAgent') {
      return 'x'; // Mặc định là x theo yêu cầu
    }
    return '';
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden relative">
      <header className="no-print bg-white border-b shrink-0 z-50">
        <div className="max-w-full mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-emerald-600 p-2 rounded-lg text-white">
              <FileText size={24} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-800 leading-tight">In Bảo Hiểm Tự Động</h1>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Hệ thống v4.5 • AI Extractor</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <label className="flex items-center space-x-2 px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl cursor-pointer transition-all text-sm font-bold border border-emerald-100">
              <Upload size={18} />
              <span>Tải tài liệu</span>
              <input type="file" className="hidden" accept="application/pdf,image/*" onChange={handleFileUpload} />
            </label>
            <button onClick={handlePrint} className="flex items-center space-x-2 px-5 py-2 bg-gray-800 text-white hover:bg-gray-900 rounded-xl transition-all text-sm font-bold shadow-lg shadow-gray-200 active:scale-95">
              <Printer size={18} />
              <span>In A4 Ngang</span>
            </button>
          </div>
        </div>
      </header>

      <nav className="no-print bg-white border-b shrink-0 px-6">
        <div className="flex space-x-8">
          {[
            { id: 'list', label: 'Trích xuất', icon: <List size={18} /> },
            { id: 'print', label: 'Bố cục bản in', icon: <Layout size={18} /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`py-4 px-2 border-b-2 font-bold text-sm flex items-center space-x-2 transition-all ${
                activeTab === tab.id ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-gray-400 hover:text-gray-600'
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
              <p className="text-lg font-bold text-gray-800">Đang trích xuất dữ liệu...</p>
            </div>
          </div>
        )}

        <div className="h-full w-full flex flex-col">
          {/* Tab: Trích xuất */}
          <div className={`flex-1 overflow-y-auto p-6 no-print ${activeTab === 'list' ? 'block' : 'hidden'} custom-scrollbar`}>
            <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 p-8 h-fit">
              <div className="flex items-center justify-between mb-8 pb-4 border-b">
                <h3 className="text-xl font-bold text-gray-800 flex items-center space-x-3">
                  <Edit3 size={24} className="text-emerald-600" />
                  <span>Sửa thông tin</span>
                </h3>
                <button onClick={() => setData(EMPTY_INSURANCE)} className="px-4 py-2 text-xs font-bold text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition-colors uppercase">Làm mới</button>
              </div>

              <div className="flex flex-col space-y-5">
                <div className="w-full">{renderInput('qrCode', 'Dữ liệu mã QR', 'QR CODE LINK')}</div>
                <div className="flex gap-4">
                  {renderInput('serialNumber')}
                  {renderInput('licensePlate')}
                </div>
                <div className="w-full">{renderInput('ownerName')}</div>
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

          {/* Tab: Bố cục bản in & Editor UI */}
          <div className={`flex-1 overflow-hidden flex no-print ${activeTab === 'print' ? 'flex' : 'hidden'}`}>
            <div className="w-80 shrink-0 bg-white border-r flex flex-col">
              <div className="p-6 border-b shrink-0 space-y-4">
                <h3 className="font-bold text-gray-800 flex items-center space-x-2">
                  <Settings size={18} className="text-emerald-600" />
                  <span>Cấu hình bản in</span>
                </h3>
                
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => { setIsEditingLayout(!isEditingLayout); setSelectedIds([]); }}
                    className={`py-3 rounded-2xl text-[10px] font-bold transition-all shadow-sm flex flex-col items-center justify-center space-y-1 ${
                      isEditingLayout ? 'bg-emerald-600 text-white shadow-emerald-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                    }`}
                  >
                    <Layout size={16} />
                    <span>{isEditingLayout ? 'Lưu vị trí' : 'Kéo thả'}</span>
                  </button>
                  <button 
                    onClick={addCustomElement}
                    className="py-3 rounded-2xl text-[10px] font-bold bg-white text-emerald-600 border-2 border-dashed border-emerald-200 hover:border-emerald-600 transition-all flex flex-col items-center justify-center space-y-1"
                  >
                    <PlusCircle size={16} />
                    <span>Thêm nhãn</span>
                  </button>
                </div>
                
                {isEditingLayout && selectedElements.length > 0 && (
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-4">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tùy chỉnh mục chọn:</p>
                    
                    {selectedElements[0].isCustom && (
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-500 uppercase">Tên nhãn:</label>
                          <input 
                            type="text" 
                            value={selectedElements[0].label}
                            onChange={(e) => updateElement(selectedElements[0].id, { label: e.target.value })}
                            className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-500 uppercase">Nội dung:</label>
                          <textarea 
                            value={selectedElements[0].content}
                            onChange={(e) => updateElement(selectedElements[0].id, { content: e.target.value })}
                            className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold focus:ring-2 focus:ring-emerald-500 outline-none h-20 resize-none"
                          />
                        </div>
                      </div>
                    )}

                    <div className="space-y-3">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1.5">
                           <TypeIcon size={12}/> {selectedElements.some(el => el.key === 'qrCode') ? 'Cỡ chữ / Size QR' : 'Cỡ chữ'}
                        </label>
                        <div className="flex items-center gap-3">
                           <input 
                             type="range" 
                             min="8" max="250" 
                             value={selectedElements[0].key === 'qrCode' ? (selectedElements[0].size || 110) : selectedElements[0].fontSize}
                             onChange={(e) => {
                               const val = parseInt(e.target.value);
                               selectedIds.forEach(id => {
                                 const el = elements.find(e => e.id === id);
                                 if (el?.key === 'qrCode') updateElement(id, { size: val });
                                 else updateElement(id, { fontSize: val });
                               });
                             }}
                             className="flex-1 accent-emerald-600 h-1.5 bg-gray-200 rounded-lg cursor-pointer"
                           />
                           <span className="text-xs font-mono font-bold text-emerald-600 w-8 text-right">
                             {selectedElements[0].key === 'qrCode' ? (selectedElements[0].size || 110) : selectedElements[0].fontSize}
                           </span>
                        </div>
                      </div>
                      
                      {selectedElements[0].isCustom && (
                        <button 
                          onClick={() => deleteElement(selectedElements[0].id)}
                          className="w-full py-2 bg-red-50 text-red-600 rounded-xl text-[10px] font-bold flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
                        >
                          <Trash2 size={14} /> XÓA NHÃN NÀY
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {isEditingLayout && (
                  <div className="mt-4 p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-[10px] text-emerald-700 flex items-start gap-2">
                    <MousePointer2 size={14} className="shrink-0 mt-0.5" />
                    <p>Giữ <b>Shift</b> chọn nhiều. Dùng <b>mũi tên</b> di chuyển. <b>Del</b> để xóa nhãn riêng.</p>
                  </div>
                )}
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                <div className="space-y-1">
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-3">Hệ thống</div>
                  {elements.filter(e => !e.isCustom).map((el) => (
                    <label 
                      key={el.id} 
                      className={`flex items-center justify-between p-3 rounded-2xl transition-all border cursor-pointer group ${selectedIds.includes(el.id) ? 'bg-emerald-50 border-emerald-200' : 'border-transparent hover:bg-gray-50'}`}
                      onClick={(e) => isEditingLayout && handleSelect(el.id, e.shiftKey)}
                    >
                      <span className={`text-sm font-bold ${selectedIds.includes(el.id) ? 'text-emerald-700' : 'text-gray-600 group-hover:text-emerald-700'}`}>{el.label}</span>
                      <input 
                        type="checkbox" 
                        checked={el.isVisible} 
                        onChange={(e) => { e.stopPropagation(); updateElement(el.id, { isVisible: e.target.checked }); }}
                        className="w-5 h-5 rounded-lg border-gray-200 text-emerald-600 focus:ring-emerald-500"
                      />
                    </label>
                  ))}
                  
                  {elements.some(e => e.isCustom) && (
                    <>
                      <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-6 mb-2 px-3">Nhãn riêng</div>
                      {elements.filter(e => e.isCustom).map((el) => (
                        <label 
                          key={el.id} 
                          className={`flex items-center justify-between p-3 rounded-2xl transition-all border cursor-pointer group ${selectedIds.includes(el.id) ? 'bg-emerald-50 border-emerald-200' : 'border-transparent hover:bg-gray-50'}`}
                          onClick={(e) => isEditingLayout && handleSelect(el.id, e.shiftKey)}
                        >
                          <span className={`text-sm font-bold ${selectedIds.includes(el.id) ? 'text-emerald-700' : 'text-gray-600 group-hover:text-emerald-700'}`}>{el.label}</span>
                          <div className="flex items-center gap-2">
                            <input 
                              type="checkbox" 
                              checked={el.isVisible} 
                              onChange={(e) => { e.stopPropagation(); updateElement(el.id, { isVisible: e.target.checked }); }}
                              className="w-5 h-5 rounded-lg border-gray-200 text-emerald-600 focus:ring-emerald-500"
                            />
                            <button 
                              onClick={(e) => { e.stopPropagation(); deleteElement(el.id); }}
                              className="p-1.5 text-red-300 hover:text-red-500"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </label>
                      ))}
                    </>
                  )}
                </div>
              </div>
              <div className="p-4 border-t">
                <button onClick={resetLayout} className="w-full py-3 text-[10px] font-bold text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 border-2 border-dashed border-gray-100 rounded-2xl transition-all uppercase tracking-widest">Khôi phục mặc định</button>
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
                  if (el.isCustom) {
                    value = el.content || '';
                  } else if (['isBusiness', 'isNotBusiness', 'isAgent'].includes(el.key)) {
                    value = getSpecialValue(el.key);
                  } else if (el.key === 'qrCode') {
                    value = finalQrValue;
                  } else if (el.id === 'strikeLine') {
                    value = data.accidentFee;
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
                  if (el.isCustom) {
                    value = el.content || '';
                  } else if (['isBusiness', 'isNotBusiness', 'isAgent'].includes(el.key)) {
                    value = getSpecialValue(el.key);
                  } else if (el.key === 'qrCode') {
                    value = finalQrValue;
                  } else if (el.id === 'strikeLine') {
                    value = data.accidentFee;
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
