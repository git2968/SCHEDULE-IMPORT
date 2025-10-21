import React, { createContext, useState, ReactNode, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { FitnessContextType, BodyRecord, FoodRecord } from '../types';
import { useAuth } from '../hooks/useAuth';

export const FitnessContext = createContext<FitnessContextType | null>(null);

interface FitnessProviderProps {
  children: ReactNode;
}

export const FitnessProvider: React.FC<FitnessProviderProps> = ({ children }) => {
  const [bodyRecords, setBodyRecords] = useState<BodyRecord[]>([]);
  const [foodRecords, setFoodRecords] = useState<FoodRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  // 当用户变化时，加载用户的数据
  useEffect(() => {
    if (currentUser) {
      loadUserData();
    } else {
      setBodyRecords([]);
      setFoodRecords([]);
    }
  }, [currentUser]);

  // 从本地存储加载用户的所有数据
  const loadUserData = async (): Promise<void> => {
    try {
      setLoading(true);
      
      const allBodyRecords = JSON.parse(localStorage.getItem('bodyRecords') || '[]');
      const allFoodRecords = JSON.parse(localStorage.getItem('foodRecords') || '[]');
      
      const userBodyRecords = currentUser 
        ? allBodyRecords.filter((r: BodyRecord) => r.userId === currentUser.id)
        : [];
      
      const userFoodRecords = currentUser 
        ? allFoodRecords.filter((r: FoodRecord) => r.userId === currentUser.id)
        : [];
      
      setBodyRecords(userBodyRecords);
      setFoodRecords(userFoodRecords);
      
      setLoading(false);
    } catch (error) {
      console.error('Failed to load user fitness data', error);
      setError('加载数据失败');
      setLoading(false);
    }
  };

  // ========== 身体数据相关 ==========

  const addBodyRecord = async (record: Omit<BodyRecord, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<void> => {
    if (!currentUser) {
      throw new Error('用户未登录');
    }

    try {
      const now = new Date().toISOString();
      const newRecord: BodyRecord = {
        ...record,
        id: uuidv4(),
        userId: currentUser.id,
        createdAt: now,
        updatedAt: now
      };

      const allRecords = JSON.parse(localStorage.getItem('bodyRecords') || '[]');
      allRecords.push(newRecord);
      localStorage.setItem('bodyRecords', JSON.stringify(allRecords));

      setBodyRecords([...bodyRecords, newRecord]);
    } catch (error) {
      console.error('Failed to add body record', error);
      setError('添加记录失败');
      throw error;
    }
  };

  const updateBodyRecord = async (recordId: string, data: Partial<BodyRecord>): Promise<void> => {
    try {
      const allRecords = JSON.parse(localStorage.getItem('bodyRecords') || '[]');
      const index = allRecords.findIndex((r: BodyRecord) => r.id === recordId);
      
      if (index === -1) {
        throw new Error('记录不存在');
      }

      allRecords[index] = {
        ...allRecords[index],
        ...data,
        updatedAt: new Date().toISOString()
      };

      localStorage.setItem('bodyRecords', JSON.stringify(allRecords));
      await loadUserData();
    } catch (error) {
      console.error('Failed to update body record', error);
      setError('更新记录失败');
      throw error;
    }
  };

  const deleteBodyRecord = async (recordId: string): Promise<void> => {
    try {
      const allRecords = JSON.parse(localStorage.getItem('bodyRecords') || '[]');
      const updatedRecords = allRecords.filter((r: BodyRecord) => r.id !== recordId);
      
      localStorage.setItem('bodyRecords', JSON.stringify(updatedRecords));
      setBodyRecords(bodyRecords.filter(r => r.id !== recordId));
    } catch (error) {
      console.error('Failed to delete body record', error);
      setError('删除记录失败');
      throw error;
    }
  };

  const getBodyRecordsByDateRange = (startDate: string, endDate: string): BodyRecord[] => {
    return bodyRecords.filter(record => {
      return record.date >= startDate && record.date <= endDate;
    }).sort((a, b) => a.date.localeCompare(b.date));
  };

  // ========== 饮食记录相关 ==========

  const addFoodRecord = async (record: Omit<FoodRecord, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<void> => {
    if (!currentUser) {
      throw new Error('用户未登录');
    }

    try {
      const now = new Date().toISOString();
      const newRecord: FoodRecord = {
        ...record,
        id: uuidv4(),
        userId: currentUser.id,
        createdAt: now,
        updatedAt: now
      };

      const allRecords = JSON.parse(localStorage.getItem('foodRecords') || '[]');
      allRecords.push(newRecord);
      localStorage.setItem('foodRecords', JSON.stringify(allRecords));

      setFoodRecords([...foodRecords, newRecord]);
    } catch (error) {
      console.error('Failed to add food record', error);
      setError('添加记录失败');
      throw error;
    }
  };

  const updateFoodRecord = async (recordId: string, data: Partial<FoodRecord>): Promise<void> => {
    try {
      const allRecords = JSON.parse(localStorage.getItem('foodRecords') || '[]');
      const index = allRecords.findIndex((r: FoodRecord) => r.id === recordId);
      
      if (index === -1) {
        throw new Error('记录不存在');
      }

      allRecords[index] = {
        ...allRecords[index],
        ...data,
        updatedAt: new Date().toISOString()
      };

      localStorage.setItem('foodRecords', JSON.stringify(allRecords));
      await loadUserData();
    } catch (error) {
      console.error('Failed to update food record', error);
      setError('更新记录失败');
      throw error;
    }
  };

  const deleteFoodRecord = async (recordId: string): Promise<void> => {
    try {
      const allRecords = JSON.parse(localStorage.getItem('foodRecords') || '[]');
      const updatedRecords = allRecords.filter((r: FoodRecord) => r.id !== recordId);
      
      localStorage.setItem('foodRecords', JSON.stringify(updatedRecords));
      setFoodRecords(foodRecords.filter(r => r.id !== recordId));
    } catch (error) {
      console.error('Failed to delete food record', error);
      setError('删除记录失败');
      throw error;
    }
  };

  const getFoodRecordsByDate = (date: string): FoodRecord[] => {
    return foodRecords.filter(record => record.date === date);
  };

  const getDailyCalories = (date: string): number => {
    const records = getFoodRecordsByDate(date);
    return records.reduce((total, record) => total + record.totalCalories, 0);
  };

  const value: FitnessContextType = {
    bodyRecords,
    foodRecords,
    loading,
    error,
    addBodyRecord,
    updateBodyRecord,
    deleteBodyRecord,
    getBodyRecordsByDateRange,
    addFoodRecord,
    updateFoodRecord,
    deleteFoodRecord,
    getFoodRecordsByDate,
    getDailyCalories,
    loadUserData
  };

  return (
    <FitnessContext.Provider value={value}>
      {children}
    </FitnessContext.Provider>
  );
};

