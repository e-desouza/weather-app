import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import App from '../App';
import * as weatherService from '../services/weatherService';

// Mock the WeatherDisplay and SearchBar components
jest.mock('../components/WeatherDisplay', () => {
  return {
    __esModule: true,
    default: (props: any) => (
      <div data-testid="weather-display">
        {props.loading && <div>Loading...</div>}
        {props.error && <div>{props.error}</div>}
        {props.weatherData && <div>Weather data loaded</div>}
      </div>
    ),
  };
});

jest.mock('../components/SearchBar', () => {
  return {
    __esModule: true,
    default: (props: any) => (
      <div data-testid="search-bar">
        <button onClick={() => props.onSearch('London')}>Search</button>
        <button onClick={props.onLocationSearch}>Location</button>
        {props.disabled && <span>Disabled</span>}
      </div>
    ),
  };
});

// Mock the weather service
jest.mock('../services/weatherService', () => {
  return {
    __esModule: true,
    initializeWeatherService: jest.fn(),
    getWeatherByCity: jest.fn(),
    getWeatherByCoordinates: jest.fn(),
    getCurrentLocation: jest.fn(),
  };
});

describe('App Component', () => {
  const mockWeatherData = {
    location: { name: 'London', country: 'GB' },
    current: {
      temp: 15,
      feels_like: 14,
      humidity: 70,
      wind_speed: 5,
      weather: { main: 'Clear', description: 'clear sky', icon: '01d' },
    },
    forecast: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (weatherService.initializeWeatherService as jest.Mock).mockResolvedValue(true);
    (weatherService.getWeatherByCoordinates as jest.Mock).mockResolvedValue(mockWeatherData);
    (weatherService.getWeatherByCity as jest.Mock).mockResolvedValue(mockWeatherData);
    (weatherService.getCurrentLocation as jest.Mock).mockResolvedValue({ lat: 51.5074, lon: -0.1278 });
  });

  test('initializes weather service on mount', async () => {
    render(<App />);
    
    await waitFor(() => {
      expect(weatherService.initializeWeatherService).toHaveBeenCalled();
    });
  });

  test('shows loading state initially', () => {
    render(<App />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('fetches weather by location on mount if service is available', async () => {
    render(<App />);
    
    await waitFor(() => {
      expect(weatherService.getCurrentLocation).toHaveBeenCalled();
      expect(weatherService.getWeatherByCoordinates).toHaveBeenCalled();
    });
  });

  test('fetches weather by city when search is triggered', async () => {
    render(<App />);
    
    // Wait for initialization
    await waitFor(() => {
      expect(weatherService.initializeWeatherService).toHaveBeenCalled();
    });
    
    // Click the search button in our mocked SearchBar
    await act(async () => {
      screen.getByText('Search').click();
    });
    
    await waitFor(() => {
      expect(weatherService.getWeatherByCity).toHaveBeenCalledWith('London');
    });
  });

  test('handles service unavailability', async () => {
    (weatherService.initializeWeatherService as jest.Mock).mockResolvedValue(false);
    
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText('Disabled')).toBeInTheDocument();
      expect(screen.getByText(/weather service is currently unavailable/i)).toBeInTheDocument();
    });
  });

  test('handles error from geolocation', async () => {
    (weatherService.getCurrentLocation as jest.Mock).mockRejectedValue({ code: 1, message: 'User denied Geolocation' });
    
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText(/location access denied/i)).toBeInTheDocument();
    });
  });

  test('handles error from weather service', async () => {
    (weatherService.getWeatherByCoordinates as jest.Mock).mockRejectedValue(new Error('API Error'));
    
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText(/failed to get current location/i)).toBeInTheDocument();
    });
  });
}); 