import React, { useState } from 'react';
import { Candidate, Survey, SurveyMilestone } from '../types';
import {
  ClipboardList,
  Smile,
  Meh,
  Frown,
  Plus,
  Star,
  CheckCircle2,
  Calendar,
  MessageSquare,
} from 'lucide-react';

interface SurveysViewProps {
  candidates: Candidate[];
  onAddSurvey: (candidateId: number, survey: Partial<Survey>) => void;
}

export const SurveysView: React.FC<SurveysViewProps> = ({
  candidates,
  onAddSurvey,
}) => {
  const [selectedCandidateId, setSelectedCandidateId] = useState<number>(
    candidates[0]?.id || 1
  );
  const [milestone, setMilestone] = useState<SurveyMilestone>('J5_TERRAIN');
  const [satisfactionScore, setSatisfactionScore] = useState<number>(85);
  const [notes, setNotes] = useState('');
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  // Criteria ratings
  const [ratingWelcome, setRatingWelcome] = useState(4);
  const [ratingManagement, setRatingManagement] = useState(4);
  const [ratingWorkload, setRatingWorkload] = useState(4);
  const [ratingTransport, setRatingTransport] = useState(4);

  const candidate = candidates.find((c) => c.id === selectedCandidateId) || candidates[0];

  const allSurveys = candidates.flatMap((c) =>
    (c.surveys || []).map((s) => ({ ...s, candidateName: `${c.firstName} ${c.lastName}` }))
  );

  const avgSatisfaction = Math.round(
    allSurveys.length
      ? allSurveys.reduce((acc, s) => acc + s.satisfaction, 0) / allSurveys.length
      : 84
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidate) return;

    onAddSurvey(candidate.id, {
      milestone,
      satisfaction: Number(satisfactionScore),
      answers: {
        accueil: ratingWelcome,
        management: ratingManagement,
        charge: ratingWorkload,
        transport: ratingTransport,
      },
      notes: notes || 'Enquête enregistrée avec succès.',
    });

    setNotes('');
    setIsSubmitModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-indigo-600" />
            Modules 5 & 11 — Enquêtes de Satisfaction (J+5, J+28, J+90)
          </h1>
          <p className="text-xs text-slate-500">
            Suivi des ressentis aux 4 jalons clés : écoute active, NPS Onboarding et détection précoce du désistement.
          </p>
        </div>

        <button
          onClick={() => setIsSubmitModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Saisir une Enquête Jalon</span>
        </button>
      </div>

      {/* NPS and Satisfaction KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Satisfaction Globale</span>
          <div className="text-2xl font-bold text-indigo-600 mt-1">{avgSatisfaction}%</div>
          <span className="text-[11px] text-slate-400">Tous jalons confondus</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">NPS Onboarding Usine</span>
          <div className="text-2xl font-bold text-emerald-600 mt-1">+64</div>
          <span className="text-[11px] text-emerald-600 font-medium">Excellente recommandation</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Enquêtes J+5 Terrain</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {allSurveys.filter((s) => s.milestone === 'J5_TERRAIN').length}
          </div>
          <span className="text-[11px] text-slate-400">Jalon le plus critique</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Alertes Insatisfaction</span>
          <div className="text-2xl font-bold text-rose-600 mt-1">
            {allSurveys.filter((s) => s.satisfaction < 60).length}
          </div>
          <span className="text-[11px] text-rose-600 font-medium">&lt; 60% déclenchées</span>
        </div>
      </div>

      {/* Historical Surveys Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Journal des Enquêtes Renseignées ({allSurveys.length})
          </h2>
          <span className="text-[11px] text-slate-500 font-medium">
            Jalons J+5 École, J+5 Terrain, J+28, J+90
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold uppercase text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Recrue</th>
                <th className="py-3 px-4">Jalon</th>
                <th className="py-3 px-4">Score Satisfaction</th>
                <th className="py-3 px-4">Feedback / Commentaires</th>
                <th className="py-3 px-4">Date de Saisie</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allSurveys.map((sv, idx) => {
                const isUnder60 = sv.satisfaction < 60;
                const isUnder40 = sv.satisfaction < 40;

                return (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">{sv.candidateName}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                        {sv.milestone}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`font-bold px-2 py-0.5 rounded-md text-xs ${
                          isUnder40
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : isUnder60
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {sv.satisfaction}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700 max-w-md">{sv.notes || '-'}</td>
                    <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">{sv.createdAt}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Submit Survey */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-indigo-600" />
                Renseigner une Enquête de Satisfaction
              </h3>
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Recrue</label>
                <select
                  value={selectedCandidateId}
                  onChange={(e) => setSelectedCandidateId(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500"
                >
                  {candidates.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.firstName} {c.lastName} ({c.cin})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Jalon d Intégration</label>
                <select
                  value={milestone}
                  onChange={(e) => setMilestone(e.target.value as SurveyMilestone)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="J5_ECOLE">J+5 École (Accueil, Formateur, Pédagogie, Transport)</option>
                  <option value="J5_TERRAIN">J+5 Terrain (Accueil Équipe, Hancho, Charge, Cadence)</option>
                  <option value="J28">J+28 Fin Intégration Terrain (Confiance, Sécurité, Carré Magique)</option>
                  <option value="J90">J+90 Bilan Période d Intégration Finale</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-semibold text-slate-700">Score de Satisfaction Globale :</label>
                  <span className="font-black text-indigo-600 text-sm">{satisfactionScore}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={satisfactionScore}
                  onChange={(e) => setSatisfactionScore(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>0% (Insatisfait)</span>
                  <span>50% (Moyen)</span>
                  <span>100% (Très satisfait)</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Commentaires de la recrue</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Points forts, difficultés rencontrées, relations avec le Hancho..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs"
                >
                  Enregistrer l Enquête
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
