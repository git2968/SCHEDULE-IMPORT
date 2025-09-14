import React, { ChangeEvent } from 'react';
import styled from 'styled-components';

interface GlassInputProps {
  id?: string;
  type?: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
  min?: string | number;
  max?: string | number;
  fullWidth?: boolean;
}

const StyledInputContainer = styled.div<{ fullWidth?: boolean }>`
  position: relative;
  width: ${props => (props.fullWidth ? '100%' : 'auto')};
`;

const StyledInput = styled.input<{ disabled?: boolean }>`
  width: 100%;
  padding: 12px 16px;
  background: ${props => props.disabled ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.1)'};
  backdrop-filter: blur(10px);
  border: 1px solid ${props => props.disabled ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.2)'};
  border-radius: 8px;
  color: ${props => props.disabled ? 'rgba(255, 255, 255, 0.5)' : 'inherit'};
  font-size: 1rem;
  transition: all 0.3s ease;
  outline: none;
  opacity: ${props => (props.disabled ? '0.7' : '1')};
  cursor: ${props => props.disabled ? 'not-allowed' : 'text'};
  
  &:focus {
    border-color: rgba(255, 255, 255, 0.5);
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.2);
  }
  
  &::placeholder {
    color: ${props => props.disabled ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.5)'};
  }
`;

const GlassInput: React.FC<GlassInputProps> = ({
  id,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  className,
  style,
  min,
  max,
  fullWidth = false
}) => {
  return (
    <StyledInputContainer fullWidth={fullWidth} className={className} style={style}>
      <StyledInput
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        min={min}
        max={max}
      />
    </StyledInputContainer>
  );
};

export default GlassInput; 