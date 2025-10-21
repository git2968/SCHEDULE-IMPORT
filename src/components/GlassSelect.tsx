import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';

interface Option {
  value: string;
  label: string;
}

interface GlassSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  maxHeight?: number;
}

const SelectContainer = styled.div`
  position: relative;
  width: 100%;
`;

const SelectButton = styled.button<{ isOpen: boolean }>`
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  border: 1px solid rgba(10, 132, 255, 0.2);
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  font-size: 0.95rem;
  color: rgba(0, 0, 0, 0.85);
  text-align: left;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  &:hover {
    border-color: rgba(10, 132, 255, 0.4);
    background: rgba(255, 255, 255, 0.9);
  }
  
  &:focus {
    outline: none;
    border-color: rgba(10, 132, 255, 0.5);
    box-shadow: 0 0 0 3px rgba(10, 132, 255, 0.1);
  }
  
  ${props => props.isOpen && `
    border-color: rgba(10, 132, 255, 0.5);
    box-shadow: 0 0 0 3px rgba(10, 132, 255, 0.1);
  `}
`;

const Arrow = styled.span<{ isOpen: boolean }>`
  font-size: 0.8rem;
  color: rgba(0, 0, 0, 0.5);
  transition: transform 0.2s;
  transform: ${props => props.isOpen ? 'rotate(180deg)' : 'rotate(0deg)'};
`;

const DropdownList = styled.div<{ isOpen: boolean; maxHeight: number }>`
  position: absolute;
  top: calc(100% + 0.25rem);
  left: 0;
  right: 0;
  z-index: 9999;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(10, 132, 255, 0.2);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(10, 132, 255, 0.15);
  overflow-y: auto;
  max-height: ${props => props.maxHeight}px;
  opacity: ${props => props.isOpen ? 1 : 0};
  visibility: ${props => props.isOpen ? 'visible' : 'hidden'};
  transform: ${props => props.isOpen ? 'translateY(0)' : 'translateY(-10px)'};
  transition: all 0.2s ease;
  
  /* 自定义滚动条 */
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.02);
    border-radius: 12px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(10, 132, 255, 0.3);
    border-radius: 12px;
    
    &:hover {
      background: rgba(10, 132, 255, 0.5);
    }
  }
`;

const OptionItem = styled.button<{ isSelected: boolean }>`
  width: 100%;
  padding: 0.75rem 1rem;
  border: none;
  background: ${props => props.isSelected ? 'rgba(10, 132, 255, 0.1)' : 'transparent'};
  color: ${props => props.isSelected ? 'rgba(10, 132, 255, 0.9)' : 'rgba(0, 0, 0, 0.85)'};
  font-size: 0.9rem;
  text-align: left;
  cursor: pointer;
  transition: all 0.15s;
  
  &:hover {
    background: rgba(10, 132, 255, 0.08);
  }
  
  &:first-child {
    border-radius: 12px 12px 0 0;
  }
  
  &:last-child {
    border-radius: 0 0 12px 12px;
  }
  
  &:only-child {
    border-radius: 12px;
  }
`;

const Placeholder = styled.span`
  color: rgba(0, 0, 0, 0.4);
`;

const GlassSelect: React.FC<GlassSelectProps> = ({ 
  value, 
  onChange, 
  options, 
  placeholder = '请选择',
  maxHeight = 250
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const selectedOption = options.find(opt => opt.value === value);
  
  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };
  
  return (
    <SelectContainer ref={containerRef}>
      <SelectButton 
        type="button"
        isOpen={isOpen} 
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedOption ? selectedOption.label : <Placeholder>{placeholder}</Placeholder>}
        <Arrow isOpen={isOpen}>▼</Arrow>
      </SelectButton>
      
      <DropdownList isOpen={isOpen} maxHeight={maxHeight}>
        {options.map(option => (
          <OptionItem
            key={option.value}
            type="button"
            isSelected={option.value === value}
            onClick={() => handleSelect(option.value)}
          >
            {option.label}
          </OptionItem>
        ))}
      </DropdownList>
    </SelectContainer>
  );
};

export default GlassSelect;

