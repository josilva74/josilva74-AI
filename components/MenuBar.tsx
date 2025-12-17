import React, { useState } from 'react';
import { File, Edit2, Play, Download, Upload, Save, FolderPlus, Settings, HelpCircle, ChevronDown, Layers, Image as ImageIcon, Video, Mic } from 'lucide-react';
import Tooltip from './Tooltip';

interface MenuBarProps {
  onNew: () => void;
  onSave: () => void;
  onLoad: () => void;
  onImport: () => void;
  onExport: () => void;
  onStudioAction: (type: 'IMAGE' | 'VIDEO' | 'AUDIO') => void;
  onOpenHelp: () => void;
}

const MenuBar: React.FC<MenuBarProps> = ({ onNew, onSave, onLoad, onImport, onExport, onStudioAction, onOpenHelp }) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const menuItems = [
    {
      label: 'File',
      items: [
        { label: 'New Project', icon: <File size={14}/>, action: onNew, shortcut: 'Ctrl+N' },
        { label: 'Save Project', icon: <Save size={14}/>, action: onSave, shortcut: 'Ctrl+S' },
        { label: 'Load Project', icon: <Download size={14}/>, action: onLoad, shortcut: 'Ctrl+O' },
        { divider: true },
        { label: 'Import Media', icon: <Upload size={14}/>, action: onImport, shortcut: 'Ctrl+I' },
        { label: 'Export Final...', icon: <Layers size={14}/>, action: onExport, shortcut: 'Ctrl+E' },
      ]
    },
    {
      label: 'Edit',
      items: [
        { label: 'Undo', action: () => {}, shortcut: 'Ctrl+Z' },
        { label: 'Redo', action: () => {}, shortcut: 'Ctrl+Y' },
        { divider: true },
        { label: 'Cut', action: () => {}, shortcut: 'Ctrl+X' },
        { label: 'Copy', action: () => {}, shortcut: 'Ctrl+C' },
        { label: 'Paste', action: () => {}, shortcut: 'Ctrl+V' },
      ]
    },
    {
      label: 'Studio',
      items: [
        { label: 'Generate Image', icon: <ImageIcon size={14}/>, action: () => onStudioAction('IMAGE') },
        { label: 'Generate Video', icon: <Video size={14}/>, action: () => onStudioAction('VIDEO') },
        { label: 'Voice Synthesis', icon: <Mic size={14}/>, action: () => onStudioAction('AUDIO') },
        { divider: true },
        { label: 'Render All', icon: <Play size={14}/>, action: () => {} },
      ]
    },
    {
      label: 'Help',
      items: [
        { label: 'Documentation', icon: <HelpCircle size={14}/>, action: onOpenHelp },
        { label: 'Shortcuts', action: onOpenHelp },
        { label: 'About Aether', action: () => {} },
      ]
    }
  ];

  return (
    <div className="h-8 bg-slate-900 border-b border-slate-700 flex items-center px-2 text-[11px] select-none relative z-50">
      <div className="flex items-center gap-1 mr-4 px-2">
        <div className="w-4 h-4 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-sm"></div>
        <span className="font-bold text-slate-300">Aether</span>
      </div>

      <div className="flex gap-1 h-full">
        {menuItems.map((menu) => (
          <div 
            key={menu.label}
            className="relative h-full flex items-center"
            onMouseEnter={() => activeMenu && setActiveMenu(menu.label)}
          >
            <button 
              onClick={() => setActiveMenu(activeMenu === menu.label ? null : menu.label)}
              className={`px-3 py-1 rounded-sm transition-colors flex items-center gap-1 ${activeMenu === menu.label ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
            >
              {menu.label}
            </button>

            {activeMenu === menu.label && (
              <div 
                className="absolute top-full left-0 w-48 bg-slate-800 border border-slate-700 rounded-b-md shadow-2xl py-1 mt-0 z-[60]"
                onMouseLeave={() => setActiveMenu(null)}
              >
                {menu.items.map((item, idx) => (
                  item.divider ? (
                    <div key={idx} className="h-px bg-slate-700 my-1 mx-2" />
                  ) : (
                    <button
                      key={idx}
                      onClick={() => {
                        item.action?.();
                        setActiveMenu(null);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-blue-600 text-slate-300 hover:text-white flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-2">
                        {item.icon}
                        <span>{item.label}</span>
                      </div>
                      <span className="text-[9px] text-slate-500 group-hover:text-blue-100">{(item as any).shortcut}</span>
                    </button>
                  )
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex-1"></div>
      
      <div className="flex items-center gap-4 px-4">
        <div className="flex items-center gap-1.5 mr-4">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-slate-500">Live API</span>
        </div>
        
        <Tooltip text="Open Manual" position="bottom">
          <button 
            onClick={onOpenHelp}
            className="text-slate-400 hover:text-blue-400 transition-colors"
          >
            <HelpCircle size={14}/>
          </button>
        </Tooltip>
        
        <Tooltip text="Settings" position="bottom">
          <button className="text-slate-400 hover:text-white">
            <Settings size={14}/>
          </button>
        </Tooltip>
      </div>
    </div>
  );
};

export default MenuBar;