import axios from 'axios';
import {
  getWeatherByCity,
  getWeatherByCoordinates,
  getCurrentLocation,
  initializeWeatherService,
} from '../weatherService';
import * as healthCheck from '../healthCheck';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock healthCheck module
jest.mock('../healthCheck', () => ({
  initializeHealthChecks: jest.fn(),
}));

describe('Weather Service', () => {
  const mockCurrentWeatherResponse = {
    data: {
      name: 'London',
      sys: { country: 'GB' },
      main: {
        temp: 15,
        feels_like: 14,
        humidity: 70,
      },
      wind: { speed: 5 },
      weather: [
        {
          main: 'Clear',
          description: 'clear sky',
          icon: '01d',
        },
      ],
    },
  };

  const mockForecastResponse = {
    data: {
      list: [
        {
          dt: 1625097600, // July 1, 2021
          main: {
            temp: 20,
          },
          weather: [
            {
              main: 'Clear',
              description: 'clear sky',
              icon: '01d',
            },
          ],
        },
        {
          dt: 1625108400, // Still July 1, but later
          main: {
            temp: 22,
          },
          weather: [
            {
              main: 'Clear',
              description: 'clear sky',
              icon: '01d',
            },
          ],
        },
        {
          dt: 1625119200, // Still July 1, but even later
          main: {
            temp: 18,
          },
          weather: [
            {
              main: 'Clear',
              description: 'clear sky',
              icon: '01d',
            },
          ],
        },
        // Add more forecast entries for additional days
        {
          dt: 1625184000, // July 2, 2021
          main: {
            temp: 19,
          },
          weather: [
            {
              main: 'Clouds',
              description: 'few clouds',
              icon: '02d',
            },
          ],
        },
      ],
    },
  };

  const mockGeocodingResponse = {
    data: [
      {
        name: 'London',
        lat: 51.5074,
        lon: -0.1278,
        country: 'GB',
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Default successful responses
    mockedAxios.get.mockImplementation((url: string) => {
      if (url.includes('/weather')) {
        return Promise.resolve(mockCurrentWeatherResponse);
      } else if (url.includes('/forecast')) {
        return Promise.resolve(mockForecastResponse);
      } else if (url.includes('/geo/1.0/direct')) {
        return Promise.resolve(mockGeocodingResponse);
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });
  });

  test('initializeWeatherService initializes health checks and returns true on success', async () => {
    (healthCheck.initializeHealthChecks as jest.Mock).mockResolvedValue(undefined);
    
    const result = await initializeWeatherService();
    
    expect(healthCheck.initializeHealthChecks).toHaveBeenCalled();
    expect(result).toBe(true);
  });

  test('getWeatherByCoordinates fetches and formats weather data correctly', async () => {
    const result = await getWeatherByCoordinates(51.5074, -0.1278);
    
    // Check that axios was called with the right URLs
    expect(mockedAxios.get).toHaveBeenCalledWith(
      expect.stringContaining('/weather?lat=51.5074&lon=-0.1278')
    );
    expect(mockedAxios.get).toHaveBeenCalledWith(
      expect.stringContaining('/forecast?lat=51.5074&lon=-0.1278')
    );
    
    // Check that the data is formatted correctly
    expect(result.location.name).toBe('London');
    expect(result.location.country).toBe('GB');
    expect(result.current.temp).toBe(15);
    expect(result.current.feels_like).toBe(14);
    expect(result.current.humidity).toBe(70);
    expect(result.current.wind_speed).toBe(5);
    expect(result.current.weather.main).toBe('Clear');
    expect(result.current.weather.description).toBe('clear sky');
    expect(result.current.weather.icon).toBe('01d');
    
    // Check that forecast is grouped by day correctly
    expect(result.forecast.length).toBe(2); // Should combine entries for the same day
  });

  test('getWeatherByCity finds coordinates and gets weather', async () => {
    const result = await getWeatherByCity('London');
    
    // Check that geocoding was called
    expect(mockedAxios.get).toHaveBeenCalledWith(
      expect.stringContaining('/geo/1.0/direct?q=London')
    );
    
    // And then weather was fetched by coordinates
    expect(mockedAxios.get).toHaveBeenCalledWith(
      expect.stringContaining('/weather?lat=51.5074&lon=-0.1278')
    );
    
    // Check the result
    expect(result.location.name).toBe('London');
  });

  test('getWeatherByCity throws error when city not found', async () => {
    mockedAxios.get.mockImplementationOnce(() => Promise.resolve({ data: [] }));
    
    await expect(getWeatherByCity('NonExistentCity')).rejects.toThrow('City not found');
  });

  test('getCurrentLocation returns coordinates from geolocation API', async () => {
    // getCurrentLocation is tested in setupTests.ts with the mocked navigator.geolocation
    const result = await getCurrentLocation();
    
    expect(result.lat).toBe(40.7128); // From our mock in setupTests.ts
    expect(result.lon).toBe(-74.0060);
  });

  test('handles errors from API calls', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('API Error'));
    
    await expect(getWeatherByCoordinates(51.5074, -0.1278)).rejects.toThrow('API Error');
  });
}); 