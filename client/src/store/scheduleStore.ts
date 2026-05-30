import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface ScheduleState {
  selectedDateStr: string;
  viewMode: 'day' | 'week';
  setSelectedDateStr: (dateStr: string) => void;
  setViewMode: (mode: 'day' | 'week') => void;
}

export const useScheduleStore = create<ScheduleState>()(
  persist(
    (set) => ({
      selectedDateStr: new Date().toISOString(),
      viewMode: 'day',
      setSelectedDateStr: (selectedDateStr) => set({ selectedDateStr }),
      setViewMode: (viewMode) => set({ viewMode }),
    }),
    {
      name: 'schedule-ui-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
