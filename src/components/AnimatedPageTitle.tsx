import React, { useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';

interface AnimatedPageTitleProps {
  title: string;
}

// 渐变效果动画
const gradientAnimation = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

// 淡入动画
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

// 简单的渐变动画
const gradientMove = keyframes`
  0% {
    background-position: 0% 50%;
  }
  100% {
    background-position: 100% 50%;
  }
`;

const TitleContainer = styled.div`
  text-align: center;
  margin-bottom: 1.5rem;
  position: relative;
  padding: 0.5rem 0;
  
  @media (max-width: 768px) {
    margin-bottom: 1rem;
  }
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  font-family: 'Arial', sans-serif;
  background: linear-gradient(90deg, #0A84FF, #64D2FF);
  background-size: 200% auto;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  letter-spacing: 1.5px;
  margin: 0;
  animation: ${gradientAnimation} 6s ease infinite, ${fadeIn} 1s ease-out;
  position: relative;
  
  @media (max-width: 768px) {
    font-size: 1.6rem;
    letter-spacing: 1px;
  }
`;

const Subtitle = styled.div`
  font-size: 0.85rem;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.6);
  margin-top: 0.4rem;
  letter-spacing: 0.5px;
  animation: ${fadeIn} 1s ease-out 0.3s both;
  
  @media (max-width: 768px) {
    font-size: 0.75rem;
    letter-spacing: 0.3px;
  }
`;

const lineExpand = keyframes`
  from { width: 0; }
  to { width: 50px; }
`;

const Decoration = styled.div`
  width: 50px;
  height: 2.5px;
  background: linear-gradient(90deg, #0A84FF, #64D2FF);
  margin: 0.5rem auto;
  border-radius: 3px;
  animation: ${lineExpand} 0.7s ease-out forwards;
  
  @media (max-width: 768px) {
    width: 40px;
    height: 2px;
    margin: 0.4rem auto;
  }
`;

const AnimatedPageTitle: React.FC<AnimatedPageTitleProps> = ({ title }) => {
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (titleRef.current) {
      titleRef.current.setAttribute('data-text', title);
    }
  }, [title]);

  // 从标题中提取英文部分，用作副标题
  const getSubtitleFromTitle = (title: string): string => {
    switch (title) {
      case '课表导入':
        return 'SCHEDULE IMPORT';
      case '我的课表':
        return 'MY SCHEDULES';
      case '当前课表':
        return 'CURRENT SCHEDULE';
      case '课程管理':
        return 'COURSE MANAGEMENT';
      default:
        return title.toUpperCase();
    }
  };

  return (
    <TitleContainer>
      <Title ref={titleRef} data-text={title}>
        {title}
      </Title>
      <Decoration />
      <Subtitle>{getSubtitleFromTitle(title)}</Subtitle>
    </TitleContainer>
  );
};

export default AnimatedPageTitle; 