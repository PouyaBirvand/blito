import React, {useEffect, useState} from "react";
import {useSeatMapCanvas} from '@/hooks/useSeatMapCanvas';
import {ZoomControls} from '@/components/canvas/ZoomControls';
import {ToolSelector} from '@/components/canvas/ToolSelector';
import {SeatElement} from '@/components/canvas/SeatElement';
import {SectionElement} from "@/components/canvas/SectionElement";
import {FloorSelector} from '@/components/canvas/FloorSelector';
import {StageElement} from '@/components/canvas/StageElement';
import {toast} from "sonner";
import {Skeleton} from '@/components/ui/skeleton';

interface SeatMapCanvasProps {
editable: boolean;
isLoading?: boolean;
}

export const SeatMapCanvas: React.FC<SeatMapCanvasProps> = ({editable, isLoading = false}) => {
const {
seatMap,
selectedTool,
setSelectedTool,
scale,
dragging,
originX,
originY,
canvasRef,
containerRef,
removeElement,
zoomIn,
zoomOut,
resetZoom,
handleMouseDown,
handleMouseMove,
handleMouseUp,
handleElementMouseDown,
handleResizerMouseDown,
handleCanvasClick
} = useSeatMapCanvas();

const [showHelp, setShowHelp] = useState<boolean>(false);

useEffect(() => {
// We'll use this effect to display toasts when needed
if (selectedTool) {
    const handleKeyPress = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
            setSelectedTool(null);
        }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => {
        window.removeEventListener('keydown', handleKeyPress);
    }
}
}, [selectedTool, setSelectedTool]);

// Keyboard shortcut event listener
useEffect(() => {
if (!editable) return; // Only add shortcuts when canvas is editable

const handleKeyboardShortcuts = (e: KeyboardEvent) => {
    // Ignore shortcuts when user is typing in input fields
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
    }
    
    switch (e.key.toLowerCase()) {
        case 's':
            setSelectedTool(selectedTool === 'seat' ? null : 'seat');
            toast(selectedTool === 'seat' ? "Seat tool deactivated" : "Seat tool activated", {
                duration: 2000,
            });
            break;
        case 'c':
            setSelectedTool(selectedTool === 'section' ? null : 'section');
            toast(selectedTool === 'section' ? "Section tool deactivated" : "Section tool activated", {
                duration: 2000,
            });
            break;
        case 't':
            setSelectedTool(selectedTool === 'stage' ? null : 'stage');
            toast(selectedTool === 'stage' ? "Stage tool deactivated" : "Stage tool activated", {
                duration: 2000,
            });
            break;
        case 'm':
            setSelectedTool(selectedTool === 'move' ? null : 'move');
            toast(selectedTool === 'move' ? "Move tool deactivated" : "Move tool activated", {
                duration: 2000,
            });
            break;
        case 'escape':
            if (selectedTool) {
                setSelectedTool(null);
                toast("Tool selection canceled", {
                    duration: 2000,
                });
            }
            break;
        case '+':
        case '=':
            zoomIn();
            break;
        case '-':
            zoomOut();
            break;
        case '0':
            resetZoom();
            break;
        case 'h':
            setShowHelp(prev => !prev);
            break;
        default:
            break;
    }
};

window.addEventListener('keydown', handleKeyboardShortcuts);
return () => {
    window.removeEventListener('keydown', handleKeyboardShortcuts);
};
}, [editable, selectedTool, setSelectedTool, zoomIn, zoomOut, resetZoom]);

// Get elements for current floor only
const activeFloorId = seatMap.activeFloorId;
const visibleSeats = seatMap.seats.filter(seat => seat.floorId === activeFloorId);
const visibleSections = seatMap.sections.filter(section => section.floorId === activeFloorId);
const showStage = seatMap.stage.floorId === activeFloorId;

// Loading state content
if (isLoading) {
return (
    <div className="relative w-full h-full flex flex-col">
        <div className="absolute top-4 left-4 z-10">
            <Skeleton className="h-8 w-24"/>
        </div>
        {editable && (
            <div className="absolute top-4 right-4 z-10">
                <Skeleton className="h-8 w-32"/>
            </div>
        )}
        <div className="flex-1 relative overflow-hidden bg-gray-200 rounded-lg">
            <div className="w-full h-full flex flex-col items-center justify-center">
                <Skeleton className="h-8 w-48 mb-4"/>
                <Skeleton className="h-24 w-64"/>
                <div className="grid grid-cols-5 gap-4 mt-8">
                    {Array(10).fill(0).map((_, i) => (
                        <Skeleton key={i} className="h-5 w-5"/>
                    ))}
                </div>
            </div>
        </div>
    </div>
);
}

return (
<div className="relative w-full h-full flex flex-col">
    <ZoomControls
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onReset={resetZoom}
    />
    
    {editable && (
        <>
            <ToolSelector
                selectedTool={selectedTool}
                onToolSelect={setSelectedTool}
                setShowHelp={setShowHelp}
                ShowHelp={showHelp}
                
            />
            <div className="absolute top-4 right-4 z-10">
                <FloorSelector/>
            </div>
        </>
    )}
    
    <div
        ref={containerRef}
        className="flex-1 relative overflow-hidden bg-gray-200 rounded-lg"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
    >
        <div
            ref={canvasRef}
            className="w-[3000px] h-[3000px] absolute origin-top-left"
            style={{
                cursor: dragging ? 'grabbing' : (selectedTool === 'move' ? 'grab' : 
                       selectedTool === 'seat' ? 'cell' : 
                       selectedTool === 'section' ? 'crosshair' : 
                       selectedTool === 'stage' ? 'pointer' : 'default'),
                backgroundColor: '#f8f9fa',
                backgroundImage: 'radial-gradient(#e0e0e0 1px, transparent 1px)',
                backgroundSize: '20px 20px',
                transform: `scale(${scale}) translate(${originX}px, ${originY}px)`,
                transformOrigin: '0 0',
            }}
            onClick={handleCanvasClick}
        >
            {showStage && (
                <StageElement
                    editable={editable}
                    onMouseDown={handleElementMouseDown}
                    onResizerMouseDown={handleResizerMouseDown}
                />
            )}
            
            {/* Sections */}
            {visibleSections.map((section) => (
                <SectionElement
                    key={section.id}
                    section={section}
                    editable={editable}
                    onMouseDown={handleElementMouseDown}
                    onResizerMouseDown={handleResizerMouseDown}
                    onRemove={removeElement}
                />
            ))}
            
            {/* Seats */}
            {visibleSeats.map((seat) => (
                <SeatElement
                    key={seat.id}
                    seat={seat}
                    editable={editable}
                    onMouseDown={handleElementMouseDown}
                    onRemove={removeElement}
                />
            ))}
        </div>
        
        {/* Status indicator */}
        <div className="absolute bottom-20 right-4 p-2 bg-white/80 backdrop-blur-sm rounded-md text-xs text-gray-600 shadow-sm">
            <p>Zoom: {Math.round(scale * 100)}%</p>
            <p>Active Tool: {selectedTool || 'None'}</p>
            <p>Seats: {visibleSeats.length}</p>
            <p>Sections: {visibleSections.length}</p>
        </div>
    </div>
    
    {editable && showHelp && (
        <div
            className="absolute bottom-4 right-4 p-3 bg-white/90 backdrop-blur-sm rounded-md text-xs text-gray-600 shadow-sm max-w-xs"
            dir="rtl"
        >
            <p className="font-semibold mb-2">شورتکات‌های کیبورد:</p>
            <div className="grid grid-cols-2 gap-2">
                <span><kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded">S</kbd> ابزار صندلی</span>
                <span><kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded">C</kbd> ابزار بخش</span>
                <span><kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded">T</kbd> ابزار صحنه</span>
                <span><kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded">M</kbd> ابزار حرکت</span>
                <span><kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded">+</kbd> بزرگنمایی</span>
                <span><kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded">-</kbd> کوچک‌نمایی</span>
                <span><kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded">0</kbd> اندازه اصلی</span>
                <span><kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded">H</kbd> راهنما</span>
                <span><kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded">Esc</kbd> لغو ابزار</span>
            </div>
            
            <p className="font-semibold mt-3 mb-1">راهنمای استفاده:</p>
            <ul className="list-disc list-inside space-y-1">
                <li>برای حرکت دادن نقشه، ابزار حرکت را انتخاب کنید یا هیچ ابزاری انتخاب نکنید و سپس بکشید.</li>
                <li>برای جابجایی صندلی‌ها، بخش‌ها یا صحنه، روی آنها کلیک کرده و بکشید.</li>
                <li>برای تغییر اندازه بخش‌ها یا صحنه، از دستگیره گوشه پایین راست استفاده کنید.</li>
                <li>برای حذف یک عنصر، روی دکمه ضربدر قرمز کلیک کنید.</li>
            </ul>
        </div>
    )}
    
    {editable && !showHelp && (
        <div
            className="absolute bottom-4 right-4 p-2 bg-white/80 backdrop-blur-sm rounded-md text-xs text-gray-600 shadow-sm"
            dir="rtl"
        >
            <p>برای نمایش راهنما، دکمه "Show Help" را بزنید یا کلید <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded">H</kbd> را فشار دهید.</p>
        </div>
    )}
</div>
);
};