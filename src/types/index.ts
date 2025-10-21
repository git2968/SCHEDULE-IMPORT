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

// ========== 健身应用相关类型 ==========

export interface BodyRecord {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  weight?: number; // 体重 (kg)
  waistline?: number; // 腰围 (cm)
  hipline?: number; // 臀围 (cm)
  chest?: number; // 胸围 (cm)
  arm?: number; // 臂围 (cm)
  thigh?: number; // 腿围 (cm)
  bodyFat?: number; // 体脂率 (%)
  muscleMass?: number; // 肌肉量 (kg)
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FoodItem {
  name: string;
  amount: number; // 食物量（克）
  calories: number; // 卡路里
  protein?: number; // 蛋白质（克）
  carbs?: number; // 碳水化合物（克）
  fat?: number; // 脂肪（克）
}

export interface FoodRecord {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'; // 餐次
  foods: FoodItem[];
  totalCalories: number;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FitnessContextType {
  bodyRecords: BodyRecord[];
  foodRecords: FoodRecord[];
  loading: boolean;
  error: string | null;
  
  // 身体数据相关
  addBodyRecord: (record: Omit<BodyRecord, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateBodyRecord: (recordId: string, data: Partial<BodyRecord>) => Promise<void>;
  deleteBodyRecord: (recordId: string) => Promise<void>;
  getBodyRecordsByDateRange: (startDate: string, endDate: string) => BodyRecord[];
  
  // 饮食记录相关
  addFoodRecord: (record: Omit<FoodRecord, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateFoodRecord: (recordId: string, data: Partial<FoodRecord>) => Promise<void>;
  deleteFoodRecord: (recordId: string) => Promise<void>;
  getFoodRecordsByDate: (date: string) => FoodRecord[];
  getDailyCalories: (date: string) => number;
  
  // 数据加载
  loadUserData: () => Promise<void>;
} 