import {useState} from 'react';
import {toast} from 'sonner';
import {useSeatMapStore, type SeatMap} from '@/stores/seatMapStore';
import * as api from '@/services/api';
import {useQuery, useMutation} from '@tanstack/react-query';

export const useApiActions = () => {
    const {setSeatMap} = useSeatMapStore();
    const [isExporting, setIsExporting] = useState(false);

    // Query for fetching all seat maps
    const allMapsQuery = useQuery({
        queryKey: ['seatMaps'],
        queryFn: api.fetchSeatMaps,
        enabled: false,  // Don't auto-fetch
    });

    // Query for fetching a single seat map
    const fetchMapById = (id: string) => {
        return useQuery({
            queryKey: ['seatMap', id],
            queryFn: () => api.fetchSeatMapById(id),
            enabled: Boolean(id),  // Only fetch when ID is provided
        });
    };

    // Mutation for creating a new seat map
    const createMapMutation = useMutation({
        mutationFn: api.createSeatMap,
        onSuccess: (data) => {
            toast.success("Seat map created successfully");
            return data;
        },
        onError: (error) => {
            toast.error("Failed to create seat map");
            console.error(error);
        },
    });

    // Mutation for updating an existing seat map
    const updateMapMutation = useMutation({
        mutationFn: ({id, seatMap}: { id: string; seatMap: SeatMap }) =>
            api.updateSeatMap(id, seatMap),
        onSuccess: (data) => {
            toast.success("Seat map updated successfully");
            return data;
        },
        onError: (error) => {
            toast.error("Failed to update seat map");
            console.error(error);
        },
    });

    // Mutation for deleting a seat map
    const deleteMapMutation = useMutation({
        mutationFn: api.deleteSeatMap,
        onSuccess: () => {
            toast.success("Seat map deleted successfully");
        },
        onError: (error) => {
            toast.error("Failed to delete seat map");
            console.error(error);
        },
    });

    // Load a seat map from the API by ID
    const loadMapFromApi = async (id: string) => {
        try {
            const data = await api.fetchSeatMapById(id);
            setSeatMap(data);
            toast("Seat Map Loaded", {
                description: `"${data.title}" loaded successfully`,
            });
            return data;
        } catch (error) {
            toast.error("Failed to load seat map");
            console.error(error);
            return null;
        }
    };

    // Export the current seat map to a JSON file
    const exportToJson = async (seatMap: SeatMap) => {
        setIsExporting(true);
        try {
            const blob = new Blob([JSON.stringify(seatMap, null, 2)], {type: 'application/json'});
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${seatMap.title || 'seat-map'}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            toast("Export Complete", {
                description: "Seat map has been exported successfully",
            });
        } catch (error) {
            console.error('Export error:', error);
            toast.error("Export Failed", {
                description: "Failed to export seat map",
            });
        } finally {
            setIsExporting(false);
        }
    };

    // Import a seat map from a JSON file
    const importFromJson = (file: File) => {
        return new Promise<SeatMap | null>((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (event) => {
                try {
                    if (event.target?.result) {
                        const importedData = JSON.parse(event.target.result as string);
                        setSeatMap(importedData);
                        toast("Import Complete", {
                            description: `"${importedData.title || 'Seat Map'}" has been imported successfully`,
                        });
                        resolve(importedData);
                    } else {
                        throw new Error("Failed to read file");
                    }
                } catch (error) {
                    console.error('Import error:', error);
                    toast.error("Import Failed", {
                        description: "Invalid seat map file format",
                    });
                    reject(error);
                }
            };

            reader.onerror = (error) => {
                console.error('File reading error:', error);
                toast.error("Import Failed", {
                    description: "Failed to read the file",
                });
                reject(error);
            };

            reader.readAsText(file);
        });
    };

    return {
        // Queries
        allMapsQuery,
        fetchMapById,

        // Mutations
        createMapMutation,
        updateMapMutation,
        deleteMapMutation,

        // Loading state
        isExporting,

        // Action functions
        loadMapFromApi,
        exportToJson,
        importFromJson,

        // Combined loading state
        isLoading: allMapsQuery.isLoading ||
            createMapMutation.isPending ||
            updateMapMutation.isPending ||
            deleteMapMutation.isPending ||
            isExporting
    };
};