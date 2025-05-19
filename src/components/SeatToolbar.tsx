import React, {useState} from "react";
import {useSeatMapStore, type Seat} from '@/stores/seatMapStore';
import {Tabs, TabsList, TabsContent, TabsTrigger} from "@/components/ui/tabs";
import {Separator} from "@/components/ui/separator";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Button} from "@/components/ui/button";
import {Label} from "@/components/ui/label";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";
import {Input} from "@/components/ui/input";
import {Slider} from "@/components/ui/slider";
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter} from '@/components/ui/dialog';
import {toast} from "sonner"

export const SeatToolbar: React.FC = () => {
    const {addSeat, addSection, updateStage, setSeatMap} = useSeatMapStore();
    const [seatType, setSeatType] = useState('regular');
    const [seatStatus, setSeatStatus] = useState('available');
    const [sectionColor, setSectionColor] = useState('#D3E4FD');
    const [rowLabel, setRowLabel] = useState('A');
    const [startNumber, setStartNumber] = useState(1);
    const [sectionName, setSectionName] = useState('Main Section');
    const [rowCount, setRowCount] = useState(10);
    const [seatsPerRow, setSeatsPerRow] = useState(10);
    const [sectionWidth, setSectionWidth] = useState(200);
    const [sectionHeight, setSectionHeight] = useState(150);
    const [showSeatGridDialog, setShowSeatGridDialog] = useState(false);
    const [showSectionGridDialog, setShowSectionGridDialog] = useState(false);
    const [template, setTemplate] = useState(null);

    // Generate a grid of seats
    const handleGenerateGrid = () => {
        setShowSeatGridDialog(true);
    };

    // Generate seats within a grid
    const generateSeats = (gridX: number, gridY: number, spacing: number, rowCount: number, seatsPerRow: number) => {
        const seats: Seat[] = [];
        const seatSize = 20; // Standard seat size
        const rowChar = rowLabel.charCodeAt(0);

        for (let row = 0; row < rowCount; row++) {
            const currentRowLabel = String.fromCharCode(rowChar + row);

            for (let seat = 0; seat < seatsPerRow; seat++) {
                const seatNumber = startNumber + seat;
                seats.push({
                    id: `seat-${Date.now()}-${currentRowLabel}-${seatNumber}`,
                    x: gridX + (seat * (seatSize + spacing)),
                    y: gridY + (row * (seatSize + spacing)),
                    type: seatType as 'regular' | 'vip' | 'disabled',
                    row: currentRowLabel,
                    number: seatNumber,
                    status: seatStatus as 'available' | 'selected' | 'sold' | 'disabled'
                });
            }
        }

        return seats;
    };

    // Place seats in grid formation
    const placeSeatGrid = (x: number, y: number, spacing: number, rows: number, cols: number) => {
        const seats = generateSeats(x, y, spacing, rows, cols);
        seats.forEach(seat => addSeat(seat));

        toast("Seats Generated", {
            description: `Added ${seats.length} seats to the canvas`
        });

        setShowSeatGridDialog(false);
    };

    // Create a section and fill it with seats
    const handleAutoFillSection = () => {
        setShowSectionGridDialog(true);
    };

    // Create section with auto-filled seats
    const createSectionWithSeats = (x: number, y: number, rows: number, cols: number, spacing: number) => {
        // Add the section
        const sectionId = `section-${Date.now()}`;
        const calculatedWidth = cols * (20 + spacing) - spacing;
        const calculatedHeight = rows * (20 + spacing) - spacing;

        addSection({
            id: sectionId,
            x,
            y,
            width: calculatedWidth,
            height: calculatedHeight,
            name: sectionName,
            color: sectionColor
        });

        // Add seats within the section
        const seats = generateSeats(x + 10, y + 10, spacing, rows, cols);
        seats.forEach(seat => addSeat(seat));

        toast("Section Created", {
            description: `Section "${sectionName}" with ${seats.length} seats added`
        });

        setShowSectionGridDialog(false);
    };

    // Apply venue template
    const applyTemplate = () => {
        if (template === null) return;

        // Get current floor ID
        const {activeFloorId} = useSeatMapStore.getState().seatMap;

        const baseWidth = 3000;
        const baseHeight = 3000;

        switch (template) {
            case 'theater': {
                // Theater style layout with central stage and fan-like seating
                updateStage({
                    x: baseWidth / 2 - 300,
                    y: 150,
                    width: 600,
                    height: 80,
                    name: 'STAGE',
                    floorId: activeFloorId
                });

                // Orchestra section
                addSection({
                    id: `section-${Date.now()}-orchestra`,
                    x: baseWidth / 2 - 250,
                    y: 250,
                    width: 500,
                    height: 400,
                    name: 'Orchestra',
                    color: '#D3E4FD',
                    floorId: activeFloorId
                });

                // Mezzanine section
                addSection({
                    id: `section-${Date.now()}-mezzanine`,
                    x: baseWidth / 2 - 350,
                    y: 680,
                    width: 700,
                    height: 300,
                    name: 'Mezzanine',
                    color: '#FDE1D3',
                    floorId: activeFloorId
                });

                // Balcony section
                addSection({
                    id: `section-${Date.now()}-balcony`,
                    x: baseWidth / 2 - 400,
                    y: 1010,
                    width: 800,
                    height: 250,
                    name: 'Balcony',
                    color: '#F2FCE2',
                    floorId: activeFloorId
                });

                // Add some example seats
                const orchestraSeats = generateSeats(baseWidth / 2 - 200, 280, 10, 10, 20);
                orchestraSeats.forEach(seat => addSeat(seat));

                toast("Theater Template Applied", {
                    description: "Created stage and seating sections"
                });
                break;
            }
            case 'concert': {
                // Concert hall with stage and various seating sections
                updateStage({
                    x: baseWidth / 2 - 400,
                    y: 150,
                    width: 800,
                    height: 200,
                    name: 'STAGE',
                    floorId: activeFloorId
                });

                // Front section
                addSection({
                    id: `section-${Date.now()}-front`,
                    x: baseWidth / 2 - 350,
                    y: 400,
                    width: 700,
                    height: 300,
                    name: 'Front Section',
                    color: '#D946EF',
                    floorId: activeFloorId
                });

                // Mid section
                addSection({
                    id: `section-${Date.now()}-mid`,
                    x: baseWidth / 2 - 450,
                    y: 750,
                    width: 900,
                    height: 350,
                    name: 'Middle Section',
                    color: '#9b87f5',
                    floorId: activeFloorId
                });

                // Rear section
                addSection({
                    id: `section-${Date.now()}-rear`,
                    x: baseWidth / 2 - 500,
                    y: 1150,
                    width: 1000,
                    height: 400,
                    name: 'Rear Section',
                    color: '#D3E4FD',
                    floorId: activeFloorId
                });

                toast("Concert Hall Template Applied", {
                    description: "Created stage and seating areas"
                });
                break;
            }
            case 'stadium': {
                // Stadium with central field and surrounding seating
                // Field/court
                addSection({
                    id: `section-${Date.now()}-field`,
                    x: baseWidth / 2 - 400,
                    y: baseHeight / 2 - 250,
                    width: 800,
                    height: 500,
                    name: 'Field',
                    color: '#F2FCE2',
                    floorId: activeFloorId
                });

                // North stands
                addSection({
                    id: `section-${Date.now()}-north`,
                    x: baseWidth / 2 - 400,
                    y: baseHeight / 2 - 400,
                    width: 800,
                    height: 100,
                    name: 'North Stand',
                    color: '#FDE1D3',
                    floorId: activeFloorId
                });

                // South stands
                addSection({
                    id: `section-${Date.now()}-south`,
                    x: baseWidth / 2 - 400,
                    y: baseHeight / 2 + 300,
                    width: 800,
                    height: 100,
                    name: 'South Stand',
                    color: '#FDE1D3',
                    floorId: activeFloorId
                });

                // East stands
                addSection({
                    id: `section-${Date.now()}-east`,
                    x: baseWidth / 2 - 550,
                    y: baseHeight / 2 - 250,
                    width: 100,
                    height: 500,
                    name: 'East Stand',
                    color: '#E5DEFF',
                    floorId: activeFloorId
                });

                // West stands
                addSection({
                    id: `section-${Date.now()}-west`,
                    x: baseWidth / 2 + 450,
                    y: baseHeight / 2 - 250,
                    width: 100,
                    height: 500,
                    name: 'West Stand',
                    color: '#E5DEFF',
                    floorId: activeFloorId
                });

                toast("Stadium Template Applied", {
                    description: "Created field and stands"
                });
                break;
            }
            case 'conference': {
                // Conference room with presentation area
                updateStage({
                    x: baseWidth / 2 - 250,
                    y: 150,
                    width: 500,
                    height: 100,
                    name: 'PODIUM',
                    floorId: activeFloorId
                });

                // Main seating area
                addSection({
                    id: `section-${Date.now()}-main`,
                    x: baseWidth / 2 - 350,
                    y: 300,
                    width: 700,
                    height: 600,
                    name: 'Main Seating',
                    color: '#F1F0FB',
                    floorId: activeFloorId
                });

                // Add some example seats in classroom style rows
                const conferenceSeats = generateSeats(baseWidth / 2 - 300, 330, 15, 12, 14);
                conferenceSeats.forEach(seat => addSeat(seat));

                toast("Conference Template Applied", {
                    description: "Created podium and seating area"
                });
                break;
            }
            default:
                toast("Template Not Found", {
                    description: "Selected template could not be applied"
                });
        }
    };

    return (
        <div className="p-4 h-full overflow-y-auto">
            <h2 className="font-semibold text-lg mb-4">
                ابزارهای طراحی
            </h2>

            <Tabs defaultValue="section" className="w-full" dir="rtl">
                {/* <TabsList className="grid grid-cols-2 mb-4">
                    <TabsTrigger value="seat">
                        صندلی‌ها
                    </TabsTrigger>
                    <TabsTrigger value="section">
                        بخش‌ها
                    </TabsTrigger>
                </TabsList> */}

                <TabsContent value="seat" className="space-y-6">
                    <div className="space-y-4">
                        <div>
                            <Label className="text-sm font-medium">
                                نوع صندلی
                            </Label>
                            <RadioGroup
                                defaultValue="regular"
                                value={seatType}
                                onValueChange={setSeatType}
                                className="flex flex-col space-y-1 mt-2"
                                dir="rtl"
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="regular" id="seat-regular"/>
                                    <Label htmlFor="seat-regular" className="cursor-pointer">عادی</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="vip" id="seat-vip"/>
                                    <Label htmlFor="seat-vip" className="cursor-pointer">ویژه</Label>
                                </div>
                            </RadioGroup>
                        </div>

                        <div>
                            <Label className="text-sm font-medium">وضعیت صندلی</Label>
                            <RadioGroup
                                defaultValue="available"
                                value={seatStatus}
                                onValueChange={setSeatStatus}
                                className="flex flex-col space-y-1 mt-2"
                                dir="rtl"
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="available" id="status-available"/>
                                    <Label htmlFor="status-available" className="cursor-pointer">فعال</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="disabled" id="status-disabled"/>
                                    <Label htmlFor="status-disabled" className="cursor-pointer">غیرفعال</Label>
                                </div>
                            </RadioGroup>
                        </div>

                        <Separator/>

                        <div>
                            <Label htmlFor="row" className="text-sm font-medium">عنوان ردیف</Label>
                            <Input
                                id="row"
                                className="mt-1"
                                placeholder="A"
                                value={rowLabel}
                                onChange={(e) => setRowLabel(e.target.value)}
                            />
                        </div>

                        <div>
                            <Label htmlFor="startNumber" className="text-sm font-medium">شماره شروع</Label>
                            <Input
                                id="startNumber"
                                className="mt-1"
                                type="number"
                                min="1"
                                value={startNumber}
                                onChange={(e) => setStartNumber(parseInt(e.target.value))}
                            />
                        </div>

                        <div className="pt-2">
                            <Button onClick={handleGenerateGrid} className="w-full bg-cyan-300 hover:bg-cyan-400">
                                ایجاد صندلی‌ها
                            </Button>
                        </div>
                    </div>
                </TabsContent>
                <TabsContent value="section" className="space-y-6">
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="sectionName" className="text-sm font-medium">نام بخش</Label>
                            <Input
                                id="sectionName"
                                className="mt-1"
                                placeholder="Main Floor"
                                value={sectionName}
                                onChange={(e) => setSectionName(e.target.value)}
                            />
                        </div>

                        <div>
                            <Label htmlFor="sectionColor" className="text-sm font-medium">رنگ بخش</Label>
                            <div className="flex mt-1 space-x-2">
                                <div
                                    className="w-8 h-8 rounded border border-gray-300"
                                    style={{backgroundColor: sectionColor}}
                                />
                                <Input
                                    id="sectionColor"
                                    type="color"
                                    value={sectionColor}
                                    onChange={(e) => setSectionColor(e.target.value)}
                                    className="w-full h-8"
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="sectionWidth" className="text-sm font-medium">عرض</Label>
                            <div className="flex items-center space-x-2 mt-1">
                                <Slider
                                    value={[sectionWidth]}
                                    max={800}
                                    min={50}
                                    step={10}
                                    onValueChange={(value) => setSectionWidth(value[0])}
                                    className="w-full"
                                />
                                <span className="text-sm w-16">{sectionWidth}px</span>
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="sectionHeight" className="text-sm font-medium">ارتفاع</Label>
                            <div className="flex items-center space-x-2 mt-1">
                                <Slider
                                    value={[sectionHeight]}
                                    max={600}
                                    min={50}
                                    step={10}
                                    onValueChange={(value) => setSectionHeight(value[0])}
                                    className="w-full"
                                />
                                <span className="text-sm w-16">{sectionHeight}px</span>
                            </div>
                        </div>

                        <Separator/>

                        <div>
                            <Label htmlFor="rowCount" className="text-sm font-medium">تعداد ردیف</Label>
                            <Input
                                id="rowCount"
                                className="mt-1"
                                type="number"
                                min="1"
                                value={rowCount}
                                onChange={(e) => setRowCount(parseInt(e.target.value))}
                            />
                        </div>

                        <div>
                            <Label htmlFor="seatsPerRow" className="text-sm font-medium">صندلی در هر ردیف</Label>
                            <Input
                                id="seatsPerRow"
                                className="mt-1"
                                type="number"
                                min="1"
                                value={seatsPerRow}
                                onChange={(e) => setSeatsPerRow(parseInt(e.target.value))}
                            />
                        </div>

                        <div className="pt-2">
                            <Button onClick={handleAutoFillSection}
                                    className="w-full bg-amber-300 text-black hover:bg-amber-400">
                                پرکردن خودکار بخش
                            </Button>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>

            <Separator className="my-6"/>

            <div className="space-y-4">
                <h3 className="font-medium">طرح‌های آماده</h3>
                <Select onValueChange={setTemplate} dir="rtl">
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="انتخاب طرح"/>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="theater">تئاتر</SelectItem>
                        <SelectItem value="concert">سالن کنسرت</SelectItem>
                        <SelectItem value="stadium">استادیوم</SelectItem>
                        <SelectItem value="conference">کنفرانس</SelectItem>
                    </SelectContent>
                </Select>

                <Button variant="outline" className="w-full" onClick={applyTemplate}>
                    اعمال طرح
                </Button>
            </div>

            {/* Seat Grid Dialog */}
            <Dialog open={showSeatGridDialog} onOpenChange={setShowSeatGridDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Generate Seat Grid</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="gridX">X Position</Label>
                                <Input id="gridX" type="number" defaultValue={800}/>
                            </div>
                            <div>
                                <Label htmlFor="gridY">Y Position</Label>
                                <Input id="gridY" type="number" defaultValue={400}/>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="gridRows">Rows</Label>
                                <Input id="gridRows" type="number" min="1" defaultValue={rowCount}/>
                            </div>
                            <div>
                                <Label htmlFor="gridCols">Columns</Label>
                                <Input id="gridCols" type="number" min="1" defaultValue={seatsPerRow}/>
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="gridSpacing">Spacing (px)</Label>
                            <Input id="gridSpacing" type="number" min="0" defaultValue={5}/>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowSeatGridDialog(false)}>Cancel</Button>
                        <Button onClick={() => {
                            const x = parseInt((document.getElementById('gridX') as HTMLInputElement).value);
                            const y = parseInt((document.getElementById('gridY') as HTMLInputElement).value);
                            const rows = parseInt((document.getElementById('gridRows') as HTMLInputElement).value);
                            const cols = parseInt((document.getElementById('gridCols') as HTMLInputElement).value);
                            const spacing = parseInt((document.getElementById('gridSpacing') as HTMLInputElement).value);
                            placeSeatGrid(x, y, spacing, rows, cols);
                        }}>Generate Seats</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Section Grid Dialog */}
            <Dialog open={showSectionGridDialog} onOpenChange={setShowSectionGridDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create Section with Seats</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="sectionX">X Position</Label>
                                <Input id="sectionX" type="number" defaultValue={800}/>
                            </div>
                            <div>
                                <Label htmlFor="sectionY">Y Position</Label>
                                <Input id="sectionY" type="number" defaultValue={400}/>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="sectionRows">Rows</Label>
                                <Input id="sectionRows" type="number" min="1" value={rowCount}
                                       onChange={(e) => setRowCount(parseInt(e.target.value))}/>
                            </div>
                            <div>
                                <Label htmlFor="sectionCols">Columns</Label>
                                <Input id="sectionCols" type="number" min="1" value={seatsPerRow}
                                       onChange={(e) => setSeatsPerRow(parseInt(e.target.value))}/>
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="seatSpacing">Seat Spacing (px)</Label>
                            <Input id="seatSpacing" type="number" min="0" defaultValue={10}/>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowSectionGridDialog(false)}>Cancel</Button>
                        <Button onClick={() => {
                            const x = parseInt((document.getElementById('sectionX') as HTMLInputElement).value);
                            const y = parseInt((document.getElementById('sectionY') as HTMLInputElement).value);
                            const rows = parseInt((document.getElementById('sectionRows') as HTMLInputElement).value);
                            const cols = parseInt((document.getElementById('sectionCols') as HTMLInputElement).value);
                            const spacing = parseInt((document.getElementById('seatSpacing') as HTMLInputElement).value);
                            createSectionWithSeats(x, y, rows, cols, spacing);
                        }}>Create Section</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
};
