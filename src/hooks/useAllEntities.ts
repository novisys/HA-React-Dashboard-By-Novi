// useAllEntities.ts - Version avec logs optimisés
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useHomeAssistantWebSocket } from './useHomeAssistantWebSocket';

// ✅ Configuration des logs
const LOG_CONFIG = {
  enableEntityUpdates: false,        // ❌ Désactive logs changements entités 
  enableDebugLogs: false,           // ❌ Désactive logs debug général
  enableImportantLogs: true,        // ✅ Garde logs importants (erreurs, connexions)
  enablePerformanceLogs: false,     // ❌ Désactive logs performance
  logOnlyImportantDomains: ['weather', 'alarm_control_panel', 'lock'], // ✅ Seulement domaines critiques
  maxLogsPerMinute: 5              // ✅ Limite logs par minute
};

// Rate limiting pour les logs
class LogRateLimiter {
  private logs: number[] = [];
  
  canLog(): boolean {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    
    // Nettoyer les anciens logs
    this.logs = this.logs.filter(timestamp => timestamp > oneMinuteAgo);
    
    if (this.logs.length >= LOG_CONFIG.maxLogsPerMinute) {
      return false;
    }
    
    this.logs.push(now);
    return true;
  }
}

const logLimiter = new LogRateLimiter();

// Logger optimisé
const optimizedLog = {
  info: (message: string, data?: any) => {
    if (LOG_CONFIG.enableImportantLogs && logLimiter.canLog()) {
      console.log(`🏠 ${message}`, data || '');
    }
  },
  error: (message: string, data?: any) => {
    if (LOG_CONFIG.enableImportantLogs) {
      console.error(`❌ ${message}`, data || '');
    }
  },
  debug: (message: string, data?: any) => {
    if (LOG_CONFIG.enableDebugLogs && logLimiter.canLog()) {
      console.log(`🔍 ${message}`, data || '');
    }
  },
  entity: (entityId: string, oldState: string, newState: string) => {
    if (!LOG_CONFIG.enableEntityUpdates) return;
    
    const domain = entityId.split('.')[0];
    if (LOG_CONFIG.logOnlyImportantDomains.includes(domain) && logLimiter.canLog()) {
      console.log(`🔄 ${entityId}: ${oldState} → ${newState}`);
    }
  },
  performance: (message: string, data?: any) => {
    if (LOG_CONFIG.enablePerformanceLogs && logLimiter.canLog()) {
      console.log(`⚡ ${message}`, data || '');
    }
  }
};

export interface EntityData {
  entity_id: string;
  state: string;
  attributes: Record<string, any>;
  domain: string;
  friendly_name: string;
  last_changed: string;
  last_updated: string;
}

export interface UseAllEntitiesReturn {
  entities: EntityData[];
  entitiesByDomain: Record<string, EntityData[]>;
  loading: boolean;
  error: string | null;
  refreshEntities: () => void;
  wsConnected: boolean;
  wsConnecting: boolean;
  wsError: string | null;
  wsMessageCount: number;
  realtimeUpdates: number;
  lastUpdate: Date | null;
  wsConnectionAttempts: number;
  wsPermanentlyDisabled: boolean;
}

const HA_URL = 'http://192.168.0.42:8123';
const HA_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiI2OTdkMjg4NzIyYTc0NGI0OWZlY2Y2ZTI5YmI2OTI1YyIsImlhdCI6MTc1NTIwODE3NCwiZXhwIjoyMDcwNTY4MTc0fQ.bBBHijZ0RdzRvALatqdHb-zdBpHwCA-i801Kp3fGjoU';

export const useAllEntities = (): UseAllEntitiesReturn => {
  const [entities, setEntities] = useState<EntityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [realtimeUpdates, setRealtimeUpdates] = useState(0);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  
  // ✅ Refs pour éviter les blocages
  const hasInitialLoadStarted = useRef(false);
  const isCurrentlyLoading = useRef(false);
  const entitiesMapRef = useRef<Map<string, EntityData>>(new Map());
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const statsRef = useRef({ totalUpdates: 0, importantUpdates: 0 });

  // ✅ Hook WebSocket
  const {
    connected: wsConnected,
    connecting: wsConnecting,
    error: wsError,
    messageCount: wsMessageCount,
    connectionAttempts: wsConnectionAttempts,
    permanentlyDisabled: wsPermanentlyDisabled,
    subscribe,
    getStates,
    resetCircuitBreaker
  } = useHomeAssistantWebSocket();

  // ✅ Conversion optimisée
  const convertToEntityData = useCallback((rawState: any): EntityData => {
    return {
      entity_id: rawState.entity_id,
      state: rawState.state,
      attributes: rawState.attributes || {},
      domain: rawState.entity_id.split('.')[0],
      friendly_name: rawState.attributes?.friendly_name || rawState.entity_id,
      last_changed: rawState.last_changed,
      last_updated: rawState.last_updated
    };
  }, []);

  // ✅ Chargement sans spam de logs
  const fetchEntities = useCallback(async (forceRefresh: boolean = false) => {
    if (isCurrentlyLoading.current && !forceRefresh) {
      return;
    }

    optimizedLog.debug('Début fetchEntities', { forceRefresh, wsConnected });
    
    isCurrentlyLoading.current = true;
    setLoading(true);
    setError(null);

    try {
      let states;

      if (wsConnected) {
        states = await getStates();
        optimizedLog.performance('Entités récupérées via WebSocket');
      } else {
        const response = await fetch(`${HA_URL}/api/states`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${HA_TOKEN}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        states = await response.json();
        optimizedLog.performance('Entités récupérées via API REST');
      }

      if (!Array.isArray(states)) {
        throw new Error('Format de données invalide reçu de Home Assistant');
      }

      const newEntitiesMap = new Map<string, EntityData>();
      const entityData: EntityData[] = [];

      states.forEach((state: any) => {
        if (state && state.entity_id) {
          const entity = convertToEntityData(state);
          newEntitiesMap.set(entity.entity_id, entity);
          entityData.push(entity);
        }
      });

      entitiesMapRef.current = newEntitiesMap;
      setEntities(entityData);
      setLastUpdate(new Date());
      hasInitialLoadStarted.current = true;
      
      // ✅ Log réduit
      const source = wsConnected ? 'WebSocket' : 'API REST';
      optimizedLog.info(`${entityData.length} entités chargées via ${source}`);
      
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch entities';
      setError(errorMsg);
      optimizedLog.error('Erreur récupération entités', errorMsg);
      
      if (wsConnected && errorMsg.includes('WebSocket')) {
        setTimeout(() => {
          resetCircuitBreaker();
        }, 10000);
      }
    } finally {
      setLoading(false);
      isCurrentlyLoading.current = false;
    }
  }, [wsConnected, getStates, convertToEntityData, resetCircuitBreaker]);

  // ✅ Gestion des mises à jour temps réel SANS SPAM
  useEffect(() => {
    if (!wsConnected || !hasInitialLoadStarted.current) return;

    optimizedLog.info('Écoute changements temps réel activée');

    const unsubscribe = subscribe('state_changed', (eventData) => {
      const { entity_id, new_state, old_state } = eventData.data;
      
      statsRef.current.totalUpdates++;
      
      if (!new_state) {
        setEntities(prev => {
          const filtered = prev.filter(entity => entity.entity_id !== entity_id);
          entitiesMapRef.current.delete(entity_id);
          optimizedLog.debug(`Entité supprimée: ${entity_id}`);
          return filtered;
        });
      } else {
        const updatedEntity = convertToEntityData(new_state);
        
        const currentEntity = entitiesMapRef.current.get(entity_id);
        const hasStateChanged = !currentEntity || 
          currentEntity.state !== updatedEntity.state ||
          currentEntity.last_updated !== updatedEntity.last_updated;

        if (hasStateChanged) {
          // ✅ Log seulement pour les domaines importants
          if (old_state?.state !== new_state.state) {
            statsRef.current.importantUpdates++;
            optimizedLog.entity(entity_id, old_state?.state || 'unknown', new_state.state);
          }

          setEntities(prev => {
            const existingIndex = prev.findIndex(entity => entity.entity_id === entity_id);
            
            if (existingIndex >= 0) {
              const newEntities = [...prev];
              newEntities[existingIndex] = updatedEntity;
              entitiesMapRef.current.set(entity_id, updatedEntity);
              return newEntities;
            } else {
              entitiesMapRef.current.set(entity_id, updatedEntity);
              return [...prev, updatedEntity];
            }
          });

          setRealtimeUpdates(prev => prev + 1);
          setLastUpdate(new Date());
        }
      }
    });

    return unsubscribe;
  }, [wsConnected, subscribe, convertToEntityData]);

  // ✅ Chargement initial
  useEffect(() => {
    if (!hasInitialLoadStarted.current) {
      optimizedLog.info('🚀 Démarrage chargement initial Home Assistant');
      const timer = setTimeout(() => {
        fetchEntities(true);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [fetchEntities]);

  // ✅ Retry automatique
  useEffect(() => {
    if (wsConnected && entities.length === 0 && !loading && !isCurrentlyLoading.current) {
      optimizedLog.info('🔄 WebSocket connecté - Retry chargement');
      fetchEntities(true);
    }
  }, [wsConnected, entities.length, loading, fetchEntities]);

  // ✅ Logs de statut périodiques (réduits)
  useEffect(() => {
    const interval = setInterval(() => {
      if (LOG_CONFIG.enablePerformanceLogs && statsRef.current.totalUpdates > 0) {
        optimizedLog.performance('Stats mises à jour', {
          total: statsRef.current.totalUpdates,
          important: statsRef.current.importantUpdates,
          entities: entities.length,
          wsConnected
        });
        
        // Reset stats
        statsRef.current = { totalUpdates: 0, importantUpdates: 0 };
      }
    }, 60000); // Toutes les minutes seulement

    return () => clearInterval(interval);
  }, [entities.length, wsConnected]);

  // ✅ Polling de fallback
  useEffect(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }

    if (!wsConnected && !wsConnecting && !wsPermanentlyDisabled && entities.length > 0) {
      optimizedLog.info('⏰ Mode polling activé (WebSocket indisponible)');
      
      pollingIntervalRef.current = setInterval(() => {
        if (!wsConnected && !isCurrentlyLoading.current) {
          fetchEntities(false);
        }
      }, 30000);

      return () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
      };
    }
  }, [wsConnected, wsConnecting, wsPermanentlyDisabled, entities.length, fetchEntities]);

  // ✅ Groupement par domaine avec useMemo
  const entitiesByDomain = useMemo(() => {
    return entities.reduce((acc, entity) => {
      if (!acc[entity.domain]) {
        acc[entity.domain] = [];
      }
      acc[entity.domain].push(entity);
      return acc;
    }, {} as Record<string, EntityData[]>);
  }, [entities]);

  // ✅ Fonction de refresh
  const refreshEntities = useCallback(() => {
    optimizedLog.info('🔄 Refresh manuel demandé');
    fetchEntities(true);
  }, [fetchEntities]);

  // Nettoyage au démontage
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      isCurrentlyLoading.current = false;
    };
  }, []);

  return {
    entities,
    entitiesByDomain,
    loading,
    error,
    refreshEntities,
    wsConnected,
    wsConnecting,
    wsError,
    wsMessageCount,
    realtimeUpdates,
    lastUpdate,
    wsConnectionAttempts,
    wsPermanentlyDisabled
  };
};

// ✅ Hooks inchangés mais avec logs optimisés
export const useFilteredEntities = (
  filter?: {
    domains?: string[];
    includeHidden?: boolean;
    includeDisabled?: boolean;
    searchTerm?: string;
  }
) => {
  const { entities, loading, error } = useAllEntities();

  const filteredEntities = useMemo(() => {
    return entities.filter(entity => {
      if (filter?.domains && !filter.domains.includes(entity.domain)) {
        return false;
      }
      if (!filter?.includeHidden && entity.attributes.hidden) {
        return false;
      }
      if (!filter?.includeDisabled && entity.attributes.disabled) {
        return false;
      }
      if (filter?.searchTerm) {
        const searchLower = filter.searchTerm.toLowerCase();
        return (
          entity.entity_id.toLowerCase().includes(searchLower) ||
          entity.friendly_name.toLowerCase().includes(searchLower)
        );
      }
      return true;
    });
  }, [entities, filter]);

  return {
    entities: filteredEntities,
    loading,
    error
  };
};

export const useEntityControl = () => {
  const { wsConnected, callService: wsCallService } = useHomeAssistantWebSocket();

  const callService = useCallback(async (domain: string, service: string, entity_id: string, service_data?: any) => {
    try {
      if (wsConnected) {
        optimizedLog.debug(`Service ${domain}.${service} via WebSocket pour ${entity_id}`);
        return await wsCallService(domain, service, {
          entity_id,
          ...service_data
        });
      } else {
        optimizedLog.debug(`Service ${domain}.${service} via API REST pour ${entity_id}`);
        const response = await fetch(`${HA_URL}/api/services/${domain}/${service}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${HA_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            entity_id,
            ...service_data
          }),
        });

        if (!response.ok) {
          throw new Error(`Service call failed: ${response.status}`);
        }

        return await response.json();
      }
    } catch (err) {
      optimizedLog.error(`Erreur service ${domain}.${service}`, err);
      throw err;
    }
  }, [wsConnected, wsCallService]);

  return {
    turnOn: (entity_id: string) => {
      const domain = entity_id.split('.')[0];
      return callService(domain, 'turn_on', entity_id);
    },
    turnOff: (entity_id: string) => {
      const domain = entity_id.split('.')[0];
      return callService(domain, 'turn_off', entity_id);
    },
    toggle: (entity_id: string) => {
      const domain = entity_id.split('.')[0];
      return callService(domain, 'toggle', entity_id);
    },
    callService
  };
};