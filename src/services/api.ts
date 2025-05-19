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


// Convert SeatMap to venue format for API
export const convertSeatMapToVenue = (seatMap: SeatMap) => {
  console.log('Converting SeatMap to venue format:', seatMap);
  
  // Create venue object
  const venue = {
    id: `new-${Math.random().toString(36).substring(2, 9)}`,
    name: seatMap.title,
    stage: {
      ...seatMap.stage,
      background: "#000000",
      color: "#FFFFFF"
    },
    floors: seatMap.floors.map(floor => {
      console.log(`Processing floor: ${floor.id} - ${floor.name}`);
      
      // Get sections for this floor
      const floorSections = seatMap.sections.filter(section => section.floorId === floor.id);
      console.log(`Found ${floorSections.length} sections for floor ${floor.id}`);
      
      // Create sections with seats
      const sections = floorSections.map(section => {
        // Find all seats that belong to this section
        let sectionSeats = seatMap.seats.filter(seat => seat.sectionId === section.id);
        
        // If no seats are found by sectionId, try to find seats by position
        if (sectionSeats.length === 0) {
          sectionSeats = seatMap.seats.filter(seat => {
            // Only consider seats on the same floor
            if (seat.floorId !== floor.id) return false;
            
            // Check if seat is within section boundaries
            return (
              seat.x >= section.x && 
              seat.x <= (section.x + section.width) &&
              seat.y >= section.y && 
              seat.y <= (section.y + section.height)
            );
          });
          
          // Assign sectionId to these seats for future reference
          sectionSeats.forEach(seat => {
            seat.sectionId = section.id;
          });
        }
        
        console.log(`Found ${sectionSeats.length} seats for section ${section.id}`);
        
        // Make sure to convert seat coordinates to be relative to the section
        const processedSeats = sectionSeats.map(seat => ({
          id: seat.id,
          row: seat.row,
          number: seat.number,
          x: seat.x - section.x, // relative position to section
          y: seat.y - section.y, // relative position to section
          type: seat.type,
          is_active: seat.status !== 'disabled', // convert status to is_active boolean
          price: seat.price || 0
        }));
        
        return {
          id: section.id,
          name: section.name,
          code: section.code || `SECTION-${section.id.split('-')[1] || '0'}-`,
          shape: "rectangle",
          x: section.x,
          y: section.y,
          width: section.width,
          height: section.height,
          color: "#FFFFFF",
          background: section.color,
          seats: processedSeats // Use the processed seats
        };
      });
      
      return {
        id: floor.id,
        name: floor.name,
        level: floor.level,
        sections
      };
    })
  };
  
  // Add any orphaned seats (not in any section) to the first section of their floor
  seatMap.floors.forEach(floor => {
    const orphanedSeats = seatMap.seats.filter(seat => 
      seat.floorId === floor.id && !seat.sectionId
    );
    
    if (orphanedSeats.length > 0) {
      console.log(`Found ${orphanedSeats.length} orphaned seats on floor ${floor.id}`);
      
      // Find the first section on this floor, or create one if none exists
      const floorIndex = venue.floors.findIndex(f => f.id === floor.id);
      if (floorIndex >= 0) {
        if (venue.floors[floorIndex].sections.length === 0) {
          // Create a new section for orphaned seats
          const newSection = {
            id: `section-orphaned-${floor.id}`,
            name: "Other Seats",
            code: "OTHER-",
            shape: "rectangle",
            x: Math.min(...orphanedSeats.map(s => s.x)) - 10,
            y: Math.min(...orphanedSeats.map(s => s.y)) - 10,
            width: Math.max(...orphanedSeats.map(s => s.x)) - Math.min(...orphanedSeats.map(s => s.x)) + 40,
            height: Math.max(...orphanedSeats.map(s => s.y)) - Math.min(...orphanedSeats.map(s => s.y)) + 40,
            color: "#FFFFFF",
            background: "#E5E7EB",
            seats: orphanedSeats.map(seat => ({
              id: seat.id,
              row: seat.row,
              number: seat.number,
              x: seat.x - (Math.min(...orphanedSeats.map(s => s.x)) - 10),
              y: seat.y - (Math.min(...orphanedSeats.map(s => s.y)) - 10),
              type: seat.type,
              is_active: seat.status !== 'disabled',
              price: seat.price || 0
            }))
          };
          venue.floors[floorIndex].sections.push(newSection);
        } else {
          // Add orphaned seats to the first section
          const sectionIndex = 0;
          const section = venue.floors[floorIndex].sections[sectionIndex];
          const sectionX = section.x;
          const sectionY = section.y;
          
          const processedOrphanedSeats = orphanedSeats.map(seat => ({
            id: seat.id,
            row: seat.row,
            number: seat.number,
            x: seat.x - sectionX,
            y: seat.y - sectionY,
            type: seat.type,
            is_active: seat.status !== 'disabled',
            price: seat.price || 0
          }));
          
          venue.floors[floorIndex].sections[sectionIndex].seats.push(...processedOrphanedSeats);
        }
      }
    }
  });
  
  console.log('Final venue data to be sent:', venue);
  return venue;
};
// Save venue data to the API
// Save venue data to the API

export const saveVenue = async (seatMap: SeatMap) => {
  try {
    // تبدیل داده‌های نقشه به فرمت مناسب برای ارسال
    let venueData = convertSeatMapToVenue(seatMap);
    
    // ابتدا داده‌های فعلی را از سرور دریافت می‌کنیم (اگر وجود داشته باشد)
    try {
      const currentData = await fetchVenue();
      const currentVenue = currentData.data?.venue;
      
      if (currentVenue && currentVenue.id) {
        console.log('Current venue data from server:', currentVenue);
        
        // حفظ ID اصلی
        venueData.id = currentVenue.id;
      }
    } catch (error) {
      console.warn('Could not fetch current venue data, creating new venue');
    }
    
    console.log('Merged venue data to be saved:', venueData);
    
    // ارسال داده‌ها به سرور
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
  } catch (error) {
    console.error('Error in saveVenue:', error);
    throw error;
  }
};