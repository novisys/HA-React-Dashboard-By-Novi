// useDashboardLayout.ts - Version finale avec gestion des positions 2D et persistance
import { useState, useEffect } from 'react';

// ✅ Types mis à jour pour le drag & drop 2D et la grille
export interface WidgetConfig {
  id: string;
  type: 'weather' | 'weather-futuristic' | 'weather-debug' | 'entity' | 'stats' | 'controls' | 'profile' | 'custom';
  title: string;
  entity_id?: string;
  size: {
    width: number; // Nombre de colonnes occupées
    height: number; // Nombre de lignes occupées
  };
  position: {
    x: number; // Position X en unités de grille
    y: number; // Position Y en unités de grille
  };
  config: Record<string, any>;
  visible: boolean;
}

export interface DashboardLayout {
  widgets: WidgetConfig[];
  gridCols: number; // Nombre total de colonnes de la grille
  gridRows: number; // Nombre total de lignes de la grille
  lastModified: string;
}

// Layout par défaut avec des widgets positionnés
const DEFAULT_LAYOUT: DashboardLayout = {
  widgets: [
    {
      id: 'weather-1',
      type: 'weather-futuristic',
      title: 'Météo Futuriste',
      entity_id: 'weather.forecast_home',
      size: { width: 2, height: 2 },
      position: { x: 0, y: 0 },
      config: { showForecast: true, showHumidity: true },
      visible: true
    },
    {
      id: 'profile-1',
      type: 'profile',
      title: 'Profil Utilisateur',
      size: { width: 1, height: 1 },
      position: { x: 2, y: 0 },
      config: { showStatus: true },
      visible: true
    },
    {
      id: 'stats-1',
      type: 'stats',
      title: 'Capteurs',
      size: { width: 1, height: 2 },
      position: { x: 3, y: 0 },
      config: { maxEntities: 4 },
      visible: true
    }
  ],
  gridCols: 12, // Grille plus large pour plus de flexibilité
  gridRows: 12,
  lastModified: new Date().toISOString()
};

export const useDashboardLayout = (dashboardId: string = 'default') => {
  const storageKey = `dashboard-layout-${dashboardId}`;

  // Charger depuis localStorage ou utiliser le layout par défaut
  const [layout, setLayout] = useState<DashboardLayout>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : DEFAULT_LAYOUT;
    } catch (e) {
      console.error("Erreur de chargement du layout:", e);
      return DEFAULT_LAYOUT;
    }
  });

  const [isEditing, setIsEditing] = useState(false);
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null);

  // Sauvegarder automatiquement dans localStorage
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify({
      ...layout,
      lastModified: new Date().toISOString()
    }));
  }, [layout, storageKey]);

  // Mettre à jour la position d'un widget (pour le drag & drop)
  const updateWidgetPosition = (widgetId: string, newPosition: { x: number; y: number }) => {
    setLayout(prev => ({
      ...prev,
      widgets: prev.widgets.map(widget =>
        widget.id === widgetId ? { ...widget, position: newPosition } : widget
      )
    }));
  };

  // Mettre à jour la taille d'un widget
  const updateWidgetSize = (widgetId: string, newSize: { width: number; height: number }) => {
    setLayout(prev => ({
      ...prev,
      widgets: prev.widgets.map(widget =>
        widget.id === widgetId ? { ...widget, size: newSize } : widget
      )
    }));
  };

  // Mettre à jour n'importe quelle propriété d'un widget
  const updateWidgetConfig = (widgetId: string, updates: Partial<Omit<WidgetConfig, 'id'>>) => {
    setLayout(prev => ({
      ...prev,
      widgets: prev.widgets.map(widget =>
        widget.id === widgetId ? { ...widget, ...updates } : widget
      )
    }));
  };

  // Ajouter un widget avec position par défaut (en bas à gauche)
  const addWidget = (widget: Omit<WidgetConfig, 'id' | 'position'>) => {
    const newWidget: WidgetConfig = {
      ...widget,
      id: `widget-${Date.now()}`,
      position: { x: 0, y: 0 } // Position par défaut, à ajuster via drag & drop
    };
    setLayout(prev => ({
      ...prev,
      widgets: [...prev.widgets, newWidget]
    }));
    return newWidget.id;
  };

  // Supprimer un widget
  const removeWidget = (widgetId: string) => {
    setLayout(prev => ({
      ...prev,
      widgets: prev.widgets.filter(widget => widget.id !== widgetId)
    }));
  };

  // Basculer la visibilité d'un widget
  const toggleWidgetVisibility = (widgetId: string) => {
    setLayout(prev => ({
      ...prev,
      widgets: prev.widgets.map(widget =>
        widget.id === widgetId ? { ...widget, visible: !widget.visible } : widget
      )
    }));
  };

  // Réorganiser les widgets (pour le drag & drop)
  const reorderWidgets = (widgets: WidgetConfig[]) => {
    setLayout(prev => ({ ...prev, widgets }));
  };

  // Réinitialiser au layout par défaut
  const resetLayout = () => {
    setLayout(DEFAULT_LAYOUT);
    setIsEditing(false);
    setSelectedWidget(null);
  };

  // Exporter le layout actuel
  const exportLayout = () => {
    const dataStr = JSON.stringify(layout, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dashboard-${dashboardId}-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Importer un layout depuis un fichier
  const importLayout = (file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target?.result as string);
          if (imported.widgets && imported.gridCols && imported.gridRows) {
            setLayout(imported);
            resolve();
          } else {
            reject(new Error("Format de fichier invalide: structure attendue { widgets, gridCols, gridRows }"));
          }
        } catch (e) {
          reject(new Error("Erreur de parsing du fichier"));
        }
      };
      reader.onerror = () => reject(new Error("Erreur de lecture du fichier"));
      reader.readAsText(file);
    });
  };

  // Calculer la position CSS d'un widget pour le rendu
  const getWidgetStyle = (widget: WidgetConfig) => {
    const colWidth = 300; // Largeur d'une colonne en pixels
    const rowHeight = 250; // Hauteur d'une ligne en pixels
    const gap = 16; // Espacement entre widgets

    return {
      left: `${widget.position.x * (colWidth + gap)}px`,
      top: `${widget.position.y * (rowHeight + gap)}px`,
      width: `${widget.size.width * colWidth + (widget.size.width - 1) * gap}px`,
      height: `${widget.size.height * rowHeight + (widget.size.height - 1) * gap}px`,
      position: 'absolute' as const
    };
  };

  return {
    layout,
    setLayout,
    isEditing,
    setIsEditing,
    selectedWidget,
    setSelectedWidget,
    updateWidgetPosition,
    updateWidgetSize,
    updateWidgetConfig,
    addWidget,
    removeWidget,
    toggleWidgetVisibility,
    reorderWidgets,
    resetLayout,
    exportLayout,
    importLayout,
    getWidgetStyle // Nouvelle fonction pour faciliter le rendu
  };
};
