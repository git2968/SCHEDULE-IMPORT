import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { Course } from '../types';
import { useSchedule } from '../hooks/useSchedule';
import { useSettings } from '../hooks/useSettings';
import { exportScheduleToExcel } from '../utils/exportSchedule';
import { getDateForWeekDay } from '../utils/dateUtils';
import AnimatedList from './animations/AnimatedList';

// 媒体查询断点
const MOBILE_BREAKPOINT = '768px';

const TableContainer = styled.div`
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  
  @media (max-width: ${MOBILE_BREAKPOINT}) {
    padding: 0.8rem;
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.65);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  }
`;

// 调整移动端表格布局
const Table = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 8px;
  table-layout: fixed;
  
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
  border-radius: 16px;
  background: ${props => props.isCurrentDay ? 'linear-gradient(135deg, rgba(10, 132, 255, 0.15), rgba(64, 210, 255, 0.1))' : 'rgba(255, 255, 255, 0.7)'};
  box-shadow: ${props => props.isCurrentDay ? '0 2px 8px rgba(10, 132, 255, 0.1)' : '0 1px 4px rgba(0, 0, 0, 0.03)'};
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  border: 1px solid ${props => props.isCurrentDay ? 'rgba(10, 132, 255, 0.2)' : 'rgba(255, 255, 255, 0.3)'};
  
  /* Make time column header match the width of time cells */
  ${props => props.isTimeColumn && `
    width: 70px !important;
    min-width: 70px !important;
    max-width: 70px !important;
    padding: 0.5rem 0.3rem !important;
    font-size: 0.9rem;
    text-align: center !important;
    box-sizing: border-box !important;
    font-weight: 700;
  `}
  
  &:hover {
    background: ${props => props.isCurrentDay ? 'linear-gradient(135deg, rgba(10, 132, 255, 0.2), rgba(64, 210, 255, 0.15))' : 'rgba(255, 255, 255, 0.85)'};
    transform: ${props => props.isTimeColumn ? 'translateX(2px)' : 'translateY(-1px)'};
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
      background: #0A84FF;
      border-radius: 50%;
      box-shadow: 0 0 4px rgba(10, 132, 255, 0.4);
    }
  `}
  
  @media (max-width: ${MOBILE_BREAKPOINT}) {
    font-size: 0.95rem;
    padding: 0.7rem 0.5rem;
    
    ${props => props.isTimeColumn && `
      width: 85px !important;  /* 移动端表头匹配 TimeCell 宽度 */
      min-width: 85px !important;
      max-width: 85px !important;
      padding: 0.7rem 0.6rem !important;  /* 匹配 TimeCell 内边距 */
      font-size: 0.8rem;
      text-align: center !important;
      box-sizing: border-box !important;
    `}
  }
`;

const WeekdayText = styled.div`
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: 0.3rem;
  letter-spacing: 0.3px;
`;

const DateText = styled.div`
  font-size: 0.8rem;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.55);
  letter-spacing: 0.2px;
  
  @media (max-width: ${MOBILE_BREAKPOINT}) {
    font-size: 0.75rem;
  }
`;

const TableBody = styled.tbody`
  @media (max-width: ${MOBILE_BREAKPOINT}) {
    display: block;
  }
`;

const TableRow = styled.tr`
  height: 80px;
  
  @media (max-width: ${MOBILE_BREAKPOINT}) {
    display: flex;
    flex-direction: column;
    margin-bottom: 10px;
    height: auto;
  }
`;

// 调整TimeCell组件，优化手机端显示
const TimeCell = styled.td`
  padding: 0.5rem 0.3rem !important;
  text-align: center !important;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.75);
  background: rgba(255, 255, 255, 0.7);
  border-radius: 16px;
  font-size: 0.95rem;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.03);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  width: 70px !important;
  min-width: 70px !important;
  max-width: 70px !important;
  height: 80px;
  display: table-cell;
  vertical-align: middle;
  box-sizing: border-box !important;
  border: 1px solid rgba(255, 255, 255, 0.5);
  position: relative;
  
  & > div {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  
  &:hover {
    background: rgba(255, 255, 255, 0.85);
    transform: translateX(2px);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
  }
  
  @media (max-width: ${MOBILE_BREAKPOINT}) {
    width: 85px !important;
    min-width: 85px !important;
    max-width: 85px !important;
    height: auto;
    min-height: 60px;
    flex-direction: row;
    justify-content: flex-start;
    padding: 0.6rem 0.6rem !important;
    border-radius: 14px;
    align-items: center;
    margin-bottom: 8px;
    box-sizing: border-box !important;
    background: rgba(255, 255, 255, 0.85);
    border: 1px solid rgba(10, 132, 255, 0.08);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  }
`;

// 调整SessionNumber组件
const SessionNumber = styled.div`
  font-weight: 700;
  font-size: 1.1rem;
  margin-bottom: 4px;
  color: rgba(10, 132, 255, 0.9);
  background: linear-gradient(135deg, rgba(10, 132, 255, 0.08), rgba(64, 210, 255, 0.05));
  padding: 2px 8px;
  border-radius: 8px;
  
  @media (max-width: ${MOBILE_BREAKPOINT}) {
    margin-bottom: 0;
    margin-right: 8px;
    min-width: 22px;
    text-align: center;
    font-size: 1.1rem;
    font-weight: 700;
    color: rgba(10, 132, 255, 0.9);
  }
`;

// 调整SessionTime组件
const SessionTime = styled.div`
  font-size: 0.75rem;
  color: rgba(0, 0, 0, 0.65);
  font-weight: 500;
  line-height: 1.3;
  white-space: nowrap;
  letter-spacing: 0.3px;
  
  @media (max-width: ${MOBILE_BREAKPOINT}) {
    font-size: 0.75rem;
    font-weight: 500;
    white-space: nowrap;
    overflow: visible;
    color: rgba(0, 0, 0, 0.65);
  }
`;

// 调整课程单元格样式
const TableCell = styled.td<{ 'data-has-content'?: boolean; isCurrentDay?: boolean }>`
  width: 145px;
  height: 80px;
  padding: 0.4rem;
  text-align: center;
  vertical-align: middle;
  border-radius: 16px;
  background: ${props => {
    if (props['data-has-content']) return 'transparent';
    if (props.isCurrentDay) return 'rgba(10, 132, 255, 0.02)';
    return 'transparent';
  }};
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => {
      if (props['data-has-content']) return 'transparent';
      if (props.isCurrentDay) return 'rgba(10, 132, 255, 0.04)';
      return 'transparent';
    }};
  }
  
  @media (max-width: ${MOBILE_BREAKPOINT}) {
    width: 100%;
    height: auto;
    min-height: 70px;
    margin-bottom: 8px;
    background: transparent;
    border-radius: 16px;
  }
`;

// 优化课程项目样式 - 确保对齐
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
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: default;
  position: relative;
  min-height: 60px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }
  
  &:active {
    transform: translateY(-1px);
  }
  
  @media (max-width: ${MOBILE_BREAKPOINT}) {
    border-radius: 14px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
    padding: 0.8rem 0.6rem;
    min-height: 60px;
    border: 1px solid rgba(255, 255, 255, 0.4);
  }
`;

// 新增移动端特定组件
const MobileWeekSelector = styled.div`
  display: none;
  
  @media (max-width: ${MOBILE_BREAKPOINT}) {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    margin-bottom: 12px;
    padding: 10px 12px;
    background: rgba(255, 255, 255, 0.7);
    border-radius: 14px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    flex-wrap: wrap;
    gap: 8px;
  }
`;

const MobileWeekButton = styled.button`
  background: rgba(10, 132, 255, 0.08);
  border: 1px solid rgba(10, 132, 255, 0.15);
  border-radius: 10px;
  padding: 7px 14px;
  font-size: 0.85rem;
  font-weight: 600;
  color: rgba(10, 132, 255, 0.9);
  cursor: pointer;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(10, 132, 255, 0.12);
    transform: translateY(-1px);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: none;
  }
`;

const MobileWeekDisplay = styled.div`
  font-size: 0.95rem;
  font-weight: 700;
  color: rgba(0, 0, 0, 0.85);
  padding: 0 8px;
`;

const MobileDaySelector = styled.div`
  display: none;
  
  @media (max-width: ${MOBILE_BREAKPOINT}) {
    display: flex;
    overflow-x: auto;
    scrollbar-width: none;
    margin-bottom: 12px;
    padding: 4px;
    gap: 8px;
    background: rgba(255, 255, 255, 0.4);
    border-radius: 14px;
    
    &::-webkit-scrollbar {
      display: none;
    }
  }
`;

// 调整移动端表格的总体布局
const MobileDayButton = styled.button<{ isActive?: boolean }>`
  background: ${props => props.isActive 
    ? 'linear-gradient(135deg, #0A84FF, #64D2FF)' 
    : 'rgba(255, 255, 255, 0.8)'};
  border: ${props => props.isActive ? 'none' : '1px solid rgba(0, 0, 0, 0.08)'};
  border-radius: 12px;
  padding: 10px 14px;
  font-size: 0.85rem;
  font-weight: ${props => props.isActive ? '600' : '500'};
  color: ${props => props.isActive ? '#fff' : 'rgba(0, 0, 0, 0.7)'};
  white-space: nowrap;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 65px;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: ${props => props.isActive 
    ? '0 4px 12px rgba(10, 132, 255, 0.25)' 
    : '0 1px 3px rgba(0, 0, 0, 0.04)'};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.isActive 
      ? '0 6px 16px rgba(10, 132, 255, 0.3)' 
      : '0 2px 6px rgba(0, 0, 0, 0.08)'};
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const MobileDayText = styled.div`
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 2px;
`;

const MobileDateText = styled.div`
  font-size: 0.75rem;
  font-weight: 500;
  opacity: 0.85;
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

const modalFadeIn = keyframes`
  from {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
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
  background: rgba(255, 255, 255, 0.85);
  color: rgba(10, 132, 255, 0.9);
  font-size: 0.8rem;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 10px;
  margin-bottom: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  
  @media (max-width: ${MOBILE_BREAKPOINT}) {
    font-size: 0.85rem;
    padding: 4px 10px;
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
  background: rgba(255, 255, 255, 0.5);
  padding: 1rem;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
`;

const WeekNavigationControls = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 0.75rem;
  gap: 1.2rem;
`;

const WeekProgress = styled.div`
  width: 90%;
  max-width: 500px;
  height: 6px;
  background: rgba(10, 132, 255, 0.1);
  border-radius: 3px;
  margin-top: 0.5rem;
  overflow: hidden;
  position: relative;
  border: 1px solid rgba(10, 132, 255, 0.1);
`;

const WeekProgressFill = styled.div<{ percent: number }>`
  height: 100%;
  width: ${props => props.percent}%;
  background: linear-gradient(90deg, #0A84FF, #64D2FF);
  border-radius: 3px;
  transition: width 0.3s ease;
  box-shadow: 0 0 8px rgba(10, 132, 255, 0.3);
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
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(10, 132, 255, 0.15);
  border-radius: 50%;
  width: 42px;
  height: 42px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 1.1rem;
  font-weight: 700;
  color: rgba(10, 132, 255, 0.9);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
  
  &:hover {
    background: linear-gradient(135deg, rgba(10, 132, 255, 0.1), rgba(64, 210, 255, 0.08));
    transform: translateY(-2px);
    box-shadow: 0 4px 10px rgba(10, 132, 255, 0.15);
    border-color: rgba(10, 132, 255, 0.25);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
    background: rgba(255, 255, 255, 0.5);
  }
`;

const WeekDisplay = styled.div`
  font-size: 1.15rem;
  font-weight: 700;
  color: rgba(0, 0, 0, 0.85);
  min-width: 130px;
  text-align: center;
  padding: 0.7rem 1.5rem;
  background: linear-gradient(135deg, rgba(10, 132, 255, 0.08), rgba(64, 210, 255, 0.05));
  border-radius: 14px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(10, 132, 255, 0.15);
`;

const ExportButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(10, 132, 255, 0.1), rgba(64, 210, 255, 0.08));
  border: 1px solid rgba(10, 132, 255, 0.2);
  border-radius: 12px;
  padding: 0.65rem 1.3rem;
  margin-left: 16px;
  font-size: 0.9rem;
  font-weight: 600;
  color: rgba(10, 132, 255, 0.9);
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 6px rgba(10, 132, 255, 0.1);
  
  &:hover {
    background: linear-gradient(135deg, rgba(10, 132, 255, 0.15), rgba(64, 210, 255, 0.12));
    transform: translateY(-2px);
    box-shadow: 0 4px 10px rgba(10, 132, 255, 0.2);
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

// Helper function to extract course code (currently unused, kept for future use)
// const extractCourseCode = (name: string): string => {
//   const match = name.match(/\[(\d+)\]/);
//   return match ? match[1] : '无';
// };

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
  background: linear-gradient(135deg, rgba(10, 132, 255, 0.1), rgba(64, 210, 255, 0.08));
  border: 1px solid rgba(10, 132, 255, 0.2);
  border-radius: 10px;
  padding: 7px 14px;
  font-size: 0.85rem;
  font-weight: 600;
  color: rgba(10, 132, 255, 0.9);
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(10, 132, 255, 0.1);
  display: none;
  align-items: center;
  justify-content: center;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  
  @media (max-width: ${MOBILE_BREAKPOINT}) {
    display: flex;
    margin-left: auto;
    margin-right: 0;
    z-index: 10;
  }
  
  &:hover {
    background: linear-gradient(135deg, rgba(10, 132, 255, 0.15), rgba(64, 210, 255, 0.12));
    transform: translateY(-2px);
    box-shadow: 0 4px 10px rgba(10, 132, 255, 0.15);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &::before {
    content: "";
    width: 14px;
    height: 14px;
    background-image: ${props => props.theme === 'week' 
      ? 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'%230A84FF\'%3E%3Cpath d=\'M3 4h18v2H3V4zm0 7h18v2H3v-2zm0 7h18v2H3v-2z\'/%3E%3C/svg%3E")' 
      : 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'%230A84FF\'%3E%3Cpath d=\'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z\'/%3E%3C/svg%3E")'};
    background-size: contain;
    background-repeat: no-repeat;
    margin-right: 6px;
  }
`;

// 背景遮罩
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  z-index: 1090;
  animation: ${fadeIn} 0.2s ease-out;
`;

// 极简现代化的课程详情弹窗
const CoursePressTooltip = styled.div`
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 88%;
  max-width: 380px;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(25px);
  -webkit-backdrop-filter: blur(25px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 20px;
  padding: 0;
  box-shadow: 
    0 25px 50px rgba(0, 0, 0, 0.12),
    0 0 0 1px rgba(255, 255, 255, 0.05) inset,
    0 8px 16px rgba(0, 0, 0, 0.06);
  z-index: 1100;
  animation: ${modalFadeIn} 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  text-align: left;
  overflow: hidden;
  
  /* 确保在键盘弹出时不被遮挡 */
  @media (max-height: 600px) {
    top: 45%;
    max-height: 350px;
    overflow-y: auto;
  }
`;

const CourseTooltipHeader = styled.div`
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(248, 250, 252, 0.8));
  padding: 24px 24px 20px;
  border-radius: 24px 24px 0 0;
  margin: 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  
  font-size: 1.3rem;
  font-weight: 700;
  color: rgba(0, 0, 0, 0.85);
  line-height: 1.3;
  text-align: center;
  
  /* 添加课程图标 */
  position: relative;
  &:before {
    content: '📚';
    font-size: 1.5rem;
    margin-right: 8px;
  }
`;

const CourseTooltipRow = styled.div`
  display: flex;
  align-items: center;
  padding: 16px 24px;
  transition: background-color 0.2s ease;
  
  &:hover {
    background: rgba(0, 0, 0, 0.01);
  }
  
  &:last-child {
    padding-bottom: 24px;
  }
  
  &:not(:last-child) {
    border-bottom: 1px solid rgba(0, 0, 0, 0.04);
  }
`;

const CourseTooltipLabel = styled.div`
  font-weight: 600;
  font-size: 0.9rem;
  width: 90px;
  color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  white-space: nowrap;
  letter-spacing: 0.5px;
`;

const CourseTooltipValue = styled.div`
  font-weight: 500;
  font-size: 1rem;
  color: rgba(0, 0, 0, 0.8);
  flex: 1;
  line-height: 1.4;
  
  /* 特殊样式处理 */
  &.time-value {
    color: rgba(0, 0, 0, 0.85);
    font-weight: 600;
    font-family: 'SF Mono', 'Monaco', 'Cascadia Code', monospace;
  }
  
  &.location-value {
    color: rgba(0, 0, 0, 0.8);
    font-weight: 500;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 12px;
  right: 16px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.05);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.4);
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 10;
  
  &:hover {
    background: rgba(0, 0, 0, 0.08);
    color: rgba(0, 0, 0, 0.6);
    transform: scale(1.1);
  }
  
  &:active {
    transform: scale(0.9);
  }
  
  &::before {
    content: "✕";
    font-weight: 400;
    line-height: 1;
  }
`;

const ScheduleTable: React.FC<ScheduleTableProps> = (props) => {
  const scheduleContext = useSchedule();
  const { settings, getCurrentWeek } = useSettings();
  // 使用props或从context中获取数据
  const contextSchedule = scheduleContext.currentSchedule;
  // 优先使用设置中的当前周数，但避免在初始化时调用函数
  const [currentWeek, setCurrentWeek] = useState(() => {
    if (props.currentWeek) {
      return props.currentWeek;
    }
    // 只在初始化时调用一次getCurrentWeek
    return getCurrentWeek();
  });
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

  // 同步设置中的当前周数
  useEffect(() => {
    if (!props.currentWeek) { // 只有在没有传入props的情况下才使用设置
      const settingsWeek = getCurrentWeek();
      if (settingsWeek !== currentWeek) {
        setCurrentWeek(settingsWeek);
      }
    }
  }, [settings?.currentWeek, settings?.semesterStartDate, settings?.autoUpdateWeek, props.currentWeek]); // 直接依赖设置值，避免函数引用问题
  
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
  
  // 获取指定星期几的日期字符串
  const getDateString = (dayOfWeek: number): string => {
    if (!settings?.semesterStartDate) return '';
    return getDateForWeekDay(settings.semesterStartDate, currentWeek, dayOfWeek);
  };
  
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
    if (isMobileView) {
      setClickedCourse({ course, session });
    }
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
                  <WeekdayText>{day}</WeekdayText>
                  <DateText>{getDateString(index + 1)}</DateText>
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
                    <div>
                      <SessionNumber>{session}</SessionNumber>
                      <SessionTime>
                        {sessionTimes[session - 1]?.start}-{sessionTimes[session - 1]?.end}
                      </SessionTime>
                    </div>
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
                            {/* 为所有课程显示节数，不仅仅是移动端 */}
                            <CourseSessionBadge>
                              {course.startSession === course.endSession 
                                ? `第${course.startSession}节` 
                                : `第${course.startSession}-${course.endSession}节`}
                            </CourseSessionBadge>
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
                <MobileDayText>{day}</MobileDayText>
                <MobileDateText>{getDateString(index + 1)}</MobileDateText>
              </MobileDayButton>
            ))}
          </MobileDaySelector>
          
          <ScrollContainer>
            <Table>
              <TableHeader>
                <tr>
                  <TableHeaderCell 
                    isTimeColumn={true} 
                    style={{ 
                      width: '85px', 
                      minWidth: '85px',
                      padding: '1rem 0.6rem',
                      fontSize: '0.9rem',
                      fontWeight: '500',
                      borderRadius: '16px' // 统一使用移动端16px圆角
                    }}
                  >
                    时间
                  </TableHeaderCell>
                  <TableHeaderCell 
                    isCurrentDay={selectedDay === currentDay}
                    style={{ 
                      textAlign: 'center',
                      padding: '1rem',
                      borderRadius: '16px', // 统一使用移动端16px圆角
                      background: selectedDay === currentDay 
                        ? 'linear-gradient(135deg, rgba(10, 132, 255, 0.15), rgba(64, 210, 255, 0.1))' 
                        : 'rgba(255, 255, 255, 0.7)',
                      border: selectedDay === currentDay 
                        ? '1px solid rgba(10, 132, 255, 0.2)' 
                        : 'none'
                    }}
                  >
                    <WeekdayText style={{ 
                      fontSize: '1.1rem', 
                      marginBottom: '0.3rem',
                      fontWeight: '600',
                      color: selectedDay === currentDay ? 'rgba(10, 132, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)'
                    }}>
                      {weekdays[selectedDay]}
                    </WeekdayText>
                    <DateText style={{ 
                      fontSize: '0.85rem',
                      color: selectedDay === currentDay ? 'rgba(10, 132, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
                      fontWeight: '500'
                    }}>
                      {getDateString(selectedDay)}
                    </DateText>
                  </TableHeaderCell>
                </tr>
              </TableHeader>
              <AnimatedList>
                <TableBody>
                  {sessionSlots.map(session => {
                    const course = getCourseForSessionAndDay(session, selectedDay);
                    const shouldRender = selectedDay === 0 || shouldRenderCourseCell(session, selectedDay);
                    
                    if (!shouldRender) return null;
                    
                    return (
                      <TableRow key={session}>
                        <TimeCell>
                          <div>
                            <SessionNumber>{session}</SessionNumber>
                            <SessionTime>
                              {sessionTimes[session - 1]?.start}-{sessionTimes[session - 1]?.end}
                            </SessionTime>
                          </div>
                        </TimeCell>
                        
                        {selectedDay > 0 && (
                          <TableCell 
                            data-has-content={!!course}
                            isCurrentDay={selectedDay === currentDay}
                          >
                            {course && (
                              <CourseItem 
                                background={getCourseColor(course.courseId)}
                                onMouseEnter={(e) => !isMobileView && handleCourseMouseEnter(e, getCourseInstanceId(course, selectedDay, session))}
                                onMouseLeave={() => !isMobileView && setActiveTooltip(null)}
                                onClick={() => handleCourseClick(course, session)}
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
              </AnimatedList>
            </Table>
          </ScrollContainer>
        </>
      ) : (
        // 周视图 - 显示整周的课表
        <ScrollContainer style={{ overflowX: 'auto', width: '100%' }}>
          <Table style={{ width: '100%', tableLayout: 'fixed', minWidth: '600px' }}>
            <TableHeader>
              <tr>
                <TableHeaderCell 
                  isTimeColumn={true} 
                  style={{ 
                    width: '80px', 
                    minWidth: '80px',
                    padding: '0.6rem 0.3rem',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    borderRadius: '16px'
                  }}
                >
                  节次
                </TableHeaderCell>
                {weekdays.slice(1).map((day, index) => (
                  <TableHeaderCell 
                    key={index}
                    isCurrentDay={index + 1 === currentDay}
                    style={{ 
                      padding: '0.5rem 0.2rem', 
                      fontSize: '0.8rem', 
                      width: '75px',
                      minWidth: '75px',
                      borderRadius: '16px',
                      background: index + 1 === currentDay 
                        ? 'linear-gradient(135deg, rgba(10, 132, 255, 0.15), rgba(64, 210, 255, 0.1))' 
                        : 'rgba(255, 255, 255, 0.7)',
                      border: index + 1 === currentDay 
                        ? '1px solid rgba(10, 132, 255, 0.2)' 
                        : 'none'
                    }}
                  >
                    <WeekdayText style={{ 
                      fontSize: '0.8rem', 
                      marginBottom: '0.1rem',
                      fontWeight: '600',
                      color: index + 1 === currentDay ? 'rgba(10, 132, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)'
                    }}>
                      {day}
                    </WeekdayText>
                    <DateText style={{ 
                      fontSize: '0.7rem',
                      fontWeight: '500',
                      color: index + 1 === currentDay ? 'rgba(10, 132, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)'
                    }}>
                      {getDateString(index + 1)}
                    </DateText>
                  </TableHeaderCell>
                ))}
              </tr>
            </TableHeader>
            
            <TableBody>
              {sessionSlots.map(session => (
                <TableRow key={session} style={{ display: 'table-row', height: 'auto', minHeight: '70px' }}>
                  <TimeCell style={{ 
                    width: '50px !important',  /* 强制宽度 */
                    minWidth: '50px',
                    maxWidth: '50px',
                    height: '60px',
                    padding: '0.25rem 0.05rem !important',  /* 强制内边距 */
                    fontSize: '0.8rem',
                    borderRadius: '16px',
                    background: 'rgba(255, 255, 255, 0.6)',
                    boxSizing: 'border-box',
                    textAlign: 'center'
                  }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <SessionNumber style={{ 
                        fontSize: '0.9rem',  /* 进一步缩小字体 */
                        marginBottom: '4px',
                        fontWeight: '700',
                        color: 'rgba(10, 132, 255, 0.8)'
                      }}>
                        {session}
                      </SessionNumber>
                      <SessionTime style={{ 
                        fontSize: '0.7rem',  /* 缩小时间字体 */
                        fontWeight: '500',
                        color: 'rgba(0, 0, 0, 0.6)',
                        textAlign: 'center'
                      }}>
                        {sessionTimes[session - 1]?.start}-{sessionTimes[session - 1]?.end}
                      </SessionTime>
                    </div>
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
                          width: '75px',
                          minWidth: '75px',
                          height: '70px',  /* 保持固定高度 */
                          padding: '3px',  /* 保持固定内边距 */
                          marginBottom: '0',
                          background: 'transparent',  /* 透明背景 */
                          boxSizing: 'border-box',
                          border: 'none',  /* 移除边框 */
                          borderRadius: '16px',
                          verticalAlign: 'top'
                        }}
                        rowSpan={course && course.startSession !== course.endSession ? 
                                 course.endSession - course.startSession + 1 : 1}  /* 恢复正确的rowSpan逻辑 */
                      >
                        {course && (
                          <CourseItem 
                            background={getCourseColor(course.courseId)}
                            style={{ 
                              padding: '4px 3px', 
                              height: course.startSession !== course.endSession ? 
                                     `${70 * (course.endSession - course.startSession + 1) + 6 * (course.endSession - course.startSession)}px` : 
                                     '70px',  /* 单节课也使用70px高度，和其他行保持一致 */
                              borderRadius: '12px',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'center',
                              alignItems: 'center',
                              position: 'relative',
                              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)'
                            }}
                            onMouseEnter={(e) => !isMobileView && handleCourseMouseEnter(e, getCourseInstanceId(course, day, session))}
                            onMouseLeave={() => !isMobileView && setActiveTooltip(null)}
                            onClick={() => handleCourseClick(course, session)}
                          >
                            {/* 为所有课程显示节数标识 */}
                            <div style={{
                              position: 'absolute',
                              top: '4px',
                              right: '4px',
                              fontSize: '0.6rem',
                              fontWeight: '600',
                              background: 'rgba(255, 255, 255, 0.9)',
                              color: 'rgba(0, 0, 0, 0.7)',
                              padding: '2px 5px',
                              borderRadius: '8px'
                            }}>
                              {course.startSession === course.endSession 
                                ? `${course.startSession}节` 
                                : `${course.startSession}-${course.endSession}节`}
                            </div>
                            <CourseName style={{ 
                              fontSize: '0.65rem', 
                              fontWeight: '700',
                              marginBottom: '1px',
                              color: 'rgba(255, 255, 255, 0.95)',
                              textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                              textAlign: 'center',
                              lineHeight: '1.1',
                              overflow: 'hidden',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              wordBreak: 'break-all'
                            }}>
                              {cleanCourseName(course.name).length > 6 
                                ? cleanCourseName(course.name).substring(0, 5) + '..' 
                                : cleanCourseName(course.name)}
                            </CourseName>
                            {course.location && (
                              <CourseLocation style={{
                                fontSize: '0.55rem',
                                color: 'rgba(255, 255, 255, 0.8)',
                                textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                                textAlign: 'center',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                maxWidth: '100%'
                              }}>
                                {course.location.length > 6 ? course.location.substring(0, 5) + '..' : course.location}
                              </CourseLocation>
                            )}
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
        <>
          {/* 背景遮罩 */}
          <ModalOverlay onClick={handleCloseTooltip} />
          
          <CoursePressTooltip>
            <CloseButton onClick={handleCloseTooltip} />
            <CourseTooltipHeader>{cleanCourseName(clickedCourse.course.name)}</CourseTooltipHeader>
            <CourseTooltipRow>
              <CourseTooltipLabel>⏰ 时间</CourseTooltipLabel>
              <CourseTooltipValue className="time-value">{getCourseTimeRange(clickedCourse.course)}</CourseTooltipValue>
            </CourseTooltipRow>
            <CourseTooltipRow>
              <CourseTooltipLabel>📍 地点</CourseTooltipLabel>
              <CourseTooltipValue className="location-value">{clickedCourse.course.location}</CourseTooltipValue>
            </CourseTooltipRow>
            <CourseTooltipRow>
              <CourseTooltipLabel>👨‍🏫 教师</CourseTooltipLabel>
              <CourseTooltipValue>{clickedCourse.course.teacher || '未设置'}</CourseTooltipValue>
            </CourseTooltipRow>
          </CoursePressTooltip>
        </>
      )}
      
      {/* 根据屏幕大小渲染不同的表格 */}
      {isMobileView ? renderMobileTable() : renderDesktopTable()}
    </TableContainerWithAnimation>
  );
};

export default ScheduleTable; 