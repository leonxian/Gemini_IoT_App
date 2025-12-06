
import React, { useState, useMemo } from 'react';
import { CustomerProfile, IoTRecord, TrainedModelRegistry, ModelType, CRMTag } from '../types';
import { getCRMProfiles, TAG_LIBRARY } from '../services/crmEngine';
import { Search, Phone, Mail, Calendar, Activity, Zap, AlertTriangle, TrendingUp, Filter, MessageSquare, Clock, CheckCircle2, AlertCircle, PackageCheck, ShoppingCart, History, Crown, Sparkles, BrainCircuit, Code2, Download, FileSpreadsheet, X, ArrowRight, ChevronRight, BarChart3, Wallet, Target, Quote, Users, Layers, ShieldAlert, Heart, Gem, ArrowUpRight, Gauge, Cpu, Radio, List, ArrowLeft } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar, Cell, XAxis, YAxis, Tooltip } from 'recharts';

interface CRMProps {
  data: IoTRecord[];
  trainedModels?: TrainedModelRegistry;
}

// --- HELPER COMPONENTS (Defined before use) ---

const TagTrack = ({ icon: Icon, color, title, tags }: any) => (
    <div className="flex flex-col gap-1.5 min-w-0">
        <div className="flex items-center gap-1.5 opacity-50">
            <Icon size={10} className={`text-${color}-400`}/>
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">{title}</span>
        </div>
        <div className="flex gap-1 overflow-hidden">
            {tags && tags.length > 0 ? tags.slice(0, 3).map((t: any) => (
                <div key={t.id} className={`text-[9px] px-1.5 py-0.5 rounded border flex items-center gap-1 truncate ${
                    color === 'amber' ? 'bg-amber-500/10 border-amber-500/20 text-amber-300' :
                    color === 'rose' ? 'bg-rose-500/10 border-rose-500/20 text-rose-300' :
                    color === 'purple' ? 'bg-purple-500/10 border-purple-500/20 text-purple-300' :
                    'bg-cyan-500/10 border-cyan-500/20 text-cyan-300'
                }`}>
                    <div className="w-1 h-1 rounded-full bg-current shrink-0"></div>{t.label}
                </div>
            )) : <span className="text-[9px] text-slate-700 italic">-</span>}
        </div>
    </div>
);

const MetricCompact = ({ label, value, color }: any) => (
    <div className="flex flex-col items-center min-w-[60px]">
        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">{label}</span>
        <span className={`text-xl font-mono font-bold tracking-tight ${color === 'rose' ? 'text-rose-400' : color === 'emerald' ? 'text-emerald-400' : 'text-indigo-400'}`}>{value}</span>
    </div>
);

// --- MAIN COMPONENT ---

export const CRMSystem: React.FC<CRMProps> = ({ data, trainedModels }) => {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTier, setFilterTier] = useState<string>('全部');
  const [filterTag, setFilterTag] = useState<string>('全部');
  const [showFullReport, setShowFullReport] = useState(false);

  const profiles = useMemo(() => getCRMProfiles(data, trainedModels).sort((a, b) => b.lastActive - a.lastActive), [data, trainedModels]);

  // Tag Grouping for Filter
  const tagGroups = useMemo(() => {
      const valueTags = [TAG_LIBRARY.VIP.label, TAG_LIBRARY.HIGH_SPENDER.label];
      const riskTags = [TAG_LIBRARY.CHURN_RISK.label, TAG_LIBRARY.HARDWARE_ISSUE.label];
      const habitTags = [TAG_LIBRARY.HIGH_TEMP.label, TAG_LIBRARY.LOW_TEMP.label, TAG_LIBRARY.MORNING_USER.label, TAG_LIBRARY.NIGHT_USER.label];
      const aiTags = new Set<string>();
      profiles.forEach(p => p.tags.forEach(t => {
          if (t.isAiGenerated || t.label.startsWith('[AI]')) aiTags.add(t.label);
      }));
      return [
          { name: '价值贡献类', tags: valueTags },
          { name: '风险预警类', tags: riskTags },
          { name: '习惯偏好类', tags: habitTags },
          { name: 'AI 智能聚类', tags: Array.from(aiTags).sort() }
      ];
  }, [profiles]);

  const filteredProfiles = useMemo(() => profiles.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.email.toLowerCase().includes(searchTerm.toLowerCase());
      const tierMap: Record<string, string> = { '全部': 'All', '白金': 'Platinum', '黄金': 'Gold', '白银': 'Silver', '青铜': 'Bronze' };
      const matchesTier = tierMap[filterTier] === 'All' || p.loyaltyTier === tierMap[filterTier];
      const matchesTag = filterTag === '全部' || p.tags.some(t => t.label === filterTag);
      return matchesSearch && matchesTier && matchesTag;
  }), [profiles, searchTerm, filterTier, filterTag]);

  const selectedProfile = useMemo(() => filteredProfiles.length > 0 ? (filteredProfiles.find(p => p.userId === selectedUserId) || filteredProfiles[0]) : null, [filteredProfiles, selectedUserId]);
  
  const tasteProfile = useMemo(() => {
     if (!selectedProfile) return [];
     const seed = selectedProfile.userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
     return [{ subject: '强度', A: 40 + (seed%60), fullMark: 100 }, { subject: '酸度', A: 20 + (seed%50), fullMark: 100 }, { subject: '苦味', A: 30 + (seed%60), fullMark: 100 }, { subject: '烘焙度', A: 50 + (seed%50), fullMark: 100 }, { subject: '醇度', A: 60 + (seed%40), fullMark: 100 }];
  }, [selectedProfile]);

  const handleExportCSV = () => {
    const header = '用户ID,姓名,电话,邮箱,会员等级,LTV得分,累计消费,流失概率,用户标签(Tags),AI建议类型';
    const rows = filteredProfiles.map(p => {
        const tagString = `"${p.tags.map(t => `[${t.category}] ${t.label}`).join(' | ')}"`;
        return `${p.userId},${p.name},${p.phone},${p.email},${p.loyaltyTier},${p.ltvScore},${p.financials?.totalSpend?.toLocaleString()},${p.churnProbability},${tagString},${p.nextBestAction.type}`;
    });
    const csv = [header, ...rows].join('\n');
    const link = document.createElement("a"); link.href = URL.createObjectURL(new Blob(["\ufeff" + csv], { type: 'text/csv;charset=utf-8;' })); link.download = `crm_export_${Date.now()}.csv`; link.click();
  };
  
  const triggerTags = useMemo(() => {
      if (!selectedProfile) return [];
      const type = selectedProfile.nextBestAction.type;
      return selectedProfile.tags.filter(t => {
          if (type === 'retention') return t.category === 'Risk';
          if (type === 'upsell') return t.category === 'Value' || t.category === 'AI' || t.category === 'Habit';
          if (type === 'maintenance') return t.category === 'Risk';
          if (type === 'replenishment') return t.category === 'Habit';
          return t.category === 'Value' || t.category === 'AI';
      }).slice(0, 5);
  }, [selectedProfile]);

  if (!profiles.length) return <div className="p-10 text-slate-400 flex items-center justify-center h-full"><span className="animate-pulse">Loading Intelligence Data...</span></div>;

  const safeProfile = selectedProfile || profiles[0];
  
  // High-End Theme Configuration
  const tierConfig = {
      'Platinum': { bg: 'bg-slate-100', text: 'text-slate-100', border: 'border-slate-400/30', glow: 'shadow-[0_0_30px_rgba(226,232,240,0.15)]', gradient: 'from-slate-200/20 via-slate-400/5 to-transparent', icon: 'text-slate-300' },
      'Gold': { bg: 'bg-amber-400', text: 'text-amber-200', border: 'border-amber-500/30', glow: 'shadow-[0_0_30px_rgba(245,158,11,0.15)]', gradient: 'from-amber-400/20 via-orange-500/5 to-transparent', icon: 'text-amber-400' },
      'Silver': { bg: 'bg-blue-300', text: 'text-blue-100', border: 'border-blue-400/30', glow: 'shadow-[0_0_30px_rgba(96,165,250,0.15)]', gradient: 'from-blue-400/20 via-indigo-500/5 to-transparent', icon: 'text-blue-300' },
      'Bronze': { bg: 'bg-orange-700', text: 'text-orange-200', border: 'border-orange-600/30', glow: 'shadow-[0_0_30px_rgba(234,88,12,0.15)]', gradient: 'from-orange-600/20 via-slate-800/50 to-transparent', icon: 'text-orange-600' }
  }[safeProfile?.loyaltyTier || 'Bronze'];

  const profileTags = {
      value: safeProfile.tags.filter(t => t.category === 'Value'),
      risk: safeProfile.tags.filter(t => t.category === 'Risk'),
      habit: safeProfile.tags.filter(t => t.category === 'Habit'),
      ai: safeProfile.tags.filter(t => t.category === 'AI')
  };

  return (
    <div className="flex flex-col lg:flex-row h-full gap-0 animate-in fade-in duration-500 overflow-hidden relative selection:bg-indigo-500/30 bg-[#020617]">
      {/* 1. Sidebar: Precision List */}
      <div className={`w-full lg:w-[260px] flex-col bg-[#0B1120] border-r border-slate-800/60 shrink-0 z-20 h-full ${selectedUserId ? 'hidden lg:flex' : 'flex'}`}>
        <div className="p-3 border-b border-slate-800/80 space-y-2 bg-[#0B1120]/95 backdrop-blur shrink-0">
           <div className="relative group">
             <Search className="absolute left-2.5 top-2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={12} />
             <input type="text" placeholder="搜索客户..." className="w-full bg-slate-900/50 border border-slate-700/50 rounded-md pl-8 pr-2 py-1.5 text-[11px] text-slate-200 focus:outline-none focus:border-indigo-500/50 focus:bg-slate-900 transition-all font-medium placeholder:text-slate-600" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
           </div>
           
           <div className="flex gap-2">
               <div className="relative flex-1">
                   <select value={filterTier} onChange={(e) => setFilterTier(e.target.value)} className="w-full bg-slate-900/50 border border-slate-700/50 rounded-md px-2 py-1 text-[10px] text-slate-300 focus:outline-none focus:border-indigo-500/50 font-medium appearance-none cursor-pointer hover:bg-slate-800 transition-colors">
                       {['全部', '白金', '黄金', '白银', '青铜'].map(t => <option key={t} value={t}>{t}</option>)}
                   </select>
               </div>
               <div className="relative flex-[1.5]">
                   <select value={filterTag} onChange={(e) => setFilterTag(e.target.value)} className="w-full bg-slate-900/50 border border-slate-700/50 rounded-md px-2 py-1 text-[10px] text-slate-300 focus:outline-none focus:border-indigo-500/50 font-medium appearance-none cursor-pointer hover:bg-slate-800 transition-colors">
                       <option value="全部">全部标签</option>
                       {tagGroups.map(g => <optgroup key={g.name} label={g.name} className="bg-slate-900">{g.tags.map(t => <option key={t} value={t}>{t}</option>)}</optgroup>)}
                   </select>
               </div>
           </div>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
          {filteredProfiles.map(p => {
              const isActive = selectedProfile?.userId === p.userId;
              return (
                <div key={p.userId} onClick={() => setSelectedUserId(p.userId)} className={`p-2 rounded-lg cursor-pointer transition-all group relative border ${isActive ? 'bg-indigo-900/20 border-indigo-500/30' : 'bg-transparent border-transparent hover:bg-slate-800/40 hover:border-slate-700/30'}`}>
                  {isActive && <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-indigo-500 shadow-[0_0_8px_#6366f1]"></div>}
                  <div className={`flex items-center gap-2.5 ${isActive ? 'pl-1.5' : ''} transition-all`}>
                    <div className="relative shrink-0">
                        <img src={p.avatar} className={`w-8 h-8 rounded-full bg-slate-900 object-cover ring-1 ${isActive ? 'ring-indigo-400' : 'ring-slate-700'}`} alt="av" />
                        {p.churnProbability > 70 && <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span></span>}
                    </div>
                    <div className="flex-1 min-h-0">
                        <div className="flex justify-between items-center mb-0.5">
                            <span className={`text-[11px] font-bold truncate ${isActive ? 'text-white' : 'text-slate-300'}`}>{p.name}</span>
                            <span className={`text-[9px] font-mono ${isActive ? 'text-indigo-300' : 'text-slate-500'}`}>{p.loyaltyTier}</span>
                        </div>
                        <div className="flex justify-between items-center">
                             <div className="flex gap-1">{p.tags.slice(0,2).map(t=><div key={t.id} className={`w-1.5 h-1.5 rounded-full ${t.category==='Risk'?'bg-rose-500':t.category==='Value'?'bg-amber-400':'bg-slate-600'}`}></div>)}</div>
                             <span className={`text-[9px] font-mono font-bold ${p.ltvScore>70?'text-emerald-400':p.ltvScore>40?'text-amber-400':'text-slate-600'}`}>LTV {p.ltvScore}</span>
                        </div>
                    </div>
                  </div>
                </div>
              );
          })}
        </div>
        <div className="p-2 border-t border-slate-800/80 bg-[#0B1120] shrink-0">
            <button onClick={() => setShowFullReport(true)} className="w-full flex items-center justify-center gap-2 py-1.5 rounded-md border border-slate-700/50 bg-slate-800/30 hover:bg-slate-800 hover:border-emerald-500/30 text-[10px] font-bold text-slate-400 hover:text-emerald-400 transition-all">
                <FileSpreadsheet size={12}/> 完整报表
            </button>
        </div>
      </div>

      {/* 2. Main Workspace: Flagship Layout */}
      <div className={`flex-1 flex flex-col overflow-hidden min-w-0 bg-slate-950 relative ${!selectedUserId ? 'hidden lg:flex' : 'flex'}`}>
        {selectedProfile ? (
        <>
            {/* Dynamic Background Glow */}
            <div className={`absolute -top-[20%] -right-[10%] w-[70%] h-[70%] bg-gradient-to-b ${tierConfig.gradient} blur-[120px] pointer-events-none opacity-15`}></div>

            <div className="flex-1 flex flex-col p-4 gap-4 h-full overflow-y-auto lg:overflow-hidden">
                
                {/* L1: Identity Strip (Compact & High Density) */}
                <div className={`relative rounded-xl overflow-hidden border ${tierConfig.border} bg-slate-900/60 backdrop-blur-xl shrink-0 min-h-[110px] flex flex-col lg:flex-row items-start lg:items-center shadow-lg p-4 lg:p-0`}>
                    {/* Mobile Back Button */}
                    <button onClick={() => setSelectedUserId(null)} className="lg:hidden absolute top-3 right-3 p-1.5 rounded-full bg-slate-800/50 text-slate-300 hover:text-white">
                        <ArrowLeft size={16} />
                    </button>

                    <div className="flex flex-col lg:flex-row items-center gap-6 lg:px-6 w-full">
                        {/* Avatar & Basic */}
                        <div className="flex items-center gap-4 shrink-0 lg:border-r border-white/5 lg:pr-6 py-2 w-full lg:w-auto">
                            <div className="relative">
                                <img src={selectedProfile.avatar} className={`w-14 h-14 rounded-full bg-slate-900 object-cover ring-2 ${tierConfig.icon} shadow-lg`} alt="Avatar" />
                                <div className="absolute -bottom-1 -right-1 bg-slate-950 rounded-full p-0.5 border border-slate-700">
                                    <Crown size={10} className={tierConfig.icon} fill="currentColor"/>
                                </div>
                            </div>
                            <div>
                                <div className="flex items-baseline gap-2">
                                    <h1 className="text-xl font-bold text-white tracking-tight">{selectedProfile.name}</h1>
                                    <span className="text-[10px] font-mono text-slate-500">#{selectedProfile.userId}</span>
                                </div>
                                <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-0.5">
                                    <span className={`uppercase font-bold tracking-wider ${tierConfig.icon}`}>{selectedProfile.loyaltyTier} MEMBER</span>
                                    <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                                    <span className="font-mono">{selectedProfile.phone}</span>
                                </div>
                            </div>
                        </div>

                        {/* Categorized Tag DNA Bar */}
                        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 items-center w-full">
                            <TagTrack icon={Gem} color="amber" title="价值资产" tags={profileTags.value} />
                            <TagTrack icon={ShieldAlert} color="rose" title="风险预警" tags={profileTags.risk} />
                            <TagTrack icon={Clock} color="cyan" title="习惯偏好" tags={profileTags.habit} />
                            <TagTrack icon={BrainCircuit} color="purple" title="AI 聚类" tags={profileTags.ai} />
                        </div>

                        {/* Right: Key Metrics */}
                        <div className="flex gap-4 shrink-0 lg:border-l border-white/5 lg:pl-6 py-2 w-full lg:w-auto justify-end lg:justify-start">
                            <MetricCompact label="LTV 评分" value={selectedProfile.ltvScore} color="indigo" />
                            <MetricCompact label="流失概率" value={`${selectedProfile.churnProbability}%`} color={selectedProfile.churnProbability > 50 ? 'rose' : 'emerald'} />
                        </div>
                    </div>
                </div>

                {/* L2: AI Command Core (The "Brain") */}
                <div className="grid grid-cols-12 gap-4 lg:h-[260px] h-auto shrink-0">
                    {/* AI Decision Logic Console */}
                    <div className="col-span-12 lg:col-span-8 bg-[#0F172A]/80 border border-slate-800 rounded-xl overflow-hidden flex flex-col shadow-2xl relative group min-h-[250px]">
                        <div className="absolute top-0 right-0 w-[300px] h-full bg-indigo-500/5 blur-[80px] pointer-events-none"></div>
                        
                        <div className="flex justify-between items-center p-3 border-b border-white/5 bg-white/[0.01]">
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded bg-indigo-600 flex items-center justify-center shadow-[0_0_10px_rgba(99,102,241,0.4)]"><Cpu size={12} className="text-white"/></div>
                                <span className="text-[10px] font-bold text-indigo-100 uppercase tracking-widest">AI 决策中枢 (Decision Core)</span>
                            </div>
                            <div className="flex gap-4 text-[10px] font-mono text-slate-500">
                                <span>ALGO: {selectedProfile.nextBestAction.usedAlgorithms?.[0]}</span>
                                <span className="text-emerald-500">CONF: {selectedProfile.nextBestAction.confidenceScore}%</span>
                            </div>
                        </div>

                        <div className="flex-1 p-4 flex flex-col sm:flex-row gap-6 relative z-10">
                            {/* 1. Trigger (Input) */}
                            <div className="w-full sm:w-[140px] shrink-0 flex flex-col gap-2 sm:border-r border-white/5 sm:pr-4 border-b sm:border-b-0 pb-3 sm:pb-0">
                                <span className="text-[9px] font-bold text-slate-500 uppercase flex items-center gap-1"><Zap size={10} className="text-yellow-400"/> 驱动因子</span>
                                <div className="flex flex-row sm:flex-col gap-1.5 mt-1 flex-wrap">
                                    {triggerTags.length > 0 ? triggerTags.map(t => (
                                        <div key={t.id} className={`text-[9px] px-2 py-1 rounded border font-mono truncate flex items-center gap-1.5 ${
                                            t.category === 'Value' ? 'border-amber-500/20 text-amber-400 bg-amber-500/5' :
                                            t.category === 'Risk' ? 'border-rose-500/20 text-rose-400 bg-rose-500/5' :
                                            t.category === 'AI' ? 'border-purple-500/20 text-purple-400 bg-purple-500/5' :
                                            'border-cyan-500/20 text-cyan-400 bg-cyan-500/5'
                                        }`}><div className="w-1 h-1 rounded-full bg-current"></div>{t.label}</div>
                                    )) : <span className="text-[9px] text-slate-600 italic">综合评分驱动</span>}
                                </div>
                            </div>

                            {/* 2. Logic (Processing) */}
                            <div className="flex-1 flex flex-col">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="px-1.5 py-0.5 rounded-sm bg-indigo-500 text-white text-[9px] font-bold uppercase tracking-wider">{selectedProfile.nextBestAction.type}</span>
                                    <h3 className="text-base font-bold text-white tracking-tight">{selectedProfile.nextBestAction.title}</h3>
                                </div>
                                <div className="flex-1 bg-black/40 rounded border border-slate-800 p-2 font-mono text-[10px] text-slate-400 leading-relaxed overflow-y-auto custom-scrollbar whitespace-pre-wrap min-h-[80px]">
                                    {selectedProfile.nextBestAction.reasoning}
                                </div>
                                <div className="mt-3 flex gap-2">
                                    <button className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[10px] font-bold uppercase tracking-wider shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2">
                                        <Zap size={12}/> 执行建议 (Execute)
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Impact & Quick Stats */}
                    <div className="col-span-12 lg:col-span-4 flex flex-col gap-2">
                        {/* Predicted Impact */}
                        <div className="flex-1 bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center relative overflow-hidden min-h-[100px]">
                            <div className="absolute inset-0 bg-emerald-500/5"></div>
                            <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">预期商业收益</div>
                            <div className="text-2xl font-bold text-emerald-400 font-mono tracking-tighter flex items-center gap-2">
                                {selectedProfile.nextBestAction.impactPrediction} <ArrowUpRight size={18}/>
                            </div>
                        </div>
                        {/* Evidence Grid Compact (2x4 for 8 metrics) */}
                        <div className="flex-[2] bg-slate-900/60 border border-slate-800 rounded-xl p-2 grid grid-cols-2 gap-1.5 relative overflow-hidden">
                            <div className="absolute top-0 right-0 px-2 py-0.5 bg-slate-800 rounded-bl text-[8px] text-slate-400 font-bold uppercase tracking-wider border-b border-l border-slate-700">8-Dimensional Data Support</div>
                            {selectedProfile.nextBestAction.evidence?.map((ev,i) => (
                                <div key={i} className="bg-slate-950/50 rounded px-2 py-1.5 border border-slate-800/50 flex flex-col justify-center">
                                    <div className="text-[9px] text-slate-500 font-bold uppercase truncate">{ev.label}</div>
                                    <div className={`text-xs font-mono font-bold ${ev.color==='green'?'text-emerald-400':ev.color==='red'?'text-rose-400':ev.color==='amber'?'text-amber-400':ev.color==='blue'?'text-blue-400':'text-slate-200'}`}>{ev.value}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* L3: Data Grid (The "Truth") - Auto Fill Remaining Height */}
                <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-4 pb-4">
                    {/* 1. Inventory Vital Signs */}
                    <div className="bg-slate-900/60 border border-slate-800 rounded-xl flex flex-col shadow-lg backdrop-blur-sm overflow-hidden h-[300px] lg:h-auto min-h-0">
                        <div className="p-3 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
                            <span className="text-[10px] font-bold text-slate-300 uppercase flex items-center gap-2"><PackageCheck size={12} className="text-cyan-400"/> 库存生命周期</span>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded border ${selectedProfile.inventory.overallStatus==='Critical'?'border-rose-500/30 text-rose-400 bg-rose-500/10':'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'} font-bold`}>{selectedProfile.inventory.overallStatus}</span>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3">
                            {selectedProfile.inventory.items.map((item, idx) => (
                                <div key={idx}>
                                    <div className="flex justify-between text-[10px] mb-1">
                                        <span className="text-slate-300 font-bold">{item.name}</span>
                                        <span className="text-slate-500 font-mono">{item.currentStock} left</span>
                                    </div>
                                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden flex">
                                        <div className={`h-full ${item.status==='Critical'?'bg-rose-500':item.status==='Low'?'bg-amber-500':'bg-cyan-500'} transition-all duration-1000`} style={{width: `${Math.min(100, (item.currentStock/item.lastOrderQty)*100)}%`}}></div>
                                    </div>
                                    <div className="flex justify-between mt-0.5">
                                        <span className="text-[9px] text-slate-600">Rate: {item.consumptionRate}/day</span>
                                        <span className={`text-[9px] font-bold ${item.estimatedDaysLeft<5?'text-rose-400':'text-emerald-400'}`}>{item.estimatedDaysLeft} days left</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 2. Taste & Evidence Radar */}
                    <div className="bg-slate-900/60 border border-slate-800 rounded-xl flex flex-col shadow-lg backdrop-blur-sm overflow-hidden h-[300px] lg:h-auto min-h-0">
                        <div className="p-3 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
                            <span className="text-[10px] font-bold text-slate-300 uppercase flex items-center gap-2"><Sparkles size={12} className="text-amber-400"/> 口味偏好雷达</span>
                        </div>
                        <div className="flex-1 min-h-0 relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={tasteProfile}>
                                    <PolarGrid stroke="#334155" strokeDasharray="3 3"/>
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 700 }}/>
                                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false}/>
                                    <Radar name="Taste" dataKey="A" stroke="#f59e0b" strokeWidth={2} fill="#f59e0b" fillOpacity={0.2} />
                                </RadarChart>
                            </ResponsiveContainer>
                            <div className="absolute top-2 right-2 flex flex-col gap-1">
                                <div className="text-[9px] text-slate-500 text-right">Primary: <span className="text-amber-400 font-bold">{selectedProfile.favoriteProduct}</span></div>
                                <div className="text-[9px] text-slate-500 text-right">Avg Temp: <span className="text-slate-300 font-bold">88°C</span></div>
                            </div>
                        </div>
                    </div>

                    {/* 3. Interaction Log */}
                    <div className="bg-slate-900/60 border border-slate-800 rounded-xl flex flex-col shadow-lg backdrop-blur-sm overflow-hidden h-[300px] lg:h-auto min-h-0">
                        <div className="p-3 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
                            <span className="text-[10px] font-bold text-slate-300 uppercase flex items-center gap-2"><History size={12} className="text-indigo-400"/> 交互时间轴</span>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 relative">
                            <div className="absolute left-4 top-0 bottom-0 w-px bg-slate-800 border-l border-dashed border-slate-700"></div>
                            {selectedProfile.feedbackHistory.map((fb, idx) => (
                                <div key={idx} className="relative pl-8 mb-4 last:mb-0 group">
                                    <div className={`absolute left-2.5 top-1 w-3 h-3 rounded-full bg-slate-900 border-2 z-10 ${fb.type==='complaint'?'border-rose-500':fb.type==='suggestion'?'border-blue-500':'border-emerald-500'}`}></div>
                                    <div className="flex justify-between items-start mb-0.5">
                                        <span className={`text-[10px] font-bold uppercase ${fb.type==='complaint'?'text-rose-400':fb.type==='suggestion'?'text-blue-400':'text-emerald-400'}`}>{fb.type}</span>
                                        <span className="text-[9px] text-slate-600 font-mono">{new Date(fb.date).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-[10px] text-slate-400 leading-tight group-hover:text-slate-200 transition-colors">{fb.content}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </>
        ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-4 bg-slate-950 p-6 text-center">
                <div className="p-8 rounded-full bg-slate-900/50 border border-slate-800 shadow-2xl animate-pulse"><Users size={64} strokeWidth={0.5} className="text-slate-700"/></div>
                <div className="text-sm font-medium">Select a customer profile to view AI insights</div>
            </div>
        )}
      </div>
      
      {/* Full Report Modal */}
      {showFullReport && (
          <div className="fixed inset-0 z-[3000] bg-black/90 flex items-center justify-center backdrop-blur-md animate-in fade-in p-4">
              <div className="bg-[#0B1120] border border-slate-700 p-0 rounded-2xl w-full max-w-5xl h-[80vh] flex flex-col shadow-2xl animate-in zoom-in-95 overflow-hidden">
                  <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                      <div><h3 className="text-white font-bold text-base flex items-center gap-2"><FileSpreadsheet size={16} className="text-emerald-400"/> 完整客户数据报表</h3></div>
                      <button onClick={()=>setShowFullReport(false)} className="p-1 hover:bg-slate-800 rounded-full transition-colors"><X size={16} className="text-slate-400"/></button>
                  </div>
                  <div className="flex-1 bg-slate-950 overflow-auto custom-scrollbar">
                      <table className="w-full text-left text-xs border-collapse min-w-[800px]">
                        <thead className="bg-slate-900/90 text-slate-400 sticky top-0 z-10 backdrop-blur">
                            <tr>{['用户ID','姓名','会员等级','LTV','消费金额','流失率','用户标签 (Tags)','AI建议'].map(h=><th key={h} className="px-4 py-3 font-semibold border-b border-slate-800 whitespace-nowrap">{h}</th>)}</tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800 text-slate-300">
                            {filteredProfiles.map(p => (
                                <tr key={p.userId} className="hover:bg-slate-900/50">
                                    <td className="px-4 py-2.5 font-mono text-slate-500">{p.userId}</td>
                                    <td className="px-4 py-2.5 font-bold text-white">{p.name}</td>
                                    <td className="px-4 py-2.5"><span className="px-2 py-0.5 rounded bg-slate-800 text-[10px]">{p.loyaltyTier}</span></td>
                                    <td className="px-4 py-2.5 font-mono">{p.ltvScore}</td>
                                    <td className="px-4 py-2.5 font-mono">¥{p.financials?.totalSpend?.toLocaleString()}</td>
                                    <td className={`px-4 py-2.5 font-mono ${p.churnProbability>50?'text-rose-400':'text-emerald-400'}`}>{p.churnProbability}%</td>
                                    <td className="px-4 py-2.5"><div className="flex flex-wrap gap-1 max-w-[200px]">{p.tags.map(t => <span key={t.id} className="text-[9px] text-slate-400 border border-slate-700 px-1 rounded-sm block mb-0.5 w-fit">[{t.category}] {t.label}</span>)}</div></td>
                                    <td className="px-4 py-2.5 text-indigo-300 truncate max-w-[150px]">{p.nextBestAction.title}</td>
                                </tr>
                            ))}
                        </tbody>
                      </table>
                  </div>
                  <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex justify-end">
                      <button onClick={handleExportCSV} className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider shadow-lg flex items-center gap-2"><Download size={14}/> 导出 Excel (CSV)</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
