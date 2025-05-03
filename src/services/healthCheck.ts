import axios from 'axios';
import logger from './logger';

/**
 * Check if the OpenWeatherMap API is accessible with the given API key
 * @returns Promise<boolean> - true if the API is accessible, false otherwise
 */
export const checkWeatherApiAccess = async (
  apiKey: string,
  baseUrl: string
): Promise<boolean> => {
  try {
    if (!apiKey) {
      logger.error('API key is not set. Weather data cannot be fetched.');
      return false;
    }

    // Check API access using a simple request
    const response = await axios.get(
      `${baseUrl}/weather?q=London&appid=${apiKey}&units=metric`
    );

    if (response.status === 200) {
      logger.info('Successfully connected to OpenWeatherMap API');
      return true;
    }
    
    logger.warn('Unexpected response from OpenWeatherMap API', { status: response.status });
    return false;
  } catch (error: any) {
    // Handle specific API key errors
    if (error.response && error.response.status === 401) {
      logger.error('Invalid API key for OpenWeatherMap. Please check your REACT_APP_WEATHER_API_KEY environment variable.');
      return false;
    }
    
    if (error.response && error.response.status === 429) {
      logger.error('API rate limit exceeded for OpenWeatherMap API');
      return false;
    }

    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      logger.error('Cannot connect to OpenWeatherMap API. Check your internet connection or if the service is down.', { error: error.message });
      return false;
    }

    logger.error('Error checking OpenWeatherMap API access', { 
      message: error.message,
      code: error.code
    });
    return false;
  }
};

/**
 * Initialize health checks for weather services
 */
export const initializeHealthChecks = async (
  apiKey: string,
  baseUrl: string
): Promise<void> => {
  logger.info('Initializing weather service health checks');
  const isApiAccessible = await checkWeatherApiAccess(apiKey, baseUrl);
  
  if (!isApiAccessible) {
    logger.warn('Weather data functionality may be limited or unavailable');
  }
};

export default {
  checkWeatherApiAccess,
  initializeHealthChecks,
}; 