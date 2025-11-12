export interface Belt {
  name: string;
  color: string;
}

export interface MartialArt {
  name: string;
  image: string;
  belts: Belt[];
}

export interface DiplomaStyle {
  id: string;
  name: string;
  thumbnail: string;
}

export interface ColorScheme {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  bg: string;
  text: string;
}

export interface DiplomaFont {
  id: string;
  name: string;
  className: string;
}

export interface DiplomaData {
  studentName: string;
  graduationDate: string;
  teamName: string;
  masterName: string;
  selectedBelt: Belt;
  selectedStyle: DiplomaStyle;
  teamLogo: string | null;
  font: DiplomaFont;
  colorScheme: ColorScheme;
  customNotes: string;
  existingDiplomaImage: string | null;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export enum AppStep {
  SELECT_ART,
  FILL_FORM,
  GENERATE
}

export type GeneratedDiploma = 
  | { type: 'text'; data: { title: string; body: string } }
  | { type: 'image'; data: { base64: string } };


// New Types for Dojo Management
export interface Payment {
  month: number; // 1-12
  year: number;
  status: 'paid' | 'open';
}

export interface ChampionshipResult {
  id: string;
  name: string;
  date: string;
  result: string; // e.g., 'Ouro', 'Prata', 'Bronze', 'Participação'
}

export interface Fight {
  id: string;
  date: string;
  result: 'win' | 'loss' | 'draw';
  opponent?: string;
  event?: string;
}

export interface FightRecord {
  wins: number;
  losses: number;
  draws: number;
}

export interface GraduationHistoryEntry {
  id: string;
  date: string;
  belt: Belt;
  grade: number;
  examName: string;
}


export interface Student {
  id: string;
  name:string;
  modality: string; // e.g., "Jiu-Jitsu Brasileiro"
  belt: Belt;
  lastGraduationDate: string;
  degree?: number;
  tuitionFee: number;
  payments: Payment[];
  championships: ChampionshipResult[];
  fights: Fight[];
  graduationHistory: GraduationHistoryEntry[];
}

export interface ExamExercise {
  id: string;
  name: string;
}

export interface Exam {
  id: string;
  martialArtName: string;
  targetBelt: Belt;
  name: string;
  exercises: ExamExercise[];
  minPassingGrade: number;
}

export interface StudentGrading {
  studentId: string;
  finalGrade?: number;
  isApproved?: boolean;
}

export interface GraduationEvent {
  id: string;
  date: string;
  examId: string;
  attendees: StudentGrading[];
  status: 'scheduled' | 'completed';
}


export interface Dojo {
  id: string;
  ownerId: string;
  name: string;
  teamName: string;
  modalities: MartialArt[];
  students: Student[];
  exams: Exam[];
  graduationEvents: GraduationEvent[];
}