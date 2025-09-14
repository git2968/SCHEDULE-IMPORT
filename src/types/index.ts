export interface User {
  id: string;
  email: string;
  displayName: string;
}

export interface Course {
  id: string;
  name: string;
  code: string;
  teacher?: string;
  startWeek: number;
  endWeek: number;
  day: number;
  startTime: number;
  endTime: number;
  location: string;
  weeks: number[]; // 存储课程所在的周数，如 [1, 2, 3, 5, 7, 9]
  scheduleId?: string; // 关联的课表ID
}

export interface Schedule {
  id: string;
  name: string;
  createdAt: number;
  userId: string;
}

export interface Settings {
  backgroundImage?: string;
  theme?: string;
}

export interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: (onBeforeLogout?: () => Promise<void>) => Promise<void>;
}

export interface ScheduleContextType {
  schedules: Schedule[];
  courses: Course[];
  currentSchedule: Schedule | null;
  loading: boolean;
  error: string | null;
  createSchedule: (name: string) => Promise<void>;
  updateSchedule: (scheduleId: string, name: string) => Promise<void>;
  deleteSchedule: (scheduleId: string) => Promise<void>;
  setCurrentSchedule: (scheduleId: string) => void;
  addCourse: (course: Omit<Course, 'id' | 'scheduleId'>) => Promise<void>;
  updateCourse: (courseId: string, course: Partial<Course>) => Promise<void>;
  deleteCourse: (courseId: string) => Promise<void>;
  parseExcel: (file: File) => Promise<void>;
}

export interface SettingsContextType {
  settings: Settings | null;
  updateSettings: (newSettings: Partial<Settings>) => Promise<void>;
  uploadBackgroundImage: (file: File) => Promise<void>;
  resetSettings: () => Promise<void>;
} 