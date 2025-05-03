import axios from 'axios';
import logger from './logger';
import { initializeHealthChecks } from './healthCheck';

// API configuration
const API_KEY = process.env.REACT_APP_WEATHER_API_KEY || '';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Service state
let isServiceInitialized = false;
let isApiAccessible = false;

/**
 * Initialize the weather service
 */
export const initializeWeatherService = async (): Promise<boolean> => {
  if (isServiceInitialized) {
    return isApiAccessible;
  }

  if (!API_KEY) {
    logger.error('OpenWeatherMap API key is not set. Please set REACT_APP_WEATHER_API_KEY environment variable.');
    isServiceInitialized = true;
    isApiAccessible = false;
    return false;
  }

  try {
    await initializeHealthChecks(API_KEY, BASE_URL);
    isServiceInitialized = true;
    isApiAccessible = true;
    logger.info('Weather service initialized successfully');
    return true;
  } catch (error) {
    isServiceInitialized = true;
    isApiAccessible = false;
    logger.error('Failed to initialize weather service', { error });
    return false;
  }
};

export interface WeatherData {
  location: {
    name: string;
    country: string;
  };
  current: {
    temp: number;
    feels_like: number;
    humidity: number;
    wind_speed: number;
    weather: {
      main: string;
      description: string;
      icon: string;
    };
  };
  forecast: Array<{
    dt: number;
    temp: {
      day: number;
      min: number;
      max: number;
    };
    weather: {
      main: string;
      description: string;
      icon: string;
    };
  }>;
}

// Helper function to group forecast data by day
const groupForecastByDay = (forecastList: any[]): any[] => {
  logger.debug('Grouping forecast data by day', { itemCount: forecastList.length });
  const dailyForecasts: Record<string, any> = {};
  
  forecastList.forEach((item) => {
    const date = new Date(item.dt * 1000);
    const day = date.toISOString().split('T')[0];
    
    if (!dailyForecasts[day]) {
      dailyForecasts[day] = {
        dt: item.dt,
        temps: [],
        weather: item.weather[0]
      };
    }
    
    dailyForecasts[day].temps.push(item.main.temp);
  });
  
  const result = Object.values(dailyForecasts).map((day: any) => ({
    dt: day.dt,
    temp: {
      day: day.temps.reduce((sum: number, temp: number) => sum + temp, 0) / day.temps.length,
      min: Math.min(...day.temps),
      max: Math.max(...day.temps),
    },
    weather: {
      main: day.weather.main,
      description: day.weather.description,
      icon: day.weather.icon,
    },
  })).slice(0, 5); // Limit to 5 days

  logger.debug('Forecast grouped successfully', { dayCount: result.length });
  return result;
};

/**
 * Validate service availability before making API calls
 */
const validateServiceAvailability = async (): Promise<void> => {
  if (!isServiceInitialized) {
    await initializeWeatherService();
  }

  if (!isApiAccessible) {
    throw new Error('Weather service is not available. Check API key and internet connection.');
  }
};

export const getWeatherByCoordinates = async (
  lat: number,
  lon: number
): Promise<WeatherData> => {
  try {
    await validateServiceAvailability();
    
    logger.info('Fetching weather data by coordinates', { lat, lon });
    
    const currentWeatherResponse = await axios.get(
      `${BASE_URL}/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
    );
    
    logger.debug('Current weather data received', { 
      city: currentWeatherResponse.data.name,
      status: currentWeatherResponse.status 
    });
    
    const forecastResponse = await axios.get(
      `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
    );
    
    logger.debug('Forecast data received', { 
      itemCount: forecastResponse.data.list.length,
      status: forecastResponse.status 
    });

    const dailyForecast = groupForecastByDay(forecastResponse.data.list);

    const result = {
      location: {
        name: currentWeatherResponse.data.name,
        country: currentWeatherResponse.data.sys.country,
      },
      current: {
        temp: currentWeatherResponse.data.main.temp,
        feels_like: currentWeatherResponse.data.main.feels_like,
        humidity: currentWeatherResponse.data.main.humidity,
        wind_speed: currentWeatherResponse.data.wind.speed,
        weather: {
          main: currentWeatherResponse.data.weather[0].main,
          description: currentWeatherResponse.data.weather[0].description,
          icon: currentWeatherResponse.data.weather[0].icon,
        },
      },
      forecast: dailyForecast,
    };

    logger.info('Weather data successfully retrieved for coordinates', { 
      location: `${result.location.name}, ${result.location.country}`,
      weather: result.current.weather.main
    });
    
    return result;
  } catch (error: any) {
    if (error.response) {
      if (error.response.status === 401) {
        logger.error('API key is invalid or expired');
        isApiAccessible = false;
      } else if (error.response.status === 429) {
        logger.error('API rate limit exceeded');
      } else {
        logger.error('Error response from weather API', { 
          status: error.response.status,
          data: error.response.data
        });
      }
    } else if (error.request) {
      logger.error('No response received from weather API', { 
        message: error.message
      });
    } else {
      logger.error('Error fetching weather data', { 
        message: error.message
      });
    }
    throw error;
  }
};

export const getWeatherByCity = async (city: string): Promise<WeatherData> => {
  try {
    await validateServiceAvailability();
    
    logger.info('Fetching weather data for city', { city });
    
    const geocodingResponse = await axios.get(
      `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${API_KEY}`
    );
    
    if (!geocodingResponse.data.length) {
      logger.warn('City not found', { city });
      throw new Error('City not found');
    }
    
    logger.debug('Geocoding data received', { 
      city,
      results: geocodingResponse.data.length
    });
    
    const { lat, lon } = geocodingResponse.data[0];
    return getWeatherByCoordinates(lat, lon);
  } catch (error: any) {
    // If it's not already a custom error from getWeatherByCoordinates
    if (!error.message.includes('Weather service')) {
      logger.error('Error fetching weather data for city', { 
        city,
        message: error.message
      });
    }
    throw error;
  }
};

export const getCurrentLocation = (): Promise<{ lat: number; lon: number }> => {
  return new Promise((resolve, reject) => {
    logger.info('Attempting to get current location');
    
    if (!navigator.geolocation) {
      const errorMsg = 'Geolocation is not supported by your browser';
      logger.error(errorMsg);
      reject(new Error(errorMsg));
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          };
          logger.info('Current location obtained successfully');
          logger.debug('Geolocation coordinates', coords);
          resolve(coords);
        },
        (error) => {
          logger.error('Failed to get current location', { 
            code: error.code,
            message: error.message
          });
          reject(error);
        }
      );
    }
  });
}; 