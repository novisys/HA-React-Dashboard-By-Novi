// Composants interface corrigés avec diagnostic WebSocket avancé
import React, { useState, useEffect, useRef } from 'react';

interface StatusIndicatorProps {
  wsConnected: boolean;
  wsConnecting: boolean;
  wsError: string | null;
  wsMessageCount: number;
  realtimeUpdates: number;
  lastUpdate: Date | null;
  entityCount: number;
  // ✅ Nouveaux props diagnostic
  wsConnectionAttempts: number;
  wsPermanentlyDisabled: boolean;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  wsConnected,
  wsConnecting,
  wsError,
  wsMessageCount,
  realtimeUpdates,
  lastUpdate,
  entityCount,
  wsConnectionAttempts,
  wsPermanentlyDisabled
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [recentUpdates, setRecentUpdates] = useState<string[]>([]);

  // ✅ Gestion des mises à jour récentes sans spam
  useEffect(() => {
    if (realtimeUpdates > 0) {
      const updateTime = new Date().toLocaleTimeString();
      setRecentUpdates(prev => {
        const newUpdate = `#${realtimeUpdates} - ${updateTime}`;
        // Éviter les doublons
        if (prev[0] === newUpdate) return prev;
        return [newUpdate, ...prev.slice(0, 4)]; // Max 5 entrées
      });
    }
  }, [realtimeUpdates]);

  const getStatusInfo = () => {
    if (wsPermanentlyDisabled) {
      return {
        icon: '⛔',
        text: 'Désactivé',
        class: 'status-disabled',
        description: 'WebSocket désactivé après échecs multiples'
      };
    }
    if (wsConnecting) {
      return {
        icon: '🔄',
        text: 'Connexion...',
        class: 'status-connecting',
        description: `Tentative ${wsConnectionAttempts}/5`
      };
    }
    if (wsConnected) {
      return {
        icon: '🟢',
        text: 'Temps Réel',
        class: 'status-connected',
        description: 'WebSocket actif'
      };
    }
    if (wsError) {
      return {
        icon: '🔴',
        text: 'API REST',
        class: 'status-error',
        description: 'Mode fallback (polling 30s)'
      };
    }
    return {
      icon: '⚪',
      text: 'Déconnecté',
      class: 'status-disconnected',
      description: 'En attente de connexion'
    };
  };

  const status = getStatusInfo();

  return (
    <div className="status-indicator">
      <div 
        className={`status-badge ${status.class}`}
        onClick={() => setShowDetails(!showDetails)}
        title={status.description}
      >
        <span className="status-icon">{status.icon}</span>
        <span className="status-text">{status.text}</span>
        {wsConnected && realtimeUpdates > 0 && (
          <span className="update-counter">{realtimeUpdates}</span>
        )}
        {wsPermanentlyDisabled && (
          <span className="disabled-indicator">⛔</span>
        )}
      </div>

      {showDetails && (
        <div className="status-dropdown">
          <div className="status-header">
            <h4>📊 Diagnostic Connexion</h4>
            <button 
              className="close-btn"
              onClick={() => setShowDetails(false)}
            >
              ✕
            </button>
          </div>
          
          <div className="status-details">
            <div className="detail-section">
              <h5>🔗 WebSocket</h5>
              <div className="detail-row">
                <span className="detail-label">État:</span>
                <span className={`detail-value ${status.class}`}>
                  {status.icon} {status.text}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Tentatives:</span>
                <span className="detail-value">{wsConnectionAttempts}</span>
              </div>
              {wsConnected && (
                <>
                  <div className="detail-row">
                    <span className="detail-label">Messages reçus:</span>
                    <span className="detail-value">{wsMessageCount}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Mises à jour temps réel:</span>
                    <span className="detail-value">{realtimeUpdates}</span>
                  </div>
                </>
              )}
              {wsPermanentlyDisabled && (
                <div className="detail-row warning">
                  <span className="detail-label">⛔ Status:</span>
                  <span className="detail-value">WebSocket désactivé temporairement</span>
                </div>
              )}
              {wsError && (
                <div className="detail-row error">
                  <span className="detail-label">Erreur:</span>
                  <span className="detail-value">{wsError}</span>
                </div>
              )}
            </div>
            
            <div className="detail-section">
              <h5>📊 Données</h5>
              <div className="detail-row">
                <span className="detail-label">Entités:</span>
                <span className="detail-value">{entityCount}</span>
              </div>
              {lastUpdate && (
                <div className="detail-row">
                  <span className="detail-label">Dernière MAJ:</span>
                  <span className="detail-value">{lastUpdate.toLocaleTimeString()}</span>
                </div>
              )}
            </div>
          </div>

          {recentUpdates.length > 0 && wsConnected && (
            <div className="recent-updates">
              <h5>🔄 Activité Récente</h5>
              <div className="updates-list">
                {recentUpdates.map((update, index) => (
                  <div key={index} className="update-item">
                    ⚡ {update}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ✅ Actions de diagnostic */}
          <div className="diagnostic-actions">
            <button 
              className="diagnostic-btn"
              onClick={() => window.location.reload()}
            >
              🔄 Recharger Page
            </button>
            {wsPermanentlyDisabled && (
              <button 
                className="diagnostic-btn reset"
                onClick={() => {
                  console.log('🔄 Reset circuit breaker via UI');
                  // Cette action sera exposée par le hook
                }}
              >
                🛠️ Réactiver WebSocket
              </button>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .status-indicator {
          position: relative;
          z-index: 100;
        }

        .status-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          border: 2px solid transparent;
          user-select: none;
        }

        .status-badge:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .status-connected {
          background: linear-gradient(135deg, #28a745, #20c997);
          color: white;
          border-color: rgba(255,255,255,0.3);
        }

        .status-connecting {
          background: linear-gradient(135deg, #ffc107, #fd7e14);
          color: white;
          border-color: rgba(255,255,255,0.3);
        }

        .status-connecting .status-icon {
          animation: spin 1s linear infinite;
        }

        .status-error {
          background: linear-gradient(135deg, #fd7e14, #ffc107);
          color: white;
          border-color: rgba(255,255,255,0.3);
        }

        .status-disabled {
          background: linear-gradient(135deg, #6c757d, #495057);
          color: white;
          border-color: rgba(255,255,255,0.3);
        }

        .status-disconnected {
          background: linear-gradient(135deg, #6c757d, #495057);
          color: white;
          border-color: rgba(255,255,255,0.3);
        }

        .status-icon {
          font-size: 14px;
        }

        .status-text {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .update-counter {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 10px;
          padding: 2px 6px;
          font-size: 10px;
          font-weight: 700;
          min-width: 18px;
          text-align: center;
          animation: pulse 2s infinite;
        }

        .disabled-indicator {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          padding: 2px;
          font-size: 10px;
        }

        .status-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 8px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
          min-width: 350px;
          overflow: hidden;
          animation: slideDown 0.2s ease-out;
        }

        .status-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          background: linear-gradient(135deg, #1fb8cd, #17a2b8);
          color: white;
        }

        .status-header h4 {
          margin: 0;
          font-size: 14px;
          font-weight: 600;
        }

        .close-btn {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          padding: 4px;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .close-btn:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .status-details {
          padding: 16px;
        }

        .detail-section {
          margin-bottom: 16px;
        }

        .detail-section:last-child {
          margin-bottom: 0;
        }

        .detail-section h5 {
          margin: 0 0 8px 0;
          font-size: 12px;
          font-weight: 600;
          color: #333;
          border-bottom: 1px solid #e0e0e0;
          padding-bottom: 4px;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 6px 0;
        }

        .detail-row.warning {
          background: #fff8dc;
          margin: 4px -8px;
          padding: 8px;
          border-radius: 4px;
        }

        .detail-row.error {
          background: #fff5f5;
          margin: 4px -8px;
          padding: 8px;
          border-radius: 4px;
        }

        .detail-label {
          font-size: 11px;
          font-weight: 600;
          color: #666;
        }

        .detail-value {
          font-size: 11px;
          font-weight: 500;
          color: #333;
        }

        .detail-value.status-connected {
          color: #28a745;
        }

        .detail-value.status-connecting {
          color: #ffc107;
        }

        .detail-value.status-error {
          color: #fd7e14;
        }

        .detail-value.status-disabled {
          color: #6c757d;
        }

        .recent-updates {
          padding: 16px;
          background: #f8f9fa;
          border-top: 1px solid #e0e0e0;
        }

        .recent-updates h5 {
          margin: 0 0 12px 0;
          font-size: 12px;
          font-weight: 600;
          color: #333;
        }

        .updates-list {
          max-height: 120px;
          overflow-y: auto;
        }

        .update-item {
          font-size: 10px;
          color: #666;
          padding: 3px 0;
          font-family: monospace;
        }

        .diagnostic-actions {
          padding: 12px 16px;
          background: #f8f9fa;
          border-top: 1px solid #e0e0e0;
          display: flex;
          gap: 8px;
          justify-content: center;
        }

        .diagnostic-btn {
          background: #1fb8cd;
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .diagnostic-btn:hover {
          background: #1aa3b8;
          transform: translateY(-1px);
        }

        .diagnostic-btn.reset {
          background: #28a745;
        }

        .diagnostic-btn.reset:hover {
          background: #218838;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Scrollbar personnalisée */
        .updates-list::-webkit-scrollbar {
          width: 4px;
        }

        .updates-list::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 2px;
        }

        .updates-list::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 2px;
        }

        .updates-list::-webkit-scrollbar-thumb:hover {
          background: #a1a1a1;
        }
      `}</style>
    </div>
  );
};

// ✅ Notifications simplifiées pour éviter le spam
interface RealtimeNotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  entityId?: string;
  timestamp: Date;
  autoHide?: boolean;
  duration?: number;
}

export const useRealtimeNotifications = () => {
  const [notifications, setNotifications] = useState<RealtimeNotification[]>([]);
  const lastNotificationRef = useRef<{[key: string]: number}>({});

  const addNotification = (notification: Omit<RealtimeNotification, 'id' | 'timestamp'>) => {
    // ✅ Anti-spam : éviter les notifications identiques trop rapprochées
    const notifKey = `${notification.type}-${notification.title}`;
    const now = Date.now();
    const lastTime = lastNotificationRef.current[notifKey] || 0;
    
    if (now - lastTime < 2000) { // 2s minimum entre notifications similaires
      return '';
    }
    lastNotificationRef.current[notifKey] = now;

    const newNotification: RealtimeNotification = {
      ...notification,
      id: `notif-${now}-${Math.random().toString(36).substr(2, 6)}`,
      timestamp: new Date(),
      autoHide: notification.autoHide ?? true,
      duration: notification.duration ?? 4000
    };

    setNotifications(prev => {
      // Limiter à 5 notifications max
      const filtered = prev.slice(0, 4);
      return [newNotification, ...filtered];
    });

    // Auto-hide
    if (newNotification.autoHide) {
      setTimeout(() => {
        removeNotification(newNotification.id);
      }, newNotification.duration);
    }

    return newNotification.id;
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
    lastNotificationRef.current = {};
  };

  // ✅ Notifications spécialisées WebSocket
  const notifyConnectionStatus = (connected: boolean, error?: string) => {
    if (connected) {
      addNotification({
        type: 'success',
        title: '🟢 WebSocket Connecté',
        message: 'Mises à jour temps réel activées',
        autoHide: true,
        duration: 3000
      });
    } else if (error) {
      addNotification({
        type: 'warning',
        title: '🔴 Mode Fallback',
        message: 'WebSocket indisponible - API REST actif',
        autoHide: true,
        duration: 5000
      });
    }
  };

  // ✅ Notifications changements d'état filtrées
  const notifyStateChange = (entityId: string, oldState: string, newState: string, friendlyName: string) => {
    const domain = entityId.split('.')[0];
    const importantDomains = ['light', 'switch', 'lock', 'alarm_control_panel'];
    
    // Filtrer uniquement les changements importants
    if (!importantDomains.includes(domain) || oldState === newState) {
      return;
    }

    const getNotificationType = (): RealtimeNotification['type'] => {
      if (domain === 'alarm_control_panel') {
        if (['armed_away', 'armed_home'].includes(newState)) return 'warning';
        if (newState === 'triggered') return 'error';
      }
      if (['on', 'open', 'unlocked'].includes(newState)) return 'success';
      return 'info';
    };

    const getEmoji = () => {
      const icons: Record<string, string> = {
        'light': newState === 'on' ? '💡' : '🔆',
        'switch': newState === 'on' ? '🔛' : '⏹️',
        'lock': newState === 'locked' ? '🔒' : '🔓',
        'alarm_control_panel': newState === 'triggered' ? '🚨' : '🛡️'
      };
      return icons[domain] || '📄';
    };

    addNotification({
      type: getNotificationType(),
      title: `${getEmoji()} ${friendlyName}`,
      message: `${oldState} → ${newState}`,
      entityId,
      autoHide: true,
      duration: 3000
    });
  };

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    notifyStateChange,
    notifyConnectionStatus
  };
};

// ✅ Composant Toast pour afficher les notifications
interface NotificationToastProps {
  notification: RealtimeNotification;
  onRemove: (id: string) => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ 
  notification, 
  onRemove 
}) => {
  const getTypeIcon = () => {
    switch (notification.type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return 'ℹ️';
    }
  };

  const getTypeColor = () => {
    switch (notification.type) {
      case 'success': return '#28a745';
      case 'warning': return '#ffc107';
      case 'error': return '#dc3545';
      default: return '#17a2b8';
    }
  };

  return (
    <div className="notification-toast">
      <div className="toast-icon">
        {getTypeIcon()}
      </div>
      <div className="toast-content">
        <div className="toast-title">{notification.title}</div>
        <div className="toast-message">{notification.message}</div>
        <div className="toast-time">
          {notification.timestamp.toLocaleTimeString()}
        </div>
      </div>
      <button 
        className="toast-close"
        onClick={() => onRemove(notification.id)}
      >
        ✕
      </button>

      <style jsx>{`
        .notification-toast {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          background: white;
          border-radius: 12px;
          padding: 16px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
          border-left: 4px solid ${getTypeColor()};
          margin-bottom: 8px;
          animation: slideInRight 0.3s ease-out;
          max-width: 350px;
        }

        .toast-icon {
          font-size: 18px;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .toast-content {
          flex: 1;
        }

        .toast-title {
          font-weight: 600;
          font-size: 14px;
          color: #333;
          margin-bottom: 4px;
        }

        .toast-message {
          font-size: 13px;
          color: #666;
          margin-bottom: 4px;
        }

        .toast-time {
          font-size: 11px;
          color: #999;
        }

        .toast-close {
          background: none;
          border: none;
          cursor: pointer;
          color: #666;
          font-size: 16px;
          padding: 4px;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .toast-close:hover {
          background: #f0f0f0;
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};

// ✅ Conteneur pour afficher les notifications
interface NotificationContainerProps {
  notifications: RealtimeNotification[];
  onRemove: (id: string) => void;
  onClear: () => void;
}

export const NotificationContainer: React.FC<NotificationContainerProps> = ({
  notifications,
  onRemove,
  onClear
}) => {
  if (notifications.length === 0) return null;

  return (
    <div className="notification-container">
      <div className="notifications-header">
        <span className="notifications-title">
          🔔 Notifications ({notifications.length})
        </span>
        <button className="clear-all-btn" onClick={onClear}>
          Effacer tout
        </button>
      </div>
      
      <div className="notifications-list">
        {notifications.map(notification => (
          <NotificationToast
            key={notification.id}
            notification={notification}
            onRemove={onRemove}
          />
        ))}
      </div>

      <style jsx>{`
        .notification-container {
          position: fixed;
          top: 80px;
          right: 20px;
          z-index: 1000;
          max-height: 80vh;
          overflow: hidden;
        }

        .notifications-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: white;
          padding: 12px 16px;
          border-radius: 8px 8px 0 0;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          margin-bottom: 2px;
        }

        .notifications-title {
          font-size: 12px;
          font-weight: 600;
          color: #333;
        }

        .clear-all-btn {
          background: #dc3545;
          color: white;
          border: none;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 10px;
          cursor: pointer;
        }

        .clear-all-btn:hover {
          background: #c82333;
        }

        .notifications-list {
          max-height: calc(80vh - 60px);
          overflow-y: auto;
          padding-right: 4px;
        }

        .notifications-list::-webkit-scrollbar {
          width: 6px;
        }

        .notifications-list::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }

        .notifications-list::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }

        @media (max-width: 768px) {
          .notification-container {
            left: 10px;
            right: 10px;
            top: 60px;
          }
        }
      `}</style>
    </div>
  );
};