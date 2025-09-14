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
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
`;

const TabButton = styled.button<{ active: boolean }>`
  padding: 12px 24px;
  background: ${props => props.active ? 'rgba(255, 255, 255, 0.15)' : 'transparent'};
  border: none;
  border-bottom: 2px solid ${props => props.active ? 'rgba(255, 255, 255, 0.8)' : 'transparent'};
  color: ${props => props.active ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.6)'};
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.active ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)'};
    color: rgba(255, 255, 255, 0.9);
  }
`;

const TabContent = styled.div`
  padding: 20px;
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