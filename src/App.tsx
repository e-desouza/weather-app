import React, { useState, useEffect } from 'react';
import { ThemeProvider } from 'styled-components';
import { theme, GlobalStyle } from './styles/theme';
import SearchBar from './components/SearchBar';
import WeatherDisplay from './components/WeatherDisplay';
import { 
  getWeatherByCity, 
  getWeatherByCoordinates, 
  getCurrentLocation, 
  WeatherData,
  initializeWeatherService
} from './services/weatherService';
import logger from './services/logger';

const App: React.FC = () => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isServiceAvailable, setIsServiceAvailable] = useState<boolean>(true);

  // Initialize the weather service on app startup
  useEffect(() => {
    const initService = async () => {
      try {
        logger.info('Initializing weather app');
        const isAvailable = await initializeWeatherService();
        setIsServiceAvailable(isAvailable);
        
        if (!isAvailable) {
          setError('Weather service is currently unavailable. Please check your API key or internet connection.');
          setLoading(false);
        } else {
          fetchWeatherByLocation();
        }
      } catch (err: any) {
        logger.error('Failed to initialize app', { error: err.message });
        setError('Weather service initialization failed. Please try again later.');
        setIsServiceAvailable(false);
        setLoading(false);
      }
    };
    
    initService();
  }, []);

  const fetchWeatherByCity = async (city: string) => {
    if (!isServiceAvailable) {
      setError('Weather service is currently unavailable. Please check your API key or internet connection.');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      logger.info('Fetching weather for city from UI', { city });
      const data = await getWeatherByCity(city);
      setWeatherData(data);
    } catch (err: any) {
      const errorMessage = err.message.includes('City not found') 
        ? `Could not find weather data for "${city}". Please check the city name and try again.`
        : err.message.includes('Weather service') 
          ? 'Weather service is currently unavailable. Please try again later.'
          : 'Failed to fetch weather data. Please try again.';
      
      setError(errorMessage);
      logger.error('Error in fetchWeatherByCity', { error: err.message });
    } finally {
      setLoading(false);
    }
  };

  const fetchWeatherByLocation = async () => {
    if (!isServiceAvailable) {
      setError('Weather service is currently unavailable. Please check your API key or internet connection.');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      logger.info('Fetching weather for current location from UI');
      const { lat, lon } = await getCurrentLocation();
      const data = await getWeatherByCoordinates(lat, lon);
      setWeatherData(data);
    } catch (err: any) {
      const errorMessage = err.code === 1
        ? 'Location access denied. Please enable location services or search by city.'
        : err.message.includes('Weather service') 
          ? 'Weather service is currently unavailable. Please try again later.'
          : 'Failed to get current location. Please search by city instead.';
      
      setError(errorMessage);
      logger.error('Error in fetchWeatherByLocation', { error: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <div className="App">
        <header style={{ 
          padding: '20px', 
          backgroundColor: theme.colors.surface, 
          textAlign: 'center',
          boxShadow: theme.shadows.md
        }}>
          <h1 style={{ color: theme.colors.text.primary, marginBottom: '20px' }}>
            Weather App
          </h1>
          <SearchBar 
            onSearch={fetchWeatherByCity}
            onLocationSearch={fetchWeatherByLocation}
            disabled={!isServiceAvailable}
          />
        </header>
        <main style={{ padding: '20px' }}>
          <WeatherDisplay 
            weatherData={weatherData}
            loading={loading}
            error={error}
          />
        </main>
      </div>
    </ThemeProvider>
  );
};

export default App;
