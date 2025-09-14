import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-toastify';
import styled, { keyframes, css } from 'styled-components';
import GlassCard from '../components/GlassCard';
import GlassButton from '../components/GlassButton';
import GlassInput from '../components/GlassInput';

// 动画定义
const fadeOut = keyframes`
  0% { opacity: 1; }
  100% { opacity: 0; }
`;

const zoomOut = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.8; }
  100% { transform: scale(0.95); opacity: 0; }
`;

const successPulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(72, 199, 116, 0.4); }
  70% { box-shadow: 0 0 0 20px rgba(72, 199, 116, 0); }
  100% { box-shadow: 0 0 0 0 rgba(72, 199, 116, 0); }
`;

// 页面容器
const PageContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  transition: all 0.8s ease;
  z-index: 100;
  background: transparent;
  
  &.fade-out {
    background: rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(5px);
  }
`;

// 登录容器
const LoginContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 70vh;
  transition: all 0.5s ease;
  
  &.fade-out {
    animation: ${zoomOut} 0.8s ease-out forwards;
  }
`;

// 卡片容器样式
const AnimatedCard = styled(GlassCard)<{ $isSuccess?: boolean }>`
  transition: all 0.3s ease;
  
  ${props => props.$isSuccess && css`
    animation: ${successPulse} 1s ease-in-out;
    border: 1px solid rgba(72, 199, 116, 0.6);
    box-shadow: 0 0 15px rgba(72, 199, 116, 0.4);
  `}
`;

const LoginForm = styled.form`
  width: 100%;
  max-width: 400px;
`;

const FormTitle = styled.h2`
  margin-bottom: 1.5rem;
  text-align: center;
  color: var(--text-color);
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const FormLabel = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-color);
`;

const FormError = styled.div`
  color: var(--error-color);
  font-size: 0.875rem;
  margin-top: 0.25rem;
`;

const FormActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 2rem;
`;

const LinksContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
  font-size: 0.875rem;
`;

// 登录组件
const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isFading, setIsFading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('请填写所有字段');
      return;
    }
    
    try {
      setError('');
      setLoading(true);
      await login(email, password);
      
      // 登录成功动画序列
      setIsSuccess(true);
      toast.success('登录成功');
      
      // 等待成功动画完成
      setTimeout(() => {
        // 开始淡出动画
        setIsFading(true);
        
        // 等待淡出动画完成后再刷新/跳转页面
        setTimeout(() => {
          if (from === '/') {
            window.location.href = '/';
          } else {
            window.location.reload();
            // 备用导航，理论上不会执行，因为页面会刷新
            navigate(from);
          }
        }, 800); // 与淡出动画时长相匹配
      }, 500); // 成功状态显示时间
      
    } catch (error) {
      setError('登录失败，请检查邮箱和密码');
      toast.error('登录失败');
      setLoading(false);
    }
  };
  
  return (
    <PageContainer className={isFading ? 'fade-out' : ''}>
      <LoginContainer className={isFading ? 'fade-out' : ''}>
        <AnimatedCard $isSuccess={isSuccess}>
          <LoginForm onSubmit={handleSubmit}>
            <FormTitle>登录</FormTitle>
            
            {error && <FormError>{error}</FormError>}
            
            <FormGroup>
              <FormLabel htmlFor="email">邮箱</FormLabel>
              <GlassInput
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="请输入邮箱"
                required
                fullWidth
                disabled={loading || isFading}
              />
            </FormGroup>
            
            <FormGroup>
              <FormLabel htmlFor="password">密码</FormLabel>
              <GlassInput
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码"
                required
                fullWidth
                disabled={loading || isFading}
              />
            </FormGroup>
            
            <FormActions>
              <GlassButton
                type="submit"
                disabled={loading || isFading}
                fullWidth
                variant={isSuccess ? "secondary" : "primary"}
              >
                {loading ? '登录中...' : isSuccess ? '登录成功' : '登录'}
              </GlassButton>
            </FormActions>
            
            <LinksContainer>
              <Link to="/" className={isFading ? 'disabled-link' : ''}>返回导入页面</Link>
              <Link to="/register" className={isFading ? 'disabled-link' : ''}>注册新账号</Link>
            </LinksContainer>
          </LoginForm>
        </AnimatedCard>
      </LoginContainer>
    </PageContainer>
  );
};

export default Login; 