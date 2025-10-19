import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useSchedule } from '../hooks/useSchedule';
import { Course, Schedule } from '../types';
import GlassCard from '../components/GlassCard';
import CourseEditor from '../components/CourseEditor';
import AnimatedPageTitle from '../components/AnimatedPageTitle';
import AnimatedList from '../components/animations/AnimatedList';
import GlassButton from '../components/GlassButton';
import Icon from '../components/Icon';
import ConfirmDialog from '../components/ConfirmDialog';
import CustomSelect from '../components/CustomSelect';

const PageContainer = styled.div`
  padding: 1rem 0;
  max-width: 95%;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    padding: 0.5rem 0;
    max-width: 100%;
  }
`;

const ContentCard = styled(GlassCard)`
  width: 100%;
  margin: 0 auto;
  padding: 2rem;
  
  @media (max-width: 768px) {
    padding: 0.8rem;
    border-radius: 12px;
  }
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, rgba(10, 132, 255, 0.03), rgba(64, 210, 255, 0.02));
  border-radius: 16px;
  border: 1.5px solid rgba(10, 132, 255, 0.08);
  box-shadow: 0 2px 8px rgba(10, 132, 255, 0.04);
`;

const HeaderTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  h2 {
    font-size: 1.5rem;
    font-weight: 700;
    background: linear-gradient(135deg, #0A84FF, #64D2FF);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    margin: 0;
  }
`;

const ScheduleSelector = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
`;

const SelectorLabel = styled.label`
  font-size: 1rem;
  font-weight: 600;
  color: rgba(10, 132, 255, 0.9);
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const EmptySchedulePrompt = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  background: linear-gradient(135deg, rgba(10, 132, 255, 0.02), rgba(64, 210, 255, 0.01));
  border-radius: 16px;
  border: 2px dashed rgba(10, 132, 255, 0.15);
  
  .icon {
    font-size: 5rem;
    margin-bottom: 1.5rem;
    filter: drop-shadow(0 4px 8px rgba(10, 132, 255, 0.1));
    animation: float 3s ease-in-out infinite;
  }
  
  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
  
  h3 {
    font-size: 1.5rem;
    font-weight: 700;
    background: linear-gradient(135deg, #0A84FF, #64D2FF);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 1rem;
  }
  
  p {
    font-size: 1.05rem;
    color: rgba(0, 0, 0, 0.65);
    line-height: 1.6;
    margin-bottom: 2rem;
  }
`;

const CourseGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 1.5rem;
  align-items: stretch;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.2rem;
  }
`;

const CourseCard = styled.div`
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.85));
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 18px;
  padding: 1.5rem;
  box-shadow: 
    0 8px 32px rgba(10, 132, 255, 0.06),
    0 2px 8px rgba(0, 0, 0, 0.04),
    inset 0 0 0 1px rgba(255, 255, 255, 0.8);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  border: 1.5px solid rgba(10, 132, 255, 0.08);
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #0A84FF, #64D2FF, #0A84FF);
    background-size: 200% 100%;
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  &:hover {
    transform: translateY(-5px) scale(1.02);
    box-shadow: 
      0 12px 48px rgba(10, 132, 255, 0.12),
      0 4px 16px rgba(0, 0, 0, 0.08),
      inset 0 0 0 1.5px rgba(10, 132, 255, 0.15);
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(250, 252, 255, 0.95));
    border-color: rgba(10, 132, 255, 0.2);
    
    &::before {
      opacity: 1;
      animation: shimmer 2s infinite linear;
    }
  }
  
  &:active {
    transform: translateY(-3px) scale(1.01);
  }
  
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
`;

const DeleteIconButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(255, 69, 58, 0.08);
  backdrop-filter: blur(10px);
  border: 1.5px solid rgba(255, 69, 58, 0.15);
  color: #FF453A;
  width: 36px;
  height: 36px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 1rem;
  padding: 0;
  opacity: 0.6;
  
  &:hover {
    background: linear-gradient(135deg, rgba(255, 69, 58, 0.15), rgba(255, 140, 130, 0.12));
    border-color: rgba(255, 69, 58, 0.3);
    transform: scale(1.1) rotate(5deg);
    opacity: 1;
    box-shadow: 0 4px 12px rgba(255, 69, 58, 0.2);
  }
  
  &:active {
    transform: scale(0.95) rotate(0deg);
  }
`;

const CourseName = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 1rem;
  margin-top: 0.5rem;
  background: linear-gradient(135deg, #0A84FF, #64D2FF);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1.4;
  padding-right: 2.5rem;
`;

const CourseInfo = styled.div`
  font-size: 0.92rem;
  color: rgba(0, 0, 0, 0.7);
  margin-bottom: 0.65rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  line-height: 1.5;
  
  i {
    color: rgba(10, 132, 255, 0.7);
    font-size: 0.95rem;
  }
`;

const WeeksList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: auto;
  padding-top: 1rem;
  border-top: 2px solid rgba(10, 132, 255, 0.08);
`;

const WeekTag = styled.span`
  background: linear-gradient(135deg, rgba(10, 132, 255, 0.12), rgba(64, 210, 255, 0.08));
  color: rgba(10, 132, 255, 1);
  padding: 0.4rem 0.75rem;
  border-radius: 10px;
  font-size: 0.8rem;
  font-weight: 600;
  border: 1.5px solid rgba(10, 132, 255, 0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 4px rgba(10, 132, 255, 0.06);
  
  &:hover {
    background: linear-gradient(135deg, rgba(10, 132, 255, 0.18), rgba(64, 210, 255, 0.12));
    border-color: rgba(10, 132, 255, 0.35);
    transform: translateY(-2px) scale(1.05);
    box-shadow: 0 4px 8px rgba(10, 132, 255, 0.15);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  background: linear-gradient(135deg, rgba(10, 132, 255, 0.02), rgba(64, 210, 255, 0.01));
  border-radius: 16px;
  border: 2px dashed rgba(10, 132, 255, 0.15);
  
  p {
    color: rgba(0, 0, 0, 0.6);
    font-size: 1.05rem;
    line-height: 1.6;
    margin: 0.5rem 0;
    
    &:first-child {
      font-weight: 600;
      color: rgba(10, 132, 255, 0.8);
      font-size: 1.2rem;
    }
  }
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

const CourseManagePage: React.FC = () => {
  const { currentSchedule, userSchedules, setCurrentSchedule, loadUserSchedules, deleteCourse } = useSchedule();
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isAddingCourse, setIsAddingCourse] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; courseId: string; courseName: string }>({
    show: false,
    courseId: '',
    courseName: ''
  });
  
  // 加载用户的所有课表
  useEffect(() => {
    loadUserSchedules();
  }, []);
  
  // 初始化选中的课表
  useEffect(() => {
    if (!selectedSchedule && currentSchedule) {
      setSelectedSchedule(currentSchedule);
    }
  }, [currentSchedule, selectedSchedule]);
  
  const handleScheduleChange = (scheduleId: string) => {
    const schedule = userSchedules.find(s => s.id === scheduleId);
    if (schedule) {
      setSelectedSchedule(schedule);
      setCurrentSchedule(schedule);
    }
  };
  
  const handleAddCourse = () => {
    setIsAddingCourse(true);
  };
  
  const handleEditCourse = (course: Course) => {
    setSelectedCourse(course);
  };
  
  const handleDeleteClick = (e: React.MouseEvent, courseId: string, courseName: string) => {
    e.stopPropagation();
    setDeleteConfirm({ show: true, courseId, courseName });
  };
  
  const handleDeleteConfirm = async () => {
    try {
      await deleteCourse(deleteConfirm.courseId);
      setDeleteConfirm({ show: false, courseId: '', courseName: '' });
    } catch (error) {
      console.error('删除课程失败:', error);
    }
  };
  
  const handleDeleteCancel = () => {
    setDeleteConfirm({ show: false, courseId: '', courseName: '' });
  };
  
  const handleCloseModal = () => {
    setSelectedCourse(null);
    setIsAddingCourse(false);
  };
  
  // 获取当前选中课表的课程
  const courses = selectedSchedule?.courses || [];
  
  return (
    <PageContainer>
      <AnimatedPageTitle title="课程管理" />
      
      <ContentCard>
        <Header>
          <HeaderTop>
            <h2>课程管理</h2>
            {selectedSchedule && (
              <GlassButton onClick={handleAddCourse}>
                <Icon name="plus" /> 添加课程
              </GlassButton>
            )}
          </HeaderTop>
          
          <ScheduleSelector>
            <SelectorLabel>
              <Icon name="calendar" />
              选择课表:
            </SelectorLabel>
            {userSchedules.length > 0 ? (
              <CustomSelect
                value={selectedSchedule?.id || ''}
                onChange={handleScheduleChange}
                options={userSchedules.map(schedule => ({
                  value: schedule.id,
                  label: `${schedule.name} (${schedule.courses?.length || 0}门课程)`
                }))}
                placeholder="请选择课表"
              />
            ) : (
              <span style={{ color: 'rgba(0,0,0,0.6)' }}>暂无课表</span>
            )}
          </ScheduleSelector>
        </Header>
        
        {!selectedSchedule || userSchedules.length === 0 ? (
          <EmptySchedulePrompt>
            <div className="icon"><Icon name="book" size="32" /></div>
            <h3>还没有课表</h3>
            <p>请先导入或创建一个课表，然后在此管理课程</p>
            <GlassButton onClick={() => window.location.href = '/#/apps/schedule'}>
              <Icon name="upload" /> 去导入课表
            </GlassButton>
          </EmptySchedulePrompt>
        ) : courses.length > 0 ? (
          <AnimatedList>
            <CourseGrid>
              {courses.map(course => (
                <CourseCard key={course.id} onClick={() => handleEditCourse(course)}>
                  <DeleteIconButton 
                    onClick={(e) => handleDeleteClick(e, course.id, course.name)}
                    title="删除课程"
                  >
                    <Icon name="trash-3" size="lg" />
                  </DeleteIconButton>
                  <CourseName>{course.name}</CourseName>
                  <CourseInfo>
                    <Icon name="calendar" />
                    {weekdays[course.day]} 第{course.startSession}-{course.endSession}节
                  </CourseInfo>
                  <CourseInfo>
                    <Icon name="map-marker-1" />
                    {course.location || '无地点信息'}
                  </CourseInfo>
                  <CourseInfo>
                    <Icon name="user" />
                    {course.teacher || '未设置'}
                  </CourseInfo>
                  <WeeksList>
                    {(() => {
                      // 将连续的周数合并显示
                      const sortedWeeks = [...course.weeks].sort((a, b) => a - b);
                      const ranges: string[] = [];
                      let start = sortedWeeks[0];
                      let end = sortedWeeks[0];
                      
                      for (let i = 1; i <= sortedWeeks.length; i++) {
                        if (i < sortedWeeks.length && sortedWeeks[i] === end + 1) {
                          end = sortedWeeks[i];
                        } else {
                          if (start === end) {
                            ranges.push(`第${start}周`);
                          } else {
                            ranges.push(`第${start}-${end}周`);
                          }
                          if (i < sortedWeeks.length) {
                            start = sortedWeeks[i];
                            end = sortedWeeks[i];
                          }
                        }
                      }
                      
                      return ranges.map((range, idx) => (
                        <WeekTag key={idx}>{range}</WeekTag>
                      ));
                    })()}
                  </WeeksList>
                </CourseCard>
              ))}
            </CourseGrid>
          </AnimatedList>
        ) : (
          <EmptyState>
            <p>该课表暂无课程</p>
            <p>点击上方"添加课程"按钮开始添加</p>
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
      
      {deleteConfirm.show && (
        <ConfirmDialog
          title="删除课程"
          message={`确定要删除课程"${deleteConfirm.courseName}"吗？此操作不可恢复。`}
          variant="danger"
          confirmText="删除"
          cancelText="取消"
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
        />
      )}
    </PageContainer>
  );
};

export default CourseManagePage; 