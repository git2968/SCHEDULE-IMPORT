import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useSchedule } from '../hooks/useSchedule';
import { Schedule } from '../types';
import GlassCard from '../components/GlassCard';
import GlassButton from '../components/GlassButton';
import AnimatedPageTitle from '../components/AnimatedPageTitle';
import AnimatedList from '../components/animations/AnimatedList';

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
  border-bottom: 2px solid rgba(10, 132, 255, 0.1);
  
  h2 {
    font-size: 1.4rem;
    font-weight: 700;
    color: rgba(0, 0, 0, 0.85);
    margin: 0;
  }
`;

const ImportButton = styled(GlassButton)`
  margin-left: auto;
  background: linear-gradient(135deg, #0A84FF, #64D2FF);
  color: white;
  border: none;
  border-radius: 10px;
  padding: 0.75rem 1.5rem;
  font-size: 0.95rem;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(10, 132, 255, 0.2);
  
  &:hover {
    box-shadow: 0 4px 12px rgba(10, 132, 255, 0.3);
    transform: translateY(-2px);
  }
`;

const ScheduleGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.2rem;
  align-items: stretch;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const ScheduleCard = styled.div<{ isActive: boolean }>`
  background: ${props => props.isActive 
    ? 'linear-gradient(135deg, rgba(10, 132, 255, 0.12), rgba(64, 210, 255, 0.08))' 
    : 'rgba(255, 255, 255, 0.6)'};
  border: ${props => props.isActive 
    ? '2px solid rgba(10, 132, 255, 0.3)' 
    : '1px solid rgba(255, 255, 255, 0.5)'};
  border-radius: 14px;
  padding: 1.25rem;
  padding-bottom: 3rem;
  box-shadow: ${props => props.isActive 
    ? '0 4px 12px rgba(10, 132, 255, 0.15)' 
    : '0 2px 8px rgba(0, 0, 0, 0.04)'};
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: ${props => props.isActive 
      ? '0 6px 16px rgba(10, 132, 255, 0.2)' 
      : '0 4px 12px rgba(0, 0, 0, 0.08)'};
    background: ${props => props.isActive 
      ? 'linear-gradient(135deg, rgba(10, 132, 255, 0.15), rgba(64, 210, 255, 0.1))' 
      : 'rgba(255, 255, 255, 0.7)'};
  }
  
  &:active {
    transform: translateY(-1px);
  }
`;

const ScheduleName = styled.h3`
  font-size: 1.15rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
  color: rgba(0, 0, 0, 0.85);
  padding-right: 60px;
  line-height: 1.4;
`;

const ScheduleInfo = styled.div`
  font-size: 0.9rem;
  color: rgba(0, 0, 0, 0.65);
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  line-height: 1.5;
  
  &:before {
    content: '';
    display: inline-block;
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: linear-gradient(135deg, #0A84FF, #64D2FF);
    margin-right: 0.6rem;
    flex-shrink: 0;
  }
`;

const ActiveBadge = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  background: linear-gradient(135deg, #0A84FF, #64D2FF);
  color: white;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.3rem 0.7rem;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(10, 132, 255, 0.25);
`;

const DeleteButton = styled.button`
  position: absolute;
  bottom: 12px;
  right: 12px;
  background: rgba(255, 69, 58, 0.1);
  border: 1px solid rgba(255, 69, 58, 0.2);
  color: rgba(255, 69, 58, 0.9);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(255, 69, 58, 0.15);
    transform: translateY(-1px);
    box-shadow: 0 2px 6px rgba(255, 69, 58, 0.2);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 2rem;
  color: rgba(0, 0, 0, 0.5);
`;

const ScheduleListPage: React.FC = () => {
  const { currentSchedule, userSchedules, setCurrentSchedule, deleteSchedule, loadUserSchedules } = useSchedule();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    const loadSchedules = async () => {
      setLoading(true);
      await loadUserSchedules();
      setLoading(false);
    };
    
    loadSchedules();
  }, []);
  
  const handleScheduleSelect = (schedule: Schedule) => {
    setCurrentSchedule(schedule);
    toast.success(`已切换到课表: ${schedule.name}`);
    navigate('/dashboard');
  };
  
  const handleDeleteSchedule = async (e: React.MouseEvent, scheduleId: string) => {
    e.stopPropagation();
    
    if (window.confirm('确定要删除这个课表吗？此操作不可恢复。')) {
      try {
        await deleteSchedule(scheduleId);
        toast.success('课表删除成功');
      } catch (error) {
        toast.error('删除课表失败');
      }
    }
  };
  
  const handleImportNew = () => {
    navigate('/');
  };
  
  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <PageContainer>
      <AnimatedPageTitle title="我的课表" />
      
      <ContentCard>
        <Header>
          <h2>所有课表</h2>
          <ImportButton onClick={handleImportNew}>导入新课表</ImportButton>
        </Header>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>加载中...</div>
        ) : userSchedules.length > 0 ? (
          <AnimatedList>
            <ScheduleGrid>
              {userSchedules.map(schedule => (
                <ScheduleCard 
                  key={schedule.id} 
                  isActive={currentSchedule?.id === schedule.id}
                  onClick={() => handleScheduleSelect(schedule)}
                >
                  {currentSchedule?.id === schedule.id && <ActiveBadge>当前</ActiveBadge>}
                  <ScheduleName>{schedule.name}</ScheduleName>
                  <ScheduleInfo>课程数量: {schedule.courses.length}</ScheduleInfo>
                  <ScheduleInfo>总周数: {schedule.totalWeeks}</ScheduleInfo>
                  <ScheduleInfo>更新时间: {formatDate(schedule.updatedAt)}</ScheduleInfo>
                  
                  <DeleteButton 
                    onClick={(e) => handleDeleteSchedule(e, schedule.id)}
                  >
                    删除
                  </DeleteButton>
                </ScheduleCard>
              ))}
            </ScheduleGrid>
          </AnimatedList>
        ) : (
          <EmptyState>
            <p>还没有保存任何课表</p>
            <p>点击"导入新课表"按钮开始创建</p>
          </EmptyState>
        )}
      </ContentCard>
    </PageContainer>
  );
};

export default ScheduleListPage; 