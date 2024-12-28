import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import Header from '../components/Header';
import Footer from '../components/Footer';
import image from '../user_logo.jpg';
import api from '../utils/Api';
import { get_token } from '../utils/cookies';
import { useNavigate } from 'react-router-dom';

interface ProfilePageProps {
  handleLogOut: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ handleLogOut }) => {
  const [user, setUser] = useState<any>(undefined);
  const [orders, setOrders] = useState<any>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = get_token();
    if (!token) {
      return;
    }
    api.getCurrentUser(token)
      .then(data => {
        console.log(data);
        setUser(data);
      })
      .catch(err => {
        console.warn(err);
      });

    api.getOrders(token)
      .then(data => {
        console.log(data);
        setOrders(data);
      })
      .catch(err => {
        console.warn(err);
      });
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    };
    return date.toLocaleString('ru-RU', options);
  };

  if (!user) {
    return null;
  }

  return (
    <PageWrapper>
      <Header />
      <ProfilePageContainer>
        <ProfileSection>
          <ProfileImage src={image} alt="Profile" />
          <UserInfo>
            <UserName>{user.username}</UserName>
            <UserEmail>{user.email}</UserEmail>
            <UserRole>{user.role}</UserRole>
            <RegistrationDate>Дата регистрации: {formatDate(user.created_at)}</RegistrationDate>
          </UserInfo>
          <LogoutButton 
            onClick={() => {
              navigate('/');
              handleLogOut();
            }
          }>
            Выйти
          </LogoutButton>
          <BackToHomeButton
            onClick={() => {
              navigate('/');
            }}
          >
            Вернуться на главную
          </BackToHomeButton>
        </ProfileSection>

        <OrdersSection>
          <OrdersTitle>Мои заказы</OrdersTitle>
          <OrdersList>
            {orders.length === 0 ? (
              <p>No orders found.</p>
            ) : (
              orders.map((order: any, index: number) => (
                <OrderItem key={index}>
                  <OrderDetails>
                    <OrderTitle>{order.car_name}</OrderTitle>
                    <OrderPrice>{order.total_amount} ₽</OrderPrice>
                    <OrderDate>{order.order_date}</OrderDate>
                  </OrderDetails>
                  <ShipmentMethod>{order.shipment_method}</ShipmentMethod>
                </OrderItem>
              ))
            )}
          </OrdersList>
        </OrdersSection>
      </ProfilePageContainer>
      <Footer />
    </PageWrapper>
  );
};

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh; /* Задаем высоту всей страницы */
`;

const ProfilePageContainer = styled.div`
  display: flex;
  flex: 1; /* Этот блок будет занимать оставшееся пространство */
  padding: 20px;
  justify-content: space-between;
  overflow-y: auto;
`;

const ProfileSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const ProfileImage = styled.img`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 20px;
`;

const UserInfo = styled.div`
  text-align: center;
`;

const UserName = styled.h2`
  font-size: 24px;
  margin-bottom: 10px;
`;

const UserEmail = styled.p`
  font-size: 16px;
  margin-bottom: 5px;
`;

const UserRole = styled.p`
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 5px;
`;

const RegistrationDate = styled.p`
  font-size: 14px;
  color: #777;
`;

const OrdersSection = styled.div`
  flex: 2;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
`;

const OrdersTitle = styled.h3`
  font-size: 24px;
  margin-bottom: 20px;
  position: sticky;
  top: 0;
  background-color: #f9f9f9; /* Добавляем фон, чтобы текст не сливался с фоном */
  padding: 10px 0; /* Немного отступов для удобства */
  z-index: 1; /* Убедимся, что заголовок всегда поверх */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Легкая тень для выделения */
`;

const OrdersList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const OrderItem = styled.li`
  display: flex;
  justify-content: space-between;
  padding: 15px;
  margin-bottom: 10px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const OrderDetails = styled.div`
  flex: 1;
`;

const OrderTitle = styled.h4`
  font-size: 18px;
  margin: 0;
`;

const OrderPrice = styled.p`
  font-size: 16px;
  font-weight: bold;
`;

const OrderDate = styled.p`
  font-size: 14px;
  color: #777;
  text-align: right;
`;

const ShipmentMethod = styled.div`
  font-size: 14px;
  color: #007bff;
  font-weight: bold;
`;

const LogoutButton = styled.button`
  margin-top: 20px;
  padding: 10px 20px;
  font-size: 16px;
  background-color:rgb(204, 200, 200);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  &:hover {
    background-color:rgb(151, 151, 151);
  }
`;

const BackToHomeButton = styled.button`
  margin-top: 20px;
  padding: 10px 20px;
  font-size: 16px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  &:hover {
    background-color: #45a049;
  }
`;

export default ProfilePage;
