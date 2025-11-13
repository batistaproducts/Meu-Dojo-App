
import { User as SupabaseUser } from '@supabase/supabase-js';

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

export interface User extends SupabaseUser {}

export enum AppStep {
  SELECT_ART,
  FILL_FORM,
  GENERATE
}

export type GeneratedDiploma = 
  | { type: 'text'; data: { title: string; body: string } }
  | { type: 'image'; data: { base64: string } };

// Types for Dojo Management refactored for Supabase
export interface Payment {
  month: number;
  year: number;
  status: 'paid' | 'open';
}

export interface ChampionshipResult {
  id: string;
  name: string;
  date: string;
  result: string;
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
  id?: string;
  dojo_id: string;
  name:string;
  modality: string;
  belt: Belt;
  last_graduation_date: string;
  degree?: number;
  tuition_fee: number;
  payments: Payment[];
  championships: ChampionshipResult[];
  fights: Fight[];
  graduation_history: GraduationHistoryEntry[];
  profile_picture_url?: string;
}

export interface ExamExercise {
  id: string;
  name: string;
}

export interface Exam {
  id?: string;
  dojo_id: string;
  martial_art_name: string;
  target_belt: Belt;
  name: string;
  exercises: ExamExercise[];
  min_passing_grade: number;
}

export interface StudentGrading {
  studentId: string;
  finalGrade?: number;
  isApproved?: boolean;
}

export interface GraduationEvent {
  id?: string;
  dojo_id: string;
  exam_id: string;
  date: string;
  attendees: StudentGrading[];
  status: 'scheduled' | 'completed';
}


export interface Dojo {
  id: string;
  owner_id: string;
  name: string;
  team_name: string;
  modalities: MartialArt[];
  logo_url?: string;
  team_logo_url?: string;
}

export type DojoCreationData = Omit<Dojo, 'id' | 'owner_id'>;