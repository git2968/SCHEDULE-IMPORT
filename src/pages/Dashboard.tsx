import React, { useState } from 'react';
import styled from 'styled-components';
import { useSchedule } from '../hooks/useSchedule';
import GlassCard from '../components/GlassCard';
import GlassTabs, { GlassTab } from '../components/GlassTabs';
import AnimatedPageTitle from '../components/AnimatedPageTitle';

// Components
import ScheduleTable from '../components/ScheduleTable';
import ExcelUploader from '../components/ExcelUploader';
import ScheduleSettings from '../components/ScheduleSettings';
import BackgroundSettings from '../components/BackgroundSettings';

const DashboardContainer = styled.div`
  padding: 1rem 0;
`;

const PageTitle = styled.h1`
  margin-bottom: 2rem;
  text-align: center;
  color: var(--text-color);
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
`;

const EmptyStateTitle = styled.h3`
  margin-bottom: 1rem;
  color: var(--text-color);
`;

const EmptyStateText = styled.p`
  color: var(--light-text);
  margin-bottom: 2rem;
`;

const Dashboard: React.FC = () => {
  const { currentSchedule, loading } = useSchedule();
  const [activeTab, setActiveTab] = useState(0);
  
  const handleTabChange = (index: number) => {
    setActiveTab(index);
  };
  
  return (
    <DashboardContainer>
      <AnimatedPageTitle title="当前课表" />
      
      <GlassCard padding="0">
        <GlassTabs activeTab={activeTab} onChange={handleTabChange}>
          <GlassTab label="课表">
            {currentSchedule ? (
              <ScheduleTable 
                courses={currentSchedule.courses}
                currentWeek={1}
                totalWeeks={currentSchedule.totalWeeks}
              />
            ) : (
              <EmptyState>
                <EmptyStateTitle>还没有课表</EmptyStateTitle>
                <EmptyStateText>
                  请导入Excel格式的课表文件，或者手动创建课表
                </EmptyStateText>
                <ExcelUploader />
              </EmptyState>
            )}
          </GlassTab>
          
          <GlassTab label="导入">
            <ExcelUploader />
          </GlassTab>
          
          <GlassTab label="设置">
            <ScheduleSettings />
            <BackgroundSettings />
          </GlassTab>
        </GlassTabs>
      </GlassCard>
    </DashboardContainer>
  );
};

export default Dashboard; 