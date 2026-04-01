"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { ScoredCountry, WeightConfig } from "@/lib/types";
import { scoreToFillColor, computeWeightedScore } from "@/lib/scoring";

interface WorldMapProps {
  countries: ScoredCountry[];
  weights: WeightConfig;
  activeFilters: Set<string>;
  onCountryHover?: (code: string | null) => void;
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    L: any;
  }
}

export function WorldMap({ countries, weights, activeFilters, onCountryHover }: WorldMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstance = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const geoLayerRef = useRef<any>(null);
  const router = useRouter();
  const countryMap = useRef<Map<string, ScoredCountry>>(new Map());

  useEffect(() => {
    countryMap.current = new Map(countries.map((c) => [c.code, c]));
  }, [countries]);

  const getStyle = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (feature: any) => {
      const iso = feature?.properties?.ISO_A2 || feature?.properties?.iso_a2 || "";
      const country = countryMap.current.get(iso.toUpperCase());
      if (!country) {
        return { fillColor: "#cbd5e1", fillOpacity: 0.3, color: "#94a3b8", weight: 0.5, opacity: 0.6 };
      }
      const active = activeFilters.has(country.code);
      const score = computeWeightedScore(country, weights);
      return {
        fillColor: active ? scoreToFillColor(score) : "#94a3b8",
        fillOpacity: active ? 0.8 : 0.2,
        color: active ? "#ffffff" : "#94a3b8",
        weight: active ? 0.8 : 0.3,
        opacity: active ? 0.9 : 0.4,
      };
    },
    [activeFilters, weights]
  );

  const initMap = useCallback(() => {
    if (!mapRef.current || mapInstance.current) return;
    const L = window.L;
    const map = L.map(mapRef.current, {
      center: [30, 15], zoom: 2, minZoom: 1.5, maxZoom: 8,
      zoomControl: true, attributionControl: false,
    });
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png", {
      subdomains: "abcd", maxZoom: 19,
    }).addTo(map);
    mapInstance.current = map;

    fetch("https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson")
      .then((r) => r.json())
      .then((geoJson) => {
        const layer = L.geoJson(geoJson, {
          style: getStyle,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onEachFeature(feature: any, layer: any) {
            const iso = feature?.properties?.ISO_A2 || feature?.properties?.iso_a2 || "";
            const country = countryMap.current.get(iso.toUpperCase());
            layer.on("mouseover", () => {
              onCountryHover?.(iso.toUpperCase());
              if (country) layer.setStyle({ weight: 2, color: "#ffffff", fillOpacity: 0.9 });
            });
            layer.on("mouseout", () => {
              onCountryHover?.(null);
              layer.setStyle(getStyle(feature));
            });
            layer.on("click", () => {
              if (country) router.push(`/country/${country.code}`);
            });
            if (country) {
              const score = computeWeightedScore(country, weights);
              layer.bindTooltip(
                `<div style="font-family:inherit;min-width:140px">
                  <div style="font-weight:700;font-size:14px;margin-bottom:4px">${country.name}</div>
                  <div style="font-size:12px;opacity:0.8">Score: <strong>${score}/100</strong></div>
                  <div style="font-size:11px;opacity:0.65;margin-top:2px">${country.topHurdle.slice(0, 60)}</div>
                  <div style="font-size:10px;margin-top:4px;opacity:0.5">Click to explore</div>
                </div>`,
                { sticky: true, opacity: 1, className: "oklo-tooltip" }
              );
            }
          },
        }).addTo(map);
        geoLayerRef.current = layer;
      })
      .catch(console.error);
  }, [getStyle, onCountryHover, router, weights]);

  useEffect(() => {
    if (window.L) { initMap(); return; }
    const css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(css);
    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = initMap;
    document.head.appendChild(script);
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
        geoLayerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!geoLayerRef.current) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    geoLayerRef.current.eachLayer((layer: any) => {
      layer.setStyle(getStyle(layer.feature));
    });
  }, [getStyle, activeFilters, weights]);

  return (
    <div ref={mapRef} className="w-full h-full rounded-xl overflow-hidden" style={{ background: "#1a1a2e" }} />
  );
}
