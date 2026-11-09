import React, { useState } from 'react';
import { useJarvis } from '../../context/JarvisContext';
import { Activity, Flame, ShieldAlert, CheckCircle2, Sliders, Zap } from 'lucide-react';

export default function LiveTrafficController() {
  const {
    currentScenarioPreset,
    loadScenario,
    healAllServices,
    setNodes
  } = useJarvis();

  const [trafficRate, setTrafficRate] = useState(14500); // req/sec
  const [chaosMode, setChaosMode] = useState('db');

  const handleTrafficChange = (val) => {
    setTrafficRate(val);

    // Dynamically adjust microservice latencies and load based on slider
    const loadMultiplier = val / 10000;
    setNodes(prev => prev.map(node => {
      const baseLat = node.id === 'core-db' ? 45 : (node.id === 'auth-service' ? 35 : 20);
      const computedLat = Math.round(baseLat * (node.status === 'failing' ? 40 : loadMultiplier));
      const computedCpu = Math.min(99, Math.round(25 * loadMultiplier));
      const computedConns = Math.min(100, Math.round(20 * loadMultiplier * (node.id === 'core-db' ? 3.2 : 1.2)));

      return {
        ...node,
        metrics: {
          ...node.metrics,
          latency: computedLat,
          cpu: computedCpu,
          connections: computedConns
        }
      };
    }));
  };

  return (
    <div className="calm-card p-4 sm:p-5 select-none space-y-3.5 border border-surface-border">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-surface-bg border border-surface-border flex items-center justify-center text-brand-400">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">
              Live Banking Telemetry & Chaos Controller
            </h3>
            <p className="text-xs text-slate-400">
              Dynamically stress-test the banking cluster and observe real-time failure prediction response.
            </p>
          </div>
        </div>

        {/* Quick Simulation Presets */}
        <div className="flex items-center space-x-1.5 text-xs">
          <span className="text-slate-500 text-[11px] hidden md:inline">Stress Scenarios:</span>
          <button
            onClick={() => {
              setTrafficRate(42000);
              loadScenario('db_pool');
            }}
            className="px-2.5 py-1 rounded bg-rose-500/15 border border-rose-500/30 text-rose-300 hover:bg-rose-500/25 transition-colors cursor-pointer text-xs font-medium"
          >
            DB Pool Spike
          </button>
          <button
            onClick={() => {
              setTrafficRate(18000);
              loadScenario('stripe_down');
            }}
            className="px-2.5 py-1 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25 transition-colors cursor-pointer text-xs font-medium"
          >
            Gateway 503
          </button>
          <button
            onClick={() => {
              setTrafficRate(2400);
              healAllServices();
            }}
            className="px-2.5 py-1 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25 transition-colors cursor-pointer text-xs font-medium"
          >
            Restore Baseline
          </button>
        </div>
      </div>

      {/* Traffic Slider */}
      <div className="pt-2 grid grid-cols-1 md:grid-cols-3 gap-4 items-center bg-surface-bg/60 p-3 rounded-lg border border-surface-border">
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Synthetic Transaction Rate:</span>
            <span className="font-mono font-semibold text-brand-400">
              {trafficRate.toLocaleString()} req/sec
            </span>
          </div>
          <input
            type="range"
            min={1200}
            max={50000}
            step={800}
            value={trafficRate}
            onChange={(e) => handleTrafficChange(Number(e.target.value))}
            className="w-full accent-brand-500 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>1,200/s (Baseline)</span>
            <span>25,000/s (Peak)</span>
            <span>50,000/s (Black Friday)</span>
          </div>
        </div>

        {/* Telemetry Reaction Stats */}
        <div className="flex items-center justify-around border-l border-r border-surface-border px-3 text-xs">
          <div>
            <span className="text-slate-500 block text-[10px]">Ingress TPS</span>
            <span className="font-semibold text-white">{(trafficRate * 0.98).toFixed(0)}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">Active DB Conns</span>
            <span className={`font-semibold ${trafficRate > 30000 ? 'text-rose-400' : 'text-slate-200'}`}>
              {Math.min(100, Math.round(trafficRate / 480))}/100 slots
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">P99 Latency</span>
            <span className={`font-semibold ${trafficRate > 30000 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {trafficRate > 30000 ? '4,820ms' : '28ms'}
            </span>
          </div>
        </div>

        {/* Reactive Prediction Warning */}
        <div className="flex items-center space-x-2.5 text-xs">
          <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${trafficRate > 25000 ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}`} />
          <p className="text-slate-300 text-[11px] leading-snug">
            {trafficRate > 35000 ? (
              <span className="text-rose-300 font-medium">
                ⚠️ Cascade Triggered: PostgreSQL connection ceiling reached. Stalling auth sessions.
              </span>
            ) : trafficRate > 20000 ? (
              <span className="text-amber-300 font-medium">
                ⚡ Elevated Pressure: Buffer utilization climbing linearly at +4.8 slots/min.
              </span>
            ) : (
              <span className="text-emerald-400 font-medium">
                ✓ Stable Equilibrium: Telemetry within safety threshold boundaries.
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
