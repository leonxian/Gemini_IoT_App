
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Line, ComposedChart, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ReferenceDot, Treemap, ScatterChart, Scatter, ZAxis, ReferenceLine, ReferenceArea, Label } from 'recharts';
import { AggregatedStats, IoTRecord, MachineFleetStatus, MachineStatus, BeverageType, Gender } from '../types';
import { getFleetStatus } from '../services/dataGenerator';
import { Activity, Wifi, Map as MapIcon, Zap, TrendingUp, Users, Coffee, Cpu, AlertTriangle, Radio, BarChart3, RotateCcw, MonitorSmartphone, ChevronDown, Target, Crown, Calendar, Filter, FileSpreadsheet, Download, X, Layers, Smartphone, Power, CheckCircle2, ArrowRight, Sparkles, AlertCircle, ArrowUpRight, ArrowDownRight, DollarSign, Percent, Loader2, MapPin, BrainCircuit, FileText } from 'lucide-react';
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
    'Guangzhou': [23.1291, 113.2644], 'Chengdu': [30.5728, 104.0668], 'Hangzhou': [30.2741, 120.1551]
};
const CITY_TRANSLATION: Record<string, string> = {
    'Shanghai': '上海', 'Beijing': '北京', 'Shenzhen': '深圳',
    'Guangzhou': '广州', 'Chengdu': '成都', 'Hangzhou': '杭州'
};
const CHINA_BOUNDS: L.LatLngBoundsExpression = [[10, 70], [55, 140]];

export const Dashboard: React.FC<DashboardProps> = ({ stats, data }) => {
  const [viewMode, setViewMode] = useState<'analytics' | 'telemetry'>('analytics');

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-700 overflow-hidden bg-[#020617]">
      {/* Header Controls - Floating HUD Style */}
      <div className="flex justify-between items-center px-6 py-2 shrink-0 z-[2000] relative border-b border-white/5 bg-[#0B1120]/80 backdrop-blur-md">
         <div className="flex gap-1 bg-slate-900 p-1 rounded-lg border border-slate-700/50 shadow-inner">
            {['analytics', 'telemetry'].map((mode) => (
                <button 
                   key={mode}
                   onClick={() => setViewMode(mode as any)}
                   className={`px-6 py-1.5 rounded-md text-[11px] font-bold transition-all flex items-center gap-2 tracking-wide uppercase ${
                      viewMode === mode ? (mode === 'analytics' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20') : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                   }`}
                >
                   {mode === 'analytics' ? <BarChart3 size={14}/> : <Activity size={14}/>}
                   {mode === 'analytics' ? '商业智能分析 (BI)' : 'IoT 实时监控中心'}
                </button>
            ))}
         </div>
         <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/50 rounded-full border border-slate-800/50">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-[pulse_2s_infinite] shadow-[0_0_10px_#10b981]"></div>
                <span className="text-[10px] font-mono text-emerald-400 tracking-wider">SYSTEM ONLINE</span>
            </div>
         </div>
      </div>
      
      <div className="flex-1 min-h-0 relative p-4">
        {viewMode === 'analytics' ? <AnalyticsView stats={stats} data={data} /> : <div className="h-full overflow-y-auto pr-1 pb-2 custom-scrollbar"><TelemetryView stats={stats} data={data} /></div>}
      </div>
    </div>
  );
};

const AnalyticsView: React.FC<DashboardProps> = ({ stats, data }) => {
  const [showFullReport, setShowFullReport] = useState(false);
  const [timeRange, setTimeRange] = useState<'Day'|'Week'|'Month'>('Month');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

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

  // --- Dynamic Data for Charts ---
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

  // KPI Calculation
  const kpiStats = useMemo(() => {
      const totalRev = filteredData.reduce((acc, r) => acc + (r.quantity * 4.5 * 10), 0);
      const totalBrews = filteredData.length;
      const dau = new Set(filteredData.map(d => d.userId)).size;
      const arpu = dau > 0 ? totalRev / dau : 0;
      
      const seedVal = timeRange === 'Day' ? 10 : timeRange === 'Week' ? 50 : 100;
      const sparklineData = Array.from({length: 10}, (_, i) => ({ val: Math.sin((i + seedVal) * 0.5) * 50 + 50 + (Math.random() * 20) }));
      
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
      const sales: Record<string, number> = {};
      filteredData.forEach(r => sales[r.beverage] = (sales[r.beverage] || 0) + 1);
      
      const products = [BeverageType.ESPRESSO, BeverageType.LUNGO, BeverageType.LATTE_MACCHIATO, 'Seasonal', 'Cold Brew'];
      return products.map(p => {
          const val = sales[p as string] || 0;
          const share = Math.min(95, Math.max(5, (val / filteredData.length) * 100));
          const growth = Math.random() * 100;
          let type = '';
          if (share > 50 && growth > 50) type = 'Star';
          else if (share > 50) type = 'Cash Cow';
          else if (growth > 50) type = 'Question';
          else type = 'Dog';
          
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
          { title: "营收激增", type: "机遇", color: "emerald", content: `${scope}营收超出目标 **12%**，主要由上海地区 **燕麦拿铁** 销量驱动。`, time: "2分钟前" },
          { title: "库存预警", type: "风险", color: "amber", content: `**绿茶** 在深圳仓库存严重不足 (< 3天)，需关注${scope}补货计划。`, time: "15分钟前" },
          { title: "流失风险", type: "警告", color: "rose", content: `${scope}下午4-6点时段用户留存率环比下降 **5%**。`, time: "1小时前" },
          { title: "气象影响", type: "预测", color: "cyan", content: "预计下个周期热饮需求将提升 **+15%**。", time: "2小时前" },
          { title: "新品反馈", type: "洞察", color: "indigo", content: "用户对**冷萃咖啡**的复购率本周提升 **8%**。", time: "3小时前" },
          { title: "设备健康", type: "监控", color: "slate", content: "全网设备平均无故障运行时间 (MTBF) 达到历史新高。", time: "4小时前" }
      ];
  }, [timeRange]);

  const handleGenerateReport = () => {
      setIsGeneratingReport(true);
      setTimeout(() => setIsGeneratingReport(false), 2000);
  };

  const handleExportCSV = () => {
      const headers = ['Timestamp,City,Beverage,Quantity,Revenue,Temperature,Latency'];
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
        <rect x={x} y={y} width={width} height={height} style={{ fill: props.fill, stroke: '#020617', strokeWidth: 3, opacity: 0.9 }} />
        {width > 50 && height > 35 && (
          <>
            <text x={x + 6} y={y + 16} fill="#fff" fontSize={11} fontWeight="bold" textAnchor="start" style={{textTransform:'uppercase'}}>{name ? name.split(' ')[0] : ''}</text>
            <text x={x + 6} y={y + 30} fill="rgba(255,255,255,0.7)" fontSize={10} textAnchor="start" fontFamily="JetBrains Mono">{(size || 0).toLocaleString()}</text>
          </>
        )}
      </g>
    );
  };

  return (
    <div className="flex h-full gap-4">
       {/* 1. LEFT SIDEBAR: INTELLIGENCE & CONTROL HUB (18%) */}
       <div className="w-[18%] flex flex-col gap-3 min-h-0">
           {/* Control Panel */}
           <div className="bg-slate-900/60 border border-white/5 rounded-xl p-3 flex flex-col justify-between backdrop-blur-md relative overflow-hidden group shrink-0">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="flex justify-between items-center relative z-10 mb-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2"><Filter size={12} className="text-indigo-400"/> 时间维度</span>
                    <button onClick={() => setShowFullReport(true)} className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors"><Download size={12}/></button>
                </div>
                <div className="flex bg-slate-950/80 p-0.5 rounded-lg border border-white/5 relative z-10">
                    {['Day', 'Week', 'Month'].map(r => (
                        <button key={r} onClick={()=>setTimeRange(r as any)} className={`flex-1 py-1.5 text-[10px] font-bold rounded transition-all font-mono uppercase tracking-wider ${timeRange===r?'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20':'text-slate-500 hover:text-slate-200'}`}>
                            {r === 'Day' ? '今日' : r === 'Week' ? '本周' : '本月'}
                        </button>
                    ))}
                </div>
           </div>

           {/* AI Executive Feed (Full Height) */}
           <div className="flex-1 bg-slate-900/60 border border-white/5 rounded-xl flex flex-col relative overflow-hidden backdrop-blur-md min-h-0 shadow-lg">
                <div className="p-3 border-b border-white/5 flex items-center justify-between shrink-0 bg-slate-900/80">
                    <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest flex items-center gap-2"><Sparkles size={12}/> AI 经营简报</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-0 bg-gradient-to-b from-slate-900/0 to-slate-900/50">
                        <div className="absolute left-4 top-0 bottom-0 w-px bg-slate-800 border-l border-dashed border-slate-700/50"></div>
                        {aiBriefings.map((item, i) => (
                            <div key={i} className="p-4 pl-8 border-b border-white/5 hover:bg-white/[0.02] transition-colors relative group">
                                <div className={`absolute left-[13px] top-5 w-2 h-2 rounded-full border-2 border-slate-900 z-10 ${item.color==='emerald'?'bg-emerald-500':item.color==='amber'?'bg-amber-500':item.color==='rose'?'bg-rose-500':'bg-cyan-500'}`}></div>
                                <div className="flex justify-between items-baseline mb-1">
                                    <span className={`text-[9px] font-bold uppercase tracking-wider text-${item.color}-400`}>{item.type}</span>
                                    <span className="text-[9px] text-slate-600 font-mono">{item.time}</span>
                                </div>
                                <h4 className="text-xs font-bold text-slate-200 mb-1">{item.title}</h4>
                                <p className="text-[10px] text-slate-400 leading-relaxed font-light" dangerouslySetInnerHTML={{__html: item.content.replace(/\*\*(.*?)\*\*/g, '<span class="text-indigo-300 font-bold">$1</span>')}}></p>
                            </div>
                        ))}
                </div>
                <div className="p-3 border-t border-white/5 bg-slate-900/80 shrink-0">
                    <button onClick={handleGenerateReport} disabled={isGeneratingReport} className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[10px] font-bold uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 transition-all border border-indigo-400/20">
                        {isGeneratingReport ? <Loader2 size={12} className="animate-spin"/> : <FileText size={12}/>}
                        {isGeneratingReport ? 'ANALYZING...' : '生成分析报告'}
                    </button>
                </div>
           </div>
       </div>

       {/* 2. RIGHT WORKSPACE: VISUALIZATION GRID (82%) */}
       <div className="flex-1 flex flex-col gap-3 min-h-0">
           {/* TOP ROW: KPIs (12%) */}
           <div className="flex-[0_0_auto] h-[90px] grid grid-cols-4 gap-3">
               {[
                  { l: `总营收 (GMV)`, v: `¥${kpiStats.totalRev.toLocaleString()}`, t: "+24.5%", c: "indigo", i: DollarSign, data: kpiStats.sparklineData, target: 85 },
                  { l: "总冲泡 (Total Brews)", v: kpiStats.totalBrews.toLocaleString(), t: "+8.3%", c: "amber", i: Coffee, data: kpiStats.sparklineData.map(d=>({val:d.val*0.8})), target: 62 }, 
                  { l: "活跃用户 (DAU)", v: kpiStats.dau.toLocaleString(), t: "+12.8%", c: "emerald", i: Users, data: kpiStats.sparklineData.map(d=>({val:d.val*0.5})), target: 94 },
                  { l: "客单价 (ARPU)", v: `¥${kpiStats.arpu.toFixed(1)}`, t: "+5.2%", c: "cyan", i: Target, data: kpiStats.sparklineData.map(d=>({val:d.val*1.2})), target: 78 },
               ].map((k, idx) => (
                  <div key={idx} className="bg-slate-900/60 border border-white/5 rounded-xl p-3 shadow-sm relative overflow-hidden flex flex-col justify-between group hover:border-white/10 transition-all backdrop-blur-md">
                      <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full bg-${k.c}-500/5 blur-2xl group-hover:bg-${k.c}-500/10 transition-all`}></div>
                      <div className="flex justify-between items-start relative z-10">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest truncate max-w-[80%]">{k.l}</span>
                          <span className={`text-[9px] font-bold font-mono px-1.5 rounded-full ${k.t.startsWith('+') ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'}`}>{k.t}</span>
                      </div>
                      <div className="flex justify-between items-end mt-1">
                          <div>
                              <h3 className="text-2xl font-mono font-bold text-slate-100 tracking-tighter leading-none mb-1">{k.v}</h3>
                              <div className="flex items-center gap-1.5 opacity-60">
                                  <div className="w-12 h-1 bg-slate-800 rounded-full overflow-hidden">
                                      <div className={`h-full bg-${k.c}-500 rounded-full`} style={{width: `${k.target}%`}}></div>
                                  </div>
                                  <span className="text-[8px] text-slate-500 font-mono">{k.target}% Target</span>
                              </div>
                          </div>
                          <div className="h-8 w-16 opacity-50 grayscale group-hover:grayscale-0 transition-all">
                              <ResponsiveContainer width="100%" height="100%">
                                  <AreaChart data={k.data}>
                                      <defs><linearGradient id={`grad${idx}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={COLORS[k.c === 'indigo' ? 'primary' : k.c === 'emerald' ? 'success' : k.c === 'cyan' ? 'secondary' : 'warning']} stopOpacity={0.4}/><stop offset="100%" stopColor="transparent" stopOpacity={0}/></linearGradient></defs>
                                      <Area type="monotone" dataKey="val" stroke={COLORS[k.c === 'indigo' ? 'primary' : k.c === 'emerald' ? 'success' : k.c === 'cyan' ? 'secondary' : 'warning']} strokeWidth={1.5} fill={`url(#grad${idx})`} />
                                  </AreaChart>
                              </ResponsiveContainer>
                          </div>
                      </div>
                  </div>
               ))}
           </div>

           {/* MIDDLE ROW: Revenue Trend (48%) */}
           <div className="flex-[5] min-h-0 bg-slate-900/60 border border-white/5 rounded-xl p-0 flex flex-col backdrop-blur-md relative overflow-hidden group shadow-lg">
                <div className="p-3 border-b border-white/5 flex justify-between items-center bg-slate-900/50">
                     <div className="flex items-center gap-3">
                         <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2"><BarChart3 size={12}/> 营收趋势与 AI 预测</span>
                     </div>
                     <div className="flex items-center gap-3 text-[9px] font-mono text-slate-500">
                        <span className="flex items-center gap-1.5"><div className="w-2 h-2 bg-indigo-500 rounded-[1px]"></div>实际值 (ACTUAL)</span>
                        <span className="flex items-center gap-1.5"><div className="w-2 h-2 border border-indigo-400/50 border-dashed bg-indigo-500/10 rounded-[1px]"></div>预测值 (FORECAST)</span>
                        <span className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-emerald-400 rounded-full"></div>环比增长 (GROWTH)</span>
                     </div>
                </div>
                <div className="flex-1 min-h-0 w-full p-2 relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={revenueData} margin={{top:10,right:10,left:-20,bottom:0}}>
                            <defs>
                                <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6366f1" stopOpacity={0.8}/><stop offset="100%" stopColor="#6366f1" stopOpacity={0.05}/></linearGradient>
                                <pattern id="stripe" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="3" height="6" transform="translate(0,0)" fill="#6366f1" fillOpacity="0.3"></rect></pattern>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} opacity={0.5}/>
                            <XAxis dataKey="label" stroke="#475569" fontSize={9} tickLine={false} axisLine={false} dy={5} tick={{fontFamily: 'JetBrains Mono'}}/>
                            <YAxis yAxisId="left" stroke="#475569" fontSize={9} tickLine={false} axisLine={false} tickFormatter={(v)=>`¥${v/1000}k`} tick={{fontFamily: 'JetBrains Mono'}}/>
                            <YAxis yAxisId="right" orientation="right" stroke="#475569" fontSize={9} tickLine={false} axisLine={false} tickFormatter={(v)=>`${v}%`} tick={{fontFamily: 'JetBrains Mono'}}/>
                            <Tooltip contentStyle={{backgroundColor:'#020617', borderColor:'#334155', borderRadius:'4px', padding:'8px'}} itemStyle={{fontSize:'10px', fontFamily:'JetBrains Mono', padding:0}} labelStyle={{color:'#94a3b8', fontSize:'9px', marginBottom:'4px', textTransform:'uppercase'}} formatter={(value:any, name:string) => { if (name.includes('Growth')) return [`${value.toFixed(1)}%`, name.replace('MoM Growth (', '').replace(')', '')]; if (name === 'predicted') return [`¥${Math.round(value).toLocaleString()}`, 'AI 预测']; return [`¥${Math.round(value).toLocaleString()}`, '实际营收']; }} cursor={{ fill: '#ffffff03' }} />
                            <Bar yAxisId="left" dataKey="revenue" fill="url(#revenueFill)" barSize={24} radius={[2,2,0,0]} name="Actual"/>
                            <Bar yAxisId="left" dataKey="predicted" fill="url(#stripe)" stroke="#6366f1" strokeWidth={1} strokeDasharray="2 2" barSize={24} radius={[2,2,0,0]} name="predicted"/>
                            <Line yAxisId="right" type="monotone" dataKey="growthActual" stroke="#34d399" strokeWidth={2} dot={{r:2, fill:'#020617', stroke:'#34d399', strokeWidth:1.5}} name="MoM Growth (Act)"/>
                            <Line yAxisId="right" type="monotone" dataKey="growthPredicted" stroke="#34d399" strokeWidth={2} strokeDasharray="3 3" dot={false} name="MoM Growth (Fcst)"/>
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
           </div>

           {/* BOTTOM ROW: Charts Grid (40%) - Heatmap | BCG | Treemap */}
           <div className="flex-[4] min-h-0 grid grid-cols-12 gap-3">
                
                {/* 1. Heatmap (Width 4/12) */}
                <div className="col-span-12 xl:col-span-4 bg-slate-900/60 border border-white/5 rounded-xl p-0 flex flex-col backdrop-blur-md min-h-0 shadow-lg">
                    <div className="p-2 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2"><MapPin size={10} className="text-rose-400"/> 区域热力</span>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2.5">
                        {cityHeatmapData.map((item, idx) => (
                        <div key={item.city} className="group">
                            <div className="flex justify-between items-center text-[9px] mb-0.5 font-mono">
                                <span className="font-bold text-slate-300 flex items-center gap-2"><span className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[8px] ${idx < 3 ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-500'}`}>{idx + 1}</span><span className="font-sans tracking-wide">{item.city}</span></span>
                                <div className="flex items-center gap-2"><span className="text-slate-400">¥{item.sales.toLocaleString()}</span><span className={`${item.growth>0 ? 'text-emerald-400' : 'text-rose-400'}`}>{item.growth > 0 ? '▲' : '▼'} {Math.abs(item.growth).toFixed(0)}%</span></div>
                            </div>
                            <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden"><div className={`h-full rounded-full ${idx === 0 ? 'bg-rose-500' : idx === 1 ? 'bg-amber-500' : 'bg-slate-600'}`} style={{width: `${item.pct}%`}}></div></div>
                        </div>
                    ))}
                    </div>
                </div>

                {/* 2. BCG Matrix (Width 4/12) */}
                <div className="col-span-12 xl:col-span-4 bg-slate-900/60 border border-white/5 rounded-xl p-0 flex flex-col backdrop-blur-md min-h-0 relative overflow-hidden shadow-lg">
                    <div className="p-2 border-b border-white/5 flex justify-between items-center bg-white/[0.01] relative z-10">
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2"><Target size={10} className="text-amber-400"/> 产品波士顿矩阵 (BCG)</span>
                    </div>
                    <div className="flex-1 min-h-0 relative">
                        {/* Background Quadrants */}
                        <div className="absolute inset-2 grid grid-cols-2 grid-rows-2 gap-px pointer-events-none opacity-20">
                            <div className="bg-amber-500/20"></div> <div className="bg-blue-500/20"></div>  
                            <div className="bg-slate-500/20"></div> <div className="bg-emerald-500/20"></div>   
                        </div>
                        <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart margin={{top: 20, right: 20, bottom: 20, left: 0}}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.3} />
                                <XAxis type="number" dataKey="x" name="Market Share" unit="%" stroke="#475569" fontSize={8} tickLine={false} axisLine={false} tick={{fontFamily: 'JetBrains Mono'}} domain={[0, 100]}/>
                                <YAxis type="number" dataKey="y" name="Growth Rate" unit="%" stroke="#475569" fontSize={8} tickLine={false} axisLine={false} tick={{fontFamily: 'JetBrains Mono'}} domain={[0, 100]}/>
                                <ZAxis type="number" dataKey="z" range={[30, 300]} />
                                <Tooltip cursor={{strokeDasharray: '3 3'}} content={({active, payload}) => { if (active && payload && payload.length) { const d = payload[0].payload; return <div className="bg-slate-950 border border-slate-700 p-1.5 rounded text-[9px]"><div className="font-bold text-white">{d.name}</div><div className="text-slate-400">{d.type}</div></div> } return null; }}/>
                                <ReferenceLine x={50} stroke="#334155" strokeDasharray="3 3" />
                                <ReferenceLine y={50} stroke="#334155" strokeDasharray="3 3" />
                                <ReferenceArea x1={50} x2={100} y1={50} y2={100} strokeOpacity={0} fillOpacity={0}><Label value="明星 (Star)" position="insideTopRight" fill="#eab308" fontSize={10} fontWeight="bold" opacity={0.5}/></ReferenceArea>
                                <ReferenceArea x1={0} x2={50} y1={50} y2={100} strokeOpacity={0} fillOpacity={0}><Label value="问题 (Question)" position="insideTopLeft" fill="#3b82f6" fontSize={10} fontWeight="bold" opacity={0.5}/></ReferenceArea>
                                <ReferenceArea x1={50} x2={100} y1={0} y2={50} strokeOpacity={0} fillOpacity={0}><Label value="金牛 (Cow)" position="insideBottomRight" fill="#10b981" fontSize={10} fontWeight="bold" opacity={0.5}/></ReferenceArea>
                                <ReferenceArea x1={0} x2={50} y1={0} y2={50} strokeOpacity={0} fillOpacity={0}><Label value="瘦狗 (Dog)" position="insideBottomLeft" fill="#64748b" fontSize={10} fontWeight="bold" opacity={0.5}/></ReferenceArea>
                                <Scatter name="Products" data={bcgMatrixData}>{bcgMatrixData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} stroke="#fff" strokeWidth={1} />)}</Scatter>
                            </ScatterChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 3. Treemap (Width 4/12) */}
                <div className="col-span-12 xl:col-span-4 bg-slate-900/60 border border-white/5 rounded-xl p-0 flex flex-col backdrop-blur-md min-h-0 shadow-lg">
                    <div className="p-2 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2"><Layers size={10} className="text-cyan-400"/> 全球市场份额分布</span>
                    </div>
                    <div className="flex-1 min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <Treemap data={treemapData} dataKey="size" aspectRatio={4/3} stroke="#020617" content={<CustomTreemapContent />} />
                        </ResponsiveContainer>
                    </div>
                </div>

           </div>
       </div>

       {showFullReport && (
          <div className="fixed inset-0 z-[3000] bg-black/90 flex items-center justify-center backdrop-blur-md animate-in fade-in">
              <div className="bg-[#0B1120] border border-slate-700 p-0 rounded-2xl w-[900px] h-[600px] flex flex-col shadow-2xl animate-in zoom-in-95 overflow-hidden">
                  <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                      <div><h3 className="text-white font-bold text-base flex items-center gap-2"><FileSpreadsheet size={16} className="text-emerald-400"/> 完整分析报表</h3></div>
                      <button onClick={()=>setShowFullReport(false)} className="p-1 hover:bg-slate-800 rounded-full transition-colors"><X size={16} className="text-slate-400"/></button>
                  </div>
                  <div className="flex-1 bg-slate-950 overflow-auto custom-scrollbar">
                      <table className="w-full text-left text-xs font-mono border-collapse relative">
                        <thead className="bg-slate-900/90 text-slate-400 sticky top-0 z-10 backdrop-blur border-b border-slate-800">
                            <tr>{['TIMESTAMP','CITY','BEVERAGE','QTY','REVENUE','TEMP','LATENCY'].map(h=><th key={h} className="px-4 py-3 font-semibold whitespace-nowrap">{h}</th>)}</tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50 text-slate-300">
                            {filteredData.length === 0 && (
                                <tr><td colSpan={7} className="text-center py-10 text-slate-500">当前时间范围内暂无数据。请尝试切换时间维度或等待实时数据流入。</td></tr>
                            )}
                            {filteredData.slice(0, 500).map(r => (
                                <tr key={r.id} className="hover:bg-slate-900/50">
                                    <td className="px-4 py-2 text-slate-500">{new Date(r.timestamp).toLocaleString()}</td>
                                    <td className="px-4 py-2 text-white">{CITY_TRANSLATION[r.location.city] || r.location.city}</td>
                                    <td className="px-4 py-2"><span className="px-1.5 py-0.5 rounded border border-slate-700 bg-slate-800/50 text-[10px]">{r.beverage}</span></td>
                                    <td className="px-4 py-2">{r.quantity}</td>
                                    <td className="px-4 py-2 font-bold text-emerald-400">¥{(r.quantity * 4.5).toFixed(1)}</td>
                                    <td className={`px-4 py-2 ${r.params.temperature>90?'text-rose-400':'text-slate-300'}`}>{r.params.temperature}°C</td>
                                    <td className="px-4 py-2 text-slate-500">{r.telemetry.latency}ms</td>
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

const TelemetryView: React.FC<DashboardProps> = ({ stats, data }) => {
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [activeDropdown, setActiveDropdown] = useState(false);
  const [selectedMachineId, setSelectedMachineId] = useState<string | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());

  const fleet = useMemo(() => getFleetStatus(data), [data]);
  const visibleFleet = useMemo(() => selectedCity ? fleet.filter(m => m.city === selectedCity) : fleet, [fleet, selectedCity]);
  const fleetStats = useMemo(() => {
    const total = visibleFleet.length || 1;
    const active = visibleFleet.filter(m => m.status === MachineStatus.ACTIVE).length;
    const maint = visibleFleet.filter(m => m.status === MachineStatus.MAINTENANCE).length;
    return { total: visibleFleet.length, active, maint, offline: visibleFleet.length - active - maint, activePct: ((active/total)*100).toFixed(1), maintPct: ((maint/total)*100).toFixed(1) };
  }, [visibleFleet]);

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (!mapInstanceRef.current) {
        // Init Map with AutoNavi (GaoDe) Tiles for Chinese localization
        const map = L.map(mapContainerRef.current, { maxBounds: CHINA_BOUNDS, minZoom: 3, maxZoom: 18, attributionControl: false, zoomControl: false }).setView([35.8617, 104.1954], 4);
        L.control.zoom({ position: 'topright' }).addTo(map);
        // Switch to AutoNavi (High contrast style for visibility)
        L.tileLayer('https://webrd02.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}', { minZoom: 1, maxZoom: 19 }).addTo(map);
        mapInstanceRef.current = map;
        setTimeout(() => map.invalidateSize(), 100);
    }
    const map = mapInstanceRef.current;
    
    // Manage Markers (Diffing)
    const currentIds = new Set(visibleFleet.map(f => f.machineId));
    for (const [id, marker] of markersRef.current) { if (!currentIds.has(id)) { marker.remove(); markersRef.current.delete(id); } }
    
    visibleFleet.forEach(device => {
        let marker = markersRef.current.get(device.machineId);
        const isSelected = selectedMachineId === device.machineId;
        const color = device.status === MachineStatus.ACTIVE ? '#10b981' : device.status === MachineStatus.MAINTENANCE ? '#f59e0b' : '#f43f5e';
        const size = isSelected ? 38 : (selectedCity ? 28 : 14);
        
        // Google Maps Style Pin SVG
        const pinSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="drop-shadow-lg transition-transform duration-300 ${isSelected?'scale-110 z-[1000]':''}" style="overflow:visible;">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="${color}" stroke="#fff" stroke-width="1.5"></path>
            <circle cx="12" cy="9" r="3" fill="#0f172a"/>
        </svg>`;
        
        const icon = L.divIcon({ className: '', html: pinSvg, iconSize: [size, size], iconAnchor: [size/2, size], popupAnchor: [0, -size] });

        if (!marker) {
            marker = L.marker([device.geo.lat, device.geo.lng], { icon, zIndexOffset: isSelected?1000:0 }).addTo(map);
            const popupContent = `
                <div class="font-sans text-xs min-w-[150px] bg-slate-900 text-slate-200 p-2 rounded shadow-xl border border-slate-700">
                    <div class="flex justify-between items-center mb-1 pb-1 border-b border-slate-700">
                        <span class="font-bold text-indigo-400">${device.machineId}</span>
                        <span class="${device.status===MachineStatus.ACTIVE?'text-emerald-500':'text-rose-500'} font-bold text-[9px] uppercase px-1 border border-current rounded">${device.status}</span>
                    </div>
                    <div class="text-slate-400 space-y-0.5 mt-1">
                        <div class="font-medium text-white truncate">${device.address}</div>
                        <div class="flex justify-between"><span>Signal:</span> <span class="text-white">${device.signalStrength} dBm</span></div>
                        <div class="flex justify-between"><span>Sales:</span> <span class="text-white">¥${device.dailyStats.totalRevenue}</span></div>
                    </div>
                </div>`;
            marker.bindPopup(popupContent, { closeButton: false, className: 'custom-popup' });
            marker.on('click', () => setSelectedMachineId(device.machineId));
            markersRef.current.set(device.machineId, marker);
        } else { 
            marker.setLatLng([device.geo.lat, device.geo.lng]); 
            marker.setIcon(icon); 
            marker.setZIndexOffset(isSelected?1000:0); 
        }
        if (isSelected && !marker.isPopupOpen()) marker.openPopup();
    });
  }, [visibleFleet, selectedCity, selectedMachineId]);

  // FlyTo Logic
  useEffect(() => {
     if (selectedMachineId && mapInstanceRef.current && markersRef.current.get(selectedMachineId)) {
         const marker = markersRef.current.get(selectedMachineId)!;
         mapInstanceRef.current.flyTo(marker.getLatLng(), 16, { duration: 1.2 });
         document.getElementById(`row-${selectedMachineId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
     } else if (mapInstanceRef.current && !selectedMachineId) {
         mapInstanceRef.current.flyTo(selectedCity ? CITY_COORDS[selectedCity] : [35.8617, 104.1954], selectedCity ? 11 : 4, { duration: 1.2 });
     }
  }, [selectedMachineId, selectedCity]);

  return (
    <div className="flex flex-col h-full gap-4 pb-2">
       {/* Telemetry Stats Bar */}
       <div className="grid grid-cols-1 md:grid-cols-5 gap-4 shrink-0 h-[80px]">
          <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl shadow-sm border-l-4 border-l-indigo-500 flex flex-col justify-center">
             <div className="flex justify-between items-center mb-1"><span className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">在线状态</span><span className="text-lg font-bold text-slate-200 font-mono">{fleetStats.total} <span className="text-xs text-slate-500 font-sans font-normal">台</span></span></div>
             <div className="flex h-1.5 w-full rounded-full overflow-hidden bg-slate-800 mb-1"><div style={{width: `${fleetStats.activePct}%`}} className="bg-emerald-500"></div><div style={{width: `${fleetStats.maintPct}%`}} className="bg-amber-500"></div><div className="bg-red-500 flex-1"></div></div>
             <div className="flex justify-between text-[9px] text-slate-400 font-mono uppercase"><span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>{fleetStats.activePct}%</span><span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>{fleetStats.maintPct}%</span></div>
          </div>
          <StatusWidgetCompact label="平均延迟" value={`${Math.round(stats.avgLatency)}ms`} icon={<Activity size={14} className="text-cyan-400"/>} color="cyan" />
          <StatusWidgetCompact label="数据错误率" value={`${(stats.errorRate * 100).toFixed(2)}%`} icon={<AlertTriangle size={14} className="text-rose-400"/>} color="rose" />
          <StatusWidgetCompact label="信号强度" value="-42dBm" icon={<Radio size={14} className="text-emerald-400"/>} color="emerald" />
          <StatusWidgetCompact label="CPU 负载" value="42%" icon={<Cpu size={14} className="text-amber-400"/>} color="amber" />
       </div>

       {/* Map & List Split View (Fixed Viewport) */}
       <div className="flex-1 flex flex-col gap-3 min-h-0 overflow-hidden">
           {/* Map Container - Top 45% */}
           <div className="flex-none h-[45%] bg-slate-100 rounded-xl shadow-lg relative overflow-hidden group z-0 border border-slate-300">
                 <div className="absolute top-4 left-4 z-[2000] flex gap-2">
                    <div className="relative">
                        <button onClick={() => setActiveDropdown(!activeDropdown)} className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/90 backdrop-blur border border-slate-700 rounded-lg shadow-xl text-xs text-slate-200 hover:bg-slate-700 font-medium transition-colors"><MapIcon size={14} className="text-emerald-400"/>{selectedCity || "全球视图"} <ChevronDown size={12} /></button>
                        {activeDropdown && <div className="absolute left-0 top-full mt-2 w-40 bg-slate-800/95 border border-slate-700 rounded-lg shadow-2xl overflow-hidden py-1 z-[2001] backdrop-blur">{[null, ...Object.keys(CITY_COORDS)].map(c => <div key={c||'all'} className="px-4 py-2 text-xs text-slate-300 hover:bg-slate-700 cursor-pointer" onClick={() => { setSelectedCity(c as any); setActiveDropdown(false); setSelectedMachineId(null); }}>{c || "全球视图"}</div>)}</div>}
                    </div>
                    {selectedMachineId && <button onClick={() => setSelectedMachineId(null)} className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg shadow-xl text-xs flex items-center gap-1 hover:bg-indigo-500"><RotateCcw size={12} /> 重置视角</button>}
                 </div>
                 <div id="map" ref={mapContainerRef} className="w-full h-full"></div>
           </div>

           {/* List Container - Bottom Rest */}
           <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl flex flex-col overflow-hidden shadow-lg min-h-0">
                 <div className="p-2 border-b border-slate-800 bg-slate-900/90 backdrop-blur flex justify-between items-center shrink-0"><h3 className="text-slate-100 font-semibold flex items-center gap-2 text-sm"><MonitorSmartphone size={16} className="text-cyan-400"/> 设备运行监控列表</h3><div className="text-xs text-slate-500 font-mono tracking-tight">Viewing {visibleFleet.length} Devices</div></div>
                 <div className="flex-1 overflow-auto bg-[#050911] custom-scrollbar">
                    <table className="w-full text-left text-[11px] font-mono border-collapse relative">
                       <thead className="bg-slate-800/90 text-slate-400 sticky top-0 z-10 backdrop-blur-md shadow-sm">
                          <tr>{['机器编号','地理位置','状态','当日销售','IoT 接口','信号','延迟','错误率','负载',''].map(h=><th key={h} className="px-4 py-2 font-semibold border-b border-slate-700 text-slate-400 whitespace-nowrap">{h}</th>)}</tr>
                       </thead>
                       <tbody className="divide-y divide-slate-800/50 text-slate-300">
                          {visibleFleet.map(row => (
                             <tr key={row.machineId} id={`row-${row.machineId}`} onClick={() => setSelectedMachineId(row.machineId)} className={`cursor-pointer transition-all ${selectedMachineId === row.machineId ? 'bg-indigo-900/20 border-l-4 border-l-indigo-500' : 'hover:bg-slate-800/40 border-l-4 border-l-transparent'}`}>
                                <td className="px-4 py-2 font-bold text-indigo-300">{row.machineId}</td>
                                <td className="px-4 py-2"><div className="flex flex-col"><span className="text-slate-200 font-bold">{row.city}</span><span className="text-[10px] text-slate-500 truncate max-w-[150px]">{row.address.replace(`${row.city}市`, '')}</span><span className="text-[9px] text-slate-600 font-mono">{row.geo.lat.toFixed(4)}, {row.geo.lng.toFixed(4)}</span></div></td>
                                <td className="px-4 py-2"><span className={`px-1.5 py-0.5 rounded border text-[10px] uppercase font-bold ${row.status===MachineStatus.ACTIVE?'border-emerald-500/30 text-emerald-400 bg-emerald-500/10':row.status===MachineStatus.MAINTENANCE?'border-amber-500/30 text-amber-400 bg-amber-500/10':'border-rose-500/30 text-rose-400 bg-rose-500/10'}`}>{row.status}</span></td>
                                <td className="px-4 py-2 font-mono">¥{row.dailyStats.totalRevenue.toLocaleString()}</td>
                                <td className="px-4 py-2"><span className="text-slate-400">{row.iotInterface}</span></td>
                                <td className="px-4 py-2 text-slate-400">{row.signalStrength}</td>
                                <td className={`px-4 py-2 ${row.avgLatency>100?'text-amber-400':'text-slate-300'}`}>{row.avgLatency}ms</td>
                                <td className={`px-4 py-2 ${row.errorRate>0.05?'text-rose-400':'text-slate-300'}`}>{(row.errorRate*100).toFixed(1)}%</td>
                                <td className="px-4 py-2"><div className="w-12 h-1 bg-slate-700 rounded-full overflow-hidden"><div className={`h-full ${row.cpuLoad>80?'bg-rose-500':'bg-emerald-500'}`} style={{width:`${row.cpuLoad}%`}}></div></div></td>
                                <td className="px-4 py-2 text-right"><Target size={14} className="text-indigo-500/50 group-hover:text-indigo-400"/></td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
           </div>
       </div>
    </div>
  );
};

const StatusWidgetCompact = ({ label, value, icon, color }: any) => (
   <div className={`bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-sm flex justify-between items-center border-l-4 h-full ${color==='cyan'?'border-l-cyan-500':color==='rose'?'border-l-rose-500':color==='emerald'?'border-l-emerald-500':'border-l-amber-500'}`}>
      <div><p className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">{label}</p><h4 className="text-lg font-bold text-slate-200 font-mono mt-0.5">{value}</h4></div>
      <div className="opacity-80 p-2 rounded-full bg-slate-800/50">{icon}</div>
   </div>
);
