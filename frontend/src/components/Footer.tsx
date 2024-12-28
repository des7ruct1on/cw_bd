import React from 'react';
import styled from 'styled-components';

const Footer = () => {
  return (
    <FooterContainer>
      <FooterText>ULTRAGEDY CARS corp.</FooterText>
      <FooterText>2024 all rights reserved</FooterText>
    </FooterContainer>
  );
};

// Стили для Footer
const FooterContainer = styled.footer`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background-color: #f0f0f0;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
`;

const FooterText = styled.span`
  color: #6c757d;
  font-size: 14px;
`;

export default Footer;
