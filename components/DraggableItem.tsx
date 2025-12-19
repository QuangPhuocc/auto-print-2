
import React, { useState, useRef, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { PrintableElement } from '../types';

interface DraggableItemProps {
  element: PrintableElement;
  value: string;
  onUpdate: (id: string, updates: Partial<PrintableElement>) => void;
  containerRef: React.RefObject<HTMLDivElement>;
  isEditing: boolean;
  isSelected: boolean;
  onSelect: (id: string, multi: boolean) => void;
}

export const DraggableItem: React.FC<DraggableItemProps> = ({ 
  element, 
  value, 
  onUpdate, 
  containerRef,
  isEditing,
  isSelected,
  onSelect
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; initialX: number; initialY: number } | null>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isEditing) return;
    onSelect(element.id, e.shiftKey || e.ctrlKey || e.metaKey);
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: element.x,
      initialY: element.y
    };
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !dragRef.current || !containerRef.current) return;

      const deltaX = e.clientX - dragRef.current.startX;
      const deltaY = e.clientY - dragRef.current.startY;

      const containerRect = containerRef.current.getBoundingClientRect();
      
      let newX = dragRef.current.initialX + deltaX;
      let newY = dragRef.current.initialY + deltaY;

      newX = Math.round(Math.max(0, Math.min(newX, containerRect.width - 20)));
      newY = Math.round(Math.max(0, Math.min(newY, containerRect.height - 20)));

      onUpdate(element.id, { x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, onUpdate, element.id, containerRef]);

  // Logic định dạng hiển thị đặc biệt
  const getDisplayValue = () => {
    if (element.isCustom) return value || (isEditing ? `[${element.label}]` : '');
    if (!value) return isEditing ? `[${element.label}]` : '';

    // Số tiền bảo hiểm lái phụ xe: ví dụ 10,000,000 -> 10
    if (element.key === 'accidentAmount') {
      const numStr = value.replace(/\D/g, '');
      const num = parseInt(numStr);
      if (!isNaN(num) && num >= 1000000) {
        return Math.floor(num / 1000000).toString();
      }
      return numStr || value;
    }

    // Năm cấp: chỉ lấy 1 chữ số cuối cùng
    if (element.key === 'issueYear') {
      const yearStr = value.trim();
      return yearStr.length >= 1 ? yearStr.slice(-1) : yearStr;
    }

    // Năm BĐ/KT: chỉ lấy 2 số cuối
    if (element.key === 'startYear' || element.key === 'endYear') {
      const yearStr = value.trim();
      return yearStr.length >= 2 ? yearStr.slice(-2) : yearStr;
    }

    return value;
  };

  const isStrikeLine = element.id === 'strikeLine';
  const shouldShowStrike = isStrikeLine && (value === '0' || isEditing);

  if (!element.isVisible || (isStrikeLine && !shouldShowStrike)) return null;

  const displayValue = getDisplayValue();

  return (
    <div
      style={{
        position: 'absolute',
        left: `${element.x}px`,
        top: `${element.y}px`,
        fontSize: isStrikeLine ? '0' : `${element.fontSize}px`,
        fontWeight: 'bold', // Luôn in đậm theo yêu cầu
        cursor: isEditing ? 'move' : 'default',
        userSelect: 'none',
        zIndex: isDragging ? 50 : 10,
        backgroundColor: isDragging ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
        border: isEditing && !isStrikeLine ? (isSelected ? '2px solid #10b981' : '1px dashed #10b981') : 'none',
        padding: isEditing && !isStrikeLine ? '4px' : '0',
        // Cho phép địa chỉ hoặc nhãn tùy chỉnh xuống dòng
        whiteSpace: (element.key === 'address' || element.isCustom) ? 'normal' : 'nowrap',
        maxWidth: (element.key === 'address' || element.isCustom) ? '400px' : 'none',
        boxShadow: isSelected && isEditing ? '0 0 10px rgba(16, 185, 129, 0.3)' : 'none',
        lineHeight: '1.2'
      }}
      onMouseDown={handleMouseDown}
      className="transition-all duration-150"
    >
      {isEditing && (
        <div className={`absolute -top-6 left-0 text-white text-[9px] px-1.5 py-0.5 rounded font-mono z-[100] whitespace-nowrap shadow-sm pointer-events-none no-print ${isSelected ? 'bg-emerald-600 font-bold opacity-100' : 'bg-gray-800 opacity-80'}`}>
          X:{element.x}, Y:{element.y}
        </div>
      )}

      {isStrikeLine ? (
        <div style={{ position: 'relative', width: '20px', height: '20px' }}>
          <svg 
            width="300" 
            height="300" 
            style={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              overflow: 'visible',
              pointerEvents: 'none'
            }}
          >
            <line 
              x1="0" 
              y1="0" 
              x2="-120" 
              y2="240" 
              stroke={isSelected ? "#10b981" : "gray"} 
              strokeWidth={isSelected ? "3" : "2"} 
              strokeDasharray={isEditing ? "4 4" : "0"}
            />
          </svg>
          {isEditing && (
             <div className={`w-4 h-4 rounded-full border-2 border-white shadow-sm absolute -translate-x-1/2 -translate-y-1/2 no-print ${isSelected ? 'bg-emerald-600 scale-125' : 'bg-emerald-500'}`} />
          )}
        </div>
      ) : element.key === 'qrCode' ? (
        value ? (
          <div className={`bg-white p-2 inline-block shadow-sm border ${isSelected ? 'border-emerald-500' : 'border-gray-100'}`}>
             <QRCodeSVG value={value} size={element.size || 80} level="H" includeMargin={true} />
          </div>
        ) : (
          isEditing && (
            <div 
              style={{ width: element.size || 80, height: element.size || 80 }}
              className={`bg-emerald-50 border-2 border-dashed flex flex-col items-center justify-center text-[10px] text-emerald-600 font-bold ${isSelected ? 'border-emerald-500' : 'border-emerald-200'}`}
            >
              <span>MÃ QR</span>
            </div>
          )
        )
      ) : (
        <span style={{ display: 'block' }}>{displayValue}</span>
      )}
    </div>
  );
};
