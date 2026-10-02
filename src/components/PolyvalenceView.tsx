import React, { useState } from 'react';
import { Candidate, PolyvalenceSkill } from '../types';
import {
  Grid3X3,
  Award,
  Plus,
  AlertOctagon,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

interface PolyvalenceViewProps {
  candidates: Candidate[];
  polyvalenceMatrix: PolyvalenceSkill[];
  onAddSkill: (skill: Partial<PolyvalenceSkill>) => void;
}

export const PolyvalenceView: React.FC<PolyvalenceViewProps> = ({
  candidates,
  polyvalenceMatrix,
  onAddSkill,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCandidateId, setSelectedCandidateId] = useState<number>(
    candidates[0]?.id || 1
  );
  const [positionName, setPositionName] = useState('Contrôle Caméra Vision 3D');
  const [segment, setSegment] = useState('Segment Câblage Moteur');
  const [line, setLine] = useState('Ligne CM-02');
  const [masteryLevel, setMasteryLevel] = useState<1 | 2 | 3 | 4>(2);
  const [isCriticalPost, setIsCriticalPost] = useState(true);
  const [qualifiedAt, setQualifiedAt] = useState(new Date().toISOString().slice(0, 10));

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cand = candidates.find((c) => c.id === selectedCandidateId);
    if (!cand) return;

    onAddSkill({
      candidateId: selectedCandidateId,
      candidateName: `${cand.firstName} ${cand.lastName}`,
      positionName,
      segment,
      line,
      masteryLevel,
      isCriticalPost,
      qualifiedAt,
    });

    setIsAddModalOpen(false);
  };

  const getLevelBadge = (level: number) => {
    switch (level) {
      case 4:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
            Niv 4 : Formateur / Expert
          </span>
        );
      case 3:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            Niv 3 : Confirmé (Takt OK)
          </span>
        );
      case 2:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
            Niv 2 : Autonome
          </span>
        );
      case 1:
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            Niv 1 : Apprenti
          </span>
        );
    }
  };

  const multiPostCount = new Set(polyvalenceMatrix.map((p) => p.candidateId)).size;
  const criticalQualifiedCount = polyvalenceMatrix.filter((p) => p.isCriticalPost && p.masteryLevel >= 2).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Module 10 — Matrice de Polyvalence (Compétences Ligne)</h1>
          <p className="text-xs text-slate-500">
            Qualification multi-postes (Niveaux 1 à 4 : Apprenti, Autonome, Confirmé, Formateur) et couverture des postes critiques.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Ajouter une Qualification Poste</span>
        </button>
      </div>

      {/* KPI Cards for Polyvalence */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Taux Polyvalence</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">2.2 postes</div>
          <span className="text-[11px] text-emerald-600 font-medium">Moyenne par opérateur</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Opérateurs Multi-Postes</span>
          <div className="text-2xl font-bold text-indigo-600 mt-1">{multiPostCount}</div>
          <span className="text-[11px] text-slate-400">Flexibilité des shifts</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Couverture Postes Critiques</span>
          <div className="text-2xl font-bold text-emerald-600 mt-1">{criticalQualifiedCount}</div>
          <span className="text-[11px] text-slate-400">Opérateurs autonomes / goulots</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Tuteurs Formateurs (Niv 4)</span>
          <div className="text-2xl font-bold text-purple-600 mt-1">
            {polyvalenceMatrix.filter((p) => p.masteryLevel === 4).length}
          </div>
          <span className="text-[11px] text-slate-400">Transmission de savoir</span>
        </div>
      </div>

      {/* Skills Matrix Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Matrice des Qualifications & Postes Maîtrisés
          </h2>
          <span className="text-[11px] text-slate-500 font-medium">
            {polyvalenceMatrix.length} habilitations enregistrées
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Opérateur</th>
                <th className="py-3 px-4">Poste de Travail</th>
                <th className="py-3 px-4">Ligne & Segment</th>
                <th className="py-3 px-4">Niveau de Maîtrise</th>
                <th className="py-3 px-4">Criticité Poste</th>
                <th className="py-3 px-4">Date Qualification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {polyvalenceMatrix.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900">{item.candidateName}</td>
                  <td className="py-3 px-4 font-medium text-slate-800">{item.positionName}</td>
                  <td className="py-3 px-4 text-slate-500">
                    {item.line} ({item.segment})
                  </td>
                  <td className="py-3 px-4">{getLevelBadge(item.masteryLevel)}</td>
                  <td className="py-3 px-4">
                    {item.isCriticalPost ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                        <AlertOctagon className="w-3 h-3 text-rose-600" /> Poste Critique / Goulot
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[11px]">Standard</span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                    {item.qualifiedAt || item.targetDate ? (
                      item.qualifiedAt ? (
                        <span className="text-emerald-700 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> {item.qualifiedAt}
                        </span>
                      ) : (
                        <span className="text-amber-700">Cible : {item.targetDate}</span>
                      )
                    ) : (
                      '-'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add Skill */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-600" />
                Habiliter un Poste (Polyvalence)
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Opérateur</label>
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
                <label className="block font-semibold text-slate-700 mb-1">Poste de Travail</label>
                <input
                  type="text"
                  required
                  value={positionName}
                  onChange={(e) => setPositionName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Segment</label>
                  <select
                    value={segment}
                    onChange={(e) => setSegment(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                  >
                    <option value="Segment Câblage Moteur">Câblage Moteur</option>
                    <option value="Segment Cockpit">Cockpit</option>
                    <option value="Segment Finition & Contrôle">Finition & Contrôle</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Ligne</label>
                  <input
                    type="text"
                    value={line}
                    onChange={(e) => setLine(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Niveau de Maîtrise Évalué</label>
                <select
                  value={masteryLevel}
                  onChange={(e) => setMasteryLevel(Number(e.target.value) as any)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold"
                >
                  <option value={1}>Niveau 1 : Apprenti (Sous tutorat)</option>
                  <option value={2}>Niveau 2 : Autonome (Produit seul au standard)</option>
                  <option value={3}>Niveau 3 : Confirmé (Cadence takt time & FPY &gt; 98%)</option>
                  <option value={4}>Niveau 4 : Formateur / Expert (Forme les nouvelles recrues)</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="chk-critical"
                  checked={isCriticalPost}
                  onChange={(e) => setIsCriticalPost(e.target.checked)}
                  className="w-4 h-4 rounded text-rose-600"
                />
                <label htmlFor="chk-critical" className="font-semibold text-slate-800">
                  Poste critique ou goulot d étranglement de la ligne
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs"
                >
                  Enregistrer l Habilitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
