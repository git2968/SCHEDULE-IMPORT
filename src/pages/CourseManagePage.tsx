import React, { useState } from 'react';
import styled from 'styled-components';
import { useSchedule } from '../hooks/useSchedule';
import { Course } from '../types';
import GlassCard from '../components/GlassCard';
import CourseEditor from '../components/CourseEditor';
import AnimatedPageTitle from '../components/AnimatedPageTitle';

const PageContainer = styled.div`
  padding: 1.5rem 0;
  max-width: 95%;
  margin: 0 auto;
`;

const PageTitle = styled.h1`
  margin-bottom: 1.5rem;
  text-align: center;
  font-size: 2rem;
  font-weight: 700;
  background: linear-gradient(90deg, #0A84FF, #64D2FF);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  letter-spacing: 2px;
`;

const ContentCard = styled(GlassCard)`
  width: 100%;
  margin: 0 auto;
  padding: 1.5rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
`;

const AddButton = styled.button`
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.25rem;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #007aff;
    transform: translateY(-2px);
  }
`;

const CourseGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const CourseCard = styled.div`
  background: rgba(255, 255, 255, 0.5);
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  transition: all 0.2s;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }
`;

const CourseName = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: rgba(0, 0, 0, 0.8);
`;

const CourseInfo = styled.div`
  font-size: 0.9rem;
  color: rgba(0, 0, 0, 0.6);
  margin-bottom: 0.25rem;
  display: flex;
  align-items: center;
  
  &:before {
    content: '';
    display: inline-block;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: var(--primary-color);
    margin-right: 0.5rem;
  }
`;

const WeeksList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-top: 0.75rem;
`;

const WeekTag = styled.span`
  background: rgba(10, 132, 255, 0.1);
  color: var(--primary-color);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 2rem;
  color: rgba(0, 0, 0, 0.5);
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  overflow-y: auto;
`;

// 星期几的标题
const weekdays = ['', '周一', '周二', '周三', '周四', '周五', '周六', '周日'];

// 格式化周数显示
const formatWeeks = (weeks: number[]): string => {
  if (weeks.length === 0) return '无';
  
  // 对连续的周数进行分组
  const ranges: { start: number, end: number }[] = [];
  let currentRange: { start: number, end: number } | null = null;
  
  weeks.forEach(week => {
    if (!currentRange) {
      currentRange = { start: week, end: week };
    } else if (week === currentRange.end + 1) {
      currentRange.end = week;
    } else {
      ranges.push(currentRange);
      currentRange = { start: week, end: week };
    }
  });
  
  if (currentRange) {
    ranges.push(currentRange);
  }
  
  // 格式化输出
  return ranges.map(range => {
    if (range.start === range.end) {
      return `${range.start}`;
    } else {
      return `${range.start}-${range.end}`;
    }
  }).join(',');
};

const CourseManagePage: React.FC = () => {
  const { currentSchedule } = useSchedule();
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isAddingCourse, setIsAddingCourse] = useState(false);
  
  const handleAddCourse = () => {
    setIsAddingCourse(true);
  };
  
  const handleEditCourse = (course: Course) => {
    setSelectedCourse(course);
  };
  
  const handleCloseModal = () => {
    setSelectedCourse(null);
    setIsAddingCourse(false);
  };
  
  return (
    <PageContainer>
      <AnimatedPageTitle title="课程管理" />
      
      <ContentCard>
        <Header>
          <h2>所有课程</h2>
          <AddButton onClick={handleAddCourse}>添加课程</AddButton>
        </Header>
        
        {currentSchedule && currentSchedule.courses.length > 0 ? (
          <CourseGrid>
            {currentSchedule.courses.map(course => (
              <CourseCard key={course.id} onClick={() => handleEditCourse(course)}>
                <CourseName>{course.name}</CourseName>
                <CourseInfo>{weekdays[course.day]} 第{course.startSession}-{course.endSession}节</CourseInfo>
                <CourseInfo>{course.location || '无地点信息'}</CourseInfo>
                <WeeksList>
                  {course.weeks.map(week => (
                    <WeekTag key={week}>第{week}周</WeekTag>
                  ))}
                </WeeksList>
              </CourseCard>
            ))}
          </CourseGrid>
        ) : (
          <EmptyState>
            <p>还没有添加任何课程</p>
            <p>点击"添加课程"按钮开始创建</p>
          </EmptyState>
        )}
      </ContentCard>
      
      {(selectedCourse || isAddingCourse) && (
        <Modal onClick={handleCloseModal}>
          <div 
            onClick={e => e.stopPropagation()}
            style={{ 
              maxHeight: '90vh',
              margin: 'auto'
            }}
          >
            {selectedCourse ? (
              <CourseEditor course={selectedCourse} onClose={handleCloseModal} />
            ) : (
              <CourseEditor onClose={handleCloseModal} isNew={true} />
            )}
          </div>
        </Modal>
      )}
    </PageContainer>
  );
};

export default CourseManagePage; 