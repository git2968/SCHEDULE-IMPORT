/**
 * 课表导出工具模块
 * 
 * 功能：将课表数据导出为Excel文件
 * - 支持单周或多周导出
 * - 自动格式化课程信息（名称、地点、教师）
 * - 提供友好的时间段显示
 * 
 * @module exportSchedule
 */

import * as XLSX from 'xlsx';
import { Course, Schedule } from '../types';

/**
 * 将星期几数字转换为中文文本
 * @param day 1-7 表示周一到周日
 * @returns 对应的中文星期文本
 */
const getDayText = (day: number): string => {
  const days = ['', '周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  return days[day] || '';
};

/**
 * 将节次编号转换为时间段字符串
 * @param session 节次编号 (1-12)
 * @returns 时间段字符串，如 "08:00-08:45"
 */
const getTimeSlot = (session: number): string => {
  switch (session) {
    case 1: return '08:00-08:45';
    case 2: return '08:50-09:35';
    case 3: return '09:50-10:35';
    case 4: return '10:40-11:25';
    case 5: return '13:00-13:45';
    case 6: return '13:50-14:35';
    case 7: return '14:50-15:35';
    case 8: return '15:40-16:25';
    case 9: return '18:00-18:45';
    case 10: return '18:50-19:35';
    case 11: return '19:50-20:35';
    case 12: return '20:40-21:25';
    default: return `第${session}节`;
  }
};

// 清除课程名称中的编号
const cleanCourseName = (name: string): string => {
  return name.replace(/\[\d+\]/, '').trim();
};

// 为指定周数创建表格数据
const createWeeklySchedule = (courses: Course[], week: number): any[][] => {
  // 创建一个空的课程表格
  const schedule: any[][] = [];
  
  // 添加表头
  const header = ['节次/时间', '周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  schedule.push(header);
  
  // 为每个节次创建行
  for (let session = 1; session <= 12; session++) {
    const row = [getTimeSlot(session), '', '', '', '', '', '', ''];
    
    // 查找当前节次和周数的所有课程
    for (const course of courses) {
      if (
        course.startSession <= session && 
        course.endSession >= session && 
        course.weeks.includes(week)
      ) {
        // day是从1开始的，所以在数组中要减1
        const dayIndex = course.day;
        if (dayIndex >= 1 && dayIndex <= 7) {
          const courseInfo = `${cleanCourseName(course.name)}\n${course.location}${course.teacher ? `\n${course.teacher}` : ''}`;
          row[dayIndex] = courseInfo;
        }
      }
    }
    
    schedule.push(row);
  }
  
  return schedule;
};

// 导出课表为Excel
export const exportScheduleToExcel = (schedule: Schedule): void => {
  try {
    // 创建一个新的工作簿
    const workbook = XLSX.utils.book_new();
    
    // 获取总周数
    const { totalWeeks, courses } = schedule;
    
    // 为每周创建一个工作表
    for (let week = 1; week <= totalWeeks; week++) {
      const weeklySchedule = createWeeklySchedule(courses, week);
      const worksheet = XLSX.utils.aoa_to_sheet(weeklySchedule);
      
      // 设置列宽
      const columnWidths = [{ wch: 15 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, 
                           { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }];
      worksheet['!cols'] = columnWidths;
      
      // 添加工作表到工作簿
      XLSX.utils.book_append_sheet(workbook, worksheet, `第${week}周`);
    }
    
    // 创建一个总览表
    const overviewData = [
      ['课表名称', schedule.name],
      ['总周数', schedule.totalWeeks.toString()],
      ['课程数量', schedule.courses.length.toString()],
      ['最后更新', new Date(schedule.updatedAt).toLocaleString()],
      [],
      ['课程ID', '课程名称', '上课地点', '任课教师', '星期几', '节次', '周数']
    ];
    
    // 添加所有课程信息
    for (const course of schedule.courses) {
      overviewData.push([
        course.courseId,
        cleanCourseName(course.name),
        course.location,
        course.teacher || '',
        getDayText(course.day),
        `${course.startSession}-${course.endSession}`,
        course.weeks.join(',')
      ]);
    }
    
    const overviewSheet = XLSX.utils.aoa_to_sheet(overviewData);
    XLSX.utils.book_append_sheet(workbook, overviewSheet, '课表总览');
    
    // 导出Excel文件
    XLSX.writeFile(workbook, `${schedule.name}.xlsx`);
  } catch (error) {
    console.error('导出课表失败', error);
    throw error;
  }
}; 