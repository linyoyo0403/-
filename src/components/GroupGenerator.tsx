import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Student, Group, GroupingStrategy, RemainderStrategy, GroupNamingTheme } from '../types';
import { soundFX } from '../utils/audio';
import { 
  Users, 
  Shuffle, 
  Copy, 
  Download, 
  Crown, 
  Check, 
  Sparkles, 
  Settings2,
  ArrowRightLeft,
  ChevronDown,
  Layers,
  Palette
} from 'lucide-react';

interface GroupGeneratorProps {
  students: Student[];
  onOpenRoster: () => void;
}

const THEME_NAMES: Record<GroupNamingTheme, string[]> = {
  number: ['第 1 組', '第 2 組', '第 3 組', '第 4 組', '第 5 組', '第 6 組', '第 7 組', '第 8 組', '第 9 組', '第 10 組', '第 11 組', '第 12 組', '第 13 組', '第 14 組', '第 15 組'],
  colors: ['紅寶石隊', '藍晶石隊', '翡翠綠隊', '琥珀金隊', '紫羅蘭隊', '珊瑚粉隊', '綠松石隊', '青金石隊', '銀白隊', '耀黑隊', '銅橙隊', '靛藍隊'],
  animals: ['獵鷹隊', '雄獅隊', '海豚隊', '飛龍隊', '靈狐隊', '巨熊隊', '雪豹隊', '金雕隊', '獨角獸隊', '靈鹿隊', '海龜隊', '白虎隊'],
  elements: ['烈火隊', '寒冰隊', '疾風隊', '雷霆隊', '磐石隊', '潮汐隊', '星辰隊', '聖光隊', '暗影隊', '自然隊', '極光隊', '晨曦隊'],
};

const GROUP_PALETTES = [
  { header: 'bg-amber-500 text-white', badge: 'bg-amber-100 text-amber-900 border-amber-200', border: 'border-amber-200' },
  { header: 'bg-indigo-600 text-white', badge: 'bg-indigo-100 text-indigo-900 border-indigo-200', border: 'border-indigo-200' },
  { header: 'bg-emerald-600 text-white', badge: 'bg-emerald-100 text-emerald-900 border-emerald-200', border: 'border-emerald-200' },
  { header: 'bg-rose-500 text-white', badge: 'bg-rose-100 text-rose-900 border-rose-200', border: 'border-rose-200' },
  { header: 'bg-cyan-600 text-white', badge: 'bg-cyan-100 text-cyan-900 border-cyan-200', border: 'border-cyan-200' },
  { header: 'bg-purple-600 text-white', badge: 'bg-purple-100 text-purple-900 border-purple-200', border: 'border-purple-200' },
  { header: 'bg-orange-500 text-white', badge: 'bg-orange-100 text-orange-900 border-orange-200', border: 'border-orange-200' },
  { header: 'bg-teal-600 text-white', badge: 'bg-teal-100 text-teal-900 border-teal-200', border: 'border-teal-200' },
  { header: 'bg-blue-600 text-white', badge: 'bg-blue-100 text-blue-900 border-blue-200', border: 'border-blue-200' },
  { header: 'bg-fuchsia-600 text-white', badge: 'bg-fuchsia-100 text-fuchsia-900 border-fuchsia-200', border: 'border-fuchsia-200' },
  { header: 'bg-lime-600 text-white', badge: 'bg-lime-100 text-lime-900 border-lime-200', border: 'border-lime-200' },
  { header: 'bg-slate-700 text-white', badge: 'bg-slate-100 text-slate-900 border-slate-200', border: 'border-slate-200' },
];

export const GroupGenerator: React.FC<GroupGeneratorProps> = ({
  students,
  onOpenRoster,
}) => {
  // Settings
  const [strategy, setStrategy] = useState<GroupingStrategy>('by-member-count');
  const [memberCountPerGroup, setMemberCountPerGroup] = useState<number>(4);
  const [totalGroupCount, setTotalGroupCount] = useState<number>(5);
  const [remainderStrategy, setRemainderStrategy] = useState<RemainderStrategy>('distribute');
  const [theme, setTheme] = useState<GroupNamingTheme>('number');
  const [autoPickLeader, setAutoPickLeader] = useState<boolean>(true);

  // Grouping Result
  const [groups, setGroups] = useState<Group[]>([]);
  const [copied, setCopied] = useState(false);
  const [csvDownloaded, setCsvDownloaded] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const [movingStudent, setMovingStudent] = useState<{ student: Student; sourceGroupId: string } | null>(null);

  // Execute grouping calculation
  const generateGroups = () => {
    if (students.length === 0) return;

    setIsShuffling(true);
    soundFX.playShuffleDeck();

    // Fisher-Yates shuffle a cloned list of students
    const shuffled = [...students];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    let calculatedNumGroups = 1;

    if (strategy === 'by-member-count') {
      const targetSize = Math.max(1, memberCountPerGroup);
      if (remainderStrategy === 'distribute') {
        calculatedNumGroups = Math.max(1, Math.round(shuffled.length / targetSize));
      } else {
        calculatedNumGroups = Math.max(1, Math.ceil(shuffled.length / targetSize));
      }
    } else {
      calculatedNumGroups = Math.min(Math.max(1, totalGroupCount), shuffled.length);
    }

    // Distribute students evenly into calculatedNumGroups
    const newGroups: Group[] = [];
    const themePool = THEME_NAMES[theme] || THEME_NAMES.number;

    for (let i = 0; i < calculatedNumGroups; i++) {
      const colorIdx = i % GROUP_PALETTES.length;
      const groupName = themePool[i] || `第 ${i + 1} 組`;
      newGroups.push({
        id: `group-${i + 1}`,
        name: groupName,
        color: colorIdx.toString(),
        members: [],
      });
    }

    // Round-robin distribution
    shuffled.forEach((student, index) => {
      const targetGroup = newGroups[index % calculatedNumGroups];
      targetGroup.members.push(student);
    });

    // Auto assign leaders if requested
    if (autoPickLeader) {
      newGroups.forEach((g) => {
        if (g.members.length > 0) {
          const randLeader = g.members[Math.floor(Math.random() * g.members.length)];
          g.leaderId = randLeader.id;
        }
      });
    }

    setTimeout(() => {
      setGroups(newGroups);
      setIsShuffling(false);
      soundFX.playWinnerFanfare();
    }, 300);
  };

  // Initial group generation when component mounts or student roster count changes
  useEffect(() => {
    if (students.length > 0 && groups.length === 0) {
      generateGroups();
    }
  }, [students.length]);

  // Toggle leader for a specific group
  const handleToggleLeader = (groupId: string, studentId: string) => {
    setGroups((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g;
        return {
          ...g,
          leaderId: g.leaderId === studentId ? undefined : studentId,
        };
      })
    );
  };

  // Move student to another group
  const handleMoveToGroup = (targetGroupId: string) => {
    if (!movingStudent) return;
    const { student, sourceGroupId } = movingStudent;
    if (sourceGroupId === targetGroupId) {
      setMovingStudent(null);
      return;
    }

    setGroups((prev) =>
      prev.map((g) => {
        if (g.id === sourceGroupId) {
          return {
            ...g,
            leaderId: g.leaderId === student.id ? undefined : g.leaderId,
            members: g.members.filter((m) => m.id !== student.id),
          };
        }
        if (g.id === targetGroupId) {
          return {
            ...g,
            members: [...g.members, student],
          };
        }
        return g;
      })
    );

    setMovingStudent(null);
  };

  // Copy result as formatted text to clipboard
  const handleCopyText = () => {
    if (groups.length === 0) return;
    let text = `【分組名單】共 ${students.length} 人，分成 ${groups.length} 組\n\n`;

    groups.forEach((g) => {
      text += `📌 ${g.name} (${g.members.length}人):\n`;
      const memberNames = g.members.map((m) => {
        const isLeader = m.id === g.leaderId;
        const num = m.number ? `#${m.number} ` : '';
        return `${num}${m.name}${isLeader ? ' (組長👑)' : ''}`;
      });
      text += memberNames.join('、 ') + '\n\n';
    });

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Export grouping as CSV
  const handleExportCSV = () => {
    if (groups.length === 0) return;
    const rows = ['組別,座號,姓名,角色,該組總人數'];
    groups.forEach((g) => {
      g.members.forEach((m) => {
        const role = m.id === g.leaderId ? '組長 👑' : '組員';
        rows.push(`"${g.name}","${m.number || ''}","${m.name}","${role}","${g.members.length}人"`);
      });
    });

    const blob = new Blob(['\uFEFF' + rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const dateStr = new Date().toISOString().slice(0, 10);
    link.setAttribute('download', `班級分組結果_${groups.length}組_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setCsvDownloaded(true);
    setTimeout(() => setCsvDownloaded(false), 2500);
  };

  if (students.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
          <Users className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-stone-900">目前尚無學生名單</h3>
        <p className="text-sm text-stone-500 max-w-sm mx-auto">
          請先上傳 CSV 或貼上學生名單，即可進行智慧自動分組。
        </p>
        <button
          onClick={onOpenRoster}
          className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-sm transition-transform active:scale-95 shadow-xs"
        >
          前往匯入學生名單
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Grouping Configuration Panel */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-stone-200/80">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          {/* Settings Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full lg:w-auto flex-1">
            {/* Strategy Choice */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-600 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-stone-500" />
                分組依據
              </label>
              <div className="grid grid-cols-2 gap-1 bg-stone-100 p-1 rounded-xl border border-stone-200">
                <button
                  type="button"
                  onClick={() => setStrategy('by-member-count')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all text-center ${
                    strategy === 'by-member-count'
                      ? 'bg-white text-stone-900 shadow-2xs'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  設定每組人數
                </button>
                <button
                  type="button"
                  onClick={() => setStrategy('by-group-count')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all text-center ${
                    strategy === 'by-group-count'
                      ? 'bg-white text-stone-900 shadow-2xs'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  設定總組數
                </button>
              </div>
            </div>

            {/* Numerical Setting Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-600 flex items-center justify-between">
                <span>
                  {strategy === 'by-member-count' ? '每組人數：' : '欲分成組數：'}
                </span>
                <span className="font-mono text-amber-700 font-extrabold text-sm">
                  {strategy === 'by-member-count'
                    ? `${memberCountPerGroup} 人 / 組`
                    : `${totalGroupCount} 組`}
                </span>
              </label>
              <div className="flex items-center gap-2">
                {strategy === 'by-member-count' ? (
                  <div className="flex items-center gap-1.5 w-full">
                    {[2, 3, 4, 5, 6].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setMemberCountPerGroup(num)}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                          memberCountPerGroup === num
                            ? 'bg-amber-500 text-stone-950 border-amber-600 shadow-2xs font-extrabold'
                            : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                        }`}
                      >
                        {num}人
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 w-full">
                    {[3, 4, 5, 6, 8].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setTotalGroupCount(num)}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                          totalGroupCount === num
                            ? 'bg-amber-500 text-stone-950 border-amber-600 shadow-2xs font-extrabold'
                            : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                        }`}
                      >
                        {num}組
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Theme & Extras */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-600 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-stone-500" />
                組別命名風格
              </label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value as GroupNamingTheme)}
                className="w-full px-3 py-1.5 text-xs font-semibold rounded-xl border border-stone-200 bg-stone-50 text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500/50"
              >
                <option value="number">數字組 (第 1 組、第 2 組...)</option>
                <option value="colors">繽紛色彩 (紅寶石、藍晶石...)</option>
                <option value="animals">神獸動物 (獵鷹、雄獅、飛龍...)</option>
                <option value="elements">自然元素 (烈火、雷霆、星辰...)</option>
              </select>
            </div>
          </div>

          {/* Action Shuffle Button & Quick Export */}
          <div className="w-full lg:w-auto flex flex-row lg:flex-col items-center gap-2">
            <button
              onClick={generateGroups}
              disabled={isShuffling}
              className="flex-1 lg:w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold rounded-xl text-sm shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Shuffle className={`w-4 h-4 ${isShuffling ? 'animate-spin' : ''}`} />
              <span>{groups.length > 0 ? '重新隨機分組' : '立即自動分組'}</span>
            </button>
            {groups.length > 0 && (
              <button
                type="button"
                onClick={handleExportCSV}
                className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                title="下載分組結果 CSV"
              >
                <Download className="w-3.5 h-3.5 text-emerald-700" />
                <span>下載分組 CSV</span>
              </button>
            )}
          </div>
        </div>

        {/* Additional Toggles (Leader & Distribution) */}
        <div className="mt-4 pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-600">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autoPickLeader}
                onChange={(e) => {
                  setAutoPickLeader(e.target.checked);
                  if (e.target.checked && groups.length > 0) {
                    setGroups((prev) =>
                      prev.map((g) => ({
                        ...g,
                        leaderId:
                          g.members.length > 0
                            ? g.members[Math.floor(Math.random() * g.members.length)].id
                            : undefined,
                      }))
                    );
                  } else {
                    setGroups((prev) => prev.map((g) => ({ ...g, leaderId: undefined })));
                  }
                }}
                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-stone-300"
              />
              <span className="font-semibold text-stone-800 flex items-center gap-1">
                <Crown className="w-3.5 h-3.5 text-amber-500" />
                每組自動隨機指定一名「組長」
              </span>
            </label>
          </div>

          <div className="text-[11px] text-stone-500">
            名單共 <strong>{students.length}</strong> 人 · 目前分為 <strong>{groups.length}</strong> 組
          </div>
        </div>
      </div>

      {/* Group Cards Grid Header Bar */}
      {groups.length > 0 && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 px-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h3 className="text-base font-bold text-stone-900">
              分組結果展示
            </h3>
            <span className="text-xs text-stone-500">
              (點擊學生可指定為組長或調動組別)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyText}
              className="px-3 py-1.5 text-xs font-semibold bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">已複製文字！</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-stone-500" />
                  <span>複製結果文字</span>
                </>
              )}
            </button>
            <button
              onClick={handleExportCSV}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-2xs transition-all ${
                csvDownloaded
                  ? 'bg-emerald-600 text-white border border-emerald-600'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300'
              }`}
              title="下載分組名單為 CSV 檔案 (可直接用 Excel / Google 試算表開啟)"
            >
              {csvDownloaded ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>已下載 CSV 檔案！</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 text-emerald-700" />
                  <span>下載分組結果 (CSV)</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Moving Student Helper Notice */}
      {movingStudent && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="w-4 h-4 text-amber-600 animate-pulse" />
            <span>
              正在調動 <strong>{movingStudent.student.name}</strong> 的組別：請點選目標組別的「移至此組」按鈕完成調整
            </span>
          </div>
          <button
            onClick={() => setMovingStudent(null)}
            className="text-xs font-bold text-amber-800 hover:underline ml-2"
          >
            取消調動
          </button>
        </div>
      )}

      {/* Visualized Group Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {groups.map((group, groupIdx) => {
          const palette = GROUP_PALETTES[parseInt(group.color, 10) % GROUP_PALETTES.length];
          const isSourceOfMove = movingStudent?.sourceGroupId === group.id;

          return (
            <motion.div
              key={group.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: groupIdx * 0.04 }}
              className={`bg-white rounded-2xl border shadow-xs overflow-hidden flex flex-col transition-all hover:shadow-md ${
                isSourceOfMove ? 'ring-2 ring-amber-400 opacity-80' : 'border-stone-200/90'
              }`}
            >
              {/* Group Card Header */}
              <div
                className={`px-4 py-3 flex items-center justify-between ${palette.header}`}
              >
                <div className="flex items-center gap-2">
                  <h4 className="font-black text-sm tracking-tight">{group.name}</h4>
                </div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-black/20 text-white backdrop-blur-xs">
                  {group.members.length} 人
                </span>
              </div>

              {/* Group Members List */}
              <div className="p-3.5 flex-1 space-y-2">
                {group.members.length === 0 ? (
                  <div className="py-6 text-center text-stone-400 text-xs italic">
                    此組暫無成員
                  </div>
                ) : (
                  group.members.map((member) => {
                    const isLeader = member.id === group.leaderId;
                    const isBeingMoved = movingStudent?.student.id === member.id;

                    return (
                      <div
                        key={member.id}
                        className={`group flex items-center justify-between p-2 rounded-xl transition-all ${
                          isBeingMoved
                            ? 'bg-amber-100 border border-amber-300'
                            : isLeader
                            ? 'bg-amber-50/80 border border-amber-200'
                            : 'bg-stone-50 hover:bg-stone-100 border border-stone-200/70'
                        }`}
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          {/* Seat number */}
                          {member.number && (
                            <span className="text-[10px] font-mono font-bold text-stone-500 bg-white border border-stone-200 px-1.5 py-0.5 rounded">
                              #{member.number}
                            </span>
                          )}
                          <span className="text-xs font-semibold text-stone-800 truncate">
                            {member.name}
                          </span>
                          {/* Leader crown badge */}
                          {isLeader && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-700 bg-amber-200/80 px-1.5 py-0.2 rounded-full">
                              <Crown className="w-2.5 h-2.5 fill-amber-500 text-amber-600" />
                              組長
                            </span>
                          )}
                        </div>

                        {/* Actions on student: Toggle leader or move */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleToggleLeader(group.id, member.id)}
                            className={`p-1 rounded text-[11px] ${
                              isLeader
                                ? 'text-amber-600 hover:bg-amber-100'
                                : 'text-stone-400 hover:text-amber-600 hover:bg-stone-200'
                            }`}
                            title={isLeader ? '取消組長身份' : '設為此組組長'}
                          >
                            <Crown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() =>
                              setMovingStudent({
                                student: member,
                                sourceGroupId: group.id,
                              })
                            }
                            className="p-1 rounded text-stone-400 hover:text-indigo-600 hover:bg-stone-200"
                            title="調動到其他組別"
                          >
                            <ArrowRightLeft className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Move Destination Action Footer */}
              {movingStudent && movingStudent.sourceGroupId !== group.id && (
                <div className="p-2 border-t border-stone-100 bg-amber-50/50">
                  <button
                    onClick={() => handleMoveToGroup(group.id)}
                    className="w-full py-1.5 text-xs font-bold text-amber-900 bg-amber-200/80 hover:bg-amber-300 rounded-lg transition-colors flex items-center justify-center gap-1"
                  >
                    <span>將 {movingStudent.student.name} 移至此組</span>
                  </button>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
