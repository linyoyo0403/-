export interface Student {
  id: string;
  name: string;
  number?: string; // Seat number or student ID
  note?: string;
}

export interface DrawRecord {
  id: string;
  student: Student;
  timestamp: Date;
  isRepeat: boolean;
}

export interface Group {
  id: string;
  name: string;
  color: string;
  leaderId?: string;
  members: Student[];
}

export type PickMode = 'no-repeat' | 'allow-repeat';
export type GroupingStrategy = 'by-member-count' | 'by-group-count';
export type RemainderStrategy = 'distribute' | 'new-group';
export type GroupNamingTheme = 'number' | 'colors' | 'animals' | 'elements';
