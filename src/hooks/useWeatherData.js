import { useState, useEffect } from 'react';
import { useEntity } from '@hakit/core';
import { DEFAULT_ENTITIES, WEATHER_ICONS } from '../config/entities';

export function useWeatherData(weatherEntity = DEFAULT_ENTITIES.weather) {
  const entity = useEntity(weatherEntity);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (entity) {
      setLoading(false);
      setError(null);
    } else {
      setError('Entité météo non trouvée');
      setLoading(false);
    }
  }, [entity]);

  const weatherData = entity
    ? {
        temperature: entity.state,
        condition: entity.attributes?.friendly_name || 'Unknown',
        conditionIcon: WEATHER_ICONS[entity.state] || '❓',
        humidity: entity.attributes?.humidity,
        windSpeed: entity.attributes?.wind_speed,
        lastUpdated: entity.last_updated,
      }
    : null;

  const formatTemperature = (temp, unit = '°C') => {
    if (temp === null || temp === undefined) return '--';
    return `${Math.round(temp)}${unit}`;
  };

  return {
    data: weatherData,
    entity,
    loading,
    error,
    formatTemperature,
  };
}
