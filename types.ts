
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

// FIX: Changed from an interface extending SupabaseUser to a direct type alias.
// This resolves TS errors where properties on the Supabase user object (e.g., id, email) were not being recognized.
export type User = SupabaseUser;

// Types for Dojo Management refactored for Supabase
export interface Payment {
  month: number;
  year: number;
  status: 'paid' | 'open';
}

export interface ChampionshipResult {
  id: string; // Corresponds to the Championship ID
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
  dojo_id: string | null;
  email: string;
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

export type UserRole = 'M' | 'A' | 'S';

export interface StudentUserLink {
  student_id: string | null;
  user_id: string;
  user_role_type: UserRole;
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
  student_id: string;
  status: 'scheduled' | 'completed';
  final_grade?: number;
  is_approved?: boolean;
}

export interface Championship {
  id?: string;
  dojo_id: string;
  name: string;
  date: string;
}

export interface Product {
  id?: string;
  dojo_id?: string;
  name: string;
  description: string;
  price: number;
  image_url?: string;
  affiliate_url: string;
  status: boolean;
  market?: string;
  created_at?: string;
}


export interface Dojo {
  id: string;
  owner_id: string;
  name: string;
  team_name: string;
  master_name?: string;
  modalities: MartialArt[];
  logo_url?: string;
  team_logo_url?: string;
  phone?: string;
  instagram_handle?: string;
  user_role_type: 'M';
}

export type DojoCreationData = Omit<Dojo, 'id' | 'owner_id'>;

export interface StudentRequest {
  id: string;
  user_id: string;
  dojo_id: string;
  user_name: string;
  user_email: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  dojos?: { name: string } | null;
}

export interface DashboardConfig {
    id_dash: string;
    json_config: {
        Titulo: string;
        Tipo: 'Quantitativo' | 'Pizza' | 'Barra' | 'Coluna' | 'Linha';
        colunas: number;
        linhas: number;
    };
    json_regras: {
        source: string;
        operation: string;
        field?: string;
    };
    status: boolean;
    posicao: number;
    id_dojo: string | null;
}


// FIX: Add types for the old Gemini diploma generator to resolve import errors.
export interface DiplomaStyle {
  id: string;
  name: string;
  thumbnail: string;
}

export interface DiplomaFont {
  id: string;
  name: string;
  className: string;
}

export interface ColorScheme {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  text: string;
  bg: string;
}

export type GeneratedDiploma =
  | { type: 'text'; data: { title: string; body: string } }
  | { type: 'image'; data: { base64: string } };

// Diploma data for the new template-based generator
export interface DiplomaData {
  graduationDate: string;
  teamName: string;
  masterName: string;
  martialArtName: string;
  teamLogo: string | null;
  dojoLogo: string | null;
  dojoLocation: string;
  // FIX: Add optional fields for old Gemini feature to resolve property access errors.
  studentName?: string;
  selectedBelt?: Belt;
  selectedStyle?: DiplomaStyle;
  font?: DiplomaFont;
  colorScheme?: ColorScheme;
  customNotes?: string;
  existingDiplomaImage?: string | null;
}

// --- Community / Feed Types ---

export interface Post {
  id: string;
  dojo_id: string | null; // null implies Global/Admin post
  author_id: string;
  author_role: UserRole;
  author_name: string;
  author_avatar_url?: string;
  content: string;
  image_url?: string;
  created_at: string;
  likes_count?: number;
  dislikes_count?: number;
  comments_count?: number;
  user_reaction?: 'like' | 'dislike' | null; // Helper for UI
}

export interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  author_name: string;
  author_avatar_url?: string;
  content: string;
  created_at: string;
  likes_count?: number;
  dislikes_count?: number;
  user_reaction?: 'like' | 'dislike' | null; // Helper for UI
}

export interface Reaction {
  id: string;
  user_id: string;
  target_id: string; // Post ID or Comment ID
  target_type: 'post' | 'comment';
  type: 'like' | 'dislike';
}
