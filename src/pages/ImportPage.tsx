import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import GlassCard from '../components/GlassCard';
import ExcelUploader from '../components/ExcelUploader';
import ScheduleTable from '../components/ScheduleTable';
import { useSchedule } from '../hooks/useSchedule';
import { useAuth } from '../hooks/useAuth';
import GlassButton from '../components/GlassButton';
import AnimatedPageTitle from '../components/AnimatedPageTitle';

const PageContainer = styled.div`
  padding: 1.5rem 0;
`;

const PageTitleContainer = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const PageTitle = styled.h1`
  font-size: 3rem;
  font-weight: 700;
  background: linear-gradient(90deg, #0A84FF, #64D2FF);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  letter-spacing: 2px;
  animation: gradientAnimation 6s ease infinite, fadeIn 1s ease-out;
  
  @keyframes gradientAnimation {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  max-width: 95%;
  margin: 0 auto;
`;

const UploaderSection = styled.section`
  margin-bottom: 1rem;
`;

const ScheduleSection = styled.section`
  margin-bottom: 2rem;
`;

const InfoText = styled.p`
  text-align: center;
  margin-top: 1rem;
  color: rgba(0, 0, 0, 0.6);
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1.5rem;
`;

const ImportPage: React.FC = () => {
  const { currentSchedule, saveSchedule } = useSchedule();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSaveSchedule = async () => {
    if (!currentSchedule) {
      toast.error('请先导入课表');
      return;
    }

    if (!currentUser) {
      navigate('/login', { state: { from: '/', message: '请先登录以保存课表' } });
      return;
    }

    try {
      setIsSubmitting(true);
      await saveSchedule(currentSchedule);
      toast.success('课表保存成功');
      navigate('/schedules');
    } catch (error) {
      console.error('Failed to save schedule', error);
      toast.error('保存课表失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewSchedules = () => {
    if (!currentUser) {
      navigate('/login', { state: { from: '/schedules', message: '请先登录以查看您的课表' } });
      return;
    }
    
    navigate('/schedules');
  };

  return (
    <PageContainer>
      <AnimatedPageTitle title="课表导入" />
      
      <ContentContainer>
        <UploaderSection>
          <GlassCard>
            <ExcelUploader />
          </GlassCard>
        </UploaderSection>
        
        {currentSchedule && (
          <>
            <ScheduleSection>
              <ScheduleTable />
            </ScheduleSection>
            
            <ButtonContainer>
              <GlassButton 
                onClick={handleSaveSchedule}
                disabled={isSubmitting}
              >
                {isSubmitting ? '保存中...' : '保存课表'}
              </GlassButton>
              
              <GlassButton 
                onClick={handleViewSchedules}
                variant="secondary"
              >
                查看所有课表
              </GlassButton>
            </ButtonContainer>
          </>
        )}
      </ContentContainer>
    </PageContainer>
  );
};

export default ImportPage; 