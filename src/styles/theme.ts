import { createGlobalStyle } from 'styled-components';

export const theme = {
  colors: {
    background: '#121212',
    surface: '#1E1E1E',
    primary: '#BB86FC',
    secondary: '#03DAC6',
    text: {
      primary: '#E1E1E1',
      secondary: '#B0B0B0',
    },
    error: '#CF6679',
    disabled: '#424242',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    rounded: '50%',
  },
  shadows: {
    sm: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
    md: '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)',
    lg: '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)',
  },
};

export type Theme = typeof theme;

export const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: 'Roboto', 'Helvetica', 'Arial', sans-serif;
    background-color: ${theme.colors.background};
    color: ${theme.colors.text.primary};
    min-height: 100vh;
  }

  button {
    cursor: pointer;
    border: none;
    outline: none;
    background: none;
  }

  input {
    border: none;
    outline: none;
  }
`; 