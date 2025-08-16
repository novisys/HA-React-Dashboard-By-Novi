// helpers.ts corrigé avec types TypeScript

// Gestion des classes CSS
export function classNames(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

// Validation d'entité Home Assistant
export function isValidEntity(entityId: string): boolean {
  const entityRegex = /^[a-zA-Z_][a-zA-Z0-9_]*\.[a-zA-Z_][a-zA-Z0-9_]*$/;
  return entityRegex.test(entityId);
}

// Extraction du domaine d'une entité
export function getEntityDomain(entityId: string): string | null {
  if (!isValidEntity(entityId)) return null;
  return entityId.split('.')[0];
}

// Gestion du localStorage
export function getStorageItem<T = any>(key: string, fallback: T | null = null): T | null {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (error) {
    console.warn('Erreur localStorage:', error);
    return fallback;
  }
}

export function setStorageItem(key: string, value: any): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn('Erreur localStorage:', error);
    return false;
  }
}
