import { Student } from '../types';

export interface SimulationPreset {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  badge: string;
  students: Student[];
}

export const SAMPLE_STUDENTS: Student[] = [
  { id: 'std-1', number: '01', name: '王小明' },
  { id: 'std-2', number: '02', name: '李美華' },
  { id: 'std-3', number: '03', name: '張家豪' },
  { id: 'std-4', number: '04', name: '陳雅婷' },
  { id: 'std-5', number: '05', name: '林志偉' },
  { id: 'std-6', number: '06', name: '黃冠宇' },
  { id: 'std-7', number: '07', name: '吳佩珊' },
  { id: 'std-8', number: '08', name: '劉建宏' },
  { id: 'std-9', number: '09', name: '蔡宜靜' },
  { id: 'std-10', number: '10', name: '楊承恩' },
  { id: 'std-11', number: '11', name: '許哲銘' },
  { id: 'std-12', number: '12', name: '鄭惠雯' },
  { id: 'std-13', number: '13', name: '謝宗翰' },
  { id: 'std-14', number: '14', name: '洪子晴' },
  { id: 'std-15', number: '15', name: '曾宥翔' },
  { id: 'std-16', number: '16', name: '邱品萱' },
  { id: 'std-17', number: '17', name: '廖柏翰' },
  { id: 'std-18', number: '18', name: '賴郁婷' },
  { id: 'std-19', number: '19', name: '徐敬堯' },
  { id: 'std-20', number: '20', name: '周羽彤' },
  { id: 'std-21', number: '21', name: '葉宇軒' },
  { id: 'std-22', number: '22', name: '蘇欣怡' },
  { id: 'std-23', number: '23', name: '莊凱文' },
  { id: 'std-24', number: '24', name: '江依晨' },
  { id: 'std-25', number: '25', name: '呂睿恩' },
  { id: 'std-26', number: '26', name: '何佩芳' },
  { id: 'std-27', number: '27', name: '羅晨曦' },
  { id: 'std-28', number: '28', name: '高偉倫' },
  { id: 'std-29', number: '29', name: '蕭語彤' },
  { id: 'std-30', number: '30', name: '潘俊賢' }
];

// Preset 2: Simulation with Duplicate Names (for testing de-duplication)
export const DUPLICATE_DEMO_STUDENTS: Student[] = [
  { id: 'dup-1', number: '01', name: '王小明' },
  { id: 'dup-2', number: '02', name: '李美華' },
  { id: 'dup-3', number: '03', name: '張家豪' },
  { id: 'dup-4', number: '04', name: '陳雅婷' },
  { id: 'dup-5', number: '05', name: '王小明' }, // duplicate of #01
  { id: 'dup-6', number: '06', name: '林志偉' },
  { id: 'dup-7', number: '07', name: '陳雅婷' }, // duplicate of #04
  { id: 'dup-8', number: '08', name: '黃冠宇' },
  { id: 'dup-9', number: '09', name: '吳佩珊' },
  { id: 'dup-10', number: '10', name: '劉建宏' },
  { id: 'dup-11', number: '11', name: '張家豪' }, // duplicate of #03
  { id: 'dup-12', number: '12', name: '蔡宜靜' },
  { id: 'dup-13', number: '13', name: '楊承恩' },
  { id: 'dup-14', number: '14', name: '許哲銘' },
  { id: 'dup-15', number: '15', name: '鄭惠雯' },
  { id: 'dup-16', number: '16', name: '謝宗翰' },
  { id: 'dup-17', number: '17', name: '王小明' }, // 3rd occurrence of 王小明
  { id: 'dup-18', number: '18', name: '洪子晴' },
  { id: 'dup-19', number: '19', name: '曾宥翔' },
  { id: 'dup-20', number: '20', name: '邱品萱' },
];

// Preset 3: Small Group / Workshop (12 Students)
export const SMALL_CLASS_STUDENTS: Student[] = [
  { id: 'sc-1', number: '01', name: '林宥嘉' },
  { id: 'sc-2', number: '02', name: '陳綺貞' },
  { id: 'sc-3', number: '03', name: '周杰倫' },
  { id: 'sc-4', number: '04', name: '蔡依林' },
  { id: 'sc-5', number: '05', name: '盧廣仲' },
  { id: 'sc-6', number: '06', name: '田馥甄' },
  { id: 'sc-7', number: '07', name: '韋禮安' },
  { id: 'sc-8', number: '08', name: '徐佳瑩' },
  { id: 'sc-9', number: '09', name: '吳青峰' },
  { id: 'sc-10', number: '10', name: '梁靜茹' },
  { id: 'sc-11', number: '11', name: '李榮浩' },
  { id: 'sc-12', number: '12', name: '楊丞琳' },
];

// Preset 4: Large Lecture Class (40 Students)
export const LARGE_CLASS_STUDENTS: Student[] = [
  ...SAMPLE_STUDENTS,
  { id: 'lg-31', number: '31', name: '郭俊廷' },
  { id: 'lg-32', number: '32', name: '彭詩涵' },
  { id: 'lg-33', number: '33', name: '宋承憲' },
  { id: 'lg-34', number: '34', name: '魏敏捷' },
  { id: 'lg-35', number: '35', name: '韓雨軒' },
  { id: 'lg-36', number: '36', name: '石佳純' },
  { id: 'lg-37', number: '37', name: '丁宇翔' },
  { id: 'lg-38', number: '38', name: '白芷寧' },
  { id: 'lg-39', number: '39', name: '連敏萱' },
  { id: 'lg-40', number: '40', name: '嚴家成' },
];

export const SIMULATION_PRESETS: SimulationPreset[] = [
  {
    id: 'standard-30',
    title: '國小/國中 標準班級 (30人)',
    subtitle: '最常見的班級規模，適合抽籤與 5~6 組分組',
    description: '涵蓋座號 01~30，包含王小明、李美華等，適合快速體驗整體功能。',
    badge: '最推薦體驗',
    students: SAMPLE_STUDENTS,
  },
  {
    id: 'duplicate-test',
    title: '含「重複姓名」測試名單 (20人)',
    subtitle: '內含 4 筆同名學生，專門體驗「重複標記與一鍵去重」',
    description: '內含多次重複的「王小明」、「陳雅婷」、「張家豪」，可在預覽名單中看見醒目标記並一鍵移除！',
    badge: '去重功能測試',
    students: DUPLICATE_DEMO_STUDENTS,
  },
  {
    id: 'workshop-12',
    title: '專題討論 / 實驗小組 (12人)',
    subtitle: '小班精緻教學，適合 2~4 人小組分組與快速抽籤',
    description: '精選 12 位學員名單，抽籤速度快、分組緊湊清晰。',
    badge: '小型研討',
    students: SMALL_CLASS_STUDENTS,
  },
  {
    id: 'lecture-40',
    title: '大專通識 / 跨班大課程 (40人)',
    subtitle: '人數較多的課堂，適合測試 8 組大組自動分配',
    description: '滿額 40 人大型名單，考驗抽籤籤筒剩餘人數統計與多人分組效果。',
    badge: '大型班級',
    students: LARGE_CLASS_STUDENTS,
  },
];
