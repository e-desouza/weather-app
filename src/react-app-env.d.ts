/// <reference types="react-scripts" />

declare module 'react-animated-weather' {
  export interface ReactAnimatedWeatherProps {
    icon: string;
    color?: string;
    size?: number;
    animate?: boolean;
  }
  
  const ReactAnimatedWeather: React.FC<ReactAnimatedWeatherProps>;
  export default ReactAnimatedWeather;
}
