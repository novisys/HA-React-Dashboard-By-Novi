// src/components/Dashboard/WidgetConfigModal.tsx
import React, { useState, useEffect } from 'react';
import { type WidgetConfig } from '../../hooks/useDashboardLayout';

interface WidgetConfigModalProps {
  widget: WidgetConfig;
  allEntities: any[];
  onSave: (updatedWidget: WidgetConfig) => void;
  onClose: () => void;
}

export const WidgetConfigModal: React.FC<WidgetConfigModalProps> = ({
  widget,
  allEntities,
  onSave,
  onClose,
}) => {
  const [editedWidget, setEditedWidget] = useState<WidgetConfig>(widget);

  // Filtre les entités par domaine pour les sélecteurs
  const weatherEntities = allEntities.filter(e => e.domain === 'weather');
  const sensorEntities = allEntities.filter(e => e.domain === 'sensor');
  const controlEntities = allEntities.filter(e =>
    ['light', 'switch', 'fan', 'cover'].includes(e.domain)
  );

  const handleChange = (field: keyof WidgetConfig, value: any) => {
    setEditedWidget(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(editedWidget);
  };

  return (
    <div className="widget-config-overlay" onClick={onClose}>
      <div
        className="widget-config-modal"
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header flex-between">
          <h3>Configurer: {editedWidget.title}</h3>
          <button onClick={onClose} className="close-btn">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Titre</label>
            <input
              type="text"
              value={editedWidget.title}
              onChange={e => handleChange('title', e.target.value)}
              className="form-input"
            />
          </div>

          {editedWidget.type === 'weather' || editedWidget.type === 'weather-futuristic' ? (
            <div className="form-group">
              <label>Entité Météo</label>
              <select
                value={editedWidget.entity_id || ''}
                onChange={e => handleChange('entity_id', e.target.value)}
                className="form-select"
              >
                <option value="">-- Sélectionner --</option>
                {weatherEntities.map(entity => (
                  <option key={entity.entity_id} value={entity.entity_id}>
                    {entity.friendly_name} ({entity.entity_id})
                  </option>
                ))}
              </select>
            </div>
          ) : editedWidget.type === 'entity' ? (
            <div className="form-group">
              <label>Entité</label>
              <select
                value={editedWidget.entity_id || ''}
                onChange={e => handleChange('entity_id', e.target.value)}
                className="form-select"
              >
                <option value="">-- Sélectionner --</option>
                {allEntities.map(entity => (
                  <option key={entity.entity_id} value={entity.entity_id}>
                    {entity.friendly_name} ({entity.entity_id})
                  </option>
                ))}
              </select>
            </div>
          ) : editedWidget.type === 'stats' ? (
            <div className="form-group">
              <label>Nombre max d'entités</label>
              <input
                type="number"
                min="1"
                max="12"
                value={editedWidget.config?.maxEntities || 4}
                onChange={e => handleChange('config', {
                  ...editedWidget.config,
                  maxEntities: parseInt(e.target.value)
                })}
                className="form-input"
              />
            </div>
          ) : null}

          <div className="form-group size-controls">
            <label>Taille</label>
            <div className="flex-between gap-2">
              <div>
                <label>Largeur (1-{editedWidget.size.width})</label>
                <input
                  type="range"
                  min="1"
                  max="4"
                  value={editedWidget.size.width}
                  onChange={e => handleChange('size', {
                    ...editedWidget.size,
                    width: parseInt(e.target.value)
                  })}
                />
              </div>
              <div>
                <label>Hauteur (1-{editedWidget.size.height})</label>
                <input
                  type="range"
                  min="1"
                  max="4"
                  value={editedWidget.size.height}
                  onChange={e => handleChange('size', {
                    ...editedWidget.size,
                    height: parseInt(e.target.value)
                  })}
                />
              </div>
            </div>
          </div>

          <div className="modal-actions flex-between">
            <button type="button" onClick={onClose} className="btn-secondary">
              Annuler
            </button>
            <button type="submit" className="btn-primary">
              Sauvegarder
            </button>
          </div>
        </form>

        <style jsx>{`
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
            z-index: 10000;
          }
          .widget-config-modal {
            background: white;
            border-radius: 8px;
            width: 90%;
            max-width: 500px;
            max-height: 90vh;
            overflow: auto;
            padding: 20px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          }
          .modal-header {
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 1px solid #eee;
          }
          .modal-header h3 {
            margin: 0;
            font-size: 1.2rem;
          }
          .close-btn {
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            padding: 0 8px;
          }
          .modal-form {
            display: flex;
            flex-direction: column;
            gap: 15px;
          }
          .form-group {
            display: flex;
            flex-direction: column;
            gap: 5px;
          }
          .form-group label {
            font-weight: 500;
            font-size: 0.9rem;
          }
          .form-input, .form-select {
            padding: 8px 12px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 1rem;
          }
          .size-controls {
            margin: 15px 0;
          }
          .modal-actions {
            margin-top: 20px;
            padding-top: 15px;
            border-top: 1px solid #eee;
          }
          .btn-primary {
            background: #1fb8cd;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            font-weight: 500;
          }
          .btn-secondary {
            background: #f0f0f0;
            color: #333;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
          }
          .flex-between {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .gap-2 {
            gap: 0.5rem;
          }
        `}</style>
      </div>
    </div>
  );
};
