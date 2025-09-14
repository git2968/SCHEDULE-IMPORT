export interface User {
  id: string;
  email: string;
  displayName?: string;
}

export interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
}

export interface Course {
  id: string;
  courseId: string; // 课程编号
  name: string;
  weeks: number[];
  weekRange: string;
  day: number;
  startSession: number;
  endSession: number;
  location: string;
  teacher?: string;
}

export interface Schedule {
  id: string;
  userId: string;
  name: string;
  totalWeeks: number;
  courses: Course[];
  createdAt: string;
  updatedAt: string;
}

export interface ScheduleContextType {
  currentSchedule: Schedule | null;
  userSchedules: Schedule[];
  loading: boolean;
  error: string | null;
  setCurrentSchedule: (schedule: Schedule) => void;
  saveSchedule: (schedule: Schedule) => Promise<void>;
  parseExcel: (file: File) => Promise<Schedule>;
  updateSchedule: (schedule: Partial<Schedule>) => Promise<void>;
  addCourse: (course: Omit<Course, 'id'>) => Promise<void>;
  updateCourse: (courseId: string, courseData: Partial<Course>) => Promise<void>;
  deleteCourse: (courseId: string) => Promise<void>;
  addWeekToCourse: (courseId: string, week: number) => Promise<void>;
  removeWeekFromCourse: (courseId: string, week: number) => Promise<void>;
  loadUserSchedules: () => Promise<Schedule[]>;
  deleteSchedule: (scheduleId: string) => Promise<void>;
}

export interface AppSettings {
  backgroundImage: string;
  theme: 'light' | 'dark';
  language: 'zh' | 'en';
}

export interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => Promise<void>;
  uploadBackgroundImage: (file: File) => Promise<string>;
} 