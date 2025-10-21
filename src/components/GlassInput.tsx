import React, { ChangeEvent } from 'react';
import styled from 'styled-components';

interface GlassInputProps {
  id?: string;
  type?: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
  min?: string | number;
  max?: string | number;
  step?: string | number;
  fullWidth?: boolean;
  as?: 'input' | 'textarea';
  name?: string;
  rows?: number;
}

const StyledInputContainer = styled.div<{ fullWidth?: boolean }>`
  position: relative;
  width: ${props => (props.fullWidth ? '100%' : 'auto')};
`;

const baseStyles = `
  width: 100%;
  padding: 12px 16px;
  backdrop-filter: blur(10px);
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  outline: none;
  font-family: inherit;
  
  &:focus {
    border-color: rgba(255, 255, 255, 0.5);
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.2);
  }
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
`;

const StyledInput = styled.input<{ disabled?: boolean }>`
  ${baseStyles}
  background: ${props => props.disabled ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.1)'};
  border: 1px solid ${props => props.disabled ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.2)'};
  color: ${props => props.disabled ? 'rgba(255, 255, 255, 0.5)' : 'inherit'};
  opacity: ${props => (props.disabled ? '0.7' : '1')};
  cursor: ${props => props.disabled ? 'not-allowed' : 'text'};
  
  &::placeholder {
    color: ${props => props.disabled ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.5)'};
  }
`;

const StyledTextarea = styled.textarea<{ disabled?: boolean }>`
  ${baseStyles}
  background: ${props => props.disabled ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.1)'};
  border: 1px solid ${props => props.disabled ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.2)'};
  color: ${props => props.disabled ? 'rgba(255, 255, 255, 0.5)' : 'inherit'};
  opacity: ${props => (props.disabled ? '0.7' : '1')};
  cursor: ${props => props.disabled ? 'not-allowed' : 'text'};
  resize: vertical;
  min-height: 80px;
  
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
  step,
  fullWidth = false,
  as = 'input',
  name,
  rows = 3
}) => {
  return (
    <StyledInputContainer fullWidth={fullWidth} className={className} style={style}>
      {as === 'textarea' ? (
        <StyledTextarea
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          rows={rows}
        />
      ) : (
        <StyledInput
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          min={min}
          max={max}
          step={step}
        />
      )}
    </StyledInputContainer>
  );
};

export default GlassInput; 