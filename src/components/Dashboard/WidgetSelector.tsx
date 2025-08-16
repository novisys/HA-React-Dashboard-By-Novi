// Composant pour sélectionner et ajouter des widgets
import React, { useState } from 'react';
import { type WidgetConfig } from '../hooks/useDashboardLayout';
import { type EntityData } from '../hooks/useAllEntities';

export const WIDGET_TEMPLATES = [
  {
    type: 'weather' as const,
    title: 'Widget Météo',
    description: 'Affiche les informations météorologiques classiques',
    icon: '🌤️',
    requiresEntity: true,
    entityDomains: ['weather'],
    defaultSize: { width: 1, height: 1 },
    defaultConfig: { showForecast: true, showHumidity: true }
  },
  {
    type: 'weather-futuristic' as const,
    title: 'Météo Futuriste Animée',
    description: 'Widget météo animé avec effets futuristes',
    icon: '🔮',
    requiresEntity: true,
    entityDomains: ['weather'],
    defaultSize: { width: 2, height: 2 },
    defaultConfig: { detailed: true, colorScheme: 'auto' }
  },
  // autres widgets (entité, stats, controls, profile) inchangés...
  {
    type: 'entity' as const,
    title: 'Widget Entité',
    description: 'Affiche l\'état d\'une entité spécifique',
    icon: '📊',
    requiresEntity: true,
    entityDomains: ['sensor', 'binary_sensor', 'light', 'switch', 'fan', 'cover'],
    defaultSize: { width: 1, height: 1 },
    defaultConfig: { showLastUpdated: true }
  },
  {
    type: 'stats' as const,
    title: 'Widget Statistiques',
    description: 'Affiche plusieurs capteurs sous forme de grille',
    icon: '📈',
    requiresEntity: false,
    entityDomains: ['sensor'],
    defaultSize: { width: 1, height: 1 },
    defaultConfig: { maxEntities: 4, showDaily: true }
  },
  {
    type: 'controls' as const,
    title: 'Widget Contrôles',
    description: 'Boutons pour contrôler des appareils',
    icon: '🎛️',
    requiresEntity: false,
    entityDomains: ['light', 'switch', 'fan', 'cover'],
    defaultSize: { width: 1, height: 1 },
    defaultConfig: { maxControls: 4, showState: true }
  },
  {
    type: 'profile' as const,
    title: 'Widget Profil',
    description: 'Informations utilisateur et système',
    icon: '👤',
    requiresEntity: false,
    entityDomains: ['person'],
    defaultSize: { width: 1, height: 1 },
    defaultConfig: { showStats: true }
  }
];

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
  const [selectedTemplate, setSelectedTemplate] = useState<typeof WIDGET_TEMPLATES[0] | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<string>('');
  const [widgetTitle, setWidgetTitle] = useState('');

  const handleTemplateSelect = (template: typeof WIDGET_TEMPLATES[0]) => {
    setSelectedTemplate(template);
    setWidgetTitle(template.title);
    setSelectedEntity('');
  };

  const handleCreateWidget = () => {
    if (!selectedTemplate) return;

    const newWidget: Partial<WidgetConfig> = {
      type: selectedTemplate.type,
      title: widgetTitle || selectedTemplate.title,
      entity_id: selectedEntity || undefined,
      size: selectedTemplate.defaultSize,
      config: selectedTemplate.defaultConfig
    };

    onSelectWidget(newWidget);
  };

  const getAvailableEntities = () => {
    if (!selectedTemplate || !selectedTemplate.requiresEntity) return [];
    return entities.filter(entity => selectedTemplate.entityDomains.includes(entity.domain));
  };

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
              <h3>Choisissez un type de widget :</h3>
              <div className="templates-grid">
                {WIDGET_TEMPLATES.map(template => {
                  const availableEntities = template.requiresEntity 
                    ? entities.filter(e => template.entityDomains.includes(e.domain)).length
                    : null;

                  const isDisabled = template.requiresEntity && availableEntities === 0;

                  return (
                    <button
                      key={template.type}
                      className={`template-card ${isDisabled ? 'disabled' : ''}`}
                      onClick={() => !isDisabled && handleTemplateSelect(template)}
                      disabled={isDisabled}
                    >
                      <div className="template-icon">{template.icon}</div>
                      <h4>{template.title}</h4>
                      <p>{template.description}</p>
                      {template.requiresEntity && (
                        <div className="template-info">
                          {availableEntities !== null && (
                            <span className="entity-count">
                              {availableEntities} entité(s) disponible(s)
                            </span>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="widget-configuration">
              <button className="back-btn" onClick={() => setSelectedTemplate(null)}>← Retour</button>
              <div className="config-header">
                <div className="config-icon">{selectedTemplate.icon}</div>
                <h3>Configurer {selectedTemplate.title}</h3>
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
                    <label>Entité associée</label>
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
                <div className="form-preview">
                  <h4>Aperçu</h4>
                  <div className="widget-preview">
                    <div className="preview-widget">
                      <div className="preview-header">
                        <strong>{widgetTitle || selectedTemplate.title}</strong>
                      </div>
                      <div className="preview-content">
                        {selectedTemplate.icon}
                        <span>Widget {selectedTemplate.type}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="modal-footer">
          {selectedTemplate && (
            <>
              <button className="cancel-btn" onClick={onClose}>Annuler</button>
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
        }

        .widget-selector-modal {
          background: white;
          border-radius: 12px;
          padding: 24px;
          max-width: 600px;
          max-height: 80vh;
          overflow-y: auto;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid #e0e0e0;
        }

        .modal-header h2 {
          margin: 0;
          font-size: 24px;
          color: #333;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #666;
          padding: 4px;
        }

        .close-btn:hover {
          color: #333;
        }

        .widget-templates {
          display: grid;
          gap: 16px;
          margin-bottom: 24px;
        }

        .widget-template {
          display: flex;
          align-items: center;
          padding: 16px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .widget-template:hover:not(.disabled) {
          border-color: #1fb8cd;
          background: #f8fcfd;
        }

        .widget-template.selected {
          border-color: #1fb8cd;
          background: #e6f7fa;
        }

        .widget-template.disabled {
          opacity: 0.5;
          cursor: not-allowed;
          background: #f5f5f5;
        }

        .template-icon {
          font-size: 32px;
          margin-right: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 60px;
          height: 60px;
          background: #f0f0f0;
          border-radius: 50%;
        }

        .template-info {
          flex: 1;
        }

        .template-info h3 {
          margin: 0 0 4px 0;
          font-size: 18px;
          color: #333;
        }

        .template-info p {
          margin: 0 0 8px 0;
          color: #666;
          font-size: 14px;
        }

        .entity-info {
          font-size: 12px;
        }

        .entity-count {
          color: #1fb8cd;
          font-weight: 500;
        }

        .entity-missing {
          color: #ff6b6b;
          font-weight: 500;
        }

        .add-button {
          background: #1fb8cd;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: background 0.2s;
        }

        .add-button:hover {
          background: #1aa3b8;
        }

        .entities-summary {
          background: #f8f9fa;
          padding: 16px;
          border-radius: 8px;
          margin-bottom: 24px;
        }

        .entities-summary h3 {
          margin: 0 0 12px 0;
          font-size: 16px;
          color: #333;
        }

        .domain-list {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 8px;
        }

        .domain-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 12px;
          background: white;
          border-radius: 6px;
          border: 1px solid #e0e0e0;
        }

        .domain-name {
          font-weight: 500;
          color: #333;
        }

        .domain-count {
          background: #1fb8cd;
          color: white;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          padding-top: 16px;
          border-top: 1px solid #e0e0e0;
        }

        .cancel-btn {
          background: #f0f0f0;
          color: #333;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
        }

        .cancel-btn:hover {
          background: #e0e0e0;
        }
      `}</style>
    </div>
  );
};
