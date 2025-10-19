/**
 * 图标展示页面
 * 展示所有Lineicons图标，方便开发时查找和使用
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import Icon from '../components/Icon';
import GlassCard from '../components/GlassCard';
import AnimatedPageTitle from '../components/AnimatedPageTitle';

const PageContainer = styled.div`
  padding: 1.5rem 0;
  max-width: 95%;
  margin: 0 auto;
`;

const ContentCard = styled(GlassCard)`
  width: 100%;
  margin: 0 auto;
  padding: 1.5rem;
`;

const SearchBar = styled.input`
  width: 100%;
  padding: 1rem 1.5rem;
  font-size: 1rem;
  border: 2px solid rgba(10, 132, 255, 0.2);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.8);
  margin-bottom: 2rem;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: rgba(10, 132, 255, 0.5);
    background: rgba(255, 255, 255, 0.95);
  }
`;

const IconGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }
`;

const IconCard = styled.div`
  padding: 1.5rem 1rem;
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(10, 132, 255, 0.1);
  border-radius: 12px;
  text-align: center;
  cursor: pointer;
  transition: all 0.25s ease;
  
  &:hover {
    transform: translateY(-4px);
    background: rgba(255, 255, 255, 0.85);
    border-color: rgba(10, 132, 255, 0.3);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  }
  
  .icon-wrapper {
    font-size: 2rem;
    margin-bottom: 0.5rem;
    color: rgba(10, 132, 255, 0.9);
  }
  
  .icon-name {
    font-size: 0.75rem;
    color: rgba(0, 0, 0, 0.7);
    word-break: break-all;
  }
`;

const ToastMessage = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 1rem 1.5rem;
  background: rgba(48, 209, 88, 0.95);
  color: white;
  border-radius: 12px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 10000;
  animation: slideIn 0.3s ease;
  
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;

// 常用图标列表
const commonIcons = [
  // 导航
  'home', 'grid', 'menu', 'close', 'arrow-left', 'arrow-right', 
  'chevron-left', 'chevron-right', 'chevron-up', 'chevron-down',
  
  // 文件和内容
  'calendar', 'book', 'graduation', 'file', 'upload', 'download', 
  'folder', 'cloud-upload', 'cloud-download',
  
  // 用户和操作
  'user', 'users', 'login', 'exit', 'checkmark', 'checkmark-circle',
  'trash', 'pencil', 'plus', 'minus', 'edit', 'delete',
  
  // 设置和工具
  'cog', 'support', 'question-circle', 'information', 'construction',
  
  // 娱乐和生活
  'game', 'music', 'calculator', 'cloud', 'weather',
  
  // 通信
  'envelope', 'comments', 'mobile', 'phone',
  
  // 其他
  'reload', 'search', 'heart', 'star', 'certificate',
  'cross-circle', 'warning'
];

const IconShowcase: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [copiedIcon, setCopiedIcon] = useState('');

  const filteredIcons = commonIcons.filter(icon => 
    icon.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleIconClick = (iconName: string) => {
    const code = `<Icon name="${iconName}" />`;
    navigator.clipboard.writeText(code);
    setCopiedIcon(iconName);
    setShowToast(true);
    
    setTimeout(() => {
      setShowToast(false);
    }, 2000);
  };

  return (
    <PageContainer>
      <AnimatedPageTitle title="图标展示" />
      
      {showToast && (
        <ToastMessage>
          已复制 &lt;Icon name="{copiedIcon}" /&gt;
        </ToastMessage>
      )}
      
      <ContentCard>
        <SearchBar 
          type="text"
          placeholder="🔍 搜索图标名称..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        <IconGrid>
          {filteredIcons.map(iconName => (
            <IconCard key={iconName} onClick={() => handleIconClick(iconName)}>
              <div className="icon-wrapper">
                <Icon name={iconName} />
              </div>
              <div className="icon-name">{iconName}</div>
            </IconCard>
          ))}
        </IconGrid>
        
        {filteredIcons.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(0,0,0,0.5)' }}>
            没有找到匹配的图标
          </div>
        )}
      </ContentCard>
    </PageContainer>
  );
};

export default IconShowcase;

