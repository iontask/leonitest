import React, { useState } from 'react';
import { Candidate, AttritionScore } from '../types';
import {
  BrainCircuit,
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  TrendingDown,
  Clock,
  ShieldCheck,
  UserCheck,
  ChevronRight,
  Info,
} from 'lucide-react';

interface AttritionViewProps {
  candidates: Candidate[];
  onTriggerBatchCron: () => void;
  isCronRunning: boolean;
  onRefreshCandidateScore?: (candidateId: number) => void;
}

export const AttritionView: React.FC<AttritionViewProps> = ({
  candidates,
  onTriggerBatchCron,
  isCronRunning,
}) => {
  const [selectedCandidateId, setSelectedCandidateId] = useState<number>(
    candidates.find((c) => c.attritionScores?.[0]?.level === 'Critique')?.id ||
      candidates[0]?.id ||
      1
  );

  const [aiAnalysisResult, setAiAnalysisResult] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  const candidate = candidates.find((c) => c.id === selectedCandidateId) || candidates[0];
  const scoreObj = candidate?.attritionScores?.[0];

  const handleRunGeminiAnalysis = async () => {
    if (!candidate) return;
    setIsAiLoading(true);
    setAiAnalysisResult(null);

    try {
      const res = await fetch('/api/ai/analyze-candidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidateId: candidate.id }),
      });
      const data = await res.json();
      setAiAnalysisResult(data.analysis || 'Analyse indisponible.');
    } catch (err) {
      console.error(err);
      setAiAnalysisResult('Erreur lors de l analyse IA Gemini.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const criticalCount = candidates.filter((c) => c.attritionScores?.[0]?.level === 'Critique').length;
  const mediumCount = candidates.filter((c) => c.attritionScores?.[0]?.level === 'Moyen').length;
  const lowCount = candidates.filter((c) => c.attritionScores?.[0]?.level === 'Faible').length;

  return (
    <div className="space-y-6">
      {/* Title & Batch Recalculation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-indigo-600" />
            Module 12 — Moteur IA d Attrition & Rétention Prédictive
          </h1>
          <p className="text-xs text-slate-500">
            Algorithme à règles pondérées explicables (exigence RH) + Analyse clinique causale générative (Gemini 3.8 Flash).
          </p>
        </div>

        <button
          id="btn-attrition-batch"
          onClick={onTriggerBatchCron}
          disabled={isCronRunning}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 text-indigo-400 ${isCronRunning ? 'animate-spin' : ''}`} />
          <span>{isCronRunning ? 'Calcul BullMQ en cours...' : 'Exécuter Recalcul Quotidien'}</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-rose-200 bg-rose-50/20 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-900 uppercase">Risque Critique (71-100)</span>
            <AlertOctagon className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-3xl font-black text-rose-700 mt-2">{criticalCount} recrue(s)</div>
          <span className="text-[11px] text-rose-600 font-medium">Intervention RH / Hancho sous 24h</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/20 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-900 uppercase">Vigilance Modérée (41-70)</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl font-black text-amber-700 mt-2">{mediumCount} recrue(s)</div>
          <span className="text-[11px] text-amber-600 font-medium">Soutien tuteur recommandé</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-900 uppercase">Risque Faible (0-40)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-emerald-700 mt-2">{lowCount} recrue(s)</div>
          <span className="text-[11px] text-emerald-600 font-medium">Trajectoire nominale conforme</span>
        </div>
      </div>

      {/* Main Two-Column View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Candidate List Filtered by Risk */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Classement Risque d Attrition
            </h2>
            <span className="text-[10px] font-semibold text-slate-400">Ordre décroissant</span>
          </div>

          <div className="divide-y divide-slate-100 max-h-[550px] overflow-y-auto">
            {candidates
              .slice()
              .sort(
                (a, b) =>
                  (b.attritionScores?.[0]?.score || 0) - (a.attritionScores?.[0]?.score || 0)
              )
              .map((c) => {
                const sc = c.attritionScores?.[0];
                const isSelected = c.id === selectedCandidateId;

                return (
                  <div
                    key={c.id}
                    onClick={() => {
                      setSelectedCandidateId(c.id);
                      setAiAnalysisResult(null);
                    }}
                    className={`p-3 text-xs cursor-pointer transition-colors flex items-center justify-between ${
                      isSelected ? 'bg-indigo-50/80 border-l-4 border-indigo-600' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-slate-900">
                        {c.firstName} {c.lastName}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Jour {c.dayInJourney}/90 • {c.productionAssignment?.line || 'École (5j)'}
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                          sc?.level === 'Critique'
                            ? 'bg-rose-100 text-rose-800'
                            : sc?.level === 'Moyen'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {sc?.score || 0}% ({sc?.level})
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Selected Candidate Detailed Attrition Factor Decomposition */}
        {candidate && scoreObj && (
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-2xs space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-900">
                      {candidate.firstName} {candidate.lastName}
                    </h2>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        scoreObj.level === 'Critique'
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : scoreObj.level === 'Moyen'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      }`}
                    >
                      Niveau {scoreObj.level} • Risque {scoreObj.score}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Calculé le {scoreObj.computedAt} • Jalon Jour {candidate.dayInJourney}/90
                  </p>
                </div>

                <button
                  id="btn-gemini-deep-analysis"
                  onClick={handleRunGeminiAnalysis}
                  disabled={isAiLoading}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
                >
                  <Sparkles className={`w-4 h-4 text-indigo-200 ${isAiLoading ? 'animate-spin' : ''}`} />
                  <span>{isAiLoading ? 'Analyse Gemini...' : 'Analyse Approfondie Gemini'}</span>
                </button>
              </div>

              {/* Contributing Factors Breakdown (Explainable AI / Transparence RH) */}
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 block text-sm flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-indigo-600" />
                    Décomposition Explicable des Facteurs d Attrition (Non Boîte-Noire)
                  </span>
                  <span className="text-[11px] text-slate-400">Règles métier pondérées v1</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Absences */}
                  <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
                    <div className="flex justify-between items-center font-semibold text-slate-700">
                      <span>Absences & Assiduité (Poids 22%)</span>
                      <span
                        className={
                          scoreObj.factors.absencesScore > 50 ? 'text-rose-600 font-bold' : 'text-slate-600'
                        }
                      >
                        {scoreObj.factors.absencesScore}/100
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          scoreObj.factors.absencesScore > 50 ? 'bg-rose-500' : 'bg-indigo-500'
                        }`}
                        style={{ width: `${scoreObj.factors.absencesScore}%` }}
                      />
                    </div>
                  </div>

                  {/* Satisfaction */}
                  <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
                    <div className="flex justify-between items-center font-semibold text-slate-700">
                      <span>Enquêtes de Satisfaction (Poids 24%)</span>
                      <span
                        className={
                          scoreObj.factors.satisfactionScore > 50
                            ? 'text-rose-600 font-bold'
                            : 'text-slate-600'
                        }
                      >
                        {scoreObj.factors.satisfactionScore}/100
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          scoreObj.factors.satisfactionScore > 50 ? 'bg-rose-500' : 'bg-indigo-500'
                        }`}
                        style={{ width: `${scoreObj.factors.satisfactionScore}%` }}
                      />
                    </div>
                  </div>

                  {/* Retard Cadence Learning Curve */}
                  <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
                    <div className="flex justify-between items-center font-semibold text-slate-700">
                      <span>Écart Productivité Learning Curve (Poids 16%)</span>
                      <span
                        className={
                          scoreObj.factors.productivityGapScore > 50
                            ? 'text-rose-600 font-bold'
                            : 'text-slate-600'
                        }
                      >
                        {scoreObj.factors.productivityGapScore}/100
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          scoreObj.factors.productivityGapScore > 50 ? 'bg-rose-500' : 'bg-indigo-500'
                        }`}
                        style={{ width: `${scoreObj.factors.productivityGapScore}%` }}
                      />
                    </div>
                  </div>

                  {/* Risque Transport */}
                  <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
                    <div className="flex justify-between items-center font-semibold text-slate-700">
                      <span>Difficultés Transport / Navette (Poids 10%)</span>
                      <span
                        className={
                          scoreObj.factors.transportRiskScore > 50
                            ? 'text-rose-600 font-bold'
                            : 'text-slate-600'
                        }
                      >
                        {scoreObj.factors.transportRiskScore}/100
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          scoreObj.factors.transportRiskScore > 50 ? 'bg-rose-500' : 'bg-indigo-500'
                        }`}
                        style={{ width: `${scoreObj.factors.transportRiskScore}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Specific Explanations list */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 mt-3">
                  <span className="font-bold text-slate-800 block text-xs">
                    Causes racines détectées par le modèle :
                  </span>
                  <ul className="list-disc list-inside space-y-1 text-slate-600">
                    {scoreObj.factors.explanation.map((exp, idx) => (
                      <li key={idx} className="leading-snug">
                        {exp}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Recommended Action Plan */}
              {scoreObj.aiActionPlan && (
                <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-200 space-y-2 text-xs">
                  <span className="font-bold text-indigo-900 block text-xs flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-indigo-700" />
                    Plan d Action Recommandé par le Système :
                  </span>
                  <div className="space-y-1.5">
                    {scoreObj.aiActionPlan.map((act, i) => (
                      <div key={i} className="flex items-start gap-2 text-indigo-950">
                        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                        <span>{act}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Gemini AI Detailed Diagnostic Card */}
              {aiAnalysisResult && (
                <div className="p-4 rounded-xl bg-slate-900 text-slate-100 space-y-2 text-xs shadow-md border border-slate-800">
                  <div className="flex items-center justify-between text-indigo-400 font-bold border-b border-slate-800 pb-2">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-indigo-400" /> Diagnostic Approfondi Gemini 3.8 Flash
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Modèle Lean Manufacturing</span>
                  </div>
                  <div className="text-slate-200 whitespace-pre-line leading-relaxed text-xs pt-1">
                    {aiAnalysisResult}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
