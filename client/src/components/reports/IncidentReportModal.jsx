import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import { FileSpreadsheet, Download, Copy, Check, ShieldAlert, CheckCircle2, Clock } from 'lucide-react';
import { soundEffects } from '../../engine/soundEffects';

export default function IncidentReportModal({ incidentData }) {
  const [copied, setCopied] = useState(false);

  const report = {
    incidentId: 'INC-2026-001',
    generatedAt: new Date().toLocaleString(),
    title: 'Core DB Connection Pool Exhaustion & Payment Cascade Outage',
    severity: 'CRITICAL (P1)',
    outageDuration: '18.5 minutes',
    rootCause: 'Core PostgreSQL DB (HikariCP connection pool saturation at 98/100 slots)',
    confidence: '91% (Justified Multi-Signal Analysis)',
    impact: {
      affectedUsers: '4,200 active customer sessions',
      failedTransactions: '142 checkout orders',
      revenueAtRisk: '$18,500 USD',
      servicesAffected: 'Core DB, Auth Service, API Gateway, Payment Service, Notification Service'
    },
    timeline: [
      '10:41:00 AM - Core DB connection pool hits 98% saturation; query latency surges to 4,820ms.',
      '10:41:30 AM - Auth Service thread pool blocks waiting for user session lookups.',
      '10:42:00 AM - API Gateway returns HTTP 504 Gateway Timeout to checkout ingress.',
      '10:42:45 AM - Payment Service checkout transactions fail with DB deadlocks.',
      '10:43:15 AM - Notification Service DLQ queue fills with 1,200 pending retry alerts.'
    ],
    remediation: [
      'Step 1: Scaled PgBouncer connection pool replicas to 6 (max_connections=500).',
      'Step 2: Terminated 42 idle-in-transaction client database handles.',
      'Step 3: Executed rolling soft restart of Auth Service pods.',
      'Step 4: Replayed queued idempotent checkout orders from dead letter queue.'
    ],
    futureForecast: 'Payment Service thread starvation predicted in 04:12m without proactive pool expansion.',
    lessonsLearned: [
      'Implement strict connection pool ceiling alert at 80% saturation.',
      'Enforce circuit breakers on Auth Service user session queries to shed non-critical traffic.',
      'Migrate heavy analytics queries to isolated read-replica databases.'
    ]
  };

  const exportPDF = () => {
    soundEffects.playSuccess();
    const doc = new jsPDF();

    // Dark cyberpunk header styling in PDF
    doc.setFillColor(9, 15, 30);
    doc.rect(0, 0, 210, 35, 'F');

    doc.setTextColor(0, 242, 254);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('J.A.R.V.I.S. POST-MORTEM INCIDENT REPORT', 14, 18);

    doc.setTextColor(180, 190, 210);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Incident ID: ${report.incidentId} | Generated: ${report.generatedAt} | Severity: ${report.severity}`, 14, 28);

    let y = 46;

    // Executive Summary
    doc.setTextColor(20, 20, 20);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('1. Executive Incident Summary', 14, y);
    y += 7;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const summaryLines = [
      `Title: ${report.title}`,
      `Outage Duration: ${report.outageDuration} | Justified Confidence: ${report.confidence}`,
      `Root Cause: ${report.rootCause}`
    ];
    summaryLines.forEach(l => {
      doc.text(l, 14, y);
      y += 6;
    });

    y += 4;
    // Impact
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('2. Customer & Financial Impact', 14, y);
    y += 7;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`- Users Affected: ${report.impact.affectedUsers}`, 16, y); y += 6;
    doc.text(`- Failed Orders: ${report.impact.failedTransactions}`, 16, y); y += 6;
    doc.text(`- Estimated Revenue Exposure: ${report.impact.revenueAtRisk}`, 16, y); y += 6;
    doc.text(`- Blast Radius: ${report.impact.servicesAffected}`, 16, y); y += 10;

    // Timeline
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('3. Incident Spread Chronology', 14, y);
    y += 7;

    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'normal');
    report.timeline.forEach(t => {
      doc.text(t, 16, y);
      y += 6;
    });

    y += 4;
    // Remediation
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('4. Executed Remediation Actions', 14, y);
    y += 7;

    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'normal');
    report.remediation.forEach(r => {
      doc.text(r, 16, y);
      y += 6;
    });

    y += 4;
    // Lessons Learned
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('5. Preventive Lessons Learned', 14, y);
    y += 7;

    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'normal');
    report.lessonsLearned.forEach(l => {
      doc.text(`- ${l}`, 16, y);
      y += 6;
    });

    doc.save(`JARVIS_Incident_Report_${report.incidentId}.pdf`);
  };

  const copyMarkdown = () => {
    soundEffects.playClick();
    const md = `# J.A.R.V.I.S. Post-Mortem Incident Report: ${report.incidentId}
**Generated:** ${report.generatedAt}
**Severity:** ${report.severity}
**Root Cause:** ${report.rootCause} (${report.confidence})

## Executive Summary
${report.title}
Outage Duration: ${report.outageDuration}
Users Impacted: ${report.impact.affectedUsers}
Financial Exposure: ${report.impact.revenueAtRisk}

## Timeline
${report.timeline.map(t => `- ${t}`).join('\n')}

## Remediation Plan
${report.remediation.map(r => `- ${r}`).join('\n')}

## Lessons Learned
${report.lessonsLearned.map(l => `- ${l}`).join('\n')}`;

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl hud-panel p-5 border border-cyber-border space-y-4 font-mono">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-cyber-border/70 gap-2">
        <div className="flex items-center space-x-2 text-cyber-cyan text-xs font-bold">
          <FileSpreadsheet className="w-4 h-4 text-cyber-cyan" />
          <span>ONE-CLICK AUTO POST-MORTEM REPORT (W10 / F7)</span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={copyMarkdown}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyber-card border border-cyber-border hover:border-cyber-cyan text-cyber-muted hover:text-white text-xs font-bold transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-cyber-green" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'COPIED MARKDOWN' : 'COPY MARKDOWN'}</span>
          </button>

          <button
            onClick={exportPDF}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-cyber-cyan/20 border border-cyber-cyan text-cyber-cyan hover:bg-cyber-cyan/30 text-xs font-bold transition-all shadow-neon-cyan cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>EXPORT AS PDF (JSPDF)</span>
          </button>
        </div>
      </div>

      {/* Rendered Report Preview Card */}
      <div className="p-5 rounded-xl bg-cyber-card/70 border border-cyber-border/80 space-y-4 text-xs">
        <div className="flex items-center justify-between pb-2 border-b border-cyber-border">
          <div>
            <h3 className="text-base font-bold text-white uppercase">{report.title}</h3>
            <span className="text-[11px] text-cyber-muted">Incident {report.incidentId} • {report.generatedAt}</span>
          </div>
          <span className="px-2.5 py-1 rounded bg-cyber-red/20 border border-cyber-red text-cyber-red font-bold text-xs">
            {report.severity}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-cyber-bg p-2.5 rounded border border-cyber-border">
            <span className="text-[10px] text-cyber-muted uppercase block">Root Cause</span>
            <span className="text-cyber-red font-bold">Core DB Pool</span>
          </div>
          <div className="bg-cyber-bg p-2.5 rounded border border-cyber-border">
            <span className="text-[10px] text-cyber-muted uppercase block">Users Affected</span>
            <span className="text-white font-bold">{report.impact.affectedUsers}</span>
          </div>
          <div className="bg-cyber-bg p-2.5 rounded border border-cyber-border">
            <span className="text-[10px] text-cyber-muted uppercase block">Revenue Exposure</span>
            <span className="text-cyber-amber font-bold">{report.impact.revenueAtRisk}</span>
          </div>
          <div className="bg-cyber-bg p-2.5 rounded border border-cyber-border">
            <span className="text-[10px] text-cyber-muted uppercase block">Time to Remediate</span>
            <span className="text-cyber-green font-bold">2.5 minutes</span>
          </div>
        </div>

        {/* Chronology */}
        <div>
          <span className="text-[11px] text-cyber-cyan uppercase font-bold block mb-2">Chronological Cascade:</span>
          <div className="space-y-1 text-cyber-muted text-[11px]">
            {report.timeline.map((t, i) => (
              <div key={i} className="flex items-start space-x-2">
                <span className="text-cyber-cyan">›</span>
                <span>{t}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Executed Playbook */}
        <div>
          <span className="text-[11px] text-cyber-green uppercase font-bold block mb-2">Validated Remediation Protocol:</span>
          <div className="space-y-1 text-cyber-text text-[11px]">
            {report.remediation.map((r, i) => (
              <div key={i} className="flex items-start space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyber-green flex-shrink-0 mt-0.5" />
                <span>{r}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
