import React, { useState } from 'react';
import { useCopyToClipboard } from '@/hooks/useCopyToClipBoard';

interface SeatElementProps {
  seat: any;
  editable: boolean;
  onMouseDown: (e: React.MouseEvent, id: string) => void;
  onRemove: (id: string) => void;
  isInsideSection?: boolean;
  sectionX?: number;
  sectionY?: number;
}

export const SeatElement: React.FC<SeatElementProps> = ({
  seat,
  editable,
  onMouseDown,
  onRemove,
  isInsideSection = false,
  sectionX = 0,
  sectionY = 0
}) => {
  const seatSize = 20;

const { copyToClipboard } = useCopyToClipboard();
const [isHovered, setIsHovered] = useState(false);

const handleMouseEnter = () => {
  if (editable) {
    setIsHovered(true);
  }
};

const handleMouseLeave = () => {
  setIsHovered(false);
};

  
  // تعیین رنگ صندلی بر اساس نوع و وضعیت
  let bgColor = '';
  if (seat.type === 'vip') {
    bgColor = '#D946EF'; // صورتی برای صندلی‌های VIP
  } else if (seat.type === 'disabled') {
    bgColor = '#33C3F0'; // آبی برای صندلی‌های معلولین
  } else {
    // صندلی‌های معمولی بر اساس وضعیت رنگ می‌گیرند
    switch (seat.status) {
      case 'available':
        bgColor = '#9b87f5';
        break;
      case 'selected':
        bgColor = '#8B5CF6';
        break;
      case 'sold':
        bgColor = '#F97316';
        break;
      case 'disabled':
        bgColor = '#8E9196';
        break;
      default:
        bgColor = '#9b87f5';
    }
  }
  
  // شکل متفاوت برای صندلی‌های معلولین
  const borderRadius = seat.type === 'disabled' ? '50%' : '0.375rem';
  // شکل متفاوت برای صندلی‌های VIP (لوزی)
  const transform = seat.type === 'vip' ? 'rotate(45deg)' : 'none';
  
  // محاسبه موقعیت بر اساس اینکه صندلی داخل بخش است یا نه
  const left = isInsideSection ? (seat.relativeX || (seat.x - sectionX)) : seat.x;
  const top = isInsideSection ? (seat.relativeY || (seat.y - sectionY)) : seat.y;
  
  // تابع برای کپی کردن شناسه صندلی
  const handleCopyId = (e: React.MouseEvent) => {
    e.stopPropagation();
    copyToClipboard(seat.id, 'شناسه صندلی کپی شد');
  };
  
  // تابع برای نمایش/مخفی کردن شناسه
  const toggleShowId = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowId(!showId);
  };
  
  // تابع برای مدیریت کلیک راست
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if (editable) {
      toggleShowId(e);
    }
  };
  
  return (
    <div
      className="flex flex-col items-center absolute"
      style={{
        left: left + 'px',
        top: top + 'px',
      }}
    >
      {/* برچسب ردیف بالای صندلی */}
      <div className="text-xs font-medium mb-0.5 text-gray-600">{seat.row}</div>
      
      {/* نمایش شناسه صندلی هنگام هاور */}
      {isHovered && (
        <div 
          className="absolute -top-8 text-nowrap !text-black font-semibold  left-1/2 transform -translate-x-1/2 bg-gray-100 rounded px-2 py-1 border border-gray-300 shadow-sm z-20 flex items-center"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="text-xs text-gray-600 mr-1 select-all">
            {seat.id}
          </span>
          <button
            className="ml-1 text-blue-600 hover:text-blue-800"
            onClick={handleCopyId}
            title="کپی شناسه"
          >
          </button>
        </div>
      )}
      
      <div
        className={`flex items-center justify-center text-white text-xs font-bold select-none ${editable ? 'cursor-move group' : ''}`}
        style={{
          width: seatSize + 'px',
          height: seatSize + 'px',
          backgroundColor: bgColor,
          borderRadius: borderRadius,
          transform: transform,
          position: 'relative',
        }}
        onMouseDown={(e) => editable && onMouseDown(e, seat.id)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onContextMenu={(e) => {
          e.preventDefault();
          if (editable) {
            copyToClipboard(seat.id, 'شناسه صندلی کپی شد');
          }
        }}
        title={`${seat.row}${seat.number} (${seat.type || 'regular'})`}
      >
        <span style={{transform: seat.type === 'vip' ? 'rotate(-45deg)' : 'none'}}>
          {seat.number}
        </span>
        
        {editable && (
          <button
            type="button"
            className="absolute -top-2 -right-2 w-4 h-4 flex items-center justify-center bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 text-xs z-10"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(seat.id);
            }}
            style={{transform: 'none'}}
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};