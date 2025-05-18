import { Button } from '@/components/ui/button';
import { Move, Plus, Grid3x3 } from 'lucide-react';

interface ToolSelectorProps {
    selectedTool: string | null;
    onToolSelect: (tool: string | null) => void;
    showHelp: boolean;
    setShowHelp: boolean;
}

export const ToolSelector: React.FC<ToolSelectorProps> = ({ selectedTool, onToolSelect, showHelp, setShowHelp }) => {
    return (
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
    );
};