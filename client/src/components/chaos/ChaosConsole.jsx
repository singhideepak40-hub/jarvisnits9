import React from 'react';
import { useJarvis } from '../../context/JarvisContext';
import { Database, Flame, Cpu, WifiOff, CreditCard, TrendingUp, Sparkles, Terminal } from 'lucide-react';
import { soundEffects } from '../../engine/soundEffects';

export default function ChaosConsole() {
  const { triggerChaos, chaosScenario } = useJarvis();

  const scenarios = [
    {
      id: 'kill_db',
      label: 'Kill Core DB',
      sublabel: 'Exhaust connection pool (HikariCP 98%)',
      icon: Database,
      color: 'border-cyber-red text-cyber-red hover:bg-cyber-red/20 shadow-neon-red'
    },
    {
      id: 'cpu_spike',
      label: 'Spike CPU 99%',
      sublabel: 'Payment Service crypto thread pegging',
      icon: Cpu,
      color: 'border-cyber-amber text-cyber-amber hover:bg-cyber-amber/20'
    },
    {
      id: 'memory_leak',
      label: 'Heap Memory OOM',
      sublabel: 'Auth Service leaked JWT cache',
      icon: Flame,
      color: 'border-cyber-purple text-cyber-purple hover:bg-cyber-purple/20'
    },
    {
      id: 'net_delay',
      label: 'Network Delay 3s',
      sublabel: 'API Gateway cross-AZ packet latency',
      icon: WifiOff,
      color: 'border-cyber-blue text-cyber-blue hover:bg-cyber-blue/20'
    },
    {
      id: 'payment_gateway_down',
      label: 'Break Stripe/Bank',
      sublabel: 'External payment gateway HTTP 503',
      icon: CreditCard,
      color: 'border-cyber-cyan text-cyber-cyan hover:bg-cyber-cyan/20'
    },
    {
      id: 'traffic_surge',
      label: '10x Traffic Surge',
      sublabel: 'Black Swan flash sale overload',
      icon: TrendingUp,
      color: 'border-cyber-green text-cyber-green hover:bg-cyber-green/20'
    }
  ];

  return (
    <div className="rounded-xl hud-panel p-4 border border-cyber-border">
      <div className="flex items-center justify-between pb-3 border-b border-cyber-border/70 mb-3">
        <div className="flex items-center space-x-2 text-cyber-cyan font-mono text-xs font-bold">
          <Terminal className="w-4 h-4 text-cyber-red animate-pulse" />
          <span>CHAOS INJECTION CONSOLE (W7 LIVE FAULT INJECTION)</span>
        </div>
        <span className="text-[10px] font-mono text-cyber-muted">
          Active Scenario: <strong className="text-cyber-cyan uppercase">{chaosScenario}</strong>
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {scenarios.map(sc => {
          const Icon = sc.icon;
          const isActive = chaosScenario === sc.id;

          return (
            <button
              key={sc.id}
              onClick={() => triggerChaos(sc.id)}
              className={`flex flex-col items-start p-2.5 rounded-lg border font-mono text-left transition-all cursor-pointer ${
                isActive
                  ? `${sc.color} bg-cyber-card/90 ring-1 ring-white/50 scale-[1.02]`
                  : 'border-cyber-border bg-cyber-card/60 text-cyber-muted hover:text-white hover:border-cyber-muted'
              }`}
            >
              <div className="flex items-center space-x-2 mb-1">
                <Icon className="w-4 h-4" />
                <span className="text-xs font-bold">{sc.label}</span>
              </div>
              <span className="text-[10px] opacity-75 font-sans leading-tight">
                {sc.sublabel}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
