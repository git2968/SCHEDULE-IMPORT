import React from 'react';
import styled from 'styled-components';

const FooterContainer = styled.footer`
  position: fixed;  /* 固定定位 */
  bottom: 0;        /* 固定在底部 */
  left: 0;
  right: 0;
  width: 100%;
  padding: 1rem 0;
  text-align: center;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  z-index: 1000;    /* 确保在其他内容之上 */
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);  /* 添加上方阴影 */
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