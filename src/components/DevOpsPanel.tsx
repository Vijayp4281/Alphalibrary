import React, { useState } from 'react';
import { useLibrary } from '../context/LibraryContext';
import {
  Terminal,
  Container,
  GitBranch,
  Code2,
  Activity,
  CheckCircle2,
  Copy,
  Play,
  Cpu,
  Layers,
  ShieldCheck,
  Zap,
  Server,
  Loader2,
  Check
} from 'lucide-react';
import { motion } from 'motion/react';

export const DevOpsPanel: React.FC = () => {
  const { systemLogs, addToast, addSystemLog } = useLibrary();
  const [activeTab, setActiveTab] = useState<'docker' | 'cicd' | 'cleancode' | 'logs'>('docker');
  const [copiedSnippet, setCopiedSnippet] = useState<'dockerfile' | 'compose' | null>(null);
  const [simulatingPipeline, setSimulatingPipeline] = useState(false);
  const [pipelineSteps, setPipelineSteps] = useState([
    { name: 'Git Checkout & Lint', status: 'success', time: '1.2s' },
    { name: 'TypeScript Compiling (tsc)', status: 'success', time: '2.4s' },
    { name: 'Unit & Integration Tests', status: 'success', time: '3.1s' },
    { name: 'Docker Multi-Stage Image Build', status: 'success', time: '5.8s' },
    { name: 'Container Security Audit (Trivy)', status: 'success', time: '1.9s' },
    { name: 'Deploy to Cloud Run Environment', status: 'success', time: '4.2s' }
  ]);

  const dockerfileSnippet = `
# Multi-stage Dockerfile for Library Management System
# Build Stage
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --quiet
COPY . .
RUN npm run build

# Production Stage
FROM node:22-alpine AS runner
ENV NODE_ENV=production
ENV PORT=3000
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
RUN npm ci --only=production
EXPOSE 3000
USER node
CMD ["node", "dist/server.cjs"]
  `.trim();

  const dockerComposeSnippet = `
version: '3.8'
services:
  lms-app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=mysql://root:secret@mysql-db:3306/library_db
    depends_on:
      - mysql-db
    restart: always

  mysql-db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: secret
      MYSQL_DATABASE: library_db
    ports:
      - "3306:3306"
    volumes:
      - mysql-data:/var/lib/mysql

volumes:
  mysql-data:
  `.trim();

  const copySnippet = (type: 'dockerfile' | 'compose', text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(type);
    addToast('Copied to Clipboard', `${type === 'dockerfile' ? 'Dockerfile' : 'docker-compose.yml'} snippet copied.`, 'success');
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  const runPipelineSimulation = () => {
    if (simulatingPipeline) return;
    setSimulatingPipeline(true);
    addToast('CI/CD Pipeline Triggered', 'Executing automated GitHub Actions workflow...', 'info');
    addSystemLog('INFO', 'GitHub Actions workflow #1042 triggered on branch main', 'DevOps-Pipeline');

    // Reset steps to pending
    const initialSteps = pipelineSteps.map(step => ({ ...step, status: 'pending' as const }));
    setPipelineSteps(initialSteps);

    let currentStepIndex = 0;

    const processNextStep = () => {
      if (currentStepIndex < initialSteps.length) {
        setPipelineSteps(prev =>
          prev.map((s, idx) => {
            if (idx === currentStepIndex) return { ...s, status: 'running' };
            if (idx < currentStepIndex) return { ...s, status: 'success' };
            return { ...s, status: 'pending' };
          })
        );

        addSystemLog('INFO', `Executing stage: ${initialSteps[currentStepIndex].name}`, 'DevOps-Pipeline');

        setTimeout(() => {
          setPipelineSteps(prev =>
            prev.map((s, idx) => (idx === currentStepIndex ? { ...s, status: 'success' } : s))
          );
          addSystemLog('SUCCESS', `Passed stage: ${initialSteps[currentStepIndex].name} (${initialSteps[currentStepIndex].time})`, 'DevOps-Pipeline');
          currentStepIndex++;
          processNextStep();
        }, 700);
      } else {
        setSimulatingPipeline(false);
        addToast('Pipeline Succeeded!', 'All test suites passed. Container artifact deployed.', 'success');
        addSystemLog('SUCCESS', 'Zero-downtime container deployment completed on Cloud Run', 'DevOps-Pipeline');
      }
    };

    processNextStep();
  };

  return (
    <div className="space-y-6 my-6">
      {/* Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 backdrop-blur-2xl text-slate-900 dark:text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden transition-colors">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
              <Terminal className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> DevOps & Clean Code Engineering Suite
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              System Infrastructure & Clean Code Architecture
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
              Explore containerization configurations, automated GitHub Actions CI/CD workflows, modular MVC folder structures, and real-time backend operational logs.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-xs font-mono text-emerald-700 dark:text-emerald-300">
              <Server className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Container Status: Healthy
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
          <button
            id="devops-tab-docker"
            onClick={() => setActiveTab('docker')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'docker'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25 border border-emerald-500/30'
                : 'bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <Container className="w-4 h-4" /> Docker & Containerization
          </button>

          <button
            id="devops-tab-cicd"
            onClick={() => setActiveTab('cicd')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'cicd'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25 border border-emerald-500/30'
                : 'bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <GitBranch className="w-4 h-4" /> CI/CD Automation
          </button>

          <button
            id="devops-tab-cleancode"
            onClick={() => setActiveTab('cleancode')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'cleancode'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25 border border-emerald-500/30'
                : 'bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <Code2 className="w-4 h-4" /> Clean Code & MVC
          </button>

          <button
            id="devops-tab-logs"
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'logs'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25 border border-emerald-500/30'
                : 'bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <Activity className="w-4 h-4" /> Live Operational Logs ({systemLogs.length})
          </button>
        </div>
      </div>

      {/* TAB 1: Docker */}
      {activeTab === 'docker' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 backdrop-blur-2xl rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                <Container className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Dockerfile (Multi-Stage Build)
              </div>
              <button
                onClick={() => copySnippet('dockerfile', dockerfileSnippet)}
                className="p-1.5 text-xs text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
              >
                {copiedSnippet === 'dockerfile' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedSnippet === 'dockerfile' ? 'Copied' : 'Copy'}
              </button>
            </div>
            <pre className="text-[11px] font-mono text-emerald-600 dark:text-emerald-300 bg-slate-50 dark:bg-slate-950/80 p-4 rounded-2xl overflow-x-auto border border-slate-200 dark:border-slate-800 leading-relaxed">
              {dockerfileSnippet}
            </pre>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 backdrop-blur-2xl rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                <Layers className="w-4 h-4 text-sky-600 dark:text-sky-400" /> docker-compose.yml (Microservices Orchestration)
              </div>
              <button
                onClick={() => copySnippet('compose', dockerComposeSnippet)}
                className="p-1.5 text-xs text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
              >
                {copiedSnippet === 'compose' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedSnippet === 'compose' ? 'Copied' : 'Copy'}
              </button>
            </div>
            <pre className="text-[11px] font-mono text-sky-600 dark:text-sky-300 bg-slate-50 dark:bg-slate-950/80 p-4 rounded-2xl overflow-x-auto border border-slate-200 dark:border-slate-800 leading-relaxed">
              {dockerComposeSnippet}
            </pre>
          </div>
        </div>
      )}

      {/* TAB 2: CI/CD Pipeline Simulator */}
      {activeTab === 'cicd' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <GitBranch className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> GitHub Actions Automated Pipeline
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                Trigger continuous integration, code auditing, and zero-downtime deployment workflows.
              </p>
            </div>

            <button
              id="btn-trigger-pipeline"
              onClick={runPipelineSimulation}
              disabled={simulatingPipeline}
              className={`py-2.5 px-5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 shadow-md cursor-pointer ${
                simulatingPipeline
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700 cursor-wait'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/25 border border-emerald-500/30'
              }`}
            >
              {simulatingPipeline ? <Loader2 className="w-4 h-4 animate-spin text-emerald-400" /> : <Play className="w-4 h-4 fill-current" />}
              {simulatingPipeline ? 'Executing Pipeline...' : 'Trigger CI/CD Pipeline Run'}
            </button>
          </div>

          {/* Steps Timeline */}
          <div className="space-y-3">
            {pipelineSteps.map((step, idx) => (
              <motion.div
                key={`pipeline-step-${step.name}-${idx}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full border flex items-center justify-center font-bold text-[10px] ${
                      step.status === 'running'
                        ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/40 animate-pulse'
                        : step.status === 'success'
                        ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border-emerald-500/30'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-500 border-slate-300 dark:border-slate-600'
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <span className="font-semibold text-slate-900 dark:text-white">{step.name}</span>
                </div>

                <div className="flex items-center gap-4">
                  <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400">{step.time}</span>
                  {step.status === 'running' && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 animate-pulse">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Running...
                    </span>
                  )}
                  {step.status === 'success' && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-300">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Passed
                    </span>
                  )}
                  {step.status === 'pending' && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 dark:text-slate-500">
                      Pending
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Clean Code & Architecture */}
      {activeTab === 'cleancode' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Code2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> Clean Coding Principles & MVC Structure
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
              Guiding software design rules implemented throughout this codebase for high maintainability.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-center font-bold text-xs">
                1
              </div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">Single Responsibility (SRP)</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Separated concerns into modular contexts, sub-components, type definitions, and data transformers.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-center font-bold text-xs">
                2
              </div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">DRY (Don't Repeat Yourself)</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Centralized borrowing and availability updates inside `LibraryContext` to prevent state duplication.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-center font-bold text-xs">
                3
              </div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">KISS (Keep It Simple, Stupid)</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Clean type declarations with TypeScript interfaces ensuring strict type safety without over-abstraction.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Live System Logs Console */}
      {activeTab === 'logs' && (
        <div className="bg-slate-900 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 font-mono text-xs space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-700 dark:border-slate-800 pb-3 text-slate-400">
            <div className="flex items-center gap-2 font-bold text-white">
              <Activity className="w-4 h-4 text-emerald-400" /> Operational System Terminal Logs
            </div>
            <span>Listening on port 3000</span>
          </div>

          <div className="space-y-2 max-h-80 overflow-y-auto pr-2 text-[11px] leading-relaxed">
            {systemLogs.map((log, idx) => (
              <div key={`devops-log-item-${log.id || 'log'}-${idx}`} className="flex items-start gap-3 border-b border-slate-800/60 pb-1.5 last:border-0">
                <span className="text-slate-500 shrink-0">{log.timestamp}</span>
                <span
                  className={`px-1.5 py-0.2 rounded font-bold shrink-0 ${
                    log.level === 'SUCCESS'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : log.level === 'WARN'
                      ? 'bg-amber-950 text-amber-300 border border-amber-800'
                      : log.level === 'ERROR'
                      ? 'bg-rose-950 text-rose-300 border border-rose-800'
                      : 'bg-teal-950 text-teal-300 border border-teal-800'
                  }`}
                >
                  [{log.level}]
                </span>
                <span className="text-slate-400 shrink-0">[{log.source}]</span>
                <span className="text-slate-200 break-all">{log.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
