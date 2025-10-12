/**
 * 日期计算工具函数
 */

/**
 * 计算两个日期之间的天数差
 */
export const getDaysDifference = (startDate: Date, endDate: Date): number => {
  const timeDifference = endDate.getTime() - startDate.getTime();
  return Math.floor(timeDifference / (1000 * 3600 * 24));
};

/**
 * 根据学期开始日期计算当前是第几周
 */
export const calculateCurrentWeek = (semesterStartDate: string): number => {
  if (!semesterStartDate) return 1;
  
  try {
    const startDate = new Date(semesterStartDate);
    const currentDate = new Date();
    
    // 如果当前日期早于学期开始日期，返回第1周
    if (currentDate < startDate) {
      return 1;
    }
    
    const daysDiff = getDaysDifference(startDate, currentDate);
    const weekNumber = Math.floor(daysDiff / 7) + 1;
    
    return Math.max(1, weekNumber);
  } catch (error) {
    console.error('Error calculating current week:', error);
    return 1;
  }
};

/**
 * 根据学期开始日期和指定周数计算该周的日期范围
 */
export const getWeekDateRange = (semesterStartDate: string, weekNumber: number): { startDate: Date; endDate: Date } | null => {
  if (!semesterStartDate) return null;
  
  try {
    const startDate = new Date(semesterStartDate);
    // 计算该周开始的日期（周一）
    const weekStartDate = new Date(startDate);
    weekStartDate.setDate(startDate.getDate() + (weekNumber - 1) * 7);
    
    // 找到该周的周一
    const dayOfWeek = weekStartDate.getDay();
    const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // 0是周日
    weekStartDate.setDate(weekStartDate.getDate() + daysToMonday);
    
    // 计算该周结束的日期（周日）
    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekStartDate.getDate() + 6);
    
    return {
      startDate: weekStartDate,
      endDate: weekEndDate
    };
  } catch (error) {
    console.error('Error calculating week date range:', error);
    return null;
  }
};

/**
 * 根据学期开始日期和指定周数获取指定星期几的日期
 */
export const getDateForWeekDay = (semesterStartDate: string, weekNumber: number, dayOfWeek: number): string => {
  const dateRange = getWeekDateRange(semesterStartDate, weekNumber);
  
  if (!dateRange) {
    return '';
  }
  
  const { startDate } = dateRange;
  const targetDate = new Date(startDate);
  
  // dayOfWeek: 1=周一, 2=周二, ..., 7=周日
  targetDate.setDate(startDate.getDate() + (dayOfWeek - 1));
  
  // 返回格式化的日期字符串 (MM/DD)
  const month = (targetDate.getMonth() + 1).toString().padStart(2, '0');
  const day = targetDate.getDate().toString().padStart(2, '0');
  
  return `${month}/${day}`;
};

/**
 * 格式化日期为 YYYY-MM-DD 格式
 */
export const formatDateForInput = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

/**
 * 获取当前日期的 YYYY-MM-DD 格式
 */
export const getTodayString = (): string => {
  return formatDateForInput(new Date());
};

/**
 * 验证日期字符串格式是否正确
 */
export const isValidDateString = (dateString: string): boolean => {
  if (!dateString) return false;
  
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
};

/**
 * 根据当前日期和当前周数逆推学期开始日期
 */
export const calculateSemesterStartDate = (currentWeekNumber: number, currentDate?: Date): string => {
  const today = currentDate || new Date();
  
  if (currentWeekNumber < 1) {
    console.error('Current week number must be at least 1');
    return getTodayString();
  }
  
  // 计算学期开始日期：当前日期 - (当前周数 - 1) * 7天
  const daysFromStart = (currentWeekNumber - 1) * 7;
  const semesterStartDate = new Date(today);
  semesterStartDate.setDate(today.getDate() - daysFromStart);
  
  // 找到该周的周一作为学期开始日期
  const dayOfWeek = semesterStartDate.getDay(); // 0=周日, 1=周一, ..., 6=周六
  const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // 计算到周一的天数差
  semesterStartDate.setDate(semesterStartDate.getDate() + daysToMonday);
  
  return formatDateForInput(semesterStartDate);
};

/**
 * 验证逆推计算的结果是否合理
 */
export const validateReverseCalculation = (semesterStartDate: string, expectedWeek: number): boolean => {
  const calculatedWeek = calculateCurrentWeek(semesterStartDate);
  return Math.abs(calculatedWeek - expectedWeek) <= 1; // 允许1周的误差
};
