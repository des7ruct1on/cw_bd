import React, { useState } from 'react';
import styled from 'styled-components';

import Header from '../components/Header';
import Footer from '../components/Footer';

import logo from '../image.png';

import api from '../utils/Api';
import { useNavigate } from 'react-router-dom';

interface AuthPageProps {
  handleLogin: (token: string) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ handleLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLogin) {
      api.login(username, password)
        .then(data => {
          handleLogin(data.access_token);
          navigate('/');
        })
        .catch(error => {
          console.warn(error);
        });
    } else {
      api.register(username, password, email)
        .then(() => {
          
        })
        .catch(error => {
          console.warn(error);
        });
    }
  };

  const toggleForm = () => {
    setUsername('');
    setPassword('');
    setEmail('');
    setIsLogin(!isLogin);
  };

  return (
    <>
      <Header />
      <Container>
        <AuthBox>
          <Image src={logo} alt="Logo" />
          <Form onSubmit={handleSubmit}>
            <Input
              type="text"
              placeholder="Username"
              value={username}
              onChange={handleUsernameChange}
              required
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={handlePasswordChange}
              required
            />
            {!isLogin && (
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={handleEmailChange}
                required
              />
            )}
            <ButtonWrapper>
              <Button 
                type="submit"
                onSubmit={handleSubmit}
              >
                {isLogin ? 'Login': 'Register'}
              </Button>
              <SwitchButton type="button" onClick={toggleForm}>
                {isLogin ? 'Don\'t have an account? Register' : 'Already have an account? Login'}
              </SwitchButton>
            </ButtonWrapper>
          </Form>
        </AuthBox>
      </Container>
      <Footer />
    </>
  );
};

// Стили для страницы
const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f9f9f9;
`;

const AuthBox = styled.div`
  background-color: #f0f0f0;
  padding: 60px;
  border-radius: 12px;
  width: 100%;
  max-width: 600px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: box-shadow 0.3s ease;

  &:hover {
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
  }
`;

const Image = styled.img`
  width: 250px;
  margin-bottom: 40px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const Input = styled.input`
  padding: 14px;
  margin-bottom: 20px;
  border: 1px solid #ccc;
  border-radius: 30px;
  font-size: 16px;
  outline: none;
  box-shadow: inset 0 1px 4px rgba(0, 0, 0, 0.1);
  transition: border-color 0.3s ease, box-shadow 0.3s ease;

  &:focus {
    border-color: #007bff;
    box-shadow: inset 0 1px 4px rgba(0, 123, 255, 0.2);
  }
`;

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
`;

const Button = styled.button`
  padding: 14px;
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 30px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.3s ease;
  width: 48%;

  &:hover {
    background-color: #5a6268;
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(2px);
  }
`;

const SwitchButton = styled.button`
  padding: 10px;
  background-color: transparent;
  color: #007bff;
  border: none;
  font-size: 14px;
  cursor: pointer;
  text-decoration: underline;
  transition: color 0.3s ease;

  &:hover {
    color: #0056b3;
  }
`;

export default AuthPage;
