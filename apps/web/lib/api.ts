const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface UserPreferences {
  time_zone?: string;
  language?: string;
  email_notifications?: boolean;
  daily_reminder_time?: string;
  preferred_tone?: string;
  caption_enabled?: boolean;
  background_music_enabled?: boolean;
  music_volume?: number;
}

export interface UserProfile {
  id: string;
  email: string;
  display_name: string;
  is_active: boolean;
  level: number;
  xp: number;
  current_streak: number;
  longest_streak: number;
  preferences?: UserPreferences;
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  category: string;
  current_situation?: string;
  target_outcome?: string;
  milestones?: Array<{ id: string; title: string; weight: number; completed: boolean }>;
  target_date?: string;
  is_completed: boolean;
  progress_percentage: number;
  total_tasks?: number;
  completed_tasks?: number;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: "low" | "medium" | "high" | "urgent";
  points?: number;
  category?: string;
  status: "pending" | "in_progress" | "completed" | "missed";
  due_date?: string;
  completed_at?: string;
  xp_reward: number;
  goal_id?: string;
  goal_alignment?: "direct" | "skill" | "support" | "routine" | "unrelated" | string;
  alignment_score?: number;
  alignment_reason?: string;
  milestone_id?: string;
  suggested_next_step?: string;
}

export interface AvatarItem {
  id: string;
  user_id?: string;
  name: string;
  display_name?: string;
  archetype: string;
  career?: string;
  category: string;
  nationality?: string;
  preferred_language?: string;
  age_range?: string;
  description: string;
  personality_traits: string[];
  aspirational_traits?: string[];
  strengths?: string[];
  weaknesses?: string[];
  motivations?: string[];
  visual_prompt_attributes: string;
  visual_style?: string;
  image_url?: string;
  avatar_options?: Record<string, any>;
  genre_preferences?: string[];
  story_preferences?: Record<string, any>;
  is_template: boolean;
  is_custom: boolean;
  created_at?: string;
}


export interface GenreItem {
  id: string;
  name: string;
  tagline: string;
  accent_color: string;
  tone_description: string;
  sample_character: string;
}

export interface SceneItem {
  id: string;
  scene_number: number;
  title: string;
  visual_description: string;
  image_prompt: string;
  narration_text: string;
  dialogue: Array<{ speaker: string; line: string }>;
  mood: string;
  duration_seconds: number;
  image_url?: string;
  audio_url?: string;
}

export interface BranchPreviewItem {
  narrative?: string;
  outcome?: string;
  reward?: string;
  next_step?: string;
  goal_impact?: string;
}

export interface EpisodeItem {
  id: string;
  series_id: string;
  episode_number: number;
  day_number?: number;
  episode_slot?: string;
  title: string;
  summary: string;
  opening_hook: string;
  cliffhanger: string;
  full_script?: string;
  branch_previews?: {
    branch_70?: BranchPreviewItem;
    branch_80?: BranchPreviewItem;
    branch_90?: BranchPreviewItem;
    branch_100?: BranchPreviewItem;
  };
  generation_status: string;
  video_url?: string;
  thumbnail_url?: string;
  captions_url?: string;
  duration_seconds: number;
  scenes?: SceneItem[];
  created_at: string;
}

export interface SeriesItem {
  id: string;
  title: string;
  genre: string;
  current_season: number;
  current_episode_number: number;
  long_term_purpose?: string;
  narrative_state: Record<string, any>;
  status: string;
  avatar?: AvatarItem;
}

export interface DashboardOverview {
  user: UserProfile;
  active_series?: SeriesItem;
  stats: {
    total_tasks_today: number;
    completed_tasks_today: number;
    completion_rate_today: number;
    current_streak: number;
    longest_streak: number;
    level: number;
    xp: number;
    xp_to_next_level: number;
    weekly_completion_count: number;
  };
  today_tasks: Task[];
  active_goals: Goal[];
  latest_episode?: EpisodeItem;
  can_generate_today: boolean;
}

export interface ExtractedVoiceTask {
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "urgent";
  points: number;
  category: string;
  due_at?: string;
  confidence: number;
}

export interface RoadmapMilestone {
  id: string;
  month_checkpoint?: number;
  title: string;
  description: string;
  estimated_completion_date?: string;
  why_it_matters: string;
  required_tasks_or_evidence: string;
  dependencies: string[];
  status: "not_started" | "in_progress" | "completed";
  completion_criteria: string;
  suggested_weekly_pace: string;
  weight: number;
  completed_tasks_count?: number;
}

export interface RoadmapData {
  domain: string;
  goal_title: string;
  current_situation: string;
  target_date?: string;
  days_remaining?: number | null;
  is_overdue?: boolean;
  schedule_status: "on_schedule" | "ahead" | "behind" | "overdue" | "not_set" | "provisional";
  feasibility: {
    assessment: string;
    feasibility_score: number;
    advice: string;
    alternatives: string[];
  };
  milestones: RoadmapMilestone[];
  summary: {
    total_milestones: number;
    completed_milestones: number;
    remaining_milestones: number;
    current_milestone: string;
    next_milestone_deadline?: string;
  };
}

export interface TimelineDay {
  day_number: number;
  date: string;
  is_missed: boolean;
  completion_percentage: number;
  streak_qualified: boolean;
  recovery_message?: string;
  next_recommended_action?: string;
  tasks: Array<{
    title: string;
    points: number;
    status: string;
    category?: string;
    due_at?: string;
  }>;
  episodes: {
    episode_a?: EpisodeItem | null;
    episode_b?: EpisodeItem | null;
  };
  branch_previews?: {
    branch_80?: BranchPreviewItem;
    branch_90?: BranchPreviewItem;
    branch_100?: BranchPreviewItem;
  };
}

export interface TimelineData {
  character: {
    name: string;
    title: string;
    genre: string;
    avatar: string;
    career: string;
    bio: string;
    personality: string[];
    aspirational_traits?: string[];
    avatar_options?: Record<string, any>;
  };
  goal?: {
    title: string;
    description?: string;
    category?: string;
    current_situation?: string;
    target_outcome?: string;
    target_date?: string;
    days_remaining?: number | null;
    remaining_time_label?: string;
    is_overdue?: boolean;
    schedule_status?: string;
    goal_progress?: number;
    journey_momentum?: number;
    milestones?: any[];
    next_milestone?: string;
  } | null;
  today_tasks?: Task[];
  today_summary?: {
    total_tasks: number;
    completed_tasks: number;
    remaining_tasks: number;
    weighted_completion_percentage: number;
    direct_supporting_count: number;
    indirect_supporting_count: number;
    routine_or_unaligned_count: number;
    concise_explanation: string;
  };
  deadline_urgency?: {
    target_date?: string | null;
    remaining_days?: number | null;
    remaining_time_label?: string;
    progress_through_planned_timeline?: number;
    current_milestone?: string;
    next_milestone_deadline?: string;
    schedule_status?: string;
    is_overdue?: boolean;
    has_target_date: boolean;
  };
  is_demo: boolean;
  character_key?: string;
  journey_momentum?: number;
  goal_progress?: number;
  stats: {
    total_tracked_days: number;
    current_streak: number;
    longest_streak: number;
    completed_tasks: number;
    missed_tasks: number;
    episodes_generated: number;
    total_episodes?: number;
    overall_completion_rate: number;
    journey_momentum?: number;
    goal_progress?: number;
    completed_milestones?: number;
    remaining_milestones?: number;
    days_elapsed?: number;
  };
  roadmap?: RoadmapData;
  days: TimelineDay[];
}


// Token helpers
export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("ylys_token");
}

export function setStoredToken(token: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("ylys_token", token);
  }
}

export function clearStoredToken() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("ylys_token");
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ detail: "Request failed" }));
    let msg = `HTTP Error ${res.status}`;
    if (typeof errorBody.detail === "string") {
      msg = errorBody.detail;
    } else if (Array.isArray(errorBody.detail)) {
      msg = errorBody.detail.map((e: any) => e.msg || e.message || JSON.stringify(e)).join(", ");
    } else if (errorBody.detail && typeof errorBody.detail === "object") {
      msg = errorBody.detail.msg || errorBody.detail.message || JSON.stringify(errorBody.detail);
    } else if (typeof errorBody.message === "string") {
      msg = errorBody.message;
    }
    throw new Error(msg);
  }

  return res.json();
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user_id: string;
  email: string;
  display_name: string;
  is_new_user?: boolean;
  has_completed_onboarding?: boolean;
}

export const api = {
  // Auth
  register: (data: any) => request<AuthResponse>("/api/v1/auth/register", { method: "POST", body: JSON.stringify(data) }),
  login: (data: any) => request<AuthResponse>("/api/v1/auth/login", { method: "POST", body: JSON.stringify(data) }),
  getMe: () => request<UserProfile>("/api/v1/auth/me"),
  updatePreferences: (data: any) => request<any>("/api/v1/auth/preferences", { method: "PUT", body: JSON.stringify(data) }),
  logout: () => {
    clearStoredToken();
    return request("/api/v1/auth/logout", { method: "POST" });
  },

  // Google OAuth
  getGoogleAuthUrl: () => request<{ url: string | null; configured: boolean; client_id?: string }>("/api/v1/auth/google/url"),
  googleCallback: (data: { code?: string; state?: string; credential?: string; email?: string; display_name?: string }) =>
    request<AuthResponse>("/api/v1/auth/google/callback", { method: "POST", body: JSON.stringify(data) }),

  // Characters & Identities
  getMyIdentity: () => request<AvatarItem>("/api/v1/avatars/my-identity"),
  updateMyIdentity: (data: any) => request<AvatarItem>("/api/v1/avatars/my-identity", { method: "PUT", body: JSON.stringify(data) }),
  updateMyAvatarOptions: (data: { avatar_options: any; image_url?: string }) =>
    request<AvatarItem>("/api/v1/avatars/my-avatar", { method: "POST", body: JSON.stringify(data) }),
  adoptTraits: (traits: string[]) =>
    request<{
      status: string;
      message: string;
      added_traits: string[];
      aspirational_traits: string[];
      practical_development_suggestions: Array<{ trait: string; suggestion: string }>;
    }>("/api/v1/avatars/adopt-traits", { method: "POST", body: JSON.stringify({ traits }) }),
  removeAspirationalTrait: (trait: string) =>
    request<{ status: string; message: string; aspirational_traits: string[] }>(
      `/api/v1/avatars/aspirational-traits/${encodeURIComponent(trait)}`,
      { method: "DELETE" }
    ),
  getAvatars: (params?: { category?: string; nationality?: string; search?: string; custom_only?: boolean }) => {
    const query = new URLSearchParams();
    if (params?.category && params.category !== "All") query.append("category", params.category);
    if (params?.nationality && params.nationality !== "All") query.append("nationality", params.nationality);
    if (params?.search) query.append("search", params.search);
    if (params?.custom_only) query.append("custom_only", "true");
    const qs = query.toString();
    return request<AvatarItem[]>(`/api/v1/avatars${qs ? `?${qs}` : ""}`);
  },
  createCustomAvatar: (data: any) => request<AvatarItem>("/api/v1/avatars", { method: "POST", body: JSON.stringify(data) }),
  updateAvatar: (id: string, data: any) => request<AvatarItem>(`/api/v1/avatars/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  getGenres: () => request<GenreItem[]>("/api/v1/genres"),

  // Series
  getActiveSeries: () => request<SeriesItem | null>("/api/v1/series/active"),
  createSeries: (data: any) => request<SeriesItem>("/api/v1/series", { method: "POST", body: JSON.stringify(data) }),

  // Goals
  getGoals: () => request<Goal[]>("/api/v1/goals"),
  createGoal: (data: any) => request<Goal>("/api/v1/goals", { method: "POST", body: JSON.stringify(data) }),
  updateGoal: (id: string, data: any) => request<Goal>(`/api/v1/goals/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  updateGoalTargetDate: (id: string, target_date: string) =>
    request<Goal>(`/api/v1/goals/${id}/target-date`, { method: "PUT", body: JSON.stringify({ target_date }) }),
  deleteGoal: (id: string) => request(`/api/v1/goals/${id}`, { method: "DELETE" }),

  // Tasks
  getTasks: (status?: string) => request<Task[]>(`/api/v1/tasks${status ? `?status=${status}` : ""}`),
  createTask: (data: any) => request<Task>("/api/v1/tasks", { method: "POST", body: JSON.stringify(data) }),
  toggleTask: (id: string) => request<any>(`/api/v1/tasks/${id}/toggle`, { method: "PATCH" }),
  deleteTask: (id: string) => request(`/api/v1/tasks/${id}`, { method: "DELETE" }),
  extractVoiceTasks: (transcript: string) =>
    request<{ transcript: string; tasks: ExtractedVoiceTask[]; total_suggested_points: number }>("/api/v1/tasks/extract-voice", {
      method: "POST",
      body: JSON.stringify({ transcript }),
    }),

  // Episodes
  getEpisodes: () => request<EpisodeItem[]>("/api/v1/episodes"),
  getEpisodeDetail: (id: string) => request<EpisodeItem>(`/api/v1/episodes/${id}`),
  generateEpisode: (data: { series_id?: string; format?: string; additional_context?: string }) =>
    request<EpisodeItem>("/api/v1/episodes/generate", { method: "POST", body: JSON.stringify(data) }),

  // Timeline & Streaks
  getPersonalTimeline: () => request<TimelineData>("/api/v1/timeline"),
  getDemoTimeline: (characterKey: string) => request<TimelineData>(`/api/v1/timeline/demo/${characterKey}`),
  getTimeline: (characterKey?: string) => {
    if (characterKey) {
      return request<TimelineData>(`/api/v1/timeline/demo/${characterKey}`);
    }
    return request<TimelineData>("/api/v1/timeline");
  },
  evaluateToday: () => request<{ status: string; day_number: number; completion_percentage: number; streak_qualified: boolean; current_streak: number; longest_streak: number; journey_momentum?: number; episode_id?: string }>("/api/v1/timeline/evaluate-today", { method: "POST" }),

  // Dashboard
  getDashboardOverview: () => request<DashboardOverview>("/api/v1/dashboard/overview"),
};

