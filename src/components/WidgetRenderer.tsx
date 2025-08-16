// Rendu centralisé des widgets avec gestion d'erreurs
import React from 'react';
import { type WidgetConfig } from '../hooks/useDashboardLayout';
import { type EntityData } from '../hooks/useAllEntities';

// Import des widgets
import { FuturisticWeatherWidget } from './widgets/FuturisticWeatherWidget';
import { DebugWeatherWidget } from './widgets/DebugWeatherWidget';

interface WidgetRendererProps {
  widget: WidgetConfig;
  entities: EntityData[];
  entitiesByDomain: Record<string, EntityData[]>;
  onConfigClick?: () => void;
}

export const WidgetRenderer: React.FC<WidgetRendererProps> = ({
  widget,
  entities,
  entitiesByDomain,
  onConfigClick
}) => {
  console.log(`🎨 Rendu widget: ${widget.type} - ${widget.title}`);
  console.log(`🔍 Entité configurée: ${widget.entity_id}`);

  try {
    switch (widget.type) {
      case 'weather-futuristic':
        console.log('🌦️ Rendu widget météo futuriste');
        return (
          <FuturisticWeatherWidget
            widget={widget}
            entities={entities}
            entitiesByDomain={entitiesByDomain}
          />
        );

      case 'weather-debug':
        console.log('🔍 Rendu widget météo debug');
        return (
          <DebugWeatherWidget
            widget={widget}
            entities={entities}
            entitiesByDomain={entitiesByDomain}
          />
        );

      case 'weather':
        console.log('🌤️ Rendu widget météo standard');
        return (
          <div className="widget-weather-standard">
            <div className="widget-header">
              <h3>{widget.title}</h3>
              {onConfigClick && (
                <button onClick={onConfigClick} className="config-btn">⚙️</button>
              )}
            </div>
            <div className="weather-content">
              <div className="weather-icon">🌤️</div>
              <div className="weather-info">
                <div className="temperature">
                  {widget.entity_id ? 
                    entities.find(e => e.entity_id === widget.entity_id)?.attributes?.temperature || 'N/A'
                    : 'No Entity'
                  }°
                </div>
                <div className="location">
                  {widget.entity_id?.split('.')[1] || 'Unknown'}
                </div>
              </div>
            </div>
            <style jsx>{`
              .widget-weather-standard {
                background: linear-gradient(135deg, #74b9ff, #0984e3);
                border-radius: 16px;
                padding: 16px;
                color: white;
                height: 100%;
                display: flex;
                flex-direction: column;
              }
              .widget-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 16px;
              }
              .config-btn {
                background: rgba(255,255,255,0.2);
                border: none;
                border-radius: 8px;
                padding: 4px 8px;
                color: white;
                cursor: pointer;
              }
              .weather-content {
                display: flex;
                align-items: center;
                gap: 16px;
                flex: 1;
              }
              .weather-icon {
                font-size: 3rem;
              }
              .temperature {
                font-size: 2rem;
                font-weight: bold;
              }
              .location {
                opacity: 0.8;
                font-size: 0.9rem;
              }
            `}</style>
          </div>
        );

      case 'entity':
        return (
          <div className="widget-entity">
            <div className="widget-header">
              <h3>{widget.title}</h3>
              {onConfigClick && (
                <button onClick={onConfigClick} className="config-btn">⚙️</button>
              )}
            </div>
            <div className="entity-content">
              {widget.entity_id ? (
                (() => {
                  const entity = entities.find(e => e.entity_id === widget.entity_id);
                  return entity ? (
                    <div>
                      <div className="entity-state">{entity.state}</div>
                      <div className="entity-name">{entity.friendly_name}</div>
                    </div>
                  ) : (
                    <div className="entity-error">Entité non trouvée</div>
                  );
                })()
              ) : (
                <div className="entity-error">Aucune entité configurée</div>
              )}
            </div>
            <style jsx>{`
              .widget-entity {
                background: #f8f9fa;
                border-radius: 12px;
                padding: 16px;
                height: 100%;
                display: flex;
                flex-direction: column;
                border: 2px solid #e0e0e0;
              }
              .widget-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 16px;
              }
              .config-btn {
                background: #e9ecef;
                border: none;
                border-radius: 6px;
                padding: 4px 8px;
                cursor: pointer;
              }
              .entity-content {
                flex: 1;
                display: flex;
                flex-direction: column;
                justify-content: center;
                text-align: center;
              }
              .entity-state {
                font-size: 1.5rem;
                font-weight: bold;
                color: #28a745;
                margin-bottom: 8px;
              }
              .entity-name {
                color: #666;
                font-size: 0.9rem;
              }
              .entity-error {
                color: #dc3545;
                font-style: italic;
              }
            `}</style>
          </div>
        );

      case 'stats':
        return (
          <div className="widget-stats">
            <div className="widget-header">
              <h3>{widget.title}</h3>
              {onConfigClick && (
                <button onClick={onConfigClick} className="config-btn">⚙️</button>
              )}
            </div>
            <div className="stats-grid">
              {entitiesByDomain.sensor?.slice(0, widget.config.maxEntities || 4).map(entity => (
                <div key={entity.entity_id} className="stat-item">
                  <div className="stat-value">{entity.state}</div>
                  <div className="stat-name">{entity.friendly_name}</div>
                </div>
              ))}
            </div>
            <style jsx>{`
              .widget-stats {
                background: white;
                border-radius: 12px;
                padding: 16px;
                height: 100%;
                border: 2px solid #e0e0e0;
              }
              .widget-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 16px;
              }
              .config-btn {
                background: #e9ecef;
                border: none;
                border-radius: 6px;
                padding: 4px 8px;
                cursor: pointer;
              }
              .stats-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 12px;
              }
              .stat-item {
                text-align: center;
                padding: 8px;
                background: #f8f9fa;
                border-radius: 8px;
              }
              .stat-value {
                font-weight: bold;
                color: #007bff;
              }
              .stat-name {
                font-size: 0.8rem;
                color: #666;
                margin-top: 4px;
              }
            `}</style>
          </div>
        );

      case 'controls':
        return (
          <div className="widget-controls">
            <div className="widget-header">
              <h3>{widget.title}</h3>
              {onConfigClick && (
                <button onClick={onConfigClick} className="config-btn">⚙️</button>
              )}
            </div>
            <div className="controls-grid">
              {entitiesByDomain.light?.slice(0, 4).map(entity => (
                <button key={entity.entity_id} className="control-btn">
                  {entity.state === 'on' ? '💡' : '🔘'} {entity.friendly_name}
                </button>
              ))}
            </div>
            <style jsx>{`
              .widget-controls {
                background: white;
                border-radius: 12px;
                padding: 16px;
                height: 100%;
                border: 2px solid #e0e0e0;
              }
              .controls-grid {
                display: grid;
                gap: 8px;
              }
              .control-btn {
                background: #f8f9fa;
                border: 1px solid #dee2e6;
                border-radius: 8px;
                padding: 12px;
                cursor: pointer;
                text-align: left;
                transition: background-color 0.2s;
              }
              .control-btn:hover {
                background: #e9ecef;
              }
            `}</style>
          </div>
        );

      case 'profile':
        return (
          <div className="widget-profile">
            <div className="widget-header">
              <h3>{widget.title}</h3>
              {onConfigClick && (
                <button onClick={onConfigClick} className="config-btn">⚙️</button>
              )}
            </div>
            <div className="profile-content">
              <div className="profile-avatar">👤</div>
              <div className="profile-info">
                <div className="profile-name">Dashboard User</div>
                <div className="profile-status">🟢 En ligne</div>
              </div>
            </div>
            <style jsx>{`
              .widget-profile {
                background: linear-gradient(135deg, #667eea, #764ba2);
                border-radius: 12px;
                padding: 16px;
                height: 100%;
                color: white;
              }
              .profile-content {
                display: flex;
                align-items: center;
                gap: 16px;
                margin-top: 16px;
              }
              .profile-avatar {
                font-size: 3rem;
                background: rgba(255,255,255,0.2);
                border-radius: 50%;
                width: 60px;
                height: 60px;
                display: flex;
                align-items: center;
                justify-content: center;
              }
              .profile-name {
                font-weight: bold;
                font-size: 1.1rem;
              }
              .profile-status {
                opacity: 0.8;
                font-size: 0.9rem;
              }
            `}</style>
          </div>
        );

      default:
        console.warn(`❌ Type de widget non reconnu: ${widget.type}`);
        return (
          <div className="widget-unknown">
            <div className="widget-header">
              <h3>{widget.title}</h3>
              {onConfigClick && (
                <button onClick={onConfigClick} className="config-btn">⚙️</button>
              )}
            </div>
            <div className="unknown-content">
              <div className="unknown-icon">❓</div>
              <div>Widget non reconnu: {widget.type}</div>
            </div>
            <style jsx>{`
              .widget-unknown {
                background: #f8d7da;
                border: 2px solid #f5c6cb;
                border-radius: 12px;
                padding: 16px;
                height: 100%;
                color: #721c24;
              }
              .unknown-content {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 100%;
                text-align: center;
              }
              .unknown-icon {
                font-size: 2rem;
                margin-bottom: 8px;
              }
            `}</style>
          </div>
        );
    }
  } catch (error) {
    console.error(`❌ Erreur rendu widget ${widget.type}:`, error);
    return (
      <div className="widget-error">
        <h3>Erreur de Rendu</h3>
        <div>Widget: {widget.type}</div>
        <div>Erreur: {error instanceof Error ? error.message : 'Inconnue'}</div>
        <style jsx>{`
          .widget-error {
            background: #f8d7da;
            border: 2px solid #f5c6cb;
            border-radius: 12px;
            padding: 16px;
            height: 100%;
            color: #721c24;
          }
        `}</style>
      </div>
    );
  }
};
