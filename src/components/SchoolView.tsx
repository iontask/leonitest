import React, { useState } from 'react';
import { Candidate, Attendance, Evaluation, TrainingSession } from '../types';
import {
  GraduationCap,
  CheckCircle2,
  XCircle,
  Clock,
  BookOpen,
  Award,
  AlertTriangle,
  UserCheck,
  Plus,
} from 'lucide-react';

interface SchoolViewProps {
  candidates: Candidate[];
  trainingSessions: TrainingSession[];
  onAddAttendance: (candidateId: number, data: Partial<Attendance>) => void;
  onAddEvaluation: (candidateId: number, data: Partial<Evaluation>) => void;
}

export const SchoolView: React.FC<SchoolViewProps> = ({
  candidates,
  trainingSessions,
  onAddAttendance,
  onAddEvaluation,
}) => {
  const [selectedCandidateId, setSelectedCandidateId] = useState<number>(
    candidates.find((c) => c.status === 'IN_TRAINING')?.id || candidates[0]?.id || 1
  );

  const [evalQuizScore, setEvalQuizScore] = useState<number>(85);
  const [evalPracticalScore, setEvalPracticalScore] = useState<number>(88);
  const [evalTrainerValidation, setEvalTrainerValidation] = useState<boolean>(true);
  const [evalNotes, setEvalNotes] = useState('');

  const candidate = candidates.find((c) => c.id === selectedCandidateId) || candidates[0];

  const handleMarkAttendance = (status: 'PRESENT' | 'ABSENT' | 'LATE') => {
    if (!candidate) return;
    onAddAttendance(candidate.id, {
      date: new Date().toISOString().slice(0, 10),
      status,
      phase: 'school',
      notes: status === 'LATE' ? 'Retard pointage école 10 min' : undefined,
    });
  };

  const handleSaveEvaluation = (type: 'theory' | 'practice') => {
    if (!candidate) return;
    onAddEvaluation(candidate.id, {
      type,
      quizScore: type === 'theory' ? evalQuizScore : undefined,
      examScore: type === 'theory' ? evalQuizScore : undefined,
      practicalScore: type === 'practice' ? evalPracticalScore : undefined,
      trainerValidation: evalTrainerValidation,
      date: new Date().toISOString().slice(0, 10),
      notes: evalNotes || `Évaluation ${type} validée par le formateur école`,
    });
    setEvalNotes('');
  };

  const schoolCandidates = candidates.filter((c) => c.status === 'IN_TRAINING' || c.status === 'SELECTED' || c.dayInJourney <= 5);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Module 4 — École de Formation (5 Jours)</h1>
          <p className="text-xs text-slate-500">
            Pointage digital journalier, modules théoriques (quiz 5S/standards), ateliers pratiques et validation formateur.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 text-indigo-800 px-3 py-2 rounded-xl text-xs font-semibold">
          <GraduationCap className="w-4 h-4 text-indigo-600" />
          <span>École Interne Métiers Alpha • 3 Cohortes Actives</span>
        </div>
      </div>

      {/* KPI Cards for School */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Taux Présence École</span>
          <div className="text-2xl font-bold text-emerald-600 mt-1">97.8%</div>
          <span className="text-[11px] text-slate-400">Assiduité 5 jours</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Réussite Théorie</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">94.2%</div>
          <span className="text-[11px] text-slate-400">Moyenne quiz 86/100</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Validation Pratique</span>
          <div className="text-2xl font-bold text-indigo-600 mt-1">92.0%</div>
          <span className="text-[11px] text-slate-400">Atelier connectique</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Risque Abandon J1-J5</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">2.4%</div>
          <span className="text-[11px] text-emerald-600 font-medium">Très bas</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Candidates in Training */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Recrues en Formation École
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
              {candidates.length} inscrits
            </span>
          </div>

          <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
            {candidates.map((c) => {
              const isSelected = c.id === selectedCandidateId;
              const hasSchoolAbsence = (c.attendances || []).some(
                (a) => a.phase === 'school' && a.status === 'ABSENT'
              );

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
                    <div className="text-[11px] text-slate-500">
                      Statut : <span className="font-medium text-slate-700">{c.status}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    {hasSchoolAbsence ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                        Absence notée
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        100% Présent
                      </span>
                    )}
                    <div className="text-[10px] text-slate-400 mt-1">Jour {c.dayInJourney}/90</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Candidate Training Sheet */}
        {candidate && (
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-2xs space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    {candidate.firstName} {candidate.lastName}
                  </h2>
                  <p className="text-xs text-slate-500">
                    CIN : {candidate.cin} • Formation : {candidate.educationLevel || 'Câblage & Électronique'}
                  </p>
                </div>

                {/* Quick Attendance Check */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-600">Pointage du jour :</span>
                  <button
                    onClick={() => handleMarkAttendance('PRESENT')}
                    className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Présent
                  </button>
                  <button
                    onClick={() => handleMarkAttendance('LATE')}
                    className="px-2.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Retard
                  </button>
                  <button
                    onClick={() => handleMarkAttendance('ABSENT')}
                    className="px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Absent
                  </button>
                </div>
              </div>

              {/* Attendance Log Table */}
              <div className="space-y-2 text-xs">
                <span className="font-bold text-slate-800 block text-sm">
                  Pointages de la Semaine École (J1 à J5)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((dayNum) => {
                    const att = (candidate.attendances || [])[dayNum - 1];
                    const isPresent = att?.status === 'PRESENT';
                    const isAbsent = att?.status === 'ABSENT';
                    const isLate = att?.status === 'LATE';

                    return (
                      <div
                        key={dayNum}
                        className={`p-3 rounded-xl border text-center ${
                          isPresent
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                            : isAbsent
                            ? 'bg-rose-50 border-rose-300 text-rose-900'
                            : isLate
                            ? 'bg-amber-50 border-amber-300 text-amber-900'
                            : 'bg-slate-50 border-slate-200 text-slate-500'
                        }`}
                      >
                        <span className="font-bold text-xs block">Jour {dayNum}</span>
                        <span className="text-[11px] font-semibold mt-1 block">
                          {att ? (isPresent ? 'Présent' : isAbsent ? 'Absent ❌' : 'Retard ⚠️') : 'En attente'}
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">{att?.date || '-'}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Evaluations Record & Form */}
              <div className="space-y-4 text-xs pt-4 border-t border-slate-200">
                <span className="font-bold text-slate-800 block text-sm">
                  Évaluations & Validation Formateur
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Theory Evaluation Card */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4 text-indigo-600" /> Module Théorique
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500">Standards 5S & Sécurité</span>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-slate-700 font-medium">Note Quiz Théorique (/100)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={evalQuizScore}
                        onChange={(e) => setEvalQuizScore(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                      />
                      <button
                        onClick={() => handleSaveEvaluation('theory')}
                        className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors cursor-pointer"
                      >
                        Enregistrer Note Théorie
                      </button>
                    </div>
                  </div>

                  {/* Practical Evaluation Card */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-emerald-600" /> Atelier Pratique Câblage
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500">Dextérité & Temps Takt</span>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-slate-700 font-medium">Score Pratique (/100)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={evalPracticalScore}
                        onChange={(e) => setEvalPracticalScore(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                      />
                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="checkbox"
                          id="chk-trainer-valid"
                          checked={evalTrainerValidation}
                          onChange={(e) => setEvalTrainerValidation(e.target.checked)}
                          className="w-4 h-4 rounded text-indigo-600"
                        />
                        <label htmlFor="chk-trainer-valid" className="text-slate-700 font-medium">
                          Validation officielle par le Formateur
                        </label>
                      </div>
                      <button
                        onClick={() => handleSaveEvaluation('practice')}
                        className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors cursor-pointer"
                      >
                        Valider l Atelier Pratique
                      </button>
                    </div>
                  </div>
                </div>

                {/* History of evals */}
                {(candidate.evaluations || []).length > 0 && (
                  <div className="space-y-2 mt-4">
                    <span className="font-semibold text-slate-700 block">Historique des Validations :</span>
                    <div className="space-y-1.5">
                      {candidate.evaluations?.map((ev) => (
                        <div
                          key={ev.id}
                          className="p-2.5 rounded-lg border border-slate-200 bg-white flex items-center justify-between"
                        >
                          <div>
                            <span className="font-bold text-slate-800 uppercase mr-2">
                              {ev.type === 'theory' ? 'Théorie' : 'Pratique'} :
                            </span>
                            <span className="text-slate-600">
                              Score {ev.quizScore || ev.practicalScore || 80}/100 • {ev.notes}
                            </span>
                          </div>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              ev.trainerValidation
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {ev.trainerValidation ? 'Validé ✅' : 'Ajourné ❌'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
