export const DEFAULT_ENTITIES = {
  // Météo
  weather: 'weather.chancelade',
  temperature: 'sensor.temperature_salon',
  humidity: 'sensor.humidity_salon',

  // Éclairage
  lightSalon: 'light.lumieres_salon',
  lightCuisine: 'light.lumieres_cuisine',

  // Climatisation
  thermostat: 'climate.thermostat_lcd',

  // Personnes
  person1: 'person.houssam',

  // Média
  mediaPlayer: 'media_player.apple_tv_4k',
};

export const ENTITY_DOMAINS = {
  WEATHER: 'weather',
  SENSOR: 'sensor',
  LIGHT: 'light',
  CLIMATE: 'climate',
  PERSON: 'person',
  MEDIA_PLAYER: 'media_player',
};
