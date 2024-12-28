import styled from 'styled-components';
import logo from '../image.png';
import { Link, useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();

  return (
    <HeaderContainer>
      <LogoWrapper 
        onClick={() => {
          navigate('/');
        }
      }>
        <Logo src={logo} alt="Logo" />
      </LogoWrapper>
      <Link to='/profile'>
        <ProfileButton>Profile</ProfileButton>
      </Link>
    </HeaderContainer>
  );
};

const HeaderContainer = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background-color: #f0f0f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const LogoWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const Logo = styled.img`
  width: 100px; /* Можно настроить размер изображения */
  height: 100%;
  margin-right: 20px;
`;

const ProfileButton = styled.button`
  padding: 10px 20px;
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 30px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.3s ease;

  &:hover {
    background-color: #5a6268;
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(2px);
  }
`;

export default Header;
