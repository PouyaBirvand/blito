import React, {useState} from 'react';
import {Button} from '@/components/ui/button';
import {useSeatMapStore, type Floor} from '@/stores/seatMapStore';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter} from '@/components/ui/dialog';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {toast} from 'sonner';

export const FloorSelector: React.FC = () => {
    const {seatMap, addFloor, setActiveFloor, updateFloor, removeFloor} = useSeatMapStore();
    const [isAddingFloor, setIsAddingFloor] = useState(false);
    const [isEditingFloor, setIsEditingFloor] = useState(false);
    const [newFloorName, setNewFloorName] = useState('');
    const [newFloorLevel, setNewFloorLevel] = useState(1);
    const [selectedFloor, setSelectedFloor] = useState<Floor | null>(null);

    const handleAddFloor = () => {
        if (!newFloorName.trim()) {
            toast.error("Floor name cannot be empty");
            return;
        }

        const newFloor = {
            id: `floor-${Date.now()}`,
            name: newFloorName,
            level: newFloorLevel
        };

        addFloor(newFloor);
        setActiveFloor(newFloor.id);
        setIsAddingFloor(false);
        setNewFloorName('');
        setNewFloorLevel(seatMap.floors.length + 1);

        toast(`Floor "${newFloorName}" added`);
    };

    const handleEditFloor = () => {
        if (!selectedFloor) return;
        if (!newFloorName.trim()) {
            toast.error("Floor name cannot be empty");
            return;
        }

        updateFloor(selectedFloor.id, {
            name: newFloorName,
            level: newFloorLevel
        });

        setIsEditingFloor(false);
        setSelectedFloor(null);
        toast(`Floor updated`);
    };

    const handleDeleteFloor = (floor: Floor) => {
        if (seatMap.floors.length <= 1) {
            toast.error("Cannot delete the only floor");
            return;
        }

        if (confirm(`Are you sure you want to delete the floor "${floor.name}"? All elements on this floor will be deleted.`)) {
            removeFloor(floor.id);
            toast(`Floor "${floor.name}" deleted`);
        }
    };

    const startEditFloor = (floor: Floor) => {
        setSelectedFloor(floor);
        setNewFloorName(floor.name);
        setNewFloorLevel(floor.level);
        setIsEditingFloor(true);
    };

    const getActiveFloor = () => {
        return seatMap.floors.find(floor => floor.id === seatMap.activeFloorId) || seatMap.floors[0];
    };

    return (
        <>
            <DropdownMenu dir="rtl">
                <DropdownMenuTrigger asChild>
                    <Button dir="rtl" variant="outline" className="bg-white/90 text-black">
                        طبقه: {getActiveFloor()?.name || 'همکف'}
                        <span className="mr-1 opacity-70">▼</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                    {seatMap.floors.map((floor) => (
                        <DropdownMenuItem
                            key={floor.id}
                            className={floor.id === seatMap.activeFloorId ? 'bg-blue-50 font-medium' : ''}
                            onClick={() => setActiveFloor(floor.id)}
                        >
                            {floor.name}
                            <span className="mr-auto opacity-60 text-xs">طبقه {floor.level}</span>
                        </DropdownMenuItem>
                    ))}

                    <DropdownMenuSeparator/>

                    <DropdownMenuItem onSelect={(e) => {
                        e.preventDefault();
                        setIsAddingFloor(true);
                        setNewFloorLevel(seatMap.floors.length + 1);
                    }}>
                        افزودن طبقه جدید...
                    </DropdownMenuItem>

                    {seatMap.floors.length > 1 && (
                        <>
                            <DropdownMenuItem onSelect={(e) => {
                                e.preventDefault();
                                startEditFloor(getActiveFloor());
                            }}>
                                Edit Current Floor...
                            </DropdownMenuItem>

                            <DropdownMenuItem
                                className="text-red-600"
                                onSelect={(e) => {
                                    e.preventDefault();
                                    handleDeleteFloor(getActiveFloor());
                                }}
                            >
                                Delete Current Floor
                            </DropdownMenuItem>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Add Floor Dialog */}
            <Dialog open={isAddingFloor} onOpenChange={setIsAddingFloor}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>افزودن طبقه جدید</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="floorName">نام طبقه</Label>
                            <Input
                                id="floorName"
                                value={newFloorName}
                                onChange={(e) => setNewFloorName(e.target.value)}
                                placeholder="به عنوان مثال طبقه دوم، بالکن و غیره"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="floorLevel">شماره طبقه</Label>
                            <Input
                                id="floorLevel"
                                type="number"
                                value={newFloorLevel}
                                onChange={(e) => setNewFloorLevel(parseInt(e.target.value) || 1)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddingFloor(false)}>لغو</Button>
                        <Button onClick={handleAddFloor}>افزودن طبقه</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Floor Dialog */}
            <Dialog open={isEditingFloor} onOpenChange={setIsEditingFloor}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>ویرایش طبقه</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="editFloorName">نام طبقه</Label>
                            <Input
                                id="editFloorName"
                                value={newFloorName}
                                onChange={(e) => setNewFloorName(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="editFloorLevel">Floor Level</Label>
                            <Input
                                id="editFloorLevel"
                                type="number"
                                value={newFloorLevel}
                                onChange={(e) => setNewFloorLevel(parseInt(e.target.value) || 1)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditingFloor(false)}>Cancel</Button>
                        <Button onClick={handleEditFloor}>Update Floor</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};