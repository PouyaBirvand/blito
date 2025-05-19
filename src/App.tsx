import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip.tsx";
import { useSeatMapStore } from "@/stores/seatMapStore.ts";
import { useEffect, useState } from "react";
import { SeatToolbar } from "@/components/SeatToolbar.tsx";
import { SeatMapCanvas } from "./components/SeatMapCanvas";
import { toast } from "sonner";
import { Progress } from '@/components/ui/progress';
import { Loader, Save, MapPin } from 'lucide-react';
import * as api from '@/services/api';

function App() {
  const { seatMap, setSeatMap } = useSeatMapStore();
  const [activeTab, setActiveTab] = useState("canvas");
  const [isExporting, setIsExporting] = useState(false);
  const [isLoadingVenue, setIsLoadingVenue] = useState(false);

  // Verify token first
  const tokenVerification = useQuery({
    queryKey: ['tokenVerification'],
    queryFn: api.verifyToken,
    retry: 3,  // افزایش تعداد تلاش‌ها
    retryDelay: 1000,  // تاخیر بین تلاش‌ها
    onError: (error) => {
      console.error('Token verification failed:', error);
      toast.error("Authentication failed", {
        description: "Unable to verify your access token. Please try again later."
      });

      // در صورت خطا، اجازه دهید برنامه با داده‌های پیش‌فرض کار کند
      if (venueQuery.isError || !venueQuery.data) {
        setSeatMap({
          title: "نقشه سالن پیش‌فرض",
          venue: "سالن پیش‌فرض",
          stage: {
            x: 1200,
            y: 100,
            width: 600,
            height: 80,
            name: 'صحنه اجرا',
            floorId: 'floor-1'
          },
          sections: [],
          seats: [],
          floors: [
            { id: 'floor-1', name: 'طبقه همکف', level: 1 }
          ],
          activeFloorId: 'floor-1'
        });
      }
    }
  });

  // Fetch venue data after token verification
// Fetch venue data after token verification
const venueQuery = useQuery({
  queryKey: ['venue'],
  queryFn: api.fetchVenue,
  // اجازه دهید حتی در صورت خطای احراز هویت، تلاش کند داده‌ها را بگیرد
  enabled: !tokenVerification.isLoading,
  retry: 3,
  retryDelay: 1000,
  onSuccess: (response) => {
    // Extract the venue data from the response
    const venueData = response.data?.venue;
    
    if (!venueData) {
      toast.error("Invalid venue data format", {
        description: "The venue data received from the server is not in the expected format."
      });
      return;
    }
    
    // Convert venue data to our SeatMap format
    const convertedSeatMap = api.convertVenueToSeatMap(venueData);
    setSeatMap(convertedSeatMap);
    toast.success("Venue data loaded", {
      description: `Successfully loaded "${venueData.name}" venue data.`
    });
  },
  onError: (error) => {
    console.error('Error fetching venue data:', error);
    toast.error("Failed to load venue data", {
      description: "There was an error loading the venue data. Please try again later."
    });
  }
});


  // Save venue mutation
  const saveMutation = useMutation({
    mutationFn: api.saveVenue,
    onSuccess: () => {
      toast.success("ذخیره موفقیت‌آمیز", {
        description: "نقشه سالن با موفقیت در سرور ذخیره شد."
      });
    },
    onError: (error) => {
      console.error('Error saving venue data:', error);
      toast.error("خطا در ذخیره‌سازی", {
        description: "مشکلی در ذخیره‌سازی نقشه سالن رخ داد. لطفاً دوباره تلاش کنید."
      });
    }
  });

  // Check if we're loading data
  const isLoading = tokenVerification.isLoading || venueQuery.isLoading;
  const hasError = tokenVerification.isError || venueQuery.isError;
  const isSaving = saveMutation.isPending;

  useEffect(() => {
    document.title = "طراحی نقشه سالن - بلیتو";

    // Center the view on the stage when the component mounts
    const timer = setTimeout(() => {
      const canvasContainer = document.querySelector('.flex-1.relative.overflow-hidden');
      if (canvasContainer) {
        canvasContainer.scrollTo({
          left: 1500 - canvasContainer.clientWidth / 2,
          top: 1500 - canvasContainer.clientHeight / 2,
          behavior: 'smooth'
        });
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const blob = new Blob([JSON.stringify(seatMap, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${seatMap.title || 'seat-map'}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Export Complete", {
        description: "Seat map has been exported successfully."
      });
    } catch (error) {
      console.error('Export error:', error);
      toast.error("Export Failed", {
        description: "There was an error exporting the seat map.",
      });
    } finally {
      setIsExporting(false);
    }
  };


  const handleSave = async () => {
    try {
      // ذخیره نقشه در سرور
      await saveMutation.mutateAsync(seatMap);
      
      // بارگذاری مجدد نقشه از سرور برای تأیید ذخیره‌سازی
      await handleLoadVenueMap();
      
      toast.success("ذخیره موفقیت‌آمیز", {
        description: "نقشه سالن با موفقیت در سرور ذخیره شد و مجدداً بارگذاری شد."
      });
    } catch (error) {
      console.error('Error in save operation:', error);
      toast.error("خطا در ذخیره‌سازی", {
        description: "مشکلی در ذخیره‌سازی نقشه سالن رخ داد. لطفاً دوباره تلاش کنید."
      });
    }
  };

  const handleNewMap = () => {
    if (window.confirm("ایجاد نقشه جدید؟ تغییرات ذخیره نشده از بین خواهند رفت.")) {
      setSeatMap({
        title: "نقشه سالن جدید",
        venue: "سالن جدید",
        stage: {
          x: 1200,
          y: 100,
          width: 600,
          height: 80,
          name: 'صحنه اجرا',
          floorId: 'floor-1'
        },
        sections: [],
        seats: [],
        floors: [
          { id: 'floor-1', name: 'طبقه همکف', level: 1 }
        ],
        activeFloorId: 'floor-1'
      });
      toast("نقشه جدید ایجاد شد", {
        description: "یک نقشه سالن جدید ایجاد شد."
      });
    }
  };

  // New function to load venue map from API
  // New function to load venue map from API
  // New function to load venue map from API
// New function to load venue map from API
const handleLoadVenueMap = async () => {
  setIsLoadingVenue(true);
  try {
    // دریافت داده‌های سالن مستقیماً از API
    const response = await api.fetchVenue();
    
    console.log('Full API response:', response);
    
    if (!response || !response.data || !response.data.venue) {
      console.error('Invalid response structure:', response);
      throw new Error('داده‌های سالن از API دریافت نشد');
    }
    
    // استخراج داده‌های واقعی سالن از پاسخ
    const venueData = response.data.venue;
    console.log('Extracted venue data:', venueData);
    
    // تبدیل داده‌های سالن به فرمت SeatMap
    const convertedSeatMap = api.convertVenueToSeatMap(venueData);
    console.log('Converted seat map:', convertedSeatMap);
    
    // به‌روزرسانی state با نقشه جدید
    setSeatMap(convertedSeatMap);
    
    toast.success("نقشه سالن بارگذاری شد", {
      description: `نقشه سالن "${venueData.name}" با موفقیت بارگذاری شد.`
    });
    
    // مرکز قرار دادن نما روی صحنه
    setTimeout(() => {
      const canvasContainer = document.querySelector('.flex-1.relative.overflow-hidden');
      if (canvasContainer) {
        canvasContainer.scrollTo({
          left: convertedSeatMap.stage.x - canvasContainer.clientWidth / 2,
          top: convertedSeatMap.stage.y - canvasContainer.clientHeight / 2,
          behavior: 'smooth'
        });
      }
    }, 100);
  } catch (error) {
    console.error('Error loading venue map:', error);
    toast.error("خطا در بارگذاری نقشه", {
      description: "مشکلی در بارگذاری نقشه سالن از سرور رخ داد. لطفاً دوباره تلاش کنید."
    });
  } finally {
    setIsLoadingVenue(false);
  }
};
  return (
    <>
      <TooltipProvider>
        <Toaster />
        <div className="min-h-screen flex flex-col bg-gray-50">
          {/* Header */}
          <header className="bg-white shadow z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-bold text-gray-900">
                  طراحی نقشه بلیتو
                </h1>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={handleNewMap}>بازنشانی</Button>
                {/* New button to load venue map from API */}
                {/* New button to load venue map from API */}
                <Button
                  variant="outline"
                  onClick={handleLoadVenueMap}
                  disabled={isLoadingVenue}
                  className="bg-blue-50 hover:bg-blue-100"
                >
                  {isLoadingVenue ? (
                    <Loader className="h-4 w-4 animate-spin ml-2" />
                  ) : (
                    <MapPin className="h-4 w-4 ml-2" />
                  )}
                  {venueQuery.data?.data?.venue?.name ? `نمایش نقشه ${venueQuery.data.data.venue.name}` : "نمایش نقشه سالن"}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleExport}
                  disabled={isExporting}
                >
                  {isExporting ? <Loader className="h-4 w-4 animate-spin ml-2" /> : null}
                  خروجی
                </Button>
                <Button
                  variant="default"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isSaving ? (
                    <Loader className="h-4 w-4 animate-spin ml-2" />
                  ) : (
                    <Save className="h-4 w-4 ml-2" />
                  )}
                  ذخیره در سرور
                </Button>
                <Button variant="outline">
                  خروج
                </Button>
              </div>
            </div>
          </header>
          {/* Main content */}
          <main className="flex-1 flex overflow-hidden">
            {/* Tools sidebar */}
            <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
              <SeatToolbar />
            </div>
            {/* Main canvas area */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <Tabs value={activeTab} onValueChange={setActiveTab}
                className="flex-1 flex flex-col overflow-hidden">
                <div className="bg-white border-b border-gray-200 px-4">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="preview">
                      پیشنمایش
                    </TabsTrigger>
                    <TabsTrigger value="canvas">
                      ویرایشگر
                    </TabsTrigger>
                  </TabsList>
                </div>
                <TabsContent value="canvas" className="flex-1 overflow-auto p-4">
                  <SeatMapCanvas editable={true} isLoading={isLoading} />
                </TabsContent>
                <TabsContent value="preview" className="flex-1 overflow-auto p-4 bg-gray-100">
                  <SeatMapCanvas editable={false} isLoading={isLoading} />
                </TabsContent>
              </Tabs>
            </div>
            {/* Loading Indicator for API Operations */}
            {isLoading && (
              <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg z-50">
                <div className="flex items-center space-x-2">
                  <Loader className="h-4 w-4 animate-spin" />
                  <span>در حال بارگذاری اطلاعات...</span>
                </div>
                <Progress value={75} className="mt-2" />
              </div>
            )}
            {/* Venue Loading Indicator */}
            {isLoadingVenue && (
              <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg z-50">
                <div className="flex items-center space-x-2">
                  <Loader className="h-4 w-4 animate-spin" />
                  <span>در حال بارگذاری نقشه سالن میلاد...</span>
                </div>
                <Progress value={75} className="mt-2" />
              </div>
            )}
            {/* Saving Indicator */}
            {isSaving && (
              <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg z-50">
                <div className="flex items-center space-x-2">
                  <Loader className="h-4 w-4 animate-spin" />
                  <span>در حال ذخیره‌سازی نقشه سالن...</span>
                </div>
                <Progress value={75} className="mt-2" />
              </div>
            )}
            {/* Error Message */}
            {hasError && (
              <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-50 p-4 rounded-lg shadow-lg z-50 border border-red-200">
                <div className="flex items-center text-red-700">
                  <span className="font-medium">خطا در بارگذاری اطلاعات. لطفاً دوباره تلاش کنید.</span>
                </div>
              </div>
            )}
          </main>
        </div>
      </TooltipProvider>
    </>
  );
}

export default App;
