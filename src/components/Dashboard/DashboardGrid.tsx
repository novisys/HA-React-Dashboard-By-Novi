// DashboardGrid.tsx - Version corrigée SCROLL + BOUTONS D'ÉDITION
// DashboardGrid.tsx - Version corrigée avec boutons d'édition
import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { useDashboardLayout, type WidgetConfig } from '../../hooks/useDashboardLayout';
import { useAllEntities } from '../../hooks/useAllEntities';
import { DraggableWidget } from '../DraggableWidget';
import { WidgetSelector, WidgetConfigModal } from '../WidgetComponents';

interface DashboardGridProps {
  dashboardId?: string;
  className?: string;
}

export const DashboardGrid: React.FC<DashboardGridProps> = ({ 
  dashboardId = 'main-dashboard',
  className = ''
}) => {
  const {
    layout,
    isEditing,
    setIsEditing,
    updateWidgetPosition,
    updateWidgetConfig,
    addWidget,
    removeWidget,
    resetLayout,
    exportLayout,
    importLayout
  } = useDashboardLayout(dashboardId);

  const { 
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
    lastUpdate
  } = useAllEntities();

  const [showWidgetSelector, setShowWidgetSelector] = useState(false);
  const [editingWidget, setEditingWidget] = useState<WidgetConfig | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    if (!isEditing) return;
    
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = layout.widgets.findIndex((widget) => widget.id === active.id);
      const newIndex = layout.widgets.findIndex((widget) => widget.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedWidgets = arrayMove(layout.widgets, oldIndex, newIndex);
        
        reorderedWidgets.forEach((widget, index) => {
          const newPosition = calculateGridPosition(index, layout.gridCols);
          updateWidgetPosition(widget.id, newPosition);
        });

        console.log('📋 Widgets réorganisés');
      }
    }
  };

  const handleAddWidget = (widgetTemplate: Partial<WidgetConfig>) => {
    console.log('🔧 Ajout widget:', widgetTemplate);
    
    const newPosition = findNextAvailablePosition();
    const widgetId = addWidget({
      ...widgetTemplate,
      position: newPosition,
      size: widgetTemplate.size || { width: 1, height: 1 },
      config: widgetTemplate.config || {},
      visible: true
    } as Omit<WidgetConfig, 'id'>);
    
    setShowWidgetSelector(false);
    console.log(`➕ Widget "${widgetTemplate.title}" ajouté`);
  };

  const handleWidgetEdit = (widget: WidgetConfig) => {
    console.log('⚙️ Édition widget:', widget.id, widget.type);
    setEditingWidget(widget);
  };

  const handleWidgetSave = (updatedWidget: WidgetConfig) => {
    console.log('💾 Sauvegarde widget:', updatedWidget.id);
    updateWidgetConfig(updatedWidget.id, updatedWidget);
    setEditingWidget(null);
    console.log(`✅ Widget "${updatedWidget.title}" sauvegardé`);
  };

  const handleTitleEdit = (widgetId: string, newTitle: string) => {
    const widget = layout.widgets.find(w => w.id === widgetId);
    if (widget) {
      updateWidgetConfig(widgetId, { ...widget, title: newTitle });
      console.log(`✏️ Titre modifié: "${newTitle}"`);
    }
  };

  const handleWidgetDelete = (widgetId: string) => {
    const widget = layout.widgets.find(w => w.id === widgetId);
    if (widget && confirm(`Supprimer "${widget.title}" ?`)) {
      removeWidget(widgetId);
      console.log(`🗑️ Widget "${widget.title}" supprimé`);
    }
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      importLayout(file)
        .then(() => {
          console.log('📥 Layout importé avec succès');
          alert('Layout importé avec succès !');
        })
        .catch((error) => {
          console.error('❌ Erreur d\'import:', error);
          alert(`Erreur d'import: ${error.message}`);
        });
    }
  };

  const handleExport = () => {
    exportLayout();
    console.log('📤 Layout exporté');
  };

  const handleReset = () => {
    if (confirm('⚠️ Réinitialiser le dashboard ?\n\nTous les widgets seront supprimés.')) {
      resetLayout();
      console.log('🔄 Dashboard réinitialisé');
    }
  };

  const toggleEditMode = () => {
    const newMode = !isEditing;
    setIsEditing(newMode);
    console.log(newMode ? '✏️ Mode ÉDITION activé' : '👁️ Mode LECTURE activé');
  };

  const findNextAvailablePosition = () => {
    const occupiedPositions = layout.widgets.map(w => ({ x: w.position.x, y: w.position.y }));
    
    for (let y = 0; y < layout.gridRows; y++) {
      for (let x = 0; x < layout.gridCols; x++) {
        const isOccupied = occupiedPositions.some(pos => pos.x === x && pos.y === y);
        if (!isOccupied) {
          return { x, y };
        }
      }
    }
    
    return { x: 0, y: layout.gridRows };
  };

  const calculateGridPosition = (index: number, cols: number) => {
    return {
      x: index % cols,
      y: Math.floor(index / cols)
    };
  };

  // Loading state
  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Chargement des entités Home Assistant...</p>
        <div className="loading-details">
          {wsConnecting && <span>🔗 Connexion WebSocket...</span>}
          {wsConnected && <span>✅ WebSocket connecté</span>}
          {wsError && <span>⚠️ Mode hors ligne (API REST)</span>}
        </div>
        <style jsx>{`
          .dashboard-loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            background: #f5f5f7;
            color: #666;
          }
          .loading-spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #f3f3f3;
            border-top: 4px solid #1fb8cd;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 16px;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .loading-details span {
            display: block;
            font-size: 14px;
            margin: 4px 0;
            font-weight: 500;
          }
        `}</style>
      </div>
    );
  }

  // Error state
  if (error && !wsConnected) {
    return (
      <div className="dashboard-error">
        <h2>❌ Erreur de connexion Home Assistant</h2>
        <p>{error}</p>
        <p>WebSocket: {wsError || 'Indisponible'}</p>
        <button onClick={refreshEntities} className="retry-btn">
          🔄 Réessayer
        </button>
        <style jsx>{`
          .dashboard-error {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            background: #f5f5f7;
            padding: 40px;
            text-align: center;
            color: #dc3545;
          }
          .retry-btn {
            background: #1fb8cd;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            margin-top: 16px;
            font-weight: 600;
          }
          .retry-btn:hover {
            background: #1aa3b8;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className={`dashboard-grid ${className}`}>
      {/* ✅ TOOLBAR FIXE */}
      <div className="dashboard-toolbar">
        <div className="toolbar-left">
          <h1 className="dashboard-title">🏠 Dashboard Home Assistant</h1>
          <div className="dashboard-stats">
            <span className="stat">📊 {entities.length} entités</span>
            <span className="stat">🧩 {layout.widgets.length} widgets</span>
            <span className="stat">
              {wsConnected ? '🟢 Temps réel' : '🔴 Offline'}
            </span>
          </div>
        </div>
        
        <div className="toolbar-right">
          {/* Toggle mode édition */}
          <button
            className={`toolbar-btn mode-toggle ${isEditing ? 'editing' : 'viewing'}`}
            onClick={toggleEditMode}
          >
            {isEditing ? '👁️ Mode Lecture' : '✏️ Mode Édition'}
          </button>
          
          {/* Boutons mode édition */}
          {isEditing && (
            <>
              <button
                className="toolbar-btn add-widget-btn"
                onClick={() => setShowWidgetSelector(true)}
              >
                ➕ Ajouter Widget
              </button>
              
              <div className="separator" />
              
              <button
                className="toolbar-btn"
                onClick={handleExport}
                title="Exporter configuration"
              >
                📤 Export
              </button>
              
              <label className="toolbar-btn import-btn">
                📥 Import
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileImport}
                  style={{ display: 'none' }}
                />
              </label>
              
              <button
                className="toolbar-btn reset-btn"
                onClick={handleReset}
                title="Réinitialiser dashboard"
              >
                🔄 Reset
              </button>
            </>
          )}
          
          <div className="separator" />
          
          <button
            className="toolbar-btn refresh-btn"
            onClick={refreshEntities}
            title="Actualiser entités"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* ✅ CONTENU AVEC SCROLL */}
      <div className="dashboard-content">
        {/* Instructions mode édition */}
        {isEditing && (
          <div className="edit-mode-banner">
            <div className="banner-content">
              <span className="banner-icon">✏️</span>
              <span>Mode Édition Activé - Survolez les widgets pour voir les contrôles</span>
            </div>
          </div>
        )}

        {/* Dashboard vide */}
        {layout.widgets.length === 0 && (
          <div className="empty-dashboard">
            <div className="empty-content">
              <div className="empty-icon">🎨</div>
              <h2>Dashboard Vide</h2>
              <p>Commencez par ajouter votre premier widget !</p>
              {wsConnected && (
                <p className="realtime-status">🟢 Connexion temps réel active</p>
              )}
              <button
                className="first-widget-btn"
                onClick={() => setShowWidgetSelector(true)}
              >
                ➕ Ajouter mon premier widget
              </button>
            </div>
          </div>
        )}

        {/* ✅ GRILLE WIDGETS AVEC SCROLL */}
        {layout.widgets.length > 0 && (
          <div className="widgets-scroll-container">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={layout.widgets.map(w => w.id)}
                strategy={rectSortingStrategy}
              >
                <div className="widgets-grid">
                  {layout.widgets
                    .filter(widget => widget.visible || isEditing)
                    .map(widget => {
                      const entityData = widget.entity_id 
                        ? entities.find(e => e.entity_id === widget.entity_id)
                        : undefined;

                      return (
                        <DraggableWidget
                          key={widget.id}
                          widget={widget}
                          entityData={entityData}
                          allEntities={entities}
                          isEditing={isEditing}
                          onEdit={handleWidgetEdit}
                          onDelete={handleWidgetDelete}
                          onTitleEdit={handleTitleEdit}
                        />
                      );
                    })
                  }
                </div>
              </SortableContext>
            </DndContext>
          </div>
        )}
      </div>

      {/* Modals */}
      {showWidgetSelector && (
        <WidgetSelector
          entities={entities}
          entitiesByDomain={entitiesByDomain}
          onSelectWidget={handleAddWidget}
          onClose={() => setShowWidgetSelector(false)}
        />
      )}

      {editingWidget && (
        <WidgetConfigModal
          widget={editingWidget}
          entities={entities}
          entitiesByDomain={entitiesByDomain}
          onSave={handleWidgetSave}
          onClose={() => setEditingWidget(null)}
        />
      )}

      <style jsx>{`
        .dashboard-grid {
          width: 100%;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: #f5f5f7;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        /* ✅ TOOLBAR FIXE */
        .dashboard-toolbar {
          position: sticky;
          top: 0;
          z-index: 1000;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 24px;
          background: white;
          border-bottom: 2px solid #e0e0e0;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          flex-shrink: 0;
        }

        .toolbar-left {
          display: flex;
          align-items: center;
          gap: 24px;
        }

        .dashboard-title {
          margin: 0;
          font-size: 24px;
          font-weight: 700;
          color: #1d1d1f;
        }

        .dashboard-stats {
          display: flex;
          gap: 12px;
        }

        .stat {
          background: #f8f9fa;
          padding: 6px 12px;
          border-radius: 12px;
          font-size: 13px;
          color: #666;
          font-weight: 500;
          border: 1px solid #e9ecef;
        }

        .toolbar-right {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .toolbar-btn {
          background: #1fb8cd;
          color: white;
          border: none;
          padding: 10px 16px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 14px;
          white-space: nowrap;
        }

        .toolbar-btn:hover {
          background: #1aa3b8;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(31, 184, 205, 0.3);
        }

        .mode-toggle.editing {
          background: #28a745;
          box-shadow: 0 0 0 3px rgba(40, 167, 69, 0.2);
        }

        .mode-toggle.viewing {
          background: #6c757d;
        }

        .add-widget-btn {
          background: #28a745;
        }

        .add-widget-btn:hover {
          background: #218838;
        }

        .reset-btn {
          background: #dc3545;
        }

        .reset-btn:hover {
          background: #c82333;
        }

        .refresh-btn {
          background: #17a2b8;
        }

        .refresh-btn:hover {
          background: #138496;
        }

        .import-btn {
          cursor: pointer;
        }

        .separator {
          width: 2px;
          height: 24px;
          background: #dee2e6;
          margin: 0 4px;
        }

        /* ✅ CONTENU SCROLLABLE */
        .dashboard-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 0;
        }

        .edit-mode-banner {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          padding: 12px 24px;
          text-align: center;
          font-weight: 500;
        }

        .banner-content {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .banner-icon {
          font-size: 16px;
        }

        /* Dashboard vide */
        .empty-dashboard {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
        }

        .empty-content {
          text-align: center;
          max-width: 400px;
        }

        .empty-icon {
          font-size: 4rem;
          margin-bottom: 20px;
          opacity: 0.7;
        }

        .empty-content h2 {
          color: #1d1d1f;
          margin-bottom: 12px;
          font-size: 2rem;
        }

        .empty-content p {
          color: #666;
          font-size: 1.1rem;
          margin-bottom: 20px;
          line-height: 1.5;
        }

        .realtime-status {
          color: #28a745 !important;
          font-weight: 600 !important;
          margin-bottom: 24px !important;
        }

        .first-widget-btn {
          background: #28a745;
          color: white;
          border: none;
          padding: 16px 32px;
          border-radius: 12px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .first-widget-btn:hover {
          background: #218838;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(40, 167, 69, 0.3);
        }

        /* ✅ SCROLL CONTAINER */
        .widgets-scroll-container {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
        }

        .widgets-grid {
          padding: 24px;
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          align-content: flex-start;
          min-height: 100%;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .widgets-grid {
            padding: 20px;
            gap: 14px;
          }
        }

        @media (max-width: 768px) {
          .dashboard-toolbar {
            flex-direction: column;
            gap: 12px;
            padding: 16px;
          }
          
          .toolbar-left,
          .toolbar-right {
            width: 100%;
            justify-content: center;
          }
          
          .dashboard-stats {
            justify-content: center;
            flex-wrap: wrap;
            gap: 8px;
          }
          
          .toolbar-right {
            flex-wrap: wrap;
            justify-content: center;
          }
          
          .widgets-grid {
            padding: 16px;
            gap: 12px;
          }

          .toolbar-btn {
            padding: 8px 12px;
            font-size: 13px;
          }

          .dashboard-title {
            font-size: 20px;
          }
        }

        @media (max-width: 480px) {
          .dashboard-toolbar {
            padding: 12px;
          }

          .toolbar-btn {
            padding: 6px 10px;
            font-size: 12px;
          }

          .widgets-grid {
            padding: 12px;
            gap: 8px;
          }

          .empty-content h2 {
            font-size: 1.5rem;
          }

          .empty-content p {
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  );
};