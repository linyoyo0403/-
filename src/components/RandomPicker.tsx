import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Student, DrawRecord, PickMode } from '../types';
import { soundFX } from '../utils/audio';
import { 
  Sparkles, 
  RotateCcw, 
  History, 
  HelpCircle, 
  Volume2, 
  VolumeX, 
  CheckCircle2, 
  AlertCircle,
  Play,
  Flame,
  Clock,
  Zap,
  ArrowRight,
  UserCheck,
  Undo2
} from 'lucide-react';

interface RandomPickerProps {
  students: Student[];
  onOpenRoster: () => void;
}

export const RandomPicker: React.FC<RandomPickerProps> = ({
  students,
  onOpenRoster,
}) => {
  // Settings
  const [pickMode, setPickMode] = useState<PickMode>('no-repeat');
  const [speedMode, setSpeedMode] = useState<'fast' | 'normal' | 'suspense'>('normal');

  // State
  const [isRolling, setIsRolling] = useState(false);
  const [currentDisplayName, setCurrentDisplayName] = useState<string>('準備抽籤');
  const [currentDisplayNumber, setCurrentDisplayNumber] = useState<string>('');
  const [winner, setWinner] = useState<Student | null>(null);
  const [drawHistory, setDrawHistory] = useState<DrawRecord[]>([]);
  const [excludedIds, setExcludedIds] = useState<Set<string>>(new Set());
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Remaining eligible students
  const availableStudents = students.filter((s) => {
    if (pickMode === 'allow-repeat') return true;
    return !excludedIds.has(s.id);
  });

  const animIntervalRef = useRef<number | null>(null);
  const animTimeoutRef = useRef<number | null>(null);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (animIntervalRef.current) clearInterval(animIntervalRef.current);
      if (animTimeoutRef.current) clearTimeout(animTimeoutRef.current);
    };
  }, []);

  // Trigger celebratory confetti
  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#ef4444', '#3b82f6', '#10b981', '#8b5cf6'],
      });
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0.15, y: 0.7 },
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 0.85, y: 0.7 },
        });
      }, 200);
    } catch {
      // safe ignore
    }
  };

  // Perform the random draw with dynamic slot machine deceleration
  const handleStartDraw = useCallback(() => {
    if (isRolling) return;
    if (students.length === 0) {
      onOpenRoster();
      return;
    }

    if (pickMode === 'no-repeat' && availableStudents.length === 0) {
      return;
    }

    setIsRolling(true);
    setWinner(null);

    // Pick a candidate index from available students
    const pool = availableStudents;
    const targetStudent = pool[Math.floor(Math.random() * pool.length)];

    // Configure timing based on speed mode
    let totalDuration = 2400;
    if (speedMode === 'fast') totalDuration = 1200;
    if (speedMode === 'suspense') totalDuration = 4500;

    const startTime = Date.now();
    let currentInterval = 45; // initial rolling speed (ms)
    let tickPitch = 1.0;

    const rollStep = () => {
      const elapsed = Date.now() - startTime;
      const progress = elapsed / totalDuration;

      // Pick random student from ALL students for visually rich shuffle animation
      const randStudent = students[Math.floor(Math.random() * students.length)];
      setCurrentDisplayName(randStudent.name);
      setCurrentDisplayNumber(randStudent.number || '');

      // Sound tick with pitch variation
      tickPitch = 0.8 + (1 - progress) * 0.5;
      soundFX.playTick(tickPitch);

      if (speedMode === 'suspense' && elapsed > 2000 && Math.random() < 0.2) {
        soundFX.playTensionPulse();
      }

      if (progress < 1) {
        // Non-linear deceleration: starts fast, slows down realistically near the end
        if (progress > 0.6) {
          currentInterval = 50 + Math.pow(progress, 3) * 350;
        } else if (progress > 0.3) {
          currentInterval = 60 + progress * 40;
        }
        animTimeoutRef.current = window.setTimeout(rollStep, currentInterval);
      } else {
        // Finish rolling! Land on final chosen winner
        setCurrentDisplayName(targetStudent.name);
        setCurrentDisplayNumber(targetStudent.number || '');
        setWinner(targetStudent);
        setIsRolling(false);

        // Sound fanfare & confetti
        soundFX.playWinnerFanfare();
        triggerConfetti();

        // Update exclusion and history
        if (pickMode === 'no-repeat') {
          setExcludedIds((prev) => new Set([...prev, targetStudent.id]));
        }

        const record: DrawRecord = {
          id: `draw-${Date.now()}`,
          student: targetStudent,
          timestamp: new Date(),
          isRepeat: pickMode === 'allow-repeat',
        };
        setDrawHistory((prev) => [record, ...prev]);
      }
    };

    rollStep();
  }, [isRolling, students, availableStudents, pickMode, speedMode, onOpenRoster]);

  // Keyboard shortcut: Spacebar to trigger draw
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in input or textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        handleStartDraw();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleStartDraw]);

  // Restore one student back into the pool
  const handleRestoreStudent = (studentId: string) => {
    setExcludedIds((prev) => {
      const next = new Set(prev);
      next.delete(studentId);
      return next;
    });
  };

  // Reset all exclusions
  const handleResetPool = () => {
    setExcludedIds(new Set());
    setWinner(null);
    setCurrentDisplayName('籤筒已重設');
    setCurrentDisplayNumber('');
  };

  const poolIsEmpty = pickMode === 'no-repeat' && availableStudents.length === 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Settings Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-stone-200/80 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Mode Selector: Repeat vs No-Repeat */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
            抽籤規則：
          </span>
          <div className="inline-flex bg-stone-100 p-1 rounded-xl border border-stone-200">
            <button
              onClick={() => {
                if (!isRolling) setPickMode('no-repeat');
              }}
              disabled={isRolling}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                pickMode === 'no-repeat'
                  ? 'bg-white text-amber-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5 text-amber-600" />
              <span>不重複抽取 (淘汰制)</span>
            </button>
            <button
              onClick={() => {
                if (!isRolling) setPickMode('allow-repeat');
              }}
              disabled={isRolling}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                pickMode === 'allow-repeat'
                  ? 'bg-white text-amber-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5 text-indigo-600" />
              <span>允許重複抽取</span>
            </button>
          </div>
        </div>

        {/* Speed / Suspense Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-stone-500 uppercase tracking-wider hidden lg:inline">
            動畫節奏：
          </span>
          <div className="inline-flex bg-stone-100 p-1 rounded-xl border border-stone-200">
            <button
              onClick={() => setSpeedMode('fast')}
              disabled={isRolling}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 ${
                speedMode === 'fast'
                  ? 'bg-white text-stone-900 shadow-2xs font-bold'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
              title="快速抽籤 (1.2秒)"
            >
              <Zap className="w-3 h-3 text-amber-500" />
              快速
            </button>
            <button
              onClick={() => setSpeedMode('normal')}
              disabled={isRolling}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 ${
                speedMode === 'normal'
                  ? 'bg-white text-stone-900 shadow-2xs font-bold'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
              title="標準節奏 (2.4秒)"
            >
              <Clock className="w-3 h-3 text-blue-500" />
              標準
            </button>
            <button
              onClick={() => setSpeedMode('suspense')}
              disabled={isRolling}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 ${
                speedMode === 'suspense'
                  ? 'bg-white text-stone-900 shadow-2xs font-bold'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
              title="懸疑大戲，漸緩刺激 (4.5秒)"
            >
              <Flame className="w-3 h-3 text-rose-500" />
              懸疑刺激
            </button>
          </div>

          {/* History Button */}
          <button
            onClick={() => setShowHistoryModal(true)}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 flex items-center gap-1.5 transition-colors"
            title="查看本次抽籤歷史紀錄"
          >
            <History className="w-3.5 h-3.5 text-stone-500" />
            <span className="hidden sm:inline">歷史紀錄</span>
            <span className="px-1.5 py-0.2 bg-stone-200 text-stone-700 font-bold rounded-full text-[10px]">
              {drawHistory.length}
            </span>
          </button>
        </div>
      </div>

      {/* Main Drawing Stage Area */}
      <div className="relative bg-gradient-to-b from-stone-900 via-stone-800 to-stone-950 text-white rounded-3xl p-6 sm:p-12 shadow-xl border border-stone-700/60 overflow-hidden flex flex-col items-center justify-center min-h-[380px] sm:min-h-[440px]">
        {/* Subtle decorative background circles */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Pool Count Indicator */}
        <div className="absolute top-5 left-6 right-6 flex items-center justify-between text-xs text-stone-400">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>
              {pickMode === 'no-repeat' ? (
                <>
                  籤筒剩餘：
                  <strong className="text-amber-400 text-sm font-mono ml-1">
                    {availableStudents.length}
                  </strong>{' '}
                  / {students.length} 人
                </>
              ) : (
                <>
                  全體可抽：
                  <strong className="text-amber-400 text-sm font-mono ml-1">
                    {students.length}
                  </strong>{' '}
                  人 (重複無限制)
                </>
              )}
            </span>
          </div>

          {pickMode === 'no-repeat' && excludedIds.size > 0 && (
            <button
              onClick={handleResetPool}
              disabled={isRolling}
              className="text-stone-400 hover:text-amber-300 flex items-center gap-1 transition-colors text-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>重設籤筒</span>
            </button>
          )}
        </div>

        {/* The Big Stage Display Card */}
        <div className="my-auto py-6 w-full max-w-xl text-center">
          {students.length === 0 ? (
            <div className="space-y-4 py-8">
              <p className="text-stone-400 text-sm">目前還沒有匯入學生名單</p>
              <button
                onClick={onOpenRoster}
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-sm transition-transform active:scale-95"
              >
                匯入名單或載入示範名單
              </button>
            </div>
          ) : poolIsEmpty ? (
            <div className="space-y-4 py-8">
              <div className="inline-flex p-3 rounded-full bg-amber-500/20 text-amber-400 mb-2">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-stone-100">籤筒內所有學生已抽完！</h3>
              <p className="text-stone-400 text-sm max-w-md mx-auto">
                已抽完全部 {students.length} 位學生。您可以點擊下方按鈕將全班放回籤筒，重新開始新的一輪。
              </p>
              <button
                onClick={handleResetPool}
                className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-base shadow-lg shadow-amber-500/30 transition-transform active:scale-95 flex items-center gap-2 mx-auto"
              >
                <RotateCcw className="w-5 h-5" />
                重新放回所有學生
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Seat number chip if available */}
              <div className="h-8 flex items-center justify-center">
                {currentDisplayNumber && (
                  <span className="px-3 py-1 rounded-full bg-stone-800 text-amber-400 border border-stone-700 text-xs font-mono font-bold tracking-wide">
                    座號 #{currentDisplayNumber}
                  </span>
                )}
              </div>

              {/* Main Name typography with dynamic motion */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentDisplayName + (isRolling ? 'rolling' : 'static')}
                  initial={{ scale: 0.95, opacity: 0.8 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.08 }}
                  className={`text-5xl sm:text-7xl font-black tracking-tight select-none py-2 ${
                    isRolling
                      ? 'text-amber-300 blur-[0.5px] scale-105 transition-all'
                      : winner
                      ? 'text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400'
                      : 'text-stone-300'
                  }`}
                >
                  {currentDisplayName}
                </motion.div>
              </AnimatePresence>

              {/* Winner Tag / Status */}
              <div className="h-7 flex items-center justify-center">
                {winner && !isRolling ? (
                  <motion.span
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-950/80 border border-emerald-700/60 px-3 py-0.5 rounded-full"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    恭喜抽中！
                  </motion.span>
                ) : isRolling ? (
                  <span className="text-xs text-amber-400/80 animate-pulse font-medium">
                    正在隨機抽取中...
                  </span>
                ) : (
                  <span className="text-xs text-stone-500">
                    點擊下方按鈕或按下鍵盤空白鍵開始
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action Button Controls */}
        <div className="w-full max-w-md flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-stone-800/80">
          <button
            onClick={handleStartDraw}
            disabled={isRolling || poolIsEmpty || students.length === 0}
            className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl font-black text-base shadow-xl flex items-center justify-center gap-2.5 transition-all active:scale-95 ${
              isRolling
                ? 'bg-stone-700 text-stone-400 cursor-not-allowed'
                : poolIsEmpty || students.length === 0
                ? 'bg-stone-800 text-stone-500 cursor-not-allowed'
                : 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-amber-500/25 hover:shadow-amber-500/40 hover:-translate-y-0.5'
            }`}
          >
            {isRolling ? (
              <>
                <RotateCcw className="w-5 h-5 animate-spin text-stone-400" />
                <span>抽籤進行中...</span>
              </>
            ) : winner ? (
              <>
                <Sparkles className="w-5 h-5 text-amber-900" />
                <span>抽出下一位同學</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                <span>開始隨機抽籤</span>
              </>
            )}
          </button>
        </div>

        {/* Keyboard shortcut tip */}
        <div className="mt-4 text-[11px] text-stone-500 flex items-center gap-1.5">
          <kbd className="px-1.5 py-0.5 rounded bg-stone-800 border border-stone-700 text-stone-300 font-mono text-[10px]">
            Space 空白鍵
          </kbd>
          <span>快速抽籤</span>
        </div>
      </div>

      {/* Bottom Information & Quick Pool Management Bar */}
      {pickMode === 'no-repeat' && excludedIds.size > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-stone-200/80">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-amber-600" />
              <h4 className="text-sm font-bold text-stone-900">
                本輪已抽中名單 ({excludedIds.size} / {students.length} 人)
              </h4>
            </div>
            <button
              onClick={handleResetPool}
              className="text-xs text-stone-500 hover:text-amber-700 flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              全部放回
            </button>
          </div>

          <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto pr-1">
            {Array.from(excludedIds).map((id: string) => {
              const student = students.find((s) => s.id === id);
              if (!student) return null;
              return (
                <div
                  key={id}
                  className="group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-100 border border-stone-200 text-xs font-medium text-stone-800 hover:bg-stone-200/70 transition-colors"
                >
                  {student.number && (
                    <span className="text-[10px] text-stone-500 font-mono">
                      #{student.number}
                    </span>
                  )}
                  <span>{student.name}</span>
                  <button
                    onClick={() => handleRestoreStudent(id)}
                    className="text-stone-400 hover:text-amber-700 ml-0.5"
                    title="將此同學放回籤筒"
                  >
                    <Undo2 className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col border border-stone-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-stone-600" />
                <h3 className="text-base font-bold text-stone-900">本次抽籤歷史紀錄</h3>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-xs text-stone-500 hover:text-stone-800 px-2 py-1 rounded"
              >
                關閉
              </button>
            </div>

            <div className="p-4 flex-1 overflow-y-auto">
              {drawHistory.length === 0 ? (
                <p className="text-center text-xs text-stone-400 py-8">
                  尚未有抽籤紀錄
                </p>
              ) : (
                <div className="space-y-2">
                  {drawHistory.map((record, index) => (
                    <div
                      key={record.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-200/80 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-[10px]">
                          {drawHistory.length - index}
                        </span>
                        <div>
                          <div className="font-bold text-stone-900">
                            {record.student.name}
                            {record.student.number && (
                              <span className="ml-1 text-[11px] font-mono text-stone-500">
                                (#{record.student.number})
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] text-stone-400 font-mono">
                        {record.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {drawHistory.length > 0 && (
              <div className="p-3 border-t border-stone-200 bg-stone-50 flex items-center justify-between">
                <button
                  onClick={() => setDrawHistory([])}
                  className="text-xs text-rose-600 hover:underline"
                >
                  清空歷史紀錄
                </button>
                <button
                  onClick={() => setShowHistoryModal(false)}
                  className="px-4 py-1.5 bg-stone-900 text-white rounded-lg text-xs font-bold"
                >
                  關閉
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
