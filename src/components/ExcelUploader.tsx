import React, { useState, useRef, ChangeEvent } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import { useSchedule } from '../hooks/useSchedule';
import GlassButton from './GlassButton';
import Icon from './Icon';

const Container = styled.div`
  margin-bottom: 1rem;
`;

const WelcomeSection = styled.div`
  text-align: center;
  padding: 3rem 2rem;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 20px;
  margin-bottom: 2rem;
  
  .icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }
  
  h3 {
    font-size: 1.5rem;
    color: rgba(0, 0, 0, 0.85);
    margin-bottom: 0.8rem;
    font-weight: 700;
  }
  
  p {
    font-size: 1rem;
    color: rgba(0, 0, 0, 0.65);
    line-height: 1.8;
    margin-bottom: 0;
  }
  
  .step {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 600;
    color: rgba(10, 132, 255, 0.9);
  }
`;

const UploadSection = styled.div`
  background: rgba(255, 255, 255, 0.6);
  border: 2px dashed rgba(10, 132, 255, 0.3);
  border-radius: 16px;
  padding: 2rem;
  text-align: center;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: rgba(10, 132, 255, 0.5);
    background: rgba(255, 255, 255, 0.7);
  }
`;

const InputContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const FileInput = styled.input`
  display: none;
`;

const FileName = styled.span`
  color: rgba(0, 0, 0, 0.75);
  font-weight: 600;
  padding: 0.5rem 1rem;
  background: rgba(10, 132, 255, 0.1);
  border-radius: 8px;
`;

const ButtonsContainer = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
`;

const ExcelUploader: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { parseExcel, saveSchedule, error } = useSchedule();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      // 检查文件类型
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        toast.error('请上传Excel文件（.xlsx或.xls格式）');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleSelectFile = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.warning('请先选择Excel文件');
      return;
    }

    try {
      setIsUploading(true);
      // 解析Excel文件
      const schedule = await parseExcel(selectedFile);
      // 保存到localStorage和课表列表
      await saveSchedule(schedule);
      toast.success('课表导入并保存成功！');
      // 清空文件选择
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Excel解析错误:', error);
      if (error instanceof Error) {
        toast.error(`导入失败: ${error.message}`);
      } else {
        toast.error('导入失败，请检查Excel文件格式是否正确');
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Container>
      <WelcomeSection>
        <div className="icon"><Icon name="upload" size="32" /></div>
        <h3>导入您的课程表</h3>
        <p>
          <span className="step">① 准备</span> Excel文件（.xlsx 或 .xls）<br/>
          <span className="step">② 点击</span> 下方"选择文件"按钮<br/>
          <span className="step">③ 导入</span> 课表即可查看
        </p>
      </WelcomeSection>

      <UploadSection>
        <InputContainer>
          <GlassButton onClick={handleSelectFile} disabled={isUploading}>
            <Icon name="folder" /> 选择文件
          </GlassButton>
          <FileInput
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            ref={fileInputRef}
          />
          {selectedFile && <FileName><Icon name="checkmark-circle" /> {selectedFile.name}</FileName>}
        </InputContainer>

        <ButtonsContainer>
          <GlassButton onClick={handleUpload} disabled={!selectedFile || isUploading}>
            {isUploading ? <><Icon name="reload" spin /> 导入中...</> : <><Icon name="cloud-upload" /> 导入课表</>}
          </GlassButton>
          {selectedFile && (
            <GlassButton variant="secondary" onClick={handleClear} disabled={isUploading}>
              <Icon name="trash-3" /> 清除
            </GlassButton>
          )}
        </ButtonsContainer>

        {error && (
          <div style={{ 
            color: '#FF453A', 
            marginTop: '1rem',
            padding: '0.8rem',
            background: 'rgba(255, 69, 58, 0.1)',
            borderRadius: '8px',
            fontWeight: '500'
          }}>
            <Icon name="cross-circle" /> 错误: {error}
          </div>
        )}
      </UploadSection>
    </Container>
  );
};

export default ExcelUploader; 