"use client";
import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import "./Map.css";
import { Button } from "@/components/ui/button";
import { LocateIcon, RotateCw } from "lucide-react";

const Map = ({ segments, sensors, nodes, replacementZones, coordinates, selectedCoordinates, onSegmentClick }) => {
  const DEFAULT_CENTER = [88.3639, 22.5726]; // Kolkata
  const DEFAULT_ZOOM = 13;
  const DEFAULT_PITCH = 45;
  const DEFAULT_BEARING = 15;

  const [center, setCenter] = useState(DEFAULT_CENTER);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [pitch, setPitch] = useState(DEFAULT_PITCH);
  const [bearing, setBearing] = useState(DEFAULT_BEARING);
  const mapContainerRef = useRef();
  const mapRef = useRef();

  useEffect(() => {
    mapboxgl.accessToken =
      process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "pk.eyJ1IjoiZTI0bWFydGkiLCJhIjoiY20zcXZ3YnZyMHZ0NDJyb2EwYmYwaTc2OSJ9.sF-Ud_ewdyqdrfxuuV_0ag";

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      center: center,
      zoom: zoom,
      style: "mapbox://styles/mapbox/dark-v11", // Standard dark mode for infrastructure
      pitch: pitch,
      bearing: bearing,
    });

    mapRef.current.on("load", () => {
      if (!mapRef.current) return;

      // Add Replacement Zones
      if (replacementZones && replacementZones.length > 0) {
        const zoneFeatures = replacementZones.map((zone) => ({
            type: "Feature",
            properties: {
                id: zone.id,
                status: zone.status,
                progress: zone.progress
            },
            geometry: {
                type: "Polygon",
                coordinates: [zone.coordinates.map(c => [c[1], c[0]])] // Flip for GeoJSON
            }
        }));

        mapRef.current.addSource("zones", {
            type: "geojson",
            data: {
                type: "FeatureCollection",
                features: zoneFeatures
            }
        });

        mapRef.current.addLayer({
            id: "zones-fill",
            type: "fill",
            source: "zones",
            paint: {
                "fill-color": "#f59e0b", // Amber
                "fill-opacity": 0.2
            }
        });

        mapRef.current.addLayer({
            id: "zones-outline",
            type: "line",
            source: "zones",
            paint: {
                "line-color": "#f59e0b",
                "line-width": 2,
                "line-dasharray": [2, 1]
            }
        });
      }

      // Add segments (pipes) source
      if (segments && segments.length > 0) {
        const features = segments.map((seg) => ({
          type: "Feature",
          properties: {
            id: seg.id,
            material: seg.material,
            status: seg.status,
            confidence: seg.confidence,
            type: seg.type,
          },
          geometry: {
            type: "LineString",
            coordinates: [
              [seg.coordinates[0][1], seg.coordinates[0][0]],
              [seg.coordinates[1][1], seg.coordinates[1][0]],
            ],
          },
        }));

        mapRef.current.addSource("pipes", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: features,
          },
        });

        // Confirmed Pipes Layer
        mapRef.current.addLayer({
          id: "pipes-confirmed",
          type: "line",
          source: "pipes",
          filter: ["==", "type", "Confirmed"],
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": [
              "match",
              ["get", "status"],
              "Burst", "#ef4444", // Red for burst
              "Leak Detected", "#f97316", // Orange for leak
              "Isolated", "#71717a", // Gray for isolated/dry
              "#3b82f6" // Default Blue
            ],
            "line-width": [
                "match",
                ["get", "status"],
                "Burst", 5,
                3
            ],
          },
        });

        // Probabilistic Pipes Layer (Dashed/Transparent)
        mapRef.current.addLayer({
          id: "pipes-probabilistic",
          type: "line",
          source: "pipes",
          filter: ["==", "type", "Probabilistic"],
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": [
              "match",
              ["get", "status"],
              "Burst", "#ef4444",
              "Leak Detected", "#f97316",
              "#a855f7" // Purple
            ],
            "line-width": 3,
            "line-opacity": ["get", "confidence"],
            "line-dasharray": [2, 2],
          },
        });

        // Interaction
        mapRef.current.on("click", ["pipes-confirmed", "pipes-probabilistic"], (e) => {
            if (onSegmentClick && e.features && e.features[0]) {
                onSegmentClick(e.features[0].properties);
            }
        });
        
        mapRef.current.on("mouseenter", ["pipes-confirmed", "pipes-probabilistic"], () => {
            mapRef.current.getCanvas().style.cursor = "pointer";
        });
        
        mapRef.current.on("mouseleave", ["pipes-confirmed", "pipes-probabilistic"], () => {
            mapRef.current.getCanvas().style.cursor = "";
        });
      }

      // Add Nodes
      if (nodes && nodes.length > 0) {
          nodes.forEach(node => {
            const el = document.createElement("div");
            
            // Styling based on Node Type and Water Status
            let className = "rounded-full cursor-pointer border border-white ";
            if (node.type === "Source") {
                className += "w-6 h-6 bg-blue-400 animate-pulse";
                el.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="w-4 h-4 text-white mx-auto my-1"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>';
            } else if (node.type === "Junction") {
                // Valves
                className += "w-3 h-3 ";
                className += node.hasWater ? "bg-green-500" : "bg-gray-600";
            } else {
                // Demand / Households
                className += "w-2 h-2 ";
                className += node.hasWater ? "bg-cyan-400" : "bg-red-500";
            }
            
            el.className = className;

            new mapboxgl.Marker(el)
                .setLngLat([node.coordinates[1], node.coordinates[0]])
                .addTo(mapRef.current);
          });
      }

      // Add Sensors
      if (sensors && sensors.length > 0) {
        sensors.forEach((sensor) => {
          const el = document.createElement("div");
          el.className = `w-3 h-3 rounded-full cursor-pointer border border-white opacity-70 ${
            sensor.status === "Offline" ? "bg-gray-500" : "bg-yellow-400"
          }`;
          
          new mapboxgl.Marker(el)
            .setLngLat([sensor.coordinates[1], sensor.coordinates[0]])
            .addTo(mapRef.current);
        });
      }

      // User location
      if (coordinates) {
        const userPos = document.createElement("div");
        userPos.className =
          "h-4 w-4 border-2 border-white rounded-full bg-blue-500 shadow-lg pulsing-dot";

        new mapboxgl.Marker(userPos)
          .setLngLat([coordinates[1], coordinates[0]])
          .addTo(mapRef.current);
      }
    });

    mapRef.current.on("move", () => {
      if (mapRef.current) {
        const mapCenter = mapRef.current.getCenter();
        setCenter([mapCenter.lng, mapCenter.lat]);
        setZoom(mapRef.current.getZoom());
        setPitch(mapRef.current.getPitch());
        setBearing(mapRef.current.getBearing());
      }
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, [segments, sensors, nodes, replacementZones]); // Re-initialize if data changes

  // Fly to selected coordinates
  useEffect(() => {
    if (selectedCoordinates && mapRef.current) {
      mapRef.current.flyTo({
        center: [selectedCoordinates[1], selectedCoordinates[0]],
        zoom: 16,
        pitch: 45,
        bearing: 0,
      });
    }
  }, [selectedCoordinates]);

  const handleMapReset = () => {
    mapRef.current.flyTo({
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      pitch: DEFAULT_PITCH,
      bearing: DEFAULT_BEARING,
    });
  };

  const handleFlyToMe = () => {
    if (coordinates) {
      mapRef.current.flyTo({
        center: [coordinates[1], coordinates[0]],
        zoom: 15,
        pitch: 0,
        bearing: 0,
      });
    }
  };

  return (
    <div className="h-full w-full relative">
      <div ref={mapContainerRef} className="h-full w-full" id="map-container" />
      <div className="top-4 right-4 absolute flex flex-col gap-2">
        <Button
          onClick={handleMapReset}
          variant="secondary"
          size="icon"
          className="rounded-full shadow-md bg-zinc-800 text-white hover:bg-zinc-700"
        >
          <RotateCw size="16px" />
        </Button>
        <Button
          onClick={handleFlyToMe}
          variant="secondary"
          size="icon"
          disabled={!coordinates}
          className="rounded-full shadow-md bg-zinc-800 text-white hover:bg-zinc-700"
        >
          <LocateIcon size="16px" />
        </Button>
      </div>
    </div>
  );
};

export default Map;
