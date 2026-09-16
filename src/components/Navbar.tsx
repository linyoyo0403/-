import React from 'react';
import { 
  Sparkles, 
  Users, 
  Dice5, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Minimize2,
  FolderOpen,
  GraduationCap
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'picker' | 'grouping';
  onTabChange: (tab: 'picker' | 'grouping') => void;
  studentCount: number;
  onOpenRoster: () => void;
  onOpenSimulation: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  studentCount,
  onOpenRoster,
  onOpenSimulation,
  isMuted,
  onToggleMute,
  isFullscreen,
  onToggleFullscreen,
}) => {
  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-stone-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-stone-900 tracking-tight flex items-center gap-1.5">
              <span>課堂學生抽籤與分組工具</span>
            </h1>
            <p className="text-[11px] text-stone-500 hidden sm:block">
              隨機抽籤動畫音效 · 自動分組視覺化
            </p>
          </div>
        </div>

        {/* Function Tabs */}
        <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200/80">
          <button
            onClick={() => onTabChange('picker')}
            className={`px-3.5 py-1.5 text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'picker'
                ? 'bg-white text-amber-900 shadow-xs scale-[1.02]'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>隨機抽籤</span>
          </button>
          <button
            onClick={() => onTabChange('grouping')}
            className={`px-3.5 py-1.5 text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'grouping'
                ? 'bg-white text-amber-900 shadow-xs scale-[1.02]'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Dice5 className="w-4 h-4 text-indigo-500" />
            <span>自動分組</span>
          </button>
        </div>

        {/* Roster & Controls */}
        <div className="flex items-center gap-2">
          {/* Quick Simulation Preset Button */}
          <button
            onClick={onOpenSimulation}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-colors shadow-2xs"
            title="查看並載入模擬名單範例（快速理解如何使用）"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">模擬名單</span>
          </button>

          {/* Roster Button */}
          <button
            onClick={onOpenRoster}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-stone-100 hover:bg-stone-200/80 text-stone-700 border border-stone-200 transition-colors"
            title="查看與管理學生名單"
          >
            <FolderOpen className="w-3.5 h-3.5 text-stone-500" />
            <span className="hidden md:inline">名單:</span>
            <span className="px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[11px]">
              {studentCount} 人
            </span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleMute}
            className={`w-9 h-9 flex items-center justify-center rounded-lg border transition-colors ${
              isMuted
                ? 'bg-stone-100 border-stone-300 text-stone-400 hover:text-stone-600'
                : 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
            }`}
            title={isMuted ? '解除靜音' : '靜音音效'}
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={onToggleFullscreen}
            className="w-9 h-9 hidden sm:flex items-center justify-center rounded-lg bg-stone-100 hover:bg-stone-200/80 border border-stone-200 text-stone-600 hover:text-stone-900 transition-colors"
            title={isFullscreen ? '退出全螢幕' : '全螢幕投影模式'}
            aria-label="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
