import { create } from "zustand";
import type { Seat, Section, Stage, Floor, SeatMap } from "@/types/seatMap";

interface SeatMapStore {
  seatMap: SeatMap;
  setSeatMap: (seatMap: SeatMap) => void;
  setTitle: (title: string) => void;
  setVenue: (venue: string) => void;
  addSeat: (seat: Seat) => void;
  addSection: (section: Section) => void;
  updateElement: (id: string, updates: Partial<Seat | Section>) => void;
  // اضافه کردن تابع updateSection برای به‌روزرسانی مستقیم بخش‌ها
  updateSection: (id: string, updates: Partial<Section>) => void;
  removeElement: (id: string) => void;
  updateStage: (updates: Partial<Stage>) => void;
  addFloor: (floor: Floor) => void;
  setActiveFloor: (floorId: string) => void;
  updateFloor: (id: string, updates: Partial<Floor>) => void;
  removeFloor: (id: string) => void;
  addSeatToSection: (
    seat: Omit<Seat, "relativeX" | "relativeY">,
    sectionId: string
  ) => void;
}

// Create store
export const useSeatMapStore = create<SeatMapStore>((set) => ({
  seatMap: {
    title: "New Seat Map",
    venue: "New Venue",
    stage: {
      x: 1200,
      y: 100,
      width: 600,
      height: 80,
      name: "STAGE",
      floorId: "floor-1",
    },
    sections: [],
    seats: [],
    floors: [{ id: "floor-1", name: "Main Floor", level: 1 }],
    activeFloorId: "floor-1",
  },
  setSeatMap: (seatMap) => set({ seatMap }),
  setTitle: (title) =>
    set((state) => ({
      seatMap: {
        ...state.seatMap,
        title,
      },
    })),
  
  // اضافه کردن تابع updateSection برای به‌روزرسانی مستقیم بخش‌ها
  updateSection: (id, updates) => set((state) => {
    const sectionIndex = state.seatMap.sections.findIndex(section => section.id === id);
    if (sectionIndex === -1) return state;
    
    const updatedSections = [...state.seatMap.sections];
    const oldSection = updatedSections[sectionIndex];
    const newSection = {...oldSection, ...updates};
    updatedSections[sectionIndex] = newSection;
    
    // اگر موقعیت بخش تغییر کرده باشد، باید صندلی‌های داخل آن نیز به‌روزرسانی شوند
    let updatedSeats = [...state.seatMap.seats];
    if (updates.x !== undefined && updates.y !== undefined && 
        (oldSection.x !== updates.x || oldSection.y !== updates.y)) {
      // محاسبه میزان جابجایی
      const deltaX = updates.x - oldSection.x;
      const deltaY = updates.y - oldSection.y;
      
      // به‌روزرسانی موقعیت تمام صندلی‌های این بخش
      updatedSeats = updatedSeats.map(seat => {
        if (seat.sectionId === id) {
          // جابجایی صندلی به همان میزان که بخش جابجا شده است
          return {
            ...seat,
            x: seat.x + deltaX,
            y: seat.y + deltaY
          };
        }
        return seat;
      });
    }
    
    console.log('Section updated:', newSection);
    
    return {
      seatMap: {
        ...state.seatMap,
        sections: updatedSections,
        seats: updatedSeats
      }
    };
  }),
  
  removeElement: (id) => set((state) => {
    // اگر یک بخش حذف می‌شود، تمام صندلی‌های مربوط به آن نیز باید حذف شوند
    const isSection = state.seatMap.sections.some(section => section.id === id);
    
    if (isSection) {
      return {
        seatMap: {
          ...state.seatMap,
          sections: state.seatMap.sections.filter(section => section.id !== id),
          // حذف تمام صندلی‌های مربوط به این بخش
          seats: state.seatMap.seats.filter(seat => seat.sectionId !== id),
        }
      };
    } else {
      // حذف یک صندلی
      return {
        seatMap: {
          ...state.seatMap,
          seats: state.seatMap.seats.filter(seat => seat.id !== id),
        }
      };
    }
  }),
  
  setVenue: (venue) =>
    set((state) => ({
      seatMap: {
        ...state.seatMap,
        venue,
      },
    })),
  addSeat: (seat) =>
    set((state) => {
      // Add the current floor ID if not specified
      const seatWithFloor = {
        ...seat,
        floorId: seat.floorId || state.seatMap.activeFloorId,
      };
      return {
        seatMap: {
          ...state.seatMap,
          seats: [...state.seatMap.seats, seatWithFloor],
        },
      };
    }),
  addSection: (section) =>
    set((state) => {
      // Add the current floor ID if not specified
      const sectionWithFloor = {
        ...section,
        floorId: section.floorId || state.seatMap.activeFloorId,
      };
      return {
        seatMap: {
          ...state.seatMap,
          sections: [...state.seatMap.sections, sectionWithFloor],
        },
      };
    }),
  
  updateElement: (id, updates) => set((state) => {
    // بررسی اینکه آیا یک صندلی است
    const seatIndex = state.seatMap.seats.findIndex(seat => seat.id === id);
    if (seatIndex !== -1) {
      const updatedSeats = [...state.seatMap.seats];
      updatedSeats[seatIndex] = {...updatedSeats[seatIndex], ...updates as Partial<Seat>};
      return {
        seatMap: {
          ...state.seatMap,
          seats: updatedSeats,
        }
      };
    }
    
    // بررسی اینکه آیا یک بخش است
    const sectionIndex = state.seatMap.sections.findIndex(section => section.id === id);
    if (sectionIndex !== -1) {
      const updatedSections = [...state.seatMap.sections];
      const oldSection = updatedSections[sectionIndex];
      const newSection = {...oldSection, ...updates as Partial<Section>};
      updatedSections[sectionIndex] = newSection;
      
      console.log('Section updated via updateElement:', newSection);
      
      // اگر موقعیت بخش تغییر کرده باشد، باید صندلی‌های داخل آن نیز به‌روزرسانی شوند
      let updatedSeats = [...state.seatMap.seats];
      if (oldSection.x !== newSection.x || oldSection.y !== newSection.y) {
        // محاسبه میزان جابجایی
        const deltaX = newSection.x - oldSection.x;
        const deltaY = newSection.y - oldSection.y;
        
        // به‌روزرسانی موقعیت تمام صندلی‌های این بخش
        updatedSeats = updatedSeats.map(seat => {
          if (seat.sectionId === id) {
            // جابجایی صندلی به همان میزان که بخش جابجا شده است
            return {
              ...seat,
              x: seat.x + deltaX,
              y: seat.y + deltaY
            };
          }
          return seat;
        });
      }
      
      return {
        seatMap: {
          ...state.seatMap,
          sections: updatedSections,
          seats: updatedSeats
        }
      };
    }
    
    return state;
  }),
  
  updateStage: (updates) =>
    set((state) => {
      // If updating stage floor, ensure it gets the correct floor ID
      const updatedStage = {
        ...state.seatMap.stage,
        ...updates,
        floorId:
          updates.floorId ||
          state.seatMap.stage.floorId ||
          state.seatMap.activeFloorId,
      };
      return {
        seatMap: {
          ...state.seatMap,
          stage: updatedStage,
        },
      };
    }),
  addFloor: (floor) =>
    set((state) => {
      const floors = [...state.seatMap.floors, floor];
      return {
        seatMap: {
          ...state.seatMap,
          floors,
          activeFloorId: state.seatMap.activeFloorId || floor.id,
        },
      };
    }),
  setActiveFloor: (floorId) =>
    set((state) => ({
      seatMap: {
        ...state.seatMap,
        activeFloorId: floorId,
      },
    })),
  updateFloor: (id, updates) =>
    set((state) => {
      const floorIndex = state.seatMap.floors.findIndex(
        (floor) => floor.id === id
      );
      if (floorIndex === -1) return state;
      const floors = [...state.seatMap.floors];
      floors[floorIndex] = { ...floors[floorIndex], ...updates };
      return {
        seatMap: {
          ...state.seatMap,
          floors,
        },
      };
    }),
  removeFloor: (id) =>
    set((state) => {
      // Don't allow removing the last floor
      if (state.seatMap.floors.length <= 1) return state;
      const updatedFloors = state.seatMap.floors.filter(
        (floor) => floor.id !== id
      );
      // Update the active floor if the removed floor was active
      let activeFloorId = state.seatMap.activeFloorId;
      if (activeFloorId === id) {
        activeFloorId = updatedFloors[0]?.id;
      }
      // Remove elements from the removed floor
      const updatedSeats = state.seatMap.seats.filter(
        (seat) => seat.floorId !== id
      );
      const updatedSections = state.seatMap.sections.filter(
        (section) => section.floorId !== id
      );
      // If stage is on this floor, move it to the new active floor
      const updatedStage = {
        ...state.seatMap.stage,
        floorId:
          state.seatMap.stage.floorId === id
            ? activeFloorId
            : state.seatMap.stage.floorId,
      };
      return {
        seatMap: {
          ...state.seatMap,
          floors: updatedFloors,
          activeFloorId,
          seats: updatedSeats,
          sections: updatedSections,
          stage: updatedStage,
        },
      };
    }),
  // متد جدید برای اضافه کردن صندلی به بخش
  addSeatToSection: (seat, sectionId) =>
    set((state) => {
      const section = state.seatMap.sections.find((s) => s.id === sectionId);
      if (!section) return state;
      // محاسبه موقعیت نسبی صندلی نسبت به بخش
      const relativeX = seat.x - section.x;
      const relativeY = seat.y - section.y;
      const newSeat: Seat = {
        ...seat,
        sectionId,
        relativeX,
        relativeY,
        floorId: section.floorId,
      };
      return {
        seatMap: {
          ...state.seatMap,
          seats: [...state.seatMap.seats, newSeat],
        },
      };
    }),
  // اضافه کردن تابع جدید برای حذف همه صندلی‌ها
  removeAllSeats: () =>
    set((state) => {
      return {
        seatMap: {
          ...state.seatMap,
          seats: [],
        },
      };
    }),
}));

export type { Seat, Section, Stage, Floor, SeatMap };