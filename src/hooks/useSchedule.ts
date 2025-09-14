import { useContext } from 'react';
import { ScheduleContext } from '../context/ScheduleContext';
import { ScheduleContextType } from '../types';

export const useSchedule = (): ScheduleContextType => {
  const context = useContext(ScheduleContext);
  
  if (!context) {
    throw new Error('useSchedule must be used within a ScheduleProvider');
  }
  
  return context;
}; 