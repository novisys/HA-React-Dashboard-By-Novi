// Widget Météo Futuriste avec animations et effets visuels dynamiques
import React, { useState, useEffect, useRef } from 'react';
import { type EntityData } from '../../hooks/useAllEntities';

interface WeatherWidgetProps {
  weatherEntity: EntityData;
  temperatureEntity?: EntityData;
  humidityEntity?: EntityData;
  className?: string;
}

interface WeatherAnimation {
  background: string;
  particles: string;
  glow: string;
  textColor: string;
}

const WEATHER_ANIMATIONS: Record<string, WeatherAnimation> = {
  'sunny': {
    background: 'linear-gradient(135deg, #FFD700, #FFA500, #FF6B35)',
    particles: 'sunny-particles',
    glow: '#FFD700',
    textColor: '#2D1810'
  },
  'clear-night': {
    background: 'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)',
    particles: 'stars-particles',
    glow: '#4FC3F7',
    textColor: '#E3F2FD'
  },
  'cloudy': {
    background: 'linear-gradient(135deg, #607D8B, #78909C, #90A4AE)',
    particles: 'cloud-particles',
    glow: '#90A4AE',
    textColor: '#FFFFFF'
  },
  'rainy': {
    background: 'linear-gradient(135deg, #1565C0, #1976D2, #42A5F5)',
    particles: 'rain-particles',
    glow: '#42A5F5',
    textColor: '#E3F2FD'
  },
  'snowy': {
    background: 'linear-gradient(135deg, #E0E0E0, #F5F5F5, #FAFAFA)',
    particles: 'snow-particles',
    glow: '#E0E0E0',
    textColor: '#37474F'
  },
  'stormy': {
    background: 'linear-gradient(135deg, #263238, #37474F, #455A64)',
    particles: 'storm-particles',
    glow: '#FFD54F',
    textColor: '#E0E0E0'
  },
  'windy': {
    background: 'linear-gradient(135deg, #4CAF50, #66BB6A, #81C784)',
    particles: 'wind-particles',
    glow: '#66BB6A',
    textColor: '#1B5E20'
  },
  'foggy': {
    background: 'linear-gradient(135deg, #B0BEC5, #CFD8DC, #ECEFF1)',
    particles: 'fog-particles',
    glow: '#B0BEC5',
    textColor: '#37474F'
  }
};

export const FuturisticWeatherWidget: React.FC<WeatherWidgetProps> = ({
  weatherEntity,
  temperatureEntity,
  humidityEntity,
  className = ''
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isHovered, setIsHovered] = useState(false);
  const particlesRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  // Mise à jour de l'heure
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Détection du type de météo
  const getWeatherType = (state: string): string => {
    const lowerState = state.toLowerCase();
    
    if (lowerState.includes('sunny') || (lowerState.includes('clear') && isDay())) return 'sunny';
    if (lowerState.includes('clear') && !isDay()) return 'clear-night';
    if (lowerState.includes('rain') || lowerState.includes('drizzle') || lowerState.includes('shower')) return 'rainy';
    if (lowerState.includes('snow') || lowerState.includes('blizzard')) return 'snowy';
    if (lowerState.includes('storm') || lowerState.includes('thunder') || lowerState.includes('lightning')) return 'stormy';
    if (lowerState.includes('wind') || lowerState.includes('breezy')) return 'windy';
    if (lowerState.includes('fog') || lowerState.includes('mist') || lowerState.includes('haze')) return 'foggy';
    if (lowerState.includes('cloud') || lowerState.includes('overcast')) return 'cloudy';
    
    return 'cloudy'; // défaut
  };

  const isDay = () => {
    const hour = currentTime.getHours();
    return hour >= 6 && hour < 20;
  };

  const weatherType = getWeatherType(weatherEntity.state);
  const animation = WEATHER_ANIMATIONS[weatherType];
  
  const temperature = temperatureEntity ? Math.round(parseFloat(temperatureEntity.state)) : 
                     weatherEntity.attributes?.temperature ? Math.round(parseFloat(weatherEntity.attributes.temperature)) : null;
  const humidity = humidityEntity ? Math.round(parseFloat(humidityEntity.state)) :
                   weatherEntity.attributes?.humidity ? Math.round(parseFloat(weatherEntity.attributes.humidity)) : null;
  
  // Données de prévision (utilise les attributs si disponibles, sinon simule)
  const forecast = weatherEntity.attributes?.forecast?.slice(0, 5) || [
    { 
      datetime: new Date().toISOString(), 
      temperature: temperature || 22, 
      condition: weatherEntity.state,
      templow: (temperature || 22) - 5
    },
    { 
      datetime: new Date(Date.now() + 86400000).toISOString(), 
      temperature: (temperature || 22) + 2, 
      condition: 'sunny',
      templow: (temperature || 22) - 3
    },
    { 
      datetime: new Date(Date.now() + 172800000).toISOString(), 
      temperature: (temperature || 22) - 1, 
      condition: 'cloudy',
      templow: (temperature || 22) - 6
    },
    { 
      datetime: new Date(Date.now() + 259200000).toISOString(), 
      temperature: (temperature || 22) + 1, 
      condition: 'rainy',
      templow: (temperature || 22) - 4
    },
    { 
      datetime: new Date(Date.now() + 345600000).toISOString(), 
      temperature: (temperature || 22) - 2, 
      condition: 'sunny',
      templow: (temperature || 22) - 7
    }
  ];

  const getWeatherIcon = (condition: string) => {
    const conditionLower = condition.toLowerCase();
    if (conditionLower.includes('sunny') || (conditionLower.includes('clear') && isDay())) return '☀️';
    if (conditionLower.includes('clear') && !isDay()) return '🌙';
    if (conditionLower.includes('cloud')) return '☁️';
    if (conditionLower.includes('rain') || conditionLower.includes('shower')) return '🌧️';
    if (conditionLower.includes('snow')) return '❄️';
    if (conditionLower.includes('storm') || conditionLower.includes('thunder')) return '⛈️';
    if (conditionLower.includes('wind')) return '💨';
    if (conditionLower.includes('fog') || conditionLower.includes('mist')) return '🌫️';
    return '☁️';
  };

  const getDayName = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today.getTime() + 86400000);
    
    if (date.toDateString() === today.toDateString()) return "Aujourd'hui";
    if (date.toDateString() === tomorrow.toDateString()) return "Demain";
    
    return date.toLocaleDateString('fr-FR', { weekday: 'short' });
  };

  return (
    <div 
      className={`futuristic-weather-widget ${className} ${isHovered ? 'hovered' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Fond animé */}
      <div className="weather-background" />
      
      {/* Particules animées */}
      <div ref={particlesRef} className={`particles ${animation.particles}`}>
        {Array.from({ length: 25 }, (_, i) => (
          <div key={i} className="particle" />
        ))}
      </div>

      {/* Lueur dynamique */}
      <div ref={glowRef} className="dynamic-glow" />

      {/* Contenu principal */}
      <div className="weather-content">
        {/* En-tête avec heure */}
        <div className="weather-header">
          <div className="location-info">
            <span className="location">📍 {weatherEntity.attributes?.friendly_name || 'Maison'}</span>
            <span className="datetime">
              {currentTime.toLocaleDateString('fr-FR', { 
                weekday: 'long', 
                day: 'numeric',
                month: 'long'
              })}
            </span>
          </div>
          <div className="current-time">
            {currentTime.toLocaleTimeString('fr-FR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        </div>

        {/* Météo principale */}
        <div className="main-weather">
          <div className="weather-icon-large">
            {getWeatherIcon(weatherEntity.state)}
          </div>
          <div className="weather-info">
            <div className="temperature-display">
              <span className="temp-value">{temperature || '--'}°</span>
              <div className="temp-details">
                <span className="condition">{weatherEntity.state}</span>
                {humidity && (
                  <span className="humidity">💧 {humidity}%</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Graphique de température simulé */}
        <div className="temperature-chart">
          <div className="chart-line">
            <svg viewBox="0 0 300 60" className="temp-graph">
              <path 
                d={`M0,${40 + Math.sin(0) * 10} ${forecast.map((item, i) => 
                  `Q${(i + 0.5) * 60},${35 + Math.sin(i * 0.8) * 15} ${(i + 1) * 60},${40 + Math.sin((i + 1) * 0.8) * 10}`
                ).join(' ')}`}
                fill="none" 
                stroke="url(#tempGradient)" 
                strokeWidth="3"
                className="temp-line"
              />
              <defs>
                <linearGradient id="tempGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={animation.glow} stopOpacity="1"/>
                  <stop offset="50%" stopColor={animation.glow} stopOpacity="0.8"/>
                  <stop offset="100%" stopColor={animation.glow} stopOpacity="0.6"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Prévisions */}
        <div className="weather-forecast">
          {forecast.map((item, index) => (
            <div key={index} className="forecast-item">
              <span className="forecast-day">{getDayName(item.datetime)}</span>
              <span className="forecast-icon">{getWeatherIcon(item.condition)}</span>
              <span className="forecast-temp">{Math.round(item.temperature)}°</span>
            </div>
          ))}
        </div>

        {/* Infos supplémentaires */}
        <div className="weather-details">
          <div className="detail-item">
            <span className="detail-icon">🌡️</span>
            <span className="detail-label">Ressenti</span>
            <span className="detail-value">
              {weatherEntity.attributes?.apparent_temperature ? 
                Math.round(parseFloat(weatherEntity.attributes.apparent_temperature)) + '°' : 
                (temperature ? (temperature + 2) + '°' : '--')}
            </span>
          </div>
          <div className="detail-item">
            <span className="detail-icon">💨</span>
            <span className="detail-label">Vent</span>
            <span className="detail-value">
              {weatherEntity.attributes?.wind_speed ? 
                Math.round(parseFloat(weatherEntity.attributes.wind_speed)) + ' km/h' : 
                '12 km/h'}
            </span>
          </div>
          <div className="detail-item">
            <span className="detail-icon">👁️</span>
            <span className="detail-label">Visibilité</span>
            <span className="detail-value">
              {weatherEntity.attributes?.visibility ? 
                Math.round(parseFloat(weatherEntity.attributes.visibility)) + ' km' : 
                '10 km'}
            </span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .futuristic-weather-widget {
          position: relative;
          width: 100%;
          height: 400px;
          border-radius: 24px;
          overflow: hidden;
          background: ${animation.background};
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          color: ${animation.textColor};
        }

        .futuristic-weather-widget.hovered {
          transform: translateY(-8px);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
        }

        .weather-background {
          position: absolute;
          inset: 0;
          background: ${animation.background};
          opacity: 0.9;
          z-index: 1;
        }

        .particles {
          position: absolute;
          inset: 0;
          z-index: 2;
          overflow: hidden;
        }

        .particle {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
        }

        /* Particules soleil */
        .sunny-particles .particle {
          width: 4px;
          height: 4px;
          background: radial-gradient(circle, #FFD700, transparent);
          animation: float-sunny 8s infinite ease-in-out;
        }

        .sunny-particles .particle:nth-child(odd) {
          animation-delay: -2s;
          animation-duration: 6s;
        }

        /* Particules étoiles */
        .stars-particles .particle {
          width: 2px;
          height: 2px;
          background: #E3F2FD;
          animation: twinkle 4s infinite ease-in-out alternate;
          box-shadow: 0 0 6px #4FC3F7;
        }

        /* Particules nuages */
        .cloud-particles .particle {
          width: 8px;
          height: 5px;
          background: rgba(255, 255, 255, 0.6);
          border-radius: 10px;
          animation: float-cloud 12s infinite ease-in-out;
        }

        /* Particules pluie */
        .rain-particles .particle {
          width: 2px;
          height: 12px;
          background: linear-gradient(to bottom, #42A5F5, transparent);
          animation: rain-fall 2s infinite linear;
          border-radius: 1px;
        }

        /* Particules neige */
        .snow-particles .particle {
          width: 6px;
          height: 6px;
          background: #FFFFFF;
          animation: snow-fall 6s infinite linear;
          border-radius: 50%;
          box-shadow: 0 0 4px rgba(255, 255, 255, 0.8);
        }

        /* Particules orage */
        .storm-particles .particle {
          width: 3px;
          height: 3px;
          background: #FFD54F;
          animation: lightning-flash 3s infinite ease-in-out;
          box-shadow: 0 0 10px #FFD54F;
        }

        /* Particules vent */
        .wind-particles .particle {
          width: 6px;
          height: 2px;
          background: rgba(255, 255, 255, 0.4);
          border-radius: 3px;
          animation: wind-blow 4s infinite ease-in-out;
        }

        /* Particules brouillard */
        .fog-particles .particle {
          width: 12px;
          height: 8px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 20px;
          animation: fog-drift 10s infinite ease-in-out;
        }

        .dynamic-glow {
          position: absolute;
          inset: -20px;
          background: radial-gradient(circle at center, ${animation.glow}30, transparent 70%);
          animation: pulse-glow 6s infinite ease-in-out;
          z-index: 1;
        }

        .weather-content {
          position: relative;
          z-index: 10;
          padding: 24px;
          height: 100%;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .weather-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .location-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .location {
          font-size: 12px;
          opacity: 0.8;
          font-weight: 500;
        }

        .datetime {
          font-size: 14px;
          font-weight: 600;
          text-transform: capitalize;
        }

        .current-time {
          font-size: 18px;
          font-weight: 700;
          font-family: 'SF Mono', 'Monaco', 'Courier New', monospace;
          letter-spacing: 1px;
        }

        .main-weather {
          display: flex;
          align-items: center;
          gap: 20px;
          flex: 1;
        }

        .weather-icon-large {
          font-size: 64px;
          filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
          animation: float-icon 6s infinite ease-in-out;
        }

        .weather-info {
          flex: 1;
        }

        .temperature-display {
          display: flex;
          align-items: baseline;
          gap: 16px;
        }

        .temp-value {
          font-size: 72px;
          font-weight: 800;
          line-height: 1;
          text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        }

        .temp-details {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .condition {
          font-size: 16px;
          font-weight: 600;
          text-transform: capitalize;
        }

        .humidity {
          font-size: 14px;
          opacity: 0.8;
        }

        .temperature-chart {
          height: 50px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 8px;
          backdrop-filter: blur(10px);
        }

        .temp-graph {
          width: 100%;
          height: 100%;
        }

        .temp-line {
          animation: draw-line 3s ease-in-out;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
        }

        .weather-forecast {
          display: flex;
          justify-content: space-between;
          gap: 6px;
          background: rgba(255, 255, 255, 0.1);
          padding: 14px;
          border-radius: 16px;
          backdrop-filter: blur(10px);
        }

        .forecast-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          flex: 1;
          text-align: center;
        }

        .forecast-day {
          font-size: 11px;
          font-weight: 600;
          opacity: 0.8;
        }

        .forecast-icon {
          font-size: 20px;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
        }

        .forecast-temp {
          font-size: 14px;
          font-weight: 700;
        }

        .weather-details {
          display: flex;
          justify-content: space-between;
          gap: 12px;
        }

        .detail-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          flex: 1;
          background: rgba(255, 255, 255, 0.1);
          padding: 12px 8px;
          border-radius: 12px;
          backdrop-filter: blur(10px);
        }

        .detail-icon {
          font-size: 18px;
        }

        .detail-label {
          font-size: 10px;
          opacity: 0.7;
          font-weight: 500;
        }

        .detail-value {
          font-size: 13px;
          font-weight: 700;
        }

        /* Animations */
        @keyframes float-sunny {
          0%, 100% { 
            transform: translateY(100vh) translateX(0px) scale(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
            transform: scale(1);
          }
          90% {
            opacity: 1;
          }
          100% { 
            transform: translateY(-20px) translateX(20px) scale(0);
          }
        }

        @keyframes twinkle {
          0% { opacity: 0.3; transform: scale(0.8); }
          100% { opacity: 1; transform: scale(1.2); }
        }

        @keyframes float-cloud {
          0%, 100% { 
            transform: translateX(-100px) translateY(0px);
            opacity: 0.6;
          }
          50% { 
            transform: translateX(400px) translateY(-10px);
            opacity: 0.8;
          }
        }

        @keyframes rain-fall {
          0% { 
            transform: translateY(-20px) translateX(0);
            opacity: 0;
          }
          10% { opacity: 1; }
          100% { 
            transform: translateY(420px) translateX(-30px);
            opacity: 0.7;
          }
        }

        @keyframes snow-fall {
          0% { 
            transform: translateY(-20px) translateX(0) rotate(0deg);
            opacity: 0;
          }
          10% { opacity: 1; }
          100% { 
            transform: translateY(420px) translateX(-50px) rotate(360deg);
            opacity: 0.8;
          }
        }

        @keyframes lightning-flash {
          0%, 90%, 100% { opacity: 0; }
          5%, 85% { opacity: 1; }
        }

        @keyframes wind-blow {
          0% { 
            transform: translateX(-50px) translateY(0);
            opacity: 0;
          }
          50% { 
            transform: translateX(350px) translateY(-20px);
            opacity: 0.8;
          }
          100% { 
            transform: translateX(450px) translateY(-10px);
            opacity: 0;
          }
        }

        @keyframes fog-drift {
          0%, 100% { 
            transform: translateX(-20px) translateY(0);
            opacity: 0.3;
          }
          50% { 
            transform: translateX(300px) translateY(-5px);
            opacity: 0.6;
          }
        }

        @keyframes pulse-glow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.05); }
        }

        @keyframes float-icon {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        @keyframes draw-line {
          0% { stroke-dasharray: 0 1000; }
          100% { stroke-dasharray: 1000 0; }
        }

        /* Positionnement aléatoire des particules */
        ${Array.from({ length: 25 }, (_, i) => `
          .particle:nth-child(${i + 1}) {
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation-delay: ${Math.random() * 6}s;
          }
        `).join('\n')}

        /* Responsive Design */
        @media (max-width: 768px) {
          .futuristic-weather-widget {
            height: 350px;
          }
          
          .weather-content {
            padding: 16px;
            gap: 12px;
          }
          
          .temp-value {
            font-size: 56px;
          }
          
          .weather-icon-large {
            font-size: 48px;
          }
          
          .main-weather {
            gap: 12px;
          }
          
          .temperature-display {
            gap: 12px;
          }
          
          .weather-forecast {
            padding: 10px;
            gap: 4px;
          }
          
          .forecast-icon {
            font-size: 16px;
          }
          
          .detail-item {
            padding: 8px 6px;
          }
        }

        @media (max-width: 480px) {
          .weather-header {
            flex-direction: column;
            gap: 8px;
            text-align: center;
          }
          
          .main-weather {
            flex-direction: column;
            text-align: center;
            gap: 8px;
          }
          
          .temperature-display {
            flex-direction: column;
            align-items: center;
            gap: 8px;
          }
          
          .temp-value {
            font-size: 48px;
          }
        }
      `}</style>
    </div>
  );
};