import React from 'react';
import { UserRole } from '../types';
import {
  Factory,
  ShieldCheck,
  Bell,
  Sparkles,
  RefreshCw,
  UserCheck,
  Cpu,
} from 'lucide-react';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  openAlertsCount: number;
  onOpenAlerts: () => void;
  onOpenAiCopilot: () => void;
  onTriggerCron: () => void;
  isCronRunning: boolean;
}

const ROLES: { role: UserRole; label: string; desc: string }[] = [
  { role: 'PLANT_MANAGER', label: 'Plant Manager', desc: 'Direction Générale' },
  { role: 'RH', label: 'RH Onboarding', desc: 'Accueil, kits, contrats' },
  { role: 'FORMATION', label: 'École Formation', desc: 'Sessions, théorie, pratique' },
  { role: 'PSM', label: 'PSM (Prod/School)', desc: 'Coordination transverse' },
  { role: 'SEGMENT_LEADER', label: 'Segment Leader', desc: 'Vue globale du segment' },
  { role: 'SHIFT_LEADER', label: 'Shift Leader', desc: 'Pilotage du shift A/B/C' },
  { role: 'HANCHO', label: 'Hancho', desc: 'Chef de ligne & polyvalence' },
  { role: 'TEAM_SPEAKER', label: 'Team Speaker', desc: 'Animation équipe terrain' },
  { role: 'ADMIN', label: 'Administrateur', desc: 'Gestion système' },
];

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  openAlertsCount,
  onOpenAlerts,
  onOpenAiCopilot,
  onTriggerCron,
  isCronRunning,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-xs">
              <Factory className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 tracking-tight text-base sm:text-lg">
                  Onboard<span className="text-indigo-600">AI</span> Manufacturing
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  <Cpu className="w-3 h-3" /> 90 Jours
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden md:block">
                Site Manufacturing Alpha — Tanger Med Automotive City
              </p>
            </div>
          </div>

          {/* Role Switcher (RBAC) */}
          <div className="flex items-center gap-2">
            <div className="hidden lg:flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
              <span className="text-slate-500 px-2 font-medium flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-600" /> Rôle actif :
              </span>
              <select
                value={currentRole}
                onChange={(e) => onRoleChange(e.target.value as UserRole)}
                className="bg-white text-slate-900 font-semibold py-1 px-2.5 rounded-md border border-slate-300 shadow-2xs focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer text-xs"
              >
                {ROLES.map((r) => (
                  <option key={r.role} value={r.role}>
                    {r.label} ({r.desc})
                  </option>
                ))}
              </select>
            </div>

            {/* Mobile / Compact Role Selector */}
            <div className="lg:hidden">
              <select
                value={currentRole}
                onChange={(e) => onRoleChange(e.target.value as UserRole)}
                className="bg-slate-100 text-slate-900 font-medium py-1.5 px-2 rounded-lg border border-slate-200 text-xs"
              >
                {ROLES.map((r) => (
                  <option key={r.role} value={r.role}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Trigger Daily Cron Button */}
            <button
              id="btn-trigger-cron"
              onClick={onTriggerCron}
              disabled={isCronRunning}
              title="Exécuter le calcul quotidien d'attrition IA (Simulation BullMQ)"
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-medium transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isCronRunning ? 'animate-spin' : ''}`} />
              <span>{isCronRunning ? 'Calcul IA...' : 'Cron IA Quotidien'}</span>
            </button>

            {/* AI Copilot Button */}
            <button
              id="btn-ai-copilot"
              onClick={onOpenAiCopilot}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
              <span className="hidden sm:inline">Copilote IA</span>
            </button>

            {/* Alerts Notification Pill */}
            <button
              id="btn-header-alerts"
              onClick={onOpenAlerts}
              className="relative p-2 rounded-lg text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors"
              title="Voir les alertes actives"
            >
              <Bell className="w-4 h-4" />
              {openAlertsCount > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-rose-600 rounded-full border-2 border-white animate-pulse">
                  {openAlertsCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
