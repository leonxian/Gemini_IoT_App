
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Line, ComposedChart, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ReferenceDot, Treemap, ScatterChart, Scatter, ZAxis, ReferenceLine, ReferenceArea, Label, LabelList } from 'recharts';
import { AggregatedStats, IoTRecord, MachineFleetStatus, MachineStatus, BeverageType, Gender, ModelType } from '../types';
import { getFleetStatus } from '../services/dataGenerator';
import { generateInsight } from '../services/geminiService';
import { Activity, Wifi, Map as MapIcon, Zap, TrendingUp, Users, Coffee, Cpu, AlertTriangle, Radio, BarChart3, RotateCcw, MonitorSmartphone, ChevronDown, Target, Crown, Calendar, Filter, FileSpreadsheet, Download, X, Layers, Smartphone, Power, CheckCircle2, ArrowRight, Sparkles, AlertCircle, ArrowUpRight, ArrowDownRight, DollarSign, Percent, Loader2, MapPin, BrainCircuit, FileText, Share2, MoreHorizontal, Search, Terminal, Signal, Server, LocateFixed, ArrowLeft } from 'lucide-react';
import * as L from 'leaflet';

interface DashboardProps {
  stats: AggregatedStats;
  data: IoTRecord[];
}

const COLORS = {
  primary: '#6366f1', secondary: '#06b6d4', accent: '#f43f5e', success: '#10b981', warning: '#f59e0b', dark: '#0f172a', grid: '#1e293b', text: '#64748b',
  tree: ['#6366f1', '#818cf8', '#a5b4fc', '#06b6d4', '#22d3ee', '#67e8f9', '#f43f5e', '#fb7185']
};

// Unified Product Color Palette
const PRODUCT_COLORS: Record<string, string> = {
    [BeverageType.ESPRESSO]: '#6366f1', // Indigo
    [BeverageType.LUNGO]: '#a855f7',    // Purple
    [BeverageType.RISRETTO]: '#ec4899', // Pink
    [BeverageType.LATTE_MACCHIATO]: '#3b82f6', // Blue
    [BeverageType.CAPPUCCINO]: '#06b6d4', // Cyan
    [BeverageType.GREEN_TEA]: '#10b981', // Emerald
    [BeverageType.BLACK_TEA]: '#f59e0b', // Amber
    [BeverageType.EARL_GREY]: '#f97316', // Orange
    'Seasonal': '#f43f5e', // Rose
    'Cold Brew': '#14b8a6', // Teal
};
const DEFAULT_PRODUCT_COLOR = '#64748b'; // Slate

const CITY_COORDS: Record<string, [number, number]> = {
    'Shanghai': [31.2304, 121.4737], 'Beijing': [39.9042, 116.4074], 'Shenzhen': [22.5431, 114.0579],
    'Guangzhou': [23.1291, 113.2644], 'Chengdu': [30.5728, 104.0668], 'Hangzhou': [30.2741, 120.1551],
    'Wuhan': [30.5928, 114.3055], 'Xian': [34.3416, 108.9398], 'Chongqing': [29.5630, 106.5516],
    'Nanjing': [32.0603, 118.7969]
};
const CITY_TRANSLATION: Record<string, string> = {
    'Shanghai': '上海', 'Beijing': '北京', 'Shenzhen': '深圳',
    'Guangzhou': '广州', 'Chengdu': '成都', 'Hangzhou': '杭州',
    'Wuhan': '武汉', 'Xian': '西安', 'Chongqing': '重庆', 'Nanjing': '南京'
};
const CHINA_BOUNDS: L.LatLngBoundsExpression = [[10, 70], [55, 140]];

export const Dashboard: React.FC<DashboardProps> = ({ stats, data }) => {
  const [viewMode, setViewMode] = useState<'analytics' | 'telemetry'>('analytics');

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-700 overflow-hidden bg-[#020617]">
      {/* Header Controls - Floating HUD Style */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center px-4 py-3 shrink-0 z-[2000] relative border-b border-white/5 bg-[#0B1120]/80 backdrop-blur-md min-h-[56px] gap-2 md:gap-0">
         <div className="flex gap-1 bg-slate-900 p-1 rounded-lg border border-slate-700/50 shadow-inner w-full md:w-auto overflow-x-auto">
            {['analytics', 'telemetry'].map((mode) => (
                <button 
                   key={mode}
                   onClick={() => setViewMode(mode as any)}
                   className={`flex-1 md:flex-none px-4 py-1.5 rounded-md text-[11px] font-bold transition-all flex items-center justify-center gap-2 tracking-wide uppercase whitespace-nowrap ${
                      viewMode === mode ? (mode === 'analytics' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20') : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                   }`}
                >
                   {mode === 'analytics' ? <BarChart3 size={14}/> : <Activity size={14}/>}
                   {mode === 'analytics' ? '商业智能分析 (BI)' : 'IoT 实时监控中心'}
                </button>
            ))}
         </div>
         <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
             <div className="hidden md:flex items-center gap-4 text-[10px] text-slate-500 font-mono">
                 <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>数据流: 实时</span>
                 <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>网关: 已连接</span>
             </div>
             <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 rounded-full border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)] ml-auto md:ml-0">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-[pulse_2s_infinite]"></div>
                <span className="text-[10px] font-bold text-emerald-400 tracking-wider">系统在线</span>
            </div>
         </div>
      </div>
      
      <div className="flex-1 min-h-0 relative p-4 lg:overflow-hidden overflow-y-auto">
        {viewMode === 'analytics' ? <AnalyticsView stats={stats} data={data} /> : <div className="lg:h-full h-auto pr-1 pb-2"><TelemetryView stats={stats} data={data} /></div>}
      </div>
    </div>
  );
};

const AnalyticsView: React.FC<DashboardProps> = ({ stats, data }) => {
  const [showFullReport, setShowFullReport] = useState(false);
  const [timeRange, setTimeRange] = useState<'Day'|'Week'|'Month'>('Month');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [showAIReportModal, setShowAIReportModal] = useState(false);
  const [aiReportContent, setAiReportContent] = useState('');

  // --- STRICT DATA FILTERING ---
  const filteredData = useMemo(() => {
      const now = new Date();
      const startTime = new Date(now);
      
      if (timeRange === 'Day') {
          startTime.setHours(0, 0, 0, 0);
      } else if (timeRange === 'Week') {
          const day = startTime.getDay() || 7; // 1=Mon, 7=Sun
          startTime.setHours(-24 * (day - 1));
          startTime.setHours(0, 0, 0, 0);
      } else { // Month
          startTime.setDate(1);
          startTime.setHours(0, 0, 0, 0);
      }
      
      const startMs = startTime.getTime();
      return data.filter(r => r.timestamp >= startMs);
  }, [data, timeRange]);

  // --- Dynamic Data for Charts (STRICT CALENDAR ALIGNMENT & DETERMINISTIC PREDICTION) ---
  const revenueData = useMemo(() => {
      const now = new Date();
      let buckets: { label: string, revenue: number, count: number, isFuture: boolean }[] = [];
      let currentIndex = 0;

      if (timeRange === 'Day') {
          currentIndex = now.getHours();
          for(let i=0; i<24; i++) buckets.push({ label: `${i}:00`, revenue: 0, count: 0, isFuture: i > currentIndex });
      } else if (timeRange === 'Week') {
          const day = now.getDay() || 7; 
          currentIndex = day - 1; // 0=Mon
          const days = ['周一','周二','周三','周四','周五','周六','周日'];
          for(let i=0; i<7; i++) buckets.push({ label: days[i], revenue: 0, count: 0, isFuture: i > currentIndex });
      } else { 
          const date = now.getDate();
          currentIndex = date - 1; 
          const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
          for(let i=1; i<=daysInMonth; i++) buckets.push({ label: `${now.getMonth()+1}/${i}`, revenue: 0, count: 0, isFuture: (i-1) > currentIndex });
      }

      // Aggregate filtered data
      filteredData.forEach(r => {
          const d = new Date(r.timestamp);
          let idx = -1;
          if (timeRange === 'Day') {
              if (d.toDateString() === now.toDateString()) idx = d.getHours();
          } else if (timeRange === 'Week') {
              const currentMonday = new Date(now);
              const day = currentMonday.getDay() || 7; 
              currentMonday.setHours(-24 * (day - 1), 0,0,0);
              const nextMonday = new Date(currentMonday);
              nextMonday.setDate(nextMonday.getDate() + 7);
              if (r.timestamp >= currentMonday.getTime() && r.timestamp < nextMonday.getTime()) {
                  idx = (d.getDay() || 7) - 1;
              }
          } else { 
              if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) idx = d.getDate() - 1;
          }

          if (idx >= 0 && buckets[idx]) {
              buckets[idx].revenue += (r.quantity * 4.5 * 10);
              buckets[idx].count++;
          }
      });

      const getStableRandom = (seedStr: string) => {
          let hash = 0;
          for (let i = 0; i < seedStr.length; i++) {
              hash = ((hash << 5) - hash) + seedStr.charCodeAt(i);
              hash |= 0;
          }
          const x = Math.sin(hash) * 10000;
          return x - Math.floor(x);
      };

      return buckets.map((b, i) => {
          const isCurrent = i === currentIndex;
          const isFuture = b.isFuture;
          const isPast = !isCurrent && !isFuture;
          const baseScale = timeRange === 'Day' ? 8000 : timeRange === 'Week' ? 50000 : 12000;
          const seed = b.label + timeRange + "v1";
          const rnd = getStableRandom(seed);
          const predictedVal = baseScale * (0.8 + rnd * 0.4);

          let growthActual = 0;
          if (!isFuture && i > 0 && buckets[i-1].revenue > 0) {
             growthActual = ((b.revenue - buckets[i-1].revenue) / buckets[i-1].revenue) * 100;
          }

          let growthPredicted = 0;
          if (isFuture) {
              const prevPredSeed = buckets[i-1].label + timeRange + "v1";
              const prevPredVal = baseScale * (0.8 + getStableRandom(prevPredSeed) * 0.4);
              growthPredicted = ((predictedVal - prevPredVal) / prevPredVal) * 100;
          } else if (isCurrent) {
              growthPredicted = growthActual; 
          }

          return {
              label: b.label,
              revenue: isFuture ? null : b.revenue,
              predicted: isPast ? null : predictedVal,
              growthActual: isFuture ? null : growthActual,
              growthPredicted: isPast ? null : growthPredicted
          };
      });

  }, [timeRange, filteredData]); 

  // KPI Calculation based on filtered Data
  const kpiStats = useMemo(() => {
      const totalRev = filteredData.reduce((acc, r) => acc + (r.quantity * 4.5 * 10), 0); // Simulated price
      const totalBrews = filteredData.length;
      const dau = new Set(filteredData.map(d => d.userId)).size;
      const arpu = dau > 0 ? totalRev / dau : 0;
      
      // Deterministic sparkline seed based on timeRange
      const seedVal = timeRange === 'Day' ? 10 : timeRange === 'Week' ? 50 : 100;
      const sparklineData = Array.from({length: 12}, (_, i) => ({ val: Math.sin((i + seedVal) * 0.5) * 50 + 50 + (Math.random() * 20) }));
      
      return { totalRev, totalBrews, dau, arpu, sparklineData };
  }, [filteredData, timeRange]);

  const cityHeatmapData = useMemo(() => {
      const counts: Record<string, number> = {};
      filteredData.forEach(r => counts[r.location.city] = (counts[r.location.city] || 0) + (r.quantity * 4.5 * 10));
      const total = Object.values(counts).reduce((a,b)=>a+b, 0) || 1;
      return Object.entries(counts)
        .map(([city, val]) => ({ 
            city: CITY_TRANSLATION[city] || city, 
            sales: val, 
            pct: (val/total)*100,
            growth: (Math.random() * 20) - 5 
        }))
        .sort((a,b) => b.sales - a.sales);
  }, [filteredData]);

  const bcgMatrixData = useMemo(() => {
      // Aggregate by beverage in filtered window
      const sales: Record<string, number> = {};
      filteredData.forEach(r => sales[r.beverage] = (sales[r.beverage] || 0) + 1);
      
      const products = [BeverageType.ESPRESSO, BeverageType.LUNGO, BeverageType.LATTE_MACCHIATO, 'Seasonal', 'Cold Brew'];
      return products.map(p => {
          const val = sales[p as string] || 0;
          const share = Math.min(95, Math.max(5, (val / filteredData.length) * 100));
          const growth = Math.random() * 100;
          let type = '';
          if (share > 50 && growth > 50) type = '明星产品 (Star)';
          else if (share > 50) type = '金牛产品 (Cow)';
          else if (growth > 50) type = '问题产品 (Question)';
          else type = '瘦狗产品 (Dog)';
          
          return { 
            name: p, 
            x: share, 
            y: growth, 
            z: val * 10, 
            type,
            fill: PRODUCT_COLORS[p] || DEFAULT_PRODUCT_COLOR 
          };
      });
  }, [filteredData]);

  const treemapData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredData.forEach(r => counts[r.beverage] = (counts[r.beverage] || 0) + 1);
    return Object.entries(counts)
      .map(([name, value], idx) => ({ 
          name, 
          size: value, 
          fill: PRODUCT_COLORS[name] || DEFAULT_PRODUCT_COLOR 
      }))
      .sort((a,b) => b.size - a.size);
  }, [filteredData]);

  const aiBriefings = useMemo(() => {
      const scope = timeRange === 'Day' ? '今日' : timeRange === 'Week' ? '本周' : '本月';
      return [
          { title: "营收激增", type: "机遇", color: "emerald", content: `${scope}营收超出目标 **12%**，主要由上海地区 **燕麦拿铁** 销量驱动。`, time: "09:41" },
          { title: "库存预警", type: "风险", color: "amber", content: `**绿茶** 在深圳仓库存严重不足 (< 3天)，需关注${scope}补货计划。`, time: "08:30" },
          { title: "流失风险", type: "警告", color: "rose", content: `${scope}下午4-6点时段用户留存率环比下降 **5%**。`, time: "昨天" },
          { title: "气象影响", type: "预测", color: "cyan", content: "预计下个周期热饮需求将提升 **+15%**。", time: "昨天" }
      ];
  }, [timeRange]);

  const handleGenerateReport = async () => {
      setIsGeneratingReport(true);
      try {
          const report = await generateInsight(ModelType.SALES_PREDICTION, stats);
          setAiReportContent(report);
          setShowAIReportModal(true);
      } catch (e) {
          console.error(e);
          setAiReportContent("生成报告时发生错误，请稍后重试。");
          setShowAIReportModal(true);
      } finally {
          setIsGeneratingReport(false);
      }
  };

  const handleExportReportFile = () => {
    if (!aiReportContent) return;
    const blob = new Blob([aiReportContent], { type: 'text/markdown;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `AI_Strategic_Insight_Report_${Date.now()}.md`;
    link.click();
  };

  const handleExportCSV = () => {
      const headers = ['时间戳,城市,饮品类型,数量,营收,水温,延迟'];
      const rows = filteredData.map(r => `${new Date(r.timestamp).toISOString()},${r.location.city},${r.beverage},${r.quantity},${r.quantity * 4.5},${r.params.temperature},${r.telemetry.latency}`);
      const csv = [headers, ...rows].join('\n');
      const blob = new Blob(["\ufeff" + csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `bi_report_${timeRange}_${Date.now()}.csv`;
      link.click();
  };

  const CustomTreemapContent = (props: any) => {
    const { x, y, width, height, name, size } = props;
    return (
      <g>
        <rect x={x} y={y} width={width} height={height} style={{ fill: props.fill, stroke: '#020617', strokeWidth: 2, opacity: 0.9 }} />
        {width > 40 && height > 30 && (
          <>
            <text x={x + 6} y={y + 16} fill="#fff" fontSize={10} fontWeight="bold" textAnchor="start" style={{textTransform:'uppercase'}}>{name.split(' ')[0]}</text>
            <text x={x + 6} y={y + 28} fill="rgba(255,255,255,0.7)" fontSize={9} textAnchor="start" fontFamily="JetBrains Mono">{(size || 0).toLocaleString()}</text>
          </>
        )}
      </g>
    );
  };

  const ChartHeader = ({ title, icon: Icon, color = "indigo" }: any) => (
      <div className="flex justify-between items-center mb-2 pb-2 border-b border-white/5">
          <h3 className={`text-xs font-bold uppercase tracking-widest flex items-center gap-2 text-slate-200`}>
              <Icon size={14} className={`text-${color}-400`} /> {title}
          </h3>
          <button className="text-slate-500 hover:text-white transition-colors"><MoreHorizontal size={14} /></button>
      </div>
  );

  return (
    <div className="flex flex-col h-full gap-3 overflow-visible lg:overflow-hidden">
       
       {/* 1. Global Toolbar */}
       <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center bg-slate-900/60 p-2 rounded-xl border border-white/5 backdrop-blur-md shadow-2xl shrink-0 min-h-[48px] gap-2 lg:gap-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 pl-1 lg:pl-2 w-full lg:w-auto">
             <div className="flex items-center gap-2 text-indigo-400">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shrink-0"><BarChart3 size={16} /></div>
                <div>
                    <span className="block text-xs font-bold tracking-wide text-white whitespace-nowrap">商业智能分析</span>
                    <span className="block text-[9px] text-slate-500 font-mono tracking-wider">实时数据洞察</span>
                </div>
             </div>
             <div className="hidden sm:block h-6 w-px bg-white/5 mx-2"></div>
             {/* Integrated Time Controls */}
             <div className="flex bg-slate-950 rounded-lg p-1 border border-slate-800 w-full sm:w-auto overflow-x-auto">
                {['Day', 'Week', 'Month'].map(r => (
                   <button key={r} onClick={()=>setTimeRange(r as any)} className={`flex-1 sm:flex-none px-3 sm:px-4 py-1 text-[10px] font-bold rounded-md transition-all uppercase tracking-wider whitespace-nowrap ${timeRange===r ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'}`}>{r === 'Day' ? '今日实时' : r === 'Week' ? '本周累计' : '本月汇总'}</button>
                ))}
             </div>
          </div>
          <div className="flex items-center gap-3 pr-2 w-full lg:w-auto justify-end">
             <button onClick={()=>setShowFullReport(true)} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-[10px] font-bold text-slate-300 transition-all uppercase tracking-wider flex items-center gap-2 hover:border-slate-500 whitespace-nowrap"><FileSpreadsheet size={12}/> <span className="hidden sm:inline">导出数据报表</span><span className="sm:hidden">报表</span></button>
             <button onClick={handleGenerateReport} disabled={isGeneratingReport} className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2 border border-indigo-500/50 whitespace-nowrap">
                 {isGeneratingReport ? <Loader2 size={12} className="animate-spin"/> : <Sparkles size={12}/>}
                 {isGeneratingReport ? '分析中...' : 'AI 智能洞察'}
             </button>
          </div>
       </div>

       {/* 2. KPI HUD Grid */}
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 shrink-0 lg:h-[100px] h-auto">
           <ContextualKPI label="总营收 (GMV)" value={`¥${kpiStats.totalRev.toLocaleString()}`} trend="+24.5%" color="indigo" icon={DollarSign} data={kpiStats.sparklineData} target={85} />
           <ContextualKPI label="总冲泡杯数" value={kpiStats.totalBrews.toLocaleString()} trend="+8.3%" color="amber" icon={Coffee} data={kpiStats.sparklineData.map(d=>({val:d.val*0.8}))} target={62} />
           <ContextualKPI label="日活跃用户 (DAU)" value={kpiStats.dau.toLocaleString()} trend="+12.8%" color="emerald" icon={Users} data={kpiStats.sparklineData.map(d=>({val:d.val*0.5}))} target={94} />
           <ContextualKPI label="客单价 (ARPU)" value={`¥${kpiStats.arpu.toFixed(1)}`} trend="+5.2%" color="cyan" icon={Target} data={kpiStats.sparklineData.map(d=>({val:d.val*1.2}))} target={78} />
       </div>

       {/* 3. Main Analytics & AI Feed Split + 4. Deep Dive Metrics (Grid 3) Container */}
       <div className="flex-1 flex flex-col gap-3 lg:overflow-hidden h-auto lg:h-full">
          {/* Top Row: Revenue + AI Feed */}
          <div className="grid grid-cols-12 gap-3 lg:flex-[55] lg:min-h-0 h-auto shrink-0">
              {/* Revenue Chart (Hero) */}
              <div className="col-span-12 lg:col-span-8 bg-slate-900/50 border border-white/5 rounded-xl p-4 flex flex-col backdrop-blur-md shadow-2xl relative group overflow-hidden h-[350px] lg:h-auto">
                 <div className="absolute top-0 right-0 w-[300px] h-full bg-indigo-500/5 blur-[80px] pointer-events-none transition-opacity opacity-50 group-hover:opacity-100"></div>
                 <ChartHeader title="营收趋势与智能预测" icon={BarChart3} color="indigo" />
                 
                 <div className="flex-1 min-h-0 w-full relative z-10">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={revenueData} margin={{top:10,right:10,left:-20,bottom:0}}>
                            <defs>
                                <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6366f1" stopOpacity={0.6}/><stop offset="100%" stopColor="#6366f1" stopOpacity={0.05}/></linearGradient>
                                <pattern id="stripe" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="4" height="8" transform="translate(0,0)" fill="#6366f1" fillOpacity="0.2"></rect></pattern>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} opacity={0.4}/>
                            <XAxis dataKey="label" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} dy={10} tick={{fontFamily: 'JetBrains Mono'}}/>
                            <YAxis yAxisId="left" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v)=>`¥${v/1000}k`} tick={{fontFamily: 'JetBrains Mono'}}/>
                            <YAxis yAxisId="right" orientation="right" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v)=>`${v}%`} tick={{fontFamily: 'JetBrains Mono'}}/>
                            <Tooltip contentStyle={{backgroundColor:'#0f172a', borderColor:'#334155', borderRadius:'8px', padding:'12px', boxShadow:'0 10px 15px -3px rgba(0, 0, 0, 0.5)'}} itemStyle={{fontSize:'11px', fontFamily:'JetBrains Mono', padding:'2px 0'}} labelStyle={{color:'#94a3b8', fontSize:'10px', marginBottom:'8px', textTransform:'uppercase', fontWeight:'bold'}} cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '5 5' }} />
                            <Bar yAxisId="left" dataKey="revenue" fill="url(#revenueFill)" barSize={32} radius={[4,4,0,0]} name="实际营收"/>
                            <Bar yAxisId="left" dataKey="predicted" fill="url(#stripe)" stroke="#6366f1" strokeWidth={1} strokeOpacity={0.3} strokeDasharray="4 4" barSize={32} radius={[4,4,0,0]} name="AI 预测"/>
                            <Line yAxisId="right" type="monotone" dataKey="growthActual" stroke="#10b981" strokeWidth={2} dot={{r:3, fill:'#020617', stroke:'#10b981', strokeWidth:2}} name="实际增长"/>
                            <Line yAxisId="right" type="monotone" dataKey="growthPredicted" stroke="#10b981" strokeWidth={2} strokeDasharray="4 4" dot={false} name="预测增长"/>
                        </ComposedChart>
                    </ResponsiveContainer>
                 </div>
              </div>

              {/* AI Briefing Feed */}
              <div className="col-span-12 lg:col-span-4 bg-slate-900/50 border border-white/5 rounded-xl p-0 flex flex-col backdrop-blur-md shadow-2xl relative overflow-hidden h-[350px] lg:h-auto">
                 <div className="p-3 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                     <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 text-slate-200"><BrainCircuit size={14} className="text-emerald-400" /> AI 神经网络情报流</h3>
                     <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]"></div>
                 </div>
                 <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
                     {aiBriefings.map((item, i) => (
                         <div key={i} className="p-3 border-b border-white/5 hover:bg-white/[0.02] transition-colors group relative">
                             <div className={`absolute left-0 top-0 bottom-0 w-0.5 transition-all group-hover:w-1 ${item.color==='emerald'?'bg-emerald-500':item.color==='amber'?'bg-amber-500':item.color==='rose'?'bg-rose-500':'bg-cyan-500'}`}></div>
                             <div className="flex justify-between items-start mb-1 pl-2">
                                 <div className="flex items-center gap-2">
                                    <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${item.color==='emerald'?'border-emerald-500/20 text-emerald-400 bg-emerald-500/10':item.color==='amber'?'border-amber-500/20 text-amber-400 bg-amber-500/10':item.color==='rose'?'border-rose-500/20 text-rose-400 bg-rose-500/10':'border-cyan-500/20 text-cyan-400 bg-cyan-500/10'}`}>{item.type}</span>
                                    <span className="text-[10px] text-slate-400 font-mono">{item.time}</span>
                                 </div>
                                 <Share2 size={12} className="text-slate-600 hover:text-white cursor-pointer transition-colors"/>
                             </div>
                             <h4 className="text-xs font-bold text-slate-200 mb-0.5 pl-2 group-hover:text-white transition-colors">{item.title}</h4>
                             <p className="text-[10px] text-slate-400 leading-relaxed font-light pl-2" dangerouslySetInnerHTML={{__html: item.content.replace(/\*\*(.*?)\*\*/g, '<span class="text-white font-medium">$1</span>')}}></p>
                         </div>
                     ))}
                 </div>
                 <div className="p-2 bg-white/[0.02] border-t border-white/5">
                     <button onClick={handleGenerateReport} className="w-full py-1.5 bg-slate-800 hover:bg-indigo-600 text-slate-400 hover:text-white rounded border border-white/5 text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 group">
                        <FileText size={12}/> 生成详细简报 <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform"/>
                     </button>
                 </div>
              </div>
          </div>

          {/* Bottom Row: Deep Dive */}
          <div className="grid grid-cols-12 gap-3 lg:flex-[45] lg:min-h-0 h-auto shrink-0">
                {/* Regional Heatmap (Span 4) */}
                <div className="col-span-12 md:col-span-4 lg:col-span-4 bg-slate-900/50 border border-white/5 rounded-xl p-4 flex flex-col backdrop-blur-md shadow-2xl h-[300px] lg:h-auto min-h-0">
                    <ChartHeader title="区域销售热力榜" icon={MapPin} color="rose" />
                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2">
                        {cityHeatmapData.map((item, idx) => (
                          <div key={item.city} className="group cursor-pointer">
                              <div className="flex justify-between items-center text-[10px] mb-1 font-mono">
                                  <span className="font-bold text-slate-300 flex items-center gap-2">
                                      <span className={`w-4 h-4 rounded flex items-center justify-center text-[9px] font-sans ${idx < 3 ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'bg-slate-800 text-slate-500'}`}>{idx + 1}</span>
                                      <span className="font-sans tracking-wide text-xs">{item.city}</span>
                                  </span>
                                  <div className="flex flex-col items-end gap-0.5">
                                      <span className="text-slate-200 font-bold">¥{(item.sales/1000).toFixed(1)}k</span>
                                      <span className={`flex items-center gap-0.5 text-[9px] font-mono ${item.growth >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                          {item.growth >= 0 ? <ArrowUpRight size={10}/> : <ArrowDownRight size={10}/>}
                                          {Math.abs(item.growth).toFixed(1)}%
                                      </span>
                                  </div>
                              </div>
                              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden border border-white/5">
                                  <div className={`h-full rounded-full transition-all duration-1000 ${idx === 0 ? 'bg-gradient-to-r from-rose-500 to-orange-500' : idx === 1 ? 'bg-gradient-to-r from-amber-500 to-yellow-500' : 'bg-slate-600'}`} style={{width: `${item.pct}%`}}></div>
                              </div>
                          </div>
                      ))}
                    </div>
                </div>

                {/* BCG Matrix (Span 4) */}
                <div className="col-span-12 md:col-span-8 lg:col-span-4 bg-slate-900/50 border border-white/5 rounded-xl p-4 flex flex-col backdrop-blur-md shadow-2xl h-[300px] lg:h-auto min-h-0 relative">
                    <ChartHeader title="产品波士顿矩阵 (BCG)" icon={Target} color="amber" />
                    <div className="flex-1 min-h-0 relative">
                        {/* Quadrant Backgrounds */}
                        <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-0.5 pointer-events-none opacity-30">
                             <div className="bg-amber-500/10 border-r border-b border-amber-500/30 flex items-start justify-start p-2"><span className="text-[9px] font-bold text-amber-500 uppercase">问题产品 ?</span></div> 
                             <div className="bg-emerald-500/10 border-b border-emerald-500/30 flex items-start justify-end p-2"><span className="text-[9px] font-bold text-emerald-500 uppercase">明星产品 ★</span></div>  
                             <div className="bg-slate-500/10 border-r border-slate-500/30 flex items-end justify-start p-2"><span className="text-[9px] font-bold text-slate-500 uppercase">瘦狗产品 ✖</span></div> 
                             <div className="bg-blue-500/10 flex items-end justify-end p-2"><span className="text-[9px] font-bold text-blue-500 uppercase">金牛产品 $</span></div>   
                        </div>
                        <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart margin={{top: 10, right: 10, bottom: 10, left: 0}}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.2} />
                                <XAxis type="number" dataKey="x" name="Market Share" unit="%" stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} tick={{fontFamily: 'JetBrains Mono'}} domain={[0, 100]} hide/>
                                <YAxis type="number" dataKey="y" name="Growth Rate" unit="%" stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} tick={{fontFamily: 'JetBrains Mono'}} domain={[0, 100]} hide/>
                                <ZAxis type="number" dataKey="z" range={[100, 800]} />
                                <Tooltip cursor={{strokeDasharray: '3 3'}} content={({active, payload}) => { if (active && payload && payload.length) { const d = payload[0].payload; return <div className="bg-slate-950 border border-slate-700 p-3 rounded-lg shadow-xl text-[10px]"><div className="font-bold text-white mb-1 uppercase tracking-wider">{d.name}</div><div className="text-slate-400 font-mono mb-1">{d.type}</div><div className="flex gap-2 font-mono"><span className="text-indigo-400">份额: {d.x.toFixed(0)}%</span><span className="text-emerald-400">增长: {d.y.toFixed(0)}%</span></div></div> } return null; }}/>
                                <Scatter name="Products" data={bcgMatrixData}>
                                    {bcgMatrixData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} stroke="#fff" strokeWidth={1} fillOpacity={0.8} />)}
                                    <LabelList dataKey="name" position="top" offset={8} style={{ fontSize: '10px', fill: '#e2e8f0', fontWeight: 'bold', textShadow: '0 2px 4px rgba(0,0,0,0.8)', fontFamily: 'Inter' }} />
                                </Scatter>
                            </ScatterChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Market Share Treemap (Span 4) */}
                <div className="col-span-12 md:col-span-12 lg:col-span-4 bg-slate-900/50 border border-white/5 rounded-xl p-4 flex flex-col backdrop-blur-md shadow-2xl h-[300px] lg:h-auto min-h-0">
                    <ChartHeader title="全球品类市场份额" icon={Layers} color="cyan" />
                    <div className="flex-1 min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <Treemap data={treemapData} dataKey="size" aspectRatio={4/3} stroke="#020617" content={<CustomTreemapContent />} />
                        </ResponsiveContainer>
                    </div>
                </div>
           </div>
       </div>

       {showFullReport && (
          <div className="fixed inset-0 z-[2000] bg-black/80 flex items-center justify-center backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl w-full max-w-5xl h-[90vh] lg:h-[700px] flex flex-col shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500"></div>
              <div className="flex justify-between mb-6 border-b border-slate-800 pb-4">
                <div>
                    <h3 className="text-white font-bold text-xl tracking-tight">全维度运营数据报表</h3>
                    <p className="text-slate-500 text-xs mt-1 font-mono uppercase">基于实时 IoT 数据湖生成</p>
                </div>
                <button className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors" onClick={()=>setShowFullReport(false)}><X size={20}/></button>
              </div>
              <div className="flex-1 overflow-auto custom-scrollbar bg-slate-950/50 rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs font-mono border-collapse relative min-w-[800px]">
                    <thead className="bg-slate-900 text-slate-400 sticky top-0 z-10 backdrop-blur border-b border-slate-800 shadow-sm">
                        <tr>{['时间戳','城市','饮品类型','数量','营收','水温','延迟'].map(h=><th key={h} className="px-6 py-4 font-bold tracking-wider whitespace-nowrap">{h}</th>)}</tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50 text-slate-300">
                        {filteredData.slice(0, 500).map(r => (
                            <tr key={r.id} className="hover:bg-slate-900/80 transition-colors">
                                <td className="px-6 py-3 text-slate-500">{new Date(r.timestamp).toLocaleString()}</td>
                                <td className="px-6 py-3 text-white font-bold">{CITY_TRANSLATION[r.location.city] || r.location.city}</td>
                                <td className="px-6 py-3"><span className="px-2 py-0.5 rounded border border-slate-700 bg-slate-800 text-[10px] uppercase tracking-wide text-slate-300">{r.beverage}</span></td>
                                <td className="px-6 py-3">{r.quantity}</td>
                                <td className="px-6 py-3 font-bold text-emerald-400">¥{(r.quantity * 4.5).toFixed(1)}</td>
                                <td className={`px-6 py-3 ${r.params.temperature>90?'text-rose-400':'text-slate-300'}`}>{r.params.temperature}°C</td>
                                <td className="px-6 py-3 text-slate-500">{r.telemetry.latency}ms</td>
                            </tr>
                        ))}
                    </tbody>
                  </table>
              </div>
              <div className="flex justify-end gap-3 mt-6 pt-2 border-t border-slate-800">
                <button onClick={()=>setShowFullReport(false)} className="px-6 py-2.5 text-xs font-bold text-slate-400 hover:text-white uppercase tracking-wider">取消</button>
                <button onClick={handleExportCSV} className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 uppercase tracking-wider shadow-lg shadow-indigo-900/20"><Download size={14}/> 下载 CSV</button>
              </div>
            </div>
          </div>
       )}

       {showAIReportModal && (
           <div className="fixed inset-0 z-[3000] bg-black/90 flex items-center justify-center backdrop-blur-md animate-in fade-in p-4">
               <div className="bg-[#0B1120] border border-slate-700 p-0 rounded-2xl w-full max-w-4xl h-[90vh] lg:h-[700px] flex flex-col shadow-2xl animate-in zoom-in-95 overflow-hidden">
                   <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                       <div><h3 className="text-white font-bold text-lg flex items-center gap-2"><BrainCircuit size={20} className="text-indigo-400"/> AI 战略洞察报告</h3></div>
                       <button onClick={()=>setShowAIReportModal(false)} className="p-2 hover:bg-slate-800 rounded-full transition-colors"><X size={18} className="text-slate-400"/></button>
                   </div>
                   <div className="flex-1 bg-slate-950 overflow-auto custom-scrollbar p-8">
                       <div className="prose prose-invert prose-sm max-w-none font-sans text-slate-300 leading-relaxed whitespace-pre-wrap">
                           {aiReportContent}
                       </div>
                   </div>
                   <div className="p-5 border-t border-slate-800 bg-slate-900/50 flex justify-end gap-4">
                       <button onClick={()=>setShowAIReportModal(false)} className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white uppercase tracking-wider transition-colors">关闭</button>
                       <button onClick={handleExportReportFile} className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-wider shadow-lg flex items-center gap-2"><Download size={14}/> 导出报告 (Markdown)</button>
                   </div>
               </div>
           </div>
       )}
    </div>
  );
};

const ContextualKPI = ({ label, value, trend, color, icon: Icon, data, target }: any) => (
    <div className={`bg-gradient-to-br from-slate-900 to-slate-900/50 border border-slate-800 rounded-xl p-4 shadow-lg relative overflow-hidden flex flex-col justify-between group hover:border-${color}-500/30 transition-all duration-500 backdrop-blur-md min-h-[100px]`}>
        {/* Ambient Glow */}
        <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full bg-${color}-500/10 blur-[60px] group-hover:bg-${color}-500/20 transition-all`}></div>
        
        <div className="flex justify-between items-start relative z-10 mb-2">
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-${color}-500/10 border border-${color}-500/20 text-${color}-400 shadow-[0_0_15px_rgba(0,0,0,0.3)]`}>
                    <Icon size={16}/>
                </div>
                <div>
                     <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">{label}</span>
                     <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[10px] font-bold font-mono px-1.5 rounded ${trend.startsWith('+') ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'}`}>{trend}</span>
                     </div>
                </div>
            </div>
        </div>
        
        <div className="flex justify-between items-end relative z-10">
            <div>
                <h3 className="text-2xl font-mono font-bold text-white tracking-tighter leading-none mb-2 drop-shadow-md">{value}</h3>
                <div className="flex items-center gap-2">
                    <div className="w-16 h-1 bg-slate-800 rounded-full overflow-hidden border border-white/5">
                        <div className={`h-full bg-${color}-500 rounded-full shadow-[0_0_8px_currentColor]`} style={{width: `${target}%`}}></div>
                    </div>
                    <span className="text-[9px] text-slate-400 font-mono tracking-tight">{target}% 目标达成</span>
                </div>
            </div>
            
            <div className="h-10 w-24 opacity-60 group-hover:opacity-100 transition-opacity filter drop-shadow-lg">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs><linearGradient id={`grad_${color}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={COLORS[color === 'indigo' ? 'primary' : color === 'emerald' ? 'success' : color === 'cyan' ? 'secondary' : 'warning']} stopOpacity={0.6}/><stop offset="100%" stopColor="transparent" stopOpacity={0}/></linearGradient></defs>
                        <Area type="monotone" dataKey="val" stroke={COLORS[color === 'indigo' ? 'primary' : color === 'emerald' ? 'success' : color === 'cyan' ? 'secondary' : 'warning']} strokeWidth={2} fill={`url(#grad_${color})`} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    </div>
);

// --- Telemetry View (IoT Monitoring - REDESIGNED) ---
const TelemetryView: React.FC<DashboardProps> = ({ stats, data }) => {
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [activeDropdown, setActiveDropdown] = useState(false);
  const [selectedMachineId, setSelectedMachineId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showLogs, setShowLogs] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());

  const fleet = useMemo(() => getFleetStatus(data), [data]);
  
  const filteredFleet = useMemo(() => {
      let filtered = fleet;
      if (selectedCity) filtered = filtered.filter(m => m.city === selectedCity);
      if (filterStatus !== 'all') filtered = filtered.filter(m => filterStatus === 'issue' ? m.errorRate > 0 || m.status !== MachineStatus.ACTIVE : m.status.toLowerCase() === filterStatus);
      if (searchTerm) filtered = filtered.filter(m => m.machineId.toLowerCase().includes(searchTerm.toLowerCase()) || m.address.toLowerCase().includes(searchTerm.toLowerCase()));
      return filtered;
  }, [fleet, selectedCity, filterStatus, searchTerm]);

  const fleetStats = useMemo(() => {
    const total = fleet.length || 1;
    const active = fleet.filter(m => m.status === MachineStatus.ACTIVE).length;
    const maint = fleet.filter(m => m.status === MachineStatus.MAINTENANCE).length;
    const offline = total - active - maint;
    return { 
        total: fleet.length, 
        active, 
        maint, 
        offline, 
        activePct: ((active/total)*100).toFixed(1),
        avgSignal: Math.round(fleet.reduce((acc, c) => acc + c.signalStrength, 0) / total),
        errors: fleet.filter(m => m.errorRate > 0).length
    };
  }, [fleet]);

  const selectedMachine = useMemo(() => fleet.find(m => m.machineId === selectedMachineId), [fleet, selectedMachineId]);

  // Scroll to selected item in list
  useEffect(() => {
    if (selectedMachineId) {
      if (window.innerWidth >= 1024) { // Only auto-scroll list on desktop to avoid hijacking mobile scroll
          setTimeout(() => {
            const element = document.getElementById(`row-${selectedMachineId}`);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }, 100);
      }
      setShowLogs(false);
    }
  }, [selectedMachineId]);

  // Map Initialization & Updates
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (!mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current, { maxBounds: CHINA_BOUNDS, minZoom: 3, maxZoom: 18, attributionControl: false, zoomControl: false }).setView([35.8617, 104.1954], 4);
        // Custom dark tile layer
        L.tileLayer('https://webrd02.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}', { minZoom: 1, maxZoom: 19 }).addTo(map);
        mapInstanceRef.current = map;
        setTimeout(() => map.invalidateSize(), 100);
    }
    const map = mapInstanceRef.current;
    
    // Manage Markers
    const currentIds = new Set(filteredFleet.map(f => f.machineId));
    for (const [id, marker] of markersRef.current) { if (!currentIds.has(id)) { marker.remove(); markersRef.current.delete(id); } }
    
    filteredFleet.forEach(device => {
        let marker = markersRef.current.get(device.machineId);
        const isSelected = selectedMachineId === device.machineId;
        const color = device.status === MachineStatus.ACTIVE ? '#10b981' : device.status === MachineStatus.MAINTENANCE ? '#f59e0b' : '#f43f5e';
        const size = isSelected ? 32 : (selectedCity ? 24 : 12);
        
        // Advanced Marker SVG
        const pinSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="drop-shadow-lg transition-all duration-300" style="overflow:visible; opacity: ${isSelected ? 1 : 0.8}; transform: scale(${isSelected ? 1.2 : 1})">
            ${isSelected ? `<circle cx="12" cy="12" r="12" fill="${color}" fill-opacity="0.2"><animate attributeName="r" from="12" to="20" dur="1.5s" repeatCount="indefinite"/><animate attributeName="opacity" from="0.4" to="0" dur="1.5s" repeatCount="indefinite"/></circle>` : ''}
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="${color}" stroke="#020617" stroke-width="1.5"></path>
            <circle cx="12" cy="9" r="3" fill="#020617"/>
        </svg>`;
        
        const icon = L.divIcon({ className: '', html: pinSvg, iconSize: [size, size], iconAnchor: [size/2, size] });

        // Rich Popup Content
        const popupHtml = `
            <div class="p-3 min-w-[220px] bg-[#0f172a]">
                <div class="flex justify-between items-start mb-2 pb-2 border-b border-slate-700/50">
                    <span class="font-bold text-white text-xs font-mono tracking-tight">${device.machineId}</span>
                    <span class="text-[9px] px-1.5 py-0.5 rounded border font-bold uppercase tracking-wider ${device.status === MachineStatus.ACTIVE ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : device.status === MachineStatus.MAINTENANCE ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}">${device.status}</span>
                </div>
                <div class="space-y-1 mb-3">
                    <div class="text-[10px] text-slate-300 flex items-center gap-1.5"><div class="w-1 h-1 bg-indigo-500 rounded-full"></div>${CITY_TRANSLATION[device.city] || device.city}</div>
                    <div class="text-[10px] text-slate-500 truncate font-mono">${device.address}</div>
                </div>
                <div class="grid grid-cols-3 gap-2 bg-slate-900/50 p-2 rounded border border-slate-800">
                    <div class="flex flex-col">
                        <span class="text-[8px] text-slate-600 uppercase font-bold">Latency</span>
                        <span class="text-[10px] font-mono text-cyan-400">${device.avgLatency}ms</span>
                    </div>
                    <div class="flex flex-col">
                        <span class="text-[8px] text-slate-600 uppercase font-bold">Signal</span>
                        <span class="text-[10px] font-mono text-emerald-400">${device.signalStrength}</span>
                    </div>
                     <div class="flex flex-col">
                        <span class="text-[8px] text-slate-600 uppercase font-bold">Sales</span>
                        <span class="text-[10px] font-mono text-indigo-400">${device.dailyStats.totalSalesQty}</span>
                    </div>
                </div>
            </div>
        `;

        if (!marker) {
            marker = L.marker([device.geo.lat, device.geo.lng], { icon, zIndexOffset: isSelected?1000:0 })
                .bindPopup(popupHtml, { closeButton: false, offset: [0, -15], maxWidth: 240 })
                .addTo(map);
            marker.on('click', () => setSelectedMachineId(device.machineId));
            markersRef.current.set(device.machineId, marker);
        } else { 
            marker.setLatLng([device.geo.lat, device.geo.lng]); 
            marker.setIcon(icon); 
            marker.setZIndexOffset(isSelected?1000:0); 
            marker.setPopupContent(popupHtml);
        }
    });
  }, [filteredFleet, selectedCity, selectedMachineId]);

  // FlyTo Logic & Popup Sync
  useEffect(() => {
     if (selectedMachineId && mapInstanceRef.current && markersRef.current.get(selectedMachineId)) {
         const marker = markersRef.current.get(selectedMachineId)!;
         mapInstanceRef.current.flyTo(marker.getLatLng(), 15, { duration: 0.8, easeLinearity: 0.25 });
         marker.openPopup();
     } else if (mapInstanceRef.current && !selectedMachineId) {
         if (selectedCity && CITY_COORDS[selectedCity]) {
             mapInstanceRef.current.flyTo(CITY_COORDS[selectedCity], 11, { duration: 0.8 });
         } else if (!selectedCity) {
             mapInstanceRef.current.flyTo([35.8617, 104.1954], 4, { duration: 1.0 });
             mapInstanceRef.current.closePopup();
         }
     }
  }, [selectedMachineId, selectedCity]);

  // Simulate Diagnostics Data
  const diagData = useMemo(() => {
     if (!selectedMachineId) return [];
     // Generate fake history
     return Array.from({length: 20}, (_, i) => ({
         time: `-${20-i}s`,
         latency: 20 + Math.random() * 40 + (Math.random() > 0.9 ? 100 : 0),
         cpu: 30 + Math.random() * 40
     }));
  }, [selectedMachineId]);

  const handleDownloadLogs = () => {
    if (!selectedMachineId) return;
    const logContent = Array.from({length: 50}, (_, i) => {
        const timestamp = new Date(Date.now() - (50 - i) * 60000).toISOString();
        const level = Math.random() > 0.95 ? 'ERROR' : Math.random() > 0.8 ? 'WARN' : 'INFO';
        const msg = level === 'ERROR' ? 'Connection timeout at gateway' : 
                    level === 'WARN' ? 'Latency jitter detected (>150ms)' : 'Service heartbeat received';
        return `[${timestamp}] [${level}] ${msg}`;
    }).join('\n');

    const blob = new Blob([logContent], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `logs_${selectedMachineId}_${Date.now()}.log`;
    link.click();
  };

  return (
    <div className="flex flex-col lg:h-full h-auto gap-4 pb-2 text-slate-200">
       {/* 1. IoT KPI Hardware Monitors */}
       <div className="grid grid-cols-2 md:grid-cols-5 gap-3 shrink-0">
          <IoTStatCard label="设备在线率" value={`${fleetStats.activePct}%`} sub={`(${fleetStats.active}/${fleetStats.total})`} icon={Activity} color="emerald" type="bar" percentage={parseFloat(fleetStats.activePct)} />
          <IoTStatCard label="全网平均延迟" value={`${Math.round(stats.avgLatency)}ms`} sub="Real-time" icon={Zap} color="cyan" type="graph" />
          <IoTStatCard label="异常设备数" value={fleetStats.errors} sub="Critical Alerts" icon={AlertTriangle} color={fleetStats.errors > 0 ? "rose" : "slate"} type="alert" />
          <IoTStatCard label="平均信号强度" value={`${fleetStats.avgSignal} dBm`} sub="4G/5G/LoRa" icon={Signal} color="indigo" type="signal" signal={Math.abs(fleetStats.avgSignal)} />
          <IoTStatCard label="CPU 负载峰值" value="78%" sub="Edge Compute" icon={Cpu} color="amber" type="gauge" percentage={78} />
       </div>

       {/* 2. Command Center Grid */}
       <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0 lg:overflow-hidden overflow-visible">
           
           {/* MAP CONSOLE (Span 8) */}
           <div className="lg:col-span-8 flex flex-col gap-0 bg-[#0F172A] border border-slate-800 rounded-xl overflow-hidden relative shadow-2xl group min-h-[450px] lg:min-h-0">
               {/* Map Toolbar Overlay */}
               <div className="absolute top-4 left-4 z-[1000] flex gap-2 items-center">
                    <div className="relative">
                        <button onClick={() => setActiveDropdown(!activeDropdown)} className="flex items-center gap-2 px-3 py-2 bg-slate-900/80 backdrop-blur-md border border-slate-700/50 rounded-lg shadow-xl text-xs font-bold text-slate-200 hover:bg-slate-800 transition-all hover:border-indigo-500/50">
                            <MapPin size={14} className="text-emerald-400"/>
                            {selectedCity ? CITY_TRANSLATION[selectedCity] || selectedCity : "全球视图 (Global)"} 
                            <ChevronDown size={12} className={`transition-transform ${activeDropdown?'rotate-180':''}`}/>
                        </button>
                        {activeDropdown && (
                            <div className="absolute left-0 top-full mt-2 w-48 bg-slate-900/95 border border-slate-700 rounded-lg shadow-2xl overflow-hidden py-1 z-[2001] backdrop-blur-xl animate-in fade-in slide-in-from-top-2">
                                <div className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800">Select Region</div>
                                <div onClick={() => { setSelectedCity(null); setActiveDropdown(false); setSelectedMachineId(null); }} className="px-4 py-2 text-xs text-white hover:bg-indigo-600 cursor-pointer flex items-center justify-between group">
                                    <span>全球视图</span>
                                    {selectedCity === null && <CheckCircle2 size={12} className="text-emerald-400"/>}
                                </div>
                                {Object.keys(CITY_COORDS).map(c => (
                                    <div key={c} onClick={() => { setSelectedCity(c); setActiveDropdown(false); setSelectedMachineId(null); }} className="px-4 py-2 text-xs text-slate-300 hover:bg-indigo-600 hover:text-white cursor-pointer flex items-center justify-between">
                                        <span>{CITY_TRANSLATION[c]}</span>
                                        {selectedCity === c && <CheckCircle2 size={12} className="text-emerald-400"/>}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    {/* Status Filter */}
                    <div className="flex bg-slate-900/80 backdrop-blur-md rounded-lg p-0.5 border border-slate-700/50 shadow-xl">
                        {[{id:'all',l:'All'},{id:'active',l:'Active'},{id:'offline',l:'Offline'},{id:'issue',l:'Issues'}].map(f => (
                            <button key={f.id} onClick={()=>setFilterStatus(f.id)} className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-colors ${filterStatus===f.id ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}>{f.l}</button>
                        ))}
                    </div>
               </div>

               {/* Map Reset Control */}
               <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
                   <button onClick={() => { setSelectedMachineId(null); setSelectedCity(null); }} className="p-2 bg-slate-900/80 backdrop-blur-md border border-slate-700/50 rounded-lg text-slate-300 hover:text-white hover:bg-indigo-600 transition-all shadow-xl" title="Reset View">
                       <LocateFixed size={18}/>
                   </button>
               </div>

               {/* Legend Overlay */}
               <div className="absolute bottom-4 left-4 z-[1000] bg-slate-900/80 backdrop-blur-md border border-slate-700/50 rounded-lg p-2 flex gap-4 shadow-xl text-[10px] font-mono">
                   <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#10b981] shadow-[0_0_5px_#10b981]"></div> Active</div>
                   <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#f59e0b]"></div> Maint</div>
                   <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#f43f5e]"></div> Alert</div>
               </div>

               {/* Map Container */}
               <div id="map" ref={mapContainerRef} className="w-full h-full bg-[#0B1120] z-0"></div>
           </div>

           {/* SIDEBAR INTELLIGENCE PANEL (Span 4) */}
           <div className="lg:col-span-4 flex flex-col gap-4 min-h-0 lg:overflow-y-auto no-scrollbar">
               
               {/* 1. Device Fleet List */}
               <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl flex flex-col shadow-xl overflow-hidden min-h-[180px]">
                   <div className="p-3 border-b border-slate-800 bg-slate-950 flex flex-col gap-2 shrink-0">
                       <div className="flex justify-between items-center">
                           <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2"><Server size={14} className="text-indigo-400"/> 设备列表 (Fleet)</h3>
                           <span className="text-[10px] font-mono text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">{filteredFleet.length} Units</span>
                       </div>
                       <div className="relative">
                           <Search size={12} className="absolute left-2.5 top-2 text-slate-500"/>
                           <input type="text" value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} placeholder="Search ID or Address..." className="w-full bg-slate-900 border border-slate-700 rounded pl-8 pr-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-600 font-mono" />
                       </div>
                   </div>
                   
                   <div className="flex-1 overflow-y-auto custom-scrollbar p-1 space-y-0.5 bg-[#050911]">
                       {filteredFleet.map(m => (
                           <div key={m.machineId} id={`row-${m.machineId}`} onClick={() => {
                               setSelectedMachineId(m.machineId);
                               // On mobile, scroll up to map when selecting from list
                               if (window.innerWidth < 1024 && mapContainerRef.current) {
                                   mapContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
                               }
                           }} className={`p-2 rounded border cursor-pointer transition-all flex items-center justify-between group ${selectedMachineId === m.machineId ? 'bg-indigo-600/20 border-indigo-400 ring-1 ring-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.15)]' : 'bg-transparent border-transparent hover:bg-slate-800 hover:border-slate-700'}`}>
                               <div className="flex items-center gap-3">
                                   <div className={`w-1.5 h-8 rounded-full ${m.status===MachineStatus.ACTIVE?'bg-emerald-500':m.status===MachineStatus.MAINTENANCE?'bg-amber-500':'bg-rose-500'}`}></div>
                                   <div>
                                       <div className={`text-xs font-bold font-mono ${selectedMachineId===m.machineId?'text-white':'text-slate-400 group-hover:text-slate-200'}`}>{m.machineId}</div>
                                       <div className="text-[10px] text-slate-600 truncate max-w-[120px]">{m.address.split('市')[1] || m.address}</div>
                                   </div>
                               </div>
                               <div className="text-right">
                                   <div className={`text-xs font-mono font-bold ${m.avgLatency>100?'text-amber-400':'text-slate-500'}`}>{m.avgLatency}ms</div>
                                   <div className="text-[9px] text-slate-600">{m.iotInterface}</div>
                               </div>
                           </div>
                       ))}
                       {filteredFleet.length === 0 && <div className="p-4 text-center text-xs text-slate-600 italic">No devices found.</div>}
                   </div>
               </div>

               {/* 2. Diagnostic Terminal */}
               <div className="h-[320px] shrink-0 bg-[#020617] border border-slate-800 rounded-xl flex flex-col shadow-2xl relative overflow-hidden">
                   <div className="p-3 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center shrink-0">
                       <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2"><Terminal size={14} className="text-emerald-400"/> 诊断终端 (Diagnostics)</h3>
                       {selectedMachineId && <span className="text-[10px] font-mono text-indigo-400 font-bold px-2 py-0.5 bg-indigo-500/10 rounded border border-indigo-500/20">CONNECTED</span>}
                   </div>

                   {selectedMachine ? (
                       showLogs ? (
                           <div className="flex-1 p-4 flex flex-col gap-3 relative z-10 animate-in fade-in slide-in-from-right-8">
                               <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                                   <div className="text-xs font-bold text-white font-mono flex items-center gap-2"><Terminal size={14} className="text-slate-400"/> System Logs</div>
                                   <button onClick={() => setShowLogs(false)} className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1"><ArrowLeft size={10}/> Back</button>
                               </div>
                               <div className="flex-1 bg-black/40 rounded border border-slate-800 p-2 font-mono text-[10px] text-emerald-500/80 overflow-y-auto custom-scrollbar">
                                   <div className="space-y-1">
                                       {[...Array(8)].map((_, i) => (
                                           <div key={i}><span className="text-slate-600">[{new Date(Date.now() - i*1000*60).toLocaleTimeString()}]</span> <span className="text-slate-300">INFO:</span> Service heartbeat (seq={i+100})</div>
                                       ))}
                                        <div><span className="text-slate-600">[{new Date().toLocaleTimeString()}]</span> <span className="text-amber-400">WARN:</span> Latency jitter &gt; 50ms</div>
                                   </div>
                               </div>
                               <div className="grid grid-cols-2 gap-2 mt-auto shrink-0">
                                   <button onClick={() => setShowLogs(false)} className="py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold rounded uppercase tracking-wider transition-all border border-slate-700">Close</button>
                                   <button onClick={handleDownloadLogs} className="py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold rounded uppercase tracking-wider transition-all shadow-lg shadow-indigo-500/20">Download .LOG</button>
                               </div>
                           </div>
                       ) : (
                           <div className="flex-1 p-4 flex flex-col gap-4 relative z-10 animate-in fade-in slide-in-from-bottom-4">
                               {/* Header Info */}
                               <div className="flex justify-between items-start">
                                   <div>
                                       <div className="text-lg font-bold text-white font-mono tracking-tight">{selectedMachine.machineId}</div>
                                       <div className="text-[10px] text-slate-500 font-mono mt-0.5 flex gap-2">
                                           <span>FW: v2.1.0</span>
                                           <span>IP: 10.0.2.{Math.floor(Math.random()*255)}</span>
                                       </div>
                                   </div>
                                   <div className="text-right">
                                       <div className={`text-sm font-bold ${selectedMachine.status===MachineStatus.ACTIVE?'text-emerald-400':selectedMachine.status===MachineStatus.MAINTENANCE?'text-amber-400':'text-rose-400'}`}>{selectedMachine.status}</div>
                                       <div className="text-[9px] text-slate-500 uppercase tracking-wider">System Status</div>
                                   </div>
                               </div>

                               {/* Real-time Graphs */}
                               <div className="grid grid-cols-2 gap-3 flex-1 min-h-0">
                                   <div className="bg-slate-900/50 border border-slate-800 rounded p-2 flex flex-col relative overflow-hidden">
                                       <div className="text-[9px] text-slate-500 font-bold uppercase mb-1 z-10 relative">Latency (ms)</div>
                                       <div className="absolute top-2 right-2 text-[10px] font-mono text-cyan-400 font-bold z-10">{selectedMachine.avgLatency}</div>
                                       <ResponsiveContainer width="100%" height="100%">
                                           <AreaChart data={diagData}>
                                               <defs><linearGradient id="colorLat" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#06b6d4" stopOpacity={0.4}/><stop offset="100%" stopColor="#06b6d4" stopOpacity={0}/></linearGradient></defs>
                                               <Area type="monotone" dataKey="latency" stroke="#06b6d4" strokeWidth={2} fill="url(#colorLat)" isAnimationActive={false} />
                                           </AreaChart>
                                       </ResponsiveContainer>
                                   </div>
                                   <div className="bg-slate-900/50 border border-slate-800 rounded p-2 flex flex-col relative overflow-hidden">
                                       <div className="text-[9px] text-slate-500 font-bold uppercase mb-1 z-10 relative">CPU Load (%)</div>
                                       <div className="absolute top-2 right-2 text-[10px] font-mono text-amber-400 font-bold z-10">{selectedMachine.cpuLoad}%</div>
                                       <ResponsiveContainer width="100%" height="100%">
                                           <AreaChart data={diagData}>
                                               <defs><linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f59e0b" stopOpacity={0.4}/><stop offset="100%" stopColor="#f59e0b" stopOpacity={0}/></linearGradient></defs>
                                               <Area type="monotone" dataKey="cpu" stroke="#f59e0b" strokeWidth={2} fill="url(#colorCpu)" isAnimationActive={false} />
                                           </AreaChart>
                                       </ResponsiveContainer>
                                   </div>
                               </div>
                               
                               {/* Quick Actions */}
                               <div className="grid grid-cols-2 gap-2 mt-auto shrink-0">
                                   <button className="py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold rounded uppercase tracking-wider transition-all shadow-lg shadow-indigo-500/20">Reboot</button>
                                   <button onClick={() => setShowLogs(true)} className="py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold rounded uppercase tracking-wider transition-all border border-slate-700">Logs</button>
                               </div>
                           </div>
                       )
                   ) : (
                       <div className="flex-1 p-4 flex flex-col items-center justify-center text-slate-600 font-mono text-xs gap-3">
                           <div className="w-12 h-12 rounded-full border border-slate-800 bg-slate-900 flex items-center justify-center animate-pulse"><Signal size={20}/></div>
                           <span>Waiting for device selection...</span>
                           <div className="w-full h-24 overflow-hidden relative opacity-50">
                               <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/10 to-[#020617] z-10"></div>
                               <div className="space-y-1 text-[9px] text-emerald-900/60">
                                   {Array.from({length:10}).map((_,i)=><div key={i}>[SYSTEM] Listening on port 808{i}... OK</div>)}
                               </div>
                           </div>
                       </div>
                   )}
               </div>
           </div>
       </div>
    </div>
  );
};

const IoTStatCard = ({ label, value, sub, icon: Icon, color, type, percentage, signal }: any) => {
    return (
        <div className={`bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-lg relative overflow-hidden group hover:border-${color}-500/30 transition-all min-h-[90px] flex flex-col justify-between`}>
             <div className="flex justify-between items-start mb-1">
                 <div className="flex items-center gap-2">
                     <Icon size={14} className={`text-${color}-400`}/>
                     <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">{label}</span>
                 </div>
                 {type === 'alert' && value > 0 && <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>}
             </div>
             
             <div className="flex justify-between items-end">
                 <div>
                     <div className="text-xl font-mono font-bold text-slate-200 tracking-tighter leading-none">{value}</div>
                     <div className="text-[9px] text-slate-500 mt-1 font-mono">{sub}</div>
                 </div>
                 
                 {/* Visualizations */}
                 {type === 'bar' && (
                     <div className="w-12 h-1 bg-slate-800 rounded-full overflow-hidden flex self-center mt-2">
                         <div className={`h-full bg-${color}-500`} style={{width: `${percentage}%`}}></div>
                     </div>
                 )}
                 {type === 'signal' && (
                     <div className="flex gap-0.5 items-end h-4">
                         {[1,2,3,4].map(i => <div key={i} className={`w-1 rounded-sm ${i <= (signal > 90 ? 1 : signal > 70 ? 2 : signal > 50 ? 3 : 4) ? `bg-${color}-500` : 'bg-slate-800'}`} style={{height: `${i*25}%`}}></div>)}
                     </div>
                 )}
                 {type === 'gauge' && (
                     <div className="relative w-8 h-4 overflow-hidden mt-1">
                         <div className="absolute top-0 left-0 w-8 h-8 rounded-full border-4 border-slate-800"></div>
                         <div className="absolute top-0 left-0 w-8 h-8 rounded-full border-4 border-transparent border-t-amber-500 border-r-amber-500" style={{transform: 'rotate(-45deg)'}}></div>
                     </div>
                 )}
                 {type === 'graph' && (
                     <div className="flex gap-0.5 items-end h-4 opacity-50">
                         {Array.from({length:8}).map((_,i)=><div key={i} className={`w-1 bg-${color}-400 rounded-sm`} style={{height: `${Math.random()*100}%`}}></div>)}
                     </div>
                 )}
             </div>
        </div>
    )
}
