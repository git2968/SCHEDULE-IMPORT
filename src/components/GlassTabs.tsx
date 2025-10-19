import React, { ReactNode, useState } from 'react';
import styled from 'styled-components';

interface TabProps {
  label: string;
  children: ReactNode;
}

interface GlassTabsProps {
  children: React.ReactElement<TabProps>[];
  activeTab?: number;
  onChange?: (index: number) => void;
  className?: string;
  style?: React.CSSProperties;
}

const TabsContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const TabList = styled.div`
  display: flex;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  background: rgba(255, 255, 255, 0.2);
  border-radius: 16px 16px 0 0;
  
  @media (max-width: 768px) {
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  }
`;

const TabButton = styled.button<{ active: boolean }>`
  padding: 14px 24px;
  background: ${props => props.active ? 'rgba(255, 255, 255, 0.3)' : 'transparent'};
  border: none;
  border-bottom: 3px solid ${props => props.active ? '#0A84FF' : 'transparent'};
  color: ${props => props.active ? 'rgba(0, 0, 0, 0.85)' : 'rgba(0, 0, 0, 0.55)'};
  font-size: 1rem;
  font-weight: ${props => props.active ? '600' : '500'};
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  flex: 1;
  
  @media (max-width: 768px) {
    padding: 12px 16px;
    font-size: 0.9rem;
  }
  
  &:hover {
    background: ${props => props.active ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.15)'};
    color: ${props => props.active ? 'rgba(0, 0, 0, 0.85)' : 'rgba(0, 0, 0, 0.75)'};
  }
  
  &:active {
    transform: scale(0.98);
  }
`;

const TabContent = styled.div`
  padding: 20px;
  
  @media (max-width: 768px) {
    padding: 12px;
  }
`;

export const GlassTab: React.FC<TabProps> = ({ children }) => {
  return <>{children}</>;
};

const GlassTabs: React.FC<GlassTabsProps> = ({
  children,
  activeTab: controlledActiveTab,
  onChange,
  className,
  style
}) => {
  const [internalActiveTab, setInternalActiveTab] = useState(0);
  
  // Determine if the component is controlled or uncontrolled
  const activeTab = controlledActiveTab !== undefined ? controlledActiveTab : internalActiveTab;
  
  // Handle tab change
  const handleTabChange = (index: number) => {
    if (onChange) {
      onChange(index);
    } else {
      setInternalActiveTab(index);
    }
  };
  
  // Extract tab labels from children
  const tabLabels = React.Children.map(children, (child) => {
    if (React.isValidElement<TabProps>(child)) {
      return child.props.label;
    }
    return null;
  });
  
  return (
    <TabsContainer className={className} style={style}>
      <TabList>
        {tabLabels?.map((label, index) => (
          <TabButton
            key={index}
            active={activeTab === index}
            onClick={() => handleTabChange(index)}
          >
            {label}
          </TabButton>
        ))}
      </TabList>
      
      <TabContent>
        {React.Children.map(children, (child, index) => {
          if (React.isValidElement(child) && index === activeTab) {
            return child;
          }
          return null;
        })}
      </TabContent>
    </TabsContainer>
  );
};

export default GlassTabs; 