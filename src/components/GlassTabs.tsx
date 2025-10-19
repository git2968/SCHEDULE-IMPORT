import React, { ReactNode, useState } from 'react';
import styled from 'styled-components';

interface TabProps {
  id?: string;
  label: string | ReactNode;
  children: ReactNode;
}

interface GlassTabsProps {
  children: React.ReactElement<TabProps>[];
  activeTab?: string | number;
  onTabChange?: (id: string) => void;
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
  onTabChange,
  onChange,
  className,
  style
}) => {
  const [internalActiveTab, setInternalActiveTab] = useState(0);
  
  // Get tab ids from children
  const tabIds = React.Children.map(children, (child) => {
    if (React.isValidElement<TabProps>(child)) {
      return child.props.id;
    }
    return undefined;
  }) || [];
  
  // Determine active index based on controlledActiveTab
  let activeIndex = internalActiveTab;
  if (controlledActiveTab !== undefined) {
    if (typeof controlledActiveTab === 'string') {
      // Find index by id
      const index = tabIds.findIndex(id => id === controlledActiveTab);
      activeIndex = index >= 0 ? index : 0;
    } else {
      // Use numeric index directly
      activeIndex = controlledActiveTab;
    }
  }
  
  // Handle tab change
  const handleTabChange = (index: number) => {
    const tabId = tabIds[index];
    
    // Call onTabChange with id if available
    if (onTabChange && tabId) {
      onTabChange(tabId);
    }
    
    // Call onChange with index (legacy support)
    if (onChange) {
      onChange(index);
    }
    
    // Update internal state if uncontrolled
    if (controlledActiveTab === undefined) {
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
            active={activeIndex === index}
            onClick={() => handleTabChange(index)}
          >
            {label}
          </TabButton>
        ))}
      </TabList>
      
      <TabContent>
        {React.Children.map(children, (child, index) => {
          if (React.isValidElement(child) && index === activeIndex) {
            return child;
          }
          return null;
        })}
      </TabContent>
    </TabsContainer>
  );
};

export default GlassTabs; 