    import React, {useState} from 'react';
    import {useSeatMapStore} from '@/stores/seatMapStore';

    interface StageElementProps {
        editable: boolean;
        onMouseDown?: (e: React.MouseEvent, id: string) => void;
        onResizerMouseDown?: (e: React.MouseEvent, id: string, width: number, height: number) => void;
    }

    export const StageElement: React.FC<StageElementProps> = ({
                                                                editable,
                                                                onMouseDown,
                                                                onResizerMouseDown
                                                            }) => {
        const {seatMap, updateStage} = useSeatMapStore();
        const {stage} = seatMap;
        const [isEditing, setIsEditing] = useState(false);
        const [stageName, setStageName] = useState(stage.name || 'STAGE');

        const handleNameClick = (e: React.MouseEvent) => {
            if (!editable) return;
            e.stopPropagation();
            setIsEditing(true);
        };

        const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            setStageName(e.target.value);
        };

        const handleNameBlur = () => {
            updateStage({name: stageName});
            setIsEditing(false);
        };

        const handleKeyDown = (e: React.KeyboardEvent) => {
            if (e.key === 'Enter') {
                handleNameBlur();
            }
        };

        return (
            <div
                className="absolute top-[100px] left-[1200px] w-[600px] h-[80px] bg-gray-300 rounded-md flex items-center justify-center"
                style={{
                    left: `${stage.x}px`,
                    top: `${stage.y}px`,
                    width: `${stage.width}px`,
                    height: `${stage.height}px`
                }}
                onMouseDown={editable && onMouseDown ? (e) => onMouseDown(e, "stage") : undefined}
            >
                {isEditing ? (
                    <input
                        type="text"
                        value={stageName}
                        onChange={handleNameChange}
                        onBlur={handleNameBlur}
                        onKeyDown={handleKeyDown}
                        className="bg-transparent text-white font-bold text-center focus:outline-none"
                        autoFocus
                    />
                ) : (
                    <span className="text-white font-bold select-none" onClick={handleNameClick}>
                        {stage.name || 'STAGE'}
                    </span>
                )}

                {editable && onResizerMouseDown && (
                    <div
                        className="absolute bottom-0 right-0 w-4 h-4 bg-white border border-gray-400 cursor-se-resize"
                        onMouseDown={(e) => {
                            e.stopPropagation();
                            onResizerMouseDown(e, "stage", stage.width, stage.height);
                        }}
                    />
                )}
            </div>
        );
    };