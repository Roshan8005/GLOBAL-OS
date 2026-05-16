import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Terminal, Folder, Settings, Monitor, 
  X, Minus, Square, Search, 
  Wifi, Battery, Cpu, Hexagon,
  Bot, Clock, Activity, HardDrive,
  ChevronRight, ArrowUpRight, Code,
  Layout, Shield, Smartphone, Layers,
  TerminalSquare
} from 'lucide-react';

// Apps definition
const APPS = {
  devportal: { id: 'devportal', title: 'Architecture Hub', icon: Code, color: 'text-blue-400' },
  terminal: { id: 'terminal', title: 'Terminal', icon: Terminal, color: 'text-emerald-400' },
  monitor: { id: 'monitor', title: 'System Monitor', icon: Activity, color: 'text-purple-400' },
  files: { id: 'files', title: 'File Manager', icon: Folder, color: 'text-amber-400' },
  ai: { id: 'ai', title: 'Global AI', icon: Bot, color: 'text-teal-400' },
};

type AppId = keyof typeof APPS;

interface WindowState {
  id: string;
  appId: AppId;
  title: string;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
}

export default function App() {
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const [highestZIndex, setHighestZIndex] = useState(10);
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    // Open Dev Portal by default
    openApp('devportal');
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const openApp = (appId: AppId) => {
    const existingWindow = windows.find(w => w.appId === appId);
    if (existingWindow) {
      focusWindow(existingWindow.id);
      if (existingWindow.isMinimized) {
        toggleMinimize(existingWindow.id);
      }
      return;
    }

    const newId = `${appId}-${Date.now()}`;
    const newZ = highestZIndex + 1;
    setHighestZIndex(newZ);
    
    setWindows(prev => [...prev, {
      id: newId,
      appId,
      title: APPS[appId].title,
      isMinimized: false,
      isMaximized: false,
      zIndex: newZ,
    }]);
    setActiveWindowId(newId);
    setStartMenuOpen(false);
  };

  const closeWindow = (id: string) => {
    setWindows(prev => prev.filter(w => w.id !== id));
    if (activeWindowId === id) setActiveWindowId(null);
  };

  const focusWindow = (id: string) => {
    if (activeWindowId === id) return;
    const newZ = highestZIndex + 1;
    setHighestZIndex(newZ);
    setWindows(prev => prev.map(w => w.id === id ? { ...w, zIndex: newZ } : w));
    setActiveWindowId(id);
  };

  const toggleMinimize = (id: string) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, isMinimized: !w.isMinimized } : w));
  };

  const toggleMaximize = (id: string) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, isMaximized: !w.isMaximized } : w));
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#0A0C10] text-slate-300 font-sans overflow-hidden selection:bg-blue-500/30 selection:text-white relative">
      {/* Background layer */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#3b82f6 1px, transparent 1px)', backgroundSize: '32px 32px', backgroundPosition: 'center center' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none flex flex-col items-center">
            <Hexagon className="w-96 h-96 text-blue-500" strokeWidth={1} />
        </div>
      </div>

      {/* Desktop Area */}
      <div className="flex-1 relative z-10 overflow-hidden" onClick={() => setStartMenuOpen(false)}>
        {/* Desktop Icons */}
        <div className="absolute top-6 left-6 flex flex-col gap-6">
          {Object.entries(APPS).map(([appId, app]) => (
            <button
              key={appId}
              onDoubleClick={() => openApp(appId as AppId)}
              className="flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-slate-800/40 w-24 group transition-colors"
            >
              <div className={`w-14 h-14 rounded-xl bg-[#15181F] border border-slate-700/50 flex items-center justify-center shadow-lg group-hover:border-slate-500/50 group-hover:bg-slate-800 transition-all`}>
                <app.icon className={`w-7 h-7 ${app.color}`} />
              </div>
              <span className="text-[11px] text-slate-300 font-medium text-center leading-tight drop-shadow-md">
                {app.title}
              </span>
            </button>
          ))}
        </div>

        {/* Windows */}
        <AnimatePresence>
          {windows.map(win => !win.isMinimized && (
            <Window
              key={win.id}
              windowState={win}
              onClose={() => closeWindow(win.id)}
              onFocus={() => focusWindow(win.id)}
              onMinimize={() => toggleMinimize(win.id)}
              onMaximize={() => toggleMaximize(win.id)}
              isActive={activeWindowId === win.id}
            >
              {win.appId === 'terminal' && <TerminalApp />}
              {win.appId === 'monitor' && <MonitorApp />}
              {win.appId === 'files' && <FilesApp openApp={(app) => openApp(app as AppId)} />}
              {win.appId === 'ai' && <AiApp />}
              {win.appId === 'devportal' && <DevPortalApp />}
            </Window>
          ))}
        </AnimatePresence>

        {/* Start Menu Overlay */}
        <AnimatePresence>
          {startMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 w-full max-w-[600px] h-[500px] bg-[#0F1117]/95 backdrop-blur-2xl border border-slate-700/50 rounded-2xl shadow-2xl flex flex-col overflow-hidden origin-bottom z-[9999]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Search */}
              <div className="p-6 border-b border-slate-800 bg-[#0A0C10]/50">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search apps, files, or ask AI..."
                    className="w-full bg-[#15181F] border border-slate-700/50 text-white rounded-xl py-3 pl-12 pr-4 outline-none focus:border-blue-500/50 transition-colors font-mono text-sm"
                    autoFocus
                  />
                </div>
              </div>
              
              <div className="flex-1 p-6 flex gap-8 pb-0">
                {/* Apps list */}
                <div className="flex-[2] overflow-y-auto pb-6">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 px-2">Pinned Apps</h3>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                     {Object.entries(APPS).map(([appId, app]) => (
                        <button
                          key={'start-'+appId}
                          onClick={() => openApp(appId as AppId)}
                          className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-slate-800/50 group transition-colors"
                        >
                          <div className={`w-12 h-12 rounded-xl bg-[#1A1E26] border border-slate-700/50 flex items-center justify-center shadow-md group-hover:scale-105 transition-all`}>
                            <app.icon className={`w-6 h-6 ${app.color}`} />
                          </div>
                          <span className="text-[11px] text-slate-300 font-medium text-center">{app.title}</span>
                        </button>
                      ))}
                  </div>
                </div>
                
                {/* System status */}
                <div className="hidden sm:flex flex-1 border-l border-slate-800 pl-8 flex-col pb-6">
                   <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">System</h3>
                   <div className="space-y-4">
                     <div className="bg-[#15181F] p-3 rounded-lg border border-slate-800">
                       <div className="text-[10px] text-slate-500 uppercase font-mono mb-1">CPU Load</div>
                       <div className="flex items-center gap-2">
                         <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
                           <div className="h-full bg-emerald-500 w-[12%]"></div>
                         </div>
                         <span className="text-xs font-mono text-emerald-400">12%</span>
                       </div>
                     </div>
                     <div className="bg-[#15181F] p-3 rounded-lg border border-slate-800">
                       <div className="text-[10px] text-slate-500 uppercase font-mono mb-1">Memory</div>
                       <div className="flex items-center gap-2">
                         <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
                           <div className="h-full bg-blue-500 w-[45%]"></div>
                         </div>
                         <span className="text-xs font-mono text-blue-400">3.6G</span>
                       </div>
                     </div>
                     
                     <div className="bg-blue-900/10 p-3 rounded-lg border border-blue-500/20 mt-auto">
                        <div className="flex items-center gap-2 text-blue-400 mb-1">
                          <Bot className="w-3 h-3" />
                          <span className="text-[10px] uppercase font-mono">AI Scheduler</span>
                        </div>
                        <div className="text-xs text-slate-400">Running efficiently. 4 bg apps sleeping.</div>
                     </div>
                   </div>
                </div>
              </div>
              
              <div className="h-16 border-t border-slate-800 bg-[#0A0C10]/80 flex items-center px-6 justify-between mt-auto">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#15181F] flex items-center justify-center border border-slate-700 shadow-md">
                    <Hexagon className="w-5 h-5 text-slate-400" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-slate-200 leading-tight">Admin User</span>
                    <span className="text-[10px] text-slate-500 font-mono">Local Account</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors" title="Settings">
                    <Settings className="w-5 h-5" />
                  </button>
                  <button className="p-2 hover:bg-red-900/30 rounded-lg text-slate-400 hover:text-red-400 transition-colors" title="Power Options">
                    <Minus className="w-5 h-5 rotate-90" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Taskbar */}
      <div className="h-14 border-t border-slate-800 bg-[#0F1117]/80 backdrop-blur-xl relative z-[1000] flex items-center px-3 justify-between shrink-0 shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-2 h-full">
          {/* Start Button */}
          <button 
            onClick={() => setStartMenuOpen(!startMenuOpen)}
            className="w-12 h-10 flex items-center justify-center rounded-lg hover:bg-slate-800/80 transition-colors mx-1"
          >
            <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center shadow-lg shadow-blue-900/20">
              <Hexagon className="w-4 h-4 text-white" />
            </div>
          </button>
          
          <div className="w-px h-6 bg-slate-800/80 mx-1"></div>
          
          {/* Open Windows */}
          {windows.map(win => (
            <button
               key={`taskbar-${win.id}`}
              onClick={() => {
                if (activeWindowId === win.id && !win.isMinimized) {
                  toggleMinimize(win.id);
                } else {
                  focusWindow(win.id);
                  if (win.isMinimized) toggleMinimize(win.id);
                }
              }}
              className={`flex items-center gap-2 px-3 py-1.5 mx-0.5 rounded-md transition-all max-w-[160px] ${
                activeWindowId === win.id && !win.isMinimized
                  ? 'bg-slate-800 border-b-2 border-blue-500 shadow-md' // active
                  : win.isMinimized
                    ? 'hover:bg-slate-800/40 border-b-2 border-transparent text-slate-500' // minimized
                    : 'bg-slate-800/40 hover:bg-slate-800/60 border-b-2 border-transparent text-slate-300' // inactive but open
              }`}
            >
              {(() => {
                const Icon = APPS[win.appId].icon;
                return <Icon className={`w-4 h-4 shrink-0 ${activeWindowId === win.id && !win.isMinimized ? APPS[win.appId].color : ''}`} />;
              })()}
              <span className="text-xs truncate font-medium">{win.title}</span>
            </button>
          ))}
        </div>

        {/* System Tray */}
        <div className="flex items-center gap-4 px-4 h-full border-l border-slate-800/50 text-slate-400">
          <button className="flex items-center justify-center w-8 h-8 rounded hover:bg-slate-800 hover:text-slate-200 transition-colors" title="Internet">
            <Wifi className="w-4 h-4" />
          </button>
          <button className="flex items-center justify-center w-8 h-8 rounded hover:bg-slate-800 hover:text-slate-200 transition-colors" title="Battery: 85%">
            <Battery className="w-4 h-4" />
          </button>
          <div className="text-right ml-2 cursor-default select-none group">
            <div className="text-[11px] font-mono text-slate-200 font-medium group-hover:text-blue-400 transition-colors">
              {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="text-[9px] font-mono text-slate-500">
              {time.toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// OS Application Components

function Window({ 
  windowState, 
  children, 
  onClose, 
  onFocus, 
  onMinimize, 
  onMaximize,
  isActive
}: { 
  windowState: WindowState, 
  children: React.ReactNode,
  onClose: () => void,
  onFocus: () => void,
  onMinimize: () => void,
  onMaximize: () => void,
  isActive: boolean
}) {
  const AppIcon = APPS[windowState.appId].icon;
  // Default sizes based on app
  const defaultSize = windowState.appId === 'terminal' 
    ? { width: 650, height: 400 } 
    : windowState.appId === 'monitor' || windowState.appId === 'ai'
    ? { width: 700, height: 500 }
    : windowState.appId === 'devportal'
    ? { width: 950, height: 600 }
    : { width: 850, height: 550 };
  
  return (
    <motion.div
      drag={!windowState.isMaximized}
      dragConstraints={{ left: 0, top: 0, right: window.innerWidth - 100, bottom: window.innerHeight - 100 }}
      dragMomentum={false}
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ 
        opacity: 1, 
        scale: 1, 
        y: 0,
        ...(windowState.isMaximized ? { 
          left: 0, 
          top: 0, 
          width: '100%', 
          height: 'calc(100vh - 56px)',
          borderRadius: 0 
        } : { 
          width: defaultSize.width, 
          height: defaultSize.height,
          borderRadius: 12
        })
      }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.15, type: 'tween' }}
      onPointerDown={onFocus}
      style={{ zIndex: windowState.zIndex, position: 'absolute' }}
      // Stagger slightly if multiple Windows to avoid exact overlap perfectly
      className={`top-10 left-10 md:top-20 md:left-24 bg-[#0F1117] flex flex-col overflow-hidden border shadow-2xl ${
        isActive ? 'border-slate-600/80 shadow-[0_20px_60px_rgba(0,0,0,0.6)] ring-1 ring-white/10' : 'border-slate-800/80'
      }`}
    >
      {/* Title Bar */}
      <div 
        className={`h-11 flex items-center justify-between px-4 select-none shrink-0 border-b ${
          isActive ? 'bg-[#15181F] border-slate-800' : 'bg-[#0A0C10] border-transparent'
        }`}
        style={{ cursor: windowState.isMaximized ? 'default' : 'move' }}
        onDoubleClick={onMaximize}
      >
        <div className="flex items-center gap-3">
          <AppIcon className={`w-4 h-4 ${isActive ? APPS[windowState.appId].color : 'text-slate-500'}`} />
          <span className={`text-xs font-semibold tracking-wide ${isActive ? 'text-slate-200' : 'text-slate-500'}`}>
            {windowState.title}
          </span>
        </div>
        
        {/* Window Controls */}
        <div className="flex items-center gap-1.5 cursor-default">
          <button 
            onClick={(e) => { e.stopPropagation(); onMinimize(); }}
            className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onMaximize(); }}
            className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <Square className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-red-500/90 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Window Content */}
      <div className="flex-1 overflow-hidden relative">
        {children}
        {!isActive && (
          <div className="absolute inset-0 bg-transparent" /> // Capture clicks when inactive
        )}
      </div>
    </motion.div>
  );
}

// -------------------------------------------------------------
// APP: Dev Portal (Architecture Hub)
// -------------------------------------------------------------
function DevPortalApp() {
  const [activeTab, setActiveTab] = useState(0);

  const TABS = [
    { title: "System Architecture", icon: Layers },
    { title: "Folder Structure", icon: Folder },
    { title: "3-Year Roadmap", icon: Clock },
    { title: "UI Shell (Wayland)", icon: Layout },
    { title: "AI Engine", icon: Bot },
    { title: "Chromium Core", icon: Monitor },
    { title: "Automation Engine", icon: TerminalSquare },
    { title: "Security System", icon: Shield },
    { title: "Windows Comp.", icon: Settings },
    { title: "Android Layer", icon: Smartphone },
  ];

  return (
    <div className="h-full w-full flex bg-[#0A0C10] text-slate-300">
      {/* Sidebar */}
      <div className="w-56 border-r border-slate-800 bg-[#0F1117] flex flex-col p-3 overflow-y-auto shrink-0">
        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 px-3 py-2 mb-2 border-b border-slate-800 pb-3">OS Blueprint</div>
        <div className="flex flex-col gap-1">
          {TABS.map((tab, idx) => (
            <button
              key={idx}
              onClick={() => setActiveTab(idx)}
              className={`flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors text-left ${
                activeTab === idx 
                  ? 'bg-blue-900/20 text-blue-400 font-medium border border-blue-500/20' 
                  : 'hover:bg-slate-800/50 text-slate-400'
              }`}
            >
              <tab.icon className={`w-4 h-4 ${activeTab === idx ? 'text-blue-400' : 'text-slate-500'}`} />
              <span className="truncate">{tab.title}</span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Content pane */}
      <div className="flex-1 overflow-y-auto bg-[#0A0C10] p-8">
        <div className="max-w-3xl mx-auto space-y-6">
          {activeTab === 0 && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h2 className="text-2xl font-light text-white mb-6 border-b border-slate-800 pb-4">1. System Architecture</h2>
              <div className="bg-[#15181F] border border-slate-800 rounded-xl p-6 font-mono text-sm space-y-4 shadow-sm">
                <div className="text-slate-400">Design the full modular OS architecture:</div>
                <div className="p-5 bg-[#0A0C10] rounded-lg border border-slate-800/80 leading-relaxed shadow-inner">
                  <span className="text-blue-400">UI Shell</span><span className="text-slate-500"> (Global UI - Wayland / C++)</span><br/>
                  <span className="text-emerald-400">AI Core</span><span className="text-slate-500"> (Resource Scheduler - Python/Rust)</span><br/>
                  <span className="text-purple-400">Updater</span><span className="text-slate-500"> (A/B Partition - Rust)</span><br/>
                  <span className="text-amber-400">Package Manager</span><span className="text-slate-500"> (Universal App Layer)</span><br/>
                  <span className="text-pink-400">Service Engine</span><span className="text-slate-500"> (Dynamic Load - Rust)</span><br/>
                  <span className="text-teal-400">HAL</span><span className="text-slate-500"> (Hardware Abstraction)</span><br/>
                  <span className="text-red-400">Kernel Layer</span><span className="text-slate-500"> (Linux Kernel Base)</span>
                </div>
                <p className="text-slate-400 pt-2 font-sans text-sm border-t border-slate-800/50">
                  <strong className="text-slate-200">Target:</strong> Maintain 500MB–1GB idle RAM while supporting the complete stack. Highly modular design allows unneeded services to sleep or freeze. Boot target: 5-seconds.
                </p>
              </div>
            </div>
          )}

          {activeTab === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h2 className="text-2xl font-light text-white mb-6 border-b border-slate-800 pb-4">2. Folder Structure</h2>
              <div className="bg-[#15181F] border border-slate-800 rounded-xl p-6 font-mono text-sm shadow-sm">
                <div className="text-slate-400 mb-4 font-sans">Enterprise-grade OS folder structure for rapid scaling:</div>
                <pre className="text-emerald-400 bg-[#0A0C10] p-5 rounded-lg border border-slate-800/80 overflow-x-auto shadow-inner leading-relaxed">
global-os/
 ├── kernel/          # Linux kernel base & custom patches
 ├── shell/           # Global UI desktop environment (Wayland)
 ├── ai-core/         # AI-native resource scheduler
 ├── drivers/         # Hardware support & ALSA/Mesa
 ├── compatibility/   # Windows (Wine/Proton) & Android containers
 ├── browser/         # Chromium integration
 ├── updater/         # A/B silent update system
 ├── cloud/           # Cloud sync services
 └── docs/            # Developer blueprints
                </pre>
              </div>
            </div>
          )}

          {activeTab === 2 && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h2 className="text-2xl font-light text-white mb-6 border-b border-slate-800 pb-4">3. Development Roadmap</h2>
              <div className="grid gap-4">
                {[
                  { phase: "Phase 1: Foundation", desc: "Linux base, custom boot logo, lightweight desktop, package manager." },
                  { phase: "Phase 2: Core UX", desc: "Custom shell (Wayland), Chromium browser integration, AI scheduler baseline." },
                  { phase: "Phase 3: Universal Apps", desc: "Windows app compatibility (Wine/Proton), Android layer containers." },
                  { phase: "Phase 4: AI & Auto", desc: "OS-level automation framework, local AI assistant, deeper RAM optimization." },
                  { phase: "Phase 5: Refinement", desc: "Gaming optimization, A/B updates mechanism, enterprise security lockdown." }
                ].map((item, i) => (
                  <div key={i} className="bg-[#15181F] border border-slate-800 rounded-xl p-5 flex gap-4 shadow-sm">
                     <div className="w-8 h-8 rounded-full bg-blue-900/20 text-blue-400 flex items-center justify-center font-bold border border-blue-500/20 shrink-0">{i+1}</div>
                     <div>
                       <h3 className="text-slate-200 font-semibold mb-1">{item.phase}</h3>
                       <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                     </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 3 && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h2 className="text-2xl font-light text-white mb-6 border-b border-slate-800 pb-4">4. UI System</h2>
              <div className="bg-[#15181F] border border-slate-800 rounded-xl p-6 space-y-4 shadow-sm">
                <p className="text-slate-300 leading-relaxed">A lightweight, GPU-accelerated desktop shell designed using Rust and Wayland. Focuses on beginner-friendly UI with zero-lag interactions.</p>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="p-5 bg-[#0A0C10] border border-slate-800 rounded-lg shadow-inner">
                    <Layout className="w-6 h-6 text-blue-400 mb-3" />
                    <h4 className="text-slate-200 font-medium mb-1">Window Manager</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">Tiling/floating compositor optimized for 60fps+ on low-end hardware.</p>
                  </div>
                  <div className="p-5 bg-[#0A0C10] border border-slate-800 rounded-lg shadow-inner">
                    <Settings className="w-6 h-6 text-blue-400 mb-3" />
                    <h4 className="text-slate-200 font-medium mb-1">Taskbar & Settings</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">Built in Rust/C++ for zero-lag UI interactions and minimal RAM footprint.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 4 && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h2 className="text-2xl font-light text-white mb-6 border-b border-slate-800 pb-4">5. AI Engine</h2>
              <div className="bg-[#15181F] border border-slate-800 rounded-xl p-6 shadow-sm">
                <p className="text-slate-300 mb-6 leading-relaxed">The core of Global OS. An AI-native resource scheduler built with Python/Rust that intelligently manages the system state.</p>
                <ul className="space-y-4 font-mono text-sm text-emerald-400 bg-[#0A0C10] p-5 rounded-lg border border-slate-800/80 shadow-inner">
                  <li className="flex items-center gap-3"><span className="text-slate-600">→</span> Smart RAM Cleanup & Paging</li>
                  <li className="flex items-center gap-3"><span className="text-slate-600">→</span> Predictive Process Freezing</li>
                  <li className="flex items-center gap-3"><span className="text-slate-600">→</span> Intelligent Thermal Balancing</li>
                  <li className="flex items-center gap-3"><span className="text-slate-600">→</span> Event-Driven Battery Optimization</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab >= 5 && activeTab <= 9 && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h2 className="text-2xl font-light text-white mb-6 border-b border-slate-800 pb-4">
                {TABS[activeTab].title}
              </h2>
              <div className="bg-[#15181F] border border-slate-800 rounded-xl p-6 shadow-sm leading-relaxed">
                {activeTab === 5 && <p className="text-slate-300">Design a Chromium-based browser core deeply integrated into the OS. Powers the PWA engine, sandboxing, and exposes extension APIs directly to the OS shell for seamless web-apps.</p>}
                {activeTab === 6 && <p className="text-slate-300">Create an OS-level automation framework similar to Playwright and Power Automate. Features browser automation, file watchers, and powerful scripting APIs natively integrated.</p>}
                {activeTab === 7 && <p className="text-slate-300">Design a ChromeOS-inspired security architecture. Implements verified boot, immutable partitions, A/B seamless updates, encrypted storage, and strict sandboxing for non-native apps.</p>}
                {activeTab === 8 && <p className="text-slate-300">Design the Windows application compatibility system leveraging Wine, Proton, and DXVK. Ensures EXE support, DirectX translation, and extensive gaming optimization via system-level tweaks and drivers.</p>}
                {activeTab === 9 && <p className="text-slate-300">Design an Android container runtime system utilizing Waydroid principles. Provides APK support, touch API translation, and isolated sandboxing to securely run the mobile ecosystem natively on desktop.</p>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// APP: Terminal
// -------------------------------------------------------------
function TerminalApp() {
  const [history, setHistory] = useState<string[]>([
    'Global OS v0.1 AI-Native Environment',
    'Root access granted. Secure boot verified.',
    'Type "help" for a list of available commands.'
  ]);
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const newCmd = `user@global-os:~$ ${input}`;
      const res = processCommand(input);
      setHistory(prev => [...prev, newCmd, ...res]);
      setInput('');
    }
  };

  const processCommand = (cmd: string) => {
    const trimmed = cmd.trim().toLowerCase();
    if (!trimmed) return [];
    switch (trimmed) {
      case 'help': return ['Available commands:', '  help    - Show this help', '  clear   - Clear terminal', '  sysinfo - Show system info', '  ai      - Invoke AI scheduler check'];
      case 'clear': setTimeout(() => setHistory([]), 10); return [];
      case 'sysinfo': return ['Kernel: Linux Base', 'Shell: Global UI (Wayland/Rust)', 'AI Core: Active (idle state)', 'Memory: 542MB / 8.0GB', 'Uptime: 00:15:32'];
      case 'ai': return ['[AI Scheduler]', 'Optimizing priority queues...', 'Sleeping background tasks: 12', 'VRAM allocated for inference: 512MB'];
      default: return [`command not found: ${trimmed}`];
    }
  };

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  return (
    <div className="h-full w-full bg-[#0A0C10] p-6 text-[13px] font-mono text-emerald-400/90 overflow-y-auto flex flex-col" onClick={() => document.getElementById('term-input')?.focus()}>
      {history.map((line, i) => (
        <div key={i} className="mb-1.5 leading-relaxed" style={{ color: line.startsWith('user@') ? '#f8fafc' : undefined }}>{line}</div>
      ))}
      <div className="flex gap-2 items-center mt-2">
        <span className="text-slate-100 font-bold">user@global-os:~$</span>
        <input 
          id="term-input"
          autoFocus
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent outline-none border-none text-emerald-400 font-bold"
          autoComplete="off"
        />
      </div>
      <div ref={endRef} />
    </div>
  );
}

// -------------------------------------------------------------
// APP: System Monitor
// -------------------------------------------------------------
function MonitorApp() {
  const [cpu, setCpu] = useState<number[]>(Array(20).fill(0));
  const [ram, setRam] = useState(542);

  useEffect(() => {
    const timer = setInterval(() => {
      setCpu(prev => {
        const next = [...prev.slice(1), Math.random() * 30 + 5]; // 5% - 35% utilization
        return next;
      });
      setRam(prev => {
        const diff = Math.floor(Math.random() * 20 - 10);
        return Math.max(500, Math.min(1200, prev + diff));
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="h-full w-full bg-[#0A0C10] flex flex-col p-6 gap-6 text-slate-300 overflow-y-auto">
      <div className="flex items-center justify-between border-b border-slate-800 pb-5">
        <div>
          <h2 className="text-2xl font-light text-white tracking-tight">System Integrity</h2>
          <p className="text-xs text-slate-500 font-mono mt-1 pt-1">Uptime: 02h 45m 12s | Thread Count: 412</p>
        </div>
        <div className="flex gap-8">
          <div className="text-center">
            <div className="text-3xl font-mono font-light text-white">{ram}<span className="text-sm text-slate-500 ml-1">MB</span></div>
            <div className="text-[10px] uppercase tracking-widest text-slate-500 mt-1">Idle RAM</div>
          </div>
          <div className="w-px h-12 bg-slate-800 mt-1"></div>
          <div className="text-center">
            <div className="text-3xl font-mono font-light text-white">{cpu[cpu.length-1].toFixed(1)}<span className="text-sm text-slate-500 ml-1">%</span></div>
            <div className="text-[10px] uppercase tracking-widest text-slate-500 mt-1">CPU Load</div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-3 min-h-[150px]">
        <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest px-1">CPU History</h3>
        <div className="flex-1 bg-[#15181F] border border-slate-800 rounded-xl p-4 flex items-end justify-between gap-1 relative overflow-hidden shadow-inner">
          <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'linear-gradient(0deg, transparent 24px, #3b82f6 25px)', backgroundSize: '100% 25px' }}></div>
          {cpu.map((val, i) => (
             <motion.div 
               key={i} 
               initial={false}
               animate={{ height: `${val}%` }}
               transition={{ type: "spring", bounce: 0, duration: 0.5 }}
               className="flex-1 bg-emerald-500/80 rounded-t-sm relative z-10" 
             />
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-2">
        <div className="bg-[#15181F] p-5 rounded-xl border border-slate-800 shadow-md">
           <div className="flex items-center gap-3 mb-4">
             <div className="p-2 bg-blue-900/20 rounded-md">
               <Cpu className="w-4 h-4 text-blue-400" />
             </div>
             <span className="text-sm font-semibold text-slate-200">Processes</span>
           </div>
           <div className="space-y-3 text-[13px] font-mono">
             <div className="flex justify-between items-center"><span className="text-slate-400">ai-scheduler-daemon</span><span className="text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">0.2%</span></div>
             <div className="flex justify-between items-center"><span className="text-slate-400">wayland-compositor</span><span className="text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">1.5%</span></div>
             <div className="flex justify-between items-center"><span className="text-slate-400">systemd</span><span className="text-slate-500">0.0%</span></div>
           </div>
        </div>
        <div className="bg-[#15181F] p-5 rounded-xl border border-slate-800 shadow-md">
           <div className="flex items-center gap-3 mb-4">
             <div className="p-2 bg-purple-900/20 rounded-md">
               <HardDrive className="w-4 h-4 text-purple-400" />
             </div>
             <span className="text-sm font-semibold text-slate-200">Storage</span>
           </div>
           <div className="space-y-4 text-xs">
             <div>
               <div className="flex justify-between mb-2"><span className="text-slate-400 font-mono">/root</span><span className="font-mono text-slate-300">14GB / 32GB</span></div>
               <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-blue-500 w-[45%] rounded-full"></div></div>
             </div>
             <div>
               <div className="flex justify-between mb-2"><span className="text-slate-400 font-mono">/home</span><span className="font-mono text-slate-300">120GB / 512GB</span></div>
               <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-purple-500 w-[23%] rounded-full"></div></div>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// APP: File Explorer
// -------------------------------------------------------------
function FilesApp({ openApp }: { openApp: (app: string) => void }) {
  const folders = ['Documents', 'Downloads', 'Pictures', 'Music', 'Projects', 'GlobalOS-Dev'];
  
  return (
    <div className="h-full w-full flex bg-[#0A0C10] text-slate-300">
      <div className="w-56 border-r border-slate-800 bg-[#0F1117] flex flex-col p-3 gap-1 overflow-y-auto">
        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 px-3 py-2 mt-2 mb-1">Places</div>
        <button className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg bg-blue-900/20 text-blue-400 font-medium"><Folder className="w-4 h-4" /> Home</button>
        <button className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-slate-800/50 text-slate-400 transition-colors"><Monitor className="w-4 h-4" /> Desktop</button>
        <button className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-slate-800/50 text-slate-400 transition-colors"><HardDrive className="w-4 h-4" /> System Hub</button>
        
        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 px-3 py-2 mt-6 mb-1">Network</div>
        <button className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-slate-800/50 text-slate-400 transition-colors"><Wifi className="w-4 h-4" /> Cloud Drive</button>
      </div>
      
      <div className="flex-1 flex flex-col bg-[#0A0C10]">
        <div className="h-14 border-b border-slate-800 bg-[#15181F] flex items-center px-4 gap-4 shrink-0 shadow-sm z-10">
           <div className="flex items-center text-slate-400 font-mono text-sm gap-2">
             <span>~</span>
             <ChevronRight className="w-4 h-4 text-slate-600" />
             <span className="text-slate-200 font-medium">Home</span>
           </div>
        </div>
        
        <div className="flex-1 p-6 grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-6 content-start overflow-y-auto">
          {folders.map(f => (
            <div key={f} className="flex flex-col items-center gap-3 p-4 rounded-xl hover:bg-slate-800/40 cursor-pointer group transition-colors">
              <Folder className="w-14 h-14 text-amber-500/80 group-hover:text-amber-400 transition-colors drop-shadow-md" fill="currentColor" strokeWidth={1} />
              <span className="text-xs text-center font-medium text-slate-300 group-hover:text-white truncate w-full">{f}</span>
            </div>
          ))}
          <div 
             className="flex flex-col items-center gap-3 p-4 rounded-xl hover:bg-slate-800/40 cursor-pointer group transition-colors relative"
             onDoubleClick={() => openApp('devportal')}
          >
            <div className="w-14 h-14 bg-[#1A1E26] rounded-lg text-slate-300 flex items-center justify-center font-mono text-xs border border-slate-700 shadow-md group-hover:border-blue-500/50 transition-colors relative">
               <Code className="w-6 h-6 text-blue-400" />
               <div className="absolute -bottom-1 -right-1 bg-blue-600 border border-slate-800 rounded shadow-sm">
                 <ArrowUpRight className="w-3 h-3 p-0.5 text-white" />
               </div>
            </div>
            <span className="text-xs text-center font-medium text-slate-300 group-hover:text-white truncate w-full leading-tight">Architecture<br/>Hub</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// APP: AI Assistant
// -------------------------------------------------------------
function AiApp() {
  return (
    <div className="h-full w-full bg-[#0A0C10] flex flex-col text-slate-300 relative overflow-hidden">
      <div className="absolute top-0 w-full h-full bg-gradient-to-b from-teal-500/10 to-transparent pointer-events-none z-0" />
      
      <div className="flex-1 p-8 flex flex-col items-center justify-center relative z-10 overflow-y-auto">
        <div className="w-24 h-24 bg-teal-500/10 rounded-3xl border border-teal-500/30 flex items-center justify-center mb-8 shadow-[0_0_60px_rgba(20,184,166,0.15)] relative">
          <div className="absolute inset-0 border border-teal-400/50 rounded-3xl animate-ping opacity-20"></div>
          <Bot className="w-12 h-12 text-teal-400" />
        </div>
        <h2 className="text-3xl font-light text-white mb-4 tracking-tight">Global AI Assistant</h2>
        <p className="text-base text-slate-400 max-w-md text-center mb-10 leading-relaxed">
          The AI Core is actively managing system resources. Awaiting your architectural or system commands.
        </p>
        
        <div className="w-full max-w-xl bg-[#15181F] border border-slate-800 rounded-2xl p-5 flex flex-col gap-4 shadow-xl">
          <div className="text-[11px] font-bold font-mono text-slate-500 uppercase tracking-widest px-1 pb-2 border-b border-slate-800/50">Status Logs_</div>
          <div className="space-y-3">
             <div className="flex items-start gap-4 text-sm px-3 py-2.5 rounded-lg bg-[#0A0C10] border border-slate-800/80">
               <span className="w-2.5 h-2.5 rounded-full bg-teal-500 mt-1 shrink-0 shadow-[0_0_8px_rgba(20,184,166,0.6)]"></span>
               <span className="font-mono text-slate-300 text-[13px] leading-snug">Memory prediction model running. Freed <span className="text-teal-400">142MB</span> of cold cache.</span>
             </div>
             <div className="flex items-start gap-4 text-sm px-3 py-2.5 rounded-lg bg-[#0A0C10] border border-slate-800/80">
               <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1 shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></span>
               <span className="font-mono text-slate-300 text-[13px] leading-snug">Battery optimization applied. Background PWA service suspended.</span>
             </div>
             <div className="flex items-start gap-4 text-sm px-3 py-2.5 rounded-lg bg-[#0A0C10] border border-slate-800/80 opacity-60">
               <span className="w-2.5 h-2.5 rounded-full bg-slate-600 mt-1 shrink-0"></span>
               <span className="font-mono text-slate-400 text-[13px] leading-snug">Awaiting user context...</span>
             </div>
          </div>
        </div>
      </div>
      
      <div className="p-4 border-t border-slate-800 bg-[#0F1117] flex justify-center relative z-10 shrink-0">
        <div className="w-full max-w-3xl relative">
          <Bot className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-teal-500 opacity-60" />
          <input 
            type="text" 
            placeholder="Ask the system assistant..." 
            className="w-full bg-[#15181F] border border-slate-700/50 text-white rounded-xl py-4 pl-12 pr-6 outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20 transition-all text-[15px] shadow-inner"
          />
        </div>
      </div>
    </div>
  );
}
