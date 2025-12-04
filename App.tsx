
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { generateBatch, generateSingleRecord, aggregateStats } from './services/dataGenerator';
import { IoTRecord, AggregatedStats, TrainedModelRegistry, ModelType, MLResult, ModelLifecycleRegistry, ModelVersion } from './types';
import { Dashboard } from './components/Dashboard';
import { ModelBuilder } from './components/ModelBuilder';
import { CRMSystem } from './components/CRMSystem';
import { LayoutDashboard, Database, BrainCircuit, Users, Cpu, LineChart, RefreshCw, Pause, Play, Activity, Server, FileJson, Table, Filter, Search, Terminal, HardDrive, Network, AlertCircle, ChevronDown, ChevronRight, Code, FileSpreadsheet, Download, X, Loader2, Key, Hash, Type } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie } from 'recharts';

const App = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'models' | 'data' | 'crm'>('dashboard');
  const [data, setData] = useState<IoTRecord[]>([]);
  const [stats, setStats] = useState<AggregatedStats | null>(null);
  
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
    loadInitialData();
  }, []);

  useEffect(() => {
    if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
    if (isLive) {
      streamIntervalRef.current = setInterval(() => {
        ingestRealtimeData();
      }, 5000); 
    }
    return () => {
      if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
    };
  }, [isLive]);

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

  return (
    <div className="h-screen bg-[#020617] text-slate-200 font-sans flex overflow-hidden selection:bg-indigo-500/30">
      
      {/* Sidebar - Precision Layout */}
      <aside className="w-64 bg-[#0B1120] border-r border-slate-800/80 flex flex-col z-30 shadow-2xl shrink-0">
        <div className="h-16 flex items-center px-6 gap-3 border-b border-slate-800/80">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
            <Cpu size={18} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="font-bold text-sm tracking-tight text-white truncate">
            中茶智泡大师<span className="text-indigo-500 ml-1">AI</span>
          </span>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1">
          <SidebarItem icon={<LayoutDashboard size={18} />} label="全域监控总览" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <SidebarItem icon={<Users size={18} />} label="智能客户管理" active={activeTab === 'crm'} onClick={() => setActiveTab('crm')} />
          <SidebarItem icon={<BrainCircuit size={18} />} label="AI 模型实验室" active={activeTab === 'models'} onClick={() => setActiveTab('models')} />
           <SidebarItem icon={<Database size={18} />} label="IoT 数据中心" active={activeTab === 'data'} onClick={() => setActiveTab('data')} />
        </nav>

        <div className="p-4 border-t border-slate-800/80">
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
        <header className="h-16 bg-[#0B1120]/60 backdrop-blur-md border-b border-slate-800/80 flex items-center justify-between px-6 z-20 shrink-0 sticky top-0">
           <div className="flex items-center gap-4">
              <h1 className="text-base font-semibold text-slate-100 flex items-center gap-2.5">
                {activeTab === 'dashboard' && <><LineChart size={18} className="text-indigo-400"/> 企业级运营监控仪表盘</>}
                {activeTab === 'crm' && <><Users size={18} className="text-indigo-400"/> 客户全景画像与智能营销</>}
                {activeTab === 'models' && <><BrainCircuit size={18} className="text-indigo-400"/> 机器学习模型训练平台</>}
                {activeTab === 'data' && <><Database size={18} className="text-indigo-400"/> IoT 原始数据探索</>}
              </h1>
           </div>
           
           <div className="flex items-center gap-3">
              <div className="flex items-center bg-slate-900 border border-slate-700/50 rounded-lg p-0.5 shadow-sm">
                 <div className="flex items-center px-3 gap-2 border-r border-slate-700/50 mr-1 py-1">
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
              <div className="h-8 w-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-indigo-400 ring-2 ring-transparent hover:ring-indigo-500/50 transition-all cursor-pointer">
                NB
              </div>
           </div>
        </header>

        {/* Content Body */}
        {/* FIXED: Removed p-6 padding and changed overflow handling for dashboard mode to allow fit-to-screen */}
        <div className={`flex-1 ${activeTab === 'dashboard' ? 'overflow-hidden p-4' : 'overflow-y-auto p-6'} scroll-smooth custom-scrollbar`}>
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
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: '数据湖总容量', val: stats.totalBrews.toLocaleString(), sub: '条记录', est: `Est. ${(stats.totalBrews * 0.0025).toFixed(2)} GB`, icon: Database, color: 'indigo' },
                    { label: '实时吞吐量 (MPS)', val: '182', sub: 'msg/sec', est: '实时流', icon: Activity, color: 'emerald' },
                    { label: '数据质量 (Error Rate)', val: `${(stats.errorRate * 100).toFixed(2)}%`, sub: 'Packets', est: 'Valid: 98.4%', icon: AlertCircle, color: stats.errorRate > 0.05 ? 'rose' : 'slate' },
                    { label: '平均包大小', val: '4.2', sub: 'KB', est: 'Compression: Snappy', icon: Network, color: 'cyan' },
                ].map((item, i) => (
                    <div key={i} className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-sm hover:border-slate-700 transition-colors group">
                        <div className="flex justify-between items-start mb-3">
                             <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2 group-hover:text-slate-300 transition-colors">
                                 <item.icon size={14} /> {item.label}
                             </div>
                             {i===1 && <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20 animate-pulse font-mono">LIVE</span>}
                        </div>
                        <div>
                             <div className={`text-2xl font-mono font-bold ${item.color === 'rose' ? 'text-rose-400' : item.color === 'emerald' ? 'text-emerald-400' : item.color === 'cyan' ? 'text-cyan-400' : 'text-slate-100'}`}>
                                 {item.val} <span className="text-sm font-sans text-slate-500 font-normal">{item.sub}</span>
                             </div>
                             <div className="text-[10px] text-slate-500 mt-1 font-mono">{item.est}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-6">
                        <Activity size={14} className="text-indigo-400"/> 数据摄入速率趋势 (Ingestion Stream)
                    </h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={ingestionHistory}>
                                <defs>
                                    <linearGradient id="colorMps" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                                <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                                <Area type="monotone" dataKey="mps" stroke="#6366f1" strokeWidth={2} fill="url(#colorMps)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg flex flex-col">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-6">
                        <Network size={14} className="text-emerald-400"/> 传输协议分布
                    </h3>
                    <div className="flex-1 min-h-0 relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={protocolData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                    {protocolData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="transparent" />)}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="text-center">
                                <div className="text-[10px] text-slate-500 uppercase">Total</div>
                                <div className="text-xl font-bold text-white">100%</div>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-center gap-4 mt-2">
                        {protocolData.map((entry, index) => (
                            <div key={entry.name} className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full" style={{backgroundColor: COLORS[index % COLORS.length]}}></div>
                                <span className="text-xs text-slate-400">{entry.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Console */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg flex flex-col min-h-[500px]">
                <div className="bg-slate-950 border-b border-slate-800 p-3 flex flex-col gap-3">
                    <div className="flex flex-col md:flex-row gap-3 justify-between">
                        <div className="flex-1 max-w-3xl bg-slate-900 border border-slate-800 rounded-lg flex items-center px-3 py-2 focus-within:border-indigo-500/50 transition-colors relative group">
                            <Terminal size={14} className="text-indigo-400 mr-3 shrink-0" />
                            <input 
                                type="text" 
                                value={sqlQuery}
                                onChange={(e) => setSqlQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleRunSQL()}
                                className="bg-transparent border-none outline-none text-xs font-mono text-slate-300 w-full placeholder:text-slate-600 group-focus-within:text-white"
                            />
                            <button 
                                onClick={handleRunSQL}
                                disabled={isExecuting}
                                className={`text-[10px] px-3 py-1 rounded ml-2 font-bold flex items-center gap-1 transition-all uppercase tracking-wider ${
                                    isExecuting ? 'bg-slate-800 text-slate-500' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                                }`}
                            >
                                {isExecuting ? <Loader2 size={10} className="animate-spin"/> : '运行 SQL'}
                            </button>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => setShowFullReport(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-medium text-emerald-400 hover:bg-slate-800 hover:border-emerald-500/50 transition-colors"><FileSpreadsheet size={14}/> 完整报表</button>
                            <button onClick={() => setShowFilterPanel(!showFilterPanel)} className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-xs font-medium transition-colors ${showFilterPanel ? 'bg-indigo-900/20 border-indigo-500 text-indigo-300' : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'}`}><Filter size={14}/> 筛选</button>
                            <button onClick={() => setShowSchemaModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800 hover:border-indigo-500/50 transition-colors"><Code size={14}/> Schema</button>
                        </div>
                    </div>
                    {showFilterPanel && (
                        <div className="bg-slate-900/50 border-t border-slate-800/50 pt-3 flex flex-wrap gap-4 items-center animate-in slide-in-from-top-1">
                            {['city', 'beverage', 'status'].map(key => (
                                <div key={key} className="flex flex-col gap-1">
                                    <label className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">{key}</label>
                                    <select 
                                        value={(activeFilters as any)[key]}
                                        onChange={e => setActiveFilters({...activeFilters, [key]: e.target.value})}
                                        className="bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-xs text-slate-300 outline-none focus:border-indigo-500 min-w-[120px]"
                                    >
                                        <option value="All">全部 {key.charAt(0).toUpperCase() + key.slice(1)}</option>
                                        {key === 'status' ? ['Success', 'Error'].map(v => <option key={v} value={v}>{v}</option>) : Object.keys(stats[key === 'city' ? 'cityDistribution' : 'beverageDistribution']).map(v => <option key={v} value={v}>{v}</option>)}
                                    </select>
                                </div>
                            ))}
                            <button onClick={() => setActiveFilters({ city: 'All', beverage: 'All', status: 'All' })} className="mt-4 text-xs text-slate-500 hover:text-indigo-400">重置</button>
                        </div>
                    )}
                </div>

                <div className="flex-1 overflow-auto custom-scrollbar relative bg-[#050911]">
                    <table className="w-full text-left text-xs font-mono border-collapse">
                        <thead className="bg-slate-900/90 text-slate-500 sticky top-0 z-10 backdrop-blur-md border-b border-slate-800">
                            <tr>
                                <th className="px-4 py-3 w-10"></th>
                                {['TIMESTAMP', 'DEVICE_ID', 'EVENT_TYPE', 'LATENCY', 'STATUS', 'PAYLOAD'].map((h, i) => (
                                    <th key={h} className={`px-4 py-3 font-semibold tracking-wider ${i > 2 ? 'text-right' : ''}`}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50 text-slate-400">
                            {tableData.length === 0 && <tr><td colSpan={7} className="text-center py-12 text-slate-600 italic">暂无日志数据。</td></tr>}
                            {tableData.map((row) => (
                                <React.Fragment key={row.id}>
                                    <tr 
                                        className={`hover:bg-slate-800/40 transition-colors cursor-pointer ${expandedRow === row.id ? 'bg-indigo-900/10 border-l-2 border-l-indigo-500' : 'border-l-2 border-l-transparent'}`}
                                        onClick={() => setExpandedRow(expandedRow === row.id ? null : row.id)}
                                    >
                                        <td className="px-4 py-2.5 text-center">{expandedRow === row.id ? <ChevronDown size={12}/> : <ChevronRight size={12}/>}</td>
                                        <td className="px-4 py-2.5 text-slate-300">{new Date(row.timestamp).toISOString().replace('T', ' ').slice(0, 19)}</td>
                                        <td className="px-4 py-2.5 text-indigo-300">{row.machineId}</td>
                                        <td className="px-4 py-2.5"><span className="px-1.5 py-0.5 rounded border border-slate-700 bg-slate-800/50 text-[10px]">{row.beverage.toUpperCase().replace(' ', '_')}</span></td>
                                        <td className={`px-4 py-2.5 text-right ${row.telemetry.latency > 150 ? 'text-amber-400' : 'text-slate-400'}`}>{row.telemetry.latency}ms</td>
                                        <td className="px-4 py-2.5 text-right">{row.telemetry.errorCode ? <span className="text-rose-400 font-bold flex items-center justify-end gap-1"><AlertCircle size={10}/> ERR</span> : <span className="text-emerald-500">OK</span>}</td>
                                        <td className="px-4 py-2.5 text-right"><span className="text-[10px] text-indigo-400 opacity-70">JSON</span></td>
                                    </tr>
                                    {expandedRow === row.id && (
                                        <tr>
                                            <td colSpan={7} className="px-0 py-0 bg-black">
                                                <div className="p-4 border-b border-slate-800 relative">
                                                    <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                                                    <pre className="text-[11px] font-mono text-emerald-300 leading-relaxed overflow-x-auto">{JSON.stringify({ event_id: row.id, device: { fw: row.firmwareVersion, sig: row.telemetry.signalStrength }, params: row.params, usr: { id: row.userId, loc: row.location }, metrics: { lat: row.telemetry.latency, load: row.telemetry.cpuUsage } }, null, 2)}</pre>
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
            {/* Modals for Report/Schema would go here (same as before but using the updated clean styles) */}
        </div>
    );
};

export default App;
