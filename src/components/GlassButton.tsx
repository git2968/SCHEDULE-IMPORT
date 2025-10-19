import React from 'react';
import styled from 'styled-components';

interface GlassButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  fullWidth?: boolean;
}

const StyledButton = styled.button<{
  variant: string;
  size: string;
  disabled?: boolean;
  fullWidth?: boolean;
}>`
  display: ${props => props.fullWidth ? 'flex' : 'inline-flex'};
  width: ${props => props.fullWidth ? '100%' : 'auto'};
  align-items: center;
  justify-content: center;
  background: ${props => {
    if (props.disabled) return 'rgba(200, 200, 200, 0.3)';
    
    switch (props.variant) {
      case 'primary':
        return 'rgba(79, 158, 240, 0.7)';
      case 'secondary':
        return 'rgba(255, 255, 255, 0.35)';
      case 'danger':
        return 'rgba(244, 67, 54, 0.7)';
      default:
        return 'rgba(79, 158, 240, 0.7)';
    }
  }};
  color: ${props => {
    if (props.disabled) return 'rgba(255, 255, 255, 0.5)';
    return props.variant === 'secondary' ? 'rgba(255, 255, 255, 0.9)' : '#ffffff';
  }};
  border: 1px solid ${props => {
    if (props.disabled) return 'rgba(200, 200, 200, 0.3)';
    
    switch (props.variant) {
      case 'primary':
        return 'rgba(79, 158, 240, 0.2)';
      case 'secondary':
        return 'rgba(255, 255, 255, 0.4)';
      case 'danger':
        return 'rgba(244, 67, 54, 0.2)';
      default:
        return 'rgba(79, 158, 240, 0.2)';
    }
  }};
  border-radius: 12px;
  padding: ${props => {
    switch (props.size) {
      case 'small':
        return '0.5rem 1rem';
      case 'large':
        return '1rem 2rem';
      default:
        return '0.75rem 1.5rem';
    }
  }};
  font-size: ${props => {
    switch (props.size) {
      case 'small':
        return '0.875rem';
      case 'large':
        return '1.125rem';
      default:
        return '1rem';
    }
  }};
  font-weight: 500;
  cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
    background: ${props => {
      switch (props.variant) {
        case 'primary':
          return 'rgba(79, 158, 240, 0.8)';
        case 'secondary':
          return 'rgba(255, 255, 255, 0.45)';
        case 'danger':
          return 'rgba(244, 67, 54, 0.8)';
        default:
          return 'rgba(79, 158, 240, 0.8)';
      }
    }};
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  @media (max-width: 768px) {
    font-size: ${props => {
      switch (props.size) {
        case 'small':
          return '0.8rem';
        case 'large':
          return '1rem';
        default:
          return '0.9rem';
      }
    }};
    padding: ${props => {
      switch (props.size) {
        case 'small':
          return '0.45rem 0.9rem';
        case 'large':
          return '0.9rem 1.8rem';
        default:
          return '0.65rem 1.3rem';
      }
    }};
    border-radius: 10px;
  }
`;

const GlassButton: React.FC<GlassButtonProps> = ({
  children,
  onClick,
  disabled = false,
  variant = 'primary',
  size = 'medium',
  className,
  type = 'button',
  fullWidth = false,
}) => {
  return (
    <StyledButton
      onClick={onClick}
      disabled={disabled}
      variant={variant}
      size={size}
      className={className}
      type={type}
      fullWidth={fullWidth}
    >
      {children}
    </StyledButton>
  );
};

export default GlassButton; 