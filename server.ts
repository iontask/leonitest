import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import {
  INITIAL_CANDIDATES,
  INITIAL_ALERTS,
  INITIAL_POLYVALENCE_MATRIX,
  INITIAL_TRAINING_SESSIONS,
} from './src/data/seedData';
import { Candidate, Alert, PolyvalenceSkill, DashboardStats } from './src/types';
import { calculateAttritionScore, detectCandidateAlerts } from './src/utils/attritionEngine';

dotenv.config();

let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    try {
      aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    } catch (e) {
      console.error('Failed to initialize GoogleGenAI:', e);
    }
  }
  return aiClient;
}

// In-Memory Database initialized with seed data
let candidates: Candidate[] = JSON.parse(JSON.stringify(INITIAL_CANDIDATES));
let alerts: Alert[] = JSON.parse(JSON.stringify(INITIAL_ALERTS));
let polyvalenceMatrix: PolyvalenceSkill[] = JSON.parse(JSON.stringify(INITIAL_POLYVALENCE_MATRIX));
const trainingSessions = JSON.parse(JSON.stringify(INITIAL_TRAINING_SESSIONS));

// Recalculate attrition scores on startup
candidates.forEach((c) => {
  const computed = calculateAttritionScore(c);
  c.attritionScores = [computed];
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // --- API ROUTES ---

  // Healthcheck
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Training Sessions
  app.get('/api/training-sessions', (req: Request, res: Response) => {
    res.json(trainingSessions);
  });

  // Candidates CRUD
  app.get('/api/candidates', (req: Request, res: Response) => {
    res.json(candidates);
  });

  app.get('/api/candidates/:id', (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const candidate = candidates.find((c) => c.id === id);
    if (!candidate) {
      return res.status(404).json({ error: 'Candidat introuvable' });
    }
    res.json(candidate);
  });

  app.post('/api/candidates', (req: Request, res: Response) => {
    const data = req.body;
    const newId = candidates.length > 0 ? Math.max(...candidates.map((c) => c.id)) + 1 : 1;

    const newCandidate: Candidate = {
      id: newId,
      firstName: data.firstName || 'Nouveau',
      lastName: data.lastName || 'Candidat',
      cin: data.cin || `CIN${newId}`,
      phone: data.phone || '+212 6 00 00 00 00',
      address: data.address || 'Tanger Zone Industrielle',
      plantSite: data.plantSite || 'Site Manufacturing Alpha - Tanger',
      educationLevel: data.educationLevel || 'Bac+2',
      testScore: data.testScore || 80,
      status: data.status || 'PENDING',
      trainingSessionId: data.trainingSessionId || 1,
      createdAt: new Date().toISOString().slice(0, 10),
      dayInJourney: 1,
      welcomeKit: {
        id: newId * 100 + 1,
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
        id: newId * 100 + 2,
        candidateId: newId,
        lineName: data.transportLine || 'Ligne 01 - Tanger Centre',
        pickupPoint: data.pickupPoint || 'Arrêt Principal',
        schedule: '06:15 Shift A',
        distanceKm: 12,
        travelTimeMin: 25,
        confirmed: false,
        incidents: [],
      },
      attendances: [],
      evaluations: [],
      learningCurvePoints: [],
      surveys: [],
    };

    const initialScore = calculateAttritionScore(newCandidate);
    newCandidate.attritionScores = [initialScore];

    candidates.unshift(newCandidate);
    res.status(201).json(newCandidate);
  });

  app.put('/api/candidates/:id', (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const idx = candidates.findIndex((c) => c.id === id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Candidat introuvable' });
    }

    candidates[idx] = { ...candidates[idx], ...req.body };
    const updatedScore = calculateAttritionScore(candidates[idx]);
    candidates[idx].attritionScores = [updatedScore];

    res.json(candidates[idx]);
  });

  // Welcome Kit update & signature
  app.put('/api/candidates/:id/welcome-kit', (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const candidate = candidates.find((c) => c.id === id);
    if (!candidate) {
      return res.status(404).json({ error: 'Candidat introuvable' });
    }

    candidate.welcomeKit = {
      ...(candidate.welcomeKit || {
        id: id * 100 + 1,
        candidateId: id,
        vestGiven: false,
        blouseGiven: false,
        contractGiven: false,
        badgeGiven: false,
        lockerGiven: false,
        bookletGiven: false,
        ppeGiven: false,
      }),
      ...req.body,
    };

    // Recompute score & alerts
    candidate.attritionScores = [calculateAttritionScore(candidate)];
    const newAlerts = detectCandidateAlerts(candidate);
    newAlerts.forEach((na) => {
      if (!alerts.some((a) => a.candidateId === na.candidateId && a.type === na.type && !a.resolved)) {
        alerts.unshift(na);
      }
    });

    res.json(candidate.welcomeKit);
  });

  // Transport Assignment & incidents
  app.put('/api/candidates/:id/transport', (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const candidate = candidates.find((c) => c.id === id);
    if (!candidate) {
      return res.status(404).json({ error: 'Candidat introuvable' });
    }

    candidate.transport = {
      ...(candidate.transport || {
        id: id * 100 + 2,
        candidateId: id,
        confirmed: false,
        incidents: [],
      }),
      ...req.body,
    };

    candidate.attritionScores = [calculateAttritionScore(candidate)];
    res.json(candidate.transport);
  });

  app.post('/api/candidates/:id/transport/incident', (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const candidate = candidates.find((c) => c.id === id);
    if (!candidate || !candidate.transport) {
      return res.status(404).json({ error: 'Candidat ou transport introuvable' });
    }

    const newIncident = {
      id: Date.now(),
      transportAssignmentId: candidate.transport.id,
      type: req.body.type || 'retard',
      date: req.body.date || new Date().toISOString().slice(0, 10),
      notes: req.body.notes || 'Incident navette',
    };

    candidate.transport.incidents.push(newIncident);
    candidate.attritionScores = [calculateAttritionScore(candidate)];

    // Check alert trigger
    const newAlerts = detectCandidateAlerts(candidate);
    newAlerts.forEach((na) => {
      if (!alerts.some((a) => a.candidateId === na.candidateId && a.type === na.type && !a.resolved)) {
        alerts.unshift(na);
      }
    });

    res.status(201).json(newIncident);
  });

  // Attendance pointage
  app.post('/api/candidates/:id/attendance', (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const candidate = candidates.find((c) => c.id === id);
    if (!candidate) {
      return res.status(404).json({ error: 'Candidat introuvable' });
    }

    if (!candidate.attendances) candidate.attendances = [];

    const newAttendance = {
      id: Date.now(),
      candidateId: id,
      date: req.body.date || new Date().toISOString().slice(0, 10),
      status: req.body.status || 'PRESENT',
      phase: req.body.phase || (candidate.status === 'IN_TRAINING' ? 'school' : 'production'),
      notes: req.body.notes,
    };

    candidate.attendances.push(newAttendance);
    candidate.attritionScores = [calculateAttritionScore(candidate)];

    const newAlerts = detectCandidateAlerts(candidate);
    newAlerts.forEach((na) => {
      if (!alerts.some((a) => a.candidateId === na.candidateId && a.type === na.type && !a.resolved)) {
        alerts.unshift(na);
      }
    });

    res.status(201).json(newAttendance);
  });

  // Evaluations (School Theory & Practice)
  app.post('/api/candidates/:id/evaluations', (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const candidate = candidates.find((c) => c.id === id);
    if (!candidate) {
      return res.status(404).json({ error: 'Candidat introuvable' });
    }

    if (!candidate.evaluations) candidate.evaluations = [];

    const newEval = {
      id: Date.now(),
      candidateId: id,
      type: req.body.type || 'theory',
      quizScore: req.body.quizScore,
      examScore: req.body.examScore,
      practicalScore: req.body.practicalScore,
      trainerValidation: req.body.trainerValidation ?? true,
      date: req.body.date || new Date().toISOString().slice(0, 10),
      notes: req.body.notes,
    };

    candidate.evaluations.push(newEval);
    candidate.attritionScores = [calculateAttritionScore(candidate)];

    res.status(201).json(newEval);
  });

  // Production Assignment
  app.put('/api/candidates/:id/production', (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const candidate = candidates.find((c) => c.id === id);
    if (!candidate) {
      return res.status(404).json({ error: 'Candidat introuvable' });
    }

    candidate.productionAssignment = {
      ...(candidate.productionAssignment || {
        id: id * 100 + 3,
        candidateId: id,
        isCritical: false,
        isBottleneck: false,
      }),
      ...req.body,
    };

    candidate.status = 'IN_PRODUCTION';
    candidate.attritionScores = [calculateAttritionScore(candidate)];

    res.json(candidate.productionAssignment);
  });

  // Surveys (J5_ECOLE, J5_TERRAIN, J28, J90)
  app.post('/api/candidates/:id/surveys', (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const candidate = candidates.find((c) => c.id === id);
    if (!candidate) {
      return res.status(404).json({ error: 'Candidat introuvable' });
    }

    if (!candidate.surveys) candidate.surveys = [];

    const newSurvey = {
      id: Date.now(),
      candidateId: id,
      milestone: req.body.milestone || 'J5_TERRAIN',
      satisfaction: req.body.satisfaction || 80,
      answers: req.body.answers || {},
      notes: req.body.notes,
      createdAt: new Date().toISOString().slice(0, 10),
    };

    candidate.surveys.push(newSurvey);
    candidate.attritionScores = [calculateAttritionScore(candidate)];

    const newAlerts = detectCandidateAlerts(candidate);
    newAlerts.forEach((na) => {
      if (!alerts.some((a) => a.candidateId === na.candidateId && a.type === na.type && !a.resolved)) {
        alerts.unshift(na);
      }
    });

    res.status(201).json(newSurvey);
  });

  // Learning Curve Point
  app.post('/api/candidates/:id/learning-curve', (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const candidate = candidates.find((c) => c.id === id);
    if (!candidate) {
      return res.status(404).json({ error: 'Candidat introuvable' });
    }

    if (!candidate.learningCurvePoints) candidate.learningCurvePoints = [];

    const nextDay = candidate.learningCurvePoints.length + 1;
    const newPoint = {
      id: Date.now(),
      candidateId: id,
      date: new Date().toISOString().slice(0, 10),
      dayNumber: req.body.dayNumber || nextDay,
      productivity: req.body.productivity || 60,
      targetProductivity: req.body.targetProductivity || 70,
      quality: req.body.quality || 98.0,
      presence: req.body.presence ?? true,
      discipline: req.body.discipline || 95,
      polyvalence: req.body.polyvalence || 1,
      qualification: req.body.qualification,
    };

    candidate.learningCurvePoints.push(newPoint);

    // Update Carré Magique
    const pts = candidate.learningCurvePoints;
    const avgProd = pts.reduce((a, b) => a + b.productivity, 0) / pts.length;
    const avgQual = pts.reduce((a, b) => a + b.quality, 0) / pts.length;
    const avgDisc = pts.reduce((a, b) => a + b.discipline, 0) / pts.length;
    const maxPoly = Math.max(...pts.map((p) => p.polyvalence), 1);

    const magicStatus =
      avgQual >= 95 && avgProd >= 75 && avgDisc >= 90
        ? 'GREEN'
        : avgQual < 90 || avgProd < 50
        ? 'RED'
        : 'YELLOW';

    candidate.magicSquare = {
      candidateId: id,
      qualityScore: Math.round(avgQual),
      productivityScore: Math.round(avgProd),
      disciplineScore: Math.round(avgDisc),
      polyvalenceScore: Math.min(100, maxPoly * 30),
      status: magicStatus,
    };

    candidate.attritionScores = [calculateAttritionScore(candidate)];

    const newAlerts = detectCandidateAlerts(candidate);
    newAlerts.forEach((na) => {
      if (!alerts.some((a) => a.candidateId === na.candidateId && a.type === na.type && !a.resolved)) {
        alerts.unshift(na);
      }
    });

    res.status(201).json(newPoint);
  });

  // Polyvalence Matrix
  app.get('/api/polyvalence', (req: Request, res: Response) => {
    res.json(polyvalenceMatrix);
  });

  app.post('/api/polyvalence', (req: Request, res: Response) => {
    const newSkill: PolyvalenceSkill = {
      id: Date.now(),
      candidateId: req.body.candidateId,
      candidateName: req.body.candidateName,
      positionName: req.body.positionName,
      segment: req.body.segment || 'Segment Principal',
      line: req.body.line || 'Ligne 01',
      masteryLevel: req.body.masteryLevel || 1,
      isCriticalPost: req.body.isCriticalPost || false,
      qualifiedAt: req.body.qualifiedAt,
      targetDate: req.body.targetDate,
    };
    polyvalenceMatrix.push(newSkill);
    res.status(201).json(newSkill);
  });

  // Alerts API
  app.get('/api/alerts', (req: Request, res: Response) => {
    const role = req.query.role as string;
    if (role && role !== 'ADMIN' && role !== 'PLANT_MANAGER') {
      const filtered = alerts.filter((a) => a.recipientRole === role || a.recipientRole === 'PLANT_MANAGER');
      return res.json(filtered);
    }
    res.json(alerts);
  });

  app.put('/api/alerts/:id/resolve', (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const alert = alerts.find((a) => a.id === id);
    if (!alert) {
      return res.status(404).json({ error: 'Alerte introuvable' });
    }
    alert.resolved = true;
    alert.resolvedAt = new Date().toISOString().replace('T', ' ').slice(0, 16);
    alert.resolvedBy = req.body.resolvedBy || 'Responsable RH';
    res.json(alert);
  });

  // Batch Job: Recalculate all attrition scores & trigger alerts
  app.post('/api/attrition/recalculate-all', (req: Request, res: Response) => {
    let criticalCount = 0;
    let alertsCreated = 0;

    candidates.forEach((candidate) => {
      const scoreObj = calculateAttritionScore(candidate);
      candidate.attritionScores = [scoreObj];
      if (scoreObj.level === 'Critique') criticalCount++;

      const detected = detectCandidateAlerts(candidate);
      detected.forEach((na) => {
        if (!alerts.some((a) => a.candidateId === na.candidateId && a.type === na.type && !a.resolved)) {
          alerts.unshift(na);
          alertsCreated++;
        }
      });
    });

    res.json({
      message: 'Scoring quotidien recalculé avec succès (BullMQ Cron Job)',
      totalEvaluated: candidates.length,
      criticalCount,
      alertsCreated,
      timestamp: new Date().toISOString(),
    });
  });

  // Dashboard Stats
  app.get('/api/stats/dashboard', (req: Request, res: Response) => {
    const totalCandidates = candidates.length;
    const activeInTraining = candidates.filter((c) => c.status === 'IN_TRAINING').length;
    const activeInProduction = candidates.filter((c) => c.status === 'IN_PRODUCTION').length;

    // Readiness score J1
    const wkScores = candidates.map((c) => {
      const wk = c.welcomeKit;
      if (!wk) return 0;
      let count = 0;
      if (wk.vestGiven) count++;
      if (wk.blouseGiven) count++;
      if (wk.contractGiven) count++;
      if (wk.badgeGiven) count++;
      if (wk.lockerGiven) count++;
      if (wk.bookletGiven) count++;
      if (wk.ppeGiven) count++;
      return (count / 7) * 100;
    });
    const readinessScoreJ1 = Math.round(
      wkScores.length ? wkScores.reduce((a, b) => a + b, 0) / wkScores.length : 100
    );

    // Attrition distribution
    let criticalAttritionCount = 0;
    let mediumAttritionCount = 0;
    let lowAttritionCount = 0;
    candidates.forEach((c) => {
      const sc = c.attritionScores?.[0]?.level || 'Faible';
      if (sc === 'Critique') criticalAttritionCount++;
      else if (sc === 'Moyen') mediumAttritionCount++;
      else lowAttritionCount++;
    });

    const openAlertsCount = alerts.filter((a) => !a.resolved).length;

    const stats: DashboardStats = {
      totalCandidates,
      activeInTraining,
      activeInProduction,
      retentionRate90Days: 91.5, // Benchmark manufacturing
      earlyTurnover5Weeks: 4.8,
      readinessScoreJ1,
      avgSchoolSuccessRate: 94.2,
      avgQualityFPY: 97.4,
      criticalAttritionCount,
      mediumAttritionCount,
      lowAttritionCount,
      openAlertsCount,
    };

    res.json(stats);
  });

  // Export Power BI Endpoint (Module 14 & 15)
  app.get('/api/export/powerbi', (req: Request, res: Response) => {
    const dataset = candidates.map((c) => {
      const latestScore = c.attritionScores?.[0];
      const latestLC = c.learningCurvePoints?.[c.learningCurvePoints.length - 1];
      const latestSurvey = c.surveys?.[c.surveys.length - 1];
      return {
        CandidateID: c.id,
        FullName: `${c.firstName} ${c.lastName}`,
        CIN: c.cin,
        Status: c.status,
        PlantSite: c.plantSite,
        DayInJourney: c.dayInJourney,
        WelcomeKitCompleted: c.welcomeKit
          ? c.welcomeKit.vestGiven &&
            c.welcomeKit.blouseGiven &&
            c.welcomeKit.contractGiven &&
            c.welcomeKit.badgeGiven &&
            c.welcomeKit.lockerGiven &&
            c.welcomeKit.ppeGiven
          : false,
        TransportLine: c.transport?.lineName || 'Non assigné',
        TransportIncidentsCount: c.transport?.incidents?.length || 0,
        CurrentSegment: c.productionAssignment?.segment || 'École',
        CurrentLine: c.productionAssignment?.line || 'École',
        CurrentShift: c.productionAssignment?.shift || 'N/A',
        IsCriticalPost: c.productionAssignment?.isCritical || false,
        IsBottleneckPost: c.productionAssignment?.isBottleneck || false,
        LatestProductivityPct: latestLC?.productivity || null,
        LatestQualityFPY: latestLC?.quality || null,
        MagicSquareStatus: c.magicSquare?.status || 'N/A',
        AttritionRiskScore: latestScore?.score || 0,
        AttritionRiskLevel: latestScore?.level || 'Faible',
        LatestSatisfactionPct: latestSurvey?.satisfaction || null,
        ExportTimestamp: new Date().toISOString(),
      };
    });

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="onboarding_powerbi_dataset.json"');
    res.json({
      meta: {
        datasetName: 'Manufacturing_Onboarding_90Days',
        version: '1.0',
        exportedAt: new Date().toISOString(),
        recordCount: dataset.length,
      },
      data: dataset,
    });
  });

  // Automated Reports Generator (Quotidien, Hebdomadaire, Mensuel, Trimestriel)
  app.post('/api/reports/generate', (req: Request, res: Response) => {
    const { frequency = 'Quotidien' } = req.body;
    const nowStr = new Date().toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    let title = `Rapport Quotidien Onboarding — ${nowStr}`;
    let focus = 'Présences, pointages shifts, alertes d attrition critiques et satisfaction J+5.';
    let recommendations = [
      'Traiter les 2 alertes critiques RH concernant Fatima-Zahra Chraibi (satisfaction 52% et incident transport).',
      'Finaliser la dotation EPI de Salma Berrada (J1) avant son entrée en atelier pratique.',
    ];

    if (frequency === 'Hebdomadaire') {
      title = `Rapport Hebdomadaire Performance & Learning Curve — Semaine 36`;
      focus = 'Progression des cohortes école, trajectoires J1-J28 et analyse des écarts de cadence.';
      recommendations = [
        'Affecter un tuteur jumper sur la ligne CK-01 (cockpit) pour accompagner les postes à haute complexité.',
        'Valider la session école de la cohorte Assemblage Cockpit #2026-09 prévue pour le 02/09.',
      ];
    } else if (frequency === 'Mensuel') {
      title = `Rapport Mensuel Rétention & Turnover 90 Jours — Août 2026`;
      focus = 'Bilan de rétention des 5 premières semaines, stabilité des shifts et efficience des écoles.';
      recommendations = [
        'Le taux de rétention à 90 jours se maintient à 91.5% (supérieur à l objectif de 88%).',
        'Étendre les lignes de transport vers la zone Sud pour réduire les temps de trajet moyens.',
      ];
    } else if (frequency === 'Trimestriel') {
      title = `Bilan Trimestriel ROI Onboarding & Écoles Internes — Q3 2026`;
      focus = 'Coût par recrue intégrée, retour sur investissement de la digitalisation et polyvalence.';
      recommendations = [
        'Suppression réussie de 100% du papier et d Excel sur le parcours d accueil J1 et les fiches suiveuses.',
        'La matrice de polyvalence atteint 2.1 postes par opérateur qualifié à J60.',
      ];
    }

    res.json({
      title,
      frequency,
      generatedAt: new Date().toISOString(),
      plantSite: 'Site Manufacturing Alpha',
      author: 'Plateforme IA Onboarding Manufacturing',
      summary: {
        totalActiveCandidates: candidates.length,
        retentionRate: '91.5%',
        earlyTurnoverRate: '4.8%',
        openAlerts: alerts.filter((a) => !a.resolved).length,
      },
      focus,
      recommendations,
    });
  });

  // Gemini AI: Deep candidate turnover risk analysis
  app.post('/api/ai/analyze-candidate', async (req: Request, res: Response) => {
    const { candidateId } = req.body;
    const candidate = candidates.find((c) => c.id === candidateId);

    if (!candidate) {
      return res.status(404).json({ error: 'Candidat introuvable' });
    }

    const ai = getGenAI();
    if (!ai) {
      // Return heuristic synthesis when GEMINI_API_KEY is not configured
      const score = candidate.attritionScores?.[0] || calculateAttritionScore(candidate);
      return res.json({
        analysis: `[Mode Synthèse IA Industrielle] Profil ${candidate.firstName} ${candidate.lastName} (Jour ${candidate.dayInJourney}/90). Risque ${score.level} (${score.score}%). Principaux facteurs : ${score.factors.explanation.join(' ; ')}.`,
        actionPlan: score.aiActionPlan || [
          'Entretien RH prioritaire',
          'Vérification ergonomie poste',
          'Point transport navette',
        ],
        source: 'heuristic',
      });
    }

    try {
      const prompt = `Tu es un Directeur des Ressources Humaines et Expert Lean Manufacturing spécialisé dans l'onboarding en usine automobile (câblage, assemblage).
Analyse le profil de cette recrue en période d'intégration (90 jours) et fournis :
1. Une analyse clinique concise des causes racines de son risque d'abandon/désistement.
2. Un plan d'action d'urgence en 3 actions concrètes pour le Hancho, le RH et le Formateur.

Données de la recrue :
- Nom : ${candidate.firstName} ${candidate.lastName}
- Jalon : Jour ${candidate.dayInJourney} sur 90
- Statut : ${candidate.status}
- Welcome Kit J1 : ${JSON.stringify(candidate.welcomeKit)}
- Transport : ${JSON.stringify(candidate.transport)}
- Présence & Absences : ${JSON.stringify(candidate.attendances)}
- Évaluations École : ${JSON.stringify(candidate.evaluations)}
- Affectation : ${JSON.stringify(candidate.productionAssignment)}
- Learning Curve : ${JSON.stringify(candidate.learningCurvePoints)}
- Enquêtes de satisfaction : ${JSON.stringify(candidate.surveys)}

Réponds en français, avec un style professionnel et structuré, orienté terrain usine (jargon manufacturing adapté : Hancho, 5S, FPY, takt time, bienveillance).`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      const text = response.text || 'Analyse non disponible.';

      res.json({
        analysis: text,
        source: 'gemini-3.8-flash',
      });
    } catch (err: any) {
      console.error('Gemini API error:', err);
      const score = candidate.attritionScores?.[0] || calculateAttritionScore(candidate);
      res.json({
        analysis: `[Synthèse Règles Métier] Risque calculé : ${score.level} (${score.score}%). Facteurs clés : ${score.factors.explanation.join(', ')}.`,
        actionPlan: score.aiActionPlan,
        source: 'heuristic_fallback',
      });
    }
  });

  // Gemini AI: Assistant RH & Manufacturing Copilot
  app.post('/api/ai/assistant', async (req: Request, res: Response) => {
    const { message, role = 'RH' } = req.body;
    const ai = getGenAI();

    const contextData = {
      totalCandidates: candidates.length,
      criticalCandidates: candidates
        .filter((c) => c.attritionScores?.[0]?.level === 'Critique')
        .map((c) => ({
          name: `${c.firstName} ${c.lastName}`,
          score: c.attritionScores?.[0]?.score,
          reasons: c.attritionScores?.[0]?.factors?.explanation,
          line: c.productionAssignment?.line,
        })),
      openAlerts: alerts.filter((a) => !a.resolved),
    };

    if (!ai) {
      return res.json({
        reply: `[Assistant IA Usine - Mode local] En tant que rôle ${role}, vous suivez ${candidates.length} nouvelles recrues. Il y a actuellement ${contextData.criticalCandidates.length} profil(s) en alerte critique (ex: ${contextData.criticalCandidates.map((c) => c.name).join(', ') || 'aucun'}). Pour activer le plein potentiel conversationnel Gemini, vérifiez la clé GEMINI_API_KEY.`,
      });
    }

    try {
      const prompt = `Tu es l'assistant IA intégré de la plateforme de digitalisation onboarding manufacturing (secteur automobile / câblage industriel).
L'utilisateur est connecté sous le rôle : "${role}".
Voici le contexte temps réel de l'usine :
${JSON.stringify(contextData, null, 2)}

Question de l'utilisateur :
"${message}"

Réponds de manière précise, bienveillante et orientée action opérationnelle (production, rétention, management de proximité). Sois concis.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      res.json({ reply: response.text || 'Pas de réponse.' });
    } catch (err: any) {
      res.json({
        reply: `L'assistant IA a détecté ${contextData.criticalCandidates.length} situation(s) critique(s) nécessitant une intervention immédiate de l'équipe ${role}.`,
      });
    }
  });

  // --- Vite Middleware (Development) / Static Files (Production) ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Plateforme IA Onboarding running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting server:', err);
});
