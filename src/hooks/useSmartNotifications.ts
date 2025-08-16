// Hook notifications intelligent - ANTI-FLOOD avec filtrage avancé
import { useState, useEffect, useRef, useCallback } from 'react';

// ✅ Interface notification avec priorité
export interface RealtimeNotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  entityId?: string;
  timestamp: Date;
  autoHide?: boolean;
  duration?: number;
  priority?: 'low' | 'medium' | 'high' | 'critical';
}

// ✅ Configuration filtres utilisateur
export interface NotificationSettings {
  enabled: boolean;
  allowedDomains: string[];
  blockedEntities: string[];
  importantStatesOnly: boolean;
  maxPerMinute: number;
  groupSimilar: boolean;
  silentMode: boolean;
  silentHours: {
    enabled: boolean;
    start: string; // "22:00"
    end: string;   // "07:00"
  };
  minPriority: 'low' | 'medium' | 'high' | 'critical';
}

// ✅ Configuration TRÈS restrictive par défaut
const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: true,
  allowedDomains: [
    'alarm_control_panel', // Sécurité critique
    'lock',                // Serrures importantes
    'cover'                // Portes de garage
  ], // SEULEMENT les domaines critiques
  blockedEntities: [
    // Entités trop bavardes à bloquer automatiquement
    'sensor.time', 'sensor.date', 'sensor.uptime',
    'sensor.memory_use_percent', 'sensor.processor_use',
    'sensor.cpu_temperature', 'sensor.load_1m',
    'weather.', 'sun.', // Météo et soleil changent constamment
  ],
  importantStatesOnly: true, // Filtrer les états non importants
  maxPerMinute: 2, // MAXIMUM 2 notifications par minute
  groupSimilar: true, // Grouper les notifications similaires
  silentMode: false,
  silentHours: {
    enabled: true,
    start: '22:00',
    end: '07:00'
  },
  minPriority: 'medium' // Ignorer les notifications de faible priorité
};

// ✅ États considérés comme importants
const IMPORTANT_STATES = [
  // Sécurité
  'armed_home', 'armed_away', 'disarmed', 'triggered',
  // Serrures
  'locked', 'unlocked',
  // Ouvertures importantes
  'open', 'closed',
  // Équipements principaux
  'on', 'off'
];

// ✅ Détection automatique de priorité
const getNotificationPriority = (entityId: string, oldState: string, newState: string): 'low' | 'medium' | 'high' | 'critical' => {
  const domain = entityId.split('.')[0];
  
  // CRITIQUE : Alarmes déclenchées
  if (domain === 'alarm_control_panel' && newState === 'triggered') {
    return 'critical';
  }
  
  // HAUTE : Sécurité et accès
  if (domain === 'alarm_control_panel' && ['armed_home', 'armed_away', 'disarmed'].includes(newState)) {
    return 'high';
  }
  if (domain === 'lock') {
    return 'high';
  }
  if (domain === 'cover' && entityId.includes('garage')) {
    return 'high';
  }
  
  // MOYENNE : Équipements importants
  if (['light', 'switch', 'climate'].includes(domain)) {
    return 'medium';
  }
  
  // BASSE : Tout le reste
  return 'low';
};

// ✅ Filtrage intelligent des changements
const shouldNotify = (
  entityId: string, 
  oldState: string, 
  newState: string, 
  settings: NotificationSettings
): boolean => {
  // Notifications désactivées
  if (!settings.enabled) return false;
  
  // Vérifier domaine autorisé
  const domain = entityId.split('.')[0];
  if (!settings.allowedDomains.includes(domain)) {
    return false;
  }
  
  // Vérifier entité bloquée
  if (settings.blockedEntities.some(blocked => entityId.startsWith(blocked))) {
    return false;
  }
  
  // Si mode "états importants seulement"
  if (settings.importantStatesOnly) {
    if (!IMPORTANT_STATES.includes(newState) && !IMPORTANT_STATES.includes(oldState)) {
      return false;
    }
  }
  
  // Vérifier priorité minimale
  const priority = getNotificationPriority(entityId, oldState, newState);
  const priorityLevels = ['low', 'medium', 'high', 'critical'];
  const minIndex = priorityLevels.indexOf(settings.minPriority);
  const currentIndex = priorityLevels.indexOf(priority);
  
  if (currentIndex < minIndex) {
    return false;
  }
  
  // Ignorer les changements numériques minimes des capteurs
  if (domain === 'sensor') {
    const oldNum = parseFloat(oldState);
    const newNum = parseFloat(newState);
    if (!isNaN(oldNum) && !isNaN(newNum)) {
      const percentChange = Math.abs((newNum - oldNum) / oldNum) * 100;
      if (percentChange < 10) { // Moins de 10% de changement
        return false;
      }
    }
  }
  
  return true;
};

export const useSmartNotifications = () => {
  const [notifications, setNotifications] = useState<RealtimeNotification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>(() => {
    // Charger depuis localStorage
    try {
      const saved = localStorage.getItem('notification-settings');
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // ✅ Rate limiting par minute
  const notificationCountsRef = useRef<{ [minute: string]: number }>({});
  const lastNotificationRef = useRef<{ [key: string]: number }>({});

  // Sauvegarder paramètres
  useEffect(() => {
    localStorage.setItem('notification-settings', JSON.stringify(settings));
  }, [settings]);

  // ✅ Vérifier heures silencieuses
  const isInSilentHours = useCallback((): boolean => {
    if (!settings.silentHours.enabled) return false;
    
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const { start, end } = settings.silentHours;
    
    if (start > end) { // Traverse minuit (22:00 - 07:00)
      return currentTime >= start || currentTime <= end;
    } else {
      return currentTime >= start && currentTime <= end;
    }
  }, [settings.silentHours]);

  // ✅ Rate limiting intelligent
  const canShowNotification = useCallback((): boolean => {
    if (settings.silentMode) return false;
    if (isInSilentHours()) return false;
    
    const currentMinute = new Date().toISOString().slice(0, 16); // YYYY-MM-DDTHH:mm
    
    // Initialiser compteur si nécessaire
    if (!notificationCountsRef.current[currentMinute]) {
      notificationCountsRef.current[currentMinute] = 0;
      
      // Nettoyer ancien historique (garder 5 dernières minutes)
      const cutoff = new Date(Date.now() - 5 * 60 * 1000).toISOString().slice(0, 16);
      Object.keys(notificationCountsRef.current).forEach(minute => {
        if (minute < cutoff) {
          delete notificationCountsRef.current[minute];
        }
      });
    }
    
    return notificationCountsRef.current[currentMinute] < settings.maxPerMinute;
  }, [settings, isInSilentHours]);

  // ✅ Anti-spam pour entités similaires
  const shouldGroupNotification = useCallback((entityId: string): boolean => {
    if (!settings.groupSimilar) return false;
    
    const now = Date.now();
    const lastTime = lastNotificationRef.current[entityId];
    
    // Grouper si dernière notification de cette entité < 10 secondes
    if (lastTime && (now - lastTime) < 10000) {
      return true;
    }
    
    lastNotificationRef.current[entityId] = now;
    return false;
  }, [settings.groupSimilar]);

  const addNotification = useCallback((notification: Omit<RealtimeNotification, 'id' | 'timestamp'>) => {
    // Vérifications de base
    if (!canShowNotification()) {
      console.log('🔇 Notification bloquée - Rate limit/Silent');
      return '';
    }

    // Anti-spam pour même entité
    if (notification.entityId && shouldGroupNotification(notification.entityId)) {
      console.log('🔇 Notification groupée ignorée');
      return '';
    }

    const newNotification: RealtimeNotification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date(),
      priority: notification.priority || 'medium',
      autoHide: notification.autoHide ?? (notification.priority !== 'critical'),
      duration: notification.duration || (notification.priority === 'critical' ? 10000 : 4000)
    };

    // Incrémenter compteur rate limiting
    const currentMinute = new Date().toISOString().slice(0, 16);
    notificationCountsRef.current[currentMinute] = (notificationCountsRef.current[currentMinute] || 0) + 1;

    setNotifications(prev => {
      // Limiter à 3 notifications max, priorité aux plus importantes
      const newList = [newNotification, ...prev];
      return newList
        .sort((a, b) => {
          const priorityOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
          return (priorityOrder[b.priority || 'low'] || 1) - (priorityOrder[a.priority || 'low'] || 1);
        })
        .slice(0, 3);
    });

    // Auto-hide
    if (newNotification.autoHide) {
      setTimeout(() => {
        removeNotification(newNotification.id);
      }, newNotification.duration);
    }

    console.log(`🔔 Notification ${newNotification.priority}: ${notification.title}`);
    return newNotification.id;
  }, [canShowNotification, shouldGroupNotification]);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    lastNotificationRef.current = {};
  }, []);

  // ✅ Fonction FILTRÉE pour changements d'état
  const notifyStateChange = useCallback((entityId: string, oldState: string, newState: string, friendlyName: string) => {
    // FILTRAGE INTELLIGENT - Beaucoup moins de notifications !
    if (!shouldNotify(entityId, oldState, newState, settings)) {
      return; // Notification ignorée silencieusement
    }

    const domain = entityId.split('.')[0];
    const priority = getNotificationPriority(entityId, oldState, newState);

    // Type basé sur priorité
    const getNotificationType = (): RealtimeNotification['type'] => {
      if (priority === 'critical') return 'error';
      if (priority === 'high') return 'warning';
      if (['on', 'open', 'unlocked', 'armed_home', 'armed_away'].includes(newState)) return 'success';
      return 'info';
    };

    // Icônes spécialisées
    const getEmoji = () => {
      const icons: Record<string, string> = {
        'alarm_control_panel': newState === 'triggered' ? '🚨' : '🛡️',
        'lock': newState === 'locked' ? '🔒' : '🔓',
        'cover': newState === 'open' ? '📤' : '📥',
        'climate': '🌡️',
        'light': newState === 'on' ? '💡' : '🔆',
        'switch': newState === 'on' ? '🔛' : '⏹️'
      };
      return icons[domain] || '📄';
    };

    addNotification({
      type: getNotificationType(),
      title: `${getEmoji()} ${friendlyName}`,
      message: `${oldState} → ${newState}`,
      entityId,
      priority,
      autoHide: priority !== 'critical',
      duration: priority === 'critical' ? 15000 : priority === 'high' ? 8000 : 4000
    });
  }, [settings, addNotification]);

  // ✅ Notifications système (moins fréquentes)
  const notifyConnectionStatus = useCallback((connected: boolean, error?: string) => {
    // Seulement si les notifications système sont importantes
    if (connected) {
      addNotification({
        type: 'success',
        title: '🟢 WebSocket Connecté',
        message: 'Temps réel activé',
        priority: 'low', // Priorité basse
        autoHide: true,
        duration: 2000 // Plus court
      });
    } else if (error) {
      addNotification({
        type: 'warning',
        title: '🔴 Mode Offline',
        message: 'Utilisation API REST',
        priority: 'medium',
        autoHide: true,
        duration: 4000
      });
    }
  }, [addNotification]);

  // ✅ Actions utilisateur (toujours affichées)
  const notifyUserAction = useCallback((title: string, message: string, type: RealtimeNotification['type'] = 'info') => {
    // Les actions utilisateur bypass certains filtres
    const tempSettings = { ...settings, enabled: true, silentMode: false };
    const originalSettings = settings;
    
    // Temporairement activer les notifications pour actions utilisateur
    addNotification({
      type,
      title,
      message,
      priority: 'medium',
      autoHide: true,
      duration: 3000
    });
  }, [addNotification]);

  // ✅ Fonction pour basculer mode silencieux rapide
  const toggleSilentMode = useCallback(() => {
    setSettings(prev => ({ ...prev, silentMode: !prev.silentMode }));
  }, []);

  // ✅ Presets rapides
  const applyPreset = useCallback((preset: 'minimal' | 'normal' | 'verbose') => {
    const presets = {
      minimal: {
        ...settings,
        allowedDomains: ['alarm_control_panel'],
        maxPerMinute: 1,
        minPriority: 'high' as const
      },
      normal: DEFAULT_SETTINGS,
      verbose: {
        ...DEFAULT_SETTINGS,
        allowedDomains: ['alarm_control_panel', 'lock', 'cover', 'light', 'switch', 'climate'],
        maxPerMinute: 5,
        minPriority: 'low' as const
      }
    };
    setSettings(presets[preset]);
  }, [settings]);

  return {
    notifications,
    settings,
    setSettings,
    addNotification,
    removeNotification,
    clearAll,
    notifyStateChange,
    notifyConnectionStatus,
    notifyUserAction,
    toggleSilentMode,
    applyPreset,
    isInSilentHours: isInSilentHours(),
    notificationCount: notifications.length
  };
};