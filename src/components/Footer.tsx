import React from 'react';
import styled from 'styled-components';

const FooterContainer = styled.footer`
  padding: 1rem 0;
  text-align: center;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  margin-top: 2rem;
`;

const FooterText = styled.p`
  margin: 0;
  font-weight: 500;
  letter-spacing: 1px;
`;

const Footer: React.FC = () => {
  return (
    <FooterContainer>
      <FooterText>YUEの课表</FooterText>
    </FooterContainer>
  );
};

export default Footer; 