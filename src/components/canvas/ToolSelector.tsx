import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Move, Plus, Grid3x3, Trash2, X } from 'lucide-react';
import { useSeatMapStore } from '@/stores/seatMapStore';

interface ToolSelectorProps {
    selectedTool: string | null;
    onToolSelect: (tool: string | null) => void;
    showHelp: boolean;
    setShowHelp: (show: boolean) => void;
}

export const ToolSelector: React.FC<ToolSelectorProps> = ({ 
    selectedTool, 
    onToolSelect, 
    showHelp, 
    setShowHelp 
}) => {
    const { removeAllSeats } = useSeatMapStore();
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    
    return (
        <>
            <div className="absolute top-2 flex space-x-2 z-10 bg-white rounded-md shadow p-2">
                <Button
                    size="sm"
                    variant={selectedTool === 'seat' ? 'default' : 'outline'}
                    className={selectedTool === 'seat' ? 'bg-primary' : ''}
                    onClick={() => onToolSelect(selectedTool === 'seat' ? null : 'seat')}
                >
                    <Plus className="h-4 w-4 mr-1" />
                    صندلی <span className="ml-1 text-xs opacity-70">(S)</span>
                </Button>
                <Button
                    size="sm"
                    variant={selectedTool === 'section' ? 'default' : 'outline'}
                    className={selectedTool === 'section' ? 'bg-primary' : ''}
                    onClick={() => onToolSelect(selectedTool === 'section' ? null : 'section')}
                >
                    <Grid3x3 className="h-4 w-4 mr-1" />
                    بخش <span className="ml-1 text-xs opacity-70">(C)</span>
                </Button>
                <Button
                    size="sm"
                    variant={selectedTool === 'stage' ? 'default' : 'outline'}
                    className={selectedTool === 'stage' ? 'bg-primary' : ''}
                    onClick={() => onToolSelect(selectedTool === 'stage' ? null : 'stage')}
                >
                    Stage <span className="ml-1 text-xs opacity-70">(T)</span>
                </Button>
                <Button
                    size="sm"
                    variant={selectedTool === 'move' ? 'default' : 'outline'}
                    onClick={() => onToolSelect(selectedTool === 'move' ? null : 'move')}
                >
                    <Move className="h-4 w-4 mr-1" />
                    Move <span className="ml-1 text-xs opacity-70">(M)</span>
                </Button>
                
                {/* دکمه حذف گروهی صندلی‌ها */}
                <Button
                    size="sm"
                    variant="destructive"
                    className="bg-red-500 hover:bg-red-600"
                    onClick={() => setShowConfirmDialog(true)}
                >
                    <Trash2 className="h-4 w-4 mr-1" />
                    حذف همه صندلی‌ها
                </Button>
                
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowHelp(prev => !prev)}
                    className="bg-white/80 backdrop-blur-sm"
                >
                    <p>
                        {showHelp ? "Hide Help" : "Show Help"}
                        <span className="ml-1 text-xs opacity-70">(H)</span>
                    </p>
                </Button>
            </div>
            
            {/* دیالوگ تأیید دستی */}
            {showConfirmDialog && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium">حذف همه صندلی‌ها</h3>
                            <button 
                                onClick={() => setShowConfirmDialog(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        
                        <div className="mb-6">
                            <p className="text-gray-600">
                                آیا مطمئن هستید که می‌خواهید تمام صندلی‌ها را حذف کنید؟ این عمل قابل بازگشت نیست.
                            </p>
                        </div>
                        
                        <div className="flex justify-end space-x-2">
                            <Button
                                variant="outline"
                                onClick={() => setShowConfirmDialog(false)}
                                className="ml-2"
                            >
                                انصراف
                            </Button>
                            <Button
                                variant="destructive"
                                className="bg-red-500 hover:bg-red-600"
                                onClick={() => {
                                    removeAllSeats();
                                    setShowConfirmDialog(false);
                                }}
                            >
                                حذف همه
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
