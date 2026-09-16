import React, { useState, useEffect } from 'react';
import { Student } from './types';
import { SAMPLE_STUDENTS } from './data/defaultStudents';
import { Navbar } from './components/Navbar';
import { RandomPicker } from './components/RandomPicker';
import { GroupGenerator } from './components/GroupGenerator';
import { RosterManager } from './components/RosterManager';
import { soundFX } from './utils/audio';
import { 
  Sparkles, 
  Dice5, 
  Users, 
  HelpCircle, 
  Info, 
  FileSpreadsheet,
  CheckCircle,
  Volume2
} from 'lucide-react';

const STORAGE_KEY = 'classroom_students_roster_v1';

export default function App() {
  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // safe fallback
    }
    return SAMPLE_STUDENTS;
  });

  const [activeTab, setActiveTab] = useState<'picker' | 'grouping'>('picker');
  const [isRosterOpen, setIsRosterOpen] = useState(false);
  const [rosterDefaultTab, setRosterDefaultTab] = useState<'simulation' | 'upload' | 'paste' | 'list'>('simulation');
  const [isMuted, setIsMuted] = useState(soundFX.getMuted());
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleOpenRoster = (tab: 'simulation' | 'upload' | 'paste' | 'list' = 'list') => {
    setRosterDefaultTab(tab);
    setIsRosterOpen(true);
  };

  // Sync students to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
    } catch {
      // safe ignore
    }
  }, [students]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const handleToggleMute = () => {
    const nextMuted = soundFX.toggleMute();
    setIsMuted(nextMuted);
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-100/70 text-stone-900 font-['Noto_Sans_TC',sans-serif]">
      {/* Top Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        studentCount={students.length}
        onOpenRoster={() => handleOpenRoster('list')}
        onOpenSimulation={() => handleOpenRoster('simulation')}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
      />

      {/* Main Content Stage */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {activeTab === 'picker' ? (
          <RandomPicker
            students={students}
            onOpenRoster={() => handleOpenRoster('list')}
          />
        ) : (
          <GroupGenerator
            students={students}
            onOpenRoster={() => handleOpenRoster('list')}
          />
        )}
      </main>

      {/* Footer Info & Quick Feature Tips */}
      <footer className="border-t border-stone-200 bg-white/70 py-4 px-4 sm:px-6 text-xs text-stone-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4">
            <span className="flex items-center gap-1 text-stone-600 font-medium">
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              支援直接貼上 Excel / Google 試算表及 CSV 格式
            </span>
            <span className="hidden md:inline text-stone-300">|</span>
            <span className="flex items-center gap-1 text-stone-600 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              支援空白鍵 (Space) 一鍵快速抽籤
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleOpenRoster('simulation')}
              className="text-indigo-700 hover:text-indigo-900 font-semibold underline"
            >
              載入示範模擬名單
            </button>
            <span className="text-stone-300">|</span>
            <button
              onClick={() => handleOpenRoster('list')}
              className="text-amber-700 hover:text-amber-800 font-semibold underline"
            >
              更換或編輯學生名單 ({students.length}人)
            </button>
          </div>
        </div>
      </footer>

      {/* Student Roster Management Modal */}
      <RosterManager
        students={students}
        onUpdateStudents={setStudents}
        isOpen={isRosterOpen}
        onClose={() => setIsRosterOpen(false)}
        defaultTab={rosterDefaultTab}
      />
    </div>
  );
}
