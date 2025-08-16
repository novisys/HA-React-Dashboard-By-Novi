// Sélecteur de widgets et modal de configuration - Version complète avec météo futuriste
import React, { useState, useMemo } from 'react';
import { type WidgetConfig } from '../hooks/useDashboardLayout';
import { type EntityData } from '../hooks/useAllEntities';
import { FuturisticWeatherWidget } from './widgets/FuturisticWeatherWidget';

// ✅ Types de widgets avec météo futuriste
export type WidgetType = 
  | 'weather-futuristic'  // ✅ NOUVEAU : Widget météo futuriste
  | 'weather'
  | 'entity'
  | 'stats'
  | 'controls'
  | 'profile'
  | 'light-control'
  | 'climate-control'
  | 'media-player'
  | 'camera'
  | 'gauge'
  | 'custom';

// ✅ Configuration spécifique météo futuriste
interface WeatherFuturisticConfig {
  weatherEntity: string;
  temperatureEntity?: string;
  humidityEntity?: string;
  location?: string;
  showForecast?: boolean;
  showDetails?: boolean;
}

// Interface pour les templates de widgets
interface WidgetTemplate {
  type: WidgetType;
  title: string;
  description: string;
  icon: string;
  requiresEntity: boolean;
  entityDomains: string[];
  defaultSize: { width: number; height: number };
  defaultConfig: Record<string, any>;
  category: string;
}

// ✅ Templates de widgets avec météo futuriste
export const WIDGET_TEMPLATES: WidgetTemplate[] = [
  // ✅ NOUVEAU : Widget Météo Futuriste (priorité 1)
  {
    type: 'weather-futuristic',
    title: '🌦️ Météo Futuriste',
    description: 'Widget météo avec animations et effets visuels dynamiques selon les conditions',
    icon: '🌦️',
    requiresEntity: true,
    entityDomains: ['weather'],
    defaultSize: { width: 2, height: 2 }, // Plus grand pour l'effet visuel
    defaultConfig: { 
      weatherEntity: '',
      temperatureEntity: '',
      humidityEntity: '',
      location: 'Maison',
      showForecast: true,
      showDetails: true
    } as WeatherFuturisticConfig,
    category: 'weather'
  },
  // Widget météo classique (conservé)
  {
    type: 'weather',
    title: '🌤️ Météo Classique',
    description: 'Affiche les informations météorologiques de base',
    icon: '🌤️',
    requiresEntity: true,
    entityDomains: ['weather'],
    defaultSize: { width: 1, height: 1 },
    defaultConfig: { showForecast: true, showHumidity: true },
    category: 'weather'
  },
  {
    type: 'entity',
    title: '📊 Widget Entité',
    description: 'Affiche l\'état d\'une entité spécifique',
    icon: '📊',
    requiresEntity: true,
    entityDomains: ['sensor', 'binary_sensor', 'light', 'switch', 'fan', 'cover'],
    defaultSize: { width: 1, height: 1 },
    defaultConfig: { showLastUpdated: true },
    category: 'general'
  },
  {
    type: 'light-control',
    title: '💡 Contrôle Lumière',
    description: 'Widget de contrôle avancé pour lumières avec variateur',
    icon: '💡',
    requiresEntity: true,
    entityDomains: ['light'],
    defaultSize: { width: 1, height: 1 },
    defaultConfig: { showBrightness: true, showColorPicker: true },
    category: 'controls'
  },
  {
    type: 'climate-control',
    title: '🌡️ Contrôle Climat',
    description: 'Thermostat visuel pour contrôler la température',
    icon: '🌡️',
    requiresEntity: true,
    entityDomains: ['climate'],
    defaultSize: { width: 1, height: 1 },
    defaultConfig: { showHumidity: true, showMode: true },
    category: 'controls'
  },
  {
    type: 'media-player',
    title: '🎵 Lecteur Média',
    description: 'Contrôle des lecteurs multimédia avec informations de lecture',
    icon: '🎵',
    requiresEntity: true,
    entityDomains: ['media_player'],
    defaultSize: { width: 2, height: 1 },
    defaultConfig: { showAlbumArt: true, showProgress: true },
    category: 'media'
  },
  {
    type: 'stats',
    title: '📈 Statistiques',
    description: 'Affiche plusieurs capteurs sous forme de grille',
    icon: '📈',
    requiresEntity: false,
    entityDomains: ['sensor'],
    defaultSize: { width: 1, height: 1 },
    defaultConfig: { maxEntities: 4, showDaily: true },
    category: 'general'
  },
  {
    type: 'controls',
    title: '🎛️ Contrôles',
    description: 'Boutons pour contrôler des appareils',
    icon: '🎛️',
    requiresEntity: false,
    entityDomains: ['light', 'switch', 'fan', 'cover'],
    defaultSize: { width: 1, height: 1 },
    defaultConfig: { maxControls: 4, showState: true },
    category: 'controls'
  },
  {
    type: 'camera',
    title: '📹 Caméra',
    description: 'Affichage du flux vidéo d\'une caméra',
    icon: '📹',
    requiresEntity: true,
    entityDomains: ['camera'],
    defaultSize: { width: 2, height: 1 },
    defaultConfig: { showControls: true, refreshRate: 30 },
    category: 'security'
  },
  {
    type: 'profile',
    title: '👤 Profil',
    description: 'Informations utilisateur et système',
    icon: '👤',
    requiresEntity: false,
    entityDomains: ['person'],
    defaultSize: { width: 1, height: 1 },
    defaultConfig: { showStats: true },
    category: 'general'
  }
];

// Catégories pour l'organisation des widgets
const WIDGET_CATEGORIES = [
  { id: 'all', name: 'Tous', icon: '🏠' },
  { id: 'weather', name: 'Météo', icon: '🌦️' },
  { id: 'controls', name: 'Contrôles', icon: '🎛️' },
  { id: 'media', name: 'Multimédia', icon: '🎵' },
  { id: 'security', name: 'Sécurité', icon: '🔒' },
  { id: 'general', name: 'Général', icon: '📊' }
];

// ✅ Rendu des widgets avec support météo futuriste
interface WidgetRendererProps {
  widget: WidgetConfig;
  entityData?: EntityData;
  allEntities: EntityData[];
  isEditing?: boolean;
  onEdit?: (widget: WidgetConfig) => void;
  onDelete?: (widgetId: string) => void;
}

export const WidgetRenderer: React.FC<WidgetRendererProps> = ({
  widget,
  entityData,
  allEntities,
  isEditing,
  onEdit,
  onDelete
}) => {
  // ✅ Rendu du widget météo futuriste
  if (widget.type === 'weather-futuristic') {
    const config = widget.config as WeatherFuturisticConfig;
    
    // Recherche des entités météo
    const weatherEntity = allEntities.find(e => e.entity_id === config.weatherEntity);
    const temperatureEntity = config.temperatureEntity 
      ? allEntities.find(e => e.entity_id === config.temperatureEntity)
      : undefined;
    const humidityEntity = config.humidityEntity
      ? allEntities.find(e => e.entity_id === config.humidityEntity)
      : undefined;

    if (!weatherEntity) {
      return (
        <div className="widget-error">
          <h3>⚠️ Configuration requise</h3>
          <p>Veuillez configurer une entité météo</p>
          {isEditing && (
            <button onClick={() => onEdit?.(widget)} className="config-btn">
              ⚙️ Configurer
            </button>
          )}
          <style jsx>{`
            .widget-error {
              padding: 20px;
              text-align: center;
              background: #fff3cd;
              border: 1px solid #ffeaa7;
              border-radius: 8px;
              color: #856404;
            }
            .config-btn {
              background: #1fb8cd;
              color: white;
              border: none;
              padding: 8px 16px;
              border-radius: 4px;
              cursor: pointer;
              margin-top: 12px;
            }
          `}</style>
        </div>
      );
    }

    return (
      <FuturisticWeatherWidget
        weatherEntity={weatherEntity}
        temperatureEntity={temperatureEntity}
        humidityEntity={humidityEntity}
        className="widget-content"
      />
    );
  }

  // Autres widgets (rendu simplifié pour l'exemple)
  return (
    <div className="widget-fallback">
      <div className="widget-header">
        <h3>{widget.title}</h3>
        {entityData && <span className="entity-state">{entityData.state}</span>}
      </div>
      <div className="widget-content">
        <div className="widget-icon">
          {WIDGET_TEMPLATES.find(t => t.type === widget.type)?.icon || '📄'}
        </div>
        <div className="widget-info">
          <span>Type: {widget.type}</span>
          {entityData && <span>Entité: {entityData.friendly_name}</span>}
        </div>
      </div>
      <style jsx>{`
        .widget-fallback {
          padding: 16px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .widget-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        .widget-header h3 {
          margin: 0;
          font-size: 16px;
          color: #333;
        }
        .entity-state {
          font-weight: 600;
          color: #1fb8cd;
        }
        .widget-content {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .widget-icon {
          font-size: 32px;
        }
        .widget-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
          font-size: 12px;
          color: #666;
        }
      `}</style>
    </div>
  );
};

// ✅ Sélecteur de widgets avec météo futuriste
interface WidgetSelectorProps {
  entities: EntityData[];
  entitiesByDomain: Record<string, EntityData[]>;
  onSelectWidget: (widget: Partial<WidgetConfig>) => void;
  onClose: () => void;
}

export const WidgetSelector: React.FC<WidgetSelectorProps> = ({
  entities,
  entitiesByDomain,
  onSelectWidget,
  onClose
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<WidgetTemplate | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<string>('');
  const [widgetTitle, setWidgetTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrage des widgets par catégorie et recherche
  const filteredTemplates = useMemo(() => {
    let filtered = WIDGET_TEMPLATES;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(template => template.category === selectedCategory);
    }

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(template => 
        template.title.toLowerCase().includes(search) ||
        template.description.toLowerCase().includes(search)
      );
    }

    return filtered;
  }, [selectedCategory, searchTerm]);

  const handleTemplateSelect = (template: WidgetTemplate) => {
    setSelectedTemplate(template);
    setWidgetTitle(template.title);
    setSelectedEntity('');
    
    // Pré-sélection d'entité pour météo futuriste
    if (template.type === 'weather-futuristic') {
      const weatherEntities = entities.filter(e => e.domain === 'weather');
      if (weatherEntities.length > 0) {
        setSelectedEntity(weatherEntities[0].entity_id);
      }
    }
  };

  const handleCreateWidget = () => {
    if (!selectedTemplate) return;

    const newWidget: Partial<WidgetConfig> = {
      type: selectedTemplate.type,
      title: widgetTitle || selectedTemplate.title,
      entity_id: selectedEntity || undefined,
      size: selectedTemplate.defaultSize,
      config: {
        ...selectedTemplate.defaultConfig,
        // Configuration spécifique météo futuriste
        ...(selectedTemplate.type === 'weather-futuristic' && {
          weatherEntity: selectedEntity,
          location: 'Maison'
        })
      }
    };

    onSelectWidget(newWidget);
  };

  const getAvailableEntities = () => {
    if (!selectedTemplate || !selectedTemplate.requiresEntity) return [];
    return entities.filter(entity => 
      selectedTemplate.entityDomains.includes(entity.domain)
    );
  };

  const renderWeatherFuturisticPreview = () => (
    <div className="weather-futuristic-preview">
      <div className="preview-background">
        <div className="preview-particles">
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
        </div>
        <div className="preview-content">
          <div className="preview-icon">🌦️</div>
          <div className="preview-temp">22°</div>
          <div className="preview-condition">Nuageux</div>
          <div className="preview-forecast">
            <span>☀️ 24°</span>
            <span>🌧️ 19°</span>
            <span>⛅ 21°</span>
          </div>
        </div>
      </div>
      <style jsx>{`
        .weather-futuristic-preview {
          height: 120px;
          border-radius: 12px;
          overflow: hidden;
          position: relative;
        }
        .preview-background {
          background: linear-gradient(135deg, #1565C0, #42A5F5);
          height: 100%;
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          color: white;
        }
        .preview-particles {
          position: absolute;
          inset: 0;
        }
        .particle {
          position: absolute;
          width: 3px;
          height: 3px;
          background: rgba(255,255,255,0.6);
          border-radius: 50%;
          animation: float 3s infinite ease-in-out;
        }
        .particle:nth-child(1) { top: 20%; left: 20%; animation-delay: 0s; }
        .particle:nth-child(2) { top: 60%; left: 60%; animation-delay: 1s; }
        .particle:nth-child(3) { top: 80%; left: 30%; animation-delay: 2s; }
        .preview-content {
          text-align: center;
          z-index: 2;
        }
        .preview-icon {
          font-size: 24px;
          margin-bottom: 4px;
        }
        .preview-temp {
          font-size: 20px;
          font-weight: bold;
          margin-bottom: 2px;
        }
        .preview-condition {
          font-size: 12px;
          opacity: 0.9;
          margin-bottom: 8px;
        }
        .preview-forecast {
          display: flex;
          gap: 8px;
          font-size: 10px;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) opacity(0.6); }
          50% { transform: translateY(-10px) opacity(1); }
        }
      `}</style>
    </div>
  );

  return (
    <div className="widget-selector-overlay" onClick={onClose}>
      <div className="widget-selector-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>➕ Ajouter un Widget</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-content">
          {!selectedTemplate ? (
            <div className="template-selection">
              {/* Filtres */}
              <div className="selection-filters">
                <div className="categories">
                  {WIDGET_CATEGORIES.map(category => (
                    <button
                      key={category.id}
                      className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      <span className="category-icon">{category.icon}</span>
                      <span className="category-name">{category.name}</span>
                    </button>
                  ))}
                </div>
                
                <input
                  type="text"
                  placeholder="🔍 Rechercher un widget..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>

              <h3>
                {selectedCategory === 'all' ? 'Tous les widgets' : 
                 WIDGET_CATEGORIES.find(c => c.id === selectedCategory)?.name || 'Widgets'}
                <span className="widget-count">({filteredTemplates.length})</span>
              </h3>

              <div className="templates-grid">
                {filteredTemplates.map(template => {
                  const availableEntities = template.requiresEntity 
                    ? entities.filter(e => template.entityDomains.includes(e.domain)).length
                    : null;
                  const isDisabled = template.requiresEntity && availableEntities === 0;

                  return (
                    <button
                      key={template.type}
                      className={`template-card ${isDisabled ? 'disabled' : ''} ${template.type === 'weather-futuristic' ? 'featured' : ''}`}
                      onClick={() => !isDisabled && handleTemplateSelect(template)}
                      disabled={isDisabled}
                    >
                      <div className="template-preview">
                        {template.type === 'weather-futuristic' ? 
                          renderWeatherFuturisticPreview() :
                          <div className="template-icon">{template.icon}</div>
                        }
                      </div>
                      <div className="template-info">
                        <h4>{template.title}</h4>
                        <p>{template.description}</p>
                        <div className="template-meta">
                          <span className="template-size">
                            {template.defaultSize.width}×{template.defaultSize.height}
                          </span>
                          {template.requiresEntity && availableEntities !== null && (
                            <span className="entity-count">
                              {availableEntities} entité(s)
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            // Configuration du widget sélectionné
            <div className="widget-configuration">
              <button 
                className="back-btn"
                onClick={() => setSelectedTemplate(null)}
              >
                ← Retour
              </button>

              <div className="config-header">
                <div className="config-icon">{selectedTemplate.icon}</div>
                <h3>Configurer {selectedTemplate.title}</h3>
                {selectedTemplate.type === 'weather-futuristic' && (
                  <div className="featured-badge">✨ Nouveau</div>
                )}
              </div>

              <div className="config-form">
                <div className="form-group">
                  <label>Titre du widget</label>
                  <input
                    type="text"
                    value={widgetTitle}
                    onChange={e => setWidgetTitle(e.target.value)}
                    placeholder={selectedTemplate.title}
                  />
                </div>

                {selectedTemplate.requiresEntity && (
                  <div className="form-group">
                    <label>
                      Entité associée
                      {selectedTemplate.type === 'weather-futuristic' && (
                        <span className="label-help"> (entité météo principale)</span>
                      )}
                    </label>
                    <select
                      value={selectedEntity}
                      onChange={e => setSelectedEntity(e.target.value)}
                      required
                    >
                      <option value="">Sélectionnez une entité...</option>
                      {getAvailableEntities().map(entity => (
                        <option key={entity.entity_id} value={entity.entity_id}>
                          {entity.friendly_name} ({entity.entity_id})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Aperçu du widget */}
                <div className="form-preview">
                  <h4>Aperçu</h4>
                  <div className="widget-preview">
                    {selectedTemplate.type === 'weather-futuristic' ? (
                      <div className="preview-weather-futuristic">
                        {renderWeatherFuturisticPreview()}
                        <div className="preview-title">{widgetTitle || selectedTemplate.title}</div>
                      </div>
                    ) : (
                      <div className="preview-widget">
                        <div className="preview-header">
                          <strong>{widgetTitle || selectedTemplate.title}</strong>
                        </div>
                        <div className="preview-content">
                          {selectedTemplate.icon}
                          <span>Widget {selectedTemplate.type}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          {selectedTemplate && (
            <>
              <button className="cancel-btn" onClick={onClose}>
                Annuler
              </button>
              <button 
                className="create-btn"
                onClick={handleCreateWidget}
                disabled={selectedTemplate.requiresEntity && !selectedEntity}
              >
                Créer le Widget
              </button>
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        .widget-selector-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(4px);
        }

        .widget-selector-modal {
          background: white;
          border-radius: 16px;
          max-width: 900px;
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
          font-size: 24px;
          font-weight: 700;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: white;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.2s;
        }

        .close-btn:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .modal-content {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
        }

        .selection-filters {
          margin-bottom: 24px;
        }

        .categories {
          display: flex;
          gap: 8px;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }

        .category-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #f8f9fa;
          border: 2px solid #e9ecef;
          border-radius: 20px;
          padding: 8px 16px;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 14px;
        }

        .category-btn.active {
          background: #1fb8cd;
          border-color: #1fb8cd;
          color: white;
        }

        .category-btn:hover:not(.active) {
          border-color: #1fb8cd;
          background: #e3f2fd;
        }

        .category-icon {
          font-size: 16px;
        }

        .search-input {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 14px;
          transition: border-color 0.2s;
        }

        .search-input:focus {
          outline: none;
          border-color: #1fb8cd;
        }

        .template-selection h3 {
          margin-bottom: 20px;
          color: #333;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .widget-count {
          font-size: 14px;
          color: #666;
          font-weight: normal;
        }

        .templates-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 16px;
        }

        .template-card {
          background: white;
          border: 2px solid #e0e0e0;
          border-radius: 12px;
          padding: 0;
          text-align: left;
          cursor: pointer;
          transition: all 0.3s;
          overflow: hidden;
        }

        .template-card:hover:not(.disabled) {
          border-color: #1fb8cd;
          transform: translateY(-4px);
          box-shadow: 0 12px 30px rgba(31, 184, 205, 0.2);
        }

        .template-card.featured {
          border-color: #ffd700;
          box-shadow: 0 4px 20px rgba(255, 215, 0, 0.3);
        }

        .template-card.featured:hover {
          border-color: #ffd700;
          box-shadow: 0 12px 40px rgba(255, 215, 0, 0.4);
        }

        .template-card.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .template-preview {
          height: 120px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f8f9fa;
        }

        .template-icon {
          font-size: 48px;
        }

        .template-info {
          padding: 16px;
        }

        .template-card h4 {
          margin: 0 0 8px 0;
          color: #1d1d1f;
          font-size: 16px;
          font-weight: 600;
        }

        .template-card p {
          margin: 0 0 12px 0;
          color: #666;
          font-size: 13px;
          line-height: 1.4;
        }

        .template-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .template-size {
          background: #e9ecef;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 12px;
          color: #666;
        }

        .entity-count {
          font-size: 12px;
          color: #1fb8cd;
          font-weight: 500;
        }

        .widget-configuration {
          position: relative;
        }

        .back-btn {
          background: #f8f9fa;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          margin-bottom: 20px;
          color: #666;
          transition: background-color 0.2s;
        }

        .back-btn:hover {
          background: #e9ecef;
        }

        .config-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
          position: relative;
        }

        .config-icon {
          font-size: 2rem;
        }

        .config-header h3 {
          margin: 0;
          color: #1d1d1f;
          flex: 1;
        }

        .featured-badge {
          background: linear-gradient(135deg, #ffd700, #ffed4e);
          color: #333;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          animation: shimmer 2s infinite;
        }

        .config-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group label {
          font-weight: 600;
          color: #333;
          font-size: 14px;
        }

        .label-help {
          font-weight: normal;
          color: #666;
          font-size: 12px;
        }

        .form-group input,
        .form-group select {
          padding: 12px 16px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 14px;
          transition: border-color 0.2s;
        }

        .form-group input:focus,
        .form-group select:focus {
          outline: none;
          border-color: #1fb8cd;
        }

        .form-preview {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 12px;
          margin-top: 20px;
        }

        .form-preview h4 {
          margin: 0 0 16px 0;
          color: #333;
          font-size: 16px;
        }

        .widget-preview {
          display: flex;
          justify-content: center;
        }

        .preview-widget {
          background: white;
          border-radius: 8px;
          padding: 16px;
          min-width: 150px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .preview-header {
          margin-bottom: 12px;
          font-size: 14px;
        }

        .preview-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          font-size: 2rem;
        }

        .preview-content span {
          font-size: 12px;
          color: #666;
        }

        .preview-weather-futuristic {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          min-width: 200px;
        }

        .preview-title {
          font-weight: 600;
          color: #333;
          font-size: 14px;
        }

        .modal-footer {
          padding: 24px;
          border-top: 1px solid #e0e0e0;
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          background: #f8f9fa;
        }

        .cancel-btn,
        .create-btn {
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .cancel-btn {
          background: #6c757d;
          color: white;
        }

        .cancel-btn:hover {
          background: #5a6268;
        }

        .create-btn {
          background: #28a745;
          color: white;
        }

        .create-btn:hover:not(:disabled) {
          background: #218838;
        }

        .create-btn:disabled {
          background: #6c757d;
          cursor: not-allowed;
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }

        @media (max-width: 768px) {
          .templates-grid {
            grid-template-columns: 1fr;
          }
          
          .categories {
            justify-content: center;
          }
          
          .modal-content {
            padding: 16px;
          }
        }
      `}</style>
    </div>
  );
};

// ✅ Modal de configuration spécialisée pour météo futuriste
interface WeatherFuturisticConfigModalProps {
  widget: WidgetConfig;
  entities: EntityData[];
  onSave: (widget: WidgetConfig) => void;
  onClose: () => void;
}

const WeatherFuturisticConfigModal: React.FC<WeatherFuturisticConfigModalProps> = ({
  widget,
  entities,
  onSave,
  onClose
}) => {
  const [config, setConfig] = useState<WeatherFuturisticConfig>(
    widget.config as WeatherFuturisticConfig
  );

  // Filtrer les entités disponibles
  const weatherEntities = entities.filter(e => e.domain === 'weather');
  const temperatureEntities = entities.filter(e => 
    e.domain === 'sensor' && 
    (e.attributes.device_class === 'temperature' || e.entity_id.includes('temperature'))
  );
  const humidityEntities = entities.filter(e => 
    e.domain === 'sensor' && 
    (e.attributes.device_class === 'humidity' || e.entity_id.includes('humidity'))
  );

  const handleSave = () => {
    onSave({
      ...widget,
      config
    });
  };

  return (
    <div className="config-modal-overlay">
      <div className="config-modal">
        <div className="config-header">
          <h3>🌦️ Configuration Météo Futuriste</h3>
          <button onClick={onClose}>✕</button>
        </div>

        <div className="config-content">
          <div className="config-section">
            <label>Entité Météo Principale *</label>
            <select
              value={config.weatherEntity || ''}
              onChange={e => setConfig({...config, weatherEntity: e.target.value})}
              required
            >
              <option value="">Sélectionner une entité météo</option>
              {weatherEntities.map(entity => (
                <option key={entity.entity_id} value={entity.entity_id}>
                  {entity.friendly_name} ({entity.entity_id})
                </option>
              ))}
            </select>
          </div>

          <div className="config-section">
            <label>Entité Température (optionnel)</label>
            <select
              value={config.temperatureEntity || ''}
              onChange={e => setConfig({...config, temperatureEntity: e.target.value})}
            >
              <option value="">Aucune</option>
              {temperatureEntities.map(entity => (
                <option key={entity.entity_id} value={entity.entity_id}>
                  {entity.friendly_name} ({entity.entity_id})
                </option>
              ))}
            </select>
          </div>

          <div className="config-section">
            <label>Entité Humidité (optionnel)</label>
            <select
              value={config.humidityEntity || ''}
              onChange={e => setConfig({...config, humidityEntity: e.target.value})}
            >
              <option value="">Aucune</option>
              {humidityEntities.map(entity => (
                <option key={entity.entity_id} value={entity.entity_id}>
                  {entity.friendly_name} ({entity.entity_id})
                </option>
              ))}
            </select>
          </div>

          <div className="config-section">
            <label>Nom du Lieu</label>
            <input
              type="text"
              value={config.location || ''}
              onChange={e => setConfig({...config, location: e.target.value})}
              placeholder="Maison"
            />
          </div>

          <div className="config-section">
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={config.showForecast ?? true}
                  onChange={e => setConfig({...config, showForecast: e.target.checked})}
                />
                Afficher les prévisions
              </label>
              
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={config.showDetails ?? true}
                  onChange={e => setConfig({...config, showDetails: e.target.checked})}
                />
                Afficher les détails météo
              </label>
            </div>
          </div>
        </div>

        <div className="config-actions">
          <button onClick={onClose} className="btn-cancel">
            Annuler
          </button>
          <button 
            onClick={handleSave} 
            className="btn-save"
            disabled={!config.weatherEntity}
          >
            💾 Sauvegarder
          </button>
        </div>
      </div>

      <style jsx>{`
        .config-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .config-modal {
          background: white;
          border-radius: 16px;
          width: 90vw;
          max-width: 500px;
          max-height: 80vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        .config-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          background: linear-gradient(135deg, #1fb8cd, #17a2b8);
          color: white;
        }

        .config-header h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 700;
        }

        .config-header button {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          padding: 8px;
          border-radius: 50%;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .config-content {
          flex: 1;
          padding: 24px;
          overflow-y: auto;
        }

        .config-section {
          margin-bottom: 20px;
        }

        .config-section label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #333;
          font-size: 14px;
        }

        .config-section select,
        .config-section input {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 14px;
          transition: border-color 0.2s;
        }

        .config-section select:focus,
        .config-section input:focus {
          outline: none;
          border-color: #1fb8cd;
        }

        .checkbox-group {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }

        .checkbox-label input {
          width: auto;
        }

        .config-actions {
          padding: 20px 24px;
          background: #f8f9fa;
          border-top: 1px solid #e0e0e0;
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        }

        .btn-cancel,
        .btn-save {
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-cancel {
          background: #6c757d;
          color: white;
        }

        .btn-cancel:hover {
          background: #5a6268;
        }

        .btn-save {
          background: #28a745;
          color: white;
        }

        .btn-save:hover:not(:disabled) {
          background: #218838;
        }

        .btn-save:disabled {
          background: #6c757d;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

// ✅ Modal de configuration générale (étendue pour météo futuriste)
interface WidgetConfigModalProps {
  widget: WidgetConfig;
  entities: EntityData[];
  entitiesByDomain: Record<string, EntityData[]>;
  onSave: (widget: WidgetConfig) => void;
  onClose: () => void;
}

export const WidgetConfigModal: React.FC<WidgetConfigModalProps> = ({
  widget,
  entities,
  entitiesByDomain,
  onSave,
  onClose
}) => {
  // Configuration spécifique météo futuriste
  if (widget.type === 'weather-futuristic') {
    return (
      <WeatherFuturisticConfigModal
        widget={widget}
        entities={entities}
        onSave={onSave}
        onClose={onClose}
      />
    );
  }

  // Configuration générale pour autres widgets
  const [editedWidget, setEditedWidget] = useState<WidgetConfig>({ ...widget });
  const [activeTab, setActiveTab] = useState<'general' | 'display' | 'advanced'>('general');

  const handleSave = () => {
    onSave(editedWidget);
  };

  const updateWidget = (updates: Partial<WidgetConfig>) => {
    setEditedWidget(prev => ({ ...prev, ...updates }));
  };

  const updateConfig = (configUpdates: Record<string, any>) => {
    setEditedWidget(prev => ({
      ...prev,
      config: { ...prev.config, ...configUpdates }
    }));
  };

  const getCompatibleEntities = () => {
    const template = WIDGET_TEMPLATES.find(t => t.type === widget.type);
    if (!template || !template.requiresEntity) return [];
    return entities.filter(entity => 
      template.entityDomains.includes(entity.domain)
    );
  };

  return (
    <div className="widget-config-overlay" onClick={onClose}>
      <div className="widget-config-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>⚙️ Configuration du Widget</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="config-tabs">
          <button 
            className={`tab-btn ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            Général
          </button>
          <button 
            className={`tab-btn ${activeTab === 'display' ? 'active' : ''}`}
            onClick={() => setActiveTab('display')}
          >
            Affichage
          </button>
          <button 
            className={`tab-btn ${activeTab === 'advanced' ? 'active' : ''}`}
            onClick={() => setActiveTab('advanced')}
          >
            Avancé
          </button>
        </div>

        <div className="modal-content">
          {activeTab === 'general' && (
            <div className="tab-content">
              <div className="form-group">
                <label>Titre du widget</label>
                <input
                  type="text"
                  value={editedWidget.title}
                  onChange={e => updateWidget({ title: e.target.value })}
                />
              </div>

              {WIDGET_TEMPLATES.find(t => t.type === widget.type)?.requiresEntity && (
                <div className="form-group">
                  <label>Entité associée</label>
                  <select
                    value={editedWidget.entity_id || ''}
                    onChange={e => updateWidget({ entity_id: e.target.value || undefined })}
                  >
                    <option value="">Aucune entité</option>
                    {getCompatibleEntities().map(entity => (
                      <option key={entity.entity_id} value={entity.entity_id}>
                        {entity.friendly_name} ({entity.entity_id})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="form-group">
                <label>Type de widget</label>
                <div className="widget-type-display">
                  {WIDGET_TEMPLATES.find(t => t.type === widget.type)?.icon} {widget.type}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'display' && (
            <div className="tab-content">
              <div className="form-group">
                <label>Taille du widget</label>
                <div className="size-controls">
                  <div className="size-control">
                    <label>Largeur</label>
                    <select
                      value={editedWidget.size.width}
                      onChange={e => updateWidget({
                        size: { ...editedWidget.size, width: Number(e.target.value) }
                      })}
                    >
                      <option value={1}>1 colonne</option>
                      <option value={2}>2 colonnes</option>
                    </select>
                  </div>
                  <div className="size-control">
                    <label>Hauteur</label>
                    <select
                      value={editedWidget.size.height}
                      onChange={e => updateWidget({
                        size: { ...editedWidget.size, height: Number(e.target.value) }
                      })}
                    >
                      <option value={1}>1 ligne</option>
                      <option value={2}>2 lignes</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Visibilité</label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={editedWidget.visible}
                    onChange={e => updateWidget({ visible: e.target.checked })}
                  />
                  Widget visible
                </label>
              </div>
            </div>
          )}

          {activeTab === 'advanced' && (
            <div className="tab-content">
              <div className="form-group">
                <label>Position</label>
                <div className="position-controls">
                  <div className="position-control">
                    <label>X (colonne)</label>
                    <input
                      type="number"
                      min="0"
                      value={editedWidget.position.x}
                      onChange={e => updateWidget({
                        position: { ...editedWidget.position, x: Number(e.target.value) }
                      })}
                    />
                  </div>
                  <div className="position-control">
                    <label>Y (ligne)</label>
                    <input
                      type="number"
                      min="0"
                      value={editedWidget.position.y}
                      onChange={e => updateWidget({
                        position: { ...editedWidget.position, y: Number(e.target.value) }
                      })}
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Configuration JSON</label>
                <textarea
                  value={JSON.stringify(editedWidget.config, null, 2)}
                  onChange={e => {
                    try {
                      const newConfig = JSON.parse(e.target.value);
                      updateWidget({ config: newConfig });
                    } catch (error) {
                      // Ignore invalid JSON
                    }
                  }}
                  rows={6}
                />
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="cancel-btn" onClick={onClose}>
            Annuler
          </button>
          <button className="save-btn" onClick={handleSave}>
            Sauvegarder
          </button>
        </div>
      </div>

      <style jsx>{`
        /* Styles identiques à votre version originale avec quelques améliorations */
        .widget-config-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(4px);
        }

        .widget-config-modal {
          background: white;
          border-radius: 16px;
          max-width: 600px;
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
          padding: 24px 24px 0;
          background: linear-gradient(135deg, #1fb8cd, #17a2b8);
          color: white;
        }

        .modal-header h2 {
          margin: 0;
          font-size: 20px;
          font-weight: 700;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: white;
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

        .config-tabs {
          display: flex;
          padding: 0 24px;
          background: linear-gradient(135deg, #1fb8cd, #17a2b8);
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
        }

        .tab-btn {
          background: none;
          border: none;
          padding: 12px 20px;
          cursor: pointer;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.8);
          border-bottom: 2px solid transparent;
          transition: all 0.2s;
        }

        .tab-btn.active {
          color: white;
          border-bottom-color: white;
        }

        .modal-content {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
        }

        .tab-content {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group label {
          font-weight: 600;
          color: #333;
          font-size: 14px;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          padding: 12px 16px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 14px;
          transition: border-color 0.2s;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #1fb8cd;
        }

        .size-controls,
        .position-controls {
          display: flex;
          gap: 16px;
        }

        .size-control,
        .position-control {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .widget-type-display {
          padding: 12px 16px;
          background: #f8f9fa;
          border-radius: 8px;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }

        .checkbox-label input {
          width: auto;
        }

        textarea {
          resize: vertical;
          font-family: monospace;
          min-height: 120px;
        }

        .modal-footer {
          padding: 24px;
          border-top: 1px solid #e0e0e0;
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          background: #f8f9fa;
        }

        .cancel-btn,
        .save-btn {
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .cancel-btn {
          background: #6c757d;
          color: white;
        }

        .cancel-btn:hover {
          background: #5a6268;
        }

        .save-btn {
          background: #1fb8cd;
          color: white;
        }

        .save-btn:hover {
          background: #1aa3b8;
        }
      `}</style>
    </div>
  );
};