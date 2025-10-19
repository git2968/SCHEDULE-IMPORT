/**
 * 添加/编辑自定义应用对话框
 */

import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import Icon from './Icon';
import GlassButton from './GlassButton';
import CustomSelect from './CustomSelect';
import { APP_DATA } from '../types/apps';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
  padding: 1rem;
`;

const Dialog = styled.div`
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(250, 252, 255, 0.95));
  backdrop-filter: blur(30px);
  border-radius: 24px;
  padding: 2rem;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  border: 2px solid rgba(10, 132, 255, 0.2);
  
  /* 自定义滚动条 */
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.05);
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(10, 132, 255, 0.3);
    border-radius: 4px;
    
    &:hover {
      background: rgba(10, 132, 255, 0.5);
    }
  }
`;

const DialogHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid rgba(10, 132, 255, 0.1);
`;

const DialogTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #0A84FF, #64D2FF);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
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

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.8);
  font-size: 0.95rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.875rem 1rem;
  border: 2px solid rgba(10, 132, 255, 0.2);
  border-radius: 12px;
  font-size: 0.95rem;
  background: rgba(255, 255, 255, 0.8);
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: rgba(10, 132, 255, 0.5);
    background: rgba(255, 255, 255, 1);
    box-shadow: 0 0 0 4px rgba(10, 132, 255, 0.1);
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 0.875rem 1rem;
  border: 2px solid rgba(10, 132, 255, 0.2);
  border-radius: 12px;
  font-size: 0.95rem;
  background: rgba(255, 255, 255, 0.8);
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: rgba(10, 132, 255, 0.5);
    background: rgba(255, 255, 255, 1);
    box-shadow: 0 0 0 4px rgba(10, 132, 255, 0.1);
  }
`;

const IconSelector = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
`;

const IconOption = styled.div<{ selected: boolean }>`
  flex: 1;
  padding: 1rem;
  border: 2px solid ${props => props.selected ? 'rgba(10, 132, 255, 0.5)' : 'rgba(10, 132, 255, 0.2)'};
  border-radius: 12px;
  background: ${props => props.selected ? 'rgba(10, 132, 255, 0.1)' : 'rgba(255, 255, 255, 0.8)'};
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  
  &:hover {
    border-color: rgba(10, 132, 255, 0.5);
    background: rgba(10, 132, 255, 0.05);
  }
`;

const IconPreview = styled.div`
  width: 64px;
  height: 64px;
  margin: 0 auto 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(10, 132, 255, 0.1);
  border-radius: 12px;
  font-size: 2rem;
`;

const UploadedIconPreview = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 8px;
`;

const FileInput = styled.input`
  display: none;
`;

const UploadButton = styled.button`
  width: 100%;
  padding: 0.75rem;
  border: 2px dashed rgba(10, 132, 255, 0.3);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: all 0.3s ease;
  color: rgba(10, 132, 255, 0.8);
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  
  &:hover {
    border-color: rgba(10, 132, 255, 0.5);
    background: rgba(10, 132, 255, 0.05);
  }
`;

const IconGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 0.75rem;
  margin-top: 0.75rem;
  max-height: 280px;
  overflow-y: auto;
  padding: 1rem;
  background: linear-gradient(135deg, rgba(10, 132, 255, 0.03), rgba(64, 210, 255, 0.02));
  border-radius: 12px;
  border: 1.5px solid rgba(10, 132, 255, 0.15);
  
  /* 自定义滚动条 */
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.03);
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: linear-gradient(135deg, rgba(10, 132, 255, 0.4), rgba(64, 210, 255, 0.4));
    border-radius: 4px;
    
    &:hover {
      background: linear-gradient(135deg, rgba(10, 132, 255, 0.6), rgba(64, 210, 255, 0.6));
    }
  }
`;

const IconItem = styled.div<{ selected: boolean }>`
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  border: 2px solid ${props => props.selected ? 'rgba(10, 132, 255, 0.8)' : 'rgba(10, 132, 255, 0.2)'};
  border-radius: 12px;
  background: ${props => props.selected 
    ? 'linear-gradient(135deg, rgba(10, 132, 255, 0.2), rgba(64, 210, 255, 0.15))' 
    : 'rgba(255, 255, 255, 0.9)'};
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: ${props => props.selected 
    ? '0 4px 12px rgba(10, 132, 255, 0.2)' 
    : '0 2px 6px rgba(0, 0, 0, 0.05)'};
  
  &:hover {
    border-color: rgba(10, 132, 255, 0.6);
    background: linear-gradient(135deg, rgba(10, 132, 255, 0.15), rgba(64, 210, 255, 0.1));
    transform: scale(1.1);
    box-shadow: 0 6px 16px rgba(10, 132, 255, 0.2);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
`;

const CancelButton = styled.button`
  flex: 1;
  padding: 0.875rem 1.5rem;
  border: 2px solid rgba(255, 59, 48, 0.3);
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(255, 59, 48, 0.08), rgba(255, 89, 78, 0.05));
  color: rgba(255, 59, 48, 0.95);
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(255, 59, 48, 0.1);
  
  &:hover {
    background: linear-gradient(135deg, rgba(255, 59, 48, 0.15), rgba(255, 89, 78, 0.1));
    border-color: rgba(255, 59, 48, 0.5);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 59, 48, 0.2);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const AddNewButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, rgba(10, 132, 255, 0.1), rgba(64, 210, 255, 0.08));
  border: 1.5px solid rgba(10, 132, 255, 0.3);
  border-radius: 8px;
  color: rgba(10, 132, 255, 0.9);
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 0.5rem;
  
  &:hover {
    background: linear-gradient(135deg, rgba(10, 132, 255, 0.15), rgba(64, 210, 255, 0.12));
    border-color: rgba(10, 132, 255, 0.5);
    transform: translateY(-1px);
  }
`;

interface AddAppDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (app: {
    name: string;
    description: string;
    categoryId: string;
    subcategoryId: string;
    icon: string;
    iconType: 'lineicon' | 'upload';
    iconUrl?: string;
    path: string;
    isExternal: boolean;
  }) => void;
  onAddCategory?: (categoryName: string, categoryIcon: string) => void;
  onAddSubcategory?: (categoryId: string, subcategoryName: string, subcategoryIcon: string) => void;
  allCategories?: any[]; // 所有分类（预设+自定义）
}

// 常用图标列表 - 使用Lineicons实际图标名称
const COMMON_ICONS = [
  'home-2', 'book-1', 'calendar-days', 'graduation-cap-1', 'pencil-1', 'certificate-badge-1',
  'game-pad-modern-1', 'music', 'camera-movie-1', 'gallery', 'camera-1', 'microphone-1',
  'calculator-1', 'code-1', 'database-2', 'briefcase-1', 'cloud-2', 'download-1',
  'map-marker-1', 'compass-drafting-2', 'aeroplane-1', 'car-2', 'train-1', 'bike',
  'cart-1', 'wallet-1', 'credit-card-multiple', 'dollar', 'pie-chart-2', 'bar-chart-4',
  'heart', 'star-fat', 'flag-2', 'ticket-1', 'bookmark-1', 'search-1',
  'gear-1', 'hammer-1', 'bolt-2', 'paint-bucket', 'brush-2', 'magnet',
];

const AddAppDialog: React.FC<AddAppDialogProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit,
  onAddCategory,
  onAddSubcategory,
  allCategories 
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [subcategoryId, setSubcategoryId] = useState('');
  const [iconType, setIconType] = useState<'lineicon' | 'upload'>('lineicon');
  const [selectedIcon, setSelectedIcon] = useState('home-2');
  const [uploadedIcon, setUploadedIcon] = useState<string>('');
  const [url, setUrl] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isAddingSubcategory, setIsAddingSubcategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newSubcategoryName, setNewSubcategoryName] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedIcon(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (!name || !categoryId || !subcategoryId || !url) {
      alert('请填写所有必填项');
      return;
    }

    onSubmit({
      name,
      description,
      categoryId,
      subcategoryId,
      icon: iconType === 'lineicon' ? selectedIcon : uploadedIcon,
      iconType,
      iconUrl: iconType === 'upload' ? uploadedIcon : undefined,
      path: url,
      isExternal: true,
    });

    // 重置表单
    setName('');
    setDescription('');
    setCategoryId('');
    setSubcategoryId('');
    setSelectedIcon('home-2');
    setUploadedIcon('');
    setUrl('');
  };

  if (!isOpen) return null;

  // 使用传入的分类列表，如果没有则使用默认的
  const categoriesData = allCategories || APP_DATA;
  const selectedCategory = categoriesData.find(cat => cat.id === categoryId);
  const subcategories = selectedCategory?.subcategories || [];

  // 准备一级分类选项
  const categoryOptions = categoriesData.map(cat => ({
    value: cat.id,
    label: cat.name,
    icon: cat.icon
  }));

  // 准备二级分类选项
  const subcategoryOptions = subcategories.map(sub => ({
    value: sub.id,
    label: sub.name,
    icon: sub.icon
  }));

  return (
    <Overlay onClick={onClose}>
      <Dialog onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>
            <Icon name="plus-circle" size="lg" />
            添加自定义应用
          </DialogTitle>
          <CloseButton onClick={onClose}>
            <Icon name="close" />
          </CloseButton>
        </DialogHeader>

        <FormGroup>
          <Label>应用名称 *</Label>
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例如：我的网站"
          />
        </FormGroup>

        <FormGroup>
          <Label>应用描述</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="简单描述一下这个应用"
          />
        </FormGroup>

        <FormGroup>
          <Label>所属分类 *</Label>
          {!isAddingCategory ? (
            <>
              <CustomSelect
                value={categoryId}
                onChange={(value) => {
                  setCategoryId(value);
                  setSubcategoryId(''); // 重置二级分类
                }}
                options={categoryOptions}
                placeholder="请选择一级分类"
              />
              {onAddCategory && (
                <AddNewButton onClick={() => setIsAddingCategory(true)}>
                  <Icon name="plus" size="sm" />
                  新增分类
                </AddNewButton>
              )}
            </>
          ) : (
            <>
              <Input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="输入新分类名称"
                autoFocus
              />
              <ButtonGroup style={{ marginTop: '0.5rem', marginBottom: 0 }}>
                <CancelButton 
                  onClick={() => {
                    setIsAddingCategory(false);
                    setNewCategoryName('');
                  }}
                >
                  取消
                </CancelButton>
                <GlassButton 
                  onClick={() => {
                    if (newCategoryName && onAddCategory) {
                      onAddCategory(newCategoryName, 'folder');
                      setIsAddingCategory(false);
                      setNewCategoryName('');
                    }
                  }}
                  style={{ flex: 1, padding: '0.5rem' }}
                >
                  确定
                </GlassButton>
              </ButtonGroup>
            </>
          )}
        </FormGroup>

        {categoryId && (
          <FormGroup>
            <Label>二级分类 *</Label>
            {!isAddingSubcategory ? (
              <>
                <CustomSelect
                  value={subcategoryId}
                  onChange={(value) => setSubcategoryId(value)}
                  options={subcategoryOptions}
                  placeholder="请选择二级分类"
                />
                {onAddSubcategory && (
                  <AddNewButton onClick={() => setIsAddingSubcategory(true)}>
                    <Icon name="plus" size="sm" />
                    新增子分类
                  </AddNewButton>
                )}
              </>
            ) : (
              <>
                <Input
                  type="text"
                  value={newSubcategoryName}
                  onChange={(e) => setNewSubcategoryName(e.target.value)}
                  placeholder="输入新子分类名称"
                  autoFocus
                />
                <ButtonGroup style={{ marginTop: '0.5rem', marginBottom: 0 }}>
                  <CancelButton 
                    onClick={() => {
                      setIsAddingSubcategory(false);
                      setNewSubcategoryName('');
                    }}
                  >
                    取消
                  </CancelButton>
                  <GlassButton 
                    onClick={() => {
                      if (newSubcategoryName && onAddSubcategory) {
                        onAddSubcategory(categoryId, newSubcategoryName, 'folder');
                        setIsAddingSubcategory(false);
                        setNewSubcategoryName('');
                      }
                    }}
                    style={{ flex: 1, padding: '0.5rem' }}
                  >
                    确定
                  </GlassButton>
                </ButtonGroup>
              </>
            )}
          </FormGroup>
        )}

        <FormGroup>
          <Label>应用图标</Label>
          <IconSelector>
            <IconOption
              selected={iconType === 'lineicon'}
              onClick={() => setIconType('lineicon')}
            >
              <IconPreview>
                <Icon name={selectedIcon} size="lg" />
              </IconPreview>
              <div>图标库</div>
            </IconOption>
            <IconOption
              selected={iconType === 'upload'}
              onClick={() => setIconType('upload')}
            >
              <IconPreview>
                {uploadedIcon ? (
                  <UploadedIconPreview src={uploadedIcon} alt="上传的图标" />
                ) : (
                  <Icon name="image" size="lg" />
                )}
              </IconPreview>
              <div>上传图片</div>
            </IconOption>
          </IconSelector>

          {iconType === 'lineicon' && (
            <IconGrid>
              {COMMON_ICONS.map(icon => (
                <IconItem
                  key={icon}
                  selected={selectedIcon === icon}
                  onClick={() => setSelectedIcon(icon)}
                  title={icon}
                >
                  <Icon name={icon} size="lg" />
                </IconItem>
              ))}
            </IconGrid>
          )}

          {iconType === 'upload' && (
            <>
              <FileInput
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
              />
              <UploadButton onClick={() => fileInputRef.current?.click()}>
                <Icon name="upload" /> 点击上传图标图片
              </UploadButton>
            </>
          )}
        </FormGroup>

        <FormGroup>
          <Label>应用网址 *</Label>
          <Input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
          />
        </FormGroup>

        <ButtonGroup>
          <CancelButton onClick={onClose}>
            取消
          </CancelButton>
          <GlassButton onClick={handleSubmit} style={{ flex: 1 }}>
            添加应用
          </GlassButton>
        </ButtonGroup>
      </Dialog>
    </Overlay>
  );
};

export default AddAppDialog;
