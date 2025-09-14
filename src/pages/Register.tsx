import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-toastify';
import styled from 'styled-components';
import GlassCard from '../components/GlassCard';
import GlassButton from '../components/GlassButton';
import GlassInput from '../components/GlassInput';

const RegisterContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 70vh;
`;

const RegisterForm = styled.form`
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

const Register: React.FC = () => {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!displayName || !email || !password || !confirmPassword) {
      setError('请填写所有字段');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }
    
    try {
      setError('');
      setLoading(true);
      await register(email, password, displayName);
      toast.success('注册成功');
      navigate(from);
    } catch (error) {
      setError('注册失败，请检查邮箱是否已被注册');
      toast.error('注册失败');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <RegisterContainer>
      <GlassCard>
        <RegisterForm onSubmit={handleSubmit}>
          <FormTitle>注册</FormTitle>
          
          {error && <FormError>{error}</FormError>}
          
          <FormGroup>
            <FormLabel htmlFor="displayName">姓名</FormLabel>
            <GlassInput
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="请输入姓名"
              required
              fullWidth
            />
          </FormGroup>
          
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
          
          <FormGroup>
            <FormLabel htmlFor="confirmPassword">确认密码</FormLabel>
            <GlassInput
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="请再次输入密码"
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
              {loading ? '注册中...' : '注册'}
            </GlassButton>
          </FormActions>
          
          <LinksContainer>
            <Link to="/">返回导入页面</Link>
            <Link to="/login">已有账号？登录</Link>
          </LinksContainer>
        </RegisterForm>
      </GlassCard>
    </RegisterContainer>
  );
};

export default Register; 