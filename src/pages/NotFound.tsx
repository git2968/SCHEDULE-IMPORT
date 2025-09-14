import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import GlassButton from '../components/GlassButton';

const NotFoundContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 70vh;
  text-align: center;
`;

const NotFoundTitle = styled.h1`
  font-size: 6rem;
  margin-bottom: 1rem;
  color: var(--primary-color);
`;

const NotFoundText = styled.p`
  font-size: 1.5rem;
  margin-bottom: 2rem;
  color: var(--text-color);
`;

const NotFound: React.FC = () => {
  return (
    <NotFoundContainer>
      <NotFoundTitle>404</NotFoundTitle>
      <NotFoundText>页面不存在</NotFoundText>
      <Link to="/">
        <GlassButton>返回首页</GlassButton>
      </Link>
    </NotFoundContainer>
  );
};

export default NotFound; 