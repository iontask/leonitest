import React, { useState, useEffect } from 'react';
import {
  Candidate,
  DashboardStats,
  Alert,
  PolyvalenceSkill,
  TrainingSession,
  UserRole,
  WelcomeKit,
  TransportAssignment,
  TransportIncident,
  Attendance,
  Evaluation,
  ProductionAssignment,
  LearningCurvePoint,
  Survey,
  SurveyMilestone,
} from './types';
import {
  initialCandidates,
  initialTrainingSessions,
  initialPolyvalenceMatrix,
  initialAlerts,
} from './data/seedData';
import { calculateAttritionScore, detectCandidateAlerts } from './utils/attritionEngine';
import { Header } from './components/Header';
import { Navigation, ActiveTab } from './components/Navigation';
import { DashboardView } from './components/DashboardView';
import { CandidatesView } from './components/CandidatesView';
import { WelcomeKitView } from './components/WelcomeKitView';
import { TransportView } from './components/TransportView';
import { SchoolView } from './components/SchoolView';
import { ProductionView } from './components/ProductionView';
import { LearningCurveView } from './components/LearningCurveView';
import { PolyvalenceView } from './components/PolyvalenceView';
import { AttritionView } from './components/AttritionView';
import { AlertsView } from './components/AlertsView';
import { SurveysView } from './components/SurveysView';
import { ReportsView } from './components/ReportsView';
import { AiCopilotModal } from './components/AiCopilotModal';
import { DeploymentGuideModal } from './components/DeploymentGuideModal';
import { CheckCircle2 } from 'lucide-react';

function computeDashboardStats(cands: Candidate[], alrts: Alert[]): DashboardStats {
  const total = cands.length;
  const inTraining = cands.filter((c) => c.status === 'IN_TRAINING').length;
  const inProd = cands.filter((c) => c.status === 'IN_PRODUCTION').length;
  const departed = cands.filter((c) => c.status === 'DEPARTED').length;
  const retention = total > 0 ? Math.round(((total - departed) / total) * 100) : 100;
  const earlyTurnover =
    total > 0
      ? Math.round(
          (cands.filter((c) => c.status === 'DEPARTED' && c.dayInJourney <= 35).length / total) * 100
        )
      : 0;

  const validScores = cands.map((c) => c.attritionScores?.[0]?.score || 0);
  const avgRisk = validScores.length
    ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length)
    : 0;

  const critical = cands.filter((c) => (c.attritionScores?.[0]?.score || 0) >= 71).length;
  const medium = cands.filter((c) => {
    const s = c.attritionScores?.[0]?.score || 0;
    return s >= 41 && s < 71;
  }).length;
  const low = cands.filter((c) => (c.attritionScores?.[0]?.score || 0) < 41).length;

  const completeKits = cands.filter(
    (c) =>
      c.welcomeKit &&
      c.welcomeKit.vestGiven &&
      c.welcomeKit.blouseGiven &&
      c.welcomeKit.badgeGiven &&
      c.welcomeKit.contractGiven &&
      c.welcomeKit.lockerGiven &&
      c.welcomeKit.ppeGiven
  ).length;
  const readiness = total > 0 ? Math.round((completeKits / total) * 1000) / 10 : 94.8;

  return {
    totalCandidates: total,
    activeInTraining: inTraining,
    activeInProduction: inProd,
    retentionRate90Days: retention,
    earlyTurnover5Weeks: earlyTurnover,
    readinessScoreJ1: readiness,
    avgSchoolSuccessRate: 94.2,
    avgQualityFPY: 97.4,
    criticalAttritionCount: critical,
    mediumAttritionCount: medium,
    lowAttritionCount: low,
    openAlertsCount: alrts.filter((a) => !a.resolved).length,
  };
}

export default function App() {
  const [candidates, setCandidates] = useState<Candidate[]>(() => {
    try {
      const saved = localStorage.getItem('onboarding_candidates');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return initialCandidates;
  });

  const [trainingSessions] = useState<TrainingSession[]>(initialTrainingSessions);

  const [polyvalenceMatrix, setPolyvalenceMatrix] = useState<PolyvalenceSkill[]>(() => {
    try {
      const saved = localStorage.getItem('onboarding_polyvalence');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return initialPolyvalenceMatrix;
  });

  const [alerts, setAlerts] = useState<Alert[]>(() => {
    try {
      const saved = localStorage.getItem('onboarding_alerts');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return initialAlerts;
  });

  const [stats, setStats] = useState<DashboardStats>(() =>
    computeDashboardStats(candidates, alerts)
  );

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [currentRole, setCurrentRole] = useState<UserRole>('RH');
  const [isCronRunning, setIsCronRunning] = useState<boolean>(false);
  const [isAiCopilotOpen, setIsAiCopilotOpen] = useState<boolean>(false);
  const [isDeploymentModalOpen, setIsDeploymentModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem('onboarding_candidates', JSON.stringify(candidates));
    } catch (e) {}
    setStats(computeDashboardStats(candidates, alerts));
  }, [candidates]);

  useEffect(() => {
    try {
      localStorage.setItem('onboarding_alerts', JSON.stringify(alerts));
    } catch (e) {}
    setStats(computeDashboardStats(candidates, alerts));
  }, [alerts]);

  useEffect(() => {
    try {
      localStorage.setItem('onboarding_polyvalence', JSON.stringify(polyvalenceMatrix));
    } catch (e) {}
  }, [polyvalenceMatrix]);

  // Fetch initial data from server API if backend exists
  const refreshData = async () => {
    try {
      const [candRes, statsRes, alertsRes, polyRes] = await Promise.allSettled([
        fetch('/api/candidates').then((r) => {
          if (!r.ok) throw new Error('API non dispo');
          return r.json();
        }),
        fetch('/api/stats/dashboard').then((r) => {
          if (!r.ok) throw new Error('API non dispo');
          return r.json();
        }),
        fetch('/api/alerts').then((r) => {
          if (!r.ok) throw new Error('API non dispo');
          return r.json();
        }),
        fetch('/api/polyvalence').then((r) => {
          if (!r.ok) throw new Error('API non dispo');
          return r.json();
        }),
      ]);

      if (candRes.status === 'fulfilled' && Array.isArray(candRes.value) && candRes.value.length > 0) {
        setCandidates(candRes.value);
      }
      if (statsRes.status === 'fulfilled' && statsRes.value && !statsRes.value.error) {
        setStats(statsRes.value);
      }
      if (alertsRes.status === 'fulfilled' && Array.isArray(alertsRes.value) && alertsRes.value.length > 0) {
        setAlerts(alertsRes.value);
      }
      if (polyRes.status === 'fulfilled' && Array.isArray(polyRes.value) && polyRes.value.length > 0) {
        setPolyvalenceMatrix(polyRes.value);
      }
    } catch (err) {
      // Graceful fallback to client-side localStorage state
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleResetLocalData = () => {
    try {
      localStorage.removeItem('onboarding_candidates');
      localStorage.removeItem('onboarding_alerts');
      localStorage.removeItem('onboarding_polyvalence');
      setCandidates(initialCandidates);
      setAlerts(initialAlerts);
      setPolyvalenceMatrix(initialPolyvalenceMatrix);
      showToast('Données réinitialisées aux valeurs initiales d usine.');
    } catch (e) {}
  };

  // --- Handlers with Full Offline / GitHub Pages Fallback ---
  const handleAddCandidate = async (data: Partial<Candidate>) => {
    try {
      const res = await fetch('/api/candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const created = await res.json();
        setCandidates((prev) => [created, ...prev]);
        showToast(`Recrue ${created.firstName} ${created.lastName} enregistrée avec succès.`);
        return;
      }
      throw new Error('API offline');
    } catch (e) {
      // Local fallback for GitHub Pages
      const newId = Date.now();
      const newCand: Candidate = {
        id: newId,
        firstName: data.firstName || 'Nouvelle',
        lastName: data.lastName || 'Recrue',
        cin: data.cin || `CIN${newId.toString().slice(-4)}`,
        phone: data.phone || '+212 6 00 00 00 00',
        address: data.address || 'Tanger Zone Industrielle',
        plantSite: data.plantSite || 'Site Manufacturing Alpha - Tanger',
        educationLevel: data.educationLevel || 'Bac+2 Technicien',
        testScore: data.testScore || 85,
        status: data.status || 'SELECTED',
        trainingSessionId: data.trainingSessionId || 1,
        dayInJourney: 1,
        createdAt: new Date().toISOString().slice(0, 10),
        welcomeKit: {
          id: newId + 100,
          candidateId: newId,
          vestGiven: false,
          blouseGiven: false,
          contractGiven: false,
          badgeGiven: false,
          lockerGiven: false,
          bookletGiven: false,
          ppeGiven: false,
        },
        transport: {
          id: newId + 200,
          candidateId: newId,
          lineName: 'Ligne 04 - Tanger Centre / Zone Franche',
          pickupPoint: 'Arrêt Place des Nations',
          schedule: '06:45',
          confirmed: true,
          incidents: [],
          travelTimeMin: 35,
        },
        attritionScores: [
          {
            id: newId + 300,
            candidateId: newId,
            score: 18,
            level: 'Faible',
            computedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
            factors: {
              absencesScore: 0,
              punctualityScore: 0,
              satisfactionScore: 0,
              schoolEvaluationScore: 0,
              productivityGapScore: 0,
              defectRateScore: 0,
              transportRiskScore: 10,
              welcomeKitDelayScore: 20,
              postComplexityScore: 0,
              explanation: ['Nouveau candidat : dossier en cours de constitution'],
            },
          },
        ],
      };
      setCandidates((prev) => [newCand, ...prev]);
      showToast(`Recrue ${newCand.firstName} ${newCand.lastName} ajoutée (mode autonome).`);
    }
  };

  const handleUpdateWelcomeKit = async (candidateId: number, kitData: Partial<WelcomeKit>) => {
    try {
      const res = await fetch(`/api/candidates/${candidateId}/welcome-kit`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(kitData),
      });
      if (res.ok) {
        const updated = await res.json();
        setCandidates((prev) =>
          prev.map((c) => (c.id === candidateId ? { ...c, welcomeKit: updated } : c))
        );
        showToast('Dotations Welcome Kit J1 mises à jour et émargées.');
        return;
      }
      throw new Error('API offline');
    } catch (e) {
      setCandidates((prev) =>
        prev.map((c) => {
          if (c.id !== candidateId) return c;
          const currentKit = c.welcomeKit || ({} as any);
          const updatedKit = { ...currentKit, ...kitData, signedAt: new Date().toISOString().replace('T', ' ').slice(0, 16) };
          return { ...c, welcomeKit: updatedKit };
        })
      );
      showToast('Welcome Kit mis à jour et validé.');
    }
  };

  const handleUpdateTransport = async (
    candidateId: number,
    transportData: Partial<TransportAssignment>
  ) => {
    try {
      const res = await fetch(`/api/candidates/${candidateId}/transport`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transportData),
      });
      if (res.ok) {
        const updated = await res.json();
        setCandidates((prev) =>
          prev.map((c) => (c.id === candidateId ? { ...c, transport: updated } : c))
        );
        showToast('Ligne et statut logistique J-1 mis à jour.');
        return;
      }
      throw new Error('API offline');
    } catch (e) {
      setCandidates((prev) =>
        prev.map((c) =>
          c.id === candidateId
            ? { ...c, transport: { ...(c.transport as any), ...transportData } }
            : c
        )
      );
      showToast('Transport mis à jour.');
    }
  };

  const handleAddTransportIncident = async (
    candidateId: number,
    incidentData: Partial<TransportIncident>
  ) => {
    try {
      const res = await fetch(`/api/candidates/${candidateId}/transport/incident`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(incidentData),
      });
      if (res.ok) {
        showToast('Incident de transport enregistré.');
        refreshData();
        return;
      }
      throw new Error('API offline');
    } catch (e) {
      const newInc: TransportIncident = {
        id: Date.now(),
        transportAssignmentId: candidateId,
        date: incidentData.date || new Date().toISOString().slice(0, 10),
        type: (incidentData.type as 'retard' | 'absence') || 'retard',
        notes: incidentData.notes || 'Incident signalé',
      };
      setCandidates((prev) =>
        prev.map((c) => {
          if (c.id !== candidateId) return c;
          const tr = c.transport || {
            id: Date.now(),
            candidateId,
            confirmed: true,
            incidents: [],
          };
          return {
            ...c,
            transport: { ...tr, incidents: [...(tr.incidents || []), newInc] } as any,
          };
        })
      );
      showToast('Incident de transport ajouté.');
    }
  };

  const handleAddAttendance = async (candidateId: number, data: Partial<Attendance>) => {
    try {
      const res = await fetch(`/api/candidates/${candidateId}/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        showToast('Pointage de présence enregistré.');
        refreshData();
        return;
      }
      throw new Error('API offline');
    } catch (e) {
      const newAtt: Attendance = {
        id: Date.now(),
        candidateId,
        date: data.date || new Date().toISOString().slice(0, 10),
        status: data.status || 'PRESENT',
        phase: data.phase || 'school',
        notes: data.notes || '',
      };
      setCandidates((prev) =>
        prev.map((c) =>
          c.id === candidateId
            ? { ...c, attendances: [...(c.attendances || []), newAtt] }
            : c
        )
      );
      showToast('Pointage de présence enregistré.');
    }
  };

  const handleAddEvaluation = async (candidateId: number, data: Partial<Evaluation>) => {
    try {
      const res = await fetch(`/api/candidates/${candidateId}/evaluation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        showToast('Évaluation de formation validée.');
        refreshData();
        return;
      }
      throw new Error('API offline');
    } catch (e) {
      const newEval: Evaluation = {
        id: Date.now(),
        candidateId,
        type: data.type || 'theory',
        quizScore: data.quizScore || 85,
        examScore: data.examScore || 85,
        practicalScore: data.practicalScore || 85,
        trainerValidation: data.trainerValidation !== undefined ? data.trainerValidation : true,
        date: data.date || new Date().toISOString().slice(0, 10),
        notes: data.notes || 'Validation geste & sécurité réussie',
      };
      setCandidates((prev) =>
        prev.map((c) =>
          c.id === candidateId
            ? { ...c, evaluations: [...(c.evaluations || []), newEval] }
            : c
        )
      );
      showToast('Évaluation enregistrée.');
    }
  };

  const handleUpdateProduction = async (
    candidateId: number,
    data: Partial<ProductionAssignment>
  ) => {
    try {
      const res = await fetch(`/api/candidates/${candidateId}/production`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const updated = await res.json();
        setCandidates((prev) =>
          prev.map((c) =>
            c.id === candidateId
              ? { ...c, status: 'IN_PRODUCTION', productionAssignment: updated }
              : c
          )
        );
        showToast('Affectation production & hiérarchie enregistrées.');
        return;
      }
      throw new Error('API offline');
    } catch (e) {
      setCandidates((prev) =>
        prev.map((c) =>
          c.id === candidateId
            ? {
                ...c,
                status: 'IN_PRODUCTION',
                productionAssignment: { ...(c.productionAssignment as any), ...data },
              }
            : c
        )
      );
      showToast('Affectation production enregistrée.');
    }
  };

  const handleAddLearningCurvePoint = async (
    candidateId: number,
    point: Partial<LearningCurvePoint>
  ) => {
    try {
      const res = await fetch(`/api/candidates/${candidateId}/learning-curve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(point),
      });
      if (res.ok) {
        showToast('Jalon Learning Curve et Carré Magique recalculés.');
        refreshData();
        return;
      }
      throw new Error('API offline');
    } catch (e) {
      const newPoint: LearningCurvePoint = {
        id: Date.now(),
        candidateId,
        date: point.date || new Date().toISOString().slice(0, 10),
        dayNumber: point.dayNumber || 10,
        productivity: point.productivity || 60,
        targetProductivity: point.targetProductivity || 60,
        quality: point.quality || 98,
        presence: point.presence !== undefined ? point.presence : true,
        discipline: point.discipline || 95,
        polyvalence: point.polyvalence || 1,
        qualification: point.qualification,
      };
      setCandidates((prev) =>
        prev.map((c) => {
          if (c.id !== candidateId) return c;
          const currentPoints = c.learningCurvePoints || [];
          return {
            ...c,
            learningCurvePoints: [...currentPoints, newPoint],
          };
        })
      );
      showToast('Jalon Learning Curve enregistré.');
    }
  };

  const handleAddPolyvalenceSkill = async (skill: Partial<PolyvalenceSkill>) => {
    try {
      const res = await fetch('/api/polyvalence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(skill),
      });
      if (res.ok) {
        const created = await res.json();
        setPolyvalenceMatrix((prev) => [...prev, created]);
        showToast('Qualification poste ajoutée à la matrice.');
        return;
      }
      throw new Error('API offline');
    } catch (e) {
      const cand = candidates.find((c) => c.id === skill.candidateId);
      const localSkill: PolyvalenceSkill = {
        id: Date.now(),
        candidateId: skill.candidateId || 1,
        candidateName: skill.candidateName || (cand ? `${cand.firstName} ${cand.lastName}` : 'Opérateur'),
        positionName: skill.positionName || 'Poste Assemblage',
        segment: skill.segment || 'Segment Cockpit',
        line: skill.line || 'Ligne Cockpit CK-01',
        masteryLevel: skill.masteryLevel || 2,
        isCriticalPost: skill.isCriticalPost || false,
        qualifiedAt: skill.qualifiedAt || new Date().toISOString().slice(0, 10),
      };
      setPolyvalenceMatrix((prev) => [...prev, localSkill]);
      showToast('Habilitation enregistrée dans la matrice.');
    }
  };

  const handleResolveAlert = async (alertId: number, resolvedBy: string) => {
    try {
      const res = await fetch(`/api/alerts/${alertId}/resolve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resolvedBy }),
      });
      if (res.ok) {
        const updated = await res.json();
        setAlerts((prev) => prev.map((a) => (a.id === alertId ? updated : a)));
        showToast('Alerte clôturée avec succès.');
        return;
      }
      throw new Error('API offline');
    } catch (e) {
      setAlerts((prev) =>
        prev.map((a) =>
          a.id === alertId
            ? { ...a, resolved: true, resolvedBy, resolvedAt: new Date().toISOString() }
            : a
        )
      );
      showToast('Alerte traitée.');
    }
  };

  const handleAddSurvey = async (candidateId: number, survey: Partial<Survey>) => {
    try {
      const res = await fetch(`/api/candidates/${candidateId}/surveys`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(survey),
      });
      if (res.ok) {
        showToast(`Enquête ${survey.milestone} enregistrée. Alertes & Attrition recalculés.`);
        refreshData();
        return;
      }
      throw new Error('API offline');
    } catch (e) {
      const newSurvey: Survey = {
        id: Date.now(),
        candidateId,
        milestone: (survey.milestone as SurveyMilestone) || 'J5_ECOLE',
        answers: survey.answers || {},
        satisfaction: survey.satisfaction || 80,
        notes: survey.notes || 'Enquête enregistrée',
        createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      };
      setCandidates((prev) =>
        prev.map((c) =>
          c.id === candidateId
            ? { ...c, surveys: [...(c.surveys || []), newSurvey] }
            : c
        )
      );
      showToast(`Enquête ${survey.milestone || 'J5'} enregistrée.`);
    }
  };

  const handleTriggerBatchCron = async () => {
    setIsCronRunning(true);
    try {
      const res = await fetch('/api/attrition/recalculate-all', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        showToast(
          `Batch Cron terminé : ${data.totalEvaluated} recrues évaluées, ${data.criticalCount} critiques.`
        );
        await refreshData();
        return;
      }
      throw new Error('API offline');
    } catch (e) {
      // Local calculation on client-side (GitHub Pages mode)
      const updatedCandidates = candidates.map((cand) => {
        const score = calculateAttritionScore(cand);
        return {
          ...cand,
          attritionScores: [score, ...(cand.attritionScores || [])],
        };
      });

      const newAlerts: Alert[] = [];
      updatedCandidates.forEach((c) => {
        const detected = detectCandidateAlerts(c);
        detected.forEach((d) => {
          const exists = alerts.some(
            (a) => a.candidateId === c.id && a.type === d.type && !a.resolved
          );
          if (!exists) {
            newAlerts.push({
              id: Date.now() + Math.floor(Math.random() * 1000),
              candidateId: c.id,
              candidateName: `${c.firstName} ${c.lastName}`,
              type: d.type as any,
              condition: d.condition,
              severity: d.severity as any,
              recipientRole: d.recipientRole as any,
              resolved: false,
              createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
            });
          }
        });
      });

      setCandidates(updatedCandidates);
      if (newAlerts.length > 0) {
        setAlerts((prev) => [...newAlerts, ...prev]);
      }
      const critCount = updatedCandidates.filter(
        (c) => c.attritionScores?.[0]?.level === 'Critique'
      ).length;

      showToast(
        `Batch Cron IA terminé : ${updatedCandidates.length} recrues évaluées, ${critCount} en risque critique.`
      );
    } finally {
      setIsCronRunning(false);
    }
  };

  const openAlertsCount = alerts.filter((a) => !a.resolved).length;
  const criticalAttritionCount = candidates.filter(
    (c) => c.attritionScores?.[0]?.level === 'Critique'
  ).length;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-800">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg border border-slate-700 flex items-center gap-3 text-xs animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <Header
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        openAlertsCount={openAlertsCount}
        onOpenAlerts={() => setActiveTab('alerts')}
        onOpenAiCopilot={() => setIsAiCopilotOpen(true)}
        onTriggerCron={handleTriggerBatchCron}
        isCronRunning={isCronRunning}
        onOpenDeploymentGuide={() => setIsDeploymentModalOpen(true)}
      />

      {/* Main Container with Navigation & Dynamic View */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-6 flex-1 space-y-6">
        {/* Navigation Tabs */}
        <Navigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
          openAlertsCount={openAlertsCount}
          criticalAttritionCount={criticalAttritionCount}
        />

        {/* View Router */}
        <main className="transition-opacity duration-200">
          {activeTab === 'dashboard' && (
            <DashboardView
              candidates={candidates}
              stats={stats}
              alerts={alerts}
              currentRole={currentRole}
              onNavigateToCandidate={() => {
                setActiveTab('candidates');
              }}
              onNavigateToTab={(tab) => {
                setActiveTab(tab as ActiveTab);
              }}
            />
          )}

          {activeTab === 'candidates' && (
            <CandidatesView
              candidates={candidates}
              trainingSessions={trainingSessions}
              onSelectCandidate={() => {
                setActiveTab('welcome_kit');
              }}
              onAddCandidate={handleAddCandidate}
            />
          )}

          {activeTab === 'welcome_kit' && (
            <WelcomeKitView
              candidates={candidates}
              onUpdateWelcomeKit={handleUpdateWelcomeKit}
            />
          )}

          {activeTab === 'transport' && (
            <TransportView
              candidates={candidates}
              onUpdateTransport={handleUpdateTransport}
              onAddIncident={handleAddTransportIncident}
            />
          )}

          {activeTab === 'school' && (
            <SchoolView
              candidates={candidates}
              trainingSessions={trainingSessions}
              onAddAttendance={handleAddAttendance}
              onAddEvaluation={handleAddEvaluation}
            />
          )}

          {activeTab === 'production' && (
            <ProductionView
              candidates={candidates}
              onUpdateProduction={handleUpdateProduction}
            />
          )}

          {activeTab === 'learning_curve' && (
            <LearningCurveView
              candidates={candidates}
              onAddLearningCurvePoint={handleAddLearningCurvePoint}
            />
          )}

          {activeTab === 'polyvalence' && (
            <PolyvalenceView
              candidates={candidates}
              polyvalenceMatrix={polyvalenceMatrix}
              onAddSkill={handleAddPolyvalenceSkill}
            />
          )}

          {activeTab === 'attrition' && (
            <AttritionView
              candidates={candidates}
              onTriggerBatchCron={handleTriggerBatchCron}
              isCronRunning={isCronRunning}
            />
          )}

          {activeTab === 'alerts' && (
            <AlertsView
              alerts={alerts}
              currentRole={currentRole}
              onResolveAlert={handleResolveAlert}
            />
          )}

          {activeTab === 'surveys' && (
            <SurveysView
              candidates={candidates}
              onAddSurvey={handleAddSurvey}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsView
              candidates={candidates}
              alerts={alerts}
            />
          )}
        </main>
      </div>

      {/* AI Copilot Interactive Modal */}
      <AiCopilotModal
        isOpen={isAiCopilotOpen}
        onClose={() => setIsAiCopilotOpen(false)}
        candidates={candidates}
        alerts={alerts}
        currentRole={currentRole}
      />

      {/* GitHub Actions & Pages Deployment Modal */}
      <DeploymentGuideModal
        isOpen={isDeploymentModalOpen}
        onClose={() => setIsDeploymentModalOpen(false)}
        onResetData={handleResetLocalData}
      />
    </div>
  );
}
