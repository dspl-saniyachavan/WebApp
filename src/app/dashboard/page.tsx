'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import RBACGuard from '@/components/RBACGuard';

interface Parameter {
  id: string;
  name: string;
  enabled: boolean;
  unit: string;
  description: string;
}

interface TelemetryData {
  [key: string]: number;
  timestamp: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [parameters, setParameters] = useState<Parameter[]>([]);
  const [telemetryHistory, setTelemetryHistory] = useState<TelemetryData[]>([]);
  const [latestData, setLatestData] = useState<TelemetryData>({ timestamp: Date.now() });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token) {
      router.push('/login');
      return;
    }

    if (userData) {
      setUser(JSON.parse(userData));
    }

    const loadParameters = () => {
      const savedParams = localStorage.getItem('parameters');
      if (savedParams) {
        const allParams: Parameter[] = JSON.parse(savedParams);
        setParameters(allParams.filter(p => p.enabled));
      } else {
        const defaultParams: Parameter[] = [
          { id: 'temp', name: 'Temperature', enabled: true, unit: '°C', description: 'Ambient temperature' },
          { id: 'pressure', name: 'Pressure', enabled: true, unit: 'kPa', description: 'System pressure' },
          { id: 'flow', name: 'Flow Rate', enabled: true, unit: 'L/s', description: 'Liquid flow rate' },
        ];
        setParameters(defaultParams);
        localStorage.setItem('parameters', JSON.stringify(defaultParams));
      }
    };

    loadParameters();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'parameters') loadParameters();
    };

    const handleParametersChanged = () => loadParameters();

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', loadParameters);
    window.addEventListener('parametersChanged', handleParametersChanged);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', loadParameters);
      window.removeEventListener('parametersChanged', handleParametersChanged);
    };
  }, [router]);

  useEffect(() => {
    if (parameters.length === 0) return;

    const interval = setInterval(() => {
      const newData: TelemetryData = { timestamp: Date.now() };
      
      parameters.forEach(param => {
        newData[param.id] = 20 + Math.random() * 30;
      });
      
      setLatestData(newData);
      setTelemetryHistory(prev => {
        const updated = [...prev, newData];
        return updated.slice(-20);
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [parameters]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    document.cookie = 'token=; path=/; max-age=0';
    window.location.href = '/login';
  };

  const getChartColor = (index: number) => {
    const colors = ['#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#f97316'];
    return colors[index % colors.length];
  };

  const renderLineChart = (data: number[], color: string, label: string, timestamps: number[]) => {
    if (data.length === 0 || data.length === 1) return (
      <div className="h-64 flex items-center justify-center text-gray-400 bg-gray-50 rounded-lg">
        <p>Collecting data...</p>
      </div>
    );
    
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const padding = { top: 20, right: 20, bottom: 40, left: 60 };
    const chartWidth = 1000;
    const chartHeight = 300;
    const innerWidth = chartWidth - padding.left - padding.right;
    const innerHeight = chartHeight - padding.top - padding.bottom;
    
    const points = data.map((value, index) => {
      const x = padding.left + (index / Math.max(data.length - 1, 1)) * innerWidth;
      const y = padding.top + innerHeight - ((value - min) / range) * innerHeight;
      return { x: isNaN(x) ? padding.left : x, y: isNaN(y) ? padding.top : y, value, timestamp: timestamps[index] };
    }).filter(p => !isNaN(p.x) && !isNaN(p.y));
    
    if (points.length === 0) return (
      <div className="h-64 flex items-center justify-center text-gray-400 bg-gray-50 rounded-lg">
        <p>Invalid data...</p>
      </div>
    );
    
    const pathData = points.map((point, index) => {
      if (index === 0) return `M ${point.x} ${point.y}`;
      return `L ${point.x} ${point.y}`;
    }).join(' ');
    
    const yTicks = 5;
    const yTickValues = Array.from({ length: yTicks }, (_, i) => {
      return min + (range * i / (yTicks - 1));
    });
    
    return (
      <div className="bg-white p-4 rounded-lg">
        <svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="overflow-visible">
          {yTickValues.map((value, i) => {
            const y = padding.top + innerHeight - ((value - min) / range) * innerHeight;
            return (
              <g key={i}>
                <line x1={padding.left} y1={y} x2={chartWidth - padding.right} y2={y} stroke="#e5e7eb" strokeWidth="1" />
                <text x={padding.left - 10} y={y + 4} textAnchor="end" className="text-xs fill-gray-500">
                  {value.toFixed(1)}
                </text>
              </g>
            );
          })}
          
          <path
            d={`${pathData} L ${points[points.length - 1].x} ${padding.top + innerHeight} L ${padding.left} ${padding.top + innerHeight} Z`}
            fill={color}
            fillOpacity="0.1"
          />
          
          <path d={pathData} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          
          {points.map((point, index) => (
            <g key={index}>
              <circle cx={point.x} cy={point.y} r="5" fill="white" stroke={color} strokeWidth="3" />
              <circle cx={point.x} cy={point.y} r="8" fill="transparent" className="cursor-pointer">
                <title>{`${label}: ${point.value.toFixed(2)}\nTime: ${new Date(point.timestamp).toLocaleTimeString()}`}</title>
              </circle>
            </g>
          ))}
          
          {[0, 10, 20, 30, 40, 50, 60].map((seconds) => {
            const x = padding.left + (seconds / 60) * innerWidth;
            return (
              <text key={seconds} x={x} y={chartHeight - 10} textAnchor="middle" className="text-xs fill-gray-500">
                {seconds}s
              </text>
            );
          })}
        </svg>
      </div>
    );
  };
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="PrecisionPulse Logo" className="w-12 h-12" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">PrecisionPulse</h1>
              <p className="text-xs text-gray-500">Real-time Telemetry</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <RBACGuard permission="manage_users">
              <button onClick={() => router.push('/users')} className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-all text-sm font-semibold">
                Manage Users
              </button>
            </RBACGuard>
            <RBACGuard permission="manage_parameters">
              <button onClick={() => router.push('/parameters')} className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all text-sm font-semibold">
                Parameters
              </button>
            </RBACGuard>
            <button onClick={() => router.push('/profile')} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all text-sm font-semibold">
              Profile
            </button>
            <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-xl">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold text-green-700">Connected</span>
            </div>
            <button onClick={handleLogout} className="px-5 py-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 rounded-xl transition-all text-sm font-semibold">
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Welcome back, {user.name}!</h2>
          <p className="text-gray-400">Monitor your telemetry streams in real-time</p>
        </div>

        <div className="mb-8">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Live Data Stream</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {parameters.map((param, index) => (
              <div key={param.id} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-lg transition-all">
                <div className="text-5xl font-bold text-gray-900 mb-2">
                  {latestData[param.id]?.toFixed(1) || '0.0'}
                </div>
                <div className="text-sm text-gray-600 mb-4">{param.name} ({param.unit})</div>
                <div className="h-16 flex items-end gap-1">
                  {Array.from({ length: 12 }, (_, i) => {
                    const height = 40 + Math.random() * 50;
                    return (
                      <div key={i} className="flex-1 rounded-t" style={{ height: `${height}%`, background: `linear-gradient(to top, ${getChartColor(index)}, ${getChartColor(index)}80)` }} />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Historical Trends</h3>
          <div className="grid grid-cols-1 gap-6">
            {parameters.map((param, index) => (
              <div key={param.id} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-bold text-gray-900">{param.name}</h4>
                    <p className="text-sm text-gray-500">Last 60 seconds</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold" style={{ color: getChartColor(index) }}>
                      {latestData[param.id]?.toFixed(1) || '0.0'} {param.unit}
                    </div>
                    <div className="text-xs text-gray-500">Current Value</div>
                  </div>
                </div>
                {renderLineChart(
                  telemetryHistory.map(d => d[param.id] || 0), 
                  getChartColor(index), 
                  param.name,
                  telemetryHistory.map(d => d.timestamp)
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
