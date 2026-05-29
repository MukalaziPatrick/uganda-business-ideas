// app/land/browse/[id]/LandDetailMap.tsx
'use client';
import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

type MapMode = 'clean' | 'explore' | 'full' | 'custom';
type LayerKey = 'roads' | 'boundaries' | 'water' | 'terrain' | 'buildings' | 'places' | 'transport';

const LAYER_LABELS: Record<LayerKey, string> = {
  roads: '🛣 Roads',
  boundaries: '📐 Plot Boundaries',
  water: '💧 Water',
  terrain: '⛰ Terrain',
  buildings: '🏗 3D Buildings',
  places: '🏫 Places',
  transport: '🚌 Transport',
};

const MODE_DEFAULTS: Record<MapMode, LayerKey[]> = {
  clean: [],
  explore: ['roads', 'places'],
  full: ['roads', 'boundaries', 'water', 'terrain', 'places', 'transport'],
  custom: [],
};

export function LandDetailMap({ lat, lng, title }: { lat: number; lng: number; title: string }) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mode, setMode] = useState<MapMode>('explore');
  const [customLayers, setCustomLayers] = useState<Set<LayerKey>>(new Set(MODE_DEFAULTS.explore));
  const [showLayerPanel, setShowLayerPanel] = useState(false);

  const activeLayers = mode === 'custom' ? customLayers : new Set(MODE_DEFAULTS[mode]);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: [lng, lat],
      zoom: 14,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.current.on('load', () => {
      new mapboxgl.Marker({ color: '#2d6a4f' })
        .setLngLat([lng, lat])
        .setPopup(new mapboxgl.Popup().setText(title))
        .addTo(map.current!);
    });

    return () => { map.current?.remove(); map.current = null; };
  }, [lat, lng, title]);

  function setMapMode(newMode: MapMode) {
    setMode(newMode);
    if (newMode !== 'custom') {
      setCustomLayers(new Set(MODE_DEFAULTS[newMode]));
    }
  }

  function toggleCustomLayer(layer: LayerKey) {
    setMode('custom');
    setCustomLayers(prev => {
      const next = new Set(prev);
      if (next.has(layer)) next.delete(layer); else next.add(layer);
      return next;
    });
  }

  return (
    <div className="relative rounded-2xl overflow-hidden border border-gray-200" style={{ height: 360 }}>
      <div ref={mapContainer} className="w-full h-full" />

      {/* Mode selector — top left */}
      <div className="absolute top-3 left-3 flex gap-1 z-10">
        {(['clean', 'explore', 'full'] as MapMode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMapMode(m)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium shadow transition-colors ${
              mode === m
                ? 'bg-[#2d6a4f] text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            {m.charAt(0).toUpperCase() + m.slice(1)}
          </button>
        ))}
      </div>

      {/* Layer toggle button — bottom right */}
      <button
        onClick={() => setShowLayerPanel(!showLayerPanel)}
        className="absolute bottom-3 right-3 z-10 bg-white shadow rounded-full px-3 py-2 text-xs font-medium text-gray-700 flex items-center gap-1 hover:bg-gray-50"
      >
        🗂 Layers {mode === 'custom' && `(${customLayers.size})`}
      </button>

      {/* Layer panel — bottom sheet style */}
      {showLayerPanel && (
        <div className="absolute bottom-12 right-3 z-10 bg-white rounded-2xl shadow-lg border border-gray-200 p-3 min-w-[180px]">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Toggle layers</p>
          {(Object.keys(LAYER_LABELS) as LayerKey[]).map((layer) => (
            <label key={layer} className="flex items-center gap-2 py-1 cursor-pointer">
              <input
                type="checkbox"
                checked={activeLayers.has(layer)}
                onChange={() => toggleCustomLayer(layer)}
                className="accent-[#2d6a4f]"
              />
              <span className="text-sm text-gray-700">{LAYER_LABELS[layer]}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
