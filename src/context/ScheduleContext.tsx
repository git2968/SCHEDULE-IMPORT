import React, { createContext, useState, ReactNode, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import * as XLSX from 'xlsx';
import { Schedule, ScheduleContextType, Course } from '../types';
import { useAuth } from '../hooks/useAuth';

// 创建课表上下文
export const ScheduleContext = createContext<ScheduleContextType | null>(null);

interface ScheduleProviderProps {
  children: ReactNode;
}

export const ScheduleProvider: React.FC<ScheduleProviderProps> = ({ children }) => {
  const [currentSchedule, setCurrentSchedule] = useState<Schedule | null>(null);
  const [userSchedules, setUserSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  // 当用户变化时，加载用户的课表
  useEffect(() => {
    if (currentUser) {
      loadUserSchedules();
    } else {
      setCurrentSchedule(null);
      setUserSchedules([]);
    }
  }, [currentUser]);

  // 从本地存储加载用户的所有课表
  const loadUserSchedules = async (): Promise<Schedule[]> => {
    try {
      setLoading(true);
      const schedules = JSON.parse(localStorage.getItem('schedules') || '[]');
      const userSchedules = currentUser 
        ? schedules.filter((s: Schedule) => s.userId === currentUser.id)
        : [];
      
      setUserSchedules(userSchedules);
      
      if (userSchedules.length > 0 && !currentSchedule) {
        // 默认加载最近更新的课表
        const latestSchedule = userSchedules.sort((a: Schedule, b: Schedule) => 
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )[0];
        
        setCurrentSchedule(latestSchedule);
      }
      
      setLoading(false);
      return userSchedules;
    } catch (error) {
      console.error('Failed to load user schedules', error);
      setError('加载课表失败');
      setLoading(false);
      return [];
    }
  };

  // 删除课表
  const deleteSchedule = async (scheduleId: string): Promise<void> => {
    try {
      setLoading(true);
      
      // 从本地存储获取所有课表
      const allSchedules = JSON.parse(localStorage.getItem('schedules') || '[]');
      
      // 过滤掉要删除的课表
      const updatedSchedules = allSchedules.filter((s: Schedule) => s.id !== scheduleId);
      
      // 保存回本地存储
      localStorage.setItem('schedules', JSON.stringify(updatedSchedules));
      
      // 更新状态
      const updatedUserSchedules = userSchedules.filter(s => s.id !== scheduleId);
      setUserSchedules(updatedUserSchedules);
      
      // 如果删除的是当前课表，则设置新的当前课表
      if (currentSchedule && currentSchedule.id === scheduleId) {
        if (updatedUserSchedules.length > 0) {
          setCurrentSchedule(updatedUserSchedules[0]);
        } else {
          setCurrentSchedule(null);
        }
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Failed to delete schedule', error);
      setError('删除课表失败');
      setLoading(false);
      throw error;
    }
  };

  // 解析周数范围，支持多种格式
  const parseWeeks = (weekText: string): number[] => {
    try {
      console.log('解析周数文本:', weekText);
      const weeks: number[] = [];
      
      // 移除方括号，只保留内容
      const content = weekText.replace(/[\[\]]/g, '').trim();
      
      // 如果是单周格式，如"5周"，直接处理为只有第5周
      if (/^\d+周$/.test(content)) {
        const weekNum = parseInt(content.replace('周', ''));
        console.log(`识别到单周格式 "${content}"，解析为第 ${weekNum} 周`);
        return [weekNum];
      }
      
      // 预处理周数格式
      // 1. 先处理"1-3,5-16周"形式，保留逗号分隔
      let processedContent = content;
      
      // 移除末尾的"周"字，便于后续处理
      if (processedContent.endsWith('周')) {
        processedContent = processedContent.substring(0, processedContent.length - 1);
      }
      
      // 检查是否全局包含"单"或"双"关键字
      const isSingleWeeks = processedContent.includes('单');
      const isDoubleWeeks = processedContent.includes('双');
      
      // 使用更精确的分隔符匹配
      // 支持形如"1-3,5-16"这种格式，也支持中文逗号、顿号等
      const segments: string[] = [];
      
      // 先处理逗号分隔的情况
      const commaSplit = processedContent.split(/[,，、]/);
      
      commaSplit.forEach(part => {
        const trimmedPart = part.trim();
        if (trimmedPart) {
          segments.push(trimmedPart);
        }
      });
      
      console.log('分段解析:', segments);
      
      for (const segment of segments) {
        // 处理单周格式，如"单周"
        if (segment === '单' || segment === '单周' || segment === '单数周') {
          // 默认为1-20的单数周
          for (let i = 1; i <= 20; i += 2) {
            weeks.push(i);
          }
          console.log('识别到单周格式，添加所有单数周');
          continue;
        }
        
        // 处理双周格式，如"双周"
        if (segment === '双' || segment === '双周' || segment === '双数周' || segment === '偶数周') {
          // 默认为2-20的双数周
          for (let i = 2; i <= 20; i += 2) {
            weeks.push(i);
          }
          console.log('识别到双周格式，添加所有双数周');
          continue;
        }
        
        // 处理范围格式，如"1-16"或"5-16单"
        const rangeMatch = segment.match(/(\d+)\s*[-~至到]\s*(\d+)(单|双)?/);
        if (rangeMatch) {
          const start = parseInt(rangeMatch[1]);
          const end = parseInt(rangeMatch[2]);
          const rangeSpecifier = rangeMatch[3]; // 可能是"单"或"双"或undefined
          
          // 检查当前范围是否有单双周限定
          const segmentIsSingle = rangeSpecifier === '单' || segment.includes('单');
          const segmentIsDouble = rangeSpecifier === '双' || segment.includes('双');
          
          console.log(`识别到周数范围: ${start}-${end}, 单周限定: ${segmentIsSingle}, 双周限定: ${segmentIsDouble}`);
          
          for (let i = start; i <= end; i++) {
            if (segmentIsSingle && i % 2 === 1) {
              weeks.push(i);
            } else if (segmentIsDouble && i % 2 === 0) {
              weeks.push(i);
            } else if (!segmentIsSingle && !segmentIsDouble) {
              weeks.push(i);
            }
          }
          continue;
        }
        
        // 处理单个周数，如"3"、"5"
        const singleMatch = segment.match(/^(\d+)$/);
        if (singleMatch) {
          const week = parseInt(singleMatch[1]);
          console.log(`识别到单个周数: ${week}`);
          weeks.push(week);
          continue;
        }
        
        // 处理特殊格式，如"5单"（第5周）
        const specialMatch = segment.match(/^(\d+)(单|双)$/);
        if (specialMatch) {
          const week = parseInt(specialMatch[1]);
          console.log(`识别到特殊周数格式: ${segment}, 解析为第 ${week} 周`);
          weeks.push(week);
        }
      }
      
      // 去重并排序
      const result = [...new Set(weeks)].sort((a, b) => a - b);
      console.log('最终解析周数:', result);
      return result;
    } catch (error) {
      console.error('Failed to parse weeks', error);
      return [];
    }
  };

  // 解析课程信息的正则表达式
  const parseCourseInfo = (text: string): Course | null => {
    try {
      // 匹配课程编号和名称
      const courseMatch = text.match(/\[([\d]+)\](.*?)(?:\[|$)/);
      if (!courseMatch) return null;
      
      const courseId = courseMatch[1];
      const courseName = courseMatch[2].trim();
      
      // 匹配周数范围，支持多种格式
      // 匹配形如 "[1-16周]"、"[1-8,10-15周]"、"[5周]" 等格式
      // 规则：方括号内包含数字，可能有连字符或逗号，且以"周"结尾
      const weekRangeRegex = /\[(\d+(?:[-~至到]\d+)?(?:[,，、]\s*\d+(?:[-~至到]\d+)?)*\s*(?:周|单周|双周))\]/;
      const weekRangeMatch = text.match(weekRangeRegex);
      
      console.log('周数匹配结果:', weekRangeMatch);
      
      // 如果找不到周数范围，尝试找简单的单周格式，如 "[5周]"
      let weekRangeText = '[1-20周]'; // 默认值
      if (weekRangeMatch) {
        weekRangeText = weekRangeMatch[0];
      } else {
        // 尝试匹配单个周次，如 "[5周]"
        const singleWeekMatch = text.match(/\[(\d+)周\]/);
        if (singleWeekMatch) {
          weekRangeText = singleWeekMatch[0];
        }
      }
      
      console.log('使用周数文本:', weekRangeText);
      const weeks = parseWeeks(weekRangeText);
      
      // 匹配节次范围
      const sessionMatch = text.match(/\[(\d+)(?:-|~|－|至|到)?(\d+)?节\]/);
      if (!sessionMatch) return null;
      
      const startSession = parseInt(sessionMatch[1]);
      const endSession = sessionMatch[2] ? parseInt(sessionMatch[2]) : startSession;
      
      // 提取地点信息
      // 将方括号内的内容替换为空格，以便更容易提取地点信息
      const cleanText = text.replace(/\[.*?\]/g, ' ').trim();
      
      // 直接获取最后一个方括号后面的所有内容作为地点
      let location = '';
      const lastBracketIndex = text.lastIndexOf(']');
      if (lastBracketIndex !== -1 && lastBracketIndex < text.length - 1) {
        location = text.substring(lastBracketIndex + 1).trim();
      }
      
      // 如果上面的方法没有提取到地点，尝试其他方法
      if (!location) {
        // 尝试匹配常见的地点模式
        const locationPatterns = [
          /第[一二三四五六七八九十]教学楼\d+.*?(?:\s|$)/,
          /实验楼\d+.*?(?:\s|$)/,
          /主教学楼[A-Z]?\d+/,
          /[A-Z]\d{3,4}/
        ];
        
        for (const pattern of locationPatterns) {
          const match = cleanText.match(pattern);
          if (match) {
            location = match[0].trim();
            break;
          }
        }
      }
      
      return {
        id: `${courseId}_${startSession}_${endSession}`, // 使用课程ID和节次作为唯一标识，便于后续合并相同课程
        courseId,
        name: courseName,
        weeks,
        weekRange: weekRangeText,
        day: 0, // 默认值，需要根据Excel中的位置确定
        startSession,
        endSession,
        location,
        teacher: undefined
      };
    } catch (error) {
      console.error('Failed to parse course info', error);
      return null;
    }
  };

  // 解析Excel文件
  const parseExcel = async (file: File): Promise<Schedule> => {
    return new Promise((resolve, reject) => {
      setLoading(true);
      setError(null);
      
      try {
        const reader = new FileReader();
        
        reader.onload = (e) => {
          try {
            if (!e.target || !e.target.result) {
              throw new Error('Failed to read file');
            }
            
            const data = e.target.result;
            const workbook = XLSX.read(data, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            
            // 将工作表转换为JSON对象
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            
            // 提取课程信息
            const tempCourses: Course[] = [];
            
            // 查找表头行，确定星期几的列
            let headerRow = -1;
            let headerCols: { col: number, day: number }[] = [];
            
            // 首先尝试查找标准的表头（包含星期几或周几的文本）
            for (let row = 0; row < Math.min(10, jsonData.length); row++) {
              const rowData = jsonData[row] as string[];
              if (!rowData) continue;
              
              for (let col = 0; col < rowData.length; col++) {
                const cell = rowData[col];
                if (typeof cell !== 'string') continue;
                
                // 匹配星期几
                const cellStr = typeof cell === 'string' ? cell : String(cell);
                
                // 使用正则表达式更精确地匹配星期格式
                if (cellStr.match(/星期一|周一|Monday|Mon\.?|一$/)) {
                  headerRow = row;
                  headerCols.push({ col, day: 1 });
                } else if (cellStr.match(/星期二|周二|Tuesday|Tue\.?|二$/)) {
                  headerRow = row;
                  headerCols.push({ col, day: 2 });
                } else if (cellStr.match(/星期三|周三|Wednesday|Wed\.?|三$/)) {
                  headerRow = row;
                  headerCols.push({ col, day: 3 });
                } else if (cellStr.match(/星期四|周四|Thursday|Thu\.?|四$/)) {
                  headerRow = row;
                  headerCols.push({ col, day: 4 });
                } else if (cellStr.match(/星期五|周五|Friday|Fri\.?|五$/)) {
                  headerRow = row;
                  headerCols.push({ col, day: 5 });
                } else if (cellStr.match(/星期六|周六|Saturday|Sat\.?|六$/)) {
                  headerRow = row;
                  headerCols.push({ col, day: 6 });
                } else if (cellStr.match(/星期日|周日|星期天|周天|Sunday|Sun\.?|日$/)) {
                  headerRow = row;
                  headerCols.push({ col, day: 7 });
                }
              }
              
              if (headerCols.length > 0) break;
            }
            
            // 检查headerCols是否包含了所有的天（1-7），如果没有，则尝试推断
            const daySet = new Set(headerCols.map(col => col.day));
            
            // 如果找到了某些天但不完整（可能缺少周六周日），尝试补充
            if (headerCols.length > 0 && daySet.size < 7) {
              // 找出已有列的最大列索引
              const maxCol = Math.max(...headerCols.map(col => col.col));
              
              // 按顺序查找缺失的天
              for (let day = 1; day <= 7; day++) {
                if (!daySet.has(day)) {
                  // 推断缺失的列可能在最后
                  headerCols.push({ col: maxCol + (day - daySet.size), day });
                }
              }
              
              // 按列排序
              headerCols.sort((a, b) => a.col - b.col);
            }
            
            // 如果没有找到标准表头，尝试使用第一行作为表头，并假设列从左到右对应周一到周日
            if (headerCols.length === 0 && jsonData.length > 0) {
              headerRow = 0;
              const firstRow = jsonData[0] as any[];
              
              // 跳过第一列（通常是时间/节次列）
              for (let i = 1; i <= Math.min(7, firstRow.length - 1); i++) {
                headerCols.push({ col: i, day: i });
              }
            }
            
            // 如果仍然没有找到，使用默认列
            if (headerCols.length === 0) {
              headerRow = 0;
              for (let i = 1; i <= 7; i++) {
                headerCols.push({ col: i, day: i });
              }
            }
            
            console.log('解析到的表头列：', headerCols);
            
            // 查找节次行，确定上课时间
            const sessionRows: { row: number, startSession: number, endSession: number }[] = [];
            
            for (let row = headerRow + 1; row < jsonData.length; row++) {
              const rowData = jsonData[row] as string[];
              if (!rowData || !rowData[0]) continue;
              
              // 查找包含节次信息的单元格
              const sessionText = String(rowData[0]);
              
              // 匹配如"第1-2节"、"1-2节"、"1、2节"等格式
              const sessionMatch = sessionText.match(/第?(\d+)(?:[-~、至到]|,|，)(\d+)(?:节|讲|课)/);
              if (sessionMatch) {
                const startSession = parseInt(sessionMatch[1]);
                const endSession = parseInt(sessionMatch[2]);
                sessionRows.push({ row, startSession, endSession });
                continue;
              }
              
              // 匹配如"第1节"、"1节"等格式
              const singleSessionMatch = sessionText.match(/第?(\d+)(?:节|讲|课)/);
              if (singleSessionMatch) {
                const session = parseInt(singleSessionMatch[1]);
                sessionRows.push({ row, startSession: session, endSession: session });
                continue;
              }
              
              // 匹配如"上午"、"下午"、"晚上"等格式
              if (sessionText.includes('上午') || sessionText.includes('早上') || sessionText.includes('早晨')) {
                sessionRows.push({ row, startSession: 1, endSession: 4 });
              } else if (sessionText.includes('下午')) {
                sessionRows.push({ row, startSession: 5, endSession: 8 });
              } else if (sessionText.includes('晚上') || sessionText.includes('晚间') || sessionText.includes('夜间')) {
                sessionRows.push({ row, startSession: 9, endSession: 12 });
              }
            }
            
            // 如果找不到节次行，使用默认行
            if (sessionRows.length === 0) {
              for (let i = 1; i <= 5; i++) {
                sessionRows.push({ 
                  row: headerRow + i, 
                  startSession: i * 2 - 1, 
                  endSession: i * 2 
                });
              }
            }
            
            // 遍历每个节次行和星期列，提取课程信息
            for (const { row, startSession, endSession } of sessionRows) {
              const rowData = jsonData[row] as string[];
              if (!rowData) continue;
              
              for (const { col, day } of headerCols) {
                const cellValue = rowData[col];
                
                if (cellValue && typeof cellValue === 'string' && cellValue.trim() !== '') {
                  // 单元格可能包含多个课程，按换行符分割
                  const courseTexts = cellValue.split(/\n|\\n/);
                  
                  courseTexts.forEach(courseText => {
                    if (courseText.trim()) {
                      const course = parseCourseInfo(courseText);
                      
                      if (course) {
                        // 设置课程的星期几（从1开始，1表示周一）
                        course.day = day;
                        
                        // 如果课程没有指定节次，使用当前行的节次
                        if (!course.startSession || !course.endSession) {
                          course.startSession = startSession;
                          course.endSession = endSession;
                        }
                        
                        tempCourses.push(course);
                      }
                    }
                  });
                }
              }
            }
            
            // 合并相同课程（相同课程ID、名称、星期几、节次范围）
            const courseMap = new Map<string, Course>();
            
            tempCourses.forEach(course => {
              // 创建唯一键，用于识别相同课程
              const key = `${course.courseId}_${course.name}_${course.day}_${course.startSession}_${course.endSession}`;
              
              if (courseMap.has(key)) {
                // 如果已存在相同课程，合并周数
                const existingCourse = courseMap.get(key)!;
                existingCourse.weeks = [...new Set([...existingCourse.weeks, ...course.weeks])].sort((a, b) => a - b);
              } else {
                // 否则添加新课程
                courseMap.set(key, { ...course, id: uuidv4() });
              }
            });
            
            // 将合并后的课程转换为数组
            const courses = Array.from(courseMap.values());
            
            // 创建新的课表
            const newSchedule: Schedule = {
              id: uuidv4(),
              userId: currentUser?.id || '',
              name: file.name.replace(/\.[^/.]+$/, ''), // 使用文件名（不含扩展名）作为课表名称
              totalWeeks: 20, // 默认为20周
              courses,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            
            setCurrentSchedule(newSchedule);
            setLoading(false);
            resolve(newSchedule);
          } catch (error) {
            console.error('Failed to parse Excel file', error);
            setError('解析Excel文件失败');
            setLoading(false);
            reject(error);
          }
        };
        
        reader.onerror = (error) => {
          console.error('Failed to read file', error);
          setError('读取文件失败');
          setLoading(false);
          reject(error);
        };
        
        reader.readAsBinaryString(file);
      } catch (error) {
        console.error('Failed to parse Excel file', error);
        setError('解析Excel文件失败');
        setLoading(false);
        reject(error);
      }
    });
  };

  // 保存课表
  const saveSchedule = async (schedule: Schedule): Promise<void> => {
    try {
      if (!currentUser) {
        throw new Error('用户未登录');
      }
      
      // 更新时间戳和用户ID
      const updatedSchedule = {
        ...schedule,
        userId: currentUser.id,
        updatedAt: new Date().toISOString()
      };
      
      // 从本地存储获取所有课表
      const schedules = JSON.parse(localStorage.getItem('schedules') || '[]');
      
      // 查找是否已存在该课表
      const index = schedules.findIndex((s: Schedule) => s.id === updatedSchedule.id);
      
      if (index !== -1) {
        // 更新现有课表
        schedules[index] = updatedSchedule;
      } else {
        // 添加新课表
        schedules.push(updatedSchedule);
      }
      
      // 保存回本地存储
      localStorage.setItem('schedules', JSON.stringify(schedules));
      
      // 更新当前课表和用户课表列表
      setCurrentSchedule(updatedSchedule);
      await loadUserSchedules();
    } catch (error) {
      console.error('Failed to save schedule', error);
      setError('保存课表失败');
      throw error;
    }
  };

  // 更新课表
  const updateSchedule = async (scheduleUpdate: Partial<Schedule>): Promise<void> => {
    if (!currentSchedule) {
      throw new Error('没有当前课表');
    }
    
    const updatedSchedule = {
      ...currentSchedule,
      ...scheduleUpdate,
      updatedAt: new Date().toISOString()
    };
    
    return saveSchedule(updatedSchedule);
  };

  // 添加课程
  const addCourse = async (course: Omit<Course, 'id'>): Promise<void> => {
    if (!currentSchedule) {
      throw new Error('没有当前课表');
    }

    try {
      const newCourse: Course = {
        ...course,
        id: uuidv4()
      };

      const updatedSchedule = {
        ...currentSchedule,
        courses: [...currentSchedule.courses, newCourse],
        updatedAt: new Date().toISOString()
      };

      await saveSchedule(updatedSchedule);
    } catch (error) {
      console.error('Failed to add course', error);
      setError('添加课程失败');
      throw error;
    }
  };

  // 更新课程
  const updateCourse = async (courseId: string, courseData: Partial<Course>): Promise<void> => {
    if (!currentSchedule) {
      throw new Error('没有当前课表');
    }

    try {
      const courseIndex = currentSchedule.courses.findIndex(course => course.id === courseId);
      
      if (courseIndex === -1) {
        throw new Error('课程不存在');
      }

      const updatedCourses = [...currentSchedule.courses];
      updatedCourses[courseIndex] = {
        ...updatedCourses[courseIndex],
        ...courseData
      };

      const updatedSchedule = {
        ...currentSchedule,
        courses: updatedCourses,
        updatedAt: new Date().toISOString()
      };

      await saveSchedule(updatedSchedule);
    } catch (error) {
      console.error('Failed to update course', error);
      setError('更新课程失败');
      throw error;
    }
  };

  // 删除课程
  const deleteCourse = async (courseId: string): Promise<void> => {
    if (!currentSchedule) {
      throw new Error('没有当前课表');
    }

    try {
      const updatedCourses = currentSchedule.courses.filter(course => course.id !== courseId);

      const updatedSchedule = {
        ...currentSchedule,
        courses: updatedCourses,
        updatedAt: new Date().toISOString()
      };

      await saveSchedule(updatedSchedule);
    } catch (error) {
      console.error('Failed to delete course', error);
      setError('删除课程失败');
      throw error;
    }
  };

  // 向课程添加周数
  const addWeekToCourse = async (courseId: string, week: number): Promise<void> => {
    if (!currentSchedule) {
      throw new Error('没有当前课表');
    }

    try {
      const courseIndex = currentSchedule.courses.findIndex(course => course.id === courseId);
      
      if (courseIndex === -1) {
        throw new Error('课程不存在');
      }

      const course = currentSchedule.courses[courseIndex];
      
      // 如果周数已存在，则不添加
      if (course.weeks.includes(week)) {
        return;
      }

      const updatedWeeks = [...course.weeks, week].sort((a, b) => a - b);
      
      const updatedCourses = [...currentSchedule.courses];
      updatedCourses[courseIndex] = {
        ...course,
        weeks: updatedWeeks
      };

      const updatedSchedule = {
        ...currentSchedule,
        courses: updatedCourses,
        updatedAt: new Date().toISOString()
      };

      await saveSchedule(updatedSchedule);
    } catch (error) {
      console.error('Failed to add week to course', error);
      setError('添加周数失败');
      throw error;
    }
  };

  // 从课程移除周数
  const removeWeekFromCourse = async (courseId: string, week: number): Promise<void> => {
    if (!currentSchedule) {
      throw new Error('没有当前课表');
    }

    try {
      const courseIndex = currentSchedule.courses.findIndex(course => course.id === courseId);
      
      if (courseIndex === -1) {
        throw new Error('课程不存在');
      }

      const course = currentSchedule.courses[courseIndex];
      const updatedWeeks = course.weeks.filter(w => w !== week);
      
      const updatedCourses = [...currentSchedule.courses];
      updatedCourses[courseIndex] = {
        ...course,
        weeks: updatedWeeks
      };

      const updatedSchedule = {
        ...currentSchedule,
        courses: updatedCourses,
        updatedAt: new Date().toISOString()
      };

      await saveSchedule(updatedSchedule);
    } catch (error) {
      console.error('Failed to remove week from course', error);
      setError('移除周数失败');
      throw error;
    }
  };

  const value: ScheduleContextType = {
    currentSchedule,
    userSchedules,
    loading,
    error,
    setCurrentSchedule,
    saveSchedule,
    parseExcel,
    updateSchedule,
    addCourse,
    updateCourse,
    deleteCourse,
    addWeekToCourse,
    removeWeekFromCourse,
    loadUserSchedules,
    deleteSchedule
  };

  return (
    <ScheduleContext.Provider value={value}>
      {children}
    </ScheduleContext.Provider>
  );
}; 