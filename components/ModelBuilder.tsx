
import React, { useState, useEffect, useRef } from 'react';
import { ModelType, MLResult, HyperParameters, ModelVersion, ModelLifecycleRegistry } from '../types';
import { Brain, Database, GitBranch, Cpu, Settings, Sliders, Rocket, ChevronRight, Play, Square, Activity, CheckCircle, Eye, Terminal, PlayCircle, CheckCircle2, Trophy, Medal, Award } from 'lucide-react';
import { generateInsight } from '../services/geminiService';
import { trainModel, runInference } from '../services/mlEngine';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line } from 'recharts';

interface ModelBuilderProps {
  stats: any; data: any[]; lifecycleData: ModelLifecycleRegistry;
  onVersionCreated: (type: ModelType, version: ModelVersion) => void;
  onVersionDeployed: (type: ModelType, versionId: string, result: MLResult) => void;
}

const AVAILABLE_MODELS = [
  { id: ModelType.USER_PERSONA, name: 'RFM 用户分群模型', algo: 'AutoML (Clustering)', desc: '自动评估 K-Means, DBSCAN, GMM 三种算法，选择轮廓系数最优模型进行用户分群。', icon: <Brain size={18}/> },
  { id: ModelType.SALES_PREDICTION, name: '销量预测与库存模型', algo: 'AutoML (Regression)', desc: '自动评估 Linear Regression, Random Forest, LSTM，基于 RMSE 损失率选择最佳预测模型。', icon: <Activity size={18}/> },
  { id: ModelType.RECOMMENDATION, name: '智能推荐系统', algo: 'AutoML (Collaborative)', desc: '自动评估 Apriori, SVD, Neural CF，挖掘最佳商品关联规则。', icon: <Rocket size={18}/> },
];

export const ModelBuilder: React.FC<ModelBuilderProps> = ({ stats, data, lifecycleData, onVersionCreated, onVersionDeployed }) => {
  const [selectedModel, setSelectedModel] = useState<ModelType>(ModelType.USER_PERSONA);
  const [activeTab, setActiveTab] = useState<'overview' | 'train' | 'versions' | 'inference'>('overview');
  const [activeStep, setActiveStep] = useState<number>(-1); 
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [trainingHistory, setTrainingHistory] = useState<{epoch: number, accuracy: number, loss: number}[]>([]);
  const [params, setParams] = useState<HyperParameters>({ epochs: 30, learningRate: 0.01, batchSize: 64, k: 4 });
  const [lastResult, setLastResult] = useState<MLResult | null>(null);
  const [aiInsight, setAiInsight] = useState<string>('');
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [inferenceInput, setInferenceInput] = useState({ age: 25, hour: 8, temp: 85 });
  const [inferenceResult, setInferenceResult] = useState<string | null>(null);

  const logEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const currentLifecycle = lifecycleData[selectedModel] || { versions: [], productionVersionId: null };
  const isTraining = activeStep >= 0 && activeStep < 5;

  useEffect(() => { if (logEndRef.current) logEndRef.current.scrollIntoView({ behavior: 'smooth' }); }, [logs]);
  useEffect(() => { setActiveTab('overview'); setActiveStep(-1); setLogs([]); setTrainingHistory([]); setLastResult(null); setAiInsight(''); }, [selectedModel]);

  const startTraining = async () => {
    if (isTraining) return;
    setActiveStep(0); setProgress(0); setTrainingHistory([]); setLastResult(null); setLogs(['> 初始化 AutoML 环境...', '> 准备数据管道...', '> 加载候选算法库...']);
    const controller = new AbortController(); abortControllerRef.current = controller;
    try {
        const mlResult = await trainModel(selectedModel, data, (p, log, metrics) => {
            setProgress(p); setLogs(prev => [...prev, `> ${log}`]);
            if (p < 20) setActiveStep(0); else if (p < 40) setActiveStep(1); else if (p < 60) setActiveStep(2); else if (p < 90) setActiveStep(3); else setActiveStep(4);
            if (metrics) setTrainingHistory(prev => [...prev, metrics]);
        }, controller.signal, params);
        setActiveStep(5); setLastResult(mlResult);
        onVersionCreated(selectedModel, { id: `v${Date.now()}`, versionTag: `v${currentLifecycle.versions.length + 1}.0`, timestamp: Date.now(), hyperParams: params, metrics: mlResult.metrics, status: 'ready', result: mlResult });
        setLoadingInsight(true);
        setAiInsight(await generateInsight(selectedModel, stats, mlResult));
        setLoadingInsight(false);
    } catch (e: any) { setLogs(prev => [...prev, `> ABORTED`]); setActiveStep(-1); }
  };

  return (
    <div className="flex h-full gap-4 animate-in fade-in duration-500">
      {/* Sidebar */}
      <div className="w-[240px] flex flex-col bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl shrink-0">
        <div className="p-4 border-b border-slate-800"><h3 className="text-slate-200 font-bold flex items-center gap-2 text-sm"><Database size={16} className="text-indigo-400"/> 模型算法库</h3></div>
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
           {AVAILABLE_MODELS.map(model => (
             <div key={model.id} onClick={() => !isTraining && setSelectedModel(model.id)} className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedModel === model.id ? 'bg-indigo-900/20 border-indigo-500 ring-1 ring-indigo-500/50' : 'bg-transparent border-transparent hover:bg-slate-800 hover:border-slate-700'}`}>
                <div className="flex items-center gap-2 font-bold text-slate-200 text-xs mb-1">{model.icon} {model.name}</div>
                <div className="text-[10px] text-slate-500 flex flex-wrap gap-2"><span className="bg-slate-950 px-1.5 rounded border border-slate-800">{model.algo}</span></div>
             </div>
           ))}
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
         {/* Top Tabs */}
         <div className="flex border-b border-slate-800 bg-slate-950/30">
             {[{id:'overview',l:'模型概览',i:Eye},{id:'train',l:'训练与调优',i:Sliders},{id:'versions',l:'版本管理与部署',i:GitBranch},{id:'inference',l:'在线推理演示',i:PlayCircle}].map(t => (
                 <button key={t.id} onClick={() => setActiveTab(t.id as any)} disabled={isTraining && t.id!=='train'} className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 border-r border-slate-800/50 transition-colors ${activeTab === t.id ? 'bg-indigo-600/10 text-indigo-400 border-b-2 border-b-indigo-500' : 'text-slate-500 hover:text-slate-300'}`}><t.i size={14}/> {t.l}</button>
             ))}
         </div>

         <div className="flex-1 flex overflow-hidden">
             {/* Left Content Area */}
             <div className="flex-1 overflow-y-auto custom-scrollbar relative bg-slate-900 p-6 h-full flex flex-col">
                 {activeTab === 'overview' && (
                     <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto text-center">
                         <div className="p-6 bg-slate-800/50 rounded-full mb-6 ring-4 ring-slate-800">{AVAILABLE_MODELS.find(m=>m.id===selectedModel)?.icon}</div>
                         <h2 className="text-3xl font-bold text-white mb-4">{AVAILABLE_MODELS.find(m=>m.id===selectedModel)?.name}</h2>
                         <p className="text-slate-400 mb-8 leading-relaxed">{AVAILABLE_MODELS.find(m=>m.id===selectedModel)?.desc}</p>
                         <button onClick={() => setActiveTab('train')} className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-indigo-500/20"><Play size={16}/> 开始训练模型</button>
                     </div>
                 )}
                 {activeTab === 'train' && (
                     <div className="grid grid-cols-12 gap-6 h-full">
                         <div className="col-span-4 flex flex-col gap-4 border-r border-slate-800 pr-6 h-full overflow-hidden">
                             <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4">
                                 <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2"><Settings size={14}/> 超参数配置 (Hyperparameters)</h3>
                                 {[{l:'总迭代轮次 (Total Epochs)',k:'epochs',min:10,max:100,step:10},{l:'批次大小 (Batch Size)',k:'batchSize',opts:[32,64,128]}].map(p=>(
                                     <div key={p.l}>
                                         <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">{p.l}</label>
                                         {p.opts ? <div className="grid grid-cols-3 gap-2">{p.opts.map((o:number)=><button key={o} onClick={()=>setParams({...params,[p.k]:o})} disabled={isTraining} className={`py-1.5 text-xs rounded border ${params[p.k as keyof HyperParameters]===o?'bg-indigo-600 border-indigo-500 text-white':'bg-slate-950 border-slate-800 text-slate-400'}`}>{o}</button>)}</div> : 
                                         <div className="flex items-center gap-2"><input type="range" min={p.min} max={p.max} step={p.step} value={params[p.k as keyof HyperParameters]} onChange={e=>setParams({...params,[p.k]:parseInt(e.target.value)})} disabled={isTraining} className="flex-1 accent-indigo-500"/><span className="text-xs font-mono w-8 text-right text-slate-300">{params[p.k as keyof HyperParameters]}</span></div>}
                                     </div>
                                 ))}
                             </div>
                             <div className="mt-auto pt-4 border-t border-slate-800">
                                 <button onClick={isTraining ? () => abortControllerRef.current?.abort() : startTraining} className={`w-full py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 ${isTraining ? 'bg-rose-900/20 text-rose-400 border border-rose-500/50' : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'}`}>{isTraining ? '停止训练' : activeStep === 5 ? '重新训练模型' : '开始训练模型'}</button>
                             </div>
                         </div>
                         <div className="col-span-8 flex flex-col gap-4 h-full overflow-hidden">
                             <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex justify-between items-center relative shrink-0">
                                 {['环境初始化','算法评估 1','算法评估 2','算法评估 3','最优模型验证'].map((s,i)=><div key={s} className={`z-10 flex flex-col items-center gap-1 ${activeStep>=i?'text-indigo-400':'text-slate-700'}`}><div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-bold bg-slate-900 ${activeStep>=i?'border-indigo-500':'border-slate-800'}`}>{i+1}</div><span className="text-[9px] uppercase font-bold">{s}</span></div>)}
                                 <div className="absolute top-[28px] left-8 right-8 h-0.5 bg-slate-800 z-0"><div className="h-full bg-indigo-500 transition-all duration-500" style={{width:`${(Math.max(0,activeStep)/4)*100}%`}}></div></div>
                             </div>
                             
                             <div className="h-48 bg-slate-950 border border-slate-800 rounded-xl p-4 relative shrink-0">
                                 <div className="absolute top-2 left-4 text-[10px] font-bold text-slate-500 uppercase">AutoML 实时监控 (Live Metrics)</div>
                                 <ResponsiveContainer width="100%" height="100%"><AreaChart data={trainingHistory}><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false}/><XAxis hide/><YAxis domain={[0,1]} hide/><Area type="monotone" dataKey="accuracy" stroke="#10b981" fill="url(#g)" strokeWidth={2}/></AreaChart></ResponsiveContainer>
                             </div>
                             
                             {/* Console - flex-1 to fill remaining vertical space */}
                             <div className="flex-1 bg-black border border-slate-800 rounded-xl p-3 font-mono text-xs overflow-hidden flex flex-col min-h-0">
                                 <div className="flex items-center gap-2 text-slate-500 mb-2 pb-1 border-b border-slate-900 shrink-0"><Terminal size={12}/> 控制台终端 (Console)</div>
                                 <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1 text-emerald-500/80">
                                     {logs.map((l,i)=><div key={i}>{l}</div>)}
                                     <div ref={logEndRef}></div>
                                 </div>
                             </div>
                         </div>
                     </div>
                 )}
                 {activeTab === 'versions' && (
                     <div className="flex flex-col h-full">
                         <div className="flex justify-between items-center mb-6">
                             <h3 className="text-lg font-bold text-white flex items-center gap-2"><GitBranch size={18} className="text-indigo-400"/> 版本历史管理</h3>
                             <div className="text-xs text-slate-500 font-mono">当前生产环境版本: <span className="text-emerald-400">{currentLifecycle.productionVersionId || 'NONE'}</span></div>
                         </div>
                         <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
                             <div className="overflow-x-auto custom-scrollbar h-full">
                                <table className="w-full text-left text-xs font-mono">
                                   <thead className="bg-slate-900/90 text-slate-500 sticky top-0 z-10 border-b border-slate-800">
                                      <tr><th className="px-6 py-4 font-bold uppercase tracking-wider">版本号</th><th className="px-6 py-4 font-bold uppercase tracking-wider">创建时间</th><th className="px-6 py-4 font-bold uppercase tracking-wider">优胜算法 (Algorithm)</th><th className="px-6 py-4 font-bold uppercase tracking-wider">核心指标 (Acc/Loss)</th><th className="px-6 py-4 font-bold uppercase tracking-wider text-right">操作</th></tr>
                                   </thead>
                                   <tbody className="divide-y divide-slate-800/50 text-slate-400">
                                      {currentLifecycle.versions.length === 0 && <tr><td colSpan={5} className="text-center py-12 text-slate-600 italic">暂无训练模型。请前往 '训练与调优' 页面开始。</td></tr>}
                                      {currentLifecycle.versions.map(v => (
                                          <tr key={v.id} className={`hover:bg-slate-800/40 transition-colors ${v.status==='production'?'bg-indigo-900/10':''}`}>
                                              <td className="px-6 py-4"><div className="flex items-center gap-2"><span className="font-bold text-white">{v.versionTag}</span>{v.status==='production'&&<span className="px-1.5 py-0.5 rounded border border-indigo-500/30 bg-indigo-500/20 text-indigo-400 text-[9px] font-bold uppercase">生产中</span>}</div></td>
                                              <td className="px-6 py-4">{new Date(v.timestamp).toLocaleString()}</td>
                                              <td className="px-6 py-4 text-white font-bold">{v.result.algorithm || 'AutoML'}</td>
                                              <td className="px-6 py-4"><span className="text-emerald-400 font-bold">{(v.metrics.accuracy*100).toFixed(1)}%</span> <span className="text-slate-600 mx-1">/</span> {v.metrics.loss.toFixed(3)}</td>
                                              <td className="px-6 py-4 text-right">
                                                  {v.status !== 'production' ? 
                                                      <button onClick={() => onVersionDeployed(selectedModel, v.id, v.result)} className="px-3 py-1.5 bg-slate-800 hover:bg-emerald-600 hover:text-white hover:border-emerald-500 text-slate-300 rounded border border-slate-700 transition-all text-[10px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1 ml-auto"><Rocket size={12}/> 发布上线</button> 
                                                      : <span className="text-emerald-500 font-bold text-[10px] uppercase flex items-center justify-end gap-1"><CheckCircle2 size={14}/> 运行中</span>
                                                  }
                                              </td>
                                          </tr>
                                      ))}
                                   </tbody>
                                </table>
                             </div>
                         </div>
                     </div>
                 )}
                 {activeTab === 'inference' && <div className="p-10 flex flex-col items-center gap-4"><div className="grid grid-cols-3 gap-4 w-full max-w-xl">{Object.keys(inferenceInput).map(k=><div key={k}><label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">{k}</label><input type="number" className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-sm text-white" value={(inferenceInput as any)[k]} onChange={e=>setInferenceInput({...inferenceInput,[k]:parseFloat(e.target.value)})}/></div>)}</div><button onClick={()=>setInferenceResult(runInference(selectedModel, inferenceInput, lastResult || currentLifecycle.versions.find(v=>v.status==='production')?.result || null))} className="px-6 py-2 bg-indigo-600 text-white rounded font-bold">运行推理测试</button>{inferenceResult && <div className="bg-slate-950 border border-emerald-500/30 p-4 rounded text-emerald-400 font-mono text-sm w-full max-w-xl whitespace-pre-line">{inferenceResult}</div>}</div>}
             </div>

             {/* Right Panel (Details) */}
             {(activeTab==='overview'||activeTab==='train') && (
                 <div className="w-[300px] border-l border-slate-800 bg-slate-950/30 flex flex-col p-4 gap-4 h-full">
                     {activeTab==='train' && lastResult && (
                         <div className="bg-slate-900 border border-emerald-500/30 rounded-xl p-4 shadow-lg animate-in slide-in-from-right flex flex-col gap-3 shrink-0">
                             <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2"><CheckCircle size={12}/> 训练成功完成</div>
                             
                             {/* ALGORITHM LEADERBOARD */}
                             <div className="space-y-2">
                                 <div className="text-[9px] text-slate-500 uppercase font-bold border-b border-slate-800 pb-1">算法竞技排行榜 (Leaderboard)</div>
                                 {lastResult.candidates?.map((cand, idx) => (
                                     <div key={idx} className={`p-2 rounded border flex justify-between items-center ${cand.isBest ? 'bg-emerald-500/10 border-emerald-500/50' : 'bg-slate-950 border-slate-800 opacity-70'}`}>
                                         <div className="flex items-center gap-2">
                                             {cand.isBest ? <Trophy size={12} className="text-yellow-400"/> : <span className="text-[10px] text-slate-600 font-mono w-3">{idx+1}</span>}
                                             <span className={`text-[10px] font-bold ${cand.isBest ? 'text-white' : 'text-slate-400'}`}>{cand.name}</span>
                                         </div>
                                         <span className={`text-[10px] font-mono ${cand.isBest ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>{(cand.metrics.accuracy*100).toFixed(1)}%</span>
                                     </div>
                                 ))}
                             </div>

                             <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800/50">
                                 {[{l:'最终准确率',v:`${(lastResult.metrics.accuracy*100).toFixed(1)}%`},{l:'最佳算法',v:lastResult.algorithm}].map(m=><div key={m.l}><div className="text-[9px] text-slate-500 uppercase font-bold">{m.l}</div><div className="text-xs font-mono font-bold text-slate-200 truncate" title={m.v}>{m.v}</div></div>)}
                             </div>
                         </div>
                     )}
                     <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col overflow-hidden">
                         <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2 flex items-center gap-2 shrink-0"><Brain size={14}/> AI 实验洞察报告</h4>
                         <div className="flex-1 overflow-y-auto custom-scrollbar text-xs text-slate-300 leading-relaxed font-light whitespace-pre-wrap">{loadingInsight ? <span className="animate-pulse">正在生成洞察...</span> : aiInsight || <span className="text-slate-600 italic">暂无报告，请先训练模型。</span>}</div>
                     </div>
                 </div>
             )}
         </div>
      </div>
    </div>
  );
};
