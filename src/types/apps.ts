/**
 * 应用系统类型定义
 */

/**
 * 应用类型
 */
export interface App {
  id: string;
  name: string;
  description: string;
  icon: string;
  path: string;
  color: string;
  category: string;
  subcategory: string;
}

/**
 * 应用子分类
 */
export interface AppSubcategory {
  id: string;
  name: string;
  icon: string;
  apps: App[];
}

/**
 * 应用主分类
 */
export interface AppCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  subcategories: AppSubcategory[];
}

/**
 * 应用数据配置
 */
export const APP_DATA: AppCategory[] = [
  {
    id: 'study',
    name: '学习',
    icon: 'graduation-cap-1',
    color: 'linear-gradient(135deg, #0A84FF, #64D2FF)',
    subcategories: [
      {
        id: 'schedule',
        name: '课程管理',
        icon: 'calendar-days',
        apps: [
          {
            id: 'schedule-table',
            name: 'YUE的课表',
            description: '智能课程表管理系统，支持Excel导入、多课表管理',
            icon: 'book-1',
            path: '/apps/schedule',
            color: 'rgba(10, 132, 255, 0.15)',
            category: 'study',
            subcategory: 'schedule',
          },
        ],
      },
      {
        id: 'notes',
        name: '笔记工具',
        icon: 'pencil-1',
        apps: [
          // 预留位置
        ],
      },
      {
        id: 'exam',
        name: '考试复习',
        icon: 'certificate-badge-1',
        apps: [
          // 预留位置
        ],
      },
    ],
  },
  {
    id: 'entertainment',
    name: '娱乐',
    icon: 'game-pad-modern-1',
    color: 'linear-gradient(135deg, #FF6B6B, #FF8E8E)',
    subcategories: [
      {
        id: 'games',
        name: '小游戏',
        icon: 'game-pad-modern-1',
        apps: [
          // 预留位置
        ],
      },
      {
        id: 'music',
        name: '音乐',
        icon: 'music',
        apps: [
          // 预留位置
        ],
      },
    ],
  },
  {
    id: 'tools',
    name: '工具',
    icon: 'gear-1',
    color: 'linear-gradient(135deg, #48BB78, #68D391)',
    subcategories: [
      {
        id: 'calculator',
        name: '计算器',
        icon: 'calculator-1',
        apps: [
          // 预留位置
        ],
      },
      {
        id: 'converter',
        name: '转换工具',
        icon: 'refresh-circle-1-clockwise',
        apps: [
          // 预留位置
        ],
      },
    ],
  },
  {
    id: 'life',
    name: '生活',
    icon: 'home-2',
    color: 'linear-gradient(135deg, #9F7AEA, #B794F4)',
    subcategories: [
      {
        id: 'fitness',
        name: '健康健身',
        icon: 'heart-1',
        apps: [
          {
            id: 'fitness-tracker',
            name: '健身减脂记录',
            description: '记录身体数据、饮食摄入，智能计算热量，用数据见证你的改变',
            icon: 'heart-1',
            path: '/apps/fitness',
            color: 'rgba(255, 69, 122, 0.15)',
            category: 'life',
            subcategory: 'fitness',
          },
        ],
      },
      {
        id: 'weather',
        name: '天气',
        icon: 'cloud-2',
        apps: [
          // 预留位置
        ],
      },
      {
        id: 'todo',
        name: '待办事项',
        icon: 'check-circle-1',
        apps: [
          // 预留位置
        ],
      },
    ],
  },
];

/**
 * 获取所有应用
 */
export const getAllApps = (): App[] => {
  const apps: App[] = [];
  APP_DATA.forEach(category => {
    category.subcategories.forEach(subcategory => {
      apps.push(...subcategory.apps);
    });
  });
  return apps;
};

/**
 * 根据ID获取应用
 */
export const getAppById = (appId: string): App | undefined => {
  return getAllApps().find(app => app.id === appId);
};

/**
 * 根据分类获取应用
 */
export const getAppsByCategory = (categoryId: string): App[] => {
  const category = APP_DATA.find(cat => cat.id === categoryId);
  if (!category) return [];
  
  const apps: App[] = [];
  category.subcategories.forEach(subcategory => {
    apps.push(...subcategory.apps);
  });
  return apps;
};

