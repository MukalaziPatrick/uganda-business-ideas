'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

export function LandDrawSearch({ onClose }: { onClose: () => void }) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const draw = useRef<InstanceType<typeof MapboxDraw> | null>(null);
  const router = useRouter();
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: [32.5825, 1.3],
      zoom: 7,
    });

    draw.current = new MapboxDraw({
      displayControlsDefault: false,
      controls: { polygon: true, trash: true },
      defaultMode: 'draw_polygon',
    });

    map.current.addControl(draw.current);
    map.current.on('draw.create', () => setHasDrawn(true));
    map.current.on('draw.delete', () => setHasDrawn(false));

    return () => { map.current?.remove(); map.current = null; };
  }, []);

  function applySearch() {
    const data = draw.current?.getAll();
    if (!data?.features?.length) return;

    const geom = data.features[0].geometry as unknown as { coordinates: [number, number][][] };
    const coords = geom.coordinates[0];
    const lngs = coords.map(c => c[0]);
    const lats = coords.map(c => c[1]);

    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);

    router.push(`/land/browse?minLat=${minLat}&maxLat=${maxLat}&minLng=${minLng}&maxLng=${maxLng}`);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl overflow-hidden w-full max-w-2xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-land-mint/50">
          <p className="font-semibold text-land-ink text-sm">Draw your search area</p>
          <button onClick={onClose} className="text-land-forest/60 hover:text-land-forest/85">✕</button>
        </div>
        <div ref={mapContainer} style={{ height: 400 }} />
        <div className="px-4 py-3 flex gap-3">
          <p className="text-xs text-land-forest/75 flex-1">Click points on the map to draw a polygon. Click the first point to close the shape.</p>
          <button
            onClick={applySearch}
            disabled={!hasDrawn}
            className="bg-land-primary text-white text-sm font-semibold px-5 py-2 rounded-full disabled:opacity-40"
          >
            Search this area
          </button>
        </div>
      </div>
    </div>
  );
}
