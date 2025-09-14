import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-toastify';
import styled from 'styled-components';
import GlassCard from '../components/GlassCard';
import GlassButton from '../components/GlassButton';
import GlassInput from '../components/GlassInput';

const LoginContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 70vh;
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

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
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
      toast.success('登录成功');
      navigate(from);
    } catch (error) {
      setError('登录失败，请检查邮箱和密码');
      toast.error('登录失败');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <LoginContainer>
      <GlassCard>
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
            />
          </FormGroup>
          
          <FormActions>
            <GlassButton
              type="submit"
              disabled={loading}
              fullWidth
            >
              {loading ? '登录中...' : '登录'}
            </GlassButton>
          </FormActions>
          
          <LinksContainer>
            <Link to="/">返回导入页面</Link>
            <Link to="/register">注册新账号</Link>
          </LinksContainer>
        </LoginForm>
      </GlassCard>
    </LoginContainer>
  );
};

export default Login; 