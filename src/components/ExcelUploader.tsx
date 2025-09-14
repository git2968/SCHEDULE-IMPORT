import React, { useState, useRef, ChangeEvent } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import { useSchedule } from '../hooks/useSchedule';
import GlassButton from './GlassButton';

const Container = styled.div`
  margin-bottom: 1rem;
`;

const InputContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
`;

const FileInput = styled.input`
  display: none;
`;

const FileName = styled.span`
  margin-left: 1rem;
  color: var(--text-color);
`;

const ButtonsContainer = styled.div`
  display: flex;
  gap: 1rem;
`;

const ExcelUploader: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { parseExcel, error } = useSchedule();

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
      await parseExcel(selectedFile);
      toast.success('课表导入成功！');
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
      <InputContainer>
        <GlassButton onClick={handleSelectFile} disabled={isUploading}>
          选择文件
        </GlassButton>
        <FileInput
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileChange}
          ref={fileInputRef}
        />
        {selectedFile && <FileName>{selectedFile.name}</FileName>}
      </InputContainer>

      <ButtonsContainer>
        <GlassButton onClick={handleUpload} disabled={!selectedFile || isUploading}>
          {isUploading ? '导入中...' : '导入课表'}
        </GlassButton>
        {selectedFile && (
          <GlassButton variant="secondary" onClick={handleClear} disabled={isUploading}>
            清除
          </GlassButton>
        )}
      </ButtonsContainer>

      {error && (
        <div style={{ color: 'var(--error-color)', marginTop: '1rem' }}>
          错误: {error}
        </div>
      )}
    </Container>
  );
};

export default ExcelUploader; 