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
 * 注意：这里按照完整的自然周计算（周一到周日为一周）
 */
export const calculateCurrentWeek = (semesterStartDate: string): number => {
  if (!semesterStartDate) return 1;
  
  try {
    // 使用 UTC 时间避免时区问题
    const startParts = semesterStartDate.split('-');
    const startYear = parseInt(startParts[0], 10);
    const startMonth = parseInt(startParts[1], 10) - 1; // 月份从0开始
    const startDay = parseInt(startParts[2], 10);
    const startDate = new Date(startYear, startMonth, startDay);
    
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // 重置到当天0点
    
    // 如果当前日期早于学期开始日期，返回第1周
    if (currentDate < startDate) {
      return 1;
    }
    
    // 找到学期开始日期所在周的周一
    const startDayOfWeek = startDate.getDay(); // 0=周日, 1=周一, ..., 6=周六
    const daysToMonday = startDayOfWeek === 0 ? -6 : 1 - startDayOfWeek;
    const weekStartDate = new Date(startDate);
    weekStartDate.setDate(startDate.getDate() + daysToMonday);
    weekStartDate.setHours(0, 0, 0, 0);
    
    // 找到当前日期所在周的周一
    const currentDayOfWeek = currentDate.getDay();
    const currentDaysToMonday = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
    const currentWeekStartDate = new Date(currentDate);
    currentWeekStartDate.setDate(currentDate.getDate() + currentDaysToMonday);
    currentWeekStartDate.setHours(0, 0, 0, 0);
    
    // 计算两个周一之间相差多少天
    const daysDiff = Math.floor((currentWeekStartDate.getTime() - weekStartDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // 计算周数：相差的天数除以7，再加1（因为第1周从0开始算）
    const weekNumber = Math.floor(daysDiff / 7) + 1;
    
    // 调试信息
    console.log('📅 周数计算详情:', {
      学期开始日期: semesterStartDate,
      学期开始周一: formatDateForInput(weekStartDate),
      今天日期: formatDateForInput(currentDate),
      当前周一: formatDateForInput(currentWeekStartDate),
      相差天数: daysDiff,
      计算周数: weekNumber
    });
    
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
 * 修正逻辑：先找到今天所在周的周一，再往回推
 */
export const calculateSemesterStartDate = (currentWeekNumber: number, currentDate?: Date): string => {
  const today = currentDate || new Date();
  today.setHours(0, 0, 0, 0); // 重置到0点避免时区问题
  
  if (currentWeekNumber < 1) {
    console.error('Current week number must be at least 1');
    return getTodayString();
  }
  
  // 1. 先找到今天所在周的周一
  const todayDayOfWeek = today.getDay(); // 0=周日, 1=周一, ..., 6=周六
  const daysToCurrentMonday = todayDayOfWeek === 0 ? -6 : 1 - todayDayOfWeek;
  const currentWeekMonday = new Date(today);
  currentWeekMonday.setDate(today.getDate() + daysToCurrentMonday);
  currentWeekMonday.setHours(0, 0, 0, 0);
  
  // 2. 从当前周的周一往回推到第1周的周一
  // 当前是第 currentWeekNumber 周，要回到第1周，需要回退 (currentWeekNumber - 1) 周
  const weeksToGoBack = currentWeekNumber - 1;
  const semesterStartDate = new Date(currentWeekMonday);
  semesterStartDate.setDate(currentWeekMonday.getDate() - (weeksToGoBack * 7));
  
  return formatDateForInput(semesterStartDate);
};

/**
 * 验证逆推计算的结果是否合理
 * 修正后的逻辑应该完全匹配，不允许误差
 */
export const validateReverseCalculation = (semesterStartDate: string, expectedWeek: number): boolean => {
  const calculatedWeek = calculateCurrentWeek(semesterStartDate);
  return calculatedWeek === expectedWeek; // 应该完全匹配
};
