import { TestResultLog, TopicReviewRecord, FailedQuestionRecord } from '../types/oposicion';

export interface MilestoneBadge {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'Tests' | 'LGT' | 'Constancia' | 'Práctica';
  currentProgress: number;
  maxProgress: number;
  progressPercent: number;
  isUnlocked: boolean;
  rewardText: string;
}

export function computeMilestones(params: {
  testHistory: TestResultLog[];
  totalAnswered: number;
  reviewRecords: Record<string, TopicReviewRecord>;
  failedQuestions: FailedQuestionRecord[];
  totalStudiedMinutes: number;
}): MilestoneBadge[] {
  const { testHistory, totalAnswered, reviewRecords, failedQuestions, totalStudiedMinutes } = params;

  // 1. Primer Paso hacia la Plaza
  const testsCompleted = testHistory.length;
  const firstStepUnlocked = testsCompleted >= 1;

  // 2. Maratoniano de Tests (100 preguntas)
  const marathonerProgress = Math.min(100, totalAnswered);
  const marathonerUnlocked = totalAnswered >= 100;

  // 3. Experto en LGT (Nota >= 75% en al menos 1 test)
  const maxScore = testHistory.reduce((max, t) => Math.max(max, t.percentageScore), 0);
  const lgtExpertUnlocked = maxScore >= 75;

  // 4. Simulacro Real C2 Superado (Haber completado un test de 50 o 80 preguntas con nota >= 5)
  const bigTestPassed = testHistory.some((t) => t.totalQuestions >= 50 && t.percentageScore >= 50);

  // 5. Precisión de Inspector (Test con 0 fallos)
  const zeroFailTest = testHistory.some((t) => t.failed === 0 && t.correct >= 10);

  // 6. Disciplina de Estudio Pomodoro (60 minutos de estudio)
  const studyMinsProgress = Math.min(60, totalStudiedMinutes);
  const pomodoroUnlocked = totalStudiedMinutes >= 60;

  // 7. Vencedor de la Curva del Olvido (3 o más temas con 2+ tests o etapa avanzada)
  const consolidatedTopics = Object.values(reviewRecords).filter((r) => r.reviewStage >= 2 || r.totalTestsCompleted >= 2).length;
  const ebbinghausUnlocked = consolidatedTopics >= 2;

  // 8. Rescatador de Fallos (Haber acumulado y trabajado en el cuaderno de fallos)
  const errorNotebookWorked = testHistory.some((t) => t.topicTitle.toLowerCase().includes('fallo') || t.topicTitle.toLowerCase().includes('rescate')) || failedQuestions.length > 0;

  return [
    {
      id: 'first_step',
      title: 'Primer Paso hacia la Plaza',
      description: 'Completa tu primer simulacro o test de evaluación oficial.',
      icon: '🏁',
      category: 'Tests',
      currentProgress: Math.min(1, testsCompleted),
      maxProgress: 1,
      progressPercent: firstStepUnlocked ? 100 : 0,
      isUnlocked: firstStepUnlocked,
      rewardText: '+5 Pts Motivación',
    },
    {
      id: 'test_marathoner',
      title: 'Maratoniano de Tests',
      description: 'Responde a más de 100 preguntas tipo test con baremo oficial AEAT.',
      icon: '🏃',
      category: 'Tests',
      currentProgress: marathonerProgress,
      maxProgress: 100,
      progressPercent: Math.round((marathonerProgress / 100) * 100),
      isUnlocked: marathonerUnlocked,
      rewardText: 'Fondo de Examen',
    },
    {
      id: 'lgt_expert',
      title: 'Experto en LGT (Ley 58/2003)',
      description: 'Supera el 75% de puntuación neta en un test de materias tributarias.',
      icon: '⚖️',
      category: 'LGT',
      currentProgress: Math.min(75, Math.round(maxScore)),
      maxProgress: 75,
      progressPercent: lgtExpertUnlocked ? 100 : Math.round((maxScore / 75) * 100),
      isUnlocked: lgtExpertUnlocked,
      rewardText: 'Rigor Tributario',
    },
    {
      id: 'c2_simulator',
      title: 'Simulacro C2 Superado',
      description: 'Aprueba un simulacro medio o completo (50 u 80 preguntas) con nota de corte.',
      icon: '🎯',
      category: 'Tests',
      currentProgress: bigTestPassed ? 1 : 0,
      maxProgress: 1,
      progressPercent: bigTestPassed ? 100 : 0,
      isUnlocked: bigTestPassed,
      rewardText: 'Nivel Noviembre',
    },
    {
      id: 'flawless_inspector',
      title: 'Precisión de Inspector',
      description: 'Completa una batería de al menos 10 preguntas sin cometer ningún fallo.',
      icon: '🛡️',
      category: 'Práctica',
      currentProgress: zeroFailTest ? 1 : 0,
      maxProgress: 1,
      progressPercent: zeroFailTest ? 100 : 0,
      isUnlocked: zeroFailTest,
      rewardText: 'Cero Penalización',
    },
    {
      id: 'pomodoro_scholar',
      title: 'Disciplina Pomodoro',
      description: 'Acumula más de 60 minutos de estudio concentrado con el temporizador.',
      icon: '⌛',
      category: 'Constancia',
      currentProgress: studyMinsProgress,
      maxProgress: 60,
      progressPercent: Math.round((studyMinsProgress / 60) * 100),
      isUnlocked: pomodoroUnlocked,
      rewardText: 'Hábito de Éxito',
    },
    {
      id: 'ebbinghaus_hero',
      title: 'Vencedor del Olvido',
      description: 'Consolida al menos 2 temas en la Curva de Ebbinghaus con repasos espaciados.',
      icon: '🧠',
      category: 'Constancia',
      currentProgress: Math.min(2, consolidatedTopics),
      maxProgress: 2,
      progressPercent: Math.round((Math.min(2, consolidatedTopics) / 2) * 100),
      isUnlocked: ebbinghausUnlocked,
      rewardText: 'Fijación Permanente',
    },
    {
      id: 'error_notebook',
      title: 'Cazador de Fallos',
      description: 'Trabaja con el Cuaderno de Fallos para convertir puntos débiles en aciertos.',
      icon: '❌',
      category: 'Práctica',
      currentProgress: errorNotebookWorked ? 1 : 0,
      maxProgress: 1,
      progressPercent: errorNotebookWorked ? 100 : 0,
      isUnlocked: errorNotebookWorked,
      rewardText: 'Blindaje de Errores',
    },
  ];
}
