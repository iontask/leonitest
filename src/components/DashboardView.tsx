import React, { useState } from 'react';
import { Candidate, DashboardStats, Alert, UserRole } from '../types';
import {
  TrendingUp,
  UserCheck,
  PackageCheck,
  AlertOctagon,
  Download,
  Filter,
  CheckCircle2,
  Clock,
  GraduationCap,
  Activity,
  ArrowUpRight,
  BrainCircuit,
  FileSpreadsheet,
} from 'lucide-react';

interface DashboardViewProps {
  candidates: Candidate[];
  stats: DashboardStats;
  alerts: Alert[];
  currentRole: UserRole;
  onNavigateToCandidate: (candidateId: number) => void;
  onNavigateToTab: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  candidates,
  stats,
  alerts,
  currentRole,
  onNavigateToCandidate,
  onNavigateToTab,
}) => {
  const [filterSegment, setFilterSegment] = useState<string>('all');
  const [filterShift, setFilterShift] = useState<string>('all');

  const filteredCandidates = candidates.filter((c) => {
    if (filterSegment !== 'all' && c.productionAssignment?.segment !== filterSegment) {
      return false;
    }
    if (filterShift !== 'all' && c.productionAssignment?.shift !== filterShift) {
      return false;
    }
    return true;
  });

  const criticalCandidates = candidates.filter(
    (c) => c.attritionScores?.[0]?.level === 'Critique'
  );

  const exportPowerBIDataset = async () => {
    try {
      const res = await fetch('/api/export/powerbi');
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `powerbi_dataset_onboarding_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Error downloading dataset:', e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Executive KPI Highlights */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Direction Générale & Management Usine
              </span>
              <span className="text-xs text-slate-400">Période d intégration 90 Jours</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              Tableau de Bord Exécutif — Performance Onboarding
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Suivi automatisé du cycle 90 jours : détection prédictive de désistement, montée en compétences (Learning Curve) et standardisation des sites.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              id="btn-export-powerbi"
              onClick={exportPowerBIDataset}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-slate-900 font-semibold text-xs hover:bg-slate-100 transition-all shadow-xs cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Export Power BI (JSON)</span>
            </button>
            <button
              id="btn-dash-reports"
              onClick={() => onNavigateToTab('reports')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600/80 hover:bg-indigo-600 text-white font-semibold text-xs border border-indigo-400/30 transition-all shadow-xs cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Rapports Automatisés</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Rétention 90 Jours */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Taux Rétention 90j
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{stats.retentionRate90Days}%</span>
            <span className="text-xs font-semibold text-emerald-600 flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" /> +3.5% vs cible (88%)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Objectif zéro turnover précoce</p>
        </div>

        {/* Désistement 5 premières semaines */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Désistement (5 sem)
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{stats.earlyTurnover5Weeks}%</span>
            <span className="text-xs font-medium text-slate-500">Seuil alerte : 8%</span>
          </div>
          <p className="text-xs text-emerald-600 font-medium mt-1">Contrôle satisfaisant du churn</p>
        </div>

        {/* Readiness Score J1 */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Readiness Score J1
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <PackageCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{stats.readinessScoreJ1}%</span>
            <span className="text-xs font-medium text-slate-500">Dotations J1</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Contrat, badge, EPI, casier & navette</p>
        </div>

        {/* Alertes d'Attrition Critiques */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Risque Attrition Critique
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <BrainCircuit className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-rose-600">{stats.criticalAttritionCount}</span>
            <span className="text-xs font-semibold text-rose-600">à traiter d urgence</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {stats.mediumAttritionCount} en vigilance modérée
          </p>
        </div>
      </div>

      {/* Main Two-Column Layout: Pipeline & Attrition Watch */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Pipeline Funnel & Cohort Overview */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Filters */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-bold text-slate-700">Filtres Direction :</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={filterSegment}
                onChange={(e) => setFilterSegment(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              >
                <option value="all">Tous les segments</option>
                <option value="Segment Câblage Moteur">Segment Câblage Moteur</option>
                <option value="Segment Cockpit & Planche de Bord">Segment Cockpit</option>
                <option value="Segment Finition & Contrôle">Segment Finition & Contrôle</option>
              </select>

              <select
                value={filterShift}
                onChange={(e) => setFilterShift(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              >
                <option value="all">Tous les shifts</option>
                <option value="Shift A (Matin)">Shift A (Matin)</option>
                <option value="Shift B (Après-midi)">Shift B (Après-midi)</option>
                <option value="Shift C (Nuit)">Shift C (Nuit)</option>
              </select>
            </div>
          </div>

          {/* Active Candidates Pipeline Summary Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Cohortes en cours d intégration ({filteredCandidates.length} opérateurs)
                </h2>
                <p className="text-xs text-slate-500">
                  Vue consolidée : école, terrain, cadence Learning Curve et statut d attrition
                </p>
              </div>
              <button
                onClick={() => onNavigateToTab('candidates')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                Voir tous les candidats →
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Candidat / CIN</th>
                    <th className="py-3 px-4">Jalon (90j)</th>
                    <th className="py-3 px-4">Affectation</th>
                    <th className="py-3 px-4">Carré Magique</th>
                    <th className="py-3 px-4">Risque IA</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCandidates.map((c) => {
                    const score = c.attritionScores?.[0];
                    const magic = c.magicSquare;
                    return (
                      <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">
                            {c.firstName} {c.lastName}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">{c.cin}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                            <Clock className="w-3 h-3 text-slate-500" />
                            Jour {c.dayInJourney}/90
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-800">
                            {c.productionAssignment?.line || 'École Interne (5j)'}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {c.productionAssignment?.shift || 'Session école'}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {magic ? (
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                magic.status === 'GREEN'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : magic.status === 'RED'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {magic.status === 'GREEN'
                                ? 'Vert (Conforme)'
                                : magic.status === 'RED'
                                ? 'Rouge (Alerte)'
                                : 'Jaune (Surveillance)'}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">En cours J1-J5</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {score ? (
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                                  score.level === 'Critique'
                                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                    : score.level === 'Moyen'
                                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                }`}
                              >
                                {score.score}% ({score.level})
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => onNavigateToCandidate(c.id)}
                            className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 font-medium text-xs transition-colors cursor-pointer"
                          >
                            Détails
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (1 span): Priority Attrition Watchlist & Open Alerts */}
        <div className="space-y-6">
          {/* Critical Attrition Watchlist */}
          <div className="bg-white rounded-xl border border-rose-200 shadow-2xs overflow-hidden">
            <div className="p-4 bg-rose-50/50 border-b border-rose-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 text-rose-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-rose-900">
                  Vigilance IA : Risques Critiques
                </h3>
              </div>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-rose-600 text-white">
                {criticalCandidates.length}
              </span>
            </div>

            <div className="p-4 space-y-3">
              {criticalCandidates.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  Aucune recrue en risque critique d attrition.
                </div>
              ) : (
                criticalCandidates.map((c) => {
                  const score = c.attritionScores?.[0];
                  return (
                    <div
                      key={c.id}
                      className="p-3 rounded-lg border border-rose-100 bg-rose-50/30 hover:bg-rose-50/60 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-xs">
                          {c.firstName} {c.lastName}
                        </span>
                        <span className="text-xs font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                          Risque {score?.score}%
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        Affectation : {c.productionAssignment?.line || 'École'}
                      </div>
                      <p className="text-[11px] text-rose-900 font-medium mt-2 leading-snug">
                        ⚠️ {score?.factors?.explanation?.[0] || 'Facteurs multiples de désistement'}
                      </p>
                      <div className="mt-3 flex items-center justify-between pt-2 border-t border-rose-100">
                        <span className="text-[10px] text-slate-400">Jalon Jour {c.dayInJourney}/90</span>
                        <button
                          onClick={() => onNavigateToCandidate(c.id)}
                          className="text-[11px] font-semibold text-rose-700 hover:text-rose-900"
                        >
                          Plan d action IA →
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Real-time Alerts Routing Feed */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Alertes récentes ({alerts.filter((a) => !a.resolved).length} actives)
              </h3>
              <button
                onClick={() => onNavigateToTab('alerts')}
                className="text-xs font-medium text-indigo-600 hover:underline"
              >
                Gérer →
              </button>
            </div>

            <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
              {alerts.slice(0, 4).map((a) => (
                <div key={a.id} className="p-3 text-xs space-y-1 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">{a.candidateName}</span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        a.severity === 'CRITICAL'
                          ? 'bg-rose-100 text-rose-700'
                          : a.severity === 'WARNING'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {a.severity}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px]">{a.condition}</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                    <span>Destinataire : <strong className="text-slate-600">{a.recipientRole}</strong></span>
                    <span>{a.createdAt}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
