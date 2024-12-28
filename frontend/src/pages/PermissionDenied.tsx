import React from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

const PermissionDenied: React.FC = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1); // Navigates back to the previous page
  };

  return (
    <Container>
      <Content>
        <Title>Access Denied</Title>
        <Message>Sorry, you don't have permission to access this page.</Message>
        <GoBackButton onClick={handleGoBack}>Go Back</GoBackButton>
      </Content>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f4f6f9;
  margin: 0;
`;

const Content = styled.div`
  text-align: center;
  padding: 40px 35px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
  max-width: 420px;
  width: 100%;
  animation: fadeIn 0.6s ease-out;
`;

const Title = styled.h1`
  font-size: 2.4em;
  margin-bottom: 18px;
  font-weight: 600;
  color: #2d3436;
  text-transform: uppercase;
`;

const Message = styled.p`
  font-size: 1.1em;
  margin-bottom: 30px;
  font-weight: 300;
  color: #636e72;
`;

const GoBackButton = styled.button`
  padding: 14px 28px;
  font-size: 1.1em;
  color: white;
  background-color: #0984e3;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease-in-out;
  letter-spacing: 1px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);

  &:hover {
    background-color: #74b9ff;
    transform: translateY(-3px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
  }

  &:focus {
    outline: none;
  }

  &:active {
    transform: translateY(1px);
  }
`;

const fadeIn = `
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

export default PermissionDenied;
