import axios from 'axios';
import { checkWeatherApiAccess, initializeHealthChecks } from '../healthCheck';
import logger from '../logger';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock logger
jest.mock('../logger', () => ({
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
}));

describe('Health Check Service', () => {
  const API_KEY = 'test-api-key';
  const BASE_URL = 'https://api.openweathermap.org/data/2.5';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('checkWeatherApiAccess returns true for successful API access', async () => {
    // Mock successful response
    mockedAxios.get.mockResolvedValueOnce({ status: 200, data: {} });
    
    const result = await checkWeatherApiAccess(API_KEY, BASE_URL);
    
    expect(result).toBe(true);
    expect(mockedAxios.get).toHaveBeenCalledWith(
      `${BASE_URL}/weather?q=London&appid=${API_KEY}&units=metric`
    );
    expect(logger.info).toHaveBeenCalledWith('Successfully connected to OpenWeatherMap API');
  });

  test('checkWeatherApiAccess returns false when API key is not set', async () => {
    const result = await checkWeatherApiAccess('', BASE_URL);
    
    expect(result).toBe(false);
    expect(logger.error).toHaveBeenCalledWith('API key is not set. Weather data cannot be fetched.');
    expect(mockedAxios.get).not.toHaveBeenCalled();
  });

  test('checkWeatherApiAccess handles 401 errors (invalid API key)', async () => {
    // Mock 401 error response
    mockedAxios.get.mockRejectedValueOnce({
      response: { status: 401 }
    });
    
    const result = await checkWeatherApiAccess(API_KEY, BASE_URL);
    
    expect(result).toBe(false);
    expect(logger.error).toHaveBeenCalledWith(
      'Invalid API key for OpenWeatherMap. Please check your REACT_APP_WEATHER_API_KEY environment variable.'
    );
  });

  test('checkWeatherApiAccess handles 429 errors (rate limit)', async () => {
    // Mock 429 error response
    mockedAxios.get.mockRejectedValueOnce({
      response: { status: 429 }
    });
    
    const result = await checkWeatherApiAccess(API_KEY, BASE_URL);
    
    expect(result).toBe(false);
    expect(logger.error).toHaveBeenCalledWith('API rate limit exceeded for OpenWeatherMap API');
  });

  test('checkWeatherApiAccess handles network errors', async () => {
    // Mock network error
    mockedAxios.get.mockRejectedValueOnce({
      code: 'ECONNREFUSED',
      message: 'Connection refused'
    });
    
    const result = await checkWeatherApiAccess(API_KEY, BASE_URL);
    
    expect(result).toBe(false);
    expect(logger.error).toHaveBeenCalledWith(
      'Cannot connect to OpenWeatherMap API. Check your internet connection or if the service is down.',
      { error: 'Connection refused' }
    );
  });

  test('checkWeatherApiAccess handles unexpected errors', async () => {
    // Mock generic error
    mockedAxios.get.mockRejectedValueOnce({
      message: 'Unknown error',
      code: 'UNKNOWN'
    });
    
    const result = await checkWeatherApiAccess(API_KEY, BASE_URL);
    
    expect(result).toBe(false);
    expect(logger.error).toHaveBeenCalledWith('Error checking OpenWeatherMap API access', {
      message: 'Unknown error',
      code: 'UNKNOWN'
    });
  });

  test('checkWeatherApiAccess handles unexpected response status', async () => {
    // Mock non-200 response
    mockedAxios.get.mockResolvedValueOnce({ status: 500, data: {} });
    
    const result = await checkWeatherApiAccess(API_KEY, BASE_URL);
    
    expect(result).toBe(false);
    expect(logger.warn).toHaveBeenCalledWith('Unexpected response from OpenWeatherMap API', { status: 500 });
  });

  test('initializeHealthChecks calls checkWeatherApiAccess and logs results', async () => {
    // Mock successful API check
    mockedAxios.get.mockResolvedValueOnce({ status: 200, data: {} });
    
    await initializeHealthChecks(API_KEY, BASE_URL);
    
    expect(logger.info).toHaveBeenCalledWith('Initializing weather service health checks');
    expect(mockedAxios.get).toHaveBeenCalledWith(
      `${BASE_URL}/weather?q=London&appid=${API_KEY}&units=metric`
    );
  });

  test('initializeHealthChecks handles failed health check', async () => {
    // Mock failed API check
    mockedAxios.get.mockRejectedValueOnce({
      response: { status: 401 }
    });
    
    await initializeHealthChecks(API_KEY, BASE_URL);
    
    expect(logger.warn).toHaveBeenCalledWith('Weather data functionality may be limited or unavailable');
  });
}); 