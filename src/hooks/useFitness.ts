import { useContext } from 'react';
import { FitnessContext } from '../context/FitnessContext';
import { FitnessContextType } from '../types';

export const useFitness = (): FitnessContextType => {
  const context = useContext(FitnessContext);
  
  if (!context) {
    throw new Error('useFitness must be used within a FitnessProvider');
  }
  
  return context;
};

