import React, { useState, useEffect } from 'react';
import { useJarvis } from '../../context/JarvisContext';
import { Mic, Volume2, X, Terminal, Radio } from 'lucide-react';
import { soundEffects } from '../../engine/soundEffects';

export default function VoiceAssistant() {
  const { isVoiceListening, setIsVoiceListening, setActiveTab, incidentDetails, setIsChatOpen } = useJarvis();
  const [transcript, setTranscript] = useState('');
  const [aiSpeechResponse, setAiSpeechResponse] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    if (!isVoiceListening) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setTranscript('Web Speech API is not supported in this browser. Please use the AI Chat modal.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      soundEffects.playClick();
      setTranscript('Listening for commands: "What\'s wrong?", "Show root cause", "What will fail next?", "Read report"...');
    };

    recognition.onresult = (event) => {
      const current = event.resultIndex;
      const text = event.results[current][0].transcript.toLowerCase();
      setTranscript(text);

      if (event.results[current].isFinal) {
        handleVoiceCommand(text);
      }
    };

    recognition.onerror = (err) => {
      console.warn('Speech error:', err);
    };

    try {
      recognition.start();
    } catch {}

    return () => {
      try {
        recognition.stop();
      } catch {}
    };
  }, [isVoiceListening]);

  const speakText = (text) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.pitch = 0.95; // deep calm JARVIS tone

    // Try finding an English male or clear voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.name.includes('Daniel') || v.name.includes('George') || v.name.includes('Google UK English Male') || v.lang === 'en-US');
    if (preferredVoice) utterance.voice = preferredVoice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const handleVoiceCommand = (command) => {
    if (command.includes("what's wrong") || command.includes("status") || command.includes("issue")) {
      const resp = "Sir, telemetry confirms Core DB connection pool exhaustion. 247 alarms have been consolidated into 1 root outage.";
      setAiSpeechResponse(resp);
      speakText(resp);
      setActiveTab('investigation');
    } else if (command.includes("root cause") || command.includes("why")) {
      const resp = "Root cause is Core PostgreSQL DB at 91% confidence due to HikariCP pool saturation. Auth Service and API Gateway are downstream victims.";
      setAiSpeechResponse(resp);
      speakText(resp);
      setActiveTab('investigation');
    } else if (command.includes("next") || command.includes("predict") || command.includes("fail")) {
      const resp = "Predictive failure cone indicates Payment Service will breach its thread capacity in 4 minutes and 12 seconds with 94% probability.";
      setAiSpeechResponse(resp);
      speakText(resp);
      setActiveTab('predictions');
    } else if (command.includes("report") || command.includes("summary")) {
      const resp = "Generating post-mortem incident report. Core DB pool scaling is recommended to prevent 4,200 affected user sessions.";
      setAiSpeechResponse(resp);
      speakText(resp);
      setActiveTab('reports');
    } else if (command.includes("chat") || command.includes("assistant")) {
      setIsChatOpen(true);
      speakText("Opening full AI interactive chat assistant.");
    } else {
      const resp = `Command acknowledged: "${command}". Displaying incident telemetry.`;
      setAiSpeechResponse(resp);
      speakText(resp);
    }
  };

  if (!isVoiceListening) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 p-4 rounded-xl hud-panel border-cyber-cyan shadow-neon-cyan">
      <div className="flex items-center justify-between pb-2 border-b border-cyber-border mb-3">
        <div className="flex items-center space-x-2 text-cyber-cyan font-mono text-xs font-bold">
          <Radio className="w-4 h-4 animate-spin" />
          <span>J.A.R.V.I.S. VOICE SYNAPSE</span>
        </div>
        <button
          onClick={() => {
            soundEffects.playClick();
            if ('speechSynthesis' in window) window.speechSynthesis.cancel();
            setIsVoiceListening(false);
          }}
          className="text-cyber-muted hover:text-white cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Voice Wave Animation */}
      <div className="flex items-center justify-center space-x-1.5 h-12 my-2 bg-cyber-bg/70 rounded-lg border border-cyber-border/70">
        {[40, 70, 90, 60, 100, 45, 80, 65, 95, 30].map((h, i) => (
          <div
            key={i}
            className="w-1.5 bg-cyber-cyan rounded-full animate-pulse shadow-neon-cyan"
            style={{
              height: isSpeaking ? `${h}%` : '20%',
              animationDuration: `${0.4 + (i % 3) * 0.2}s`
            }}
          />
        ))}
      </div>

      {/* Transcript */}
      <div className="text-xs font-mono text-cyber-text bg-cyber-card/70 p-2.5 rounded border border-cyber-border/60 min-h-[48px]">
        <span className="text-cyber-cyan mr-1">&gt;</span>
        {transcript || "Listening..."}
      </div>

      {/* Spoken Response */}
      {aiSpeechResponse && (
        <div className="mt-2 text-xs font-mono text-cyber-green bg-cyber-green/10 p-2 rounded border border-cyber-green/30">
          <div className="flex items-center space-x-1 text-[10px] text-cyber-muted uppercase mb-0.5">
            <Volume2 className="w-3 h-3" />
            <span>Spoken response</span>
          </div>
          {aiSpeechResponse}
        </div>
      )}

      {/* Suggested Quick Triggers */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {["What's wrong?", "Show root cause", "What will fail next?", "Read report"].map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleVoiceCommand(prompt.toLowerCase())}
            className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyber-cyan/10 hover:bg-cyber-cyan/20 border border-cyber-cyan/30 text-cyber-cyan transition-colors cursor-pointer"
          >
            "{prompt}"
          </button>
        ))}
      </div>
    </div>
  );
}
