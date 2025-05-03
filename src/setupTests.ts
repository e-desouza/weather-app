// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock environment variables
process.env.REACT_APP_WEATHER_API_KEY = 'test-api-key';
process.env.REACT_APP_LOG_LEVEL = '3';

// Mock fetch for Lottie animations
global.fetch = jest.fn(() => 
  Promise.resolve({
    json: () => Promise.resolve({}),
  } as Response)
);

// Mock geolocation API
const mockGeolocation = {
  getCurrentPosition: jest.fn().mockImplementation(success => 
    success({
      coords: {
        latitude: 40.7128,
        longitude: -74.0060
      }
    })
  ),
};

// @ts-ignore
global.navigator.geolocation = mockGeolocation;
