import React, { useState } from 'react';
import { Alert, UserRole } from '../types';
import {
  AlertTriangle,
  AlertOctagon,
  Info,
  CheckCircle2,
  Filter,
  ShieldAlert,
  Clock,
  UserCheck,
} from 'lucide-react';

interface AlertsViewProps {
  alerts: Alert[];
  currentRole: UserRole;
  onResolveAlert: (alertId: number, resolvedBy: string) => void;
}

export const AlertsView: React.FC<AlertsViewProps> = ({
  alerts,
  currentRole,
  onResolveAlert,
}) => {
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'resolved'>('open');

  const filteredAlerts = alerts.filter((a) => {
    const matchesRole = roleFilter === 'all' || a.recipientRole === roleFilter;
    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'open'
        ? !a.resolved
        : a.resolved;
    return matchesRole && matchesStatus;
  });

  const openCount = alerts.filter((a) => !a.resolved).length;
  const criticalCount = alerts.filter((a) => !a.resolved && a.severity === 'CRITICAL').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            Module 13 — Centre d Alertes IA & Escalade Managériale
          </h1>
          <p className="text-xs text-slate-500">
            Détection automatique en cascade (insatisfaction, absences 5j, retards cadence, transport) et routage vers les rôles dédiés.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-1.5">
            <AlertOctagon className="w-4 h-4 text-rose-600" />
            <span>{criticalCount} Alertes Critiques</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold">
            {openCount} non résolues
          </div>
        </div>
      </div>

      {/* Cascading thresholds explainer banner */}
      <div className="p-4 rounded-xl bg-slate-900 text-white text-xs space-y-2 shadow-xs">
        <span className="font-bold text-indigo-400 block uppercase tracking-wider text-[11px]">
          Matrice d Escalade d Insatisfaction en Cascade :
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700">
            <div className="font-bold text-amber-400">&lt; 80% • Surveillance</div>
            <div className="text-[11px] text-slate-300 mt-0.5">Enregistrement et journalisation au dossier</div>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700">
            <div className="font-bold text-orange-400">&lt; 60% • Alerte Manager</div>
            <div className="text-[11px] text-slate-300 mt-0.5">Notification immédiate au Shift / Segment Leader</div>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700">
            <div className="font-bold text-rose-400">&lt; 40% • Entretien RH Obligatoire</div>
            <div className="text-[11px] text-slate-300 mt-0.5">Flag bloquant sous 24h avec plan d action formel</div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="font-bold text-slate-700">Filtrer par rôle destinataire :</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium"
          >
            <option value="all">Tous les rôles</option>
            <option value="RH">Ressources Humaines (RH)</option>
            <option value="FORMATION">École Formation</option>
            <option value="SEGMENT_LEADER">Segment Leader</option>
            <option value="SHIFT_LEADER">Shift Leader</option>
            <option value="PLANT_MANAGER">Plant Manager</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setStatusFilter('open')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              statusFilter === 'open' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            En cours ({alerts.filter((a) => !a.resolved).length})
          </button>
          <button
            onClick={() => setStatusFilter('resolved')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              statusFilter === 'resolved' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            Traitées ({alerts.filter((a) => a.resolved).length})
          </button>
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              statusFilter === 'all' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            Toutes ({alerts.length})
          </button>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="bg-white rounded-xl p-8 border border-slate-200 text-center text-slate-400 text-xs shadow-2xs">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            Aucune alerte correspondant à vos critères.
          </div>
        ) : (
          filteredAlerts.map((a) => {
            const isCritical = a.severity === 'CRITICAL';
            const isWarning = a.severity === 'WARNING';

            return (
              <div
                key={a.id}
                className={`bg-white rounded-xl p-5 border shadow-2xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  a.resolved
                    ? 'border-slate-200 opacity-75'
                    : isCritical
                    ? 'border-rose-300 bg-rose-50/20'
                    : isWarning
                    ? 'border-amber-300 bg-amber-50/20'
                    : 'border-slate-200'
                }`}
              >
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isCritical
                          ? 'bg-rose-100 text-rose-800'
                          : isWarning
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {a.severity}
                    </span>
                    <span className="font-extrabold text-slate-900 text-sm">
                      {a.candidateName}
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-500 font-mono text-[11px]">{a.createdAt}</span>
                  </div>

                  <p className="font-semibold text-slate-800 text-xs max-w-2xl leading-snug">
                    {a.condition}
                  </p>

                  <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1">
                    <span>
                      Rôle assigné :{' '}
                      <strong className="text-indigo-600 font-semibold">{a.recipientRole}</strong>
                    </span>
                    {a.resolved && (
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Clôturé par {a.resolvedBy} le{' '}
                        {a.resolvedAt}
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  {!a.resolved ? (
                    <button
                      onClick={() => onResolveAlert(a.id, `Responsable ${currentRole}`)}
                      className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
                    >
                      Marquer Traitée
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-lg">
                      Archivée
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
