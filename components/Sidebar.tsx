import React from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Settings, 
  BarChart3, 
  ShieldCheck, 
  PlusCircle, 
  BrainCircuit, 
  MessageSquareText, 
  PieChart, 
  FolderKanban, 
  FileJson, 
  ChevronRight,
  Sparkles,
  Microscope
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onReset: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onReset }) => {
  const menuGroups = [
    {
      label: "Intelligence Core",
      items: [
        { id: 'dashboard', label: 'Executive Insights', icon: LayoutDashboard },
        { id: 'chat', label: 'AI Consultant', icon: MessageSquareText },
        { id: 'intelligence', label: 'Knowledge Graph', icon: PieChart },
        { id: 'simulation', label: 'Stochastic Sim', icon: BrainCircuit },
      ]
    },
    {
      label: "Official Documents",
      items: [
        { id: 'kajian', label: 'Kajian Kebutuhan / TOR', icon: FileText },
        { id: 'research', label: 'Dokumen Penelitian', icon: Microscope },
        { id: 'brd', label: 'Business Req (BRD)', icon: FileJson },
        { id: 'charter', label: 'Project Charter (PC)', icon: FolderKanban },
        { id: 'fsd', label: 'Functional Spec (FSD)', icon: FileText },
      ]
    },
    {
      label: "System",
      items: [
        { id: 'admin', label: 'Configuration', icon: Settings },
      ]
    }
  ];

  return (
    <aside className="w-64 bg-govt-blue text-white min-h-screen flex flex-col fixed left-0 top-0 z-50 shadow-2xl border-r border-slate-700/50">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-700/50 flex items-center gap-3 bg-slate-900/20 backdrop-blur-sm">
        <div className="p-2 bg-govt-gold rounded-lg shadow-lg shadow-blue-950/50 ring-1 ring-white/20">
            <ShieldCheck className="w-6 h-6 text-govt-blue" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300">CEISIA 4.0</h1>
          <p className="text-[8px] text-govt-gold tracking-[0.15em] uppercase font-black">X AGDIP X AI Agents</p>
        </div>
      </div>

      {/* New Analysis Button */}
      <div className="p-5">
        <button 
          onClick={onReset}
          className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-white py-3 rounded-xl font-bold transition-all shadow-lg border border-white/10 group active:scale-95"
        >
          <PlusCircle className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300 text-govt-gold" />
          <span className="text-xs uppercase tracking-wider">New Directives</span>
        </button>
      </div>

      {/* Grouped Navigation */}
      <nav className="flex-1 px-4 space-y-8 mt-2 overflow-y-auto pb-8">
        {menuGroups.map((group, idx) => (
          <div key={idx} className="animate-fade-in" style={{ animationDelay: `${idx * 0.1}s` }}>
            <h3 className="px-4 mb-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] opacity-80">
              {group.label}
            </h3>
            <div className="space-y-1">
              {group.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group relative ${
                    activeTab === item.id
                      ? 'bg-gradient-to-r from-white/15 to-transparent text-white border border-white/10 shadow-lg'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {activeTab === item.id && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-govt-gold rounded-r-full shadow-[0_0_8px_#F59E0B]"></div>
                  )}
                  <item.icon className={`w-4.5 h-4.5 transition-colors ${activeTab === item.id ? 'text-govt-gold' : 'text-slate-500 group-hover:text-slate-300'}`} />
                  <span className={`text-sm font-semibold tracking-tight ${activeTab === item.id ? 'translate-x-1' : ''} transition-transform`}>
                    {item.label}
                  </span>
                  {activeTab === item.id && (
                    <ChevronRight className="w-3 h-3 ml-auto text-slate-500 animate-pulse" />
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer System Status */}
      <div className="p-4 border-t border-slate-700/50 bg-slate-900/30">
        <div className="bg-blue-950/40 border border-white/5 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[9px] uppercase font-black text-slate-500 tracking-wider">System Status</p>
            <Sparkles className="w-3 h-3 text-govt-gold animate-pulse-slow" />
          </div>
          <div className="flex items-center gap-2">
            <div className="relative flex h-2 w-2">
              <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></div>
              <div className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></div>
            </div>
            <span className="text-[11px] font-bold text-emerald-400 tracking-tight uppercase">CEISIA 4.0 X AGDIP ACTIVE</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;