import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom'; // Импортируем Link
import Header from '../components/Header';
import Footer from '../components/Footer';
import api from '../utils/Api';

import carGif from '../1KZP.gif';

import { Car } from '../types/Car';

interface CarsListPageProps {
  cars: Car[] | undefined;
}

const CarsListPage: React.FC<CarsListPageProps> = ({ cars }) => {
  if (!cars) {
    return <Loading>Loading cars...</Loading>; 
  }

  return (
    <>
      <Header />
      <GifSection>
        <GifBackground
          src={carGif}
          alt="Car Animation"
        />
      </GifSection>
      <CarsListContainer>
        {cars.map((car, index) => (
          <CarCard key={index} isEven={index % 2 === 0}>
            <Link to={`/car/${index}`} style={{ textDecoration: "none", height: "100%" }}>
              <CarImageWrapper isEven={index % 2 === 0}>
                <CarImage src={car.photo_url} alt={car.product_name} />
              </CarImageWrapper>
            </Link>
            <CarDetails isEven={index % 2 === 0}>
              <CarTitle>{car.product_name}</CarTitle>
              <DescriptionText>{car.description}</DescriptionText>
            </CarDetails>
          </CarCard>
        ))}
      </CarsListContainer>
      <Footer />
    </>
  );
};

const GifSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh; /* Высота на весь экран */
  width: 100vw; /* Ширина на весь экран */
  position: relative;
  overflow: hidden;
`;

const GifBackground = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover; /* Чтобы гифка заполняла контейнер */
  position: absolute; /* Абсолютное позиционирование для фона */
  top: 0;
  left: 0;
  z-index: 1; /* Для наложения текста поверх гифки */
`;

const Loading = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-size: 20px;
  color: #666;
`;


// Стили для CarsListPage
const CarsListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px; /* Отступы между карточками */
  padding: 20px;
  overflow-y: auto; /* Вертикальный скроллинг */
  height: calc(100vh - 160px); /* Высота, занимающая пространство между хедером и футером */
`;

const CarCard = styled.div<{ isEven: boolean }>`
  display: flex;
  flex-direction: ${({ isEven }) => (isEven ? 'row-reverse' : 'row')};
  background-color: #f0f0f0;
  border-radius: 12px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  padding: 30px;
  align-items: center;
  height: calc(50% - 20px); /* Каждая карточка занимает 50% высоты контейнера */
  margin-bottom: 20px; /* Отступ между карточками */
  transition: transform 0.3s ease, box-shadow 0.3s ease; /* Эффект при наведении */

  &:hover {
    transform: translateY(-10px); /* Подъем карточки при наведении */
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15); /* Увеличиваем тень */
  }
`;

const CarImageWrapper = styled.div<{ isEven: boolean }>`
  flex: 1;
  margin: ${({ isEven }) => (isEven ? '0 0 0 30px' : '0 30px 0 0')};
  max-width: 400px;
  height: 100%; /* Заставляем wrapper занимать всю высоту карточки */
  display: flex;
  justify-content: center;
  align-items: center; /* Центрируем изображение */
`;

const CarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover; /* Изображение обрезается, чтобы заполнить wrapper */
  border-radius: 8px;
  transition: transform 0.3s ease; /* Эффект увеличения при наведении */

  &:hover {
    transform: scale(1.05);
  }
`;

const CarDetails = styled.div<{ isEven: boolean }>`
  flex: 2;
  padding: 20px;
  background-color: transparent; /* Убираем белый фон */
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const CarTitle = styled.h3`
  font-size: 26px;
  margin-bottom: 10px;
  background-color: transparent; /* Убираем белый фон */
`;

const DescriptionText = styled.p`
  font-size: 18px;
  line-height: 1.6;
  flex-grow: 1;
  background-color: transparent; /* Убираем белый фон */
  
  /* Для многоточия при переполнении текста */
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3; /* Ограничиваем количество строк (3 строки) */
  overflow: hidden;
  text-overflow: ellipsis;
`;


export default CarsListPage;
