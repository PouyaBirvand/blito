import React from 'react';
import { useSeatMapStore, type Seat } from '@/stores/seatMapStore';
import { Skeleton } from '@/components/ui/skeleton';

interface SeatElementProps {
  seat: Seat;
  editable: boolean;
  onMouseDown: (e: React.MouseEvent, id: string) => void;
  onRemove: (id: string) => void;
  isLoading?: boolean;
}

export const SeatElement: React.FC<SeatElementProps> = ({
  seat,
  editable,
  onMouseDown,
  onRemove,
  isLoading = false
}) => {
  const { seatMap } = useSeatMapStore();
  const seatSize = 20;
  let bgColor = '';
  
  // Find the section this seat belongs to
  const seatSection = seatMap.sections.find(section => section.id === seat.sectionId);
  
  // Set background color based on seat type and status
  if (seat.type === 'vip') {
    bgColor = '#D946EF'; // Vibrant pink for VIP seats
  } else if (seat.type === 'disabled') {
    bgColor = '#33C3F0'; // Blue for disabled access seats
  } else if (seatSection) {
    // Use section color if available
    bgColor = seatSection.color;
  } else {
    // Regular seats get color based on status
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
  
  // Add different shape for disabled access seats
  const borderRadius = seat.type === 'disabled' ? '50%' : '0.375rem';
  // Different styles for VIP seats (diamond shape)
  const transform = seat.type === 'vip' ? 'rotate(45deg)' : 'none';
  
  if (isLoading) {
    return (
      <div className="absolute flex flex-col items-center" style={{
        left: seat.x + 'px',
        top: seat.y + 'px',
      }}>
        <Skeleton className="h-3 w-8 mb-0.5"/>
        <Skeleton className="h-5 w-5"/>
      </div>
    );
  }
  
  // Handle drag operation
  const handleSeatMouseDown = (e: React.MouseEvent) => {
    if (editable) {
      e.stopPropagation();
      onMouseDown(e, seat.id);
    }
  };
  
  // Handle delete button click
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onRemove(seat.id);
  };
  
  return (
    <div
      className="absolute flex flex-col items-center"
      style={{
        left: seat.x + 'px',
        top: seat.y + 'px',
      }}
    >
      {/* Row label above seat */}
      <div className="text-xs font-medium mb-0.5 text-gray-600">{seat.row}</div>
      
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
        onMouseDown={handleSeatMouseDown}
        title={`${seat.row}${seat.number} (${seat.type})${seatSection ? ' in ' + seatSection.name : ''}`}
      >
        <span style={{transform: seat.type === 'vip' ? 'rotate(-45deg)' : 'none'}}>
          {seat.number}
        </span>
        
        {editable && (
          <button
            type="button"
            className="absolute -top-2 -right-2 w-4 h-4 flex items-center justify-center bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 text-xs z-10"
            onClick={handleDeleteClick}
            onMouseDown={(e) => {
              // Prevent event from bubbling to parent elements
              e.stopPropagation();
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
