import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Student } from '../types';
import { parseStudentInput, exportRosterToCSV } from '../utils/csvParser';
import { SIMULATION_PRESETS, SimulationPreset } from '../data/defaultStudents';
import { 
  Upload, 
  FileText, 
  Trash2, 
  UserPlus, 
  Download, 
  RotateCcw, 
  Check, 
  AlertCircle,
  AlertTriangle,
  Users,
  Search,
  X,
  Sparkles,
  Filter,
  CheckCheck,
  BookOpen
} from 'lucide-react';

interface RosterManagerProps {
  students: Student[];
  onUpdateStudents: (students: Student[]) => void;
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'simulation' | 'upload' | 'paste' | 'list';
}

export const RosterManager: React.FC<RosterManagerProps> = ({
  students,
  onUpdateStudents,
  isOpen,
  onClose,
  defaultTab = 'simulation',
}) => {
  const [activeTab, setActiveTab] = useState<'simulation' | 'upload' | 'paste' | 'list'>(defaultTab);

  useEffect(() => {
    if (isOpen && defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [isOpen, defaultTab]);

  const [pasteText, setPasteText] = useState('');
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentNumber, setNewStudentNumber] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [showOnlyDuplicates, setShowOnlyDuplicates] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Compute duplicate names map & stats
  const { nameFrequencyMap, duplicateStudentsList, duplicateNameStrings } = useMemo(() => {
    const map = new Map<string, number>();
    students.forEach((s) => {
      const clean = s.name.trim();
      if (clean) {
        map.set(clean, (map.get(clean) || 0) + 1);
      }
    });

    const dupStrings: string[] = [];
    map.forEach((count, name) => {
      if (count > 1) {
        dupStrings.push(name);
      }
    });

    const dupList = students.filter((s) => (map.get(s.name.trim()) || 0) > 1);

    return {
      nameFrequencyMap: map,
      duplicateStudentsList: dupList,
      duplicateNameStrings: dupStrings,
    };
  }, [students]);

  if (!isOpen) return null;

  const showAlert = (text: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setAlertMessage({ text, type });
    setTimeout(() => setAlertMessage(null), 4000);
  };

  const handleFileUpload = (file: File) => {
    if (!file.name.endsWith('.csv') && !file.name.endsWith('.txt')) {
      showAlert('請上傳 .csv 或 .txt 格式的檔案', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const parsed = parseStudentInput(content);
      if (parsed.length > 0) {
        onUpdateStudents(parsed);
        // Check if there are duplicates
        const tempMap = new Map<string, number>();
        parsed.forEach((s) => tempMap.set(s.name.trim(), (tempMap.get(s.name.trim()) || 0) + 1));
        let dupCount = 0;
        tempMap.forEach((cnt) => {
          if (cnt > 1) dupCount += cnt - 1;
        });

        if (dupCount > 0) {
          showAlert(`成功匯入 ${parsed.length} 位學生！⚠️ 注意：偵測到 ${dupCount} 筆重複姓名，已為您自動標記。`, 'warning');
        } else {
          showAlert(`成功匯入 ${parsed.length} 位學生！`);
        }
        setActiveTab('list');
      } else {
        showAlert('未能從檔案中解析出學生姓名，請檢查檔案格式', 'error');
      }
    };
    reader.onerror = () => {
      showAlert('讀取檔案失敗，請重試', 'error');
    };
    reader.readAsText(file, 'utf-8');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handlePasteSubmit = () => {
    const parsed = parseStudentInput(pasteText);
    if (parsed.length > 0) {
      onUpdateStudents(parsed);
      const tempMap = new Map<string, number>();
      parsed.forEach((s) => tempMap.set(s.name.trim(), (tempMap.get(s.name.trim()) || 0) + 1));
      let dupCount = 0;
      tempMap.forEach((cnt) => {
        if (cnt > 1) dupCount += cnt - 1;
      });

      if (dupCount > 0) {
        showAlert(`成功匯入 ${parsed.length} 位學生！⚠️ 注意：偵測到 ${dupCount} 筆重複姓名，已在預覽中標記。`, 'warning');
      } else {
        showAlert(`成功匯入 ${parsed.length} 位學生！`);
      }
      setPasteText('');
      setActiveTab('list');
    } else {
      showAlert('請輸入至少一位學生的姓名', 'error');
    }
  };

  // Load a simulation preset
  const handleLoadPreset = (preset: SimulationPreset) => {
    onUpdateStudents(preset.students);
    setShowOnlyDuplicates(false);
    showAlert(`已成功套用模擬名單：「${preset.title}」！`);
    setActiveTab('list');
  };

  // One-click Deduplication: Keep the first occurrence of each unique name
  const handleRemoveDuplicates = () => {
    const seenNames = new Set<string>();
    const uniqueStudents: Student[] = [];
    let removedCount = 0;

    students.forEach((student) => {
      const cleanName = student.name.trim();
      if (!seenNames.has(cleanName)) {
        seenNames.add(cleanName);
        uniqueStudents.push(student);
      } else {
        removedCount++;
      }
    });

    onUpdateStudents(uniqueStudents);
    setShowOnlyDuplicates(false);
    showAlert(`✨ 已一次性移除 ${removedCount} 筆重複學生姓名，保留每位同學的首筆紀錄！`, 'success');
  };

  const handleAddSingleStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim()) return;

    const nextNumber = newStudentNumber.trim() || String(students.length + 1).padStart(2, '0');
    const newStudent: Student = {
      id: `std-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: newStudentName.trim(),
      number: nextNumber,
    };

    onUpdateStudents([...students, newStudent]);
    setNewStudentName('');
    setNewStudentNumber('');
    showAlert(`已新增學生：${newStudent.name}`);
  };

  const handleDeleteStudent = (id: string) => {
    const target = students.find((s) => s.id === id);
    onUpdateStudents(students.filter((s) => s.id !== id));
    if (target) {
      showAlert(`已移除學生：${target.name}`);
    }
  };

  const handleClearAll = () => {
    if (window.confirm('確定要清空所有學生名單嗎？')) {
      onUpdateStudents([]);
      showAlert('已清空學生名單');
    }
  };

  const handleExportCSV = () => {
    if (students.length === 0) {
      showAlert('目前名單為空，無法匯出', 'error');
      return;
    }
    const csvData = exportRosterToCSV(students);
    const blob = new Blob(['\uFEFF' + csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `班級學生名單_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showAlert('已成功下載名單 CSV！');
  };

  // Filter logic: Search keyword & duplicate filter
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      (s.number && s.number.includes(searchKeyword));

    if (!matchesSearch) return false;
    if (showOnlyDuplicates) {
      return (nameFrequencyMap.get(s.name.trim()) || 0) > 1;
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden border border-stone-200">
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold shadow-2xs">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-stone-900">
                學生名單來源與管理
              </h2>
              <p className="text-xs text-stone-500">
                目前名單：<span className="font-bold text-amber-700">{students.length}</span> 位學生
                {duplicateNameStrings.length > 0 && (
                  <span className="ml-2 text-rose-600 font-semibold inline-flex items-center gap-0.5">
                    <AlertTriangle className="w-3 h-3" />
                    含 {duplicateNameStrings.length} 組重複姓名
                  </span>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors"
            title="關閉"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Alert Notification */}
        {alertMessage && (
          <div
            className={`px-6 py-2.5 flex items-center gap-2 text-xs sm:text-sm font-medium transition-all ${
              alertMessage.type === 'error'
                ? 'bg-rose-50 text-rose-700 border-b border-rose-200'
                : alertMessage.type === 'warning'
                ? 'bg-amber-50 text-amber-800 border-b border-amber-200'
                : 'bg-emerald-50 text-emerald-700 border-b border-emerald-200'
            }`}
          >
            {alertMessage.type === 'error' ? (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            ) : alertMessage.type === 'warning' ? (
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
            ) : (
              <Check className="w-4 h-4 shrink-0 text-emerald-600" />
            )}
            <span>{alertMessage.text}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-stone-200 bg-stone-100/80 px-4 sm:px-6 pt-2 gap-1 sm:gap-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('simulation')}
            className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold rounded-t-lg transition-colors flex items-center gap-1.5 shrink-0 ${
              activeTab === 'simulation'
                ? 'bg-white text-indigo-900 border-t-2 border-indigo-600 shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            模擬名單 (快速體驗)
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold rounded-t-lg transition-colors flex items-center gap-1.5 shrink-0 ${
              activeTab === 'upload'
                ? 'bg-white text-amber-800 border-t-2 border-amber-600 shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            上傳 CSV
          </button>
          <button
            onClick={() => setActiveTab('paste')}
            className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold rounded-t-lg transition-colors flex items-center gap-1.5 shrink-0 ${
              activeTab === 'paste'
                ? 'bg-white text-amber-800 border-t-2 border-amber-600 shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            貼上名單
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold rounded-t-lg transition-colors flex items-center gap-1.5 shrink-0 ${
              activeTab === 'list'
                ? 'bg-white text-amber-800 border-t-2 border-amber-600 shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            預覽與編輯 ({students.length})
            {duplicateNameStrings.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            )}
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* TAB 1: 模擬名單 (Simulation Presets) */}
          {activeTab === 'simulation' && (
            <div className="space-y-4">
              <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-xl p-3.5 text-xs text-indigo-950 flex items-start gap-2.5">
                <BookOpen className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-indigo-900 text-sm mb-0.5">
                    💡 給老師的快速上手教學
                  </p>
                  <p className="text-indigo-800/90 leading-relaxed">
                    點擊下方任一「模擬名單」即可立即將範例學生載入網站。您可以直接體驗
                    <strong>「隨機抽籤」</strong>的懸疑動畫音效，或切換到
                    <strong>「自動分組」</strong>查看視覺化卡片！若想測試去重功能，請選擇「含重複姓名測試名單」。
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {SIMULATION_PRESETS.map((preset) => (
                  <div
                    key={preset.id}
                    className="border border-stone-200 rounded-xl p-4 bg-white hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800">
                          {preset.badge}
                        </span>
                        <span className="text-xs font-mono font-bold text-stone-500">
                          共 {preset.students.length} 人
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-stone-900 group-hover:text-indigo-600 transition-colors">
                        {preset.title}
                      </h4>
                      <p className="text-xs text-stone-600 mt-1 mb-2 font-medium">
                        {preset.subtitle}
                      </p>
                      <p className="text-[11px] text-stone-500 leading-relaxed">
                        {preset.description}
                      </p>
                    </div>

                    <button
                      onClick={() => handleLoadPreset(preset)}
                      className="mt-4 w-full py-2 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white border border-indigo-200 hover:border-indigo-600 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-2xs"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      載入此模擬名單
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: 上傳 CSV */}
          {activeTab === 'upload' && (
            <div className="space-y-5">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                  dragActive
                    ? 'border-amber-500 bg-amber-50/70 scale-[0.99]'
                    : 'border-stone-300 hover:border-amber-400 hover:bg-stone-50/80'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.txt"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileUpload(e.target.files[0]);
                    }
                  }}
                />
                <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-3">
                  <Upload className="w-7 h-7" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-stone-800 mb-1">
                  點擊或拖放 CSV 檔案至此處上傳
                </h3>
                <p className="text-xs text-stone-500 max-w-md mx-auto mb-3">
                  支援標準 <strong>.csv</strong> 或 <strong>.txt</strong> 格式。<br />
                  系統將自動辨識標頭與座號姓名，若有重複姓名會自動標註。
                </p>
                <span className="inline-block px-4 py-1.5 text-xs font-semibold text-amber-800 bg-amber-100 rounded-lg">
                  選擇本機檔案
                </span>
              </div>

              {/* Quick simulation helper link */}
              <div className="p-3.5 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-stone-800">不想先找檔案？</h4>
                  <p className="text-[11px] text-stone-500">直接使用內建模擬名單即可體驗所有功能</p>
                </div>
                <button
                  onClick={() => setActiveTab('simulation')}
                  className="px-3 py-1.5 text-xs font-bold bg-white text-indigo-700 border border-stone-300 hover:border-indigo-400 rounded-lg shadow-2xs transition-colors"
                >
                  查看模擬名單
                </button>
              </div>

              {/* Format Guide */}
              <div className="text-xs text-stone-500 space-y-1 bg-stone-50 p-3.5 rounded-xl border border-stone-200">
                <p className="font-semibold text-stone-700">📌 支援的格式範例：</p>
                <code className="block bg-white p-2 rounded border border-stone-200 text-stone-700 font-mono text-[11px]">
                  01, 王小明<br />
                  02, 李美華<br />
                  03, 張家豪
                </code>
              </div>
            </div>
          )}

          {/* TAB 3: 直接貼上名單 */}
          {activeTab === 'paste' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-stone-800 mb-1.5">
                  貼上學生名單
                </label>
                <p className="text-xs text-stone-500 mb-2">
                  可直接從 Excel、Google 試算表複製貼上，或一行輸入一位學生姓名。
                </p>
                <textarea
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                  placeholder={`例如：\n王小明\n李美華\n張家豪\n\n或附帶座號：\n1\t陳雅婷\n2\t林志偉`}
                  rows={8}
                  className="w-full rounded-xl border border-stone-300 p-3 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 font-mono"
                />
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setPasteText('')}
                  className="text-xs text-stone-500 hover:text-stone-800 underline"
                >
                  清除輸入內容
                </button>
                <button
                  type="button"
                  onClick={handlePasteSubmit}
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  確認解析並匯入
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: 名單預覽與編輯 (含重複標記與一鍵去重) */}
          {activeTab === 'list' && (
            <div className="space-y-4">
              {/* Duplicate Detection Alert Banner & Action Button */}
              {duplicateNameStrings.length > 0 && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
                  <div className="flex items-start gap-2.5">
                    <div className="p-1.5 rounded-lg bg-rose-100 text-rose-700 shrink-0 mt-0.5">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-rose-900">
                        發現 {duplicateNameStrings.length} 組重複的學生姓名（共 {duplicateStudentsList.length} 人次）
                      </h4>
                      <p className="text-[11px] text-rose-700 mt-0.5">
                        重複姓名：{duplicateNameStrings.slice(0, 4).join('、 ')}
                        {duplicateNameStrings.length > 4 ? ` 等 ${duplicateNameStrings.length} 人` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                    <button
                      onClick={() => setShowOnlyDuplicates(!showOnlyDuplicates)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1 ${
                        showOnlyDuplicates
                          ? 'bg-rose-600 text-white border-rose-600'
                          : 'bg-white text-rose-800 border-rose-300 hover:bg-rose-100/80'
                      }`}
                    >
                      <Filter className="w-3 h-3" />
                      <span>{showOnlyDuplicates ? '顯示全部名單' : '僅查看重複項目'}</span>
                    </button>
                    <button
                      onClick={handleRemoveDuplicates}
                      className="px-3.5 py-1.5 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-xs transition-all flex items-center gap-1.5"
                      title="移除後續出現的重複姓名，保留首筆唯一紀錄"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span>一鍵移除重複姓名</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Toolbar */}
              <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    placeholder="搜尋座號或姓名..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm rounded-lg border border-stone-200 focus:outline-hidden focus:ring-2 focus:ring-amber-500/50"
                  />
                  {searchKeyword && (
                    <button
                      onClick={() => setSearchKeyword('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleExportCSV}
                    className="px-3 py-1.5 text-xs font-semibold bg-white hover:bg-stone-100 text-stone-700 border border-stone-300 rounded-lg flex items-center gap-1.5 transition-colors"
                    title="匯出為 CSV"
                  >
                    <Download className="w-3.5 h-3.5" />
                    匯出 CSV
                  </button>
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="px-3 py-1.5 text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg flex items-center gap-1.5 transition-colors"
                    title="清空整份名單"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    清空名單
                  </button>
                </div>
              </div>

              {/* Add Single Student Form */}
              <form
                onSubmit={handleAddSingleStudent}
                className="flex items-center gap-2 p-2 bg-stone-100 rounded-xl"
              >
                <input
                  type="text"
                  placeholder="座號 (選填)"
                  value={newStudentNumber}
                  onChange={(e) => setNewStudentNumber(e.target.value)}
                  className="w-20 px-2.5 py-1.5 text-xs rounded-lg border border-stone-300 bg-white"
                />
                <input
                  type="text"
                  placeholder="輸入學生姓名..."
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-stone-300 bg-white"
                />
                <button
                  type="submit"
                  disabled={!newStudentName.trim()}
                  className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 disabled:bg-stone-300 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  新增
                </button>
              </form>

              {/* Students Grid / List */}
              {students.length === 0 ? (
                <div className="py-12 text-center text-stone-400">
                  <Users className="w-12 h-12 mx-auto mb-2 text-stone-300" />
                  <p className="text-sm font-semibold">目前尚未建立任何學生名單</p>
                  <p className="text-xs text-stone-400 mt-1 mb-4">
                    您可以載入模擬名單、上傳 CSV 或直接貼上名單
                  </p>
                  <button
                    onClick={() => setActiveTab('simulation')}
                    className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-2xs"
                  >
                    前往選取模擬名單
                  </button>
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="py-8 text-center text-stone-400 text-xs">
                  找不到符合條件的學生
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-80 overflow-y-auto pr-1">
                  {filteredStudents.map((student) => {
                    const isDup = (nameFrequencyMap.get(student.name.trim()) || 0) > 1;

                    return (
                      <div
                        key={student.id}
                        className={`group flex items-center justify-between p-2 rounded-lg border transition-colors ${
                          isDup
                            ? 'bg-rose-50/90 border-rose-200 hover:border-rose-300'
                            : 'bg-stone-50 hover:bg-amber-50/70 border-stone-200 hover:border-amber-200'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 overflow-hidden">
                          {student.number && (
                            <span
                              className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                                isDup
                                  ? 'bg-rose-200 text-rose-900'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {student.number}
                            </span>
                          )}
                          <span className="text-xs font-semibold text-stone-800 truncate">
                            {student.name}
                          </span>
                          {isDup && (
                            <span className="text-[9px] font-bold px-1 py-0.2 bg-rose-600 text-white rounded-sm shrink-0">
                              重複
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => handleDeleteStudent(student.id)}
                          className="opacity-0 group-hover:opacity-100 text-stone-400 hover:text-rose-600 transition-opacity p-1"
                          title="刪除"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 sm:px-6 py-3 border-t border-stone-200 bg-stone-50 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setActiveTab('simulation')}
            className="text-xs text-indigo-700 hover:underline flex items-center gap-1 font-semibold"
          >
            <Sparkles className="w-3 h-3" />
            切換其他模擬名單
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-lg transition-colors"
          >
            完成並關閉
          </button>
        </div>
      </div>
    </div>
  );
};
