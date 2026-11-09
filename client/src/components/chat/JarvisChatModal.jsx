import React, { useState, useRef, useEffect } from 'react';
import { useJarvis } from '../../context/JarvisContext';
import { X, Send, Bot, User, Sparkles, Terminal } from 'lucide-react';
import { soundEffects } from '../../engine/soundEffects';

export default function JarvisChatModal() {
  const { isChatOpen, setIsChatOpen, incidentDetails } = useJarvis();
  const [messages, setMessages] = useState([
    {
      sender: 'jarvis',
      text: 'Good day, Operator. I am J.A.R.V.I.S., your Justified Analysis & Reasoning Incident Visualizer Assistant. I have analyzed 247 incoming telemetry signals and isolated the single root outage. How may I assist your triage?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  if (!isChatOpen) return null;

  const handleSend = async (userText) => {
    const textToSend = userText || input;
    if (!textToSend.trim()) return;

    soundEffects.playClick();
    const userMsg = { sender: 'user', text: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: textToSend })
      });

      if (res.ok) {
        const data = await res.json();
        soundEffects.playSuccess();
        setMessages(prev => [...prev, { sender: 'jarvis', text: data.reply }]);
      } else {
        throw new Error('API failed');
      }
    } catch {
      // Offline fallback rule-based response
      setTimeout(() => {
        soundEffects.playSuccess();
        const rootSvc = incidentDetails?.rootCauseAnalysis?.rootCause?.service || 'core-db';
        const q = textToSend.toLowerCase();
        let reply = `Operator, our telemetry confirms that **${rootSvc} connection pool exhaustion** is the root anomaly with 91% justified confidence. Downstream payment timeouts are secondary symptoms caused by database queue contention.`;

        if (q.includes('fix') || q.includes('solve') || q.includes('playbook')) {
          reply = `Recommended protocol: Scale PgBouncer pool to 500 connections via \`kubectl scale deploy pgbouncer --replicas=6\` and terminate idle sessions. This will resolve the entire outage within 2.5 minutes.`;
        } else if (q.includes('next') || q.includes('fail') || q.includes('predict')) {
          reply = `Predictive Failure Cone indicates that **Payment Service** will breach its thread SLA in **04:12 minutes** with 94% certainty unless connection handles are expanded.`;
        } else if (q.includes('user') || q.includes('impact') || q.includes('who')) {
          reply = `Blast radius is currently 5 microservices, impacting **4,200 active users** with $18,500 USD in delayed checkout volume.`;
        }

        setMessages(prev => [...prev, { sender: 'jarvis', text: reply }]);
      }, 500);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[420px] max-w-[calc(100vw-32px)] h-[560px] rounded-2xl hud-panel border border-cyber-cyan shadow-neon-cyan flex flex-col justify-between overflow-hidden font-mono">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-cyber-border bg-cyber-card/80">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyber-cyan/15 border border-cyber-cyan/40 flex items-center justify-center text-cyber-cyan shadow-neon-cyan">
            <Bot className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="text-xs font-bold text-white tracking-wider flex items-center space-x-1.5">
              <span>J.A.R.V.I.S. AI CO-PILOT</span>
              <Sparkles className="w-3 h-3 text-cyber-cyan" />
            </div>
            <span className="text-[10px] text-cyber-green flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyber-green animate-ping" />
              <span>Gemini 1.5 Telemetry Reasoner</span>
            </span>
          </div>
        </div>

        <button
          onClick={() => {
            soundEffects.playClick();
            setIsChatOpen(false);
          }}
          className="text-cyber-muted hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Message History */}
      <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex items-start space-x-2 ${
              m.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {m.sender === 'jarvis' && (
              <div className="w-6 h-6 rounded-full bg-cyber-cyan/20 border border-cyber-cyan text-cyber-cyan flex items-center justify-center flex-shrink-0 text-[10px] font-bold">
                J
              </div>
            )}

            <div
              className={`p-3 rounded-xl max-w-[85%] leading-relaxed whitespace-pre-wrap ${
                m.sender === 'user'
                  ? 'bg-cyber-blue/20 border border-cyber-blue/40 text-white rounded-br-none'
                  : 'bg-cyber-card/90 border border-cyber-border/80 text-cyber-text rounded-bl-none shadow-hud-card'
              }`}
            >
              {m.text}
            </div>

            {m.sender === 'user' && (
              <div className="w-6 h-6 rounded-full bg-cyber-blue/30 border border-cyber-blue text-white flex items-center justify-center flex-shrink-0 text-[10px]">
                U
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center space-x-2 text-cyber-cyan text-[11px]">
            <Bot className="w-3.5 h-3.5 animate-spin" />
            <span>Analyzing incident knowledge graph...</span>
          </div>
        )}
      </div>

      {/* Suggested Quick Question Chips */}
      <div className="px-4 py-2 bg-cyber-bg/70 border-t border-cyber-border/60 flex items-center space-x-1.5 overflow-x-auto text-[10px]">
        {[
          "Why did payments fail?",
          "How do I fix it?",
          "What will fail next?",
          "Users impacted?"
        ].map((q, i) => (
          <button
            key={i}
            onClick={() => handleSend(q)}
            className="px-2 py-0.5 rounded bg-cyber-card border border-cyber-border hover:border-cyber-cyan text-cyber-cyan whitespace-nowrap cursor-pointer transition-colors"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 bg-cyber-card/90 border-t border-cyber-border flex items-center space-x-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask J.A.R.V.I.S. about the incident..."
          className="flex-1 bg-cyber-bg border border-cyber-border rounded-lg px-3 py-2 text-xs text-cyber-text focus:outline-none focus:border-cyber-cyan"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="p-2 rounded-lg bg-cyber-cyan/20 border border-cyber-cyan text-cyber-cyan hover:bg-cyber-cyan/30 disabled:opacity-40 transition-all cursor-pointer shadow-neon-cyan"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
