import React, { useState, useEffect } from 'react';
import { Asset, MediaType, Folder } from '../types';
import { Image, Video, Music, User, Plus, Users, Folder as FolderIcon, FolderPlus, ChevronRight, ChevronDown, Tag, MoreVertical, X, Settings2, Trash2, Edit3, Move } from 'lucide-react';
import Tooltip from './Tooltip';

interface SidebarProps {
  activeTool: string;
  onToolChange: (tool: any) => void;
  assets: Asset[];
  folders: Folder[];
  onAddFolder: (name: string) => void;
  onUpdateFolder: (id: string, updates: Partial<Folder>) => void;
  onDeleteFolder: (id: string) => void;
  onMoveToFolder: (assetId: string, folderId: string | undefined) => void;
  onDragStart: (e: React.DragEvent, asset: Asset) => void;
  onSelectAsset: (asset: Asset) => void;
  onDeleteAsset: (assetId: string) => void;
  onUpdateAsset: (assetId: string, updates: Partial<Asset>) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeTool, 
  onToolChange, 
  assets, 
  folders, 
  onAddFolder, 
  onUpdateFolder,
  onDeleteFolder,
  onMoveToFolder,
  onDragStart,
  onSelectAsset,
  onDeleteAsset,
  onUpdateAsset
}) => {
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({ 'root': true });
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [assetContextMenu, setAssetContextMenu] = useState<{ x: number, y: number, assetId: string } | null>(null);
  const [folderContextMenu, setFolderContextMenu] = useState<{ x: number, y: number, folderId: string } | null>(null);
  const [dragOverFolder, setDragOverFolder] = useState<string | null>(null);

  useEffect(() => {
    const handleClick = () => {
      setAssetContextMenu(null);
      setFolderContextMenu(null);
    };
    (window as any).addEventListener('click', handleClick);
    return () => (window as any).removeEventListener('click', handleClick);
  }, []);

  const tools = [
    { id: 'generate', label: 'Generator', icon: <Plus size={20} />, tip: 'Create images, video, and more' },
    { id: 'avatar', label: 'Avatars', icon: <User size={20} />, tip: 'Manage digital personas' },
    { id: 'team', label: 'Team', icon: <Users size={20} />, tip: 'Collaborate and comment' },
  ];

  const handleAssetContextMenu = (e: React.MouseEvent, assetId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setAssetContextMenu({ x: e.clientX, y: e.clientY, assetId });
  };

  const handleFolderContextMenu = (e: React.MouseEvent, folderId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setFolderContextMenu({ x: e.clientX, y: e.clientY, folderId });
  };

  const toggleFolder = (id: string) => {
    setExpandedFolders(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      onAddFolder(newFolderName);
      setNewFolderName('');
      setShowNewFolderInput(false);
    }
  };

  const handleDragOver = (e: React.DragEvent, folderId: string | 'root') => {
    e.preventDefault();
    setDragOverFolder(folderId);
  };

  const handleDragLeave = () => {
    setDragOverFolder(null);
  };

  const handleDropOnFolder = (e: React.DragEvent, folderId: string | undefined) => {
    e.preventDefault();
    setDragOverFolder(null);
    const assetData = (e.dataTransfer as any).getData('application/json');
    if (assetData) {
      try {
        const asset = JSON.parse(assetData);
        onMoveToFolder(asset.id, folderId);
      } catch (err) {
        console.error("Failed to parse dropped asset data");
      }
    }
  };

  const renderAssetItem = (asset: Asset) => {
    const commonClasses = "bg-slate-800 rounded-lg border border-slate-700 cursor-grab active:cursor-grabbing hover:border-blue-500 transition-all relative group shadow-sm active:scale-95";
    
    return (
      <Tooltip text={asset.name} position="right" key={asset.id}>
        <div 
          draggable 
          onDragStart={(e) => {
            onDragStart(e, asset);
            (e.dataTransfer as any).setData('application/json', JSON.stringify(asset));
          }}
          onClick={() => onSelectAsset(asset)}
          onContextMenu={(e) => handleAssetContextMenu(e, asset.id)}
          className={`${commonClasses} ${asset.type === MediaType.IMAGE ? 'aspect-square overflow-hidden' : asset.type === MediaType.VIDEO ? 'aspect-video overflow-hidden' : 'p-2.5 flex items-center gap-2'}`}
        >
          {asset.type === MediaType.IMAGE ? (
            <>
              <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </>
          ) : asset.type === MediaType.VIDEO ? (
            <>
              <video src={asset.url} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Video className="text-white" size={16} />
              </div>
            </>
          ) : (
            <>
              <div className="w-8 h-8 bg-slate-700 rounded-md flex items-center justify-center">
                <Music size={14} className="text-green-400" />
              </div>
              <span className="text-[11px] font-bold text-slate-300 truncate w-full">{asset.name}</span>
            </>
          )}
        </div>
      </Tooltip>
    );
  };

  const filterAssetsByFolder = (folderId?: string) => {
    return assets.filter(a => a.folderId === folderId);
  };

  return (
    <div className="w-full bg-slate-900/50 border-r border-slate-700/50 flex flex-col h-full overflow-hidden backdrop-blur-md">
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <h1 className="text-sm font-black uppercase tracking-[0.2em] bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Media Library
        </h1>
      </div>

      <div className="flex border-b border-slate-800 flex-shrink-0 bg-slate-900">
        {tools.map(tool => (
          <Tooltip text={tool.tip} key={tool.id} position="bottom">
            <button
              onClick={() => onToolChange(tool.id)}
              className={`flex-1 w-full py-4 flex flex-col items-center gap-1.5 text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTool === tool.id 
                  ? 'bg-slate-800/80 text-blue-400 border-b-2 border-blue-400' 
                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/20'
              }`}
            >
              {tool.icon}
              {tool.label}
            </button>
          </Tooltip>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.15em]">Groups</h3>
          <Tooltip text="New Folder">
            <button 
              onClick={() => setShowNewFolderInput(true)}
              className="text-slate-500 hover:text-blue-400 transition-colors p-1 bg-slate-800 rounded-md"
            >
              <FolderPlus size={14} />
            </button>
          </Tooltip>
        </div>

        {showNewFolderInput && (
          <div className="bg-slate-800 p-2 rounded-lg border border-blue-500/30 flex gap-2 animate-in zoom-in-95 duration-200">
            <input 
              autoFocus
              className="bg-transparent text-[11px] text-white outline-none flex-1 px-1"
              placeholder="Folder name..."
              value={newFolderName}
              onChange={(e) => setNewFolderName((e.target as any).value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
            />
            <button onClick={handleCreateFolder} className="text-blue-400 hover:text-blue-300">
              <Plus size={14} />
            </button>
            <button onClick={() => setShowNewFolderInput(false)} className="text-slate-500">
              <X size={14} />
            </button>
          </div>
        )}

        <div className="space-y-3">
          {folders.map(folder => (
            <div key={folder.id} className="space-y-2">
              <button 
                onClick={() => toggleFolder(folder.id)}
                onContextMenu={(e) => handleFolderContextMenu(e, folder.id)}
                onDragOver={(e) => handleDragOver(e, folder.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDropOnFolder(e, folder.id)}
                className={`w-full flex items-center gap-2 text-slate-400 hover:text-white transition-all py-1.5 group px-1 rounded-md hover:bg-slate-800/30 ${expandedFolders[folder.id] ? 'bg-slate-800/10' : ''} ${dragOverFolder === folder.id ? 'bg-blue-600/20 ring-1 ring-blue-500/50' : ''}`}
              >
                <div className={`transition-transform duration-200 ${expandedFolders[folder.id] ? 'rotate-90' : ''}`}>
                  <ChevronRight size={14} />
                </div>
                <FolderIcon size={14} className="text-blue-500/80" />
                <span className="text-[11px] font-bold flex-1 text-left truncate">{folder.name}</span>
                <span className="text-[10px] font-mono text-slate-600 group-hover:text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                  {filterAssetsByFolder(folder.id).length}
                </span>
              </button>
              
              {expandedFolders[folder.id] && (
                <div className="pl-3 grid grid-cols-2 gap-2 animate-in fade-in slide-in-from-top-1 duration-300">
                  {filterAssetsByFolder(folder.id).map(renderAssetItem)}
                  {filterAssetsByFolder(folder.id).length === 0 && (
                    <div className="col-span-2 py-4 text-[9px] text-slate-600 font-bold uppercase tracking-widest text-center border border-dashed border-slate-800 rounded-lg">
                      Drop here
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          <div className="space-y-2 pt-4 border-t border-slate-800">
            <button 
              onClick={() => toggleFolder('root')}
              onDragOver={(e) => handleDragOver(e, 'root')}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDropOnFolder(e, undefined)}
              className={`w-full flex items-center gap-2 text-slate-400 hover:text-white transition-all py-1.5 group px-1 rounded-md hover:bg-slate-800/30 ${dragOverFolder === 'root' ? 'bg-indigo-600/20 ring-1 ring-indigo-500/50' : ''}`}
            >
              <div className={`transition-transform duration-200 ${expandedFolders['root'] ? 'rotate-90' : ''}`}>
                <ChevronRight size={14} />
              </div>
              <Tag size={14} className="text-indigo-500/80" />
              <span className="text-[11px] font-bold flex-1 text-left">Uncategorized</span>
              <span className="text-[10px] font-mono text-slate-600 group-hover:text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                {filterAssetsByFolder(undefined).length}
              </span>
            </button>
            
            {expandedFolders['root'] && (
              <div className="pl-3 space-y-5 animate-in fade-in duration-300">
                {filterAssetsByFolder(undefined).length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {filterAssetsByFolder(undefined).map(renderAssetItem)}
                  </div>
                ) : (
                  <div className="py-8 text-center text-[10px] text-slate-700 italic">No loose assets</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Asset Context Menu */}
      {assetContextMenu && (
        <div 
          className="fixed bg-slate-800 border border-slate-700 rounded-md shadow-2xl py-1 z-[100] w-44 animate-in fade-in zoom-in-95 duration-100"
          style={{ left: assetContextMenu.x, top: assetContextMenu.y }}
        >
          <button 
            onClick={() => {
              const asset = assets.find(a => a.id === assetContextMenu.assetId);
              if (asset) onSelectAsset(asset);
              setAssetContextMenu(null);
            }}
            className="w-full text-left px-3 py-1.5 hover:bg-blue-600 text-[11px] text-slate-300 hover:text-white flex items-center gap-2"
          >
            <Settings2 size={12}/> View Properties
          </button>
          <button 
            onClick={() => {
              const asset = assets.find(a => a.id === assetContextMenu.assetId);
              const newName = (window as any).prompt("Rename asset:", asset?.name);
              if (newName) onUpdateAsset(assetContextMenu.assetId, { name: newName });
              setAssetContextMenu(null);
            }}
            className="w-full text-left px-3 py-1.5 hover:bg-blue-600 text-[11px] text-slate-300 hover:text-white flex items-center gap-2"
          >
            <Edit3 size={12}/> Rename
          </button>
          <div className="h-px bg-slate-700 my-1"></div>
          <button 
            onClick={() => {
              onDeleteAsset(assetContextMenu.assetId);
              setAssetContextMenu(null);
            }}
            className="w-full text-left px-3 py-1.5 hover:bg-red-600 text-[11px] text-red-400 hover:text-white flex items-center gap-2"
          >
            <Trash2 size={12}/> Delete
          </button>
        </div>
      )}

      {/* Folder Context Menu */}
      {folderContextMenu && (
        <div 
          className="fixed bg-slate-800 border border-slate-700 rounded-md shadow-2xl py-1 z-[100] w-44 animate-in fade-in zoom-in-95 duration-100"
          style={{ left: folderContextMenu.x, top: folderContextMenu.y }}
        >
          <button 
            onClick={() => {
              const folder = folders.find(f => f.id === folderContextMenu.folderId);
              const newName = (window as any).prompt("Rename folder:", folder?.name);
              if (newName) onUpdateFolder(folderContextMenu.folderId, { name: newName });
              setFolderContextMenu(null);
            }}
            className="w-full text-left px-3 py-1.5 hover:bg-blue-600 text-[11px] text-slate-300 hover:text-white flex items-center gap-2"
          >
            <Edit3 size={12}/> Rename Folder
          </button>
          <div className="h-px bg-slate-700 my-1"></div>
          <button 
            onClick={() => {
              if ((window as any).confirm("Delete this folder? Assets will be moved to uncategorized.")) {
                onDeleteFolder(folderContextMenu.folderId);
              }
              setFolderContextMenu(null);
            }}
            className="w-full text-left px-3 py-1.5 hover:bg-red-600 text-[11px] text-red-400 hover:text-white flex items-center gap-2"
          >
            <Trash2 size={12}/> Delete Folder
          </button>
        </div>
      )}
    </div>
  );
};

export default Sidebar;