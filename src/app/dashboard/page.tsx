'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import RBACGuard from '@/components/RBACGuard';

interface Parameter {
  id: number;
  name: string;
  enabled: boolean;
  unit: string;
  description: string;
  color?: string;
}

interface TelemetryData {
  [key: string]: number;
  timestamp: number;
}

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  label: string;
  value: string;
  time: string;
  color: string;
}

const PARAM_COLORS = [
  '#4212f0', '#a78bfa', '#54d7ff', '#f472b6', 
  '#fb923c', '#34d399', '#ef4444', '#8b5cf6',
  '#06b6d4', '#10b981', '#f59e0b', '#ec4899'
];

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [parameters, setParameters] = useState<Parameter[]>([]);
  const [telemetryHistory, setTelemetryHistory] = useState<TelemetryData[]>([]);
  const [latestData, setLatestData] = useState<TelemetryData>({ timestamp: Date.now() });
  const [prevValues, setPrevValues] = useState<{ [key: string]: number }>({});
  const [tooltip, setTooltip] = useState<TooltipState>({ visible: false, x: 0, y: 0, label: '', value: '', time: '', color: '#000' });

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

    const loadParameters = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/parameters', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (res.ok) {
          const data = await res.json();
          const enabledParams = (data.parameters || []).filter((p: Parameter) => p.enabled);
          setParameters(enabledParams);
          console.log('[PARAMS] Loaded parameters:', enabledParams);
        }
      } catch (err) {
        console.error('Error loading parameters:', err);
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
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const loadParameters = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/parameters', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (res.ok) {
          const data = await res.json();
          const enabledParams = (data.parameters || []).filter((p: Parameter) => p.enabled);
          setParameters(enabledParams);
          console.log('[PARAMS] Loaded parameters:', enabledParams);
        }
      } catch (err) {
        console.error('Error loading parameters:', err);
      }
    };

    loadParameters();
    const paramInterval = setInterval(loadParameters, 5000);

    return () => clearInterval(paramInterval);
  }, []);

  useEffect(() => {
    if (parameters.length === 0) return;

    const fetchTelemetry = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/telemetry/latest', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (res.ok) {
          const response = await res.json();
          console.log('[TELEMETRY] Raw response:', response);
          
          const data = response.data;
          
          if (data && data.parameters && Array.isArray(data.parameters)) {
            const newData: TelemetryData = { timestamp: Date.now() };
            
            console.log('[TELEMETRY] Processing parameters:', data.parameters);
            
            data.parameters.forEach((param: any) => {
              const paramId = String(param.id);
              const value = parseFloat(param.value);
              console.log(`[TELEMETRY] Param ${paramId}: value=${param.value}, parsed=${value}, isNaN=${isNaN(value)}`);
              
              if (!isNaN(value)) {
                newData[paramId] = value;
              }
            });
            
            console.log('[TELEMETRY] New data object:', newData);
            
            setLatestData(prevLatest => {
              setPrevValues(prevLatest);
              return newData;
            });
            setTelemetryHistory(prev => {
              const updated = [...prev, newData];
              return updated.slice(-20);
            });
          } else {
            console.log('[TELEMETRY] No parameters in response');
          }
        } else {
          console.error('[TELEMETRY] Response not ok:', res.status);
        }
      } catch (err) {
        console.error('[TELEMETRY] Error fetching telemetry:', err);
      }
    };

    const telemetryInterval = setInterval(fetchTelemetry, 3000);
    fetchTelemetry();

    return () => clearInterval(telemetryInterval);
  }, [parameters]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    document.cookie = 'token=; path=/; max-age=0';
    window.location.href = '/login';
  };

  const getChartColor = (paramId: number, index: number) => {
    return PARAM_COLORS[index % PARAM_COLORS.length];
  };

  const getTrendIndicator = (paramId: number) => {
    const paramIdStr = String(paramId);
    const current = latestData[paramIdStr] || 0;
    const prev = prevValues[paramIdStr] || current;
    if (current > prev + 0.1) return { symbol: '▲', color: '#059669' };
    if (current < prev - 0.1) return { symbol: '▼', color: '#dc2626' };
    return { symbol: '', color: '#64748b' };
  };

  const handlePointHover = (e: React.MouseEvent<SVGCircleElement>, label: string, value: number, timestamp: number, color: string) => {
    const svg = (e.currentTarget as SVGCircleElement).closest('svg');
    if (!svg) return;
    
    const rect = svg.getBoundingClientRect();
    const cx = parseFloat((e.currentTarget as SVGCircleElement).getAttribute('cx') || '0');
    const cy = parseFloat((e.currentTarget as SVGCircleElement).getAttribute('cy') || '0');
    
    const x = rect.left + (cx / svg.clientWidth) * rect.width;
    const y = rect.top + (cy / svg.clientHeight) * rect.height;
    
    const time = new Date(timestamp).toLocaleTimeString();
    
    setTooltip({
      visible: true,
      x,
      y,
      label,
      value: value.toFixed(2),
      time,
      color
    });
  };

  const renderLineChart = (data: number[], color: string, label: string, timestamps: number[], unit: string) => {
    if (data.length === 0 || data.length === 1) return (
      <div className="h-64 flex items-center justify-center text-gray-400 bg-white rounded-lg">
        <p>Collecting data...</p>
      </div>
    );
    
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const padding = { top: 80, right: 40, bottom: 50, left: 70 };
    const chartWidth = 1400;
    const chartHeight = 350;
    const innerWidth = chartWidth - padding.left - padding.right;
    const innerHeight = chartHeight - padding.top - padding.bottom;
    
    const points = data.map((value, index) => {
      const x = padding.left + (index / Math.max(data.length - 1, 1)) * innerWidth;
      const y = padding.top + innerHeight - ((value - min) / range) * innerHeight;
      return { x: isNaN(x) ? padding.left : x, y: isNaN(y) ? padding.top : y, value, timestamp: timestamps[index] };
    }).filter(p => !isNaN(p.x) && !isNaN(p.y));
    
    if (points.length === 0) return (
      <div className="h-64 flex items-center justify-center text-gray-400 bg-white rounded-lg">
        <p>Invalid data...</p>
      </div>
    );
    
    const pathData = points.map((point, index) => {
      if (index === 0) return `M ${point.x} ${point.y}`;
      return `L ${point.x} ${point.y}`;
    }).join(' ');
    
    const yTicks = 5;
    const yTickValues = Array.from({ length: yTicks }, (_, i) => {
      return max - (range * i / (yTicks - 1));
    });
    
    const currentValue = data[data.length - 1];
    
    return (
      <div className="bg-white p-6 rounded-lg">
        <svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="overflow-visible">
          {/* Title */}
          <text x={padding.left} y="35" fontSize="24" fontWeight="bold" fill="#1e293b">
            {label}
          </text>
          
          {/* Subtitle */}
          <text x={padding.left} y="55" fontSize="14" fill="#64748b">
            Last 60 seconds
          </text>
          
          {/* Current Value */}
          <text x={chartWidth - padding.right - 200} y="40" fontSize="32" fontWeight="bold" fill={color}>
            {currentValue.toFixed(1)} {unit}
          </text>
          
          <text x={chartWidth - padding.right - 200} y="60" fontSize="12" fill="#64748b">
            Current Value
          </text>
          
          {/* Grid lines and Y-axis labels */}
          {yTickValues.map((value, i) => {
            const y = padding.top + innerHeight - ((value - min) / range) * innerHeight;
            return (
              <g key={i}>
                <line x1={padding.left} y1={y} x2={chartWidth - padding.right} y2={y} stroke="#e5e7eb" strokeWidth="1" />
                <text x={padding.left - 10} y={y + 4} textAnchor="end" fontSize="11" fill="#9ca3af">
                  {value.toFixed(1)}
                </text>
              </g>
            );
          })}
          
          {/* X-axis labels */}
          {[0, 10, 20, 30, 40, 50, 60].map((seconds) => {
            const x = padding.left + (seconds / 60) * innerWidth;
            return (
              <text key={seconds} x={x} y={chartHeight - 10} textAnchor="middle" fontSize="11" fill="#9ca3af">
                {seconds}s
              </text>
            );
          })}
          
          {/* Filled area under line */}
          <path
            d={`${pathData} L ${points[points.length - 1].x} ${padding.top + innerHeight} L ${padding.left} ${padding.top + innerHeight} Z`}
            fill={color}
            fillOpacity="0.1"
          />
          
          {/* Line */}
          <path d={pathData} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          
          {/* Points */}
          {points.map((point, index) => (
            <g key={index}>
              <circle cx={point.x} cy={point.y} r="5" fill="white" stroke={color} strokeWidth="3" />
              <circle 
                cx={point.x} 
                cy={point.y} 
                r="8" 
                fill="transparent" 
                className="cursor-pointer"
                onMouseEnter={(e) => handlePointHover(e, label, point.value, point.timestamp, color)}
                onMouseLeave={() => setTooltip({ ...tooltip, visible: false })}
              />
            </g>
          ))}
        </svg>
      </div>
    );
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-gray-300 border-b border-gray-400 sticky top-0 z-50">
        <div className="px-4 sm:px-8 py-0 flex flex-col lg:flex-row justify-between items-start lg:items-center h-auto lg:h-24 py-4 lg:py-0 gap-4 lg:gap-3">
          <div className="flex items-center gap-4">
            <img src="/logo.svg" alt="PrecisionPulse Logo" className="w-8 h-8 sm:w-12 sm:h-12" />
            <div>
              <h1 className="text-lg sm:text-2xl font-bold text-slate-900">PrecisionPulse</h1>
              <p className="text-xs sm:text-sm text-slate-600">Real-time Telemetry</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 w-full lg:w-auto">
            <RBACGuard permission="manage_users">
              <button onClick={() => router.push('/users')} className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold text-sm">
                Manage Users
              </button>
            </RBACGuard>
            <RBACGuard permission="manage_parameters">
              <button onClick={() => router.push('/parameters')} className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-sm">
                Parameters
              </button>
            </RBACGuard>
            <button onClick={() => router.push('/profile')} className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm">
              Profile
            </button>
            <div className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-emerald-100 rounded-lg w-full sm:w-auto justify-center sm:justify-start">
              <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
              <span className="text-sm font-semibold text-emerald-700">Connected</span>
            </div>
            <button onClick={handleLogout} className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-white hover:bg-gray-100 text-red-600 rounded-lg font-semibold text-sm border border-gray-300">
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-8 lg:px-20 py-12">
        <div className="mb-8">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-2">Welcome back, {user.name}!</h2>
          <p className="text-gray-400 text-base sm:text-lg lg:text-xl">Monitor your telemetry streams in real-time</p>
        </div>

        {/* Live Data Stream */}
        <div className="mb-12">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Live Data Stream</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {parameters.map((param, index) => {
              const trend = getTrendIndicator(param.id);
              const color = getChartColor(param.id, index);
              const paramIdStr = String(param.id);
              const currentValue = latestData[paramIdStr];
              
              return (
                <div key={param.id} className="bg-white rounded-3xl p-6 shadow-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-6xl font-bold text-slate-900">
                      {currentValue !== undefined ? currentValue.toFixed(1) : '0.0'}
                    </div>
                    {trend.symbol && (
                    <div style={{ color: trend.color }} className="text-3xl">
                      {trend.symbol}
                    </div>
                  )}
                  </div>
                  <div className="text-gray-600 text-sm mb-4 font-medium">{param.name} ({param.unit})</div>
                  <div className="h-16 flex items-end gap-1">
                    {telemetryHistory.slice(-14).map((data, i) => {
                      const value = data[paramIdStr] || 0;
                      const values = telemetryHistory.map(d => d[paramIdStr] || 0);
                      const min = Math.min(...values);
                      const max = Math.max(...values);
                      const range = max - min || 1;
                      const height = ((value - min) / range) * 100;
                      return (
                        <div key={i} className="flex-1 rounded-t" style={{ height: `${Math.max(height, 10)}%`, backgroundColor: color }} />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Historical Trends */}
        <div>
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Historical Trends</h3>
          <div className="space-y-6">
            {parameters.map((param, index) => {
              const color = getChartColor(param.id, index);
              const paramIdStr = String(param.id);
              
              return (
                <div key={param.id} className="bg-white rounded-3xl p-6 shadow-lg">
                  {renderLineChart(
                    telemetryHistory.map(d => d[paramIdStr] || 0), 
                    color, 
                    param.name,
                    telemetryHistory.map(d => d.timestamp),
                    param.unit
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip.visible && (
        <div 
          className="fixed bg-white border-2 rounded px-3 py-2 text-sm font-medium pointer-events-none z-50"
          style={{
            left: `${tooltip.x}px`,
            top: `${tooltip.y - 80}px`,
            borderColor: tooltip.color,
            transform: 'translateX(-50%)'
          }}
        >
          <div style={{ color: tooltip.color }}>{tooltip.label}: {tooltip.value}</div>
          <div style={{ color: tooltip.color }} className="text-xs opacity-75">Time: {tooltip.time}</div>
        </div>
      )}
    </div>
  );
}
