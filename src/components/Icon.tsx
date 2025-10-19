/**
 * Lineicons 图标组件
 * 
 * 使用方法：<Icon name="calendar" size="lg" />
 */

import React from 'react';
import styled, { css } from 'styled-components';

interface IconProps {
  name: string;
  size?: 'sm' | 'md' | 'lg' | '16' | '32' | string;
  spin?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const IconWrapper = styled.i<{ $size?: string; $spin?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-style: normal;
  line-height: 1;
  vertical-align: middle;
  
  ${props => {
    switch (props.$size) {
      case 'sm':
        return css`font-size: 1rem;`;
      case 'md':
        return css`font-size: 1.25rem;`;
      case 'lg':
        return css`font-size: 1.75rem;`;
      case '16':
        return css`font-size: 16px;`;
      case '32':
        return css`font-size: 32px;`;
      default:
        return props.$size ? css`font-size: ${props.$size};` : css`font-size: 1.25rem;`;
    }
  }}
  
  ${props => props.$spin && css`
    animation: icon-spin 1s infinite linear;
    
    @keyframes icon-spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(359deg); }
    }
  `}
`;

/**
 * Lineicons 图标组件
 * 
 * @param name - 图标名称（不需要 lni- 前缀）
 * @param size - 图标大小 ('sm' | 'md' | 'lg' | '16' | '32')
 * @param spin - 是否旋转动画
 * @param className - 额外的CSS类名
 * @param style - 内联样式
 */
const Icon: React.FC<IconProps> = ({ name, size = 'md', spin = false, className, style }) => {
  const classes = ['lni', `lni-${name}`, className].filter(Boolean).join(' ');

  return <IconWrapper className={classes} style={style} $size={size} $spin={spin} />;
};

export default Icon;

/**
 * 常用图标名称参考：
 * 
 * 导航和界面：
 * - home: 主页
 * - grid: 网格/应用
 * - menu: 菜单
 * - close: 关闭
 * - arrow-left: 左箭头
 * - arrow-right: 右箭头
 * - chevron-left: 左尖括号
 * - chevron-right: 右尖括号
 * 
 * 文件和内容：
 * - calendar: 日历
 * - book: 书本
 * - graduation: 毕业帽
 * - file: 文件
 * - upload: 上传
 * - download: 下载
 * - folder: 文件夹
 * 
 * 用户和操作：
 * - user: 用户
 * - users: 多用户
 * - login: 登录
 * - exit: 退出
 * - checkmark: 勾选
 * - trash: 删除
 * - pencil: 编辑
 * - plus: 添加
 * 
 * 设置和工具：
 * - cog: 设置
 * - support: 支持
 * - question-circle: 问号
 * - information: 信息
 * 
 * 娱乐和生活：
 * - game: 游戏
 * - music: 音乐
 * - calculator: 计算器
 * - weather: 天气
 * - checkmark-circle: 完成
 * 
 * 社交和通信：
 * - envelope: 邮件
 * - comments: 评论
 * - mobile: 手机
 */

