// Widget de debug spécialisé pour identifier le problème météo
import React, { useState, useEffect } from 'react';
import { type EntityData } from '../../hooks/useAllEntities';

interface DebugWeatherWidgetProps {
  weatherEntity?: EntityData;
  temperatureEntity?: EntityData;  
  humidityEntity?: EntityData;
  allEntities: EntityData[];
  className?: string;
}

export const DebugWeatherWidget: React.FC<DebugWeatherWidgetProps> = ({
  weatherEntity,
  temperatureEntity,
  humidityEntity,
  allEntities,
  className = ''
}) => {
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    console.log('🔍 DEBUG WEATHER WIDGET');
    console.log('Weather Entity reçue:', weatherEntity);
    console.log('Toutes les entités météo disponibles:');
    
    const weatherEntities = allEntities.filter(e => e.domain === 'weather');
    weatherEntities.forEach(entity => {
      console.log(`- ${entity.entity_id}:`, entity);
    });

    const chanceladeEntity = allEntities.find(e => e.entity_id === 'weather.chancelade');
    console.log('Entité weather.chancelade trouvée:', chanceladeEntity);

    setDebugInfo({
      weatherEntityReceived: weatherEntity,
      allWeatherEntities: weatherEntities,
      chanceladeEntity,
      totalEntities: allEntities.length
    });
  }, [weatherEntity, allEntities]);

  // Forcer l'utilisation de weather.chancelade si pas d'entité fournie
  const actualWeatherEntity = weatherEntity || allEntities.find(e => e.entity_id === 'weather.chancelade');

  if (!actualWeatherEntity) {
    return (
      <div className="debug-widget-error">
        <h3>❌ DEBUG : Entité météo introuvable</h3>
        <div className="debug-info">
          <p><strong>Entités météo disponibles :</strong></p>
          {allEntities
            .filter(e => e.domain === 'weather')
            .map(entity => (
              <div key={entity.entity_id} className="entity-debug">
                <strong>{entity.entity_id}</strong>
                <br />
                État: {entity.state}
                <br />
                Nom: {entity.friendly_name}
              </div>
            ))}
        </div>
        <style jsx>{`
          .debug-widget-error {
            padding: 20px;
            background: #fff3cd;
            border: 2px solid #ffc107;
            border-radius: 8px;
            color: #856404;
          }
          .entity-debug {
            margin: 8px 0;
            padding: 8px;
            background: rgba(255,255,255,0.5);
            border-radius: 4px;
            font-size: 12px;
          }
        `}</style>
      </div>
    );
  }

  // Extraction des données
  const temperature = actualWeatherEntity.attributes?.temperature || 'N/A';
  const humidity = actualWeatherEntity.attributes?.humidity || 'N/A';
  const windSpeed = actualWeatherEntity.attributes?.wind_speed || 'N/A';
  const pressure = actualWeatherEntity.attributes?.pressure || 'N/A';

  return (
    <div className="debug-weather-widget">
      <div className="debug-header">
        <h3>🌦️ DEBUG MÉTÉO WIDGET</h3>
        <span className="status">✅ ENTITÉ TROUVÉE</span>
      </div>

      <div className="weather-main">
        <div className="weather-icon">
          {actualWeatherEntity.state === 'clear-night' ? '🌙' : 
           actualWeatherEntity.state.includes('sunny') ? '☀️' :
           actualWeatherEntity.state.includes('cloud') ? '☁️' :
           actualWeatherEntity.state.includes('rain') ? '🌧️' : '🌤️'}
        </div>
        <div className="weather-info">
          <div className="temp-main">{temperature}°</div>
          <div className="condition">{actualWeatherEntity.state}</div>
          <div className="location">📍 {actualWeatherEntity.attributes?.friendly_name || 'Chancelade'}</div>
        </div>
      </div>

      <div className="weather-details">
        <div className="detail">
          <span className="label">💧 Humidité</span>
          <span className="value">{humidity}%</span>
        </div>
        <div className="detail">
          <span className="label">💨 Vent</span>
          <span className="value">{windSpeed} km/h</span>
        </div>
        <div className="detail">
          <span className="label">🌡️ Pression</span>
          <span className="value">{pressure} hPa</span>
        </div>
      </div>

      <div className="debug-data">
        <h4>🔍 Données Debug</h4>
        <div className="debug-content">
          <p><strong>Entity ID:</strong> {actualWeatherEntity.entity_id}</p>
          <p><strong>État:</strong> {actualWeatherEntity.state}</p>
          <p><strong>Dernière MAJ:</strong> {new Date(actualWeatherEntity.last_updated).toLocaleString()}</p>
          
          <details>
            <summary>📋 Tous les attributs</summary>
            <pre>{JSON.stringify(actualWeatherEntity.attributes, null, 2)}</pre>
          </details>
        </div>
      </div>

      <style jsx>{`
        .debug-weather-widget {
          padding: 20px;
          background: linear-gradient(135deg, #1565C0, #42A5F5);
          color: white;
          border-radius: 16px;
          height: 100%;
          overflow-y: auto;
        }

        .debug-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .debug-header h3 {
          margin: 0;
          font-size: 16px;
        }

        .status {
          background: #28a745;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: bold;
        }

        .weather-main {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 20px;
        }

        .weather-icon {
          font-size: 48px;
        }

        .weather-info {
          flex: 1;
        }

        .temp-main {
          font-size: 36px;
          font-weight: bold;
          line-height: 1;
        }

        .condition {
          font-size: 14px;
          opacity: 0.9;
          text-transform: capitalize;
        }

        .location {
          font-size: 12px;
          opacity: 0.8;
          margin-top: 4px;
        }

        .weather-details {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
          background: rgba(255,255,255,0.1);
          padding: 16px;
          border-radius: 8px;
        }

        .detail {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }

        .label {
          font-size: 12px;
          opacity: 0.8;
        }

        .value {
          font-size: 14px;
          font-weight: bold;
        }

        .debug-data {
          background: rgba(0,0,0,0.2);
          padding: 16px;
          border-radius: 8px;
          font-size: 12px;
        }

        .debug-data h4 {
          margin: 0 0 12px 0;
          font-size: 14px;
        }

        .debug-content p {
          margin: 4px 0;
        }

        details {
          margin-top: 8px;
        }

        pre {
          background: rgba(0,0,0,0.3);
          padding: 8px;
          border-radius: 4px;
          font-size: 10px;
          overflow-x: auto;
          max-height: 200px;
        }

        summary {
          cursor: pointer;
          margin-bottom: 8px;
        }
      `}</style>
    </div>
  );
};