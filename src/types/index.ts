export interface User {
  id: string;
  email: string;
  displayName: string;
}

export interface Course {
  id: string;
  name: string;
  code: string;
  courseId: string; // 课程编号
  teacher?: string;
  startWeek: number;
  endWeek: number;
  day: number;
  startTime: number;
  endTime: number;
  startSession: number; // 开始节次
  endSession: number; // 结束节次
  location: string;
  weeks: number[]; // 存储课程所在的周数，如 [1, 2, 3, 5, 7, 9]
  scheduleId?: string; // 关联的课表ID
}

export interface Schedule {
  id: string;
  name: string;
  createdAt: number;
  userId: string;
  totalWeeks?: number; // 总周数
  courses?: Course[]; // 课程列表
}

export interface Settings {
  backgroundImage?: string;
  theme?: string;
}

export interface AppSettings {
  backgroundImage?: string; // 课程表应用的背景图片
  appCenterBackgroundImage?: string; // 应用中心的背景图片
  theme?: string;
  language?: string;
  currentWeek?: number; // 当前周数
  semesterStartDate?: string; // 学期开始日期 (YYYY-MM-DD格式)
  autoUpdateWeek?: boolean; // 是否自动更新当前周数
}

export interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
}

export interface ScheduleContextType {
  currentSchedule: Schedule | null;
  userSchedules: Schedule[];
  loading: boolean;
  error: string | null;
  setCurrentSchedule: (schedule: Schedule | null) => void;
  saveSchedule: (schedule: Schedule) => Promise<void>;
  parseExcel: (file: File) => Promise<Schedule>;
  updateSchedule: (scheduleUpdate: Partial<Schedule>) => Promise<void>;
  addCourse: (course: Omit<Course, 'id'>) => Promise<void>;
  updateCourse: (courseId: string, courseData: Partial<Course>) => Promise<void>;
  deleteCourse: (courseId: string) => Promise<void>;
  addWeekToCourse: (courseId: string, week: number) => Promise<void>;
  removeWeekFromCourse: (courseId: string, week: number) => Promise<void>;
  loadUserSchedules: () => Promise<Schedule[]>;
  deleteSchedule: (scheduleId: string) => Promise<void>;
}

export interface SettingsContextType {
  settings: AppSettings | null;
  updateSettings: (newSettings: Partial<AppSettings>) => Promise<void>;
  uploadBackgroundImage: (file: File) => Promise<void>;
  resetSettings: () => Promise<void>;
  getCurrentWeek: () => number;
  updateCurrentWeek: () => void;
} 