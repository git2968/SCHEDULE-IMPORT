import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import { useSettings } from '../hooks/useSettings';
import GlassButton from './GlassButton';

const SettingsContainer = styled.div`
  margin-bottom: 2rem;
`;

const FileInput = styled.input`
  display: none;
`;

const UploadLabel = styled.label`
  display: inline-block;
  margin-right: 1rem;
`;

const PreviewContainer = styled.div`
  margin-top: 1rem;
  max-width: 300px;
  border-radius: 8px;
  overflow: hidden;
`;

const PreviewImage = styled.img`
  width: 100%;
  height: auto;
  display: block;
`;

const BackgroundSettings: React.FC = () => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { settings, uploadBackgroundImage } = useSettings();
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      
      // 检查文件类型
      if (!selectedFile.type.match(/image\/(jpeg|jpg|png|gif|webp)$/)) {
        toast.error('请上传图片文件（JPEG、PNG、GIF或WEBP格式）');
        return;
      }
      
      try {
        setUploading(true);
        
        // 上传背景图片
        await uploadBackgroundImage(selectedFile);
        
        toast.success('背景图片已更新');
        
        // 清空文件选择
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (error) {
        console.error('Failed to upload background image', error);
        toast.error('背景图片更新失败');
      } finally {
        setUploading(false);
      }
    }
  };
  
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  return (
    <SettingsContainer>
      <h3>背景设置</h3>
      
      <FileInput 
        type="file" 
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp" 
        onChange={handleFileChange} 
        ref={fileInputRef}
      />
      
      <UploadLabel>
        <GlassButton
          onClick={triggerFileInput}
          disabled={uploading}
          variant="secondary"
        >
          {uploading ? '上传中...' : '更换背景图片'}
        </GlassButton>
      </UploadLabel>
      
      {settings.backgroundImage && (
        <PreviewContainer>
          <PreviewImage 
            src={settings.backgroundImage} 
            alt="背景预览" 
          />
        </PreviewContainer>
      )}
    </SettingsContainer>
  );
};

export default BackgroundSettings; 