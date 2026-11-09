import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import { FileSpreadsheet, Download, Copy, Check, CheckCircle2 } from 'lucide-react';

export default function IncidentReportModal({ incidentData }) {
  const [copied, setCopied] = useState(false);

  const report = {
    incidentId: 'INC-2026-001',
    generatedAt: new Date().toLocaleString(),
    title: 'Core PostgreSQL Database Connection Saturation & Payment Outage',
    severity: 'Critical (Severity 1)',
    outageDuration: '18.5 minutes',
    rootCause: 'Core PostgreSQL DB (HikariCP connection pool saturation at 98/100 slots)',
    confidence: '91% (Multi-Signal Dependency Analysis)',
    impact: {
      affectedUsers: '4,200 active customer sessions',
      failedTransactions: '142 checkout orders',
      revenueAtRisk: '$18,500 USD',
      servicesAffected: 'Core DB, Auth Service, API Gateway, Payment Service, Notification Service'
    },
    timeline: [
      '10:41:00 AM - Core DB connection pool reached 98% saturation; query wait times surged to 4,820ms.',
      '10:41:30 AM - Auth Service worker threads stalled waiting for user session lookups.',
      '10:42:00 AM - API Gateway returned HTTP 504 Gateway Timeout on checkout ingress.',
      '10:42:45 AM - Payment Service checkout transactions failed with DB deadlocks.',
      '10:43:15 AM - Notification Service dead-letter queue received 1,200 pending retry alerts.'
    ],
    remediation: [
      'Step 1: Scaled PgBouncer connection pool to 500 connections.',
      'Step 2: Terminated 42 idle-in-transaction client database sessions.',
      'Step 3: Rolling restart of Auth Service pods.',
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
    const doc = new jsPDF();

    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 32, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('POST-MORTEM INCIDENT REPORT', 14, 18);

    doc.setTextColor(203, 213, 225);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Incident ID: ${report.incidentId} | Generated: ${report.generatedAt} | Severity: ${report.severity}`, 14, 26);

    let y = 44;

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('1. Incident Summary', 14, y);
    y += 6;

    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'normal');
    doc.text(`Title: ${report.title}`, 14, y); y += 5;
    doc.text(`Outage Duration: ${report.outageDuration} | Root Cause Confidence: ${report.confidence}`, 14, y); y += 5;
    doc.text(`Identified Root Cause: ${report.rootCause}`, 14, y); y += 8;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('2. Customer & Financial Impact', 14, y);
    y += 6;

    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'normal');
    doc.text(`- Impacted Customers: ${report.impact.affectedUsers}`, 16, y); y += 5;
    doc.text(`- Failed Orders: ${report.impact.failedTransactions}`, 16, y); y += 5;
    doc.text(`- Revenue Exposure: ${report.impact.revenueAtRisk}`, 16, y); y += 5;
    doc.text(`- Impacted Services: ${report.impact.servicesAffected}`, 16, y); y += 8;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('3. Incident Timeline & Cascade', 14, y);
    y += 6;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    report.timeline.forEach(t => {
      doc.text(t, 16, y);
      y += 5;
    });

    y += 4;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('4. Executed Remediation Actions', 14, y);
    y += 6;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    report.remediation.forEach(r => {
      doc.text(r, 16, y);
      y += 5;
    });

    y += 4;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('5. Preventive Recommendations', 14, y);
    y += 6;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    report.lessonsLearned.forEach(l => {
      doc.text(`- ${l}`, 16, y);
      y += 5;
    });

    doc.save(`Incident_Report_${report.incidentId}.pdf`);
  };

  const copyMarkdown = () => {
    const md = `# Incident Post-Mortem Report: ${report.incidentId}
**Date:** ${report.generatedAt}
**Severity:** ${report.severity}
**Root Cause:** ${report.rootCause} (${report.confidence})

## Summary
${report.title}
- Outage Duration: ${report.outageDuration}
- Customer Sessions Affected: ${report.impact.affectedUsers}
- Revenue Exposure: ${report.impact.revenueAtRisk}

## Timeline
${report.timeline.map(t => `- ${t}`).join('\n')}

## Remediation
${report.remediation.map(r => `- ${r}`).join('\n')}

## Lessons Learned
${report.lessonsLearned.map(l => `- ${l}`).join('\n')}`;

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="calm-card p-5 space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-surface-border gap-2">
        <div>
          <h3 className="text-sm font-semibold text-white">
            Post-Mortem Incident Report
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Auto-generated summary ready for engineering hand-off and management debrief.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={copyMarkdown}
            className="px-3 py-1.5 rounded-lg bg-surface-card hover:bg-surface-hover border border-surface-border text-slate-300 text-xs font-medium transition-colors cursor-pointer"
          >
            {copied ? 'Copied Markdown' : 'Copy Markdown'}
          </button>

          <button
            onClick={exportPDF}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-brand-500/15 border border-brand-500/30 text-brand-400 hover:bg-brand-500/25 text-xs font-medium transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export as PDF</span>
          </button>
        </div>
      </div>

      {/* Rendered Preview Card */}
      <div className="p-4 rounded-xl bg-surface-bg border border-surface-border space-y-4 text-xs">
        <div className="flex items-center justify-between pb-2 border-b border-surface-border">
          <div>
            <h4 className="text-sm font-semibold text-white">{report.title}</h4>
            <span className="text-[11px] text-slate-400">Incident {report.incidentId} • {report.generatedAt}</span>
          </div>
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-rose-500/15 text-rose-400 border border-rose-500/30">
            {report.severity}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-2.5 rounded-lg bg-surface-card border border-surface-border">
            <span className="text-[10px] text-slate-400 uppercase block">Root Cause</span>
            <span className="text-xs font-semibold text-white">Core DB Pool</span>
          </div>
          <div className="p-2.5 rounded-lg bg-surface-card border border-surface-border">
            <span className="text-[10px] text-slate-400 uppercase block">Customers Affected</span>
            <span className="text-xs font-semibold text-white">{report.impact.affectedUsers}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-surface-card border border-surface-border">
            <span className="text-[10px] text-slate-400 uppercase block">Revenue Exposure</span>
            <span className="text-xs font-semibold text-white">{report.impact.revenueAtRisk}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-surface-card border border-surface-border">
            <span className="text-[10px] text-slate-400 uppercase block">Fix Time</span>
            <span className="text-xs font-semibold text-emerald-400">2.5 minutes</span>
          </div>
        </div>

        <div>
          <span className="text-xs font-semibold text-slate-200 block mb-1.5">Cascade Chronology:</span>
          <div className="space-y-1 text-slate-300 text-xs">
            {report.timeline.map((t, i) => (
              <div key={i} className="flex items-start space-x-2">
                <span className="text-slate-500">•</span>
                <span>{t}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <span className="text-xs font-semibold text-slate-200 block mb-1.5">Remediation Steps:</span>
          <div className="space-y-1 text-slate-300 text-xs">
            {report.remediation.map((r, i) => (
              <div key={i} className="flex items-start space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>{r}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
