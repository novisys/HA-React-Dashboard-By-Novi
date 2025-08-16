// Dashboard.tsx - Version finale avec gestion des positions 2D et intégration du hook
import React from 'react';
import { DndContext, type DragEndEvent, closestCenter } from '@dnd-kit/core';
import { SortableContext, arrayMove, rectSortingStrategy } from '@dnd-kit/sortable';
import { DraggableWidget } from './DraggableWidget';
import { useDashboardLayout } from './hooks/useDashboardLayout';

interface DashboardProps {
  dashboardId?: string;
  allEntities: any[];
}

export const Dashboard: React.FC<DashboardProps> = ({
  dashboardId = 'default',
  allEntities,
}) => {
  const {
    layout,
    isEditing,
    setIsEditing,
    updateWidgetPosition,
    updateWidgetConfig,
    reorderWidgets,
    removeWidget,
    getWidgetStyle,
  } = useDashboardLayout(dashboardId);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    // Gestion du réordonnancement (drag & drop classique)
    if (active.id !== over.id) {
      const oldIndex = layout.widgets.findIndex(w => w.id === active.id);
      const newIndex = layout.widgets.findIndex(w => w.id === over.id);
      reorderWidgets(arrayMove(layout.widgets, oldIndex, newIndex));
    }

    // Gestion de la position (pour le placement libre)
    const activeWidget = layout.widgets.find(w => w.id === active.id);
    if (activeWidget && event.delta) {
      const newPosition = {
        x: Math.max(0, activeWidget.position.x + Math.round(event.delta.x / (300 + 16))),
        y: Math.max(0, activeWidget.position.y + Math.round(event.delta.y / (250 + 16))),
      };
      updateWidgetConfig(active.id as string, { position: newPosition });
    }
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={layout.widgets} strategy={rectSortingStrategy}>
        <div
          style={{
            position: 'relative',
            width: `${layout.gridCols * 300 + (layout.gridCols - 1) * 16}px`,
            minHeight: `${layout.gridRows * 250 + (layout.gridRows - 1) * 16}px`,
            background: '#f5f7fa',
            padding: '16px',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
          }}
        >
          {layout.widgets.map((widget) => (
            <DraggableWidget
              key={widget.id}
              widget={widget}
              style={getWidgetStyle(widget)}
              allEntities={allEntities}
              isEditing={isEditing}
              onEdit={(updatedWidget) => {
                updateWidgetConfig(updatedWidget.id, updatedWidget);
              }}
              onDelete={(widgetId) => {
                removeWidget(widgetId);
              }}
              onTitleEdit={(widgetId, newTitle) => {
                updateWidgetConfig(widgetId, { title: newTitle });
              }}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};
