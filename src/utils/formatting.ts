// formatting.ts corrigé avec types TypeScript

// Formatage des températures
export function formatTemperature(value: string | number | null | undefined, unit: string = '°C', precision: number = 1): string {
  if (value === null || value === undefined || value === '') return '--';

  const temp = parseFloat(value.toString());
  if (isNaN(temp)) return '--';

  return `${temp.toFixed(precision)}${unit}`;
}

// Formatage des pourcentages
export function formatPercentage(value: string | number | null | undefined, precision: number = 0): string {
  if (value === null || value === undefined || value === '') return '--';

  const percent = parseFloat(value.toString());
  if (isNaN(percent)) return '--';

  return `${percent.toFixed(precision)}%`;
}

// Formatage des dates
export function formatDateTime(dateString: string | Date | null | undefined, options: Partial<Intl.DateTimeFormatOptions> = {}): string {
  if (!dateString) return '--';

  const date = dateString instanceof Date ? dateString : new Date(dateString);
  if (isNaN(date.getTime())) return '--';

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };

  return date.toLocaleDateString('fr-FR', { ...defaultOptions, ...options });
}

// Formatage des états d'entités
export function formatEntityState(state: string | null | undefined, domain: string): string {
  if (!state) return '--';

  switch (domain) {
    case 'binary_sensor':
      return state === 'on' ? 'Activé' : 'Désactivé';
    case 'light':
    case 'switch':
      return state === 'on' ? 'Allumé' : 'Éteint';
    default:
      return state;
  }
}
