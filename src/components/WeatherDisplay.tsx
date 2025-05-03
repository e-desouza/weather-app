import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { WeatherData } from '../services/weatherService';
import Lottie from 'lottie-react';

interface WeatherDisplayProps {
  weatherData: WeatherData | null;
  loading: boolean;
  error: string | null;
}

// Define spin animation keyframes
const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

// Map OpenWeatherMap icon codes to Lottie animation URLs
const mapWeatherCodeToAnimation = (iconCode: string): string => {
  const animationMap: { [key: string]: string } = {
    // Sunny / Clear
    '01d': 'https://assets5.lottiefiles.com/packages/lf20_jCJiDg.json',
    // Clear night
    '01n': 'https://assets5.lottiefiles.com/packages/lf20_ysduisv9.json',
    // Partly cloudy day
    '02d': 'https://assets10.lottiefiles.com/packages/lf20_bcdh66si.json',
    // Partly cloudy night
    '02n': 'https://assets3.lottiefiles.com/packages/lf20_inopkivk.json',
    // Cloudy day
    '03d': 'https://assets10.lottiefiles.com/packages/lf20_trr3kzyu.json',
    // Cloudy night
    '03n': 'https://assets10.lottiefiles.com/packages/lf20_trr3kzyu.json',
    // Overcast
    '04d': 'https://assets10.lottiefiles.com/packages/lf20_trr3kzyu.json',
    '04n': 'https://assets10.lottiefiles.com/packages/lf20_trr3kzyu.json',
    // Rain
    '09d': 'https://assets1.lottiefiles.com/temp/lf20_Kuot2e.json',
    '09n': 'https://assets1.lottiefiles.com/temp/lf20_Kuot2e.json',
    // Rain with sun
    '10d': 'https://assets3.lottiefiles.com/packages/lf20_jesgblam.json',
    '10n': 'https://assets1.lottiefiles.com/temp/lf20_Kuot2e.json',
    // Thunderstorm
    '11d': 'https://assets2.lottiefiles.com/packages/lf20_xydritrn.json',
    '11n': 'https://assets2.lottiefiles.com/packages/lf20_xydritrn.json',
    // Snow
    '13d': 'https://assets1.lottiefiles.com/packages/lf20_bfewftgq.json',
    '13n': 'https://assets1.lottiefiles.com/packages/lf20_bfewftgq.json',
    // Mist / Fog
    '50d': 'https://assets8.lottiefiles.com/packages/lf20_94jnuqwz.json',
    '50n': 'https://assets8.lottiefiles.com/packages/lf20_94jnuqwz.json',
  };
  
  return animationMap[iconCode] || animationMap['01d']; // Default to clear day if not found
};

const WeatherIcon = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 80px;
  width: 80px;
  margin: 0 auto;
`;

const AnimationLoader = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
`;

interface SpinnerProps {
  size: number;
}

const Spinner = styled.div<SpinnerProps>`
  width: ${props => props.size * 0.5}px;
  height: ${props => props.size * 0.5}px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #E1E1E1;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

// Props for Lottie weather icon
interface WeatherLottieProps {
  iconCode: string;
  size?: number;
}

const WeatherLottie: React.FC<WeatherLottieProps> = ({ iconCode, size = 80 }) => {
  const [animationData, setAnimationData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const animationUrl = mapWeatherCodeToAnimation(iconCode);
  
  useEffect(() => {
    setLoading(true);
    const fetchAnimation = async () => {
      try {
        const response = await fetch(animationUrl);
        const data = await response.json();
        setAnimationData(data);
      } catch (error) {
        console.error('Failed to fetch animation:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnimation();
  }, [animationUrl]);
  
  return (
    <div style={{ width: size, height: size }}>
      {loading && (
        <AnimationLoader>
          <Spinner size={size} />
        </AnimationLoader>
      )}
      {!loading && animationData && (
        <Lottie 
          animationData={animationData}
          loop={true}
          autoplay={true}
          style={{ width: '100%', height: '100%' }}
          rendererSettings={{
            preserveAspectRatio: 'xMidYMid slice'
          }}
        />
      )}
    </div>
  );
};

const Container = styled.div`
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: ${props => props.theme.spacing.lg};
`;

const WeatherCard = styled.div`
  background-color: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.lg};
  box-shadow: ${props => props.theme.shadows.md};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const LocationHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const LocationName = styled.h1`
  font-size: 28px;
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
`;

const CurrentWeather = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.lg};
  
  @media (max-width: 600px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const Temperature = styled.div`
  font-size: 48px;
  font-weight: bold;
  color: ${props => props.theme.colors.text.primary};
  margin-right: ${props => props.theme.spacing.lg};
`;

const WeatherInfo = styled.div`
  flex: 1;
`;

const WeatherDescription = styled.div`
  font-size: 24px;
  color: ${props => props.theme.colors.text.primary};
  text-transform: capitalize;
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const AdditionalInfo = styled.div`
  color: ${props => props.theme.colors.text.secondary};
  font-size: 16px;
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const ForecastContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: ${props => props.theme.spacing.md};
`;

const ForecastCard = styled.div`
  background-color: ${props => props.theme.colors.surface};
  padding: ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.md};
  text-align: center;
  box-shadow: ${props => props.theme.shadows.sm};
`;

const ForecastDay = styled.div`
  font-weight: bold;
  margin-bottom: ${props => props.theme.spacing.sm};
  color: ${props => props.theme.colors.text.primary};
`;

const ForecastTemp = styled.div`
  display: flex;
  justify-content: center;
  gap: ${props => props.theme.spacing.md};
  margin: ${props => props.theme.spacing.sm} 0;
`;

const MaxTemp = styled.span`
  color: ${props => props.theme.colors.text.primary};
`;

const MinTemp = styled.span`
  color: ${props => props.theme.colors.text.secondary};
`;

const Loading = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 20px;
  color: ${props => props.theme.colors.text.primary};
`;

const ErrorMessage = styled.div`
  color: ${props => props.theme.colors.error};
  padding: ${props => props.theme.spacing.md};
  background-color: rgba(207, 102, 121, 0.1);
  border-radius: ${props => props.theme.borderRadius.md};
  text-align: center;
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

const WeatherDisplay: React.FC<WeatherDisplayProps> = ({ weatherData, loading, error }) => {
  if (loading) {
    return <Loading>Loading weather data...</Loading>;
  }

  if (error) {
    return <ErrorMessage>{error}</ErrorMessage>;
  }

  if (!weatherData) {
    return null;
  }

  return (
    <Container>
      <WeatherCard>
        <LocationHeader>
          <LocationName>
            {weatherData.location.name}, {weatherData.location.country}
          </LocationName>
        </LocationHeader>
        
        <CurrentWeather>
          <Temperature>{Math.round(weatherData.current.temp)}°C</Temperature>
          <WeatherInfo>
            <WeatherDescription>
              <WeatherIcon>
                <WeatherLottie 
                  iconCode={weatherData.current.weather.icon}
                  size={80}
                />
              </WeatherIcon>
              {weatherData.current.weather.description}
            </WeatherDescription>
            <AdditionalInfo>Feels like: {Math.round(weatherData.current.feels_like)}°C</AdditionalInfo>
            <AdditionalInfo>Humidity: {weatherData.current.humidity}%</AdditionalInfo>
            <AdditionalInfo>Wind: {weatherData.current.wind_speed} m/s</AdditionalInfo>
          </WeatherInfo>
        </CurrentWeather>
      </WeatherCard>

      <h2 style={{ marginBottom: '16px', color: '#E1E1E1' }}>5-Day Forecast</h2>
      <ForecastContainer>
        {weatherData.forecast.map((day) => (
          <ForecastCard key={day.dt}>
            <ForecastDay>{formatDate(day.dt)}</ForecastDay>
            <WeatherIcon>
              <WeatherLottie 
                iconCode={day.weather.icon}
                size={50}
              />
            </WeatherIcon>
            <ForecastTemp>
              <MaxTemp>{Math.round(day.temp.max)}°</MaxTemp>
              <MinTemp>{Math.round(day.temp.min)}°</MinTemp>
            </ForecastTemp>
          </ForecastCard>
        ))}
      </ForecastContainer>
    </Container>
  );
};

export default WeatherDisplay; 