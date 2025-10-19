import React from 'react';
import styled from 'styled-components';

const FooterContainer = styled.footer`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  padding: 0.8rem 0;
  text-align: center;
  font-size: 0.85rem;
  color: rgba(0, 0, 0, 0.6);
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(25px) saturate(180%);
  -webkit-backdrop-filter: blur(25px) saturate(180%);
  z-index: 1000;
  box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.05);
  border-top: 1px solid rgba(255, 255, 255, 0.5);
  
  @media (max-width: 768px) {
    padding: 0.6rem 0;
    font-size: 0.8rem;
    background: rgba(255, 255, 255, 0.6);
  }
`;

const FooterText = styled.p`
  margin: 0;
  font-weight: 600;
  letter-spacing: 0.5px;
  background: linear-gradient(90deg, #0A84FF, #64D2FF);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  
  @media (max-width: 768px) {
    font-weight: 500;
    letter-spacing: 0.3px;
  }
`;

const Footer: React.FC = () => {
  return (
    <FooterContainer>
      <FooterText>YUEの课表</FooterText>
    </FooterContainer>
  );
};

export default Footer; 