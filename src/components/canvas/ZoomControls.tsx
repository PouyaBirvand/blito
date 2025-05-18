import React from 'react';
import { Button } from '@/components/ui/button';

interface ZoomControlsProps {
    onZoomIn: () => void;
    onZoomOut: () => void;
    onReset: () => void;
}

export const ZoomControls: React.FC<ZoomControlsProps> = ({ onZoomIn, onZoomOut, onReset }) => {
    return (
        <div className="absolute bottom-24 md:bottom-5 left-4 flex space-x-2 z-10 bg-white rounded-md shadow p-2">
            <Button size="sm" variant="outline" onClick={onZoomIn}>+</Button>
            <Button size="sm" variant="outline" onClick={onReset}>بازنشانی</Button>
            <Button size="sm" variant="outline" onClick={onZoomOut}>-</Button>
        </div>
    );
};