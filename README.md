# Weather App

A React TypeScript application with a dark theme that displays weather information based on location.

## Features

- Dark theme UI using styled-components
- Responsive design that works on mobile and desktop
- Current weather display with temperature, conditions, humidity, and wind speed
- 5-day weather forecast
- Search for weather by city name
- Geolocation support to get weather for current location
- High-quality animated weather icons using Lottie animations
- Comprehensive error handling and logging
- API health checks and validation
- Test coverage for components and services

## Setup and Installation

1. Clone the repository
2. Install dependencies:

   ```
   npm install
   ```

3. Get an API key from [OpenWeatherMap](https://openweathermap.org/api)
4. Create a `.env` file in the root directory with your API key:

   ```
   REACT_APP_WEATHER_API_KEY=your_openweathermap_api_key_here
   REACT_APP_LOG_LEVEL=3  # 0=ERROR, 1=WARN, 2=INFO, 3=DEBUG
   ```

   (You can use the `.env.example` file as a template)
5. Start the development server:

   ```
   npm start
   ```

## Environment Variables

This project uses environment variables to securely store API keys. The following variables are required:

- `REACT_APP_WEATHER_API_KEY`: Your OpenWeatherMap API key
- `REACT_APP_LOG_LEVEL`: (Optional) Set logging verbosity (0=ERROR, 1=WARN, 2=INFO, 3=DEBUG)

For development, you can create a `.env` file in the root directory of the project. For production deployment, set these environment variables in your hosting platform.

## API Key Validation

The application includes a built-in health check system that:

- Validates the API key on startup
- Tests connectivity to the OpenWeatherMap API
- Provides helpful error messages if the API is unavailable
- Gracefully degrades UI functionality when the API is unreachable

## Logging System

The application includes a comprehensive logging system that:

- Provides multiple logging levels (ERROR, WARN, INFO, DEBUG)
- Automatically adjusts verbosity based on environment (production vs development)
- Can be configured via environment variables
- Includes contextual information with each log entry
- Timestamps all log entries
- Can be extended to connect with external monitoring systems

## Testing

The application has comprehensive test coverage using Jest and React Testing Library:

### Component Tests

- Tests for all UI components under normal and error conditions
- Tests for component interactions and user events
- Tests for different prop and state combinations

### Service Tests

- Tests for API service functions with mocked responses
- Tests for error handling and edge cases
- Tests for data transformation logic

### Utility Tests

- Tests for logging functionality
- Tests for API health check system

To run the tests:

```
npm test
```

To run tests with coverage report:

```
npm test -- --coverage
```

## Technologies Used

- React 18
- TypeScript
- styled-components for styling
- Axios for API requests
- OpenWeatherMap API for weather data
- Lottie for high-quality weather animations
- Jest and React Testing Library for testing

## Project Structure

```
src/
├── components/
│   ├── SearchBar.tsx     # Search bar component with city search and geolocation
│   └── WeatherDisplay.tsx # Weather display component showing current and forecast
│   └── __tests__/             # Component tests
├── services/
│   ├── weatherService.ts # Service to fetch weather data from OpenWeatherMap
│   ├── healthCheck.ts    # API health checking and validation
│   ├── logger.ts         # Logging utility with multiple severity levels
│   └── __tests__/             # Service tests
├── styles/
│   ├── theme.ts          # Theme definitions and global styles
│   └── styled.d.ts       # Type definitions for styled-components
├── __tests__/                 # App-level tests
├── App.tsx               # Main application component
└── index.tsx             # Entry point
```

## Animations

The app uses Lottie animations for weather icons. These animations are dynamically loaded from LottieFiles CDN based on the weather condition code returned by the OpenWeatherMap API. The animations provide a more engaging and visually appealing user experience compared to static icons.

## API Usage

This app uses the following OpenWeatherMap API endpoints:

- Current Weather API
- Forecast API
- Geocoding API

## Development

To run the project in development mode:

```
npm start
```

To build for production:

```
npm run build
```

## Deployment

This project is set up for deployment on GitHub Pages:

```
npm run deploy
```

For other hosting platforms, make sure to set the `REACT_APP_WEATHER_API_KEY` environment variable in your hosting configuration.
