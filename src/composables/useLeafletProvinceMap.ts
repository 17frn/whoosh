import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick, type Ref, markRaw } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../components/maps/shared/leaflet-moment-markers.css';
import type { TimelineData } from '../data/timeline';
import { resolveMomentCoordinates } from '../data/geoResolver';
import { getProvinceGeoData, type LodLevel } from '../data/provinceGeoCache';

export type TileLayerType = 'osm' | 'topo' | 'streets';

export interface RegionMeta {
  id: string;
  name: string;
  shortName: string;
  type: 'kabupaten' | 'kota';
  hasData?: boolean;
  lat: number;
  lng: number;
  zoom: number;
}

export interface UseLeafletProvinceMapOptions {
  containerRef: Ref<HTMLDivElement | null>;
  provinceId?: string;
  center: [number, number];
  defaultZoom: number;
  bounds: L.LatLngBoundsLiteral;
  maxBounds: L.LatLngBoundsLiteral;
  maxZoom?: number;
  minZoom?: number;
  geoJson?: any;
  regions?: RegionMeta[];
  boundaryGlowColor?: string;
  getMarkers: () => TimelineData[];
  onMarkerClick: (item: TimelineData, event?: any) => void;
  onRegionClick?: (region: RegionMeta) => void;
  enableLod?: boolean;
}

const TILE_URLS: Record<TileLayerType, string> = {
  osm: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  topo: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
  streets: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
};

const TILE_ATTRIBUTIONS: Record<TileLayerType, string> = {
  osm: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  topo: 'Tiles &copy; Esri',
  streets: 'Tiles &copy; Esri',
};

// Internal representation for marker clustering
interface ClusterGroup {
  id: string;
  centerLat: number;
  centerLng: number;
  markers: TimelineData[];
  bounds: L.LatLngBounds;
}

export function useLeafletProvinceMap(options: UseLeafletProvinceMapOptions) {
  // Non-reactive Leaflet instances to avoid Vue reactivity overhead on large objects
  let mapInstance: L.Map | null = null;
  let tileLayerInstance: L.TileLayer | null = null;
  let maskLayerInstance: L.Polygon | null = null;
  let boundaryGroup: L.LayerGroup | null = null;
  let kabKotaBoundaryGroup: L.LayerGroup | null = null;
  let regionMarkersGroup: L.LayerGroup | null = null;
  let markersGroup: L.LayerGroup | null = null;
  let canvasRenderer: L.Canvas | null = null;

  // Differential marker tracking: markerId -> Leaflet marker instance
  const renderedMarkers = new Map<string, L.Marker>();

  // Current LOD state with hysteresis tracking
  let currentLod: LodLevel = 'overview';
  let updateDebounceTimer: any = null;
  let activeGeoJsonData: any = options.geoJson || null;

  const currentTile = ref<TileLayerType>('osm');
  const isMaskEnabled = ref(true);
  const activeRegionId = ref<string | null>(null);
  const isMapReady = ref(false);

  const selectedRegionInfo = computed<RegionMeta | null>(() => {
    if (!activeRegionId.value || !options.regions) return null;
    return options.regions.find(r => r.id === activeRegionId.value) || null;
  });

  function setTileLayer(type: TileLayerType) {
    currentTile.value = type;
    if (!mapInstance) return;

    if (tileLayerInstance) {
      mapInstance.removeLayer(tileLayerInstance);
    }

    tileLayerInstance = L.tileLayer(TILE_URLS[type], {
      attribution: TILE_ATTRIBUTIONS[type],
      maxZoom: 18,
      subdomains: 'abc',
    }).addTo(mapInstance);

    tileLayerInstance.bringToBack();
  }

  function zoomIn() {
    mapInstance?.zoomIn();
  }

  function zoomOut() {
    mapInstance?.zoomOut();
  }

  function resetView() {
    if (!mapInstance) return;
    mapInstance.fitBounds(options.bounds, {
      padding: [15, 15],
      maxZoom: options.maxZoom || 12,
    });
    activeRegionId.value = null;
  }

  // ── Inverted World Mask (Focused Region) ───────────────────────────────────
  function buildMaskLayer() {
    if (!mapInstance || !activeGeoJsonData) return;

    if (maskLayerInstance) {
      mapInstance.removeLayer(maskLayerInstance);
      maskLayerInstance = null;
    }

    const worldCoords: [number, number][] = [
      [-90, -180],
      [-90, 180],
      [90, 180],
      [90, -180],
    ];

    let holes: [number, number][][] = [];
    const geom = activeGeoJsonData.geometry || activeGeoJsonData;

    if (geom.type === 'MultiPolygon' || (geom.coordinates && Array.isArray(geom.coordinates[0]?.[0]?.[0]))) {
      holes = (geom.coordinates as any[]).map((poly: any) => {
        const ring = poly[0];
        return ring.map(([lng, lat]: [number, number]) => [lat, lng]);
      });
    } else if (geom.coordinates && geom.coordinates[0]) {
      const ring = geom.coordinates[0];
      holes = [(ring as unknown as [number, number][]).map(([lng, lat]: [number, number]) => [lat, lng])];
    }

    // Use Canvas renderer for mask polygon to prevent massive SVG DOM node creation
    maskLayerInstance = L.polygon([worldCoords, ...holes], {
      renderer: canvasRenderer || undefined,
      fillColor: '#f8fafc',
      fillOpacity: 0.52,
      stroke: false,
      interactive: false,
    });

    if (isMaskEnabled.value) {
      maskLayerInstance.addTo(mapInstance);
    }
  }

  function toggleMask() {
    isMaskEnabled.value = !isMaskEnabled.value;
    if (!mapInstance || !maskLayerInstance) return;

    if (isMaskEnabled.value) {
      maskLayerInstance.addTo(mapInstance);
    } else {
      mapInstance.removeLayer(maskLayerInstance);
    }
  }

  // ── Province Boundary Layer (LOD 1: Overview) ─────────────────────────────
  function renderBoundary() {
    if (!mapInstance || !activeGeoJsonData) return;

    if (boundaryGroup) {
      boundaryGroup.clearLayers();
    } else {
      boundaryGroup = L.layerGroup().addTo(mapInstance);
    }

    // Soft color glow underneath (rendered on Canvas for performance)
    const glowOptions: any = {
      renderer: canvasRenderer || undefined,
      style: {
        color: options.boundaryGlowColor || '#f59e0b',
        weight: 5,
        opacity: 0.35,
        dashArray: '6, 6',
        fill: false,
      },
      interactive: false,
    };
    const glow = L.geoJSON(activeGeoJsonData as any, glowOptions);
    glow.addTo(boundaryGroup);

    // Dashed Outer boundary outline
    const borderOptions: any = {
      renderer: canvasRenderer || undefined,
      style: {
        color: '#1a1a2e',
        weight: 2.5,
        opacity: 0.9,
        dashArray: '6, 6',
        fill: false,
        lineCap: 'round',
        lineJoin: 'round',
      },
      interactive: false,
    };
    const border = L.geoJSON(activeGeoJsonData as any, borderOptions);
    border.addTo(boundaryGroup);
  }

  // ── Administrative Kab/Kota Boundaries (LOD 2: Exploration) ───────────────
  async function renderKabKotaBoundaries() {
    if (!mapInstance || !options.provinceId) return;

    const kabKotaData = await getProvinceGeoData(options.provinceId, 'kabkota');
    if (!kabKotaData || !mapInstance) return;

    if (kabKotaBoundaryGroup) {
      kabKotaBoundaryGroup.clearLayers();
    } else {
      kabKotaBoundaryGroup = L.layerGroup().addTo(mapInstance);
    }

    const visibleBounds = mapInstance.getBounds().pad(0.2);

    // Viewport-based spatial culling for administrative features
    const kabKotaOptions: any = {
      renderer: canvasRenderer || undefined,
      filter: (feature: any) => {
        if (!feature.geometry) return false;
        try {
          const tempLayer = L.geoJSON(feature);
          const featureBounds = tempLayer.getBounds();
          return featureBounds.isValid() && visibleBounds.intersects(featureBounds);
        } catch {
          return true;
        }
      },
      style: (feature: any) => {
        const isSelected = activeRegionId.value &&
          (feature.properties?.NAME_2?.toLowerCase().includes(activeRegionId.value.toLowerCase()) ||
           feature.properties?.name?.toLowerCase().includes(activeRegionId.value.toLowerCase()));

        return {
          color: isSelected ? '#ef4444' : '#64748b',
          weight: isSelected ? 2.5 : 1.2,
          opacity: isSelected ? 0.95 : 0.65,
          dashArray: isSelected ? undefined : '4, 4',
          fillColor: isSelected ? '#ef4444' : '#3b82f6',
          fillOpacity: isSelected ? 0.15 : 0.02,
        };
      },
      onEachFeature: (feature: any, layer: L.Layer) => {
        const name = feature.properties?.NAME_2 || feature.properties?.name || 'Wilayah';
        layer.bindTooltip(name, {
          direction: 'center',
          className: 'leaflet-neo-tooltip',
          permanent: false,
        });
      },
    };

    const kabKotaLayer = L.geoJSON(kabKotaData as any, kabKotaOptions);
    kabKotaLayer.addTo(kabKotaBoundaryGroup);
  }

  // ── Level of Detail (LOD) Manager ─────────────────────────────────────────
  async function updateLevelOfDetail() {
    if (!mapInstance || !options.provinceId) return;

    const zoom = mapInstance.getZoom();
    let targetLod: LodLevel = currentLod;

    // Hysteresis threshold to prevent flickering around zoom boundary
    if (currentLod === 'overview' && zoom >= 10) {
      targetLod = 'kabkota';
    } else if (currentLod === 'kabkota' && zoom < 9.5) {
      targetLod = 'overview';
    }

    if (targetLod !== currentLod) {
      currentLod = targetLod;

      if (currentLod === 'kabkota') {
        // Zooming in: attach Kab/Kota administrative boundaries
        await renderKabKotaBoundaries();
      } else {
        // Zooming out: detach detailed Kab/Kota boundaries, keep clean overview
        if (kabKotaBoundaryGroup && mapInstance) {
          kabKotaBoundaryGroup.clearLayers();
        }
      }
    } else if (currentLod === 'kabkota') {
      // Re-filter visible features during pan
      await renderKabKotaBoundaries();
    }
  }

  // ── Render Region Badges (Pin Penanda Kota / Kabupaten) ────────────────────
  function renderRegionBadges() {
    if (!mapInstance || !options.regions) return;

    if (regionMarkersGroup) {
      regionMarkersGroup.clearLayers();
    } else {
      regionMarkersGroup = L.layerGroup().addTo(mapInstance);
    }

    options.regions.forEach((region) => {
      const badgeHtml = `
        <div class="leaflet-neo-region-badge">
          <span class="neo-badge-icon"><i class="fa-solid fa-location-dot" style="color:#ef4444;font-size:11px;"></i></span>
          <span class="neo-badge-name">${region.shortName}</span>
        </div>
      `;

      const icon = L.divIcon({
        html: badgeHtml,
        className: 'leaflet-neo-region-divicon',
        iconSize: [90, 28],
        iconAnchor: [45, 14],
      });

      const marker = L.marker([region.lat, region.lng], { icon, zIndexOffset: 200 });
      marker.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        focusRegion(region);
      });

      marker.addTo(regionMarkersGroup!);
    });
  }

  function focusRegion(r: RegionMeta) {
    activeRegionId.value = r.id;
    if (options.onRegionClick) {
      options.onRegionClick(r);
    }
    if (mapInstance) {
      mapInstance.flyTo([r.lat, r.lng], r.zoom, { duration: 1 });
    }
  }

  // ── Viewport-Based Spatial Culling & Clustering for Moment Markers ─────────
  function updateViewportMarkers() {
    if (!mapInstance) return;

    if (!markersGroup) {
      markersGroup = L.layerGroup().addTo(mapInstance);
    }

    const zoom = mapInstance.getZoom();
    // 20% expanded viewport buffer for seamless panning
    const visibleBounds = mapInstance.getBounds().pad(0.20);
    const allMarkers = options.getMarkers();

    // 1. Spatial Culling: Keep only markers within visible viewport buffer
    const inViewportMarkers = allMarkers.filter((m) => {
      const { lat, lng } = resolveMomentCoordinates(m);
      return visibleBounds.contains([lat, lng]);
    });

    // 2. Spatial Clustering: At lower zoom (< 12) cluster nearby markers (< 40px)
    const enableClustering = zoom < 12 && inViewportMarkers.length > 8;

    if (enableClustering) {
      // Clear individual rendered markers when clustering
      renderedMarkers.forEach((marker) => {
        markersGroup?.removeLayer(marker);
      });
      renderedMarkers.clear();

      const clusters: ClusterGroup[] = [];
      const CLUSTER_PIXEL_RADIUS = 40;

      inViewportMarkers.forEach((m) => {
        const coord = resolveMomentCoordinates(m);
        const point = mapInstance!.latLngToLayerPoint([coord.lat, coord.lng]);

        let matchedCluster: ClusterGroup | null = null;
        for (const c of clusters) {
          const cPoint = mapInstance!.latLngToLayerPoint([c.centerLat, c.centerLng]);
          const dist = Math.hypot(point.x - cPoint.x, point.y - cPoint.y);
          if (dist <= CLUSTER_PIXEL_RADIUS) {
            matchedCluster = c;
            break;
          }
        }

        if (matchedCluster) {
          matchedCluster.markers.push(m);
          matchedCluster.bounds.extend([coord.lat, coord.lng]);
        } else {
          clusters.push({
            id: `cluster_${m.id}`,
            centerLat: coord.lat,
            centerLng: coord.lng,
            markers: [m],
            bounds: L.latLngBounds([coord.lat, coord.lng], [coord.lat, coord.lng]),
          });
        }
      });

      // Render clustered items
      clusters.forEach((cluster) => {
        if (cluster.markers.length === 1) {
          // Single marker rendered normally
          const m = cluster.markers[0];
          renderSingleMarker(m);
        } else {
          // Multi-item cluster pin
          const clusterHtml = `
            <div class="leaflet-neo-cluster-pin">
              <div class="cluster-halo"></div>
              <span class="cluster-count">${cluster.markers.length}</span>
            </div>
          `;

          const clusterIcon = L.divIcon({
            html: clusterHtml,
            className: 'leaflet-neo-cluster-divicon',
            iconSize: [38, 38],
            iconAnchor: [19, 19],
          });

          const clusterMarker = L.marker([cluster.centerLat, cluster.centerLng], {
            icon: clusterIcon,
            zIndexOffset: 400,
          });

          clusterMarker.on('click', (e) => {
            L.DomEvent.stopPropagation(e);
            mapInstance?.fitBounds(cluster.bounds, { padding: [40, 40], maxZoom: 14 });
          });

          clusterMarker.bindTooltip(`${cluster.markers.length} Momen di area ini (Klik untuk melihat)`, {
            direction: 'top',
            offset: [0, -20],
            className: 'leaflet-neo-tooltip',
          });

          clusterMarker.addTo(markersGroup!);
          renderedMarkers.set(cluster.id, clusterMarker);
        }
      });
    } else {
      // High zoom (zoom >= 12) or low density: Differential marker update
      const activeIdsInView = new Set<string>();

      inViewportMarkers.forEach((m) => {
        activeIdsInView.add(m.id);
        if (!renderedMarkers.has(m.id)) {
          renderSingleMarker(m);
        }
      });

      // Detach markers that exited the viewport buffer
      renderedMarkers.forEach((marker, id) => {
        if (!activeIdsInView.has(id)) {
          markersGroup?.removeLayer(marker);
          renderedMarkers.delete(id);
        }
      });
    }
  }

  function renderSingleMarker(m: TimelineData) {
    if (!mapInstance || !markersGroup) return;

    const { lat, lng } = resolveMomentCoordinates(m);
    const color = m.dotColor || '#3b82f6';

    const pinHtml = `
      <div class="leaflet-neo-moment-pin" style="--pin-accent: ${color};">
        <div class="pin-halo"></div>
        <div class="pin-core">
          <i class="fa-solid fa-location-dot"></i>
        </div>
        <div class="pin-label">${m.title.length > 14 ? m.title.slice(0, 14) + '...' : m.title}</div>
      </div>
    `;

    const icon = L.divIcon({
      html: pinHtml,
      className: 'leaflet-neo-moment-divicon',
      iconSize: [32, 42],
      iconAnchor: [16, 38],
    });

    const marker = L.marker([lat, lng], { icon, zIndexOffset: 500 });
    marker.on('click', (e) => {
      L.DomEvent.stopPropagation(e);
      options.onMarkerClick(m, e);
    });

    marker.bindTooltip(`<b>${m.title}</b><br/><span style="color:#6b7280">${m.location}</span>`, {
      direction: 'top',
      offset: [0, -32],
      className: 'leaflet-neo-tooltip',
    });

    marker.addTo(markersGroup);
    renderedMarkers.set(m.id, marker);
  }

  // ── Debounced Event Dispatcher ────────────────────────────────────────────
  function onMapInteractionEnd() {
    clearTimeout(updateDebounceTimer);
    updateDebounceTimer = setTimeout(() => {
      updateViewportMarkers();
      if (options.provinceId) {
        updateLevelOfDetail();
      }
    }, 120);
  }

  // ── Lifecycle Initialization ──────────────────────────────────────────────
  onMounted(() => {
    nextTick(async () => {
      if (!options.containerRef.value) return;

      // 1. Initialize Canvas Renderer for high-performance mobile vector rendering
      canvasRenderer = L.canvas({ padding: 0.25 });

      // 2. Initialize Leaflet Map with preferCanvas
      mapInstance = L.map(options.containerRef.value, {
        center: options.center,
        zoom: options.defaultZoom,
        zoomControl: false,
        attributionControl: true,
        minZoom: options.minZoom ?? 7,
        maxZoom: 18,
        maxBounds: options.maxBounds,
        maxBoundsViscosity: 0.9,
        preferCanvas: true,
      });

      // 3. Set Base Tile Layer
      setTileLayer('osm');
      resetView();

      // 4. Resolve overview GeoJSON asynchronously from cache if provinceId provided
      if (options.provinceId) {
        const cachedOverview = await getProvinceGeoData(options.provinceId, 'overview');
        if (cachedOverview) {
          activeGeoJsonData = markRaw(cachedOverview);
        }
      }

      // 5. Render Geometry & Mask via Canvas
      buildMaskLayer();
      renderBoundary();
      renderRegionBadges();

      // 6. Viewport Culling initial render
      updateViewportMarkers();

      // 7. Bind debounced move/zoom event listeners
      mapInstance.on('moveend', onMapInteractionEnd);
      mapInstance.on('zoomend', onMapInteractionEnd);

      // Invalidate size to ensure proper tile coverage after layout render
      setTimeout(() => {
        mapInstance?.invalidateSize();
        isMapReady.value = true;
      }, 200);
    });
  });

  // Watch markers change (add/edit/delete moments)
  watch(
    () => options.getMarkers(),
    () => {
      updateViewportMarkers();
    },
    { deep: false }
  );

  // Clean cleanup
  onBeforeUnmount(() => {
    clearTimeout(updateDebounceTimer);

    if (mapInstance) {
      mapInstance.off('moveend', onMapInteractionEnd);
      mapInstance.off('zoomend', onMapInteractionEnd);
    }

    renderedMarkers.clear();

    if (maskLayerInstance && mapInstance) {
      mapInstance.removeLayer(maskLayerInstance);
      maskLayerInstance = null;
    }
    if (boundaryGroup && mapInstance) {
      mapInstance.removeLayer(boundaryGroup);
      boundaryGroup = null;
    }
    if (kabKotaBoundaryGroup && mapInstance) {
      mapInstance.removeLayer(kabKotaBoundaryGroup);
      kabKotaBoundaryGroup = null;
    }
    if (regionMarkersGroup && mapInstance) {
      mapInstance.removeLayer(regionMarkersGroup);
      regionMarkersGroup = null;
    }
    if (markersGroup && mapInstance) {
      mapInstance.removeLayer(markersGroup);
      markersGroup = null;
    }
    if (mapInstance) {
      mapInstance.remove();
      mapInstance = null;
    }
    canvasRenderer = null;
  });

  return {
    currentTile,
    isMaskEnabled,
    activeRegionId,
    selectedRegionInfo,
    isMapReady,
    setTileLayer,
    toggleMask,
    zoomIn,
    zoomOut,
    resetView,
    focusRegion,
    renderMomentMarkers: updateViewportMarkers,
  };
}
