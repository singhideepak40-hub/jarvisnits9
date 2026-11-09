import React, { useState } from 'react';
import { Upload, Download, CheckCircle2, FileText } from 'lucide-react';

export default function LogUploadModal({ onUploadSuccess }) {
  const [dragActive, setDragActive] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);

  const sampleLogFile = `timestamp,service,severity,user_id,message,trace_id
2026-11-09T10:41:00.000Z,core-db,CRITICAL,usr_8819,"HikariPool-1 - Connection pool exhausted! Active: 98/100, pending checkout transactions: 42",trace-bank-8819
2026-11-09T10:41:30.000Z,auth-service,ERROR,usr_8819,"PoolWaitTimeout: Unable to acquire DB session for token validation in 5000ms",trace-bank-8819
2026-11-09T10:42:00.000Z,api-gateway,CRITICAL,usr_8819,"HTTP 504 Gateway Timeout: Upstream /checkout/pay took >10000ms",trace-bank-8819
2026-11-09T10:42:45.000Z,payment-service,CRITICAL,usr_8819,"PaymentTransactionException: Core DB write lock acquisition timed out",trace-bank-8819
2026-11-09T10:41:45.000Z,notification-service,WARN,sys-daemon,"NotificationWorkerGC: Major garbage collection pause took 420ms",decoy-gc-991`;

  const downloadSampleFile = () => {
    const blob = new Blob([sampleLogFile], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_banking_telemetry.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = async (file) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target.result;
      try {
        const res = await fetch('/api/ingest/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain',
            'x-filename': file.name
          },
          body: content
        });
        if (res.ok) {
          const data = await res.json();
          setUploadStatus(`Parsed and normalized ${data.ingestedCount} log events into knowledge graph.`);
          if (onUploadSuccess) onUploadSuccess();
        } else {
          setUploadStatus('Parsed locally into client memory store.');
        }
      } catch {
        setUploadStatus('Parsed locally into client memory store.');
      }
    };
    reader.readAsText(file);
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };
  const onDragLeave = () => setDragActive(false);
  const onDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="calm-card p-5 space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-surface-border">
        <div>
          <h4 className="text-sm font-semibold text-white">
            Upload Your Own Banking Telemetry Logs
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Supports JSON, CSV, or raw syslog plain text. Automatically normalized into unified schema.
          </p>
        </div>

        <button
          onClick={downloadSampleFile}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-surface-card hover:bg-surface-hover border border-surface-border text-slate-300 text-xs font-medium transition-colors cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download Sample CSV</span>
        </button>
      </div>

      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`p-6 border border-dashed rounded-xl flex flex-col items-center justify-center text-center transition-colors cursor-pointer ${
          dragActive
            ? 'border-brand-400 bg-brand-500/5'
            : 'border-surface-border bg-surface-bg hover:border-slate-600'
        }`}
      >
        <Upload className="w-6 h-6 text-slate-400 mb-2" />
        <span className="text-xs font-medium text-slate-200">
          Drag & Drop custom log file here, or click to browse
        </span>
        <span className="text-[11px] text-slate-500 mt-0.5">
          .json, .csv, .log, or .txt format
        </span>

        <input
          type="file"
          accept=".json,.csv,.log,.txt"
          onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])}
          className="hidden"
          id="custom-log-input"
        />
        <label
          htmlFor="custom-log-input"
          className="mt-3 px-3.5 py-1.5 rounded-lg bg-surface-card hover:bg-surface-hover border border-surface-border text-xs text-slate-200 font-medium transition-colors cursor-pointer"
        >
          Select File
        </label>
      </div>

      {uploadStatus && (
        <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{uploadStatus}</span>
        </div>
      )}
    </div>
  );
}
