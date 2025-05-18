import type { SeatMap } from '@/types/seatMap';

// استفاده از مسیر نسبی برای پروکسی
const API_URL = '/api/';
const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.7ygcyDSdxMe3_PJbrFTo0OFzCbEDmPDcfFoYIxBUxlI";

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API error: ${response.status} - ${errorText}`);
  }
  return await response.json();
};

// Verify token validity
export const verifyToken = async () => {
  const response = await fetch(`${API_URL}auth`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token: TOKEN }),
  });
  return handleResponse(response);
};

// Fetch venue information
export const fetchVenue = async () => {
  const response = await fetch(`${API_URL}venue`, {
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
    },
  });
  return handleResponse(response);
};

// Convert venue data to our SeatMap format
export const convertVenueToSeatMap = (venueData: any): SeatMap => {
  // Extract floors
  const floors = venueData.floors.map((floor: any) => ({
    id: floor.id,
    name: floor.name,
    level: floor.level
  }));

  // Extract sections
  const sections = venueData.floors.flatMap((floor: any) => 
    floor.sections.map((section: any) => ({
      id: section.id,
      name: section.name,
      code: section.code,
      shape: section.shape,
      x: section.x,
      y: section.y,
      width: section.width,
      height: section.height,
      color: section.background || '#D3E4FD',
      floorId: floor.id
    }))
  );

  // Extract seats
  const seats = venueData.floors.flatMap((floor: any) => 
    floor.sections.flatMap((section: any) =>
      section.seats.map((seat: any) => ({
        id: seat.id,
        row: seat.row,
        number: seat.number,
        type: seat.type,
        status: seat.is_active ? 'available' : 'disabled',
        x: section.x + seat.x,
        y: section.y + seat.y,
        price: seat.price,
        sectionId: section.id,
        floorId: floor.id
      }))
    )
  );

  // Create the SeatMap object
  return {
    title: venueData.name,
    venue: venueData.name,
    stage: {
      x: venueData.stage.x,
      y: venueData.stage.y,
      width: venueData.stage.width,
      height: venueData.stage.height,
      name: venueData.stage.name,
      floorId: venueData.stage.floorId
    },
    sections,
    seats,
    floors,
    activeFloorId: floors[0]?.id || ''
  };
};

// Convert SeatMap to venue format for saving
export const convertSeatMapToVenue = (seatMap: SeatMap): any => {
  // Create floors with sections and seats
  const floors = seatMap.floors.map(floor => {
    // Get sections for this floor
    const floorSections = seatMap.sections.filter(section => section.floorId === floor.id);
    
    // Map sections with their seats
    const sections = floorSections.map(section => {
      // Get seats for this section
      const sectionSeats = seatMap.seats.filter(seat => seat.sectionId === section.id);
      
      // Map seats to API format
      const seats = sectionSeats.map(seat => {
        // Generate new ID if it starts with "new-"
        const id = seat.id.startsWith('new-') ? seat.id : seat.id;
        
        return {
          id,
          row: seat.row,
          number: seat.number,
          type: seat.type,
          is_active: seat.status === 'available',
          price: seat.price || 0,
          x: seat.x - section.x, // Relative to section
          y: seat.y - section.y  // Relative to section
        };
      });
      
      // Generate new ID if it starts with "new-"
      const id = section.id.startsWith('new-') ? section.id : section.id;
      
      return {
        id,
        name: section.name,
        code: section.code || `SECTION-${section.id.substring(0, 8)}`,
        shape: section.shape || 'rectangle',
        x: section.x,
        y: section.y,
        width: section.width,
        height: section.height,
        background: section.color,
        color: '#FFFFFF',
        seats
      };
    });
    
    // Generate new ID if it starts with "new-"
    const id = floor.id.startsWith('new-') ? floor.id : floor.id;
    
    return {
      id,
      name: floor.name,
      level: floor.level,
      sections
    };
  });
  
  // Create the venue object
  return {
    id: seatMap.id || "new-" + Math.random().toString(36).substring(2, 9),
    name: seatMap.title || seatMap.venue,
    stage: {
      x: seatMap.stage.x,
      y: seatMap.stage.y,
      width: seatMap.stage.width,
      height: seatMap.stage.height,
      name: seatMap.stage.name,
      background: "#000000",
      color: "#FFFFFF",
      floorId: seatMap.stage.floorId
    },
    floors
  };
};

// Save venue data to the API
export const saveVenue = async (seatMap: SeatMap) => {
  const venueData = convertSeatMapToVenue(seatMap);
  
  const response = await fetch(`${API_URL}venue`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TOKEN}`,
    },
    body: JSON.stringify(venueData),
  });
  
  return handleResponse(response);
};
