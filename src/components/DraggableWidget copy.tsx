// DraggableWidget.tsx - Mise à jour complète pour supporter tous les widgets
import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { type WidgetConfig } from '../hooks/useDashboardLayout';
import { type EntityData } from '../hooks/useAllEntities';

// ✅ Import des widgets
import { FuturisticWeatherWidget } from './widgets/FuturisticWeatherWidget';
import { DebugWeatherWidget } from './widgets/DebugWeatherWidget';

interface DraggableWidgetProps {
  widget: WidgetConfig;
  entityData?: EntityData;
  allEntities: EntityData[];
  isEditing?: boolean;
  onEdit?: (widget: WidgetConfig) => void;
  onDelete?: (widgetId: string) => void;
  onTitleEdit?: (widgetId: string, newTitle: string) => void;
}

export const DraggableWidget: React.FC<DraggableWidgetProps> = ({
  widget,
  entityData,
  allEntities,
  isEditing,
  onEdit,
  onDelete,
  onTitleEdit
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(widget.title);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleTitleSave = () => {
    onTitleEdit?.(widget.id, tempTitle);
    setIsEditingTitle(false);
  };

  const handleTitleCancel = () => {
    setTempTitle(widget.title);
    setIsEditingTitle(false);
  };

  // ✅ RENDERER DE WIDGETS INTÉGRÉ
  const renderWidgetContent = () => {
    console.log(`🎨 DraggableWidget - Rendu widget: ${widget.type} (${widget.id})`);

    try {
      switch (widget.type) {
        // ✅ WIDGET MÉTÉO FUTURISTE
        case 'weather-futuristic':
          console.log('🌦️ Rendu FuturisticWeatherWidget');
          
          const config = widget.config as any;
          
          // Recherche entité météo avec fallbacks intelligents
          let weatherEntity: EntityData | undefined;
          
          // 1. Entité configurée
          if (config?.weatherEntity) {
            weatherEntity = allEntities.find(e => e.entity_id === config.weatherEntity);
            console.log(`🔍 Recherche ${config.weatherEntity}:`, weatherEntity ? 'TROUVÉ' : 'INTROUVABLE');
          }
          
          // 2. Fallback sur entity_id du widget
          if (!weatherEntity && widget.entity_id) {
            weatherEntity = allEntities.find(e => e.entity_id === widget.entity_id);
            console.log(`🔍 Fallback ${widget.entity_id}:`, weatherEntity ? 'TROUVÉ' : 'INTROUVABLE');
          }
          
          // 3. Fallback sur weather.chancelade
          if (!weatherEntity) {
            weatherEntity = allEntities.find(e => e.entity_id === 'weather.chancelade');
            console.log('🔍 Fallback weather.chancelade:', weatherEntity ? 'TROUVÉ' : 'INTROUVABLE');
          }
          
          // 4. Fallback sur première entité météo disponible
          if (!weatherEntity) {
            const weatherEntities = allEntities.filter(e => e.domain === 'weather');
            if (weatherEntities.length > 0) {
              weatherEntity = weatherEntities[0];
              console.log(`🔍 Fallback première météo ${weatherEntity.entity_id}:`, 'TROUVÉ');
            }
          }

          console.log(`✅ Entité finale sélectionnée:`, weatherEntity?.entity_id);

          // Mode Debug si pas d'entité
          if (!weatherEntity) {
            console.log('🐛 Mode DEBUG - Aucune entité météo disponible');
            return (
              <DebugWeatherWidget
                weatherEntity={undefined}
                allEntities={allEntities}
                className="widget-content"
              />
            );
          }

          // Rendu normal
          console.log('✨ Rendu FuturisticWeatherWidget avec:', weatherEntity.entity_id);
          return (
            <FuturisticWeatherWidget
              weatherEntity={weatherEntity}
              temperatureEntity={undefined} // Utilise les attributs de l'entité météo
              humidityEntity={undefined}    // Utilise les attributs de l'entité météo
              className="widget-content"
            />
          );

        // ✅ WIDGET MÉTÉO DEBUG
        case 'weather-debug':
          console.log('🔍 Rendu DebugWeatherWidget');
          const debugWeatherEntity = allEntities.find(e => e.entity_id === 'weather.chancelade') ||
                                   allEntities.filter(e => e.domain === 'weather')[0];
          return (
            <DebugWeatherWidget
              weatherEntity={debugWeatherEntity}
              allEntities={allEntities}
              className="widget-content"
            />
          );

        // ✅ WIDGET MÉTÉO CLASSIQUE
        case 'weather':
          console.log('🌤️ Rendu widget météo classique');
          const classicWeatherEntity = entityData ||
            allEntities.find(e => e.entity_id === widget.entity_id) ||
            allEntities.find(e => e.entity_id === 'weather.chancelade');

          if (!classicWeatherEntity) {
            return (
              <div className="widget-error">
                <h3>⚠️ Entité météo manquante</h3>
                <p>Configurez une entité météo</p>
                {isEditing && (
                  <button onClick={() => onEdit?.(widget)}>⚙️ Configurer</button>
                )}
              </div>
            );
          }

          return (
            <div className="weather-widget-classic">
              <div className="weather-header">
                <h3>🌤️ {classicWeatherEntity.friendly_name}</h3>
                <span className="weather-state">{classicWeatherEntity.state}</span>
              </div>
              <div className="weather-main">
                <div className="weather-icon">
                  {classicWeatherEntity.state === 'clear-night' ? '🌙' :
                   classicWeatherEntity.state.includes('sunny') ? '☀️' :
                   classicWeatherEntity.state.includes('cloud') ? '☁️' :
                   classicWeatherEntity.state.includes('rain') ? '🌧️' : '🌤️'}
                </div>
                <div className="weather-temp">
                  {classicWeatherEntity.attributes?.temperature || '--'}°
                </div>
              </div>
              <div className="weather-details">
                {classicWeatherEntity.attributes?.humidity && (
                  <div className="detail">💧 {classicWeatherEntity.attributes.humidity}%</div>
                )}
                {classicWeatherEntity.attributes?.wind_speed && (
                  <div className="detail">💨 {classicWeatherEntity.attributes.wind_speed} km/h</div>
                )}
              </div>
            </div>
          );

        // ✅ WIDGET ENTITÉ
        case 'entity':
          console.log('📊 Rendu widget entité');
          const entity = entityData || 
            (widget.entity_id ? allEntities.find(e => e.entity_id === widget.entity_id) : undefined);
          
          if (!entity) {
            return (
              <div className="widget-error">
                <h3>⚠️ Entité introuvable</h3>
                <p>ID: {widget.entity_id}</p>
                {isEditing && (
                  <button onClick={() => onEdit?.(widget)}>⚙️ Configurer</button>
                )}
              </div>
            );
          }

          return (
            <div className="entity-widget">
              <div className="entity-header">
                <h3>{entity.friendly_name}</h3>
                <span className="entity-domain">{entity.domain}</span>
              </div>
              <div className="entity-state">
                <div className="state-value">{entity.state}</div>
                <div className="state-unit">
                  {entity.attributes?.unit_of_measurement}
                </div>
              </div>
              <div className="entity-updated">
                Mis à jour: {new Date(entity.last_updated).toLocaleTimeString()}
              </div>
            </div>
          );

        // ✅ WIDGET STATISTIQUES
        case 'stats':
          console.log('📈 Rendu widget stats');
          const sensors = allEntities.filter(e => e.domain === 'sensor').slice(0, widget.config?.maxEntities || 4);
          
          return (
            <div className="stats-widget">
              <div className="stats-header">
                <h3>{widget.title}</h3>
              </div>
              <div className="stats-grid">
                {sensors.map(sensor => (
                  <div key={sensor.entity_id} className="stat-item">
                    <div className="stat-value">{sensor.state}</div>
                    <div className="stat-name">{sensor.friendly_name}</div>
                    <div className="stat-unit">{sensor.attributes?.unit_of_measurement}</div>
                  </div>
                ))}
              </div>
            </div>
          );

        // ✅ WIDGET CONTRÔLES
        case 'controls':
          console.log('🎛️ Rendu widget contrôles');
          const controllableEntities = allEntities
            .filter(e => ['light', 'switch', 'fan', 'cover'].includes(e.domain))
            .slice(0, widget.config?.maxControls || 4);
            
          return (
            <div className="controls-widget">
              <div className="controls-header">
                <h3>{widget.title}</h3>
              </div>
              <div className="controls-grid">
                {controllableEntities.map(controlEntity => (
                  <button key={controlEntity.entity_id} className="control-btn">
                    <span className="control-icon">
                      {controlEntity.domain === 'light' ? '💡' :
                       controlEntity.domain === 'switch' ? '🔘' :
                       controlEntity.domain === 'fan' ? '🌀' :
                       controlEntity.domain === 'cover' ? '🪟' : '⚙️'}
                    </span>
                    <span className="control-name">{controlEntity.friendly_name}</span>
                    <span className="control-state">{controlEntity.state}</span>
                  </button>
                ))}
              </div>
            </div>
          );

        // ✅ WIDGET PROFIL
        case 'profile':
          console.log('👤 Rendu widget profil');
          return (
            <div className="profile-widget">
              <div className="profile-content">
                <div className="profile-avatar">👤</div>
                <div className="profile-info">
                  <div className="profile-name">Dashboard User</div>
                  <div className="profile-status">🟢 En ligne</div>
                  <div className="profile-stats">
                    {allEntities.length} entités
                  </div>
                </div>
              </div>
            </div>
          );

        // ✅ WIDGET NON RECONNU
        default:
          console.warn(`❌ Type de widget non reconnu: ${widget.type}`);
          return (
            <div className="widget-fallback">
              <div className="fallback-content">
                <div className="fallback-icon">🔧</div>
                <div className="fallback-title">{widget.title}</div>
                <div className="fallback-type">Type: {widget.type}</div>
                <div className="fallback-message">Widget personnalisé</div>
                <div className="fallback-action">Configurez-moi !</div>
                {isEditing && (
                  <button onClick={() => onEdit?.(widget)} className="config-btn">
                    ⚙️ Configurer
                  </button>
                )}
              </div>
            </div>
          );
      }
    } catch (error) {
      console.error(`❌ Erreur rendu widget ${widget.type}:`, error);
      return (
        <div className="widget-error">
          <h3>❌ Erreur de Rendu</h3>
          <div>Widget: {widget.type}</div>
          <div>Erreur: {error instanceof Error ? error.message : 'Inconnue'}</div>
          {isEditing && (
            <button onClick={() => onEdit?.(widget)} className="config-btn">
              ⚙️ Configurer
            </button>
          )}
        </div>
      );
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`draggable-widget ${widget.type} ${isEditing ? 'editing' : ''}`}
      {...(isEditing ? { ...attributes, ...listeners } : {})}
    >
      {/* En-tête d'édition */}
      {isEditing && (
        <div className="widget-edit-header">
          {isEditingTitle ? (
            <div className="title-edit">
              <input
                type="text"
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleTitleSave()}
                onBlur={handleTitleSave}
                autoFocus
              />
              <button onClick={handleTitleSave} className="save-btn">✓</button>
              <button onClick={handleTitleCancel} className="cancel-btn">✕</button>
            </div>
          ) : (
            <h3 
              onClick={() => setIsEditingTitle(true)}
              className="widget-title-editable"
              title="Cliquer pour modifier le titre"
            >
              {widget.title}
            </h3>
          )}
          
          <div className="widget-controls">
            <button 
              onClick={() => onEdit?.(widget)}
              className="edit-btn"
              title="Configurer"
            >
              ⚙️
            </button>
            <button 
              onClick={() => onDelete?.(widget.id)}
              className="delete-btn"
              title="Supprimer"
            >
              🗑️
            </button>
            <div className="drag-handle" {...attributes} {...listeners}>
              ⋮⋮
            </div>
          </div>
        </div>
      )}

      {/* Contenu du widget */}
      <div className="widget-content">
        {renderWidgetContent()}
      </div>

      <style jsx>{`
        .draggable-widget {
          background: ${widget.type === 'weather-futuristic' ? 'transparent' : 'white'};
          border-radius: ${widget.type === 'weather-futuristic' ? '24px' : '12px'};
          box-shadow: ${widget.type === 'weather-futuristic' ? 'none' : '0 4px 12px rgba(0, 0, 0, 0.1)'};
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
          width: ${widget.size.width * 300 + (widget.size.width - 1) * 16}px;
          height: ${widget.size.height * 250 + (widget.size.height - 1) * 16}px;
          position: relative;
        }

        .draggable-widget.editing {
          border: 2px solid #1fb8cd;
          cursor: grab;
        }

        .draggable-widget.editing:active {
          cursor: grabbing;
        }

        .widget-edit-header {
          position: absolute;
          top: -40px;
          left: 0;
          right: 0;
          height: 35px;
          background: rgba(31, 184, 205, 0.9);
          backdrop-filter: blur(10px);
          border-radius: 8px 8px 0 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 12px;
          z-index: 100;
          color: white;
          font-size: 12px;
        }

        .widget-title-editable {
          margin: 0;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 4px;
          transition: background-color 0.2s;
          flex: 1;
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .widget-title-editable:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .title-edit {
          display: flex;
          align-items: center;
          gap: 4px;
          flex: 1;
        }

        .title-edit input {
          background: white;
          color: #333;
          border: none;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          flex: 1;
        }

        .save-btn,
        .cancel-btn {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          padding: 2px 4px;
          border-radius: 2px;
          font-size: 12px;
        }

        .save-btn:hover {
          background: rgba(40, 167, 69, 0.8);
        }

        .cancel-btn:hover {
          background: rgba(220, 53, 69, 0.8);
        }

        .widget-controls {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .edit-btn,
        .delete-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          font-size: 14px;
          transition: background-color 0.2s;
        }

        .edit-btn:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .delete-btn:hover {
          background: rgba(220, 53, 69, 0.8);
        }

        .drag-handle {
          cursor: grab;
          padding: 4px;
          border-radius: 4px;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.8);
          transition: all 0.2s;
        }

        .drag-handle:hover {
          background: rgba(255, 255, 255, 0.2);
          color: white;
        }

        .drag-handle:active {
          cursor: grabbing;
        }

        .widget-content {
          height: 100%;
          width: 100%;
          position: relative;
          overflow: hidden;
          border-radius: ${widget.type === 'weather-futuristic' ? '24px' : '12px'};
        }

        /* Widget Weather Classic */
        .weather-widget-classic {
          background: linear-gradient(135deg, #74b9ff, #0984e3);
          color: white;
          padding: 16px;
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .weather-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .weather-header h3 {
          margin: 0;
          font-size: 16px;
        }

        .weather-state {
          font-size: 12px;
          opacity: 0.9;
          text-transform: capitalize;
        }

        .weather-main {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          margin: 20px 0;
        }

        .weather-icon {
          font-size: 48px;
        }

        .weather-temp {
          font-size: 36px;
          font-weight: bold;
        }

        .weather-details {
          display: flex;
          justify-content: space-around;
          gap: 12px;
        }

        .detail {
          font-size: 14px;
          opacity: 0.9;
        }

        /* Widget Entity */
        .entity-widget {
          padding: 16px;
          background: white;
          height: 100%;
          display: flex;
          flex-direction: column;
          border: 2px solid #e0e0e0;
        }

        .entity-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .entity-header h3 {
          margin: 0;
          font-size: 16px;
          color: #333;
        }

        .entity-domain {
          background: #e9ecef;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 10px;
          color: #666;
        }

        .entity-state {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
        }

        .state-value {
          font-size: 32px;
          font-weight: bold;
          color: #1fb8cd;
          margin-bottom: 4px;
        }

        .state-unit {
          font-size: 14px;
          color: #666;
        }

        .entity-updated {
          font-size: 10px;
          color: #999;
          text-align: center;
          margin-top: 8px;
        }

        /* Widget Stats */
        .stats-widget {
          padding: 16px;
          background: white;
          height: 100%;
          border: 2px solid #e0e0e0;
        }

        .stats-header h3 {
          margin: 0 0 16px 0;
          color: #333;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        .stat-item {
          text-align: center;
          padding: 12px 8px;
          background: #f8f9fa;
          border-radius: 8px;
          border: 1px solid #e9ecef;
        }

        .stat-value {
          font-weight: bold;
          color: #007bff;
          font-size: 18px;
        }

        .stat-name {
          font-size: 10px;
          color: #666;
          margin: 4px 0 2px 0;
        }

        .stat-unit {
          font-size: 9px;
          color: #999;
        }

        /* Widget Controls */
        .controls-widget {
          padding: 16px;
          background: white;
          height: 100%;
          border: 2px solid #e0e0e0;
        }

        .controls-header h3 {
          margin: 0 0 16px 0;
          color: #333;
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
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .control-btn:hover {
          background: #e9ecef;
          transform: translateY(-1px);
        }

        .control-icon {
          font-size: 20px;
        }

        .control-name {
          flex: 1;
          font-size: 12px;
          font-weight: 500;
        }

        .control-state {
          font-size: 10px;
          color: #666;
          text-transform: uppercase;
        }

        /* Widget Profile */
        .profile-widget {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          padding: 16px;
          height: 100%;
        }

        .profile-content {
          display: flex;
          align-items: center;
          gap: 16px;
          height: 100%;
        }

        .profile-avatar {
          font-size: 48px;
          background: rgba(255,255,255,0.2);
          border-radius: 50%;
          width: 80px;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .profile-name {
          font-weight: bold;
          font-size: 18px;
          margin-bottom: 4px;
        }

        .profile-status {
          opacity: 0.9;
          font-size: 14px;
          margin-bottom: 8px;
        }

        .profile-stats {
          opacity: 0.8;
          font-size: 12px;
        }

        /* Widget Fallback */
        .widget-fallback {
          padding: 16px;
          background: #f8f9fa;
          border: 2px dashed #dee2e6;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          color: #666;
        }

        .fallback-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .fallback-icon {
          font-size: 48px;
          opacity: 0.5;
        }

        .fallback-title {
          font-weight: 600;
          color: #333;
        }

        .fallback-type {
          font-size: 12px;
          color: #999;
        }

        .fallback-message,
        .fallback-action {
          font-size: 14px;
        }

        .config-btn {
          background: #1fb8cd;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          margin-top: 12px;
          font-size: 12px;
        }

        /* Widget Error */
        .widget-error {
          padding: 16px;
          background: #fff3cd;
          border: 1px solid #ffeaa7;
          color: #856404;
          text-align: center;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        .widget-error h3 {
          margin: 0 0 8px 0;
          color: #856404;
        }

        .widget-error button {
          background: #1fb8cd;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          margin-top: 12px;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .draggable-widget {
            width: calc(100vw - 32px);
            height: ${widget.size.height * 200 + (widget.size.height - 1) * 12}px;
          }

          .widget-edit-header {
            font-size: 11px;
            padding: 0 8px;
            height: 32px;
            top: -35px;
          }

          .widget-controls {
            gap: 4px;
          }

          .weather-main {
            gap: 12px;
          }

          .weather-icon {
            font-size: 36px;
          }

          .weather-temp {
            font-size: 28px;
          }

          .profile-avatar {
            width: 60px;
            height: 60px;
            font-size: 36px;
          }

          .profile-name {
            font-size: 16px;
          }
        }

        @media (max-width: 480px) {
          .draggable-widget {
            height: ${widget.size.height * 180 + (widget.size.height - 1) * 10}px;
          }

          .stats-grid,
          .controls-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};