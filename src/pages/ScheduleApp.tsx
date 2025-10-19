/**
 * 课程表应用主页面
 * 将原来的 Dashboard 改造为独立的课程表应用
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { useSchedule } from '../hooks/useSchedule';
import GlassCard from '../components/GlassCard';
import GlassTabs, { GlassTab } from '../components/GlassTabs';
import AnimatedPageTitle from '../components/AnimatedPageTitle';
import ScheduleTable from '../components/ScheduleTable';
import ExcelUploader from '../components/ExcelUploader';
import ScheduleSettings from '../components/ScheduleSettings';
import BackgroundSettings from '../components/BackgroundSettings';
import GlassButton from '../components/GlassButton';
import Icon from '../components/Icon';
import { useNavigate } from 'react-router-dom';

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
  padding: 1.5rem;
  
  @media (max-width: 768px) {
    padding: 0.8rem;
    border-radius: 12px;
  }
`;

const TabContent = styled.div`
  padding-top: 1rem;
  
  @media (max-width: 768px) {
    padding-top: 0.75rem;
  }
`;

const NoSchedulePrompt = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  
  .icon {
    font-size: 5rem;
    margin-bottom: 1.5rem;
    animation: bounce 2s infinite;
  }
  
  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
  
  h3 {
    font-size: 1.5rem;
    color: rgba(0, 0, 0, 0.8);
    margin-bottom: 1rem;
  }
  
  p {
    font-size: 1rem;
    color: rgba(0, 0, 0, 0.6);
    margin-bottom: 2rem;
    line-height: 1.6;
  }
  
  @media (max-width: 768px) {
    padding: 2rem 1rem;
    
    .icon {
      font-size: 3.5rem;
      margin-bottom: 1rem;
    }
    
    h3 {
      font-size: 1.25rem;
      margin-bottom: 0.75rem;
    }
    
    p {
      font-size: 0.9rem;
      margin-bottom: 1.5rem;
    }
  }
`;

const ScheduleApp: React.FC = () => {
  const { currentSchedule } = useSchedule();
  const navigate = useNavigate();
  
  // 初始化：默认显示课表Tab
  const [activeTab, setActiveTab] = useState('schedule');

  return (
    <PageContainer>
      <AnimatedPageTitle title="YUE的课表" />
      
      <ContentCard>
        <GlassTabs activeTab={activeTab} onTabChange={setActiveTab}>
          <GlassTab id="schedule" label={<><Icon name="calendar" /> 课表</>}>
            <TabContent>
              {currentSchedule ? (
                <ScheduleTable />
              ) : (
                <NoSchedulePrompt>
                  <div className="icon"><Icon name="book" size="32" /></div>
                  <h3>还没有课表哦</h3>
                  <p>请点击上方"<Icon name="upload" /> 导入"标签页导入您的课表文件<br/>或者前往"我的课表"选择已保存的课表</p>
                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <GlassButton onClick={() => setActiveTab('import')}>
                      <Icon name="upload" /> 立即导入
                    </GlassButton>
                    <GlassButton onClick={() => navigate('/apps/schedule/list')}>
                      <Icon name="book" /> 我的课表
                    </GlassButton>
                  </div>
                </NoSchedulePrompt>
              )}
            </TabContent>
          </GlassTab>
          
          <GlassTab id="import" label={<><Icon name="upload" /> 导入</>}>
            <TabContent>
              <ExcelUploader />
            </TabContent>
          </GlassTab>
          
          <GlassTab id="settings" label={<><Icon name="cog" /> 设置</>}>
            <TabContent>
              <ScheduleSettings />
              <div style={{ marginTop: '2rem' }}>
                <BackgroundSettings />
              </div>
            </TabContent>
          </GlassTab>
        </GlassTabs>
      </ContentCard>
    </PageContainer>
  );
};

export default ScheduleApp;

