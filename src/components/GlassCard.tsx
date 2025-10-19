import React, { ReactNode } from 'react';
import styled from 'styled-components';

interface GlassCardProps {
  children: ReactNode;
  padding?: string;
  borderRadius?: string;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

const StyledGlassCard = styled.div<{ padding?: string }>`
  background: rgba(255, 255, 255, 0.45);
  backdrop-filter: blur(30px) saturate(180%);
  -webkit-backdrop-filter: blur(30px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
  padding: ${props => props.padding || '20px'};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  @media (max-width: 768px) {
    background: rgba(255, 255, 255, 0.5);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
  }
  
  &:hover {
    background: rgba(255, 255, 255, 0.5);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08);
    transform: translateY(-1px);
  }
`;

const GlassCard: React.FC<GlassCardProps> = ({
  children,
  padding,
  borderRadius = '16px',
  onClick,
  className,
  style
}) => {
  // 合并样式，确保borderRadius包含在style中
  const mergedStyle: React.CSSProperties = {
    borderRadius,
    ...style
  };

  return (
    <StyledGlassCard
      padding={padding}
      onClick={onClick}
      className={className}
      style={mergedStyle}
    >
      {children}
    </StyledGlassCard>
  );
};

export default GlassCard; 