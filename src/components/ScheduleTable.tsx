import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { Course } from '../types';
import { useSchedule } from '../hooks/useSchedule';
import { exportScheduleToExcel } from '../utils/exportSchedule';

// 媒体查询断点
const MOBILE_BREAKPOINT = '768px';

const TableContainer = styled.div`
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 1.5rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  
  @media (max-width: ${MOBILE_BREAKPOINT}) {
    padding: 1rem;
    border-radius: 16px;
  }
`;

// 调整移动端表格布局
const Table = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 6px;
  
  @media (max-width: ${MOBILE_BREAKPOINT}) {
    border-spacing: 4px;
    display: block;
    width: 100%;
    max-width: 100%;
  }
`;

// 调整移动端滚动容器
const ScrollContainer = styled.div`
  width: 100%;
  overflow-x: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
  
  &::-webkit-scrollbar {
    height: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 6px;
  }
  
  @media (max-width: ${MOBILE_BREAKPOINT}) {
    overflow-x: hidden; /* 禁止水平滚动 */
    overflow-y: auto;
    max-height: 70vh;
    width: 100%;
  }
`;

const TableHeader = styled.thead`
  background: transparent;
  
  @media (max-width: ${MOBILE_BREAKPOINT}) {
    display: block;
  }
`;

const TableHeaderCell = styled.th<{ isCurrentDay?: boolean; isTimeColumn?: boolean }>`
  padding: 0.85rem 1rem;
  text-align: center;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.75);
  font-size: 1rem;
  border-radius: 20px;
  background: ${props => props.isCurrentDay ? 'rgba(10, 132, 255, 0.2)' : 'rgba(255, 255, 255, 0.6)'};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  transition: all 0.2s ease;
  position: relative;
  
  /* Make time column header match the width of time cells */
  ${props => props.isTimeColumn && `
    width: 100px;
    min-width: 100px;
    max-width: 100px;
    padding: 0.85rem 0.3rem;
  `}
  
  &:hover {
    background: ${props => props.isCurrentDay ? 'rgba(10, 132, 255, 0.25)' : 'rgba(255, 255, 255, 0.75)'};
  }
  
  ${props => props.isCurrentDay && css`
    &:after {
      content: '';
      position: absolute;
      bottom: 5px;
      left: 50%;
      transform: translateX(-50%);
      width: 6px;
      height: 6px;
      background: rgba(10, 132, 255, 0.6);
      border-radius: 50%;
    }
  `}
  
  @media (max-width: ${MOBILE_BREAKPOINT}) {
    font-size: 0.95rem;
    padding: 0.7rem 0.5rem;
    
    ${props => props.isTimeColumn && `
      width: 80px;
      min-width: 80px;
      max-width: 80px;
      padding: 0.7rem 0.3rem;
    `}
  }
`;

const TableBody = styled.tbody`
  @media (max-width: ${MOBILE_BREAKPOINT}) {
    display: block;
  }
`;

const TableRow = styled.tr`
  @media (max-width: ${MOBILE_BREAKPOINT}) {
    display: flex;
    flex-direction: column;
    margin-bottom: 10px;
  }
`;

// 调整TimeCell组件，优化手机端显示
const TimeCell = styled.td`
  padding: 0.6rem 0.2rem;
  text-align: center;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.75);
  background: rgba(255, 255, 255, 0.5);
  border-radius: 20px;
  font-size: 0.95rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  transition: all 0.2s ease;
  width: 100px;
  min-width: 100px;
  max-width: 100px;
  height: 80px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  
  &:hover {
    background: rgba(255, 255, 255, 0.6);
  }
  
  @media (max-width: ${MOBILE_BREAKPOINT}) {
    width: 100%;
    min-width: unset; /* 移除最小宽度限制 */
    max-width: 100%;
    height: auto;
    min-height: 70px;
    flex-direction: row;
    justify-content: flex-start; /* 靠左对齐 */
    padding: 0.75rem 1rem;
    border-radius: 18px;
    align-items: center;
    margin-bottom: 8px;
    box-sizing: border-box;
    background: rgba(240, 245, 255, 0.7); /* 浅蓝色背景，更容易区分是节次单元格 */
  }
`;

// 调整SessionNumber组件
const SessionNumber = styled.div`
  font-weight: 700;
  font-size: ${props => props.children && String(props.children).length > 1 ? '1.1rem' : '1.2rem'};
  margin-bottom: 4px;
  
  @media (max-width: ${MOBILE_BREAKPOINT}) {
    margin-bottom: 0;
    margin-right: 20px; /* 增加与时间的间距 */
    min-width: 30px;
    text-align: center;
    font-size: 1.6rem; /* 显著增大字号 */
    font-weight: 700;
    color: rgba(10, 132, 255, 0.9); /* 添加蓝色，增强辨识度 */
  }
`;

// 调整SessionTime组件
const SessionTime = styled.div`
  font-size: 0.9rem;
  color: rgba(0, 0, 0, 0.7);
  font-weight: 600;
  line-height: 1.2;
  
  @media (max-width: ${MOBILE_BREAKPOINT}) {
    font-size: 1.05rem;
    font-weight: 500;
    white-space: nowrap; /* 防止时间换行 */
    overflow: visible; /* 确保完整显示 */
    color: rgba(0, 0, 0, 0.65);
  }
`;

// 调整课程单元格样式
const TableCell = styled.td<{ 'data-has-content'?: boolean; isCurrentDay?: boolean }>`
  width: 145px;
  height: 80px;
  padding: 0.5rem;
  text-align: center;
  vertical-align: middle;
  border-radius: 20px;
  background: ${props => {
    if (props['data-has-content']) return 'transparent';
    return props.isCurrentDay ? 'rgba(10, 132, 255, 0.05)' : 'rgba(255, 255, 255, 0.3)';
  }};
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => {
      if (props['data-has-content']) return 'transparent';
      return props.isCurrentDay ? 'rgba(10, 132, 255, 0.08)' : 'rgba(255, 255, 255, 0.4)';
    }};
  }
  
  @media (max-width: ${MOBILE_BREAKPOINT}) {
    width: 100%;
    height: auto;
    min-height: 70px;
    margin-bottom: 8px;
    background: ${props => {
      if (props['data-has-content']) return 'transparent';
      return props.isCurrentDay ? 'rgba(10, 132, 255, 0.05)' : 'rgba(255, 255, 255, 0.6)';
    }};
    border-radius: 16px;
  }
`;

// 优化课程项目样式
const CourseItem = styled.div<{ background?: string }>`
  background: ${props => props.background || 'rgba(10, 132, 255, 0.15)'};
  border-radius: 12px;
  padding: 0.75rem 0.5rem;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.25s ease;
  cursor: default;
  position: relative;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
  }
  
  @media (max-width: ${MOBILE_BREAKPOINT}) {
    border-radius: 16px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    padding: 0.8rem 0.6rem;
  }
`;

// 新增移动端特定组件
const MobileWeekSelector = styled.div`
  display: none;
  
  @media (max-width: ${MOBILE_BREAKPOINT}) {
    display: flex;
    justify-content: flex-start; /* 左对齐 */
    align-items: center;
    margin-bottom: 16px;
    padding: 10px;
    background: rgba(255, 255, 255, 0.6);
    border-radius: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
    flex-wrap: wrap; /* 允许换行 */
    gap: 8px; /* 元素之间的间隙 */
  }
`;

const MobileWeekButton = styled.button`
  background: rgba(255, 255, 255, 0.7);
  border: none;
  border-radius: 12px;
  padding: 8px 12px;
  font-size: 0.9rem;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.7);
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const MobileWeekDisplay = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.8);
`;

const MobileDaySelector = styled.div`
  display: none;
  
  @media (max-width: ${MOBILE_BREAKPOINT}) {
    display: flex;
    overflow-x: auto;
    scrollbar-width: none;
    margin-bottom: 12px;
    padding: 6px 0;
    
    &::-webkit-scrollbar {
      display: none;
    }
  }
`;

// 调整移动端表格的总体布局
const MobileDayButton = styled.button<{ isActive?: boolean }>`
  background: ${props => props.isActive ? 'rgba(10, 132, 255, 0.2)' : 'rgba(255, 255, 255, 0.6)'};
  border: none;
  border-radius: 12px;
  padding: 8px 16px;
  margin-right: 8px;
  font-size: 0.95rem; /* 增大按钮字体 */
  font-weight: 500;
  color: rgba(0, 0, 0, 0.8);
  white-space: nowrap;
  cursor: pointer;
  
  &:last-child {
    margin-right: 0;
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const fadeInTooltip = keyframes`
  from {
    opacity: 0;
    transform: translateY(5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

// Create styled components for the tooltip container
const TooltipContainer = styled.div`
  position: absolute;
  z-index: 200;
  pointer-events: none;
  transform: translateX(-50%);
`;

const TooltipContent = styled.div`
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  padding: 8px 12px;
  animation: ${fadeInTooltip} 0.2s ease-out;
`;

const TooltipArrow = styled.div`
  position: absolute;
  top: -6px;
  left: 50%;
  transform: translateX(-50%);
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-bottom: 6px solid rgba(255, 255, 255, 0.95);
`;

const TooltipRow = styled.div`
  display: flex;
  margin-bottom: 4px;
  font-size: 0.75rem;
  color: rgba(0, 0, 0, 0.75);
`;

const TooltipLabel = styled.div`
  font-weight: 500;
  margin-right: 8px;
  color: rgba(0, 0, 0, 0.5);
`;

const TooltipValue = styled.div`
  font-weight: 500;
`;

// 添加一个显示课程节次范围的组件
const CourseSessionBadge = styled.div`
  background: rgba(10, 132, 255, 0.15);
  color: rgba(10, 132, 255, 0.9);
  font-size: 0.85rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 12px;
  margin-bottom: 8px;
  
  @media (max-width: ${MOBILE_BREAKPOINT}) {
    font-size: 0.9rem;
    padding: 3px 10px;
    margin-bottom: 6px;
  }
`;

// 修改CourseName组件增加移动端样式
const CourseName = styled.div`
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 0.4rem;
  color: rgba(0, 0, 0, 0.85);
  
  @media (max-width: ${MOBILE_BREAKPOINT}) {
    font-size: 1rem;
    margin-bottom: 0.5rem;
    font-weight: 700;
  }
`;

const CourseLocation = styled.div`
  font-size: 0.8rem;
  color: rgba(0, 0, 0, 0.6);
  text-align: center;
  word-break: break-word;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const WeekNavigationContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const WeekNavigationControls = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 0.75rem;
  gap: 1.2rem;
`;

const WeekProgress = styled.div`
  width: 80%;
  max-width: 500px;
  height: 6px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
  margin-top: 0.5rem;
  overflow: hidden;
  position: relative;
`;

const WeekProgressFill = styled.div<{ percent: number }>`
  height: 100%;
  width: ${props => props.percent}%;
  background: rgba(10, 132, 255, 0.5);
  border-radius: 3px;
  transition: width 0.3s ease;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
  flex-direction: column;
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: rgba(10, 132, 255, 0.6);
  animation: ${spin} 1s linear infinite;
  margin-bottom: 1rem;
`;

const LoadingText = styled.div`
  font-size: 1rem;
  color: rgba(0, 0, 0, 0.6);
`;

// 调整移动端整体容器
const TableContainerWithAnimation = styled(TableContainer)`
  animation: ${fadeIn} 0.4s ease-out;
  position: relative; /* Added to establish positioning context for tooltips */
  
  @media (max-width: ${MOBILE_BREAKPOINT}) {
    padding: 1rem 0.8rem; /* 减少左右内边距，让内容可以扩展更宽 */
    max-width: 100%;
    width: 100%;
    box-sizing: border-box;
  }
`;

const WeekButton = styled.button`
  background: rgba(255, 255, 255, 0.6);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  
  &:hover {
    background: rgba(10, 132, 255, 0.15);
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const WeekDisplay = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.85);
  min-width: 120px;
  text-align: center;
  padding: 0.6rem 1rem;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
`;

const ExportButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.7);
  border: none;
  border-radius: 16px;
  padding: 0.6rem 1.2rem;
  margin-left: 16px;
  font-size: 0.9rem;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.75);
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  
  &:hover {
    background: rgba(10, 132, 255, 0.15);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
  
  &:before {
    content: "📊";
    margin-right: 6px;
    font-size: 1rem;
  }
`;

const NoCoursesMessage = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  color: rgba(0, 0, 0, 0.6);
  font-size: 1.1rem;
  font-weight: 500;
`;

// 课程背景颜色 - 使用更鲜艳但透明的颜色
const courseColors = [
  'rgba(10, 132, 255, 0.18)',
  'rgba(48, 209, 88, 0.18)',
  'rgba(255, 69, 58, 0.18)',
  'rgba(255, 159, 10, 0.18)',
  'rgba(191, 90, 242, 0.18)',
  'rgba(94, 92, 230, 0.18)',
  'rgba(0, 199, 190, 0.18)',
  'rgba(255, 214, 10, 0.18)'
];

// Helper function to clean course name from code
const cleanCourseName = (name: string): string => {
  // Remove course codes like [28305038] from the course name
  // First, try to extract the name without the code
  const nameWithoutCode = name.replace(/\[\d+\]/, '').trim();
  
  // If the nameWithoutCode is empty, return the original name
  return nameWithoutCode || name;
};

// Helper function to extract course code
const extractCourseCode = (name: string): string => {
  const match = name.match(/\[(\d+)\]/);
  return match ? match[1] : '无';
};

// 添加组件props接口
interface ScheduleTableProps {
  courses?: Course[];
  currentWeek?: number;
  totalWeeks?: number;
}

// 保留SessionTime接口，但只用于显示，不再编辑
interface SessionTime {
  start: string;
  end: string;
}

// 添加视图切换按钮样式
const ViewToggleButton = styled.button`
  background: rgba(255, 255, 255, 0.7);
  border: none;
  border-radius: 12px;
  padding: 8px 14px;
  font-size: 0.9rem;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.7);
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  display: none;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  @media (max-width: ${MOBILE_BREAKPOINT}) {
    display: flex;
    margin-left: auto; /* 将按钮放在周控制器旁边 */
    margin-right: 0;
    z-index: 10;
  }
  
  &:hover {
    background: rgba(10, 132, 255, 0.15);
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &::before {
    content: "";
    width: 14px;
    height: 14px;
    background-image: ${props => props.theme === 'week' 
      ? 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'%23333\'%3E%3Cpath d=\'M3 4h18v2H3V4zm0 7h18v2H3v-2zm0 7h18v2H3v-2z\'/%3E%3C/svg%3E")' 
      : 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'%23333\'%3E%3Cpath d=\'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z\'/%3E%3C/svg%3E")'};
    background-size: contain;
    background-repeat: no-repeat;
    margin-right: 6px;
  }
`;

// 添加一个简单的弹出信息组件，用于显示详细时间
const CoursePressTooltip = styled.div`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 20px;
  margin: 0 auto;
  width: 90%;
  max-width: 350px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
  z-index: 1100;
  animation: ${fadeIn} 0.2s ease-out;
  text-align: left;
  
  @media (max-width: ${MOBILE_BREAKPOINT}) {
    padding: 14px;
  }
`;

const CourseTooltipHeader = styled.div`
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: 10px;
  color: rgba(0, 0, 0, 0.85);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  padding-bottom: 8px;
`;

const CourseTooltipRow = styled.div`
  display: flex;
  margin-bottom: 8px;
  font-size: 0.9rem;
  align-items: center;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const CourseTooltipLabel = styled.div`
  font-weight: 600;
  width: 70px;
  color: rgba(0, 0, 0, 0.6);
`;

const CourseTooltipValue = styled.div`
  font-weight: 500;
  color: rgba(0, 0, 0, 0.8);
  flex: 1;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  width: 24px;
  height: 24px;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.1);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.6);
  cursor: pointer;
  
  &:hover {
    background: rgba(0, 0, 0, 0.2);
  }
  
  &::before {
    content: "×";
  }
`;

const ScheduleTable: React.FC<ScheduleTableProps> = (props) => {
  const scheduleContext = useSchedule();
  // 使用props或从context中获取数据
  const contextSchedule = scheduleContext.currentSchedule;
  const [currentWeek, setCurrentWeek] = useState(props.currentWeek || 1);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [isExporting, setIsExporting] = useState(false);
  
  // 添加移动端视图状态
  const [isMobileView, setIsMobileView] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number>(0);
  
  // 添加视图模式切换状态 - 默认为日视图
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
  
  // 添加课程点击状态
  const [clickedCourse, setClickedCourse] = useState<{course: Course, session: number} | null>(null);
  
  // 检测移动端视图
  useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth <= 768);
    };
    
    checkMobileView();
    window.addEventListener('resize', checkMobileView);
    
    return () => {
      window.removeEventListener('resize', checkMobileView);
    };
  }, []);
  
  // 当切换到移动端视图时，如果没有选择日期，设为当天
  useEffect(() => {
    if (isMobileView && selectedDay === 0) {
      const today = new Date().getDay(); // 0是周日，1-6是周一到周六
      setSelectedDay(today === 0 ? 7 : today);
    }
  }, [isMobileView, selectedDay]);
  
  // 保留时间数据，但不再提供编辑功能
  const [sessionTimes] = useState<SessionTime[]>([
    { start: "8:25", end: "9:10" },    // Session 1
    { start: "9:15", end: "10:00" },   // Session 2
    { start: "10:15", end: "11:00" },  // Session 3
    { start: "11:05", end: "11:50" },  // Session 4
    { start: "13:40", end: "14:25" },  // Session 5
    { start: "14:30", end: "15:15" },  // Session 6
    { start: "15:30", end: "16:15" },  // Session 7
    { start: "16:20", end: "17:05" },  // Session 8
    { start: "17:10", end: "17:55" },  // Session 9
    { start: "18:45", end: "19:30" },  // Session 10
    { start: "19:35", end: "20:20" },  // Session 11
    { start: "20:25", end: "21:10" },  // Session 12
  ]);
  
  useEffect(() => {
    // Simulate loading for demonstration
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  // 如果有props.courses，使用props，否则使用context
  const hasPropsData = !!props.courses;
  
  if (isLoading && !hasPropsData) {
    return (
      <TableContainer>
        <LoadingContainer>
          <Spinner />
          <LoadingText>正在加载课表...</LoadingText>
        </LoadingContainer>
      </TableContainer>
    );
  }
  
  // 如果没有数据可显示
  if (!hasPropsData && !contextSchedule) {
    return (
      <TableContainerWithAnimation>
        <NoCoursesMessage>
          请先导入或选择一个课表
        </NoCoursesMessage>
      </TableContainerWithAnimation>
    );
  }
  
  // 优先使用props中的数据，如果没有则使用context中的数据
  const courses = props.courses || contextSchedule?.courses || [];
  const totalWeeks = props.totalWeeks || contextSchedule?.totalWeeks || 20;
  
  // 星期几的标题
  const weekdays = ['', '周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  
  // 节次信息
  const sessionSlots = Array.from({ length: 12 }, (_, i) => i + 1);
  
  // 切换周数
  const handlePrevWeek = () => {
    setCurrentWeek(prev => Math.max(1, prev - 1));
  };
  
  const handleNextWeek = () => {
    setCurrentWeek(prev => Math.min(totalWeeks, prev + 1));
  };
  
  // 计算周进度百分比
  const weekProgressPercentage = (currentWeek / totalWeeks) * 100;
  
  // 处理导出课表
  const handleExportSchedule = () => {
    if (!contextSchedule) return;
    
    try {
      setIsExporting(true);
      exportScheduleToExcel(contextSchedule);
    } catch (error) {
      console.error('导出课表失败:', error);
    } finally {
      setIsExporting(false);
    }
  };
  
  // 切换选中的日期（手机端）
  const handleDayChange = (day: number) => {
    setSelectedDay(day);
  };
  
  // 获取指定节次和星期几的课程
  const getCourseForSessionAndDay = (session: number, day: number): Course | null => {
    return courses.find(course => 
      course.day === day && 
      course.startSession <= session && 
      course.endSession >= session && 
      course.weeks.includes(currentWeek)
    ) || null;
  };
  
  // 判断是否应该渲染课程单元格
  const shouldRenderCourseCell = (session: number, day: number): boolean => {
    const course = getCourseForSessionAndDay(session, day);
    if (!course) return true;
    
    // 如果是多节课程的第一节，则渲染
    return session === course.startSession;
  };
  
  // 获取课程持续的节数
  const getCourseDuration = (course: Course): number => {
    return course.endSession - course.startSession + 1;
  };
  
  // 根据课程ID获取一致的背景颜色
  const getCourseColor = (courseId: string): string => {
    const hash = courseId.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    
    return courseColors[Math.abs(hash) % courseColors.length];
  };
  
  // 获取当前星期几（1-7）
  const getCurrentDay = (): number => {
    const today = new Date().getDay(); // 0 is Sunday, 1 is Monday
    return today === 0 ? 7 : today; // Convert to 1-7 where 1 is Monday
  };
  
  const currentDay = getCurrentDay();
  
  // Generate unique identifier for course instance
  const getCourseInstanceId = (course: Course, day: number, session: number): string => {
    return `${course.courseId}-${day}-${session}`;
  };

  // Handle tooltip positioning
  const handleCourseMouseEnter = (event: React.MouseEvent, instanceId: string) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const containerRect = document.querySelector('.schedule-container')?.getBoundingClientRect();
    
    if (containerRect) {
      setTooltipPosition({
        top: rect.bottom - containerRect.top + 5,
        left: rect.left - containerRect.left + rect.width / 2
      });
    }
    
    setActiveTooltip(instanceId);
  };

  // 处理课程点击事件
  const handleCourseClick = (course: Course, session: number) => {
    setClickedCourse({ course, session });
    
    // 3秒后自动关闭
    setTimeout(() => {
      setClickedCourse(null);
    }, 5000);
  };
  
  // 关闭课程信息
  const handleCloseTooltip = () => {
    setClickedCourse(null);
  };

  // 获取课程的上下课时间
  const getCourseTimeRange = (course: Course) => {
    const startTime = sessionTimes[course.startSession - 1]?.start;
    const endTime = sessionTimes[course.endSession - 1]?.end;
    return `${startTime} - ${endTime}`;
  };

  // 切换视图模式
  const toggleViewMode = () => {
    setViewMode(prevMode => prevMode === 'day' ? 'week' : 'day');
  };

  // 渲染电脑端表格
  const renderDesktopTable = () => (
    <>
      <WeekNavigationContainer>
        <WeekNavigationControls>
          <WeekButton onClick={handlePrevWeek} disabled={currentWeek <= 1}>
            &lt;
          </WeekButton>
          <WeekDisplay>第 {currentWeek} 周</WeekDisplay>
          <WeekButton onClick={handleNextWeek} disabled={currentWeek >= totalWeeks}>
            &gt;
          </WeekButton>
          <ExportButton onClick={handleExportSchedule} disabled={isExporting}>
            {isExporting ? '导出中...' : '导出课表'}
          </ExportButton>
        </WeekNavigationControls>
        <WeekProgress>
          <WeekProgressFill percent={weekProgressPercentage} />
        </WeekProgress>
      </WeekNavigationContainer>
      
      <ScrollContainer>
        <Table>
          <TableHeader>
            <tr>
              <TableHeaderCell isTimeColumn={true}>节次</TableHeaderCell>
              {weekdays.slice(1).map((day, index) => (
                <TableHeaderCell 
                  key={index}
                  isCurrentDay={index + 1 === currentDay}
                >
                  {day}
                </TableHeaderCell>
              ))}
            </tr>
          </TableHeader>
          
          <TableBody>
            {sessionSlots.map(session => (
              shouldRenderCourseCell(session, 1) || 
              shouldRenderCourseCell(session, 2) || 
              shouldRenderCourseCell(session, 3) || 
              shouldRenderCourseCell(session, 4) || 
              shouldRenderCourseCell(session, 5) || 
              shouldRenderCourseCell(session, 6) || 
              shouldRenderCourseCell(session, 7) ? (
                <TableRow key={session}>
                  <TimeCell>
                    <SessionNumber>{session}</SessionNumber>
                    <SessionTime>
                      {sessionTimes[session - 1]?.start}-{sessionTimes[session - 1]?.end}
                    </SessionTime>
                  </TimeCell>
                  
                  {weekdays.slice(1).map((_, dayIndex) => {
                    const day = dayIndex + 1;
                    
                    if (!shouldRenderCourseCell(session, day)) {
                      return null;
                    }
                    
                    const course = getCourseForSessionAndDay(session, day);
                    const hasContent = !!course;
                    
                    return (
                      <TableCell 
                        key={day} 
                        data-has-content={hasContent}
                        isCurrentDay={day === currentDay}
                        rowSpan={course ? getCourseDuration(course) : 1}
                      >
                        {course && (
                          <CourseItem 
                            background={getCourseColor(course.courseId)}
                            onMouseEnter={(e) => handleCourseMouseEnter(e, getCourseInstanceId(course, day, session))}
                            onMouseLeave={() => setActiveTooltip(null)}
                          >
                            {isMobileView && course.startSession !== course.endSession && (
                              <CourseSessionBadge>第 {course.startSession}-{course.endSession} 节</CourseSessionBadge>
                            )}
                            <CourseName>{cleanCourseName(course.name)}</CourseName>
                            <CourseLocation>{course.location}</CourseLocation>
                          </CourseItem>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ) : null
            ))}
          </TableBody>
        </Table>
      </ScrollContainer>
    </>
  );

  // 渲染手机端表格
  const renderMobileTable = () => (
    <>
      <MobileWeekSelector>
        <MobileWeekButton onClick={handlePrevWeek} disabled={currentWeek <= 1}>
          上一周
        </MobileWeekButton>
        <MobileWeekDisplay>第 {currentWeek} 周</MobileWeekDisplay>
        <MobileWeekButton onClick={handleNextWeek} disabled={currentWeek >= totalWeeks}>
          下一周
        </MobileWeekButton>
        <ViewToggleButton 
          onClick={toggleViewMode}
          theme={viewMode}
        >
          {viewMode === 'day' ? '周视图' : '日视图'}
        </ViewToggleButton>
      </MobileWeekSelector>
      
      {viewMode === 'day' ? (
        // 日视图 - 显示当前选中日的课程
        <>
          <MobileDaySelector>
            {weekdays.slice(1).map((day, index) => (
              <MobileDayButton 
                key={index}
                isActive={index + 1 === selectedDay}
                onClick={() => handleDayChange(index + 1)}
              >
                {day}
              </MobileDayButton>
            ))}
          </MobileDaySelector>
          
          <ScrollContainer>
            <Table>
              <TableBody>
                {sessionSlots.map(session => {
                  const course = getCourseForSessionAndDay(session, selectedDay);
                  const shouldRender = selectedDay === 0 || shouldRenderCourseCell(session, selectedDay);
                  
                  if (!shouldRender) return null;
                  
                  return (
                    <TableRow key={session}>
                      <TimeCell>
                        <SessionNumber>{session}</SessionNumber>
                        <SessionTime>
                          {sessionTimes[session - 1]?.start}-{sessionTimes[session - 1]?.end}
                        </SessionTime>
                      </TimeCell>
                      
                      {selectedDay > 0 && (
                        <TableCell 
                          data-has-content={!!course}
                          isCurrentDay={selectedDay === currentDay}
                        >
                          {course && (
                            <CourseItem 
                              background={getCourseColor(course.courseId)}
                              onMouseEnter={(e) => handleCourseMouseEnter(e, getCourseInstanceId(course, selectedDay, session))}
                              onMouseLeave={() => setActiveTooltip(null)}
                              onClick={(e) => isMobileView && handleCourseMouseEnter(e, getCourseInstanceId(course, selectedDay, session))}
                            >
                              {isMobileView && course.startSession !== course.endSession && (
                                <CourseSessionBadge>第 {course.startSession}-{course.endSession} 节</CourseSessionBadge>
                              )}
                              <CourseName>{cleanCourseName(course.name)}</CourseName>
                              <CourseLocation>{course.location}</CourseLocation>
                            </CourseItem>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </ScrollContainer>
        </>
      ) : (
        // 周视图 - 显示整周的课表
        <ScrollContainer>
          <Table style={{ width: '100%', tableLayout: 'fixed' }}>
            <TableHeader>
              <tr>
                <TableHeaderCell isTimeColumn={true} style={{ width: '50px', minWidth: '50px' }}>
                  节
                </TableHeaderCell>
                {weekdays.slice(1).map((day, index) => (
                  <TableHeaderCell 
                    key={index}
                    isCurrentDay={index + 1 === currentDay}
                    style={{ padding: '0.4rem', fontSize: '0.85rem', width: '14%' }}
                  >
                    {day}
                  </TableHeaderCell>
                ))}
              </tr>
            </TableHeader>
            
            <TableBody>
              {sessionSlots.map(session => (
                <TableRow key={session} style={{ display: 'table-row' }}>
                  <TimeCell style={{ 
                    width: '50px', 
                    minWidth: '50px',
                    height: '60px',
                    padding: '0.3rem',
                    fontSize: '0.8rem',
                    flexDirection: 'column'
                  }}>
                    <SessionNumber style={{ fontSize: '1rem', marginBottom: '2px' }}>{session}</SessionNumber>
                    <SessionTime style={{ fontSize: '0.65rem' }}>
                      {sessionTimes[session - 1]?.start}
                    </SessionTime>
                  </TimeCell>
                  
                  {weekdays.slice(1).map((_, dayIndex) => {
                    const day = dayIndex + 1;
                    const course = getCourseForSessionAndDay(session, day);
                    const shouldRender = shouldRenderCourseCell(session, day);
                    
                    // 如果不应该渲染单元格（多节课程非起始节），则返回占位符
                    if (!shouldRender) return <td key={`empty-${day}-${session}`} style={{ display: 'none' }}></td>;
                    
                    // 统一无课程单元格的样式
                    return (
                      <TableCell 
                        key={day} 
                        data-has-content={!!course}
                        isCurrentDay={day === currentDay}
                        style={{ 
                          width: '14%',
                          height: '60px',
                          padding: '0.2rem',
                          marginBottom: '0',
                          background: course ? 'transparent' : 'rgba(255, 255, 255, 0.3)', // 所有无课单元格使用相同背景色
                          boxSizing: 'border-box',
                          border: '1px solid transparent' // 添加边框防止塌陷
                        }}
                        rowSpan={course && course.startSession !== course.endSession ? 
                                 course.endSession - course.startSession + 1 : 1}
                      >
                        {course && (
                          <CourseItem 
                            background={getCourseColor(course.courseId)}
                            style={{ padding: '0.25rem', height: '100%' }}
                          >
                            {/* 添加多节课程的节次范围标识 */}
                            {course.startSession !== course.endSession && (
                              <div style={{
                                fontSize: '0.6rem',
                                fontWeight: 'bold',
                                color: 'rgba(10, 132, 255, 0.9)',
                                marginBottom: '2px',
                                background: 'rgba(10, 132, 255, 0.1)',
                                padding: '1px 4px',
                                borderRadius: '8px',
                                display: 'inline-block'
                              }}>
                                {course.startSession}-{course.endSession}节
                              </div>
                            )}
                            <CourseName style={{ 
                              fontSize: '0.7rem', 
                              marginBottom: '0',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              maxWidth: '100%',
                              textAlign: 'center'
                            }}>
                              {cleanCourseName(course.name).length > 6 
                                ? cleanCourseName(course.name).substring(0, 5) + '...' 
                                : cleanCourseName(course.name)}
                            </CourseName>
                          </CourseItem>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollContainer>
      )}
    </>
  );

  return (
    <TableContainerWithAnimation className="schedule-container">
      {/* 全局提示框 */}
      {activeTooltip && (
        <TooltipContainer style={{
          top: `${tooltipPosition.top}px`,
          left: `${tooltipPosition.left}px`,
        }}>
          <TooltipContent>
            {(() => {
              try {
                // Parse the instance ID to find the relevant course
                const parts = activeTooltip.split('-');
                if (parts.length < 3) return null;
                
                const courseId = parts[0];
                const dayStr = parts[1];
                const sessionStr = parts[2];
                
                const day = parseInt(dayStr, 10);
                const session = parseInt(sessionStr, 10);
                
                if (isNaN(day) || isNaN(session)) return null;
                
                // 确保使用组件内部计算的courses变量
                const course = courses.find(c => 
                  c.courseId === courseId && 
                  c.day === day && 
                  c.startSession <= session && 
                  c.endSession >= session
                );
                
                if (!course) return null;
                
                // 获取上下课时间
                const startTime = sessionTimes[course.startSession - 1]?.start;
                const endTime = sessionTimes[course.endSession - 1]?.end; // 现在正确地从最后一节课获取结束时间
                
                return (
                  <>
                    <TooltipRow>
                      <TooltipLabel>课程:</TooltipLabel>
                      <TooltipValue>{cleanCourseName(course.name)}</TooltipValue>
                    </TooltipRow>
                    <TooltipRow>
                      <TooltipLabel>地点:</TooltipLabel>
                      <TooltipValue>{course.location}</TooltipValue>
                    </TooltipRow>
                    <TooltipRow>
                      <TooltipLabel>教师:</TooltipLabel>
                      <TooltipValue>{course.teacher || '未设置'}</TooltipValue>
                    </TooltipRow>
                    <TooltipRow>
                      <TooltipLabel>节次:</TooltipLabel>
                      <TooltipValue>{course.startSession}-{course.endSession}</TooltipValue>
                    </TooltipRow>
                    <TooltipRow>
                      <TooltipLabel>时间:</TooltipLabel>
                      <TooltipValue>{startTime} - {endTime}</TooltipValue>
                    </TooltipRow>
                  </>
                );
              } catch (error) {
                console.error('Error rendering tooltip:', error);
                return null;
              }
            })()}
            <TooltipArrow />
          </TooltipContent>
        </TooltipContainer>
      )}
      
      {/* 课程点击后显示的信息 */}
      {isMobileView && clickedCourse && (
        <CoursePressTooltip>
          <CloseButton onClick={handleCloseTooltip} />
          <CourseTooltipHeader>{cleanCourseName(clickedCourse.course.name)}</CourseTooltipHeader>
          <CourseTooltipRow>
            <CourseTooltipLabel>时间:</CourseTooltipLabel>
            <CourseTooltipValue>{getCourseTimeRange(clickedCourse.course)}</CourseTooltipValue>
          </CourseTooltipRow>
          <CourseTooltipRow>
            <CourseTooltipLabel>地点:</CourseTooltipLabel>
            <CourseTooltipValue>{clickedCourse.course.location}</CourseTooltipValue>
          </CourseTooltipRow>
          <CourseTooltipRow>
            <CourseTooltipLabel>教师:</CourseTooltipLabel>
            <CourseTooltipValue>{clickedCourse.course.teacher || '未设置'}</CourseTooltipValue>
          </CourseTooltipRow>
        </CoursePressTooltip>
      )}
      
      {/* 根据屏幕大小渲染不同的表格 */}
      {isMobileView ? renderMobileTable() : renderDesktopTable()}
    </TableContainerWithAnimation>
  );
};

export default ScheduleTable; 