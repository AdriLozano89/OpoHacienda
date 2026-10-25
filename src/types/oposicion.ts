export type OposicionLevel = 'C2' | 'C1';

export type ActiveView = 
  | 'library' 
  | 'test' 
  | 'cases'
  | 'calc'
  | 'dashboard'
  | 'curve' 
  | 'errors' 
  | 'summary' 
  | 'traps';

export interface ArticleItem {
  article: string;
  title: string;
  content: string;
}

export interface DeadlineItem {
  process: string;
  deadline: string;
  type: string; // 'Días hábiles', 'Días naturales', 'Meses', 'Años'
  regulation: string;
  notes: string;
}

export interface SanctionItem {
  infraction: string;
  classification: 'Leve' | 'Grave' | 'Muy Grave';
  base: string;
  reductions: string;
}

export interface KeyConceptItem {
  concept: string;
  definition: string;
}

export interface SummaryData {
  topicTitle: string;
  level: OposicionLevel;
  articles: ArticleItem[];
  deadlinesTable: DeadlineItem[];
  sanctionsTable: SanctionItem[];
  keyConcepts: KeyConceptItem[];
  markdownContent?: string;
}

export interface QuestionItem {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  answerLetter: 'A' | 'B' | 'C' | 'D';
  legalArticle: string;
  explanation: string;
}

export interface TestData {
  title: string;
  level: OposicionLevel;
  questions: QuestionItem[];
}

export interface FlashcardItem {
  id: number;
  category: 'Plazo' | 'Artículo' | 'Sanción' | 'Concepto' | 'Órgano';
  front: string;
  back: string;
  regulation?: string;
  status?: 'unreviewed' | 'hard' | 'doubt' | 'mastered';
}

export interface TrapItem {
  title: string;
  examinerTrap: string;
  commonError: string;
  legalReality: string;
  goldenRule: string;
  sampleQuestion?: string;
  correctOption?: string;
}

export interface TrapsData {
  topicTitle: string;
  level: OposicionLevel;
  items: TrapItem[];
}

export interface CompleteTopicPackage {
  id: string;
  title: string;
  subtitle: string;
  level: OposicionLevel;
  summary: SummaryData;
  test: TestData;
  flashcards: FlashcardItem[];
  traps: TrapsData;
  isCustom?: boolean;
  sourceFileName?: string;
  createdAt?: string;
  block?: string;
}

export interface UploadedFileItem {
  id: string;
  name: string;
  size: number;
  base64?: string;
  mimeType: string;
  status: 'idle' | 'reading' | 'processing' | 'completed' | 'error';
  errorMessage?: string;
  targetLevel: OposicionLevel;
  topicId?: string;
}

export interface TestFilterConfig {
  selectedTopicIds: string[];
  questionCount: number; // 10, 25, 50, 80
  filterMode: 'pool_mixed' | 'failed_only' | 'unanswered_only' | 'ai_new_combo';
  level: OposicionLevel | 'ALL';
}

export interface TopicReviewRecord {
  topicId: string;
  topicTitle: string;
  lastReviewedAt: string; // ISO date string
  reviewStage: number; // 0: initial, 1: 24h, 2: 3d, 3: 7d, 4: 14d, 5: 30d (consolidado)
  nextReviewDate: string; // ISO date string
  status: 'urgent' | 'due_soon' | 'fresh' | 'consolidated';
  daysSinceLastReview: number;
  retentionPercent: number; // estimated retention based on Ebbinghaus curve
  totalTestsCompleted: number;
}

export interface FailedQuestionRecord {
  id: string; // `${topicId}-${questionId}`
  topicId: string;
  topicTitle: string;
  question: QuestionItem;
  failedAt: string;
  selectedOptionIndex: number;
  timesFailed: number;
}

export interface PracticalCaseStep {
  stepNumber: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  legalArticles: string[];
  calculations?: Array<{
    concept: string;
    amount: string;
    justification: string;
  }>;
}

export interface PracticalCase {
  id: string;
  title: string;
  subtitle: string;
  level: OposicionLevel;
  category: 'Recaudación' | 'Gestión' | 'Inspección' | 'Procedimiento';
  difficulty: 'Oficial C2' | 'Oficial C1' | 'Avanzado';
  facts: string[];
  steps: PracticalCaseStep[];
}

export interface TestResultLog {
  id: string;
  date: string; // ISO
  topicId: string;
  topicTitle: string;
  level: OposicionLevel;
  totalQuestions: number;
  correct: number;
  failed: number;
  blank: number;
  netScore: number; // Baremo AEAT: +1 por acierto, -0.25 por fallo
  maxPossibleScore: number;
  percentageScore: number; // (netScore / maxPossibleScore) * 100
  timeSpentSeconds: number;
}
