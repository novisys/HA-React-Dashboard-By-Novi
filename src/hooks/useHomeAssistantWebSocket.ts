// Hook WebSocket HA corrigé - Anti-boucle infinie avec circuit breaker
import { useEffect, useRef, useState, useCallback } from 'react';

export interface HAWebSocketMessage {
  type: string;
  id?: number;
  event?: {
    event_type: string;
    data: {
      entity_id: string;
      old_state?: any;
      new_state?: any;
    };
  };
  result?: any;
  success?: boolean;
  error?: {
    code: string;
    message: string;
  };
}

export interface WebSocketState {
  connected: boolean;
  connecting: boolean;
  error: string | null;
  lastMessage: HAWebSocketMessage | null;
  messageCount: number;
  // ✅ Nouveaux états pour diagnostic
  connectionAttempts: number;
  lastConnectionAttempt: Date | null;
  permanentlyDisabled: boolean;
}

const HA_URL = 'http://192.168.0.42:8123';
const HA_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiI2OTdkMjg4NzIyYTc0NGI0OWZlY2Y2ZTI5YmI2OTI1YyIsImlhdCI6MTc1NTIwODE3NCwiZXhwIjoyMDcwNTY4MTc0fQ.bBBHijZ0RdzRvALatqdHb-zdBpHwCA-i801Kp3fGjoU';

// ✅ Configuration anti-boucle
const MAX_RECONNECT_ATTEMPTS = 5;
const MAX_RECONNECT_DELAY = 30000; // 30 secondes max
const CIRCUIT_BREAKER_TIMEOUT = 300000; // 5 minutes avant réessai

// Convertir URL HTTP en WebSocket
const getWebSocketUrl = (baseUrl: string) => {
  const url = new URL(baseUrl);
  const wsProtocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${wsProtocol}//${url.host}/api/websocket`;
};

export const useHomeAssistantWebSocket = () => {
  const wsRef = useRef<WebSocket | null>(null);
  const messageIdRef = useRef(1);
  const pendingMessagesRef = useRef<Map<number, (response: HAWebSocketMessage) => void>>(new Map());
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectAttemptRef = useRef(0);
  const lastFailureRef = useRef<Date | null>(null);
  const authFailureRef = useRef(false);

  const [state, setState] = useState<WebSocketState>({
    connected: false,
    connecting: false,
    error: null,
    lastMessage: null,
    messageCount: 0,
    connectionAttempts: 0,
    lastConnectionAttempt: null,
    permanentlyDisabled: false
  });

  const [eventListeners, setEventListeners] = useState<Map<string, Set<(data: any) => void>>>(new Map());

  // ✅ Circuit breaker - évite les tentatives infinies
  const shouldAllowReconnect = useCallback(() => {
    // Si authentification a échoué, ne pas réessayer
    if (authFailureRef.current) {
      console.log('❌ WebSocket désactivé - Erreur d\'authentification');
      return false;
    }

    // Si trop d'échecs récents, attendre
    if (lastFailureRef.current) {
      const timeSinceLastFailure = Date.now() - lastFailureRef.current.getTime();
      if (timeSinceLastFailure < CIRCUIT_BREAKER_TIMEOUT && reconnectAttemptRef.current >= MAX_RECONNECT_ATTEMPTS) {
        console.log(`⛔ WebSocket désactivé temporairement - Réessai dans ${Math.round((CIRCUIT_BREAKER_TIMEOUT - timeSinceLastFailure) / 1000)}s`);
        return false;
      }
    }

    return true;
  }, []);

  const sendMessage = useCallback((message: any): Promise<HAWebSocketMessage> => {
    return new Promise((resolve, reject) => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        reject(new Error('WebSocket not connected'));
        return;
      }

      const id = messageIdRef.current++;
      const messageWithId = { ...message, id };
      
      pendingMessagesRef.current.set(id, resolve);
      
      try {
        wsRef.current.send(JSON.stringify(messageWithId));
      } catch (err) {
        pendingMessagesRef.current.delete(id);
        reject(err);
      }
      
      // Timeout après 10 secondes
      setTimeout(() => {
        if (pendingMessagesRef.current.has(id)) {
          pendingMessagesRef.current.delete(id);
          reject(new Error('Request timeout'));
        }
      }, 10000);
    });
  }, []);

  const subscribe = useCallback((eventType: string, callback: (data: any) => void) => {
    setEventListeners(prev => {
      const newListeners = new Map(prev);
      if (!newListeners.has(eventType)) {
        newListeners.set(eventType, new Set());
      }
      newListeners.get(eventType)!.add(callback);
      return newListeners;
    });

    return () => {
      setEventListeners(prev => {
        const newListeners = new Map(prev);
        const listeners = newListeners.get(eventType);
        if (listeners) {
          listeners.delete(callback);
          if (listeners.size === 0) {
            newListeners.delete(eventType);
          }
        }
        return newListeners;
      });
    };
  }, []);

  const cleanup = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = undefined;
    }
    
    if (wsRef.current) {
      wsRef.current.onopen = null;
      wsRef.current.onmessage = null;
      wsRef.current.onerror = null;
      wsRef.current.onclose = null;
      
      if (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING) {
        wsRef.current.close(1000, 'Component cleanup');
      }
      wsRef.current = null;
    }
    
    pendingMessagesRef.current.clear();
  }, []);

  const connect = useCallback(() => {
    // ✅ Vérification circuit breaker
    if (!shouldAllowReconnect()) {
      setState(prev => ({ 
        ...prev, 
        permanentlyDisabled: true,
        error: 'WebSocket temporairement désactivé',
        connecting: false 
      }));
      return;
    }

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('🔗 WebSocket déjà connecté');
      return;
    }

    // Nettoyage avant nouvelle connexion
    cleanup();

    setState(prev => ({ 
      ...prev, 
      connecting: true, 
      error: null,
      connectionAttempts: prev.connectionAttempts + 1,
      lastConnectionAttempt: new Date(),
      permanentlyDisabled: false
    }));
    
    try {
      const wsUrl = getWebSocketUrl(HA_URL);
      console.log(`🔗 Tentative ${reconnectAttemptRef.current + 1}/${MAX_RECONNECT_ATTEMPTS} WebSocket:`, wsUrl);
      
      wsRef.current = new WebSocket(wsUrl);

      // ✅ Timeout de connexion
      const connectionTimeout = setTimeout(() => {
        if (wsRef.current?.readyState === WebSocket.CONNECTING) {
          console.log('⏰ Timeout de connexion WebSocket');
          wsRef.current?.close();
        }
      }, 10000);

      wsRef.current.onopen = () => {
        clearTimeout(connectionTimeout);
        console.log('✅ WebSocket connecté à Home Assistant');
        reconnectAttemptRef.current = 0;
        lastFailureRef.current = null;
        setState(prev => ({ 
          ...prev, 
          connected: true, 
          connecting: false, 
          error: null 
        }));
      };

      wsRef.current.onmessage = async (event) => {
        try {
          const message: HAWebSocketMessage = JSON.parse(event.data);
          
          setState(prev => ({ 
            ...prev, 
            lastMessage: message,
            messageCount: prev.messageCount + 1 
          }));

          // Gérer l'authentification
          if (message.type === 'auth_required') {
            console.log('🔐 Authentification WebSocket requise');
            wsRef.current?.send(JSON.stringify({
              type: 'auth',
              access_token: HA_TOKEN
            }));
          }
          
          // Authentification réussie
          else if (message.type === 'auth_ok') {
            console.log('✅ Authentification WebSocket réussie');
            authFailureRef.current = false;
            
            // S'abonner aux événements
            wsRef.current?.send(JSON.stringify({
              id: messageIdRef.current++,
              type: 'subscribe_events',
              event_type: 'state_changed'
            }));
          }
          
          // Authentification échouée
          else if (message.type === 'auth_invalid') {
            console.error('❌ Authentification WebSocket échouée - Token invalide');
            authFailureRef.current = true;
            setState(prev => ({ 
              ...prev, 
              error: 'Token invalide',
              connected: false,
              connecting: false,
              permanentlyDisabled: true
            }));
            cleanup();
            return;
          }
          
          // Événement reçu
          else if (message.type === 'event') {
            const eventType = message.event?.event_type;
            if (eventType && eventListeners.has(eventType)) {
              eventListeners.get(eventType)?.forEach(callback => {
                try {
                  callback(message.event);
                } catch (err) {
                  console.error('Erreur callback événement:', err);
                }
              });
            }
          }
          
          // Réponse à une requête
          else if (message.id && pendingMessagesRef.current.has(message.id)) {
            const resolve = pendingMessagesRef.current.get(message.id);
            pendingMessagesRef.current.delete(message.id);
            resolve?.(message);
          }
          
        } catch (err) {
          console.error('❌ Erreur parsing message WebSocket:', err);
        }
      };

      wsRef.current.onerror = (error) => {
        clearTimeout(connectionTimeout);
        console.error('❌ Erreur WebSocket:', error);
        lastFailureRef.current = new Date();
      };

      wsRef.current.onclose = (event) => {
        clearTimeout(connectionTimeout);
        console.log(`🔌 WebSocket fermé: ${event.code} - ${event.reason}`);
        
        setState(prev => ({ 
          ...prev, 
          connected: false, 
          connecting: false 
        }));

        // ✅ Reconnexion intelligente
        if (event.code !== 1000 && !authFailureRef.current) {
          reconnectAttemptRef.current++;
          
          if (reconnectAttemptRef.current <= MAX_RECONNECT_ATTEMPTS && shouldAllowReconnect()) {
            const delay = Math.min(1000 * Math.pow(2, reconnectAttemptRef.current - 1), MAX_RECONNECT_DELAY);
            
            console.log(`🔄 Reconnexion dans ${delay}ms (tentative ${reconnectAttemptRef.current}/${MAX_RECONNECT_ATTEMPTS})`);
            
            reconnectTimeoutRef.current = setTimeout(() => {
              if (!wsRef.current || wsRef.current.readyState === WebSocket.CLOSED) {
                connect();
              }
            }, delay);
          } else {
            console.log('⛔ Nombre maximum de reconnexions atteint - Mode fallback activé');
            lastFailureRef.current = new Date();
            setState(prev => ({ 
              ...prev, 
              error: 'Connexion WebSocket échouée - Mode API REST activé',
              permanentlyDisabled: true
            }));
          }
        }
      };

    } catch (err) {
      console.error('❌ Erreur création WebSocket:', err);
      setState(prev => ({ 
        ...prev, 
        error: 'Impossible de créer la connexion WebSocket',
        connected: false,
        connecting: false 
      }));
      lastFailureRef.current = new Date();
    }
  }, [shouldAllowReconnect, eventListeners, cleanup]);

  const disconnect = useCallback(() => {
    console.log('🔌 Déconnexion WebSocket manuelle');
    cleanup();
    setState(prev => ({ 
      ...prev, 
      connected: false, 
      connecting: false,
      error: null,
      permanentlyDisabled: false
    }));
  }, [cleanup]);

  // ✅ Fonction pour réinitialiser le circuit breaker
  const resetCircuitBreaker = useCallback(() => {
    console.log('🔄 Reset circuit breaker WebSocket');
    authFailureRef.current = false;
    lastFailureRef.current = null;
    reconnectAttemptRef.current = 0;
    setState(prev => ({ 
      ...prev, 
      permanentlyDisabled: false,
      error: null,
      connectionAttempts: 0
    }));
  }, []);

  const callService = useCallback(async (domain: string, service: string, serviceData: any = {}) => {
    try {
      const response = await sendMessage({
        type: 'call_service',
        domain,
        service,
        service_data: serviceData
      });
      
      if (!response.success) {
        throw new Error(response.error?.message || 'Service call failed');
      }
      
      return response.result;
    } catch (err) {
      console.error(`❌ Erreur service ${domain}.${service}:`, err);
      throw err;
    }
  }, [sendMessage]);

  const getStates = useCallback(async () => {
    try {
      const response = await sendMessage({
        type: 'get_states'
      });
      
      if (!response.success) {
        throw new Error(response.error?.message || 'Get states failed');
      }
      
      return response.result;
    } catch (err) {
      console.error('❌ Erreur récupération états:', err);
      throw err;
    }
  }, [sendMessage]);

  // ✅ Connexion automatique avec délai initial
  useEffect(() => {
    const initialDelay = setTimeout(() => {
      connect();
    }, 1000); // Délai 1s pour éviter la connexion immédiate

    return () => {
      clearTimeout(initialDelay);
      cleanup();
    };
  }, [connect, cleanup]);

  return {
    // État
    connected: state.connected,
    connecting: state.connecting,
    error: state.error,
    lastMessage: state.lastMessage,
    messageCount: state.messageCount,
    connectionAttempts: state.connectionAttempts,
    lastConnectionAttempt: state.lastConnectionAttempt,
    permanentlyDisabled: state.permanentlyDisabled,
    
    // Actions
    connect,
    disconnect,
    sendMessage,
    subscribe,
    callService,
    getStates,
    resetCircuitBreaker
  };
};