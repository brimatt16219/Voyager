// src/components/RouteFlowChart.tsx
import React, { useState } from "react";
import type { RouteStop } from "./Map";

interface Store {
  name: string;
  lat: number;
  lng: number;
  place_id: string;
  address: string;
}

interface RouteFlowChartProps {
  routeStops: RouteStop[];
  directions: google.maps.DirectionsResult | null;
  stores: Store[];
}

const RouteFlowChart: React.FC<RouteFlowChartProps> = ({ routeStops, directions, stores }) => {
  const [selectedLeg, setSelectedLeg] = useState<number | null>(null);

  if (!directions) {
    return (
      <div className="p-4 h-full flex items-center justify-center">
        <p className="text-gray-500">No route yet. Search above to see directions.</p>
      </div>
    );
  }

  const legs = directions.routes[0].legs;

  // Helper function to get store info by place_id
  const getStoreInfo = (placeId: string) => {
    return stores.find(store => store.place_id === placeId);
  };

  return (
    <div className="h-full flex">
      {/* Flow Chart - Left Side */}
      <div className="flex-1 p-4 overflow-auto">
        <h2 className="font-semibold mb-4 text-center">Route Flow</h2>
        <div className="flex flex-col items-center space-y-4">
          {/* Start Point */}
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">
              START
            </div>
            <div className="text-xs text-gray-600 mt-1">Your Location</div>
          </div>
          
          {/* Arrow */}
          <div className="w-0.5 h-8 bg-gray-400"></div>
          
          {/* Store Bubbles */}
          {routeStops.map((stop, i) => {
            const storeInfo = getStoreInfo(stop.place_id);
            const isSelected = selectedLeg === i;
            
            return (
              <div key={stop.place_id} className="flex flex-col items-center">
                <button
                  onClick={() => setSelectedLeg(i)}
                  className={`
                    w-32 h-16 rounded-full flex flex-col items-center justify-center text-xs font-medium shadow-lg transition-all duration-200
                    ${isSelected 
                      ? 'bg-blue-500 text-white transform scale-110' 
                      : 'bg-white text-gray-800 hover:bg-blue-100 hover:scale-105 border-2 border-gray-300'
                    }
                  `}
                >
                  <div className="font-bold">{i + 1}</div>
                  <div className="text-center leading-tight">
                    {storeInfo?.name || 'Unknown'}
                  </div>
                </button>
                <div className="text-xs text-gray-600 mt-1 text-center max-w-32">
                  {storeInfo?.address?.split(',')[0] || 'Address'}
                </div>
                
                {/* Arrow to next stop */}
                {i < routeStops.length - 1 && (
                  <div className="w-0.5 h-8 bg-gray-400 mt-2"></div>
                )}
              </div>
            );
          })}
          
          {/* End Point */}
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">
              END
            </div>
            <div className="text-xs text-gray-600 mt-1">Final Stop</div>
          </div>
        </div>
      </div>

      {/* Instructions Panel - Right Side */}
      <div className="w-80 border-l border-gray-300 bg-gray-50">
        {selectedLeg !== null && legs[selectedLeg] ? (
          <div className="p-4 h-full overflow-y-auto">
            <div className="mb-4">
              <h3 className="font-semibold text-lg mb-2">
                Stop {selectedLeg + 1} Directions
              </h3>
              {(() => {
                const storeInfo = getStoreInfo(routeStops[selectedLeg].place_id);
                return (
                  <div className="bg-white p-3 rounded-lg shadow-sm mb-4">
                    <div className="font-medium text-blue-600">{storeInfo?.name || 'Unknown Store'}</div>
                    <div className="text-sm text-gray-600">{storeInfo?.address || 'Address not available'}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Arrival: {new Date(routeStops[selectedLeg].arrival_time).toLocaleTimeString()}
                    </div>
                  </div>
                );
              })()}
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium text-gray-700">Step-by-step directions:</h4>
              {legs[selectedLeg].steps.map((step, idx) => (
                <div key={idx} className="bg-white p-3 rounded-lg shadow-sm">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <div
                        className="text-sm leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: step.instructions }}
                      />
                      <div className="text-xs text-gray-500 mt-2 flex items-center space-x-4">
                        <span>📏 {step.distance?.text}</span>
                        <span>⏱️ {step.duration?.text}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-4 h-full flex items-center justify-center">
            <div className="text-center text-gray-500">
              <div className="text-4xl mb-2">👆</div>
              <p>Click on any stop bubble to see directions</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RouteFlowChart;
