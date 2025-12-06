
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { generateBatch, generateSingleRecord, aggregateStats } from './services/dataGenerator';
import { IoTRecord, AggregatedStats, TrainedModelRegistry, ModelType, MLResult, ModelLifecycleRegistry, ModelVersion } from './types';
import { Dashboard } from './components/Dashboard';
import { ModelBuilder } from './components/ModelBuilder';
import { CRMSystem } from './components/CRMSystem';
import { LayoutDashboard, Database, BrainCircuit, Users, Cpu, LineChart, RefreshCw, Pause, Play, Activity, Server, FileJson, Table, Filter, Search, Terminal, HardDrive, Network, AlertCircle, ChevronDown, ChevronRight, Code, FileSpreadsheet, Download, X, Loader2, Key, Hash, Type, Lock, User, ArrowRight, CheckCircle2, Sparkles, ShieldCheck, LogOut, Zap, Layers, Menu } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie } from 'recharts';

// --- LOGIN PAGE COMPONENT ---
const LoginPage = ({ onLogin }: { onLogin: () => void }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate network delay for realism
    setTimeout(() => {
      if (username === 'admin' && password === '2025') {
        setSuccess(true);
        setTimeout(() => {
           onLogin();
        }, 800);
      } else {
        setError('认证失败：用户名或密码错误');
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center relative overflow-hidden font-sans selection:bg-indigo-500/30">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none"></div>
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/20 blur-[120px] rounded-full animate-pulse"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-emerald-600/10 blur-[120px] rounded-full"></div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-[0.15] pointer-events-none"></div>

      {/* Login Card */}
      <div className="w-full max-w-md relative z-10 p-6">
         <div className="bg-[#0B1120]/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500"></div>
            
            <div className="p-8 pt-10">
               {/* Header */}
               <div className="flex flex-col items-center mb-10 text-center">
                  <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-6 group-hover:scale-105 transition-transform duration-500">
                      <Cpu size={32} className="text-white" strokeWidth={2} />
                  </div>
                  <h1 className="text-2xl font-bold text-white tracking-tight mb-2">中茶智泡大师 <span className="text-indigo-400">AI</span></h1>
                  <p className="text-slate-400 text-xs tracking-wider uppercase font-mono">Enterprise IoT Intelligence Platform</p>
               </div>

               {/* Form */}
               <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest pl-1">Account ID</label>
                      <div className="relative group/input">
                          <User className="absolute left-3 top-2.5 text-slate-500 group-focus-within/input:text-indigo-400 transition-colors" size={16}/>
                          <input 
                            type="text" 
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-slate-950/50 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:bg-slate-900/80 transition-all placeholder:text-slate-600 font-mono"
                            placeholder="Enter username"
                          />
                      </div>
                  </div>

                  <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest pl-1">Passcode</label>
                      <div className="relative group/input">
                          <Lock className="absolute left-3 top-2.5 text-slate-500 group-focus-within/input:text-indigo-400 transition-colors" size={16}/>
                          <input 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-slate-950/50 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:bg-slate-900/80 transition-all placeholder:text-slate-600 font-mono tracking-widest"
                            placeholder="••••••••"
                          />
                      </div>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 text-rose-400 text-xs bg-rose-500/10 p-2 rounded border border-rose-500/20 animate-in slide-in-from-top-1">
                        <AlertCircle size={14}/> {error}
                    </div>
                  )}

                  <button 
                    type="submit" 
                    disabled={isLoading || success}
                    className={`w-full py-3 rounded-lg font-bold text-sm uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 transition-all duration-300 ${success ? 'bg-emerald-600 text-white' : 'bg-indigo-600 hover:bg-indigo-500 text-white hover:shadow-indigo-500/25'}`}
                  >
                    {success ? (
                        <><CheckCircle2 size={16}/> Access Granted</>
                    ) : isLoading ? (
                        <><Loader2 size={16} className="animate-spin"/> Verifying...</>
                    ) : (
                        <>Login System <ArrowRight size={16}/></>
                    )}
                  </button>
               </form>
            </div>

            {/* Footer */}
            <div className="bg-slate-950/50 p-4 border-t border-white/5 flex justify-between items-center text-[10px] text-slate-500 font-mono">
                <span className="flex items-center gap-1"><ShieldCheck size={10}/> Secure Connection</span>
                <span>v3.5.0 (Build 2025)</span>
            </div>
         </div>
         
         <div className="mt-8 text-center">
             <p className="text-[10px] text-slate-600 uppercase tracking-widest">Authorized Personnel Only</p>
         </div>
      </div>
    </div>
  );
};

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'models' | 'data' | 'crm'>('dashboard');
  const [data, setData] = useState<IoTRecord[]>([]);
  const [stats, setStats] = useState<AggregatedStats | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Real-time Stream State
  const [isLive, setIsLive] = useState(true);
  const [dbStatus, setDbStatus] = useState<'idle' | 'writing' | 'error'>('idle');
  const streamIntervalRef = useRef<any>(null);
  const dataRef = useRef<IoTRecord[]>([]);

  // GLOBAL MODEL REGISTRY (AI Integration)
  const [trainedModels, setTrainedModels] = useState<TrainedModelRegistry>({});
  
  // NEW: Global Lifecycle Persistence
  const [modelLifecycle, setModelLifecycle] = useState<ModelLifecycleRegistry>({});

  const handleVersionCreated = (type: ModelType, version: ModelVersion) => {
      setModelLifecycle(prev => {
          const currentData = prev[type] || { versions: [], productionVersionId: null };
          return {
              ...prev,
              [type]: {
                  ...currentData,
                  versions: [version, ...currentData.versions]
              }
          };
      });
  };

  const handleVersionDeployed = (type: ModelType, versionId: string, result: MLResult) => {
      setModelLifecycle(prev => {
          const currentData = prev[type] || { versions: [], productionVersionId: null };
          return {
              ...prev,
              [type]: {
                  ...currentData,
                  productionVersionId: versionId,
                  versions: currentData.versions.map(v => ({
                      ...v,
                      status: v.id === versionId ? 'production' : (v.status === 'production' ? 'ready' : v.status)
                  }))
              }
          };
      });
      setTrainedModels(prev => ({ ...prev, [type]: result }));
  };

  useEffect(() => {
    const loadInitialData = async () => {
      const initialBatch = generateBatch(2000);
      dataRef.current = initialBatch;
      setData(initialBatch);
      setStats(aggregateStats(initialBatch));
    };
    if (isAuthenticated) {
        loadInitialData();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
    if (isLive && isAuthenticated) {
      streamIntervalRef.current = setInterval(() => {
        ingestRealtimeData();
      }, 5000); 
    }
    return () => {
      if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
    };
  }, [isLive, isAuthenticated]);

  const ingestRealtimeData = async () => {
    setDbStatus('writing');
    const packetSize = Math.floor(Math.random() * 3) + 1;
    const newPackets: IoTRecord[] = [];
    for(let i=0; i<packetSize; i++) {
        newPackets.push(generateSingleRecord(Date.now() + i, true));
    }
    setTimeout(() => {
        dataRef.current = [...dataRef.current, ...newPackets];
        const uiData = dataRef.current.slice(-5000); 
        setData(uiData);
        setStats(prev => {
            if (!prev) return aggregateStats(uiData);
            const newStats = { 
                ...prev,
                cityDistribution: { ...prev.cityDistribution },
                beverageDistribution: { ...prev.beverageDistribution },
                timeDistribution: [...prev.timeDistribution]
            };
            newStats.totalBrews += packetSize;
            newPackets.forEach(p => {
                const city = p.location.city;
                newStats.cityDistribution[city] = (newStats.cityDistribution[city] || 0) + 1;
                const bev = p.beverage;
                newStats.beverageDistribution[bev] = (newStats.beverageDistribution[bev] || 0) + 1;
                const h = new Date(p.timestamp).getHours();
                newStats.timeDistribution[h]++;
                newStats.avgLatency = (newStats.avgLatency * (newStats.totalBrews - 1) + p.telemetry.latency) / newStats.totalBrews;
                newStats.avgTemp = (newStats.avgTemp * (newStats.totalBrews - 1) + p.params.temperature) / newStats.totalBrews;
                
                if (p.telemetry.errorCode) {
                    const oldErrorCount = prev.errorRate * (prev.totalBrews);
                    newStats.errorRate = (oldErrorCount + 1) / newStats.totalBrews;
                } else {
                     const oldErrorCount = prev.errorRate * (prev.totalBrews);
                     newStats.errorRate = oldErrorCount / newStats.totalBrews;
                }
            });
            let topBev = newStats.topBeverage;
            let maxCount = newStats.beverageDistribution[topBev] || 0;
            newPackets.forEach(p => {
               if (newStats.beverageDistribution[p.beverage] > maxCount) {
                   topBev = p.beverage;
                   maxCount = newStats.beverageDistribution[p.beverage];
               }
            });
            newStats.topBeverage = topBev;
            return newStats;
        });
        setDbStatus('idle');
    }, 400); 
  };

  const manualRefresh = () => {
      dataRef.current = [];
      const batch = generateBatch(2000);
      dataRef.current = batch;
      setData(batch);
      setStats(aggregateStats(batch));
  };

  const closeSidebar = () => setIsSidebarOpen(false);

  // --- RENDER LOGIN IF NOT AUTHENTICATED ---
  if (!isAuthenticated) {
      return <LoginPage onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="h-screen bg-[#020617] text-slate-200 font-sans flex overflow-hidden selection:bg-indigo-500/30">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar - Responsive */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0B1120] border-r border-slate-800/80 flex flex-col shadow-2xl shrink-0 h-full transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* 1. Header (Fixed) */}
        <div className="flex flex-col border-b border-slate-800/80 shrink-0">
            <div className="h-16 flex items-center px-6 gap-3 justify-between lg:justify-start">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
                        <Cpu size={18} className="text-white" strokeWidth={2.5} />
                    </div>
                    <span className="font-bold text-sm tracking-tight text-white truncate">
                        中茶智泡大师<span className="text-indigo-500 ml-1">AI</span>
                    </span>
                </div>
                {/* Mobile close button */}
                <button onClick={closeSidebar} className="lg:hidden text-slate-400 hover:text-white">
                    <X size={20} />
                </button>
            </div>
            {/* LOGOUT BUTTON (SIDEBAR TOP) */}
            <div className="px-4 pb-4">
                <button 
                    onClick={() => setIsAuthenticated(false)}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded bg-rose-950/30 border border-rose-900/50 hover:bg-rose-900/60 hover:border-rose-500/50 text-rose-400 text-[10px] font-bold transition-all uppercase tracking-wider group shadow-sm"
                >
                    <LogOut size={12} className="group-hover:scale-110 transition-transform"/> 退出系统
                </button>
            </div>
        </div>

        {/* 2. Nav (Scrollable) */}
        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1 custom-scrollbar min-h-0">
          <SidebarItem icon={<LayoutDashboard size={18} />} label="全域监控总览" active={activeTab === 'dashboard'} onClick={() => { setActiveTab('dashboard'); closeSidebar(); }} />
          <SidebarItem icon={<Users size={18} />} label="智能客户管理" active={activeTab === 'crm'} onClick={() => { setActiveTab('crm'); closeSidebar(); }} />
          <SidebarItem icon={<BrainCircuit size={18} />} label="AI 模型实验室" active={activeTab === 'models'} onClick={() => { setActiveTab('models'); closeSidebar(); }} />
           <SidebarItem icon={<Database size={18} />} label="IoT 数据中心" active={activeTab === 'data'} onClick={() => { setActiveTab('data'); closeSidebar(); }} />
        </nav>

        {/* 3. Footer (Fixed at bottom) */}
        <div className="p-4 border-t border-slate-800/80 bg-[#0B1120] space-y-3 shrink-0">
           <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-800 backdrop-blur-sm">
              <div className="text-[10px] text-slate-500 uppercase font-bold flex justify-between tracking-wider">
                <span>数据库连接状态</span>
                {dbStatus === 'writing' && <span className="text-emerald-400 animate-pulse">写入中...</span>}
              </div>
              <div className="flex items-center gap-2 mt-2">
                 <div className={`w-2 h-2 rounded-full ${dbStatus === 'writing' ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]' : 'bg-slate-600'}`}></div>
                 <span className="text-xs text-slate-300 font-mono">PostgreSQL: {dbStatus === 'writing' ? 'Syncing' : 'Connected'}</span>
              </div>
           </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative bg-[#020617]">
        {/* Ambient Background Noise/Grid */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-[0.15] pointer-events-none"></div>
        
        {/* Header - Glassmorphism */}
        <header className="h-16 bg-[#0B1120]/60 backdrop-blur-md border-b border-slate-800/80 flex items-center justify-between px-4 lg:px-6 z-20 shrink-0 sticky top-0">
           <div className="flex items-center gap-4">
              <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 -ml-2 text-slate-400 hover:text-white">
                  <Menu size={20} />
              </button>
              <h1 className="text-sm lg:text-base font-semibold text-slate-100 flex items-center gap-2.5 truncate">
                {activeTab === 'dashboard' && <><LineChart size={18} className="text-indigo-400 shrink-0"/> <span className="truncate">企业级运营监控仪表盘</span></>}
                {activeTab === 'crm' && <><Users size={18} className="text-indigo-400 shrink-0"/> <span className="truncate">客户全景画像与智能营销</span></>}
                {activeTab === 'models' && <><BrainCircuit size={18} className="text-indigo-400 shrink-0"/> <span className="truncate">机器学习模型训练平台</span></>}
                {activeTab === 'data' && <><Database size={18} className="text-indigo-400 shrink-0"/> <span className="truncate">IoT 原始数据探索</span></>}
              </h1>
           </div>
           
           <div className="flex items-center gap-2 lg:gap-3">
              <div className="flex items-center bg-slate-900 border border-slate-700/50 rounded-lg p-0.5 shadow-sm">
                 <div className="hidden sm:flex items-center px-3 gap-2 border-r border-slate-700/50 mr-1 py-1">
                    <Activity size={14} className={isLive ? "text-emerald-400 animate-pulse" : "text-slate-600"} />
                    <span className="text-xs font-mono text-slate-400 tabular-nums">{isLive ? "实时流: 运行中" : "实时流: 已暂停"}</span>
                 </div>
                 <button 
                   onClick={() => setIsLive(!isLive)}
                   className={`p-1.5 rounded-md transition-all ${isLive ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-500 hover:text-slate-300'}`}
                 >
                    {isLive ? <Pause size={14} fill="currentColor"/> : <Play size={14} fill="currentColor"/>}
                 </button>
                 <button 
                    onClick={manualRefresh}
                    className="p-1.5 rounded-md text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all"
                 >
                    <RefreshCw size={14} />
                 </button>
              </div>
              
              {/* HEADER LOGOUT BUTTON */}
              <button 
                onClick={() => setIsAuthenticated(false)}
                className="lg:hidden p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors"
                title="退出登录"
              >
                <LogOut size={18} />
              </button>

              <div 
                className="hidden lg:flex h-8 w-8 rounded-full bg-slate-800 border border-slate-700 items-center justify-center text-xs font-bold text-indigo-400 ring-2 ring-transparent hover:ring-rose-500/50 hover:bg-rose-900/20 hover:text-rose-400 transition-all cursor-pointer group relative"
                onClick={() => setIsAuthenticated(false)}
                title="退出登录"
              >
                <span className="group-hover:hidden">NB</span>
                <LogOut size={14} className="hidden group-hover:block" />
              </div>
           </div>
        </header>

        {/* Content Body */}
        <div className={`flex-1 ${activeTab === 'dashboard' ? 'lg:overflow-hidden overflow-y-auto p-2 lg:p-4' : 'overflow-y-auto p-4 lg:p-6'} scroll-smooth custom-scrollbar`}>
          <div className="max-w-[1920px] mx-auto h-full flex flex-col">
            {stats ? (
              <>
                {activeTab === 'dashboard' && <Dashboard stats={stats} data={data} />}
                {activeTab === 'crm' && <CRMSystem data={data} trainedModels={trainedModels} />}
                {activeTab === 'models' && <ModelBuilder stats={stats} data={data} lifecycleData={modelLifecycle} onVersionCreated={handleVersionCreated} onVersionDeployed={handleVersionDeployed} />}
                {activeTab === 'data' && <DataExplorerView data={data} stats={stats} />}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <Loader2 size={40} className="text-indigo-500 animate-spin" />
                <div className="text-sm text-indigo-400 font-mono animate-pulse tracking-widest uppercase">系统初始化中...</div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

const SidebarItem = ({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 mb-1 group ${
      active 
        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' 
        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
    }`}
  >
    <span className={`${active ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`}>{icon}</span>
    <span className="font-medium text-sm tracking-wide">{label}</span>
    {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_white]"></div>}
  </button>
);

// --- PROFESSIONAL IOT DATA EXPLORER ---
const DataExplorerView = ({ data, stats }: { data: IoTRecord[], stats: AggregatedStats }) => {
    const [expandedRow, setExpandedRow] = useState<string | null>(null);
    const [sqlQuery, setSqlQuery] = useState("SELECT * FROM device_logs WHERE latency > 100 ORDER BY timestamp DESC LIMIT 50");
    const [showFullReport, setShowFullReport] = useState(false);
    const [showSchemaModal, setShowSchemaModal] = useState(false);
    
    // Filter State
    const [showFilterPanel, setShowFilterPanel] = useState(false);
    const [activeFilters, setActiveFilters] = useState({ city: 'All', beverage: 'All', status: 'All' });

    // SQL Simulation State
    const [isExecuting, setIsExecuting] = useState(false);
    const [queryResult, setQueryResult] = useState<IoTRecord[] | null>(null);

    // Protocol Distribution Data
    const protocolData = useMemo(() => {
        const counts = { 'WiFi': 0, '5G': 0, 'LoRaWAN': 0 };
        data.slice(-500).forEach(d => {
            const type = (d.machineId.charCodeAt(5) % 3) === 0 ? '5G' : (d.machineId.charCodeAt(5) % 3) === 1 ? 'WiFi' : 'LoRaWAN';
            counts[type]++;
        });
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [data]);
    
    const ingestionHistory = useMemo(() => {
        return Array.from({length: 20}, (_, i) => ({
            time: `-${20-i}s`,
            mps: 150 + Math.random() * 80, 
        }));
    }, [data.length]);

    const handleRunSQL = () => {
        setIsExecuting(true);
        setQueryResult(null);
        setTimeout(() => {
            let results = [...data].reverse();
            const queryUpper = sqlQuery.toUpperCase();
            if (queryUpper.includes('LATENCY >')) {
                const match = queryUpper.match(/LATENCY >\s*(\d+)/);
                if (match) results = results.filter(r => r.telemetry.latency > parseInt(match[1]));
            }
            if (queryUpper.includes('ERROR') && queryUpper.includes('NOT NULL')) {
                results = results.filter(r => r.telemetry.errorCode);
            }
            if (queryUpper.includes("CITY =")) {
                const match = sqlQuery.match(/CITY\s*=\s*['"]([^'"]+)['"]/i);
                if (match) results = results.filter(r => r.location.city.toLowerCase() === match[1].toLowerCase());
            }
            let limit = 50;
            const limitMatch = queryUpper.match(/LIMIT\s*(\d+)/);
            if (limitMatch) limit = parseInt(limitMatch[1]);
            setQueryResult(results.slice(0, limit));
            setIsExecuting(false);
        }, 800);
    };

    const handleExportCSV = () => {
        const headers = ['LOG_ID,TIMESTAMP,MACHINE_ID,USER_ID,CITY,BEVERAGE,TEMP,LATENCY,ERROR'];
        const rows = data.map(d => `${d.id},${new Date(d.timestamp).toISOString()},${d.machineId},${d.userId},${d.location.city},${d.beverage},${d.params.temperature},${d.telemetry.latency},${d.telemetry.errorCode || 'OK'}`);
        const csvContent = [headers, ...rows].join('\n');
        const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `iot_logs_${Date.now()}.csv`;
        link.click();
    };

    const COLORS = ['#6366f1', '#10b981', '#f59e0b'];
    const filteredStreamData = useMemo(() => {
        let res = [...data];
        if (activeFilters.city !== 'All') res = res.filter(r => r.location.city === activeFilters.city);
        if (activeFilters.beverage !== 'All') res = res.filter(r => r.beverage === activeFilters.beverage);
        if (activeFilters.status === 'Error') res = res.filter(r => r.telemetry.errorCode);
        if (activeFilters.status === 'Success') res = res.filter(r => !r.telemetry.errorCode);
        return res.slice(-50).reverse();
    }, [data, activeFilters]);

    const tableData = queryResult || filteredStreamData;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* KPI Cards (Neural Nexus Style) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: '数据湖总容量', val: stats.totalBrews.toLocaleString(), sub: '条', est: `Est. ${(stats.totalBrews * 0.0025).toFixed(2)} GB`, icon: Database, color: 'indigo', health: 'good' },
                    { label: '实时吞吐量 (MPS)', val: '182', sub: 'msg/s', est: '实时流', icon: Activity, color: 'emerald', health: 'good' },
                    { label: '数据质量 (Error Rate)', val: `${(stats.errorRate * 100).toFixed(2)}%`, sub: 'PKTS', est: 'Valid: 98.4%', icon: AlertCircle, color: stats.errorRate > 0.05 ? 'rose' : 'slate', health: stats.errorRate > 0.05 ? 'warning' : 'good' },
                    { label: '平均包大小', val: '4.2', sub: 'KB', est: 'Format: JSONB', icon: Network, color: 'cyan', health: 'good' },
                ].map((item, i) => (
                    <div key={i} className="bg-[#020617] border border-slate-800 p-5 rounded-xl shadow-2xl hover:border-indigo-500/50 transition-all group relative overflow-hidden">
                        <div className={`absolute top-0 right-0 w-20 h-20 bg-${item.color}-500/5 rounded-full blur-2xl group-hover:bg-${item.color}-500/10 transition-all`}></div>
                        <div className="flex justify-between items-start mb-3 relative z-10">
                             <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 group-hover:text-slate-300 transition-colors">
                                 <item.icon size={14} className={`text-${item.color}-400`} /> {item.label}
                             </div>
                             {i===1 && <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]"></span><span className="text-[9px] text-emerald-400 font-mono">LIVE</span></div>}
                        </div>
                        <div className="relative z-10">
                             <div className={`text-2xl font-mono font-bold tracking-tighter ${item.color === 'rose' ? 'text-rose-400' : item.color === 'emerald' ? 'text-emerald-400' : item.color === 'cyan' ? 'text-cyan-400' : 'text-indigo-400'}`}>
                                 {item.val} <span className="text-xs font-sans text-slate-500 font-normal ml-1">{item.sub}</span>
                             </div>
                             <div className="text-[10px] text-slate-600 mt-1.5 font-mono flex items-center gap-2">
                                 <div className={`h-1 flex-1 bg-slate-900 rounded-full overflow-hidden border border-white/5`}>
                                     <div className={`h-full bg-${item.color}-500/50`} style={{width: '70%'}}></div>
                                 </div>
                                 {item.est}
                             </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:h-[320px]">
                <div className="lg:col-span-2 bg-[#020617] border border-slate-800 rounded-xl p-0 shadow-2xl flex flex-col relative overflow-hidden h-[300px] lg:h-auto">
                    <div className="p-4 border-b border-white/5 bg-slate-900/30 flex justify-between items-center">
                        <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-2">
                            <Activity size={14} /> 数据摄入速率 (Ingestion Velocity)
                        </h3>
                        <span className="text-[9px] font-mono text-slate-500">REAL-TIME MONITORING</span>
                    </div>
                    <div className="flex-1 min-h-0 w-full p-2">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={ingestionHistory}>
                                <defs>
                                    <linearGradient id="colorMps" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} opacity={0.5}/>
                                <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} tick={{fontFamily: 'JetBrains Mono'}}/>
                                <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} tick={{fontFamily: 'JetBrains Mono'}}/>
                                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '4px', fontSize: '11px', fontFamily: 'JetBrains Mono' }} itemStyle={{color: '#818cf8'}} />
                                <Area type="monotone" dataKey="mps" stroke="#6366f1" strokeWidth={2} fill="url(#colorMps)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-[#020617] border border-slate-800 rounded-xl p-0 shadow-2xl flex flex-col h-[300px] lg:h-auto">
                    <div className="p-4 border-b border-white/5 bg-slate-900/30">
                        <h3 className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-2">
                            <Network size={14} /> 传输协议分布
                        </h3>
                    </div>
                    <div className="flex-1 min-h-0 relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={protocolData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={4} dataKey="value" stroke="none">
                                    {protocolData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '11px' }} itemStyle={{color: '#fff'}} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none flex-col">
                            <div className="text-2xl font-bold text-white font-mono">100%</div>
                            <div className="text-[9px] text-slate-500 uppercase tracking-widest">Protocol</div>
                        </div>
                    </div>
                    <div className="flex justify-center gap-4 pb-4">
                        {protocolData.map((entry, index) => (
                            <div key={entry.name} className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full" style={{backgroundColor: COLORS[index % COLORS.length]}}></div>
                                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wide">{entry.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Console */}
            <div className="bg-[#020617] border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col min-h-[600px] flex-1">
                <div className="bg-[#0B1120] border-b border-slate-800 p-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div className="flex items-center gap-2 px-2">
                        <Terminal size={14} className="text-slate-400" />
                        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Data Lake Console</span>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto overflow-x-auto no-scrollbar">
                         <div className="flex bg-slate-900 rounded-lg p-0.5 border border-slate-800 shrink-0">
                             <button onClick={() => setActiveFilters({ city: 'All', beverage: 'All', status: 'All' })} className="px-3 py-1 text-[10px] font-bold text-slate-400 hover:text-white transition-colors uppercase">Reset</button>
                             <button onClick={() => setShowFilterPanel(!showFilterPanel)} className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all uppercase flex items-center gap-1 ${showFilterPanel ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}><Filter size={10}/> Filter</button>
                         </div>
                         <button onClick={() => setShowFullReport(true)} className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-[10px] font-bold text-emerald-400 transition-all uppercase tracking-wider flex items-center gap-1.5 shrink-0"><FileSpreadsheet size={12}/> Report</button>
                         <button onClick={() => setShowSchemaModal(true)} className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-[10px] font-bold text-indigo-400 transition-all uppercase tracking-wider flex items-center gap-1.5 shrink-0"><Code size={12}/> Schema</button>
                    </div>
                </div>
                
                {/* Query Bar */}
                <div className="border-b border-slate-800 p-3 bg-[#050911] flex flex-col gap-3">
                     <div className="flex gap-2">
                         <div className="flex-1 relative group">
                             <div className="absolute left-3 top-2.5 font-mono text-xs text-indigo-500 font-bold pointer-events-none">{">"}</div>
                             <input 
                                type="text" 
                                value={sqlQuery}
                                onChange={(e) => setSqlQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleRunSQL()}
                                className="w-full bg-[#020617] border border-slate-800 rounded-lg pl-8 pr-20 py-2 text-xs font-mono text-emerald-400 focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-700"
                                spellCheck={false}
                             />
                             <span className="absolute right-3 top-2.5 text-[10px] text-slate-600 font-mono">SQL</span>
                         </div>
                         <button 
                            onClick={handleRunSQL}
                            disabled={isExecuting}
                            className="px-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isExecuting ? <Loader2 size={12} className="animate-spin"/> : <Play size={12} fill="currentColor"/>}
                            RUN
                        </button>
                     </div>
                     
                     {showFilterPanel && (
                        <div className="flex flex-wrap gap-3 animate-in slide-in-from-top-2">
                            {['city', 'beverage', 'status'].map(key => (
                                <select 
                                    key={key}
                                    value={(activeFilters as any)[key]}
                                    onChange={e => setActiveFilters({...activeFilters, [key]: e.target.value})}
                                    className="bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-[10px] font-mono text-slate-300 outline-none focus:border-indigo-500 uppercase"
                                >
                                    <option value="All">ALL {key.toUpperCase()}</option>
                                    {key === 'status' ? ['Success', 'Error'].map(v => <option key={v} value={v}>{v}</option>) : Object.keys(stats[key === 'city' ? 'cityDistribution' : 'beverageDistribution']).map(v => <option key={v} value={v}>{v}</option>)}
                                </select>
                            ))}
                        </div>
                     )}
                </div>

                {/* Data Grid */}
                <div className="flex-1 overflow-auto custom-scrollbar bg-[#020617] relative">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                        <thead className="bg-[#0B1120] text-slate-500 sticky top-0 z-10 shadow-sm">
                            <tr>
                                <th className="px-4 py-2 w-10 border-b border-slate-800"></th>
                                {['TIMESTAMP', 'DEVICE_ID', 'EVENT_TYPE', 'LATENCY', 'STATUS', 'PAYLOAD'].map((h, i) => (
                                    <th key={h} className={`px-4 py-2 text-[10px] font-bold font-mono tracking-wider border-b border-slate-800 ${i > 2 ? 'text-right' : ''}`}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50 text-slate-400 font-mono text-[11px]">
                            {tableData.length === 0 && <tr><td colSpan={7} className="text-center py-20 text-slate-600 italic">NO DATA FOUND</td></tr>}
                            {tableData.map((row) => (
                                <React.Fragment key={row.id}>
                                    <tr 
                                        className={`hover:bg-slate-900/50 transition-colors cursor-pointer group ${expandedRow === row.id ? 'bg-indigo-900/10' : ''}`}
                                        onClick={() => setExpandedRow(expandedRow === row.id ? null : row.id)}
                                    >
                                        <td className="px-4 py-2 text-center text-slate-600 group-hover:text-indigo-400">{expandedRow === row.id ? <ChevronDown size={10}/> : <ChevronRight size={10}/>}</td>
                                        <td className="px-4 py-2 text-slate-300">{new Date(row.timestamp).toISOString().replace('T', ' ').slice(0, 19)}</td>
                                        <td className="px-4 py-2 text-indigo-400 font-bold">{row.machineId}</td>
                                        <td className="px-4 py-2"><span className="px-1.5 py-0.5 rounded border border-slate-800 bg-slate-900 text-[9px] text-slate-400">{row.beverage.toUpperCase().replace(' ', '_')}</span></td>
                                        <td className={`px-4 py-2 text-right ${row.telemetry.latency > 150 ? 'text-amber-400' : 'text-slate-500'}`}>{row.telemetry.latency}ms</td>
                                        <td className="px-4 py-2 text-right">{row.telemetry.errorCode ? <span className="text-rose-500 font-bold">ERR</span> : <span className="text-emerald-500 font-bold">OK</span>}</td>
                                        <td className="px-4 py-2 text-right"><span className="text-[9px] text-indigo-500/50 group-hover:text-indigo-400 transition-colors">{`{...}`}</span></td>
                                    </tr>
                                    {expandedRow === row.id && (
                                        <tr>
                                            <td colSpan={7} className="px-0 py-0 bg-[#050911]">
                                                <div className="p-4 border-b border-slate-800 relative grid grid-cols-1 md:grid-cols-2 gap-8">
                                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600"></div>
                                                    <div>
                                                        <div className="text-[9px] font-bold text-slate-600 uppercase mb-2">Raw JSON Payload</div>
                                                        <pre className="text-[10px] text-emerald-300/90 leading-relaxed overflow-x-auto bg-[#020617] p-3 rounded border border-slate-800">{JSON.stringify({ event_id: row.id, device: { fw: row.firmwareVersion, sig: row.telemetry.signalStrength }, params: row.params, usr: { id: row.userId, loc: row.location }, metrics: { lat: row.telemetry.latency, load: row.telemetry.cpuUsage } }, null, 2)}</pre>
                                                    </div>
                                                    <div className="space-y-4">
                                                        <div>
                                                            <div className="text-[9px] font-bold text-slate-600 uppercase mb-2">Metadata</div>
                                                            <div className="grid grid-cols-2 gap-2 text-[10px]">
                                                                <div className="bg-slate-900 p-2 rounded border border-slate-800"><span className="text-slate-500 block text-[8px] uppercase">Firmware</span><span className="text-slate-300 font-mono">{row.firmwareVersion}</span></div>
                                                                <div className="bg-slate-900 p-2 rounded border border-slate-800"><span className="text-slate-500 block text-[8px] uppercase">Signal</span><span className="text-slate-300 font-mono">{row.telemetry.signalStrength} dBm</span></div>
                                                                <div className="bg-slate-900 p-2 rounded border border-slate-800"><span className="text-slate-500 block text-[8px] uppercase">CPU Load</span><span className="text-slate-300 font-mono">{row.telemetry.cpuUsage}%</span></div>
                                                                <div className="bg-slate-900 p-2 rounded border border-slate-800"><span className="text-slate-500 block text-[8px] uppercase">User ID</span><span className="text-slate-300 font-mono">{row.userId}</span></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Full Report Modal */}
            {showFullReport && (
                <div className="fixed inset-0 z-[3000] bg-black/90 flex items-center justify-center backdrop-blur-md animate-in fade-in p-4">
                    <div className="bg-[#0B1120] border border-slate-700 p-0 rounded-2xl w-full max-w-5xl h-[80vh] flex flex-col shadow-2xl animate-in zoom-in-95 overflow-hidden">
                        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                            <div><h3 className="text-white font-bold text-base flex items-center gap-2"><FileSpreadsheet size={16} className="text-emerald-400"/> 完整 IoT 数据报表</h3></div>
                            <button onClick={()=>setShowFullReport(false)} className="p-1 hover:bg-slate-800 rounded-full transition-colors"><X size={16} className="text-slate-400"/></button>
                        </div>
                        <div className="flex-1 bg-slate-950 overflow-auto custom-scrollbar">
                            <table className="w-full text-left text-xs font-mono border-collapse relative min-w-[800px]">
                            <thead className="bg-slate-900/90 text-slate-400 sticky top-0 z-10 backdrop-blur border-b border-slate-800">
                                <tr>{['TIMESTAMP','DEVICE_ID','CITY','BEVERAGE','TEMP','LATENCY','ERROR'].map(h=><th key={h} className="px-4 py-3 font-semibold whitespace-nowrap">{h}</th>)}</tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50 text-slate-300">
                                {data.slice(0, 1000).map(r => ( // Show first 1000 for performance
                                    <tr key={r.id} className="hover:bg-slate-900/50">
                                        <td className="px-4 py-2 text-slate-500">{new Date(r.timestamp).toLocaleString()}</td>
                                        <td className="px-4 py-2 text-indigo-300">{r.machineId}</td>
                                        <td className="px-4 py-2 text-white">{r.location.city}</td>
                                        <td className="px-4 py-2"><span className="px-1.5 py-0.5 rounded border border-slate-700 bg-slate-800/50 text-[10px]">{r.beverage}</span></td>
                                        <td className={`px-4 py-2 ${r.params.temperature>90?'text-rose-400':'text-slate-300'}`}>{r.params.temperature}°C</td>
                                        <td className="px-4 py-2 text-slate-500">{r.telemetry.latency}ms</td>
                                        <td className="px-4 py-2 text-right">{r.telemetry.errorCode ? <span className="text-rose-400 font-bold">ERR</span> : <span className="text-emerald-500">OK</span>}</td>
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

            {/* Schema Modal */}
            {showSchemaModal && (
                <div className="fixed inset-0 z-[3000] bg-black/90 flex items-center justify-center backdrop-blur-md animate-in fade-in p-4">
                    <div className="bg-[#0B1120] border border-slate-700 p-0 rounded-2xl w-full max-w-2xl flex flex-col shadow-2xl animate-in zoom-in-95 overflow-hidden">
                        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                            <div><h3 className="text-white font-bold text-base flex items-center gap-2"><Code size={16} className="text-indigo-400"/> 数据库 Schema 定义</h3></div>
                            <button onClick={()=>setShowSchemaModal(false)} className="p-1 hover:bg-slate-800 rounded-full transition-colors"><X size={16} className="text-slate-400"/></button>
                        </div>
                        <div className="p-6 bg-[#050911] overflow-auto custom-scrollbar max-h-[500px]">
                             <div className="space-y-6">
                                 <div>
                                     <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Table: device_logs</h4>
                                     <div className="overflow-x-auto">
                                        <table className="w-full text-left text-xs font-mono border-collapse border border-slate-800 min-w-[400px]">
                                            <thead className="bg-slate-900 text-slate-400">
                                                <tr><th className="p-2 border border-slate-800">Column</th><th className="p-2 border border-slate-800">Type</th><th className="p-2 border border-slate-800">Description</th></tr>
                                            </thead>
                                            <tbody className="text-slate-300">
                                                <tr><td className="p-2 border border-slate-800 text-emerald-400">id</td><td className="p-2 border border-slate-800">UUID</td><td className="p-2 border border-slate-800">Primary Key</td></tr>
                                                <tr><td className="p-2 border border-slate-800 text-indigo-400">timestamp</td><td className="p-2 border border-slate-800">TIMESTAMP</td><td className="p-2 border border-slate-800">Event Time (Indexed)</td></tr>
                                                <tr><td className="p-2 border border-slate-800">machine_id</td><td className="p-2 border border-slate-800">VARCHAR(50)</td><td className="p-2 border border-slate-800">Device Serial</td></tr>
                                                <tr><td className="p-2 border border-slate-800">telemetry</td><td className="p-2 border border-slate-800">JSONB</td><td className="p-2 border border-slate-800">Raw sensor data</td></tr>
                                            </tbody>
                                        </table>
                                     </div>
                                 </div>
                                 <div>
                                     <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">SQL Definition</h4>
                                     <pre className="bg-black border border-slate-800 p-3 rounded-lg text-xs text-slate-300 leading-relaxed overflow-x-auto">
{`CREATE TABLE device_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMPTZ NOT NULL,
    machine_id VARCHAR(50) NOT NULL,
    user_id VARCHAR(50),
    location JSONB,
    beverage_type VARCHAR(50),
    params JSONB,
    telemetry JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_logs_timestamp ON device_logs(timestamp DESC);
CREATE INDEX idx_logs_machine ON device_logs(machine_id);`}
                                     </pre>
                                 </div>
                             </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;
