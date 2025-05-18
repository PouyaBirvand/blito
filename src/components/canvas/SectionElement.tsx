import React from 'react';
import type {Section} from '@/stores/seatMapStore';

interface SectionElementProps {
    section: Section;
    editable: boolean;
    onMouseDown: (e: React.MouseEvent, id: string) => void;
    onResizerMouseDown: (e: React.MouseEvent, id: string, width: number, height: number) => void;
    onRemove: (id: string) => void;
}

export const SectionElement: React.FC<SectionElementProps> = ({
                                                                  section,
                                                                  editable,
                                                                  onMouseDown,
                                                                  onResizerMouseDown,
                                                                  onRemove
                                                              }) => {
    return (
        <div
            className={`absolute rounded-md border-2 flex items-center justify-center ${editable ? 'cursor-move' : ''}`}
            style={{
                left: section.x + 'px',
                top: section.y + 'px',
                width: section.width + 'px',
                height: section.height + 'px',
                backgroundColor: section.color,
                borderColor: '#9b87f5',
            }}
            onMouseDown={(e) => editable && onMouseDown(e, section.id)}
        >
      <span className="text-sm font-medium select-none pointer-events-none">
        {section.name}
      </span>

            {editable && (
                <>
                    <button
                        className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center bg-red-500 text-white rounded-full"
                        onClick={(e) => {
                            e.stopPropagation();
                            onRemove(section.id);
                        }}
                    >
                        ×
                    </button>

                    <div
                        className="absolute bottom-0 right-0 w-4 h-4 bg-white border border-gray-400 rounded-bl-md cursor-se-resize"
                        onMouseDown={(e) => onResizerMouseDown(e, section.id, section.width, section.height)}
                    />
                </>
            )}
        </div>
    );
};