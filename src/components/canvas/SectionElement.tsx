import React, { useState, useEffect, useMemo } from 'react';
import { useSeatMapStore } from '@/stores/seatMapStore';
import { SeatElement } from './SeatElement';
import { useCopyToClipboard } from '@/hooks/useCopyToClipBoard';

interface SectionElementProps {
  section: any;
  editable: boolean;
  onMouseDown: (e: React.MouseEvent, id: string) => void;
  onResizerMouseDown: (e: React.MouseEvent, id: string, width: number, height: number) => void;
  onRemove: (id: string) => void;
  onSeatMouseDown?: (e: React.MouseEvent, id: string) => void;
  onSeatRemove?: (id: string) => void;
  onUpdate?: (id: string, updates: any) => void;
}

export const SectionElement: React.FC<SectionElementProps> = ({
  section,
  editable,
  onMouseDown,
  onResizerMouseDown,
  onRemove,
  onSeatMouseDown,
  onSeatRemove,
  onUpdate
}) => {
  const { seatMap, updateSection , updateElement } = useSeatMapStore();
  const [isEditing, setIsEditing] = useState(false);
  const [sectionName, setSectionName] = useState(section.name);
  const [showSectionId, setShowSectionId] = useState(false);
  const { copyToClipboard } = useCopyToClipboard();
  
  // Update local state when section name changes from props
  useEffect(() => {
    setSectionName(section.name);
  }, [section.name]);
  
  // گرفتن تمام صندلی‌های مربوط به این بخش
  const sectionSeats = useMemo(() => 
    seatMap.seats.filter(seat => seat.sectionId === section.id),
    [seatMap.seats, section.id]
  );
  
  const handleNameClick = (e: React.MouseEvent) => {
    if (editable) {
      e.stopPropagation();
      setIsEditing(true);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSectionName(e.target.value);
  };

// در SectionElement.tsx، تابع handleNameBlur را به این صورت اصلاح کنید:
const handleNameBlur = () => {
    setIsEditing(false);
    if (sectionName !== section.name) {
      // استفاده از updateElement به جای updateSection
      updateElement(section.id, { name: sectionName });
      
      // همچنان از onUpdate استفاده می‌کنیم اگر موجود باشد
      if (onUpdate) {
        onUpdate(section.id, { name: sectionName });
      }
      console.log('Updating section name to:', sectionName);
    }
  };

  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setIsEditing(false);
      if (sectionName !== section.name) {
        // استفاده از updateElement به جای updateSection
        updateElement(section.id, { name: sectionName });
        
        // همچنان از onUpdate استفاده می‌کنیم اگر موجود باشد
        if (onUpdate) {
          onUpdate(section.id, { name: sectionName });
        }
        console.log('Updating section name to:', sectionName);
      }
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setSectionName(section.name);
    }
  };

  // جدا کردن منطق به‌روزرسانی نام بخش به یک تابع مجزا
  const handleSectionNameUpdate = () => {
    // ابتدا از updateSection استفاده می‌کنیم
    if (updateSection) {
      updateSection(section.id, { name: sectionName });
      console.log('Updating section name to:', sectionName);
    }
    
    // سپس از onUpdate استفاده می‌کنیم تا مطمئن شویم تغییرات به کامپوننت والد نیز منتقل می‌شود
    if (onUpdate) {
      onUpdate(section.id, { name: sectionName });
    }
  };

  const toggleSectionId = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowSectionId(!showSectionId);
  };

  const handleCopyId = (e: React.MouseEvent) => {
    e.stopPropagation();
    copyToClipboard(section.id, 'شناسه بخش کپی شد');
  };

  return (
    <div
      className={`absolute rounded-md border-2 ${editable ? 'cursor-move' : ''}`}
      style={{
        left: section.x + 'px',
        top: section.y + 'px',
        width: section.width + 20 + 'px',
        height: section.height + 50 + 'px',
        backgroundColor: section.color || 'rgba(155, 135, 245, 0.2)',
        borderColor: '#9b87f5',
        position: 'absolute',
      }}
      onMouseDown={(e) => editable && onMouseDown(e, section.id)}
    >
      {/* Section name label - positioned at the top of the section */}
      <div 
        className="absolute -top-8 left-0 flex items-center"
        onClick={(e) => e.stopPropagation()}
      >
        {isEditing ? (
          <input
            type="text"
            value={sectionName}
            onChange={handleNameChange}
            onBlur={handleNameBlur}
            onKeyDown={handleNameKeyDown}
            className="text-sm font-medium bg-white border border-gray-300 rounded px-2 py-1 z-10"
            autoFocus
            onClick={(e) => e.stopPropagation()}
            style={{ minWidth: '120px' }}
          />
        ) : (
          <div className="flex items-center bg-white px-2 py-1 rounded border border-gray-300 shadow-sm">
            <span 
              className={`text-sm font-medium ${editable ? 'cursor-text' : ''}`}
              onClick={handleNameClick}
            >
              {section.name}
            </span>
            {editable && (
              <button
                className="ml-2 text-blue-600 hover:text-blue-800"
                onClick={handleNameClick}
                title="ویرایش نام"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>
      
      {/* Section controls - positioned at the top-right corner */}
      {editable && (
        <div className="absolute -top-8 right-0 flex space-x-1">
          <button
            className="w-6 h-6 flex items-center justify-center bg-blue-500 text-white rounded-md text-xs"
            onClick={toggleSectionId}
            title="نمایش/مخفی کردن شناسه بخش"
          >
            ID
          </button>
          
          <button
            className="w-6 h-6 flex items-center justify-center bg-red-500 text-white rounded-md"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(section.id);
            }}
            title="حذف بخش"
          >
            ×
          </button>
        </div>
      )}
      
      {/* Section ID display - positioned below the section name */}
      {showSectionId && (
        <div 
          className="absolute -top-[4.5rem] left-0 flex items-center bg-gray-100 rounded px-2 py-1 border border-gray-300 shadow-sm"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="text-xs text-gray-600 mr-1 select-all">
            {section.id}
          </span>
          <button
            className="ml-1 text-blue-600 hover:text-blue-800"
            onClick={handleCopyId}
            title="کپی شناسه"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            </svg>
          </button>
        </div>
      )}
      
      {/* رندر کردن صندلی‌های مربوط به این بخش */}
      {sectionSeats.map(seat => (
        <SeatElement
          key={seat.id}
          seat={seat}
          editable={editable}
          onMouseDown={(e) => onSeatMouseDown && onSeatMouseDown(e, seat.id)}
          onRemove={(id) => onSeatRemove && onSeatRemove(id)}
          isInsideSection={true}
          sectionX={section.x}
          sectionY={section.y}
        />
      ))}
      
      {editable && (
        <div
          className="absolute bottom-0 right-0 w-4 h-4 bg-white border border-gray-400 rounded-bl-md cursor-se-resize"
          onMouseDown={(e) => onResizerMouseDown(e, section.id, section.width, section.height)}
        />
      )}
    </div>
  );
};