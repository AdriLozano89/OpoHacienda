import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { BottomNavBar } from './components/BottomNavBar';
import { TopBar } from './components/TopBar';
import { ConfirmationProtocol } from './components/ConfirmationProtocol';
import { UploadSection } from './components/UploadSection';
import { SummaryTab } from './components/SummaryTab';
import { TestTab } from './components/TestTab';
import { FlashcardsTab } from './components/FlashcardsTab';
import { TrapsTab } from './components/TrapsTab';
import { ForgettingCurvePlanner } from './components/ForgettingCurvePlanner';
import { CuadernoDeFallosModal } from './components/CuadernoDeFallosModal';
import { TestFilterModal } from './components/TestFilterModal';
import { PreparadorChatModal } from './components/PreparadorChatModal';
import { PracticalCasesTab } from './components/PracticalCasesTab';
import { LGTCalculatorTab } from './components/LGTCalculatorTab';
import { PerformanceDashboard } from './components/PerformanceDashboard';
import { OfflineIndicator } from './components/OfflineIndicator';
import { OFFICIAL_TOPICS } from './data/officialTopics';
import { 
  CompleteTopicPackage, 
  OposicionLevel, 
  TestData, 
  FailedQuestionRecord, 
  TopicReviewRecord, 
  QuestionItem,
  ActiveView,
  TestResultLog
} from './types/oposicion';
import { useTheme } from './hooks/useTheme';
import { useDensity } from './hooks/useDensity';
import { usePomodoro } from './hooks/usePomodoro';

export default function App() {
  useTheme();
  const { density, toggleDensity, isClean } = useDensity();
  const [currentLevel, setCurrentLevel] = useState<OposicionLevel>('C2');
  const [currentView, setCurrentView] = useState<ActiveView>('library');

  // Library of topics (official + user uploaded)
  const [allTopics, setAllTopics] = useState<CompleteTopicPackage[]>(() => {
    try {
      const saved = localStorage.getItem('opohacienda_topics');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return OFFICIAL_TOPICS;
  });

  const [currentTopic, setCurrentTopic] = useState<CompleteTopicPackage>(allTopics[0] || OFFICIAL_TOPICS[0]);
  const [activeCustomTest, setActiveCustomTest] = useState<TestData | null>(null);

  // Pomodoro study timer linked to currently studied topic
  const pomodoro = usePomodoro(currentTopic.id, currentTopic.title);

  // Modals state
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState<boolean>(false);
  const [isCuadernoFallosOpen, setIsCuadernoFallosOpen] = useState<boolean>(false);

  // Score metrics
  const [totalQuestionsAnswered, setTotalQuestionsAnswered] = useState<number>(0);
  const [totalQuestionsCorrect, setTotalQuestionsCorrect] = useState<number>(0);

  // Failed questions notebook (Cuaderno de Fallos)
  const [failedQuestions, setFailedQuestions] = useState<FailedQuestionRecord[]>(() => {
    try {
      const saved = localStorage.getItem('opohacienda_failed_q');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // Test Results History for Performance Dashboard
  const [testHistory, setTestHistory] = useState<TestResultLog[]>(() => {
    try {
      const saved = localStorage.getItem('opohacienda_test_history');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'init-mock-1',
        date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        topicId: OFFICIAL_TOPICS[0].id,
        topicTitle: OFFICIAL_TOPICS[0].title,
        level: 'C2',
        totalQuestions: 20,
        correct: 16,
        failed: 3,
        blank: 1,
        netScore: 15.25,
        maxPossibleScore: 20,
        percentageScore: 76.25,
        timeSpentSeconds: 980,
      },
    ];
  });

  // Forgetting curve review records
  const [reviewRecords, setReviewRecords] = useState<Record<string, TopicReviewRecord>>(() => {
    try {
      const saved = localStorage.getItem('opohacienda_reviews');
      if (saved) return JSON.parse(saved);
    } catch {}
    const now = new Date();
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
    const eightDaysAgo = new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000);

    return {
      [OFFICIAL_TOPICS[0].id]: {
        topicId: OFFICIAL_TOPICS[0].id,
        topicTitle: OFFICIAL_TOPICS[0].title,
        lastReviewedAt: now.toISOString(),
        reviewStage: 2,
        nextReviewDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'fresh',
        daysSinceLastReview: 0,
        retentionPercent: 95,
        totalTestsCompleted: 2,
      },
      [OFFICIAL_TOPICS[1].id]: {
        topicId: OFFICIAL_TOPICS[1].id,
        topicTitle: OFFICIAL_TOPICS[1].title,
        lastReviewedAt: eightDaysAgo.toISOString(),
        reviewStage: 1,
        nextReviewDate: twoDaysAgo.toISOString(),
        status: 'urgent',
        daysSinceLastReview: 8,
        retentionPercent: 42,
        totalTestsCompleted: 1,
      },
    };
  });

  // Local storage persistence
  useEffect(() => {
    try {
      localStorage.setItem('opohacienda_topics', JSON.stringify(allTopics));
    } catch {}
  }, [allTopics]);

  useEffect(() => {
    try {
      localStorage.setItem('opohacienda_failed_q', JSON.stringify(failedQuestions));
    } catch {}
  }, [failedQuestions]);

  useEffect(() => {
    try {
      localStorage.setItem('opohacienda_reviews', JSON.stringify(reviewRecords));
    } catch {}
  }, [reviewRecords]);

  useEffect(() => {
    try {
      localStorage.setItem('opohacienda_test_history', JSON.stringify(testHistory));
    } catch {}
  }, [testHistory]);

  // Log a review for a topic
  const logTopicReview = (topicId: string, topicTitle?: string) => {
    const title = topicTitle || allTopics.find((t) => t.id === topicId)?.title || 'Tema';
    setReviewRecords((prev) => {
      const currentRecord = prev[topicId];
      const stage = currentRecord ? Math.min(5, currentRecord.reviewStage + 1) : 1;
      const intervalDays = stage === 1 ? 1 : stage === 2 ? 3 : stage === 3 ? 7 : stage === 4 ? 14 : 30;
      const nextDue = new Date(Date.now() + intervalDays * 24 * 60 * 60 * 1000).toISOString();

      return {
        ...prev,
        [topicId]: {
          topicId,
          topicTitle: title,
          lastReviewedAt: new Date().toISOString(),
          reviewStage: stage,
          nextReviewDate: nextDue,
          status: 'fresh',
          daysSinceLastReview: 0,
          retentionPercent: 100,
          totalTestsCompleted: (currentRecord?.totalTestsCompleted || 0) + 1,
        },
      };
    });
  };

  const handleRecordScore = (answered: number, correct: number) => {
    setTotalQuestionsAnswered((prev) => prev + answered);
    setTotalQuestionsCorrect((prev) => prev + correct);
    if (currentTopic) {
      logTopicReview(currentTopic.id, currentTopic.title);
    }
  };

  const handleLogTestResult = (log: TestResultLog) => {
    setTestHistory((prev) => [log, ...prev]);
  };

  const handleRecordFailedQuestions = (failedList: Array<{ question: QuestionItem; selectedAnswer: number }>) => {
    setFailedQuestions((prev) => {
      const updated = [...prev];
      failedList.forEach(({ question, selectedAnswer }) => {
        const recordId = `${currentTopic.id}-${question.id}`;
        const existingIdx = updated.findIndex((r) => r.id === recordId);
        if (existingIdx >= 0) {
          updated[existingIdx] = {
            ...updated[existingIdx],
            timesFailed: updated[existingIdx].timesFailed + 1,
            selectedOptionIndex: selectedAnswer,
            failedAt: new Date().toISOString(),
          };
        } else {
          updated.push({
            id: recordId,
            topicId: currentTopic.id,
            topicTitle: currentTopic.title,
            question,
            failedAt: new Date().toISOString(),
            selectedOptionIndex: selectedAnswer,
            timesFailed: 1,
          });
        }
      });
      return updated;
    });
  };

  const handleClearResolvedError = (recordId: string) => {
    setFailedQuestions((prev) => prev.filter((r) => r.id !== recordId));
  };

  const handlePackageGenerated = (newPkg: CompleteTopicPackage) => {
    setAllTopics((prev) => {
      const exists = prev.some((p) => p.id === newPkg.id);
      if (exists) return prev.map((p) => (p.id === newPkg.id ? newPkg : p));
      return [newPkg, ...prev];
    });
    setCurrentTopic(newPkg);
    setActiveCustomTest(null);
    setCurrentView('summary');
    logTopicReview(newPkg.id, newPkg.title);
  };

  const handleDeleteTopic = (topicId: string) => {
    setAllTopics((prev) => prev.filter((t) => t.id !== topicId));
    if (currentTopic.id === topicId) {
      setCurrentTopic(allTopics[0] || OFFICIAL_TOPICS[0]);
    }
  };

  const handleSelectOfficialTopic = (topic: CompleteTopicPackage) => {
    setCurrentTopic(topic);
    setCurrentLevel(topic.level);
    setActiveCustomTest(null);
  };

  // Launch test from filter modal
  const handleStartFilteredTest = (test: TestData, topicLabel: string) => {
    setActiveCustomTest(test);
    setCurrentView('test');
  };

  // Launch quick review test from Forgetting Curve (10 or 25 questions)
  const handleStartQuickReviewTest = (topic: CompleteTopicPackage, count: number) => {
    setCurrentTopic(topic);
    setCurrentLevel(topic.level);
    const sliced = topic.test.questions.slice(0, count);
    const quickTest: TestData = {
      title: `Test de Repaso (${sliced.length} P.): ${topic.title}`,
      level: topic.level,
      questions: sliced,
    };
    setActiveCustomTest(quickTest);
    setCurrentView('test');
  };

  const handleOpenFlashcardsForTopic = (topic: CompleteTopicPackage) => {
    setCurrentTopic(topic);
    setCurrentLevel(topic.level);
    setCurrentView('summary');
  };

  const urgentCount = allTopics.filter((t) => {
    const rec = reviewRecords[t.id];
    if (!rec) return true;
    const daysSince = Math.floor((Date.now() - new Date(rec.lastReviewedAt).getTime()) / (1000 * 60 * 60 * 24));
    return daysSince >= 7 || rec.status === 'urgent';
  }).length;

  const failedPool = failedQuestions.map((f) => ({
    topicId: f.topicId,
    topicTitle: f.topicTitle,
    question: f.question,
  }));

  const activeTestToRender = activeCustomTest || currentTopic.test;

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans transition-colors duration-150">
      
      {/* Desktop Fixed Sidebar */}
      <Sidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        currentLevel={currentLevel}
        onLevelChange={setCurrentLevel}
        urgentReviewsCount={urgentCount}
        failedCount={failedQuestions.length}
        onOpenChat={() => setIsChatOpen(true)}
        density={density}
        onToggleDensity={toggleDensity}
      />

      {/* Main Content Area (Offset by 64 on Desktop, with bottom spacing for mobile nav) */}
      <div className="md:pl-64 flex flex-col flex-1 min-h-screen">
        
        {/* Top Contextual Header Bar */}
        <TopBar
          currentView={currentView}
          currentLevel={currentLevel}
          activeTopicTitle={activeCustomTest ? activeCustomTest.title : currentTopic.title}
          onOpenChat={() => setIsChatOpen(true)}
          density={density}
          onToggleDensity={toggleDensity}
          pomodoro={pomodoro}
        />

        {/* Focused Active View Workspace */}
        <main className={`flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-24 md:pb-12 ${
          isClean ? 'py-7 space-y-7' : 'py-5 space-y-5'
        }`}>
          
          {/* Subtle Protocol Banner (only on library view) */}
          {currentView === 'library' && (
            <ConfirmationProtocol density={density} />
          )}

          {/* VIEW 1: Biblioteca y Subida de Temarios */}
          {currentView === 'library' && (
            <UploadSection
              currentLevel={currentLevel}
              onLevelChange={setCurrentLevel}
              onPackageGenerated={handlePackageGenerated}
              onSelectOfficialTopic={handleSelectOfficialTopic}
              selectedTopicId={currentTopic.id}
              allTopics={allTopics}
              onOpenTestFilter={() => setIsFilterModalOpen(true)}
              onDeleteTopic={handleDeleteTopic}
              density={density}
            />
          )}

          {/* VIEW 2: Simulador de Tests Oficiales */}
          {currentView === 'test' && (
            <TestTab
              test={activeTestToRender}
              topicId={currentTopic.id}
              topicTitle={currentTopic.title}
              onRecordScore={handleRecordScore}
              onRecordFailedQuestions={handleRecordFailedQuestions}
              onTopicReviewed={() => logTopicReview(currentTopic.id, currentTopic.title)}
              onLogTestResult={handleLogTestResult}
              density={density}
            />
          )}

          {/* VIEW 3: Supuestos Prácticos Oficiales (2º Ejercicio) */}
          {currentView === 'cases' && (
            <PracticalCasesTab />
          )}

          {/* VIEW 4: Calculadora Oficial LGT & LPAC */}
          {currentView === 'calc' && (
            <LGTCalculatorTab />
          )}

          {/* VIEW 5: Dashboard de Rendimiento Oficial, Horas y Medallas */}
          {currentView === 'dashboard' && (
            <PerformanceDashboard
              testHistory={testHistory}
              topics={allTopics}
              reviewRecords={reviewRecords}
              onStartWeaknessTest={() => setIsFilterModalOpen(true)}
              onOpenErrorNotebook={() => setCurrentView('errors')}
              currentLevel={currentLevel}
              failedQuestions={failedQuestions}
              totalStudiedMinutes={pomodoro.totalStudiedMinutes}
              density={density}
            />
          )}

          {/* VIEW 6: Curva del Olvido (Ebbinghaus) */}
          {currentView === 'curve' && (
            <ForgettingCurvePlanner
              topics={allTopics}
              reviewRecords={reviewRecords}
              onStartQuickReviewTest={handleStartQuickReviewTest}
              onOpenFlashcardsForTopic={handleOpenFlashcardsForTopic}
              onManualLogReview={logTopicReview}
            />
          )}

          {/* VIEW 7: Cuaderno de Fallos */}
          {currentView === 'errors' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Gestión Activa del Cuaderno de Fallos
                </h3>
              </div>
              <CuadernoDeFallosModal
                isOpen={true}
                onClose={() => setCurrentView('library')}
                failedQuestions={failedQuestions}
                onStartRescueTest={handleStartFilteredTest}
                onClearResolvedError={handleClearResolvedError}
                onClearAllErrors={() => setFailedQuestions([])}
              />
            </div>
          )}

          {/* VIEW 8: Fichas, Plazos y Sanciones */}
          {currentView === 'summary' && (
            <div className="space-y-6">
              <SummaryTab summary={currentTopic.summary} />
              
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                  Flashcards de Fijación Rápida
                </h3>
                <FlashcardsTab flashcards={currentTopic.flashcards} />
              </div>
            </div>
          )}

          {/* VIEW 9: Radar de Trampas de Examen */}
          {currentView === 'traps' && (
            <TrapsTab traps={currentTopic.traps} />
          )}

        </main>

        {/* Footer */}
        <footer className="border-t border-slate-100 bg-white py-4 text-center text-xs text-slate-500 transition-colors">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="font-medium text-slate-700">
              OpoHacienda Preparador Pro • AEAT C2 (Noviembre) & C1 (2028)
            </p>
            <p className="font-mono text-[11px] text-slate-400">
              LGT (Ley 58/2003), RGR, RGGI, RGST & LPAC 39/2015
            </p>
          </div>
        </footer>

      </div>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNavBar
        currentView={currentView}
        onViewChange={setCurrentView}
        urgentReviewsCount={urgentCount}
        failedCount={failedQuestions.length}
        onOpenChat={() => setIsChatOpen(true)}
        currentLevel={currentLevel}
        onLevelChange={setCurrentLevel}
        density={density}
        onToggleDensity={toggleDensity}
      />

      {/* Filter Test Modal (10, 25, 50, 80 questions across multiple topics) */}
      <TestFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        topics={allTopics}
        onStartFilteredTest={handleStartFilteredTest}
        failedQuestionIds={new Set(failedQuestions.map((f) => f.id))}
        failedQuestionsPool={failedPool}
      />

      {/* Cuaderno de Fallos Modal (When opened as modal) */}
      <CuadernoDeFallosModal
        isOpen={isCuadernoFallosOpen}
        onClose={() => setIsCuadernoFallosOpen(false)}
        failedQuestions={failedQuestions}
        onStartRescueTest={handleStartFilteredTest}
        onClearResolvedError={handleClearResolvedError}
        onClearAllErrors={() => setFailedQuestions([])}
      />

      {/* Floating Chat / Consultation Modal */}
      <PreparadorChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        currentLevel={currentLevel}
        currentTopicTitle={currentTopic.title}
      />

      {/* Offline Connectivity Notification */}
      <OfflineIndicator />

    </div>
  );
}
