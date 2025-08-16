// Panneau de configuration avancé pour les notifications
import React, { useState } from 'react';
import { NotificationFilter, NOTIFICATION_PRESETS } from './useSmartNotifications';

interface NotificationSettingsProps {
  filter: NotificationFilter;
  onUpdateFilter: (filter: Partial<NotificationFilter>) => void;
  onSetPreset: (preset: keyof typeof NOTIFICATION_PRESETS) => void;
  stats: {
    total: number;
    recent: number;
    perMinute: number;
    cooldownActive: number;
    byPriority: Record<string, number>;
  };
  onClose: () => void;
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  filter,
  onUpdateFilter,
  onSetPreset,
  stats,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'presets' | 'domains' | 'advanced'>('presets');

  const presetDescriptions = {
    minimal: '⭐ Seulement alarmes critiques',
    security: '🛡️ Sécurité et verrouillage', 
    lights: '💡 Éclairage et switches',
    all_devices: '🏠 Tous les appareils principaux',
    none: '🚫 Aucune notification'
  };

  const availableDomains = [
    { key: 'alarm_control_panel', label: '🚨 Systèmes d\'alarme', priority: 'critical' },
    { key: 'lock', label: '🔒 Serrures', priority: 'high' },
    { key: 'binary_sensor', label: '📟 Capteurs binaires', priority: 'medium' },
    { key: 'light', label: '💡 Éclairage', priority: 'low' },
    { key: 'switch', label: '🔛 Interrupteurs', priority: 'low' },
    { key: 'climate', label: '🌡️ Climatisation', priority: 'medium' },
    { key: 'cover', label: '🚪 Volets/Stores', priority: 'medium' },
    { key: 'fan', label: '🌀 Ventilateurs', priority: 'low' },
    { key: 'media_player', label: '📺 Lecteurs média', priority: 'low' },
    { key: 'vacuum', label: '🤖 Aspirateurs', priority: 'low' },
    { key: 'camera', label: '📹 Caméras', priority: 'high' }
  ];

  const handleDomainToggle = (domain: string) => {
    const newDomains = filter.domains.includes(domain)
      ? filter.domains.filter(d => d !== domain)
      : [...filter.domains, domain];
    onUpdateFilter({ domains: newDomains });
  };

  const handlePriorityToggle = (priority: 'low' | 'medium' | 'high' | 'critical') => {
    const newPriorities = filter.priorities.includes(priority)
      ? filter.priorities.filter(p => p !== priority)
      : [...filter.priorities, priority];
    onUpdateFilter({ priorities: newPriorities });
  };

  return (
    <div className="notification-settings-overlay" onClick={onClose}>
      <div className="notification-settings-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🔔 Configuration des Notifications</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Statistiques */}
        <div className="stats-bar">
          <div className="stat-item">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Total</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{stats.recent}</span>
            <span className="stat-label">5 min</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{stats.perMinute}/5</span>
            <span className="stat-label">Par minute</span>
          </div>
          <div className="stat-item critical">
            <span className="stat-value">{stats.byPriority.critical || 0}</span>
            <span className="stat-label">Critiques</span>
          </div>
        </div>

        {/* Onglets */}
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'presets' ? 'active' : ''}`}
            onClick={() => setActiveTab('presets')}
          >
            📋 Presets
          </button>
          <button 
            className={`tab ${activeTab === 'domains' ? 'active' : ''}`}
            onClick={() => setActiveTab('domains')}
          >
            🏠 Appareils
          </button>
          <button 
            className={`tab ${activeTab === 'advanced' ? 'active' : ''}`}
            onClick={() => setActiveTab('advanced')}
          >
            ⚙️ Avancé
          </button>
        </div>

        <div className="modal-content">
          {activeTab === 'presets' && (
            <div className="presets-tab">
              <h3>📋 Configurations Prédéfinies</h3>
              <p className="tab-description">
                Choisissez une configuration adaptée à vos besoins :
              </p>
              
              <div className="presets-grid">
                {Object.entries(presetDescriptions).map(([presetKey, description]) => (
                  <button
                    key={presetKey}
                    className="preset-card"
                    onClick={() => onSetPreset(presetKey as keyof typeof NOTIFICATION_PRESETS)}
                  >
                    <div className="preset-title">{description}</div>
                    <div className="preset-details">
                      {presetKey === 'minimal' && '2 notifications max/min'}
                      {presetKey === 'security' && 'Sécurité + capteurs'}
                      {presetKey === 'lights' && '3 notifications max/min'}
                      {presetKey === 'all_devices' && '8 notifications max/min'}
                      {presetKey === 'none' && 'Désactivé complètement'}
                    </div>
                  </button>
                ))}
              </div>

              <div className="current-config">
                <h4>Configuration Actuelle :</h4>
                <div className="config-summary">
                  <div className="config-item">
                    <strong>Appareils :</strong> {filter.domains.length} types
                  </div>
                  <div className="config-item">
                    <strong>Limite :</strong> {filter.maxPerMinute}/min
                  </div>
                  <div className="config-item">
                    <strong>Cooldown :</strong> {filter.cooldownMs / 1000}s
                  </div>
                  <div className="config-item">
                    <strong>Status :</strong> 
                    <span className={filter.enabled ? 'enabled' : 'disabled'}>
                      {filter.enabled ? ' Activé' : ' Désactivé'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'domains' && (
            <div className="domains-tab">
              <h3>🏠 Types d'Appareils</h3>
              <p className="tab-description">
                Sélectionnez les types d'appareils qui peuvent envoyer des notifications :
              </p>
              
              <div className="domains-grid">
                {availableDomains.map(domain => (
                  <label key={domain.key} className="domain-checkbox">
                    <input
                      type="checkbox"
                      checked={filter.domains.includes(domain.key)}
                      onChange={() => handleDomainToggle(domain.key)}
                    />
                    <span className="checkbox-custom"></span>
                    <span className="domain-label">{domain.label}</span>
                    <span className={`priority-badge ${domain.priority}`}>
                      {domain.priority}
                    </span>
                  </label>
                ))}
              </div>

              <div className="priorities-section">
                <h4>📊 Niveaux de Priorité</h4>
                <div className="priorities-grid">
                  {(['critical', 'high', 'medium', 'low'] as const).map(priority => (
                    <label key={priority} className="priority-checkbox">
                      <input
                        type="checkbox"
                        checked={filter.priorities.includes(priority)}
                        onChange={() => handlePriorityToggle(priority)}
                      />
                      <span className="checkbox-custom"></span>
                      <span className={`priority-label ${priority}`}>
                        {priority === 'critical' && '🚨 Critique'}
                        {priority === 'high' && '⚠️ Haute'}
                        {priority === 'medium' && 'ℹ️ Moyenne'}
                        {priority === 'low' && '💭 Basse'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'advanced' && (
            <div className="advanced-tab">
              <h3>⚙️ Configuration Avancée</h3>
              
              <div className="advanced-controls">
                <div className="control-group">
                  <label>Notifications par minute (max)</label>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={filter.maxPerMinute}
                    onChange={(e) => onUpdateFilter({ maxPerMinute: Number(e.target.value) })}
                  />
                  <span className="range-value">{filter.maxPerMinute}</span>
                </div>

                <div className="control-group">
                  <label>Cooldown entre notifications identiques</label>
                  <input
                    type="range"
                    min="5000"
                    max="300000"
                    step="5000"
                    value={filter.cooldownMs}
                    onChange={(e) => onUpdateFilter({ cooldownMs: Number(e.target.value) })}
                  />
                  <span className="range-value">{filter.cooldownMs / 1000}s</span>
                </div>

                <div className="control-group">
                  <label>Mots-clés prioritaires (séparés par virgule)</label>
                  <input
                    type="text"
                    value={filter.keywords?.join(', ') || ''}
                    onChange={(e) => onUpdateFilter({ 
                      keywords: e.target.value.split(',').map(k => k.trim()).filter(k => k) 
                    })}
                    placeholder="alarm, security, door, fire..."
                  />
                </div>

                <div className="control-group">
                  <label>Mots-clés à exclure (séparés par virgule)</label>
                  <input
                    type="text"
                    value={filter.excludeKeywords?.join(', ') || ''}
                    onChange={(e) => onUpdateFilter({ 
                      excludeKeywords: e.target.value.split(',').map(k => k.trim()).filter(k => k) 
                    })}
                    placeholder="unavailable, unknown, idle..."
                  />
                </div>

                <div className="control-group">
                  <label className="toggle-label">
                    <input
                      type="checkbox"
                      checked={filter.enabled}
                      onChange={(e) => onUpdateFilter({ enabled: e.target.checked })}
                    />
                    <span className="toggle-custom"></span>
                    Activer les notifications
                  </label>
                </div>
              </div>

              <div className="test-section">
                <h4>🧪 Test</h4>
                <p>Statistiques du filtre actuel :</p>
                <div className="test-stats">
                  <div>• Entités en cooldown : {stats.cooldownActive}</div>
                  <div>• Notifications dans la minute : {stats.perMinute}/{filter.maxPerMinute}</div>
                  <div>• Filtre activé : {filter.enabled ? 'Oui' : 'Non'}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="footer-btn secondary" onClick={onClose}>
            Fermer
          </button>
          <button 
            className="footer-btn primary"
            onClick={() => onSetPreset('minimal')}
          >
            ⭐ Mode Minimal
          </button>
        </div>
      </div>

      <style jsx>{`
        .notification-settings-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
        }

        .notification-settings-modal {
          background: white;
          border-radius: 16px;
          max-width: 800px;
          width: 90vw;
          max-height: 90vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px;
          border-bottom: 1px solid #e0e0e0;
          background: linear-gradient(135deg, #1fb8cd, #17a2b8);
          color: white;
        }

        .modal-header h2 {
          margin: 0;
          font-size: 20px;
        }

        .close-btn {
          background: none;
          border: none;
          color: white;
          font-size: 24px;
          cursor: pointer;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .close-btn:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .stats-bar {
          display: flex;
          justify-content: space-around;
          padding: 16px;
          background: #f8f9fa;
          border-bottom: 1px solid #e0e0e0;
        }

        .stat-item {
          text-align: center;
        }

        .stat-value {
          display: block;
          font-size: 18px;
          font-weight: 700;
          color: #1fb8cd;
        }

        .stat-item.critical .stat-value {
          color: #dc3545;
        }

        .stat-label {
          font-size: 11px;
          color: #666;
          text-transform: uppercase;
        }

        .tabs {
          display: flex;
          border-bottom: 1px solid #e0e0e0;
        }

        .tab {
          flex: 1;
          padding: 16px;
          background: none;
          border: none;
          cursor: pointer;
          font-weight: 500;
          color: #666;
          border-bottom: 3px solid transparent;
        }

        .tab.active {
          color: #1fb8cd;
          border-bottom-color: #1fb8cd;
          background: #f8f9fa;
        }

        .modal-content {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
        }

        .tab-description {
          color: #666;
          margin-bottom: 24px;
          line-height: 1.5;
        }

        .presets-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .preset-card {
          background: white;
          border: 2px solid #e0e0e0;
          border-radius: 12px;
          padding: 16px;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
        }

        .preset-card:hover {
          border-color: #1fb8cd;
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(31, 184, 205, 0.15);
        }

        .preset-title {
          font-weight: 600;
          font-size: 16px;
          margin-bottom: 4px;
          color: #333;
        }

        .preset-details {
          font-size: 13px;
          color: #666;
        }

        .current-config {
          background: #f8f9fa;
          padding: 16px;
          border-radius: 8px;
        }

        .current-config h4 {
          margin: 0 0 12px 0;
          color: #333;
        }

        .config-summary {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }

        .config-item {
          font-size: 14px;
          color: #666;
        }

        .enabled {
          color: #28a745;
          font-weight: 600;
        }

        .disabled {
          color: #dc3545;
          font-weight: 600;
        }

        .domains-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 12px;
          margin-bottom: 24px;
        }

        .domain-checkbox {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .domain-checkbox:hover {
          background: #f8f9fa;
          border-color: #1fb8cd;
        }

        .checkbox-custom {
          width: 18px;
          height: 18px;
          border: 2px solid #ddd;
          border-radius: 3px;
          position: relative;
        }

        .domain-checkbox input:checked + .checkbox-custom {
          background: #1fb8cd;
          border-color: #1fb8cd;
        }

        .domain-checkbox input:checked + .checkbox-custom::after {
          content: '✓';
          position: absolute;
          top: -2px;
          left: 2px;
          color: white;
          font-size: 12px;
          font-weight: bold;
        }

        .domain-checkbox input {
          display: none;
        }

        .domain-label {
          flex: 1;
          font-weight: 500;
        }

        .priority-badge {
          font-size: 10px;
          padding: 2px 6px;
          border-radius: 4px;
          text-transform: uppercase;
          font-weight: 600;
        }

        .priority-badge.critical {
          background: #dc3545;
          color: white;
        }

        .priority-badge.high {
          background: #ffc107;
          color: #333;
        }

        .priority-badge.medium {
          background: #17a2b8;
          color: white;
        }

        .priority-badge.low {
          background: #6c757d;
          color: white;
        }

        .priorities-section {
          border-top: 1px solid #e0e0e0;
          padding-top: 20px;
        }

        .priorities-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .priority-checkbox {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }

        .priority-label.critical {
          color: #dc3545;
        }

        .priority-label.high {
          color: #fd7e14;
        }

        .priority-label.medium {
          color: #17a2b8;
        }

        .priority-label.low {
          color: #6c757d;
        }

        .advanced-controls {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .control-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .control-group label {
          font-weight: 600;
          color: #333;
          font-size: 14px;
        }

        .control-group input[type="range"] {
          width: 100%;
        }

        .control-group input[type="text"] {
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }

        .range-value {
          font-weight: 600;
          color: #1fb8cd;
          font-size: 14px;
        }

        .toggle-label {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }

        .toggle-custom {
          width: 40px;
          height: 20px;
          background: #ddd;
          border-radius: 10px;
          position: relative;
          transition: background 0.2s;
        }

        .toggle-label input:checked + .toggle-custom {
          background: #1fb8cd;
        }

        .toggle-custom::after {
          content: '';
          position: absolute;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: white;
          top: 2px;
          left: 2px;
          transition: transform 0.2s;
        }

        .toggle-label input:checked + .toggle-custom::after {
          transform: translateX(20px);
        }

        .toggle-label input {
          display: none;
        }

        .test-section {
          background: #f8f9fa;
          padding: 16px;
          border-radius: 8px;
          margin-top: 20px;
        }

        .test-stats {
          font-family: monospace;
          font-size: 13px;
          color: #666;
        }

        .modal-footer {
          padding: 24px;
          border-top: 1px solid #e0e0e0;
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }

        .footer-btn {
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .footer-btn.secondary {
          background: #f8f9fa;
          color: #666;
        }

        .footer-btn.primary {
          background: #ffc107;
          color: #333;
        }

        .footer-btn:hover {
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  );
};