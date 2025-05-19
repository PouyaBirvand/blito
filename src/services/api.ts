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
  // Check if venueData exists
  if (!venueData) {
    throw new Error('No venue data provided');
  }

  console.log('Converting venue data:', venueData);

  // Extract floors with null check
  const floors = venueData.floors?.map((floor: any) => ({
    id: floor.id,
    name: floor.name,
    level: floor.level
  })) || [];

  // Extract sections with null checks
  const sections = venueData.floors?.flatMap((floor: any) => 
    floor.sections?.map((section: any) => ({
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
    })) || []
  ) || [];

  // Extract seats with null checks
  const seats = venueData.floors?.flatMap((floor: any) => 
    floor.sections?.flatMap((section: any) =>
      section.seats?.map((seat: any) => ({
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
      })) || []
    ) || []
  ) || [];

  // Create the SeatMap object
  return {
    title: venueData.name || 'سالن بدون نام',
    venue: venueData.name || 'سالن بدون نام',
    stage: {
      x: venueData.stage?.x || 1200,
      y: venueData.stage?.y || 100,
      width: venueData.stage?.width || 600,
      height: venueData.stage?.height || 80,
      name: venueData.stage?.name || 'صحنه اجرا',
      floorId: venueData.stage?.floorId || (floors[0]?.id || 'floor-1')
    },
    sections,
    seats,
    floors,
    activeFloorId: floors[0]?.id || 'floor-1'
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
        const id = seat.id.startsWith('new-') ? 
          `new-${Math.random().toString(36).substring(2, 9)}` : 
          seat.id;
        
        return {
          id,
          row: seat.row || '',
          number: seat.number || '',
          type: seat.type || 'regular',
          is_active: seat.status === 'available',
          price: Number(seat.price) || 0,
          x: Number(seat.x - section.x) || 0, // Relative to section
          y: Number(seat.y - section.y) || 0  // Relative to section
        };
      });
      
      // Generate new ID if it starts with "new-"
      const id = section.id.startsWith('new-') ? 
        `new-${Math.random().toString(36).substring(2, 9)}` : 
        section.id;
      
      return {
        id,
        name: section.name || '',
        code: section.code || `SECTION-${section.id.substring(0, 8)}`,
        shape: section.shape || 'rectangle',
        x: Number(section.x) || 0,
        y: Number(section.y) || 0,
        width: Number(section.width) || 100,
        height: Number(section.height) || 100,
        background: section.color || '#D3E4FD',
        color: '#FFFFFF',
        seats
      };
    });
    
    // Generate new ID if it starts with "new-"
    const id = floor.id.startsWith('new-') ? 
      `new-${Math.random().toString(36).substring(2, 9)}` : 
      floor.id;
    
    return {
      id,
      name: floor.name || '',
      level: Number(floor.level) || 1,
      sections
    };
  });
  
  // Create the venue object
  return {
    id: seatMap.id || `new-${Math.random().toString(36).substring(2, 9)}`,
    name: seatMap.title || seatMap.venue || 'سالن جدید',
    stage: {
      x: Number(seatMap.stage.x) || 1200,
      y: Number(seatMap.stage.y) || 100,
      width: Number(seatMap.stage.width) || 600,
      height: Number(seatMap.stage.height) || 80,
      name: seatMap.stage.name || 'صحنه اجرا',
      background: "#000000",
      color: "#FFFFFF",
      floorId: seatMap.stage.floorId || floors[0]?.id || 'floor-1'
    },
    floors
  };
};

// Save venue data to the API
// Save venue data to the API
export const saveVenue = async (seatMap: SeatMap) => {
  const venueData = convertSeatMapToVenue(seatMap);
  
  console.log('Saving venue data:', venueData);
  
  const response = await fetch(`${API_URL}venue`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TOKEN}`,
    },
    body: JSON.stringify(venueData),
  });
  
  const result = await handleResponse(response);
  console.log('Save venue response:', result);
  
  return result;
};