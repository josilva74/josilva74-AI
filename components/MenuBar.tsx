
import React, { useState, useEffect } from 'react';
import { 
  File, Edit2, Play, Download, Upload, Save, 
  FolderPlus, Settings, HelpCircle, ChevronDown, 
  Layers, Image as ImageIcon, Video, Mic, 
  Eye, Monitor, Trash2, Edit3, MessageSquare, 
  Info, Sparkles, Wand2, Maximize, Layout,
  History, Share2, Terminal, Cpu, Zap
} from 'lucide-react';
import Tooltip from './Tooltip';

interface MenuBarProps {
  onNew: () => void;
  onSave: () => void;
  onLoad: () => void;
  onImport: () => void;
  onExport: () => void;
  onStudioAction: (type: string) => void;
  onAssetAction: (action: 'PROPERTIES' | 'RENAME' | 'DELETE') => void;
  onViewToggle: (panel: 'SIDEBAR' | 'CONTROL' | 'TIMELINE') => void;
  onOpenHelp: () => void;
  panels: { sidebar: boolean, control: boolean, timeline: boolean };
}

const MenuBar: React.FC<MenuBarProps> = ({ 
  onNew, onSave, onLoad, onImport, onExport, 
  onStudioAction, onAssetAction, onViewToggle, onOpenHelp, panels 
}) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleGlobalClick = () => setActiveMenu(null);
    if (activeMenu) {
      // Fix: Use window as any to satisfy TypeScript when DOM types are missing
      (window as any).addEventListener('click', handleGlobalClick);
    }
    // Fix: Use window as any to satisfy TypeScript when DOM types are missing
    return () => (window as any).removeEventListener('click', handleGlobalClick);
  }, [activeMenu]);

  const menuItems = [
    {
      label: 'File',
      items: [
        { label: 'New Project', icon: <File size={14}/>, action: onNew, shortcut: 'Ctrl+N' },
        { label: 'Open Project...', icon: <Download size={14}/>, action: onLoad, shortcut: 'Ctrl+O' },
        { label: 'Save Project', icon: <Save size={14}/>, action: onSave, shortcut: 'Ctrl+S' },
        { label: 'Save As...', action: () => {}, shortcut: 'Shift+S' },
        { divider: true },
        { label: 'Import Media', icon: <Upload size={14}/>, action: onImport, shortcut: 'Ctrl+I' },
        { label: 'Export Current Frame', icon: <ImageIcon size={14}/>, action: onExport },
        { label: 'Export Sequence...', icon: <Layers size={14}/>, action: onExport, shortcut: 'Ctrl+E' },
        { divider: true },
        { label: 'Project Settings...', icon: <Settings size={14}/>, action: () => {} },
      ]
    },
    {
      label: 'Edit',
      items: [
        { label: 'Undo', icon: <History size={14} className="rotate-180"/>, action: () => {}, shortcut: 'Ctrl+Z' },
        { label: 'Redo', icon: <History size={14}/>, action: () => {}, shortcut: 'Ctrl+Y' },
        { divider: true },
        { label: 'Cut', action: () => {}, shortcut: 'Ctrl+X' },
        { label: 'Copy', action: () => {}, shortcut: 'Ctrl+C' },
        { label: 'Paste', action: () => {}, shortcut: 'Ctrl+V' },
        { divider: true },
        { label: 'Select All', action: () => {}, shortcut: 'Ctrl+A' },
        { label: 'Deselect', action: () => {}, shortcut: 'Ctrl+D' },
      ]
    },
    {
      label: 'Studio',
      items: [
        { label: 'Image Forge', icon: <ImageIcon size={14} className="text-blue-400"/>, action: () => onStudioAction('IMAGE'), description: 'Pro Image Generation' },
        { label: 'Video Synthesizer', icon: <Video size={14} className="text-purple-400"/>, action: () => onStudioAction('VIDEO'), description: 'Veo Video Engine' },
        { label: 'Voice Architect', icon: <Mic size={14} className="text-green-400"/>, action: () => onStudioAction('AUDIO'), description: 'Text-to-Speech' },
        { label: 'Cognition Hub', icon: <MessageSquare size={14} className="text-amber-400"/>, action: () => onStudioAction('CHAT'), description: 'LLM Thinking & Search' },
        { divider: true },
        { label: 'Live Voice Session', icon: <Zap size={14} className="text-blue-500 animate-pulse"/>, action: () => onStudioAction('LIVE_VOICE') },
        { label: 'Batch Processor', icon: <Cpu size={14}/>, action: () => {} },
      ]
    },
    {
      label: 'Asset',
      items: [
        { label: 'Inspector', icon: <Info size={14}/>, action: () => onAssetAction('PROPERTIES'), shortcut: 'Alt+P' },
        { label: 'Rename', icon: <Edit3 size={14}/>, action: () => onAssetAction('RENAME'), shortcut: 'F2' },
        { label: 'Tag Asset', icon: <Wand2 size={14}/>, action: () => {} },
        { divider: true },
        { label: 'Move to Folder...', icon: <FolderPlus size={14}/>, action: () => {} },
        { label: 'Reveal in Library', icon: <Eye size={14}/>, action: () => {} },
        { divider: true },
        { label: 'Delete Permanently', icon: <Trash2 size={14} className="text-red-400"/>, action: () => onAssetAction('DELETE'), shortcut: 'Del' },
      ]
    },
    {
      label: 'View',
      items: [
        { label: `${panels.sidebar ? 'Hide' : 'Show'} Explorer`, icon: <Layout size={14}/>, action: () => onViewToggle('SIDEBAR'), shortcut: 'F9' },
        { label: `${panels.control ? 'Hide' : 'Show'} Inspector`, icon: <Monitor size={14}/>, action: () => onViewToggle('CONTROL'), shortcut: 'F10' },
        { label: `${panels.timeline ? 'Hide' : 'Show'} Timeline`, icon: <Play size={14}/>, action: () => onViewToggle('TIMELINE'), shortcut: 'F11' },
        { divider: true },
        { label: 'Reset Workspace', action: () => {} },
        { label: 'Toggle Fullscreen', icon: <Maximize size={14}/>, action: () => {
          // Fix: Use window.document to satisfy TypeScript when DOM types are missing
          const doc = (window as any).document;
          if (!doc.fullscreenElement) doc.documentElement.requestFullscreen();
          else doc.exitFullscreen();
        }, shortcut: 'F11' },
      ]
    },
    {
      label: 'Help',
      items: [
        { label: 'Aether Documentation', icon: <HelpCircle size={14}/>, action: onOpenHelp },
        { label: 'Release Notes', action: () => {} },
        { divider: true },
        { label: 'API Status', icon: <Zap size={14} className="text-green-500"/>, action: () => {} },
        { label: 'Keyboard Shortcuts', icon: <Terminal size={14}/>, action: onOpenHelp },
        { label: 'About Aether Studio', action: () => {} },
      ]
    }
  ];

  return (
    <div className="h-10 bg-slate-900 border-b border-slate-700/50 flex items-center px-3 text-[11px] select-none relative z-[100] shadow-lg">
      <div className="flex items-center gap-2 mr-6 px-1 group cursor-pointer">
        <div className="w-5 h-5 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
          <Zap size={12} className="text-white fill-current"/>
        </div>
        <span className="font-black text-slate-100 uppercase tracking-[0.25em]">Aether</span>
      </div>

      <div className="flex gap-0.5 h-full">
        {menuItems.map((menu) => (
          <div 
            key={menu.label}
            className="relative h-full flex items-center"
            onClick={(e) => e.stopPropagation()}
            onMouseEnter={() => activeMenu && setActiveMenu(menu.label)}
          >
            <button 
              onClick={() => setActiveMenu(activeMenu === menu.label ? null : menu.label)}
              className={`px-3.5 h-7 rounded-md transition-all flex items-center gap-1 font-medium ${activeMenu === menu.label ? 'bg-slate-700 text-white shadow-inner' : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'}`}
            >
              {menu.label}
              <ChevronDown size={10} className={`transition-transform duration-200 ${activeMenu === menu.label ? 'rotate-180' : ''}`}/>
            </button>

            {activeMenu === menu.label && (
              <div 
                className="absolute top-full left-0 w-64 bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 rounded-lg shadow-2xl py-1.5 mt-1 z-[110] animate-in fade-in zoom-in-95 duration-100 origin-top-left"
              >
                {menu.items.map((item, idx) => (
                  item.divider ? (
                    <div key={idx} className="h-px bg-slate-700/50 my-1.5 mx-2" />
                  ) : (
                    <button
                      key={idx}
                      onClick={() => {
                        item.action?.();
                        setActiveMenu(null);
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-blue-600 text-slate-300 hover:text-white flex items-center justify-between group transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex-shrink-0 opacity-70 group-hover:opacity-100">{item.icon}</span>
                        <div className="flex flex-col">
                          <span className="font-semibold tracking-wide">{(item as any).label}</span>
                          {(item as any).description && (
                            <span className="text-[9px] opacity-50 group-hover:opacity-80">{(item as any).description}</span>
                          )}
                        </div>
                      </div>
                      <span className="text-[9px] font-mono opacity-40 group-hover:opacity-100">{(item as any).shortcut}</span>
                    </button>
                  )
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex-1"></div>
      
      <div className="flex items-center gap-4 px-2">
        <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-slate-800/50 rounded-full border border-slate-700/50 shadow-inner">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Live Link</span>
        </div>
        
        <div className="flex items-center gap-1">
          <Tooltip text="Notifications" position="bottom">
            <button className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-all">
              <Sparkles size={14}/>
            </button>
          </Tooltip>
          
          <Tooltip text="Settings" position="bottom">
            <button className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-all">
              <Settings size={14}/>
            </button>
          </Tooltip>

          <div className="w-px h-4 bg-slate-800 mx-1"></div>

          <Tooltip text="Share Project" position="bottom">
            <button className="flex items-center gap-2 px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold transition-all shadow-lg active:scale-95 ml-1">
              <Share2 size={12}/>
              <span>Share</span>
            </button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

export default MenuBar;
