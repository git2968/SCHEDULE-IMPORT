/**
 * 自定义下拉选择器组件
 * 替代原生select，提供更美观的UI和更好的用户体验
 */

import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import Icon from './Icon';

interface Option {
  value: string;
  label: string;
  icon?: string; // 可选的图标名称
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
}

const SelectContainer = styled.div`
  position: relative;
  min-width: 280px;
  user-select: none;
`;

const SelectButton = styled.div<{ isOpen: boolean }>`
  padding: 0.9rem 1.5rem;
  padding-right: 3rem;
  border: 2px solid ${props => props.isOpen ? 'rgba(10, 132, 255, 0.5)' : 'rgba(10, 132, 255, 0.2)'};
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(250, 252, 255, 0.95));
  font-size: 1rem;
  font-weight: 600;
  color: rgba(10, 132, 255, 0.95);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 
    0 4px 12px rgba(10, 132, 255, ${props => props.isOpen ? '0.15' : '0.08'}),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  position: relative;
  
  &:hover {
    border-color: rgba(10, 132, 255, 0.4);
    background: linear-gradient(135deg, rgba(255, 255, 255, 1), rgba(248, 252, 255, 0.98));
    transform: translateY(-2px);
    box-shadow: 
      0 6px 16px rgba(10, 132, 255, 0.12),
      inset 0 1px 0 rgba(255, 255, 255, 1);
  }
  
  ${props => props.isOpen && `
    transform: translateY(-2px);
    box-shadow: 
      0 6px 16px rgba(10, 132, 255, 0.15),
      0 0 0 4px rgba(10, 132, 255, 0.12),
      inset 0 1px 0 rgba(255, 255, 255, 1);
  `}
`;

const SelectLabel = styled.span`
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const SelectArrow = styled.div<{ isOpen: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(10, 132, 255, 0.8);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform: rotate(${props => props.isOpen ? '180deg' : '0deg'});
`;

const OptionsContainer = styled.div<{ isOpen: boolean }>`
  position: absolute;
  top: calc(100% + 0.75rem);
  left: 0;
  right: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(250, 252, 255, 0.98));
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 2px solid rgba(10, 132, 255, 0.2);
  border-radius: 16px;
  box-shadow: 
    0 12px 40px rgba(10, 132, 255, 0.15),
    0 4px 16px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  max-height: 350px;
  overflow-y: auto;
  overflow-x: hidden;
  z-index: 1000;
  padding: 0.5rem 0;
  opacity: ${props => props.isOpen ? '1' : '0'};
  visibility: ${props => props.isOpen ? 'visible' : 'hidden'};
  transform: translateY(${props => props.isOpen ? '0' : '-10px'}) scale(${props => props.isOpen ? '1' : '0.98'});
  transform-origin: top center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  /* 自定义滚动条 */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
    margin: 0.5rem 0;
  }
  
  &::-webkit-scrollbar-thumb {
    background: linear-gradient(135deg, rgba(10, 132, 255, 0.3), rgba(64, 210, 255, 0.3));
    border-radius: 10px;
    
    &:hover {
      background: linear-gradient(135deg, rgba(10, 132, 255, 0.5), rgba(64, 210, 255, 0.5));
    }
  }
`;

const Option = styled.div<{ isSelected: boolean }>`
  padding: 1rem 1.5rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  font-size: 0.95rem;
  font-weight: ${props => props.isSelected ? '600' : '500'};
  color: ${props => props.isSelected ? 'rgba(10, 132, 255, 1)' : 'rgba(0, 0, 0, 0.75)'};
  background: ${props => props.isSelected 
    ? 'linear-gradient(90deg, rgba(10, 132, 255, 0.1), rgba(64, 210, 255, 0.08))' 
    : 'transparent'};
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: ${props => props.isSelected ? '4px' : '0'};
    height: 60%;
    background: linear-gradient(135deg, #0A84FF, #64D2FF);
    border-radius: 0 4px 4px 0;
    transition: width 0.3s ease;
  }
  
  &:first-child {
    border-radius: 14px 14px 0 0;
  }
  
  &:last-child {
    border-radius: 0 0 14px 14px;
  }
  
  &:hover {
    background: ${props => props.isSelected 
      ? 'linear-gradient(90deg, rgba(10, 132, 255, 0.15), rgba(64, 210, 255, 0.12))' 
      : 'linear-gradient(90deg, rgba(10, 132, 255, 0.08), rgba(64, 210, 255, 0.05))'};
    color: rgba(10, 132, 255, 1);
    padding-left: 2rem;
    transform: translateX(2px);
    
    &::before {
      width: 4px;
    }
  }
  
  &:active {
    background: linear-gradient(90deg, rgba(10, 132, 255, 0.18), rgba(64, 210, 255, 0.15));
    transform: translateX(0);
  }
`;

const CheckIcon = styled.div`
  color: rgba(10, 132, 255, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: checkIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  @keyframes checkIn {
    0% {
      opacity: 0;
      transform: scale(0.5);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }
`;

const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = '请选择',
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭下拉框
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const selectedOption = options.find(opt => opt.value === value);
  const displayLabel = selectedOption?.label || placeholder;

  return (
    <SelectContainer ref={containerRef} className={className}>
      <SelectButton onClick={handleToggle} isOpen={isOpen}>
        <SelectLabel>
          {selectedOption?.icon && <Icon name={selectedOption.icon} size="sm" />}
          {displayLabel}
        </SelectLabel>
        <SelectArrow isOpen={isOpen}>
          <Icon name="chevron-down" />
        </SelectArrow>
      </SelectButton>
      
      <OptionsContainer isOpen={isOpen}>
        {options.map(option => (
          <Option
            key={option.value}
            isSelected={option.value === value}
            onClick={() => handleSelect(option.value)}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
              {option.icon && <Icon name={option.icon} size="sm" />}
              {option.label}
            </span>
            {option.value === value && (
              <CheckIcon>
                <Icon name="check-circle-1" />
              </CheckIcon>
            )}
          </Option>
        ))}
      </OptionsContainer>
    </SelectContainer>
  );
};

export default CustomSelect;

