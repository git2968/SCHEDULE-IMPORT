/**
 * 应用中心背景设置对话框
 * 通过设置按钮打开，用于设置背景图片
 */

import React, { useRef } from 'react';
import styled from 'styled-components';
import { useSettings } from '../hooks/useSettings';
import { toast } from 'react-toastify';
import GlassButton from './GlassButton';
import Icon from './Icon';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  animation: fadeIn 0.2s ease;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const Dialog = styled.div`
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(250, 252, 255, 0.95));
  backdrop-filter: blur(30px);
  border-radius: 20px;
  padding: 2rem;
  border: 1.5px solid rgba(10, 132, 255, 0.2);
  box-shadow: 0 20px 60px rgba(10, 132, 255, 0.2);
  max-width: 500px;
  width: 90%;
  animation: slideIn 0.3s ease;

  @keyframes slideIn {
    from {
      transform: translateY(-20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

const DialogHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
`;

const DialogTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const CloseButton = styled.button`
  background: linear-gradient(135deg, rgba(255, 59, 48, 0.1), rgba(255, 89, 78, 0.08));
  border: 1.5px solid rgba(255, 59, 48, 0.3);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  color: rgba(255, 59, 48, 0.9);
  font-size: 1.2rem;
  box-shadow: 0 2px 8px rgba(255, 59, 48, 0.15);
  
  &:hover {
    background: linear-gradient(135deg, rgba(255, 59, 48, 0.2), rgba(255, 89, 78, 0.15));
    border-color: rgba(255, 59, 48, 0.5);
    transform: rotate(90deg) scale(1.1);
    box-shadow: 0 4px 12px rgba(255, 59, 48, 0.25);
  }
  
  &:active {
    transform: rotate(90deg) scale(1.05);
  }
`;

const SettingsDescription = styled.p`
  font-size: 0.95rem;
  color: rgba(0, 0, 0, 0.6);
  margin-bottom: 1.5rem;
  line-height: 1.6;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`;

const HiddenInput = styled.input`
  display: none;
`;

interface AppCenterBackgroundSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const AppCenterBackgroundSettings: React.FC<AppCenterBackgroundSettingsProps> = ({ 
  isOpen, 
  onClose 
}) => {
  const { settings, updateSettings } = useSettings();
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      toast.error('请上传图片文件');
      return;
    }

    // 检查文件大小（限制为5MB）
    if (file.size > 5 * 1024 * 1024) {
      toast.error('图片大小不能超过5MB');
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        if (e.target?.result) {
          await updateSettings({ appCenterBackgroundImage: e.target.result as string });
          toast.success('背景图片已更新');
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('上传失败', error);
      toast.error('上传失败，请重试');
    }

    // 重置input以允许重复选择同一文件
    if (event.target) {
      event.target.value = '';
    }
  };

  const handleReset = async () => {
    try {
      await updateSettings({ appCenterBackgroundImage: undefined });
      toast.success('已恢复默认背景图片');
    } catch (error) {
      console.error('重置失败', error);
      toast.error('重置失败，请重试');
    }
  };

  return (
    <Overlay onClick={onClose}>
      <Dialog onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>
            <Icon name="gallery" size="lg" />
            背景设置
          </DialogTitle>
          <CloseButton onClick={onClose}>
            <Icon name="close" />
          </CloseButton>
        </DialogHeader>
        
        <SettingsDescription>
          自定义您的专属背景，让页面更具个性。
        </SettingsDescription>
        
        <ButtonGroup>
          <GlassButton onClick={() => fileInputRef.current?.click()}>
            <Icon name="upload-1" /> 上传背景图片
          </GlassButton>
          {settings?.appCenterBackgroundImage && (
            <GlassButton variant="secondary" onClick={handleReset}>
              <Icon name="refresh-circle-1-clockwise" /> 恢复默认
            </GlassButton>
          )}
        </ButtonGroup>
        
        <HiddenInput
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleUpload}
        />
      </Dialog>
    </Overlay>
  );
};

export default AppCenterBackgroundSettings;

