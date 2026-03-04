'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';

interface Parameter {
  id: string;
  name: string;
  enabled: boolean;
  unit: string;
  description: string;
}

function ParametersPageContent() {
  const router = useRouter();
  const [parameters, setParameters] = useState<Parameter[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', unit: '', description: '' });

  useEffect(() => {
    const savedParams = localStorage.getItem('parameters');
    if (savedParams) {
      setParameters(JSON.parse(savedParams));
    } else {
      const defaultParams: Parameter[] = [
        { id: 'temp', name: 'Temperature', enabled: true, unit: '°C', description: 'Ambient temperature sensor' },
        { id: 'pressure', name: 'Pressure', enabled: true, unit: 'kPa', description: 'System pressure measurement' },
        { id: 'flow', name: 'Flow Rate', enabled: true, unit: 'L/s', description: 'Liquid flow rate' },
        { id: 'humidity', name: 'Humidity', enabled: true, unit: '%', description: 'Relative humidity' },
        { id: 'voltage', name: 'Voltage', enabled: true, unit: 'V', description: 'System voltage' },
        { id: 'current', name: 'Current', enabled: true, unit: 'A', description: 'System current' },
      ];
      setParameters(defaultParams);
      localStorage.setItem('parameters', JSON.stringify(defaultParams));
    }
  }, []);

  const toggleParameter = (id: string) => {
    const updated = parameters.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p);
    setParameters(updated);
    localStorage.setItem('parameters', JSON.stringify(updated));
    window.dispatchEvent(new Event('parametersChanged'));
  };

  const addParameter = (e: React.FormEvent) => {
    e.preventDefault();
    const newParam: Parameter = {
      id: `param_${Date.now()}`,
      name: formData.name,
      enabled: true,
      unit: formData.unit,
      description: formData.description,
    };
    const updated = [...parameters, newParam];
    setParameters(updated);
    localStorage.setItem('parameters', JSON.stringify(updated));
    window.dispatchEvent(new Event('parametersChanged'));
    setShowModal(false);
    setFormData({ name: '', unit: '', description: '' });
  };

  const removeParameter = (id: string) => {
    if (confirm('Remove this parameter?')) {
      const updated = parameters.filter(p => p.id !== id);
      setParameters(updated);
      localStorage.setItem('parameters', JSON.stringify(updated));
      window.dispatchEvent(new Event('parametersChanged'));
    }
  };

  const saveConfiguration = async () => {
    localStorage.setItem('parameters', JSON.stringify(parameters));
    window.dispatchEvent(new Event('parametersChanged'));
    alert(`Configuration saved! ${parameters.filter(p => p.enabled).length} parameters enabled.`);
  };

  const enabledCount = parameters.filter(p => p.enabled).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="bg-white/10 backdrop-blur-lg border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="PrecisionPulse Logo" className="w-12 h-12" />
            <div>
              <h1 className="text-xl font-bold text-white">PrecisionPulse</h1>
              <p className="text-xs text-gray-400">Parameter Configuration</p>
            </div>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-5 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-all text-sm font-semibold"
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Telemetry Parameters</h2>
            <p className="text-gray-400">Configure which parameters the desktop application should collect</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all shadow-lg"
            >
              + Add Parameter
            </button>
            <button
              onClick={saveConfiguration}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all shadow-lg"
            >
              Save & Send to Desktop
            </button>
          </div>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6">
          <p className="text-blue-300 text-sm">
            <strong>{enabledCount}</strong> of <strong>{parameters.length}</strong> parameters enabled. 
            Desktop will collect and send only enabled parameters every 3 seconds.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Parameter</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Unit</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Description</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {parameters.map((param) => (
                <tr key={param.id} className="border-b border-gray-700/50 hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleParameter(param.id)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        param.enabled 
                          ? 'bg-green-500/20 text-green-300' 
                          : 'bg-red-500/20 text-red-300'
                      }`}
                    >
                      {param.enabled ? '✓ Enabled' : '✗ Disabled'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-white font-medium">{param.name}</td>
                  <td className="px-6 py-4 text-gray-300">{param.unit}</td>
                  <td className="px-6 py-4 text-gray-400">{param.description}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => removeParameter(param.id)}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full border border-gray-700">
            <h3 className="text-2xl font-bold text-white mb-6">Add New Parameter</h3>
            <form onSubmit={addParameter} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Parameter Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Temperature"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Unit</label>
                <input
                  type="text"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., °C, kPa, L/s"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief description of this parameter"
                  rows={3}
                  required
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl"
                >
                  Add Parameter
                </button>
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setFormData({ name: '', unit: '', description: '' }); }}
                  className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-xl"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ParametersPage() {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <ParametersPageContent />
    </ProtectedRoute>
  );
}
