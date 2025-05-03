import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { theme } from '../../styles/theme';
import SearchBar from '../SearchBar';

// Helper to render with theme provider
const renderWithTheme = (ui: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {ui}
    </ThemeProvider>
  );
};

describe('SearchBar Component', () => {
  const mockSearch = jest.fn();
  const mockLocationSearch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders search input and buttons', () => {
    renderWithTheme(
      <SearchBar 
        onSearch={mockSearch} 
        onLocationSearch={mockLocationSearch} 
      />
    );

    expect(screen.getByPlaceholderText(/enter city name/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /current location/i })).toBeInTheDocument();
  });

  test('allows entering city name', () => {
    renderWithTheme(
      <SearchBar 
        onSearch={mockSearch} 
        onLocationSearch={mockLocationSearch} 
      />
    );

    const input = screen.getByPlaceholderText(/enter city name/i);
    fireEvent.change(input, { target: { value: 'London' } });
    
    expect(input).toHaveValue('London');
  });

  test('calls onSearch when form is submitted', () => {
    renderWithTheme(
      <SearchBar 
        onSearch={mockSearch} 
        onLocationSearch={mockLocationSearch} 
      />
    );

    const input = screen.getByPlaceholderText(/enter city name/i);
    fireEvent.change(input, { target: { value: 'London' } });
    
    const searchButton = screen.getByRole('button', { name: /search/i });
    fireEvent.click(searchButton);
    
    expect(mockSearch).toHaveBeenCalledWith('London');
  });

  test('calls onLocationSearch when location button is clicked', () => {
    renderWithTheme(
      <SearchBar 
        onSearch={mockSearch} 
        onLocationSearch={mockLocationSearch} 
      />
    );

    const locationButton = screen.getByRole('button', { name: /current location/i });
    fireEvent.click(locationButton);
    
    expect(mockLocationSearch).toHaveBeenCalled();
  });

  test('disables search functionality when disabled prop is true', () => {
    renderWithTheme(
      <SearchBar 
        onSearch={mockSearch} 
        onLocationSearch={mockLocationSearch}
        disabled={true}
      />
    );

    const input = screen.getByPlaceholderText(/weather service unavailable/i);
    expect(input).toBeDisabled();
    
    const searchButton = screen.getByRole('button', { name: /search/i });
    expect(searchButton).toBeDisabled();
    
    const locationButton = screen.getByRole('button', { name: /current location/i });
    expect(locationButton).toBeDisabled();
  });

  test('does not call onSearch with empty input', () => {
    renderWithTheme(
      <SearchBar 
        onSearch={mockSearch} 
        onLocationSearch={mockLocationSearch} 
      />
    );

    const searchButton = screen.getByRole('button', { name: /search/i });
    fireEvent.click(searchButton);
    
    expect(mockSearch).not.toHaveBeenCalled();
  });
}); 