
import React, { useState } from 'react';
import { ProjectData, Task } from '../types';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip, AreaChart, Area, CartesianGrid, XAxis, YAxis, PieChart, Pie, Cell } from 'recharts';
import { CheckCircle2, TrendingUp, AlertTriangle, Download, Calendar, Clock, Milestone, Award, Sparkles, Target, ShieldAlert, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';
import { exportProjectPackage } from '../services/fileGenService';

interface DashboardProps {
  data: ProjectData;
}

// --- PRECISE GANTT COMPONENT ---
const RobustGantt: React.FC<{ tasks: Task[] }> = ({ tasks }) => {
    const validTasks = tasks.filter(t => {
        const s = new Date(t.start).getTime();
        const e = new Date(t.end).getTime();
        return !isNaN(s) && !isNaN(e) && e >= s;
    });

    if (validTasks.length === 0) return <div className="text-xs text-slate-400 font-mono py-4 text-center border border-dashed border-slate-700 rounded">NO TIMELINE DATA</div>;

    const startDates = validTasks.map(t => new Date(t.start).getTime());
    const endDates = validTasks.map(t => new Date(t.end).getTime());
    const minDate = Math.min(...startDates);
    const maxDate = Math.max(...endDates);
    const totalDuration = Math.max(maxDate - minDate, 24 * 60 * 60 * 1000 * 30);
    const padding = totalDuration * 0.05;
    const timelineStart = minDate - padding;
    const timelineDuration = (maxDate + padding) - timelineStart;

    const getX = (date: string) => ((new Date(date).getTime() - timelineStart) / timelineDuration) * 100;

    return (
        <div className="w-full bg-[#0B1120] border border-slate-800 rounded-xl overflow-hidden relative">
            {/* Grid Lines */}
            <div className="absolute inset-0 flex justify-between pointer-events-none opacity-10">
                {[...Array(5)].map((_, i) => <div key={i} className="w-px h-full bg-slate-400"></div>)}
            </div>
            
            <div className="relative p-5 z-10">
                 <div className="flex justify-between mb-4 text-[9px] text-slate-500 font-mono uppercase tracking-widest border-b border-slate-800 pb-2">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-blue-500"/> Start: {new Date(minDate).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-blue-500"/> {Math.ceil(totalDuration / (1000 * 60 * 60 * 24))} Days</span>
                    <span className="flex items-center gap-1"><Milestone className="w-3 h-3 text-blue-500"/> End: {new Date(maxDate).toLocaleDateString()}</span>
                 </div>

                {validTasks.map((task) => {
                    const xStart = getX(task.start);
                    const width = Math.max(getX(task.end) - xStart, 1);
                    return (
                        <div key={task.id} className="group relative mb-6 last:mb-1">
                            <div className="flex items-center gap-4 relative">
                                <div className="w-24 shrink-0 text-right">
                                    <div className="text-[10px] font-bold text-slate-300 truncate">{task.name}</div>
                                </div>
                                <div className="flex-1 relative h-1.5 bg-slate-800 rounded-full">
                                    <div 
                                        className={`absolute top-0 bottom-0 rounded-full transition-all duration-1000 ${task.status === 'Completed' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]'}`}
                                        style={{ left: `${xStart}%`, width: `${width}%` }}
                                    ></div>
                                    <span className="absolute -top-4 text-[9px] font-mono text-slate-500" style={{ left: `${xStart}%` }}>
                                        {task.progress}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  const [exportConfirmOpen, setExportConfirmOpen] = useState(false);
  
  const radarData = data.scoring.map(s => ({
    subject: s.parameter,
    A: s.score,
    fullMark: s.max,
    reason: s.reason
  }));

  const charterTasks: Task[] = (data.charter?.timeline || []).map(t => ({
      id: t.id.toString(),
      name: t.milestone,
      start: t.start,
      end: t.end,
      pic: 'Team',
      status: t.note === 'Completed' ? 'Completed' : 'In Progress',
      progress: t.note === 'Completed' ? 100 : 50
  }));

  const handleExportClick = () => { setExportConfirmOpen(true); };
  const confirmExport = () => { exportProjectPackage(data); setExportConfirmOpen(false); };

  // Financial Theme Colors
  const COLORS = {
      primary: '#3B82F6', // Blue
      success: '#10B981', // Emerald
      warning: '#F59E0B', // Amber
      danger: '#EF4444',  // Red
      darkBg: '#0F172A',
      cardBg: '#1E293B',
      border: '#334155'
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans text-slate-200 pb-20">
      
      {/* EXPORT MODAL */}
      {exportConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#1E293B] rounded-2xl shadow-2xl max-w-sm w-full border border-slate-700 p-8 animate-scale-in">
                <div className="flex flex-col items-center text-center">
                    <div className="w-14 h-14 bg-blue-900/30 rounded-full flex items-center justify-center mb-6 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                        <Download className="w-6 h-6 text-blue-400" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">Initialize Export Sequence?</h3>
                    <p className="text-xs text-slate-400 mb-8 leading-relaxed">
                        Compiling Master TOR, BRD, FSD, and Financial Estimation Sheets into a secure package.
                    </p>
                    <div className="flex gap-3 w-full">
                        <button onClick={() => setExportConfirmOpen(false)} className="flex-1 py-3 rounded-lg border border-slate-600 text-slate-400 font-bold text-xs hover:bg-slate-800 transition-colors">ABORT</button>
                        <button onClick={confirmExport} className="flex-1 py-3 rounded-lg bg-blue-600 text-white font-bold text-xs hover:bg-blue-500 shadow-lg transition-all">CONFIRM</button>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* KPI TICKER ROW */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-[#1E293B] p-4 rounded-xl border border-slate-800 flex items-center justify-between shadow-sm">
              <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Suitability</p>
                  <div className="text-2xl font-mono font-bold text-white flex items-baseline gap-1">
                      {data.stats.totalScore} <span className="text-xs text-slate-500">/ 100</span>
                  </div>
              </div>
              <div className={`p-2 rounded-lg ${data.stats.totalScore > 80 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                  <Award className="w-5 h-5"/>
              </div>
          </div>
          <div className="bg-[#1E293B] p-4 rounded-xl border border-slate-800 flex items-center justify-between shadow-sm">
              <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Est. NPV</p>
                  <div className="text-2xl font-mono font-bold text-emerald-400 flex items-baseline gap-1">
                      {data.analytics.quantMetrics.npv}B <ArrowUpRight className="w-3 h-3"/>
                  </div>
              </div>
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <TrendingUp className="w-5 h-5"/>
              </div>
          </div>
          <div className="bg-[#1E293B] p-4 rounded-xl border border-slate-800 flex items-center justify-between shadow-sm">
              <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Risk Factor</p>
                  <div className="text-2xl font-mono font-bold text-rose-400 flex items-baseline gap-1">
                      {(data.analytics.quantMetrics.volatility * 100).toFixed(1)}% <Activity className="w-3 h-3"/>
                  </div>
              </div>
              <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
                  <ShieldAlert className="w-5 h-5"/>
              </div>
          </div>
          <div className="bg-gradient-to-br from-blue-900 to-slate-900 p-4 rounded-xl border border-blue-800/50 flex flex-col justify-center items-center text-center cursor-pointer hover:border-blue-500 transition-colors" onClick={handleExportClick}>
              <Download className="w-6 h-6 text-blue-400 mb-1"/>
              <span className="text-[10px] font-bold text-blue-200 uppercase tracking-widest">Export Package</span>
          </div>
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="grid grid-cols-12 gap-6">
          
          {/* AI DIRECTIVE (Wide) */}
          <div className="col-span-12 lg:col-span-8 bg-[#1E293B] rounded-2xl border border-slate-800 p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5"><Sparkles className="w-32 h-32 text-white"/></div>
              <div className="relative z-10 flex flex-col h-full justify-between">
                  <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl border ${data.analytics.recommendation.action === 'PROCEED' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-amber-500/10 border-amber-500/30 text-amber-400'}`}>
                          {data.analytics.recommendation.action === 'PROCEED' ? <CheckCircle2 className="w-6 h-6"/> : <AlertTriangle className="w-6 h-6"/>}
                      </div>
                      <div>
                          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">AI Strategic Directive</h3>
                          <div className="text-2xl font-bold text-white tracking-tight mb-2">{data.analytics.recommendation.action}</div>
                          <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
                              {data.analytics.recommendation.condition}
                          </p>
                      </div>
                  </div>
                  <div className="mt-6 flex items-center gap-6 border-t border-slate-800 pt-4">
                      <div>
                          <span className="text-[9px] uppercase text-slate-500 font-bold block">Confidence</span>
                          <span className="text-lg font-mono font-bold text-white">{data.analytics.recommendation.confidenceScore}%</span>
                      </div>
                      <div>
                          <span className="text-[9px] uppercase text-slate-500 font-bold block">Urgency</span>
                          <span className="text-lg font-mono font-bold text-white">{data.analytics.recommendation.urgency}</span>
                      </div>
                      <div className="flex-1 text-right">
                          <span className="text-[9px] uppercase text-slate-500 font-bold">Generated by AGDIP Core v4.0</span>
                      </div>
                  </div>
              </div>
          </div>

          {/* RADAR CHART */}
          <div className="col-span-12 lg:col-span-4 bg-[#1E293B] rounded-2xl border border-slate-800 p-4 flex flex-col">
              <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Target className="w-3 h-3"/> Assessment Radar</h3>
              </div>
              <div className="flex-1 w-full min-h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                          <PolarGrid stroke="#334155" />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: '#94A3B8', fontSize: 9, fontWeight: 700 }} />
                          <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
                          <Radar name="Score" dataKey="A" stroke={COLORS.primary} strokeWidth={2} fill={COLORS.primary} fillOpacity={0.3} />
                          <Tooltip 
                            contentStyle={{backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '8px', color: '#fff', fontSize: '11px'}}
                            itemStyle={{color: '#fff'}}
                          />
                      </RadarChart>
                  </ResponsiveContainer>
              </div>
          </div>

          {/* FINANCIAL CHART */}
          <div className="col-span-12 lg:col-span-8 bg-[#1E293B] rounded-2xl border border-slate-800 p-6">
              <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><TrendingUp className="w-3 h-3"/> Financial Projection (5-Year Horizon)</h3>
                  <div className="flex gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span><span className="text-[10px] text-slate-500 mr-2">Net Value</span>
                  </div>
              </div>
              <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={data.analytics.economicProjection}>
                          <defs>
                              <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor={COLORS.success} stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor={COLORS.success} stopOpacity={0}/>
                              </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" strokeOpacity={0.5} />
                          <XAxis dataKey="year" axisLine={false} tickLine={false} fontSize={10} stroke="#64748b" dy={10} />
                          <YAxis axisLine={false} tickLine={false} fontSize={10} stroke="#64748b" tickFormatter={(v) => `${v}B`} />
                          <Tooltip 
                            contentStyle={{backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '8px', color: '#fff', fontSize: '11px'}} 
                            itemStyle={{color: '#fff'}}
                          />
                          <Area type="monotone" dataKey="netValue" stroke={COLORS.success} strokeWidth={2} fillOpacity={1} fill="url(#colorNet)" />
                      </AreaChart>
                  </ResponsiveContainer>
              </div>
          </div>

          {/* TIMELINE & RISK */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
              <div className="bg-[#1E293B] rounded-2xl border border-slate-800 p-5 flex-1">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Clock className="w-3 h-3"/> Strategic Timeline</h3>
                  <RobustGantt tasks={charterTasks} />
              </div>
              
              <div className="bg-[#1E293B] rounded-2xl border border-slate-800 p-5 flex-1 flex flex-col">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><ShieldAlert className="w-3 h-3"/> Top Risks</h3>
                  <div className="space-y-4 flex-1">
                      {data.analytics.riskAnalysis.slice(0, 3).map((risk, i) => (
                          <div key={i} className="flex flex-col gap-1">
                              <div className="flex justify-between text-[10px] font-bold text-slate-300">
                                  <span>{risk.category}</span>
                                  <span>{risk.impact}%</span>
                              </div>
                              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                  <div 
                                      className={`h-full rounded-full ${risk.impact > 70 ? 'bg-rose-500' : risk.impact > 40 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                      style={{width: `${risk.impact}%`}}
                                  ></div>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};

export default Dashboard;
