import React, { useState } from 'react';
import styled from 'styled-components';

import Header from '../components/Header';
import Footer from '../components/Footer';

import carImage from '../xxx.jpeg';
import loveImage from '../love.png'
import api from '../utils/Api';
import { Car } from '../types/Car';
import { useNavigate, useParams } from 'react-router-dom';
import { get_token } from '../utils/cookies';

interface CarPageProps {
  cars: Car[] | undefined;
  isAuthenticated: boolean;
}

const SHIPMENT_METHODS: { [key: number]: string } = {
  1: 'Self-pickup',
  2: 'To be confirmed later',
};

const CarPage: React.FC<CarPageProps> = ({ cars, isAuthenticated }) => {
  const navigate = useNavigate();
  const [shipmentMethodId, setShipmentMethodId] = useState<number | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { index } = useParams<{ index: string }>();
  const carIndex = index ? parseInt(index) : -1;

  if (carIndex == -1) {
    return null;
  }

  const car = cars ? cars[carIndex] : undefined;

  if (!car) {
    return null;
  }

  const handleOrderClick = () => {
    const token = get_token();
    if (!isAuthenticated || !token) {
      navigate('/auth');
      return;
    }
    if (shipmentMethodId === null) {
      alert('Please select a shipment method');
      return;
    }

    const shipmentMethodName = SHIPMENT_METHODS[shipmentMethodId];
    
    api.createOrder({
      car_name: car.product_name,
      shipment_method_name: shipmentMethodName,
    }, token)
      .then(data => {
        console.log(data);
        setIsModalVisible(true); 
        setShipmentMethodId(null);
      })
      .catch(err => {
        console.warn(err);
      });
  };

  const closeModal = () => {
    setIsModalVisible(false); // Закрыть модальное окно
  };

  return (
    <>
      <Header />
      <CarPageContainer>
        <ContentWrapper>
          <CarImageWrapper>
            <CarImage src={car.photo_url} alt={car.product_name} />
            <OrderButton onClick={handleOrderClick}>Order</OrderButton>
          </CarImageWrapper>
          <CarDescription>
            <CarTitle>{car.product_name}</CarTitle>
            <DescriptionText>{car.description}</DescriptionText>
            <ShipmentMethodContainer>
              <h3>Select Shipment Method:</h3>
              {Object.entries(SHIPMENT_METHODS).map(([id, method]) => (
                <Label key={id}>
                  <input
                    type="radio"
                    value={id}
                    checked={shipmentMethodId === Number(id)}
                    onChange={() => setShipmentMethodId(Number(id))}
                  />
                  {method}
                </Label>
              ))}
            </ShipmentMethodContainer>
          </CarDescription>
        </ContentWrapper>
      </CarPageContainer>
      <Footer />
      
      {/* Модальное окно с благодарностью */}
      {isModalVisible && (
        <ModalOverlay>
          <ModalContent>
            <img src={loveImage} alt="Логотип" style={{ width: '100px', marginBottom: '20px' }} />
            <h2>Спасибо за заказ!</h2>
            <p>Мы свяжемся с вами позже.</p>
            <CloseButton onClick={closeModal}>Закрыть</CloseButton>
          </ModalContent>
        </ModalOverlay>
      )}
    </>
  );
};

// Стили для CarPage
const CarPageContainer = styled.div`
  background-color: #f8f9fa;  
  min-height: calc(100vh - 160px); 
  display: flex;
  justify-content: center;
  padding: 20px 0; 
  overflow: hidden; 
`;

const ContentWrapper = styled.div`
  width: 100%;
  max-width: 1200px;
  background-color: #f0f0f0;  
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
`;

const CarImageWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 400px; 
  margin-bottom: 20px;
`;

const CarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
`;

const OrderButton = styled.button`
  position: absolute;
  bottom: 20px;
  right: 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 25px;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #0056b3;
  }
`;

const CarDescription = styled.div`
  width: 100%;
  padding: 20px;
  background-color: #f9f9f9; 
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  flex-grow: 1;
`;

const CarTitle = styled.h2`
  font-size: 28px;
  margin-bottom: 20px;
  color: #333333;
  text-align: center;
`;

const DescriptionText = styled.p`
  font-size: 18px;
  line-height: 1.8;
  color: #555555;
  margin-bottom: 20px;
  text-align: justify;
`;

const ShipmentMethodContainer = styled.div`
  margin-top: 20px;
  background-color: #ffffff;  
  border: 1px solid #dcdcdc;  
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Label = styled.label`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  font-size: 16px;
  cursor: pointer;

  input {
    margin-right: 10px;
  }
`;


// Стили для модального окна
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  animation: fadeIn 0.3s ease-in-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const ModalContent = styled.div`
  background: #ffffff;
  border-radius: 12px;
  padding: 50px; /* Увеличен padding */
  text-align: center;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
  width: 80%; /* Установите ширину относительно окна */
  max-width: 600px; /* Ограничьте максимальный размер */
  animation: scaleIn 0.2s ease-out forwards;

  @keyframes scaleIn {
    from {
      transform: scale(0.9);
    }
    to {
      transform: scale(1.0);
    }
  }

  h2 {
    font-size: 24px; /* Увеличенный размер текста */
    color: #333333;
    margin-bottom: 10px;
  }

  p {
    font-size: 18px; /* Увеличенный размер текста */
    color: #666666;
    margin-top: 10px;
  }
`;



const CloseButton = styled.button`
  margin-top: 20px;
  padding: 10px 20px;
  background-color: #28a745;
  color: #ffffff;
  font-size: 16px;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: #218838;
  }
`;

export default CarPage;
