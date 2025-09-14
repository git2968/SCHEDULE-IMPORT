import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { Course } from '../types';
import { useSchedule } from '../hooks/useSchedule';
import { exportScheduleToExcel } from '../utils/exportSchedule';

const TableContainer = styled.div`
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 1.5rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
`;

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
`;

const Table = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 6px;
`;

const TableHeader = styled.thead`
  background: transparent;
`;

const TableHeaderCell = styled.th<{ isCurrentDay?: boolean }>`
  padding: 0.85rem 1rem;
  text-align: center;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.75);
  font-size: 1rem;
  border-radius: 12px;
  background: ${props => props.isCurrentDay ? 'rgba(10, 132, 255, 0.2)' : 'rgba(255, 255, 255, 0.6)'};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  transition: all 0.2s ease;
  position: relative;
  
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
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr``;

const TableCell = styled.td<{ 'data-has-content'?: boolean; isCurrentDay?: boolean }>`
  width: 120px; /* Slightly wider to allow more space for course content */
  height: 90px;
  padding: 0.5rem;
  text-align: center;
  vertical-align: middle;
  border-radius: 12px;
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
`;

const TimeCell = styled.td`
  padding: 0.6rem 0.4rem;
  text-align: center;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.75);
  background: rgba(255, 255, 255, 0.5);
  border-radius: 12px;
  font-size: 0.95rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  transition: all 0.2s ease;
  width: 50px; /* Set a narrower fixed width */
  min-width: 50px;
  max-width: 50px;
  
  &:hover {
    background: rgba(255, 255, 255, 0.6);
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
`;

const CourseTooltip = styled.div<{ visible: boolean }>`
  position: absolute;
  bottom: -80px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  padding: 8px 12px;
  z-index: 100;
  min-width: 180px;
  pointer-events: none;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s, visibility 0.2s;
  animation: ${fadeInTooltip} 0.2s ease-out;
  
  ${props => props.visible && css`
    opacity: 1;
    visibility: visible;
  `}
  
  &:after {
    content: '';
    position: absolute;
    top: -6px;
    left: 50%;
    transform: translateX(-50%);
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-bottom: 6px solid rgba(255, 255, 255, 0.95);
  }
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

const CourseName = styled.div`
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 0.4rem;
  color: rgba(0, 0, 0, 0.85);
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

const TableContainerWithAnimation = styled(TableContainer)`
  animation: ${fadeIn} 0.4s ease-out;
  position: relative; /* Added to establish positioning context for tooltips */
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

const ScheduleTable: React.FC<ScheduleTableProps> = (props) => {
  const scheduleContext = useSchedule();
  // 使用props或从context中获取数据
  const contextSchedule = scheduleContext.currentSchedule;
  const [currentWeek, setCurrentWeek] = useState(props.currentWeek || 1);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [isExporting, setIsExporting] = useState(false);
  
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

  return (
    <TableContainerWithAnimation className="schedule-container">
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
      
      {/* Global tooltip that's positioned absolutely within the container */}
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
      
      <ScrollContainer>
        <Table>
          <TableHeader>
            <tr>
              <TableHeaderCell>节</TableHeaderCell>
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
                  <TimeCell>{session}</TimeCell>
                  
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
    </TableContainerWithAnimation>
  );
};

export default ScheduleTable; 