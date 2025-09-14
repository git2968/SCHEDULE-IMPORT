import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useSchedule } from '../hooks/useSchedule';
import { Schedule } from '../types';
import GlassCard from '../components/GlassCard';
import GlassButton from '../components/GlassButton';
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

const ImportButton = styled(GlassButton)`
  margin-left: auto;
`;

const ScheduleGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const ScheduleCard = styled.div<{ isActive: boolean }>`
  background: ${props => props.isActive ? 'rgba(10, 132, 255, 0.1)' : 'rgba(255, 255, 255, 0.5)'};
  border: ${props => props.isActive ? '2px solid var(--primary-color)' : '1px solid rgba(0, 0, 0, 0.1)'};
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  transition: all 0.2s;
  cursor: pointer;
  position: relative;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }
`;

const ScheduleName = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: rgba(0, 0, 0, 0.8);
  padding-right: 30px;
`;

const ScheduleInfo = styled.div`
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

const ActiveBadge = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  background: var(--primary-color);
  color: white;
  font-size: 0.7rem;
  padding: 0.2rem 0.5rem;
  border-radius: 10px;
`;

const DeleteButton = styled.button`
  position: absolute;
  bottom: 10px;
  right: 10px;
  background: transparent;
  border: none;
  color: var(--error-color);
  font-size: 0.9rem;
  cursor: pointer;
  padding: 0.3rem 0.5rem;
  border-radius: 4px;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(255, 59, 48, 0.1);
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