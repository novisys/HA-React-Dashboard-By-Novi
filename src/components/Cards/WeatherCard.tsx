// WeatherCard.tsx - Solution complète (utilisation des données réelles)

import { useEntity } from '@hakit/core';
import BaseCard from './BaseCard';

function WeatherCard() {
  const weather = useEntity('weather.chancelade');

  // Valeurs par défaut si les données ne sont pas disponibles
  const temperature = weather?.attributes?.temperature || 'N/A';
  const weatherState = weather?.state || 'unknown';
  const humidity = weather?.attributes?.humidity || 'N/A';
  const windSpeed = weather?.attributes?.wind_speed || 'N/A';

  // Fonction pour obtenir l'emoji météo basé sur l'état
  const getWeatherEmoji = (state: string) => {
    switch (state.toLowerCase()) {
      case 'sunny':
      case 'clear':
        return '☀️';
      case 'cloudy':
      case 'overcast':
        return '☁️';
      case 'partlycloudy':
        return '🌤️';
      case 'rainy':
        return '🌧️';
      case 'snowy':
        return '❄️';
      default:
        return '🌤️';
    }
  };

  return (
    <BaseCard className='weather-card-large'>
      <div className='card-header'>
        <h2 className='card-title'>Weather Daily</h2>
        <div className='weather-time'>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}°</div>
      </div>

      <div className='weather-main'>
        <div className='weather-icons'>
          <span className='weather-icon'>{getWeatherEmoji(weatherState)}</span>
        </div>
      </div>

      <div className='weather-details'>
        <div className='forecast-section'>
          <h3>Chancelade</h3>
          <div className='temperature-large'>{temperature}°</div>
          <div className='weather-state'>{weatherState}</div>
        </div>

        <div className='forecast-section'>
          <h3>Conditions</h3>
          <div className='forecast-info'>
            <span>💧 Humidité: {humidity}%</span>
            <div className='forecast-meta'>
              <span>💨 Vent: {windSpeed} km/h</span>
              <span>📅 {new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className='weather-chart'>
          <svg viewBox='0 0 200 50' className='trend-svg'>
            <path d='M10,40 Q50,20 90,30 T170,25' stroke='rgba(255,255,255,0.8)' strokeWidth='2' fill='none' />
          </svg>
        </div>
      </div>
    </BaseCard>
  );
}

export default WeatherCard;

