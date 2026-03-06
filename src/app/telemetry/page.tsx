'use client';

import { useEffect, useState } from 'react';
import { socketIOService } from '@/services/socketIOService';
import { parameterStreamService } from '@/services/parameterStreamService';

export default function TelemetryDashboard() {
  const [telemetry, setTelemetry] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Connect to Socket.IO for real-time updates
    socketIOService.connect();

    // Fetch initial data
    const fetchInitial = async () => {
      try {
        const data = await parameterStreamService.getLatestParameterStream();
        if (data && data.length > 0) {
          setTelemetry(data);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching initial telemetry:', error);
        setLoading(false);
      }
    };

    fetchInitial();

    // Listen for real-time telemetry updates via Socket.IO
    const handleTelemetry = (data: any) => {
      if (data && data.data && data.data.parameters) {
        const params = data.data.parameters.map((p: any) => ({
          parameter_id: p.id,
          parameter_name: p.name,
          value: p.value,
          unit: p.unit,
          timestamp: data.data.timestamp,
          min: p.min,
          max: p.max,
          color: p.color,
        }));
        setTelemetry(params);
      }
    };

    socketIOService.on('telemetry', handleTelemetry);

    return () => {
      socketIOService.off('telemetry', handleTelemetry);
      socketIOService.disconnect();
    };
  }, []);

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="grid grid-cols-3 gap-4 p-8 bg-gray-50 min-h-screen">
      {telemetry.map((item) => (
        <div key={item.parameter_id} className="bg-white rounded-lg p-6 shadow-md">
          <h3 className="text-lg font-semibold text-gray-800">
            {item.parameter_name}
          </h3>
          <p className="text-4xl font-bold text-blue-600 mt-4">
            {parseFloat(item.value).toFixed(2)}
          </p>
          <p className="text-sm text-gray-600 mt-2">{item.unit}</p>
          <p className="text-xs text-gray-400 mt-3">
            {new Date(item.timestamp).toLocaleTimeString()}
          </p>
        </div>
      ))}
    </div>
  );
}
