export interface Floor {
  id: string;
  name: string;
  level: number;
}

export interface Section {
  id: string;
  name: string;
  code?: string;
  shape: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  floorId: string;
}

export interface Seat {
  id: string;
  row: string;
  number: string;
  type: string;
  status: 'available' | 'disabled' | 'selected' | 'reserved' | 'sold';
  x: number;
  y: number;
  price?: number;
  sectionId: string;
  floorId: string;
}

export interface Stage {
  x: number;
  y: number;
  width: number;
  height: number;
  name: string;
  floorId: string;
}

export interface SeatMap {
  id?: string;
  title: string;
  venue: string;
  stage: Stage;
  sections: Section[];
  seats: Seat[];
  floors: Floor[];
  activeFloorId: string;
}
