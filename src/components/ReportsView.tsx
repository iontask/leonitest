import React from 'react';
import { Candidate, Alert } from '../types';
import {
  FileBarChart,
  Download,
  Printer,
  CheckCircle2,
  Calendar,
  Building2,
  Users,
  Award,
  TrendingUp,
  BrainCircuit,
  FileText,
} from 'lucide-react';

interface ReportsViewProps {
  candidates: Candidate[];
  alerts: Alert[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({ candidates, alerts }) => {
  const total = candidates.length;
  const inProd = candidates.filter((c) => c.status === 'IN_PRODUCTION').length;
  const inTraining = candidates.filter((c) => c.status === 'IN_TRAINING').length;
  const validated = candidates.filter((c) => c.status === 'VALIDATED').length;
  const abandoned = candidates.filter((c) => c.status === 'ABANDONED').length;

  const retentionRate = total > 0 ? Math.round(((total - abandoned) / total) * 100) : 100;
  const avgAttritionScore = Math.round(
    candidates.reduce((acc, c) => acc + (c.attritionScores?.[0]?.score || 0), 0) /
      Math.max(total, 1)
  );

  const handleExportCsv = () => {
    const headers = [
      'ID',
      'Nom',
      'Prénom',
      'CIN',
      'Statut',
      'Jalon_Jour',
      'Ligne',
      'Score_Attrition',
      'Niveau_Risque',
      'WelcomeKit_Complet',
      'Navette_Confirmee',
    ];

    const rows = candidates.map((c) => [
      c.id,
      `"${c.lastName}"`,
      `"${c.firstName}"`,
      c.cin,
      c.status,
      c.dayInJourney,
      `"${c.productionAssignment?.line || 'École'}"`,
      c.attritionScores?.[0]?.score || 0,
      c.attritionScores?.[0]?.level || 'Faible',
      c.welcomeKit ? 'OUI' : 'NON',
      c.transport?.confirmed ? 'OUI' : 'NON',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Rapport_Onboarding_Manufacturing_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileBarChart className="w-5 h-5 text-indigo-600" />
            Module 14 — Rapports & Bilan Exécutif Direction (Audit 90 Jours)
          </h1>
          <p className="text-xs text-slate-500">
            Synthèse consolidée usine, exports analytiques CSV/PDF et traçabilité pour le Plant Manager & RH.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-indigo-600" />
            <span>Exporter CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-300" />
            <span>Imprimer Bilan Audit</span>
          </button>
        </div>
      </div>

      {/* Executive Summary Card */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Site Industriel Métiers Alpha — Lignes Câblage Automobile
              </h2>
              <p className="text-xs text-slate-500">
                Audit de la Cohorte S4-2026 • Généré le {new Date().toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400 block uppercase font-bold tracking-wider">
              Taux de Rétention 90J
            </span>
            <span className="text-3xl font-black text-emerald-600">{retentionRate}%</span>
          </div>
        </div>

        {/* 4 Pillars of Manufacturing Onboarding */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Effectif Recrues</span>
            <div className="text-2xl font-black text-slate-900">{total} opérateurs</div>
            <span className="text-[11px] text-slate-500">
              {inProd} sur ligne • {inTraining} à l école
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Score Attrition Moyen</span>
            <div className="text-2xl font-black text-amber-600">{avgAttritionScore}%</div>
            <span className="text-[11px] text-slate-500">Zone de vigilance modérée</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Alertes Traitées</span>
            <div className="text-2xl font-black text-indigo-600">
              {alerts.filter((a) => a.resolved).length}/{alerts.length}
            </div>
            <span className="text-[11px] text-slate-500">Temps de résolution moy: 4h</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Readiness J1 Welcome</span>
            <div className="text-2xl font-black text-emerald-600">96.4%</div>
            <span className="text-[11px] text-slate-500">EPI, Blouses et Badges remis</span>
          </div>
        </div>

        {/* Audit Observations */}
        <div className="space-y-2 text-xs">
          <span className="font-bold text-slate-800 block text-sm">
            Observations Clés & Recommandations Usine :
          </span>
          <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-200 space-y-2 text-indigo-950">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Points d Excellence :</strong> Le taux d assiduité à l école (5 jours) dépasse 97.5%.
                L émargement numérique du Welcome Kit et la validation logistique J-1 ont supprimé 90% des abandons du premier jour.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <span>
                <strong>Axe d Amélioration :</strong> Sur la Ligne CK-01 (Cockpit / Poste critique goulot), le Takt time
                génère une fatigue accrue entre J10 et J18. Le plan de renforcement tuteur Hancho a été automatisé via le module d alertes.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
