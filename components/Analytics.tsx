
import React, { useState, useMemo, useEffect } from 'react';
import { AnalyticsData, ProjectData, AuditCategory } from '../types';
import { 
    ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { 
    ArrowLeft, TrendingUp, CheckCircle2, ShieldAlert, AlertTriangle, Clock, Sparkles, Target, Zap, Layout, MoveUpRight, Scale, Network, Radar as RadarIcon, ListTree, ChevronRight
} from 'lucide-react';
import IntelligenceGraph from './IntelligenceGraph';

interface AnalyticsProps {
  data: ProjectData;
  setData?: (data: ProjectData) => void;
  settings: any;
  onBack?: () => void;
}

const Analytics: React.FC<AnalyticsProps> = ({ data, setData, settings, onBack }) => {
  const { analytics } = data;
  const [activeTab, setActiveTab] = useState<'ANALYSIS' | 'NETWORK' | 'PREDICTION' | 'AUDIT'>('ANALYSIS');
  const [localAuditState, setLocalAuditState] = useState(analytics.auditState);

  useEffect(() => {
      setLocalAuditState(analytics.auditState);
  }, [analytics.auditState]);

  // --- PREDICTIVE GOVERNANCE LOGIC ---
  const predictiveMetrics = useMemo(() => {
      const auditScore = data.stats.totalScore;
      const volatility = analytics.quantMetrics.volatility;
      const riskCount = analytics.riskAnalysis.filter(r => r.impact > 70).length;
      
      const failureProb = Math.min(99, ((100 - auditScore) * 0.4) + (volatility * 100) + (riskCount * 5));
      const governanceWeather = failureProb < 20 ? 'CLEAR' : failureProb < 50 ? 'CLOUDY' : 'STORM';
      
      return {
          failureProb: failureProb.toFixed(1),
          weather: governanceWeather,
          drift: (volatility * 100 * 1.5).toFixed(1),
          auditVulnerability: (100 - (data.meta.verification?.score || 50)).toFixed(0)
      };
  }, [data]);

  // --- SCORE CALCULATION & MATRIX COORDS ---
  const matrixData = useMemo(() => {
      let valueScore = 0, easeScore = 0;
      let valueMax = 0, easeMax = 0;

      Object.values(localAuditState).forEach((cat: any) => {
          const selectedVal = cat.options[cat.selectedOptionIndex]?.value || 0;
          const maxVal = Math.max(...cat.options.map((o: any) => o.value));
          
          if (cat.group === 'BUSINESS_VALUE') {
              valueScore += selectedVal;
              valueMax += maxVal;
          } else {
              easeScore += selectedVal;
              easeMax += maxVal;
          }
      });

      const y = (valueScore / valueMax) * 100;
      const x = (easeScore / easeMax) * 100; 
      const pulse = (valueScore + easeScore) / (valueMax + easeMax) * 10; 

      let quadrant = "";
      if (y > 50 && x > 50) quadrant = "Strategic Winner";
      else if (y > 50 && x <= 50) quadrant = "Major Project";
      else if (y <= 50 && x > 50) quadrant = "Quick Win";
      else quadrant = "Fill-in Task";

      return { x, y, pulse: pulse.toFixed(2), quadrant };
  }, [localAuditState]);

  const handleAuditSelect = (catKey: string, optionIndex: number) => {
      const newState = { ...localAuditState };
      // @ts-ignore
      newState[catKey].selectedOptionIndex = optionIndex;
      setLocalAuditState(newState);
      if (setData) {
          setData({ ...data, analytics: { ...data.analytics, auditState: newState } });
      }
  };

  const Card = ({ children, className = "", title, icon: Icon, subTitle }: any) => (
      <div className={`bg-[#1E293B] rounded-xl border border-slate-700 shadow-xl flex flex-col overflow-hidden ${className}`}>
          {title && (
              <div className="px-6 py-4 border-b border-slate-800 bg-[#0F172A]">
                  <div className="flex items-center gap-3">
                      {Icon && <div className="p-1.5 bg-slate-800 rounded-lg text-slate-300 border border-slate-700"><Icon className="w-4 h-4"/></div>}
                      <div>
                          <h3 className="font-bold text-slate-100 text-sm tracking-wide">{title}</h3>
                          {subTitle && <span className="text-[10px] text-slate-500 font-mono uppercase">{subTitle}</span>}
                      </div>
                  </div>
              </div>
          )}
          <div className="p-6 flex-1 relative text-slate-300">
              {children}
          </div>
      </div>
  );

  const StatWidget = ({ label, value, subValue, color = "blue" }: any) => (
      <div className={`bg-[#1E293B] p-5 rounded-xl border border-slate-800 shadow-sm relative overflow-hidden group hover:border-${color}-500/50 transition-colors`}>
          <div className={`absolute top-0 right-0 p-3 opacity-10 text-${color}-500`}><Target className="w-16 h-16"/></div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</span>
          <div className="mt-2 relative z-10">
              <h2 className={`text-2xl font-mono font-bold tracking-tight text-${color}-400`}>{value}</h2>
              {subValue && <div className="mt-1 text-[10px] font-bold text-slate-400">{subValue}</div>}
          </div>
      </div>
  );

  const AuditItem = ({ category, catKey }: { category: AuditCategory, catKey: string }) => {
      const selected = category.options[category.selectedOptionIndex];
      return (
          <div className="bg-[#1E293B] rounded-xl border border-slate-800 p-5 hover:border-blue-500/50 transition-all duration-200 group">
              <div className="flex justify-between items-center mb-4">
                  <h4 className="font-bold text-[10px] uppercase tracking-wider text-slate-500 group-hover:text-blue-400 transition-colors">{category.title}</h4>
                  <span className="text-xs font-mono font-bold text-blue-400 bg-blue-900/30 px-2 py-0.5 rounded border border-blue-800">{selected.value}/5</span>
              </div>
              <div className="space-y-1">
                  {category.options.map((opt, idx) => (
                      <button
                          key={idx}
                          onClick={() => handleAuditSelect(catKey, idx)}
                          className={`w-full text-left px-3 py-2 rounded text-[11px] font-medium transition-all flex justify-between items-center ${
                              idx === category.selectedOptionIndex 
                              ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                              : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                          }`}
                      >
                          <span>{opt.label}</span>
                          {idx === category.selectedOptionIndex && <CheckCircle2 className="w-3 h-3"/>}
                      </button>
                  ))}
              </div>
          </div>
      );
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans text-slate-200 pb-20">
        
        {/* HEADER TAB NAV */}
        <div className="flex justify-between items-center bg-[#1E293B] p-1.5 rounded-xl border border-slate-800 shadow-lg sticky top-4 z-30 backdrop-blur-md bg-opacity-90">
            <div className="flex gap-1">
                {['ANALYSIS', 'NETWORK', 'PREDICTION', 'AUDIT'].map((tab) => (
                    <button 
                        key={tab}
                        onClick={() => setActiveTab(tab as any)} 
                        className={`px-6 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === tab ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                    >
                        {tab === 'ANALYSIS' && <Layout className="w-3 h-3"/>}
                        {tab === 'NETWORK' && <Network className="w-3 h-3"/>}
                        {tab === 'PREDICTION' && <RadarIcon className="w-3 h-3"/>}
                        {tab === 'AUDIT' && <CheckCircle2 className="w-3 h-3"/>}
                        {tab}
                    </button>
                ))}
            </div>
            {onBack && (
                <button onClick={onBack} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
                    <ArrowLeft className="w-5 h-5"/>
                </button>
            )}
        </div>

        {/* --- 1. ANALYSIS DASHBOARD --- */}
        {activeTab === 'ANALYSIS' && (
            <div className="grid grid-cols-12 gap-6">
                <div className="col-span-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatWidget label="NPV" value={`${analytics.quantMetrics.npv}B`} subValue="+12% vs Baseline" color="emerald" />
                    <StatWidget label="IRR" value={`${analytics.quantMetrics.irr}%`} subValue="Above Hurdle Rate" color="blue" />
                    <StatWidget label="Sharpe" value={analytics.quantMetrics.sharpeRatio} subValue="Risk Adjusted Return" color="purple" />
                    <StatWidget label="VaR (95%)" value={`${analytics.quantMetrics.var95}%`} subValue="Value at Risk" color="amber" />
                </div>

                <div className="col-span-12 lg:col-span-8">
                    <Card title="Cumulative Economic Projection" subValue="5-Year Horizon Analysis" icon={TrendingUp}>
                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={analytics.economicProjection} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} strokeOpacity={0.5} />
                                    <XAxis dataKey="year" stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} padding={{ left: 20, right: 20 }} dy={10} />
                                    <YAxis stroke="#94A3B8" fontSize={10} tickFormatter={(v) => `${v}B`} tickLine={false} axisLine={false} />
                                    <Tooltip contentStyle={{backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '8px', color: '#fff', fontSize: '11px'}} />
                                    <Line type="monotone" dataKey="benefit" stroke="#10B981" strokeWidth={2} dot={false} name="Benefit" />
                                    <Line type="monotone" dataKey="cost" stroke="#EF4444" strokeWidth={2} dot={false} name="Cost" />
                                    <Line type="monotone" dataKey="netValue" stroke="#3B82F6" strokeWidth={3} dot={{r: 4, strokeWidth: 2, fill: '#0F172A'}} name="Net Value" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </div>

                <div className="col-span-12 lg:col-span-4">
                    <Card title="Strategic Matrix" subValue="Audit-Driven Prioritization" icon={MoveUpRight}>
                        <div className="h-[250px] w-full relative bg-[#0F172A] rounded-lg overflow-hidden border border-slate-800">
                            {/* Grid Lines */}
                            <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
                                <div className="border-r border-b border-slate-800/50 bg-emerald-500/5"></div>
                                <div className="border-b border-slate-800/50 bg-blue-500/5"></div>
                                <div className="border-r border-slate-800/50 bg-amber-500/5"></div>
                                <div className="bg-slate-800/5"></div>
                            </div>

                            {/* Labels */}
                            <span className="absolute top-2 left-2 text-[8px] uppercase font-bold text-emerald-500/70">Major Project</span>
                            <span className="absolute top-2 right-2 text-[8px] uppercase font-bold text-blue-500/70">Strategic Winner</span>
                            <span className="absolute bottom-2 left-2 text-[8px] uppercase font-bold text-amber-500/70">Fill-in Task</span>
                            <span className="absolute bottom-2 right-2 text-[8px] uppercase font-bold text-slate-500/70">Quick Win</span>

                            {/* The Dot */}
                            <div 
                                className="absolute w-4 h-4 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.8)] z-10 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-1000 border-2 border-white" 
                                style={{ top: `${100 - matrixData.y}%`, left: `${matrixData.x}%` }}
                            >
                            </div>
                        </div>
                        <div className="mt-6 flex justify-between items-center">
                            <div>
                                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Classification</h4>
                                <div className="text-sm font-bold text-white">{matrixData.quadrant}</div>
                            </div>
                            <div className="text-right">
                                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Score</h4>
                                <div className="text-sm font-mono font-bold text-blue-400">{matrixData.pulse}</div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        )}

        {/* --- 2. INTELLIGENCE GRAPH --- */}
        {activeTab === 'NETWORK' && (
            <div className="grid grid-cols-12 gap-6 animate-fade-in h-[calc(100vh-200px)]">
                <div className="col-span-12 lg:col-span-9 h-full">
                    <Card title="Entity Relationship Graph" subValue="Knowledge Graph Visualization" icon={Network} className="h-full bg-[#0F172A]">
                        <IntelligenceGraph nodes={data.intelligenceGraph?.nodes || []} edges={data.intelligenceGraph?.edges || []} />
                    </Card>
                </div>
                <div className="col-span-12 lg:col-span-3 h-full">
                    <div className="bg-[#1E293B] rounded-xl border border-slate-800 h-full flex flex-col overflow-hidden">
                        <div className="p-4 border-b border-slate-800 bg-[#0F172A] flex items-center gap-2">
                            <ListTree className="w-4 h-4 text-blue-400"/>
                            <h3 className="font-bold text-xs uppercase tracking-widest text-slate-400">Mind Map</h3>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-1">
                            {data.intelligenceGraph?.nodes.map((node, i) => (
                                <div key={i} className="group flex items-center gap-3 p-2 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-slate-700">
                                    <div className={`w-2 h-2 rounded-full shrink-0 ${
                                        node.type === 'RISK' ? 'bg-rose-500' : 
                                        node.type === 'PROJECT' ? 'bg-blue-500' : 
                                        node.type === 'REQUIREMENT' ? 'bg-emerald-500' : 'bg-slate-500'
                                    }`}></div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-xs font-bold text-slate-300 truncate group-hover:text-white">{node.label}</div>
                                        <div className="text-[9px] text-slate-600 uppercase tracking-wider font-mono">{node.type}</div>
                                    </div>
                                    <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-slate-400"/>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* --- 3. PREDICTIVE GOVERNANCE --- */}
        {activeTab === 'PREDICTION' && (
            <div className="grid grid-cols-12 gap-6 animate-fade-in">
                <div className="col-span-12 lg:col-span-8">
                    <Card title="Governance Forecasting" subValue="Future Risk Modeling" icon={RadarIcon}>
                        <div className="grid grid-cols-2 gap-8">
                            <div className="flex flex-col items-center justify-center p-8 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700">
                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-4">Project Weather</h3>
                                <div className={`text-6xl mb-4 ${predictiveMetrics.weather === 'CLEAR' ? 'text-yellow-400' : predictiveMetrics.weather === 'CLOUDY' ? 'text-slate-400' : 'text-blue-400'}`}>
                                    {predictiveMetrics.weather === 'CLEAR' ? '☀' : predictiveMetrics.weather === 'CLOUDY' ? '☁' : '⛈'}
                                </div>
                                <div className="text-2xl font-bold text-white tracking-tight">{predictiveMetrics.weather}</div>
                                <div className="mt-2 text-xs font-mono text-slate-400 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
                                    Failure Prob: {predictiveMetrics.failureProb}%
                                </div>
                            </div>
                            
                            <div className="space-y-8 flex flex-col justify-center">
                                <div>
                                    <div className="flex justify-between text-xs font-bold mb-2">
                                        <span className="text-slate-400 uppercase tracking-wider">Template Drift</span>
                                        <span className="text-blue-400 font-mono">{predictiveMetrics.drift}%</span>
                                    </div>
                                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                                        <div className="bg-blue-500 h-full rounded-full" style={{width: `${predictiveMetrics.drift}%`}}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs font-bold mb-2">
                                        <span className="text-slate-400 uppercase tracking-wider">Audit Vulnerability</span>
                                        <span className="text-rose-400 font-mono">{predictiveMetrics.auditVulnerability}%</span>
                                    </div>
                                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                                        <div className="bg-rose-500 h-full rounded-full" style={{width: `${predictiveMetrics.auditVulnerability}%`}}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs font-bold mb-2">
                                        <span className="text-slate-400 uppercase tracking-wider">Regulation Compliance</span>
                                        <span className="text-emerald-400 font-mono">92%</span>
                                    </div>
                                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                                        <div className="bg-emerald-500 h-full rounded-full" style={{width: '92%'}}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="mt-8 pt-6 border-t border-slate-800">
                            <h4 className="text-[10px] font-bold uppercase text-slate-500 tracking-widest mb-4">Critical Risk Triggers</h4>
                            <div className="grid grid-cols-2 gap-4">
                                {data.analytics.riskAnalysis.slice(0,2).map((risk, i) => (
                                    <div key={i} className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg border border-slate-800/50">
                                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                                        <span className="text-xs font-medium text-slate-300">{risk.category}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Card>
                </div>
                
                <div className="col-span-12 lg:col-span-4">
                    <Card title="Risk Exposure Radar" icon={Target} className="h-full">
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={[
                                    { subject: 'Reg.', A: 100 - (analytics.auditState.val_regulation.options[analytics.auditState.val_regulation.selectedOptionIndex]?.value * 20 || 0), fullMark: 100 },
                                    { subject: 'Tech', A: 100 - (analytics.auditState.eff_tech.options[analytics.auditState.eff_tech.selectedOptionIndex]?.value * 20 || 0), fullMark: 100 },
                                    { subject: 'Fin.', A: analytics.quantMetrics.volatility * 100, fullMark: 100 },
                                    { subject: 'Ops', A: 100 - (analytics.auditState.eff_complexity.options[analytics.auditState.eff_complexity.selectedOptionIndex]?.value * 20 || 0), fullMark: 100 },
                                    { subject: 'Pol.', A: 60, fullMark: 100 },
                                ]}>
                                    <PolarGrid stroke="#334155" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 700 }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                    <Radar name="Exposure" dataKey="A" stroke="#EF4444" strokeWidth={2} fill="#EF4444" fillOpacity={0.2} />
                                    <Tooltip contentStyle={{backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '8px', color: '#fff', fontSize: '11px'}} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </div>
            </div>
        )}

        {/* --- 4. AUDIT MATRIX --- */}
        {activeTab === 'AUDIT' && (
            <div className="grid grid-cols-12 gap-6">
                <div className="col-span-12 lg:col-span-9 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <AuditItem category={localAuditState.val_efficiency} catKey="val_efficiency" />
                    <AuditItem category={localAuditState.val_regulation} catKey="val_regulation" />
                    <AuditItem category={localAuditState.val_user} catKey="val_user" />
                    <AuditItem category={localAuditState.val_biz_impact} catKey="val_biz_impact" />
                    <AuditItem category={localAuditState.eff_duration} catKey="eff_duration" />
                    <AuditItem category={localAuditState.eff_complexity} catKey="eff_complexity" />
                    <AuditItem category={localAuditState.eff_tech} catKey="eff_tech" />
                    <AuditItem category={localAuditState.eff_strategy} catKey="eff_strategy" />
                </div>
                <div className="col-span-12 lg:col-span-3 space-y-6">
                    <div className="bg-gradient-to-b from-blue-900 to-slate-900 text-white p-8 rounded-2xl shadow-2xl relative overflow-hidden flex flex-col items-center text-center border border-blue-800">
                        <div className="relative z-10">
                            <h4 className="text-[10px] font-bold uppercase border-b border-blue-500/30 pb-4 mb-6 inline-block tracking-widest text-blue-300">Total Score</h4>
                            <div className="text-8xl font-black mb-4 tracking-tighter drop-shadow-2xl text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400">{matrixData.pulse}</div>
                            <div className="text-sm font-bold uppercase tracking-wide bg-blue-500/20 text-blue-300 rounded px-3 py-1 inline-block border border-blue-500/30">{data.stats.priorityLabel}</div>
                        </div>
                        {/* Background Deco */}
                        <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default Analytics;
