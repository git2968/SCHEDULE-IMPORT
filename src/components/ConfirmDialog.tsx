/**
 * 确认对话框组件
 * 替代原生的window.confirm，提供更好的用户体验
 */

import React from 'react';
import styled, { keyframes } from 'styled-components';
import Icon from './Icon';

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const slideUp = keyframes`
  from {
    opacity: 0;
    transform: translate(-50%, -45%) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${fadeIn} 0.2s ease-out;
`;

const Dialog = styled.div`
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 90%;
  max-width: 420px;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(30px);
  -webkit-backdrop-filter: blur(30px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 20px;
  padding: 0;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: ${slideUp} 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  overflow: hidden;
`;

const IconWrapper = styled.div<{ variant?: 'danger' | 'warning' | 'info' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  margin: 0 auto 1rem;
  border-radius: 50%;
  background: ${props => {
    switch (props.variant) {
      case 'danger':
        return 'linear-gradient(135deg, rgba(255, 69, 58, 0.15), rgba(255, 140, 130, 0.1))';
      case 'warning':
        return 'linear-gradient(135deg, rgba(255, 159, 10, 0.15), rgba(255, 204, 0, 0.1))';
      default:
        return 'linear-gradient(135deg, rgba(10, 132, 255, 0.15), rgba(64, 210, 255, 0.1))';
    }
  }};
  font-size: 2rem;
  color: ${props => {
    switch (props.variant) {
      case 'danger':
        return '#FF453A';
      case 'warning':
        return '#FF9F0A';
      default:
        return '#0A84FF';
    }
  }};
`;

const Content = styled.div`
  padding: 2rem 2rem 1.5rem;
  text-align: center;
`;

const Title = styled.h3`
  font-size: 1.3rem;
  font-weight: 700;
  color: rgba(0, 0, 0, 0.9);
  margin-bottom: 0.8rem;
  line-height: 1.4;
`;

const Message = styled.p`
  font-size: 1rem;
  color: rgba(0, 0, 0, 0.65);
  line-height: 1.6;
  margin-bottom: 0;
`;

const Actions = styled.div`
  display: flex;
  gap: 0.8rem;
  padding: 1.5rem 2rem 2rem;
  justify-content: center;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  border: none;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  
  ${props => {
    switch (props.variant) {
      case 'danger':
        return `
          background: linear-gradient(135deg, #FF453A, #FF8C82);
          color: white;
          box-shadow: 0 2px 8px rgba(255, 69, 58, 0.2);
          
          &:hover {
            box-shadow: 0 4px 12px rgba(255, 69, 58, 0.3);
            transform: translateY(-2px);
          }
        `;
      case 'secondary':
        return `
          background: rgba(255, 255, 255, 0.7);
          color: rgba(0, 0, 0, 0.8);
          border: 1px solid rgba(0, 0, 0, 0.1);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          
          &:hover {
            background: rgba(255, 255, 255, 0.85);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
            transform: translateY(-2px);
          }
        `;
      default:
        return `
          background: linear-gradient(135deg, #0A84FF, #64D2FF);
          color: white;
          box-shadow: 0 2px 8px rgba(10, 132, 255, 0.2);
          
          &:hover {
            box-shadow: 0 4px 12px rgba(10, 132, 255, 0.3);
            transform: translateY(-2px);
          }
        `;
    }
  }}
  
  &:active {
    transform: translateY(0);
  }
`;

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  title,
  message,
  confirmText = '确定',
  cancelText = '取消',
  variant = 'info',
  onConfirm,
  onCancel,
}) => {
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  const getIcon = () => {
    switch (variant) {
      case 'danger':
        return 'trash';
      case 'warning':
        return 'warning';
      default:
        return 'information';
    }
  };

  return (
    <Overlay onClick={handleOverlayClick}>
      <Dialog>
        <Content>
          <IconWrapper variant={variant}>
            <Icon name={getIcon()} size="32" />
          </IconWrapper>
          <Title>{title}</Title>
          <Message>{message}</Message>
        </Content>
        <Actions>
          <Button onClick={onCancel} variant="secondary">
            {cancelText}
          </Button>
          <Button 
            onClick={onConfirm} 
            variant={variant === 'danger' ? 'danger' : 'primary'}
          >
            {confirmText}
          </Button>
        </Actions>
      </Dialog>
    </Overlay>
  );
};

export default ConfirmDialog;

