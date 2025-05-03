import React, { useState } from 'react';
import styled from 'styled-components';

interface SearchBarProps {
  onSearch: (city: string) => void;
  onLocationSearch: () => void;
  disabled?: boolean;
}

const SearchContainer = styled.div`
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  padding: ${props => props.theme.spacing.md};
  display: flex;
  flex-direction: row;
  gap: ${props => props.theme.spacing.md};
`;

interface InputProps {
  disabled?: boolean;
}

const SearchInput = styled.input<InputProps>`
  flex: 1;
  padding: ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.md};
  background-color: ${props => props.disabled 
    ? props.theme.colors.disabled 
    : props.theme.colors.surface};
  color: ${props => props.theme.colors.text.primary};
  font-size: 16px;
  opacity: ${props => props.disabled ? 0.7 : 1};
`;

interface ButtonProps {
  disabled?: boolean;
}

const Button = styled.button<ButtonProps>`
  padding: ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.md};
  background-color: ${props => props.disabled 
    ? props.theme.colors.disabled 
    : props.theme.colors.primary};
  color: ${props => props.theme.colors.text.primary};
  font-weight: bold;
  transition: background-color 0.2s ease;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? 0.7 : 1};

  &:hover {
    background-color: ${props => props.disabled 
      ? props.theme.colors.disabled 
      : props.theme.colors.secondary};
  }
`;

const LocationButton = styled(Button)`
  background-color: ${props => props.disabled 
    ? props.theme.colors.disabled 
    : props.theme.colors.secondary};
  
  &:hover {
    background-color: ${props => props.disabled 
      ? props.theme.colors.disabled 
      : props.theme.colors.primary};
  }
`;

const SearchBar: React.FC<SearchBarProps> = ({ 
  onSearch, 
  onLocationSearch, 
  disabled = false 
}) => {
  const [city, setCity] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (city.trim() && !disabled) {
      onSearch(city.trim());
    }
  };

  const handleLocationSearch = () => {
    if (!disabled) {
      onLocationSearch();
    }
  };

  return (
    <SearchContainer>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flex: 1, gap: '16px' }}>
        <SearchInput
          type="text"
          placeholder={disabled ? "Weather service unavailable..." : "Enter city name..."}
          value={city}
          onChange={(e) => setCity(e.target.value)}
          disabled={disabled}
        />
        <Button type="submit" disabled={disabled}>Search</Button>
        <LocationButton type="button" onClick={handleLocationSearch} disabled={disabled}>
          <span role="img" aria-label="Current Location">📍</span>
        </LocationButton>
      </form>
    </SearchContainer>
  );
};

export default SearchBar; 