import {useState, useRef, useEffect} from 'react';
import {useSeatMapStore} from '@/stores/seatMapStore';
import * as React from "react";

export function useSeatMapCanvas() {
    const {seatMap, addSeat, removeElement, addSection, updateElement, updateStage , setSeatMap} = useSeatMapStore();
    const [selectedTool, setSelectedTool] = useState<string | null>(null);
    const [scale, setScale] = useState(1);
    const [dragging, setDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [startY, setStartY] = useState(0);
    const [originX, setOriginX] = useState(0);
    const [originY, setOriginY] = useState(0);
    const [draggedElement, setDraggedElement] = useState<{
        id: string,
        startX: number,
        startY: number,
        initialLeft: number,
        initialTop: number
    } | null>(null);
    const [resizing, setResizing] = useState<{
        id: string,
        startX: number,
        startY: number,
        initialWidth: number,
        initialHeight: number
    } | null>();
    const canvasRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Center the view on component mount
    useEffect(() => {
        if (containerRef.current && canvasRef.current) {
            const containerWidth = containerRef.current.clientWidth;
            const containerHeight = containerRef.current.clientHeight;
            const viewportCenterX = containerWidth / 2;
            const viewportCenterY = containerHeight / 2;
            
            // Calculate origin to center the stage
            const stageX = seatMap.stage.x + (seatMap.stage.width / 2);
            const stageY = seatMap.stage.y + (seatMap.stage.height / 2);
            
            // Position the origin so the stage is centered
            const newOriginX = viewportCenterX / scale - stageX;
            const newOriginY = viewportCenterY / scale - stageY;
            setOriginX(newOriginX);
            setOriginY(newOriginY);
        }
    }, []);

    // Zoom controls
    const zoomIn = () => {
        setScale(prev => Math.min(prev * 1.2, 3));
    };

    const zoomOut = () => {
        setScale(prev => Math.max(prev / 1.2, 0.3));
    };

    const resetZoom = () => {
        setScale(1);
        if (containerRef.current) {
            const containerWidth = containerRef.current.clientWidth;
            const containerHeight = containerRef.current.clientHeight;
            const viewportCenterX = containerWidth / 2;
            const viewportCenterY = containerHeight / 2;
            
            // Calculate the center of the canvas
            const stageX = seatMap.stage.x + (seatMap.stage.width / 2);
            const stageY = seatMap.stage.y + (seatMap.stage.height / 2);
            
            // Position the origin so the stage is centered
            const newOriginX = viewportCenterX - stageX;
            const newOriginY = viewportCenterY - stageY;
            setOriginX(newOriginX);
            setOriginY(newOriginY);
        }
    };

    // Pan functionality
    const handleMouseDown = (e: React.MouseEvent) => {
        if (!canvasRef.current || draggedElement || resizing) return;
        // Only pan if the move tool is selected or no tool is selected
        if (selectedTool !== null && selectedTool !== 'move') return;
        setDragging(true);
        setStartX(e.clientX);
        setStartY(e.clientY);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (draggedElement) {
            handleElementMouseMove(e);
            return;
        }
        if (resizing) {
            handleResizerMouseMove(e);
            return;
        }
        if (!dragging) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        setOriginX(originX + dx / scale);
        setOriginY(originY + dy / scale);
        setOriginX(originX + dx / scale);
        setOriginY(originY + dy / scale);
        setStartX(e.clientX);
        setStartY(e.clientY);
    };

    const handleMouseUp = () => {
        setDragging(false);
        handleElementMouseUp();
        handleResizerMouseUp();
    };

    // Element drag handlers
    const handleElementMouseDown = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (id === "stage") {
            const startX = e.clientX;
            const startY = e.clientY;
            const initialLeft = seatMap.stage.x;
            const initialTop = seatMap.stage.y;
            setDraggedElement({id, startX, startY, initialLeft, initialTop});
            return;
        }
        const element = e.currentTarget as HTMLElement;
        const startX = e.clientX;
        const startY = e.clientY;
        const initialLeft = parseInt(element.style.left || '0', 10);
        const initialTop = parseInt(element.style.top || '0', 10);
        setDraggedElement({id, startX, startY, initialLeft, initialTop});
    };

    const handleElementMouseMove = (e: React.MouseEvent) => {
        if (!draggedElement) return;
        const dx = (e.clientX - draggedElement.startX) / scale;
        const dy = (e.clientY - draggedElement.startY) / scale;
        const newX = draggedElement.initialLeft + dx;
        const newY = draggedElement.initialTop + dy;
        if (draggedElement.id === "stage") {
            updateStage({x: newX, y: newY});
            return;
        }
        updateElement(draggedElement.id, {x: newX, y: newY});
    };

    const handleElementMouseUp = () => {
        setDraggedElement(null);
    };

    // Resize handlers
    const handleResizerMouseDown = (e: React.MouseEvent, id: string, width: number, height: number) => {
        e.stopPropagation();
        const startX = e.clientX;
        const startY = e.clientY;
        setResizing({id, startX, startY, initialWidth: width, initialHeight: height});
    };

    const handleResizerMouseMove = (e: React.MouseEvent) => {
        if (!resizing) return;
        const dx = (e.clientX - resizing.startX) / scale;
        const dy = (e.clientY - resizing.startY) / scale;
        const newWidth = Math.max(50, resizing.initialWidth + dx);
        const newHeight = Math.max(50, resizing.initialHeight + dy);
        if (resizing.id === "stage") {
            updateStage({width: newWidth, height: newHeight});
            return;
        }
        updateElement(resizing.id, {width: newWidth, height: newHeight});
    };

    const handleResizerMouseUp = () => {
        setResizing(null);
    };

    // Canvas click handler
    const handleCanvasClick = (e: React.MouseEvent) => {
        if (!selectedTool || draggedElement || resizing) return;
        if (!canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const clickX = (e.clientX - rect.left) / scale;
        const clickY = (e.clientY - rect.top) / scale;
        if (selectedTool === 'seat') {
            addSeat({
                id: `seat-${Date.now()}`,
                x: clickX,
                y: clickY,
                type: 'regular',
                row: 'A',
                number: 1,
                status: 'available',
            });
        } else if (selectedTool === "section") {
            addSection({
                id: `section-${Date.now()}`,
                x: clickX,
                y: clickY,
                width: 200,
                height: 150,
                name: 'New Section',
                color: '#D3E4FD',
            });
        } else if (selectedTool === 'stage') {
            updateStage({
                x: clickX - 150,
                y: clickY - 40,
                width: 300,
                height: 80,
                name: 'STAGE'
            });
        }
    };

    // Handle section updates (for name changes, etc.)
// Example of how the onUpdate function should be implemented in parent component
const handleSectionUpdate = (id: string, updates: any) => {
    setSeatMap(prevSeatMap => ({
      ...prevSeatMap,
      sections: prevSeatMap.sections.map(section => 
        section.id === id ? { ...section, ...updates } : section
      )
    }));
  };

    return {
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
        addSeat,
        addSection,
        updateElement: handleSectionUpdate,
        zoomIn,
        zoomOut,
        resetZoom,
        handleMouseDown,
        handleMouseMove,
        handleMouseUp,
        handleElementMouseDown,
        handleResizerMouseDown,
        handleCanvasClick,
    };
}





