import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { theme } from '../../styles/theme';
import WeatherDisplay from '../WeatherDisplay';
import { WeatherData } from '../../services/weatherService';
import { act } from 'react-dom/test-utils';

// Mock Lottie component
jest.mock('lottie-react', () => {
  return {
    __esModule: true,
    default: () => <div data-testid="lottie-animation" />
  };
});

// Mock fetch function for animation data
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ animationData: 'mock-animation-data' }),
  } as Response)
);

// Helper to render with theme provider
const renderWithTheme = (ui: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {ui}
    </ThemeProvider>
  );
};

describe('WeatherDisplay Component', () => {
  // Mock weather data
  const mockWeatherData: WeatherData = {
    location: {
      name: 'New York',
      country: 'US',
    },
    current: {
      temp: 20.5,
      feels_like: 19.2,
      humidity: 65,
      wind_speed: 4.2,
      weather: {
        main: 'Clear',
        description: 'clear sky',
        icon: '01d',
      },
    },
    forecast: [
      {
        dt: 1625097600, // July 1, 2021
        temp: {
          day: 22.5,
          min: 17.8,
          max: 25.2,
        },
        weather: {
          main: 'Clear',
          description: 'clear sky',
          icon: '01d',
        },
      },
      {
        dt: 1625184000, // July 2, 2021
        temp: {
          day: 24.1,
          min: 18.5,
          max: 26.7,
        },
        weather: {
          main: 'Clouds',
          description: 'few clouds',
          icon: '02d',
        },
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders loading state', () => {
    renderWithTheme(
      <WeatherDisplay 
        weatherData={null}
        loading={true}
        error={null}
      />
    );

    expect(screen.getByText(/loading weather data/i)).toBeInTheDocument();
  });

  test('renders error message', () => {
    const errorMessage = 'Failed to fetch weather data';
    renderWithTheme(
      <WeatherDisplay 
        weatherData={null}
        loading={false}
        error={errorMessage}
      />
    );

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  test('renders weather data correctly', async () => {
    // Use act to handle asynchronous updates
    await act(async () => {
      renderWithTheme(
        <WeatherDisplay 
          weatherData={mockWeatherData}
          loading={false}
          error={null}
        />
      );
    });
    
    // Check location
    expect(screen.getByText(/new york, us/i)).toBeInTheDocument();
    
    // Check current weather
    expect(screen.getByText('21°C')).toBeInTheDocument(); // rounded from 20.5
    expect(screen.getByText(/clear sky/i)).toBeInTheDocument();
    expect(screen.getByText(/feels like: 19°C/i)).toBeInTheDocument();
    expect(screen.getByText(/humidity: 65%/i)).toBeInTheDocument();
    expect(screen.getByText(/wind: 4.2 m\/s/i)).toBeInTheDocument();
    
    // Check forecast section
    expect(screen.getByText(/5-day forecast/i)).toBeInTheDocument();
  });

  test('returns null when no data and not loading', () => {
    const { container } = renderWithTheme(
      <WeatherDisplay 
        weatherData={null}
        loading={false}
        error={null}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  test('renders forecast items correctly', async () => {
    await act(async () => {
      renderWithTheme(
        <WeatherDisplay 
          weatherData={mockWeatherData}
          loading={false}
          error={null}
        />
      );
    });

    // Format dates as they would appear in the component
    const date1 = new Date(1625097600 * 1000).toLocaleDateString('en-US', { 
      weekday: 'short', month: 'short', day: 'numeric' 
    });
    const date2 = new Date(1625184000 * 1000).toLocaleDateString('en-US', { 
      weekday: 'short', month: 'short', day: 'numeric' 
    });

    expect(screen.getByText(date1)).toBeInTheDocument();
    expect(screen.getByText(date2)).toBeInTheDocument();
    
    // Check temperatures (rounded)
    expect(screen.getByText('25°')).toBeInTheDocument(); // max temp for first day
    expect(screen.getByText('18°')).toBeInTheDocument(); // min temp for first day
    expect(screen.getByText('27°')).toBeInTheDocument(); // max temp for second day
    expect(screen.getByText('19°')).toBeInTheDocument(); // min temp for second day
  });
}); 