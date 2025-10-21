import React, { useState } from 'react';
import styled from 'styled-components';
import AnimatedPageTitle from '../components/AnimatedPageTitle';
import GlassCard from '../components/GlassCard';
import GlassTabs, { GlassTab } from '../components/GlassTabs';
import BodyDataTracker from '../components/BodyDataTracker';
import BodyDataCharts from '../components/BodyDataCharts';
import FoodDiary from '../components/FoodDiary';

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
  max-width: 100%;
  margin: 0 auto;
  padding: 1.5rem;
  box-sizing: border-box;
  overflow: hidden;
  
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

const WelcomeBanner = styled.div`
  background: linear-gradient(135deg, rgba(10, 132, 255, 0.08), rgba(64, 210, 255, 0.05));
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  border: 1px solid rgba(10, 132, 255, 0.15);
  
  h2 {
    font-size: 1.5rem;
    font-weight: 700;
    background: linear-gradient(135deg, #0A84FF, #64D2FF);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    margin: 0 0 0.5rem 0;
  }
  
  p {
    font-size: 1rem;
    color: rgba(0, 0, 0, 0.7);
    line-height: 1.6;
    margin: 0;
  }
  
  @media (max-width: 768px) {
    padding: 1rem;
    margin-bottom: 1rem;
    
    h2 {
      font-size: 1.25rem;
    }
    
    p {
      font-size: 0.9rem;
    }
  }
`;

const FitnessApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'body' | 'charts' | 'food'>('body');

  return (
    <PageContainer>
      <AnimatedPageTitle title="健身减脂记录" />
      
      <ContentCard>
        <WelcomeBanner>
          <h2>💪 开始你的健身之旅</h2>
          <p>
            记录每天的身体数据和饮食摄入，用数据见证你的改变！
            坚持记录，科学减脂，达成你的健身目标。
          </p>
        </WelcomeBanner>

        <GlassTabs activeTab={activeTab} onTabChange={setActiveTab}>
          <GlassTab id="body" label="📝 记录数据">
            <TabContent>
              <BodyDataTracker />
            </TabContent>
          </GlassTab>

          <GlassTab id="charts" label="📊 数据趋势">
            <TabContent>
              <BodyDataCharts />
            </TabContent>
          </GlassTab>

          <GlassTab id="food" label="🍽️ 饮食记录">
            <TabContent>
              <FoodDiary />
            </TabContent>
          </GlassTab>
        </GlassTabs>
      </ContentCard>
    </PageContainer>
  );
};

export default FitnessApp;

