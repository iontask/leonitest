import React, { useState } from 'react';
import { Candidate, LearningCurvePoint } from '../types';
import {
  TrendingUp,
  Award,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ShieldAlert,
  Calendar,
  Grid3X3,
} from 'lucide-react';

interface LearningCurveViewProps {
  candidates: Candidate[];
  onAddLearningCurvePoint: (candidateId: number, point: Partial<LearningCurvePoint>) => void;
}

export const LearningCurveView: React.FC<LearningCurveViewProps> = ({
  candidates,
  onAddLearningCurvePoint,
}) => {
  const [selectedCandidateId, setSelectedCandidateId] = useState<number>(
    candidates.find((c) => (c.learningCurvePoints || []).length > 0)?.id || candidates[0]?.id || 1
  );

  const [newDayNum, setNewDayNum] = useState<number>(15);
  const [newActualProd, setNewActualProd] = useState<number>(75);
  const [newTargetProd, setNewTargetProd] = useState<number>(80);
  const [newQuality, setNewQuality] = useState<number>(98.5);
  const [newDiscipline, setNewDiscipline] = useState<number>(95);
  const [newPolyvalence, setNewPolyvalence] = useState<number>(2);

  const candidate = candidates.find((c) => c.id === selectedCandidateId) || candidates[0];
  const lcPoints = candidate?.learningCurvePoints || [];
  const magic = candidate?.magicSquare;

  const handleAddPoint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidate) return;

    onAddLearningCurvePoint(candidate.id, {
      dayNumber: Number(newDayNum),
      productivity: Number(newActualProd),
      targetProductivity: Number(newTargetProd),
      quality: Number(newQuality),
      presence: true,
      discipline: Number(newDiscipline),
      polyvalence: Number(newPolyvalence),
    });

    setNewDayNum((prev) => Math.min(28, prev + 1));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Modules 8 & 9 — Learning Curve Digitale & Carré Magique (28 Jours)
          </h1>
          <p className="text-xs text-slate-500">
            Trajectoire d apprentissage J1→J28 : efficience réelle vs courbe standard, FPY qualité et Carré Magique (4 axes).
          </p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-2 rounded-xl text-xs font-semibold">
          <TrendingUp className="w-4 h-4 text-emerald-600" />
          <span>Courbe Standard Usine : 30% J1 → 95% J28</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Candidate Selector */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Opérateurs suivis en Learning Curve
            </h2>
          </div>

          <div className="divide-y divide-slate-100 max-h-[550px] overflow-y-auto">
            {candidates.map((c) => {
              const isSelected = c.id === selectedCandidateId;
              const pts = c.learningCurvePoints || [];
              const latest = pts[pts.length - 1];
              const square = c.magicSquare;

              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedCandidateId(c.id)}
                  className={`p-3 text-xs cursor-pointer transition-colors flex items-center justify-between ${
                    isSelected ? 'bg-indigo-50/80 border-l-4 border-indigo-600' : 'hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <div className="font-bold text-slate-900">
                      {c.firstName} {c.lastName}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {c.productionAssignment?.line || 'École (5j)'}
                    </div>
                  </div>

                  <div className="text-right">
                    {square ? (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          square.status === 'GREEN'
                            ? 'bg-emerald-100 text-emerald-800'
                            : square.status === 'RED'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {square.status === 'GREEN'
                          ? 'Carré Vert'
                          : square.status === 'RED'
                          ? 'Carré Rouge'
                          : 'Carré Jaune'}
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400">Jalon J1-J5</span>
                    )}

                    {latest && (
                      <div className="text-[10px] text-indigo-600 font-semibold mt-1">
                        Prod : {latest.productivity}% / Cible {latest.targetProductivity}%
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Learning Curve Visual & Magic Square for Selected Operator */}
        {candidate && (
          <div className="lg:col-span-2 space-y-6">
            {/* Operator Summary Header */}
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {candidate.firstName} {candidate.lastName}
                </h2>
                <p className="text-xs text-slate-500">
                  Poste : <strong>{candidate.productionAssignment?.position || 'Poste standard'}</strong> • Ligne : {candidate.productionAssignment?.line || 'CM-01'}
                </p>
              </div>

              {/* Magic Square Badge */}
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-xs text-slate-400 block font-medium">Bilan Carré Magique</span>
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-lg inline-flex items-center gap-1 ${
                      magic?.status === 'GREEN'
                        ? 'bg-emerald-100 text-emerald-800'
                        : magic?.status === 'RED'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {magic?.status === 'GREEN' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5" />
                    )}
                    Niveau : {magic?.status || 'Calcul en cours'}
                  </span>
                </div>
              </div>
            </div>

            {/* Carré Magique 4 Axes Card Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Qualité */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Axe 1 — Qualité (FPY)
                </span>
                <div className="text-2xl font-black text-slate-900 mt-2">
                  {magic?.qualityScore ?? 96}%
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full"
                    style={{ width: `${magic?.qualityScore ?? 96}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-400 block mt-1.5">Standard FPY &gt; 95%</span>
              </div>

              {/* Productivité */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Axe 2 — Productivité
                </span>
                <div
                  className={`text-2xl font-black mt-2 ${
                    (magic?.productivityScore ?? 75) >= 75 ? 'text-slate-900' : 'text-rose-600'
                  }`}
                >
                  {magic?.productivityScore ?? 75}%
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      (magic?.productivityScore ?? 75) >= 75 ? 'bg-indigo-600' : 'bg-rose-500'
                    }`}
                    style={{ width: `${magic?.productivityScore ?? 75}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-400 block mt-1.5">Objectif J28 : 95%</span>
              </div>

              {/* Polyvalence */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Axe 3 — Polyvalence
                </span>
                <div className="text-2xl font-black text-slate-900 mt-2">
                  {magic?.polyvalenceScore ?? 60}%
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full"
                    style={{ width: `${magic?.polyvalenceScore ?? 60}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-400 block mt-1.5">Postes maîtrisés</span>
              </div>

              {/* Discipline */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Axe 4 — Discipline
                </span>
                <div className="text-2xl font-black text-slate-900 mt-2">
                  {magic?.disciplineScore ?? 95}%
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-full"
                    style={{ width: `${magic?.disciplineScore ?? 95}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-400 block mt-1.5">Présence & 5S</span>
              </div>
            </div>

            {/* Learning Curve Chart & Milestones */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-indigo-600" /> Courbe d Apprentissage J1 à J28
                  </h3>
                  <p className="text-xs text-slate-500">
                    Comparaison de la cadence réelle par rapport au standard d intégration usine
                  </p>
                </div>
              </div>

              {/* SVG Graphic Curve */}
              <div className="h-56 w-full bg-slate-50 rounded-xl p-4 border border-slate-200 relative flex flex-col justify-between">
                <div className="flex justify-between items-center text-[10px] text-slate-400 border-b border-slate-200 pb-1">
                  <span>100% (Cadence Nominale)</span>
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1 text-slate-500 font-medium">
                      <span className="w-3 h-0.5 bg-slate-400 border-t-2 border-dashed border-slate-400 inline-block" /> Courbe Cible Standard
                    </span>
                    <span className="flex items-center gap-1 text-indigo-600 font-bold">
                      <span className="w-3 h-1 bg-indigo-600 inline-block rounded-full" /> Productivité Réelle
                    </span>
                  </div>
                </div>

                {/* Simulated Curve Points Visual */}
                <div className="h-36 flex items-end justify-between px-2 pt-4 relative">
                  {/* Benchmarks for days */}
                  {[1, 3, 6, 9, 12, 16, 20, 24, 28].map((day) => {
                    const foundPoint = lcPoints.find((p) => p.dayNumber === day);
                    const targetHeight = Math.round(30 + (day / 28) * 65);
                    const actualHeight = foundPoint ? foundPoint.productivity : null;

                    return (
                      <div key={day} className="flex flex-col items-center gap-1 h-full justify-end w-8">
                        <div className="relative w-full flex items-end justify-center h-28">
                          {/* Target bar outline */}
                          <div
                            style={{ height: `${targetHeight}%` }}
                            className="w-2.5 bg-slate-200 rounded-t-sm absolute"
                            title={`Cible J${day}: ${targetHeight}%`}
                          />
                          {/* Actual bar */}
                          {actualHeight !== null && (
                            <div
                              style={{ height: `${actualHeight}%` }}
                              className={`w-2.5 rounded-t-sm z-10 transition-all ${
                                actualHeight >= targetHeight
                                  ? 'bg-indigo-600'
                                  : 'bg-rose-500'
                              }`}
                              title={`Réalisé J${day}: ${actualHeight}% (Cible: ${targetHeight}%)`}
                            />
                          )}
                        </div>
                        <span className="text-[10px] font-mono text-slate-500">J{day}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="text-[10px] text-slate-400 text-center border-t border-slate-200 pt-1">
                  Période d intégration terrain (Jours 1 à 28)
                </div>
              </div>

              {/* Data Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-slate-700 font-semibold uppercase text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3">Jalon</th>
                      <th className="py-2 px-3">Date</th>
                      <th className="py-2 px-3">Productivité Réelle</th>
                      <th className="py-2 px-3">Cible Standard</th>
                      <th className="py-2 px-3">Écart</th>
                      <th className="py-2 px-3">Qualité FPY</th>
                      <th className="py-2 px-3">Polyvalence</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {lcPoints.map((pt) => {
                      const gap = pt.productivity - pt.targetProductivity;
                      return (
                        <tr key={pt.id} className="hover:bg-slate-50">
                          <td className="py-2 px-3 font-bold text-slate-900">Jour {pt.dayNumber}</td>
                          <td className="py-2 px-3 text-slate-500 font-mono text-[11px]">{pt.date}</td>
                          <td className="py-2 px-3 font-extrabold text-slate-900">{pt.productivity}%</td>
                          <td className="py-2 px-3 text-slate-500">{pt.targetProductivity}%</td>
                          <td className="py-2 px-3">
                            <span
                              className={`font-bold ${
                                gap >= 0 ? 'text-emerald-600' : 'text-rose-600'
                              }`}
                            >
                              {gap >= 0 ? `+${gap}%` : `${gap}%`}
                            </span>
                          </td>
                          <td className="py-2 px-3 font-semibold text-slate-800">{pt.quality}%</td>
                          <td className="py-2 px-3">{pt.polyvalence} poste(s)</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Form to log Day N performance point */}
            <form onSubmit={handleAddPoint} className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs space-y-4 text-xs">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-indigo-600" /> Saisie d un Jalon Learning Curve
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Jour (J1-J28)</label>
                  <input
                    type="number"
                    min="1"
                    max="28"
                    value={newDayNum}
                    onChange={(e) => setNewDayNum(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Productivité (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newActualProd}
                    onChange={(e) => setNewActualProd(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Cible Cadrée (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newTargetProd}
                    onChange={(e) => setNewTargetProd(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">FPY Qualité (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={newQuality}
                    onChange={(e) => setNewQuality(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Discipline (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newDiscipline}
                    onChange={(e) => setNewDiscipline(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Nb Postes</label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={newPolyvalence}
                    onChange={(e) => setNewPolyvalence(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  Enregistrer et Recalculer le Carré Magique
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
