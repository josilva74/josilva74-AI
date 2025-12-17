import React, { useState, useEffect, useCallback, useRef } from 'react';
import Sidebar from './components/Sidebar';
import Timeline from './components/Timeline';
import ControlPanel from './components/ControlPanel';
import CollaborationPanel from './components/CollaborationPanel';
import Canvas from './components/Canvas';
import MenuBar from './components/MenuBar';
import LiveVoiceSession from './components/LiveVoiceSession';
import HelpModal from './components/HelpModal';
import { Asset, MediaType, TimelineItem, GenerationConfig, Collaborator, Comment, Folder } from './types';
import { 
  generateImage, 
  generateVideo, 
  generateSpeech, 
  editImage, 
  chatWithThinking, 
  chatWithGrounding 
} from './services/geminiService';
import { Upload, X, MessageSquare, ExternalLink, Mic, GripVertical, GripHorizontal } from 'lucide-react';

const STORAGE_KEY = 'aether_project_data';

const App: React.FC = () => {
  const [activeTool, setActiveTool] = useState('generate');
  const [activeMediaType, setActiveMediaType] = useState<MediaType>(MediaType.IMAGE);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [folders, setFolders] = useState<Folder[]>([
    { id: 'f1', name: 'Backgrounds', color: 'bg-blue-500' },
    { id: 'f2', name: 'Characters', color: 'bg-purple-500' }
  ]);
  const [activeAsset, setActiveAsset] = useState<Asset | null>(null);
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState('');
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  
  // Layout State
  const [sidebarWidth, setSidebarWidth] = useState(260);
  const [controlPanelWidth, setControlPanelWidth] = useState(320);
  const [timelineHeight, setTimelineHeight] = useState(256);
  const [isResizing, setIsResizing] = useState<'sidebar' | 'control' | 'timeline' | null>(null);

  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [draggedAsset, setDraggedAsset] = useState<Asset | null>(null);

  const [collaborators] = useState<Collaborator[]>([
    { id: 'u1', name: 'You', initials: 'ME', color: 'bg-purple-600', role: 'editor', status: 'active' },
    { id: 'u2', name: 'Gemini AI', initials: 'AI', color: 'bg-blue-600', role: 'editor', status: 'active' },
  ]);

  const [comments, setComments] = useState<Comment[]>([]);

  // File Operations
  const handleNewProject = () => {
    if ((window as any).confirm('Create new project? Current work will be lost if not saved.')) {
      setAssets([]);
      setTimelineItems([]);
      setActiveAsset(null);
      setComments([]);
      setSourceImage(null);
    }
  };

  const handleSaveProject = () => {
    const data = { assets, folders, timelineItems, comments };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    (window as any).alert('Project saved to local storage.');
  };

  const handleLoadProject = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      setAssets(data.assets || []);
      setFolders(data.folders || []);
      setTimelineItems(data.timelineItems || []);
      setComments(data.comments || []);
      (window as any).alert('Project loaded.');
    } else {
      (window as any).alert('No saved project found.');
    }
  };

  const handleExportProject = () => {
    const data = { assets, folders, timelineItems, comments, exportedAt: Date.now() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = (window as any).document.createElement('a');
    a.href = url;
    a.download = `aether-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportMedia = () => {
    const input = (window as any).document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,video/*,audio/*';
    input.onchange = (e) => {
      const file = (e.target as any).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const result = ev.target?.result as string;
          let type = MediaType.IMAGE;
          if (file.type.startsWith('video/')) type = MediaType.VIDEO;
          if (file.type.startsWith('audio/')) type = MediaType.AUDIO;

          const newAsset: Asset = {
            id: 'imported-' + Date.now(),
            type,
            url: result,
            name: file.name,
            createdAt: Date.now(),
            tags: ['imported']
          };
          setAssets(prev => [newAsset, ...prev]);
          setActiveAsset(newAsset);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleStudioAction = (type: 'IMAGE' | 'VIDEO' | 'AUDIO') => {
    setActiveTool('generate');
    setActiveMediaType(type as any);
    setActiveAsset(null); 
  };

  // Resize Handlers
  const handleMouseMove = useCallback((e: any) => {
    if (!isResizing) return;
    
    if (isResizing === 'sidebar') {
      const newWidth = Math.max(200, Math.min(450, e.clientX));
      setSidebarWidth(newWidth);
    } else if (isResizing === 'control') {
      const newWidth = Math.max(250, Math.min(500, (window as any).innerWidth - e.clientX));
      setControlPanelWidth(newWidth);
    } else if (isResizing === 'timeline') {
      const newHeight = Math.max(150, Math.min(500, (window as any).innerHeight - e.clientY));
      setTimelineHeight(newHeight);
    }
  }, [isResizing]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(null);
    (window as any).document.body.style.cursor = 'default';
    (window as any).document.body.style.userSelect = 'auto';
  }, []);

  useEffect(() => {
    if (isResizing) {
      (window as any).addEventListener('mousemove', handleMouseMove);
      (window as any).addEventListener('mouseup', handleMouseUp);
      (window as any).document.body.style.userSelect = 'none';
    }
    return () => {
      (window as any).removeEventListener('mousemove', handleMouseMove);
      (window as any).removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = (e.target as any).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setSourceImage(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleAddFolder = (name: string) => {
    const newFolder: Folder = {
      id: 'f' + Date.now(),
      name,
      color: 'bg-slate-500'
    };
    setFolders(prev => [...prev, newFolder]);
  };

  const handleUpdateFolder = (id: string, updates: Partial<Folder>) => {
    setFolders(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const handleDeleteFolder = (id: string) => {
    setFolders(prev => prev.filter(f => f.id !== id));
    setAssets(prev => prev.map(a => a.folderId === id ? { ...a, folderId: undefined } : a));
  };

  const handleMoveToFolder = (assetId: string, folderId: string | undefined) => {
    setAssets(prev => prev.map(asset => 
      asset.id === assetId ? { ...asset, folderId } : asset
    ));
  };

  const handleUpdateAsset = (id: string, updates: Partial<Asset>) => {
    setAssets(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
    if (activeAsset?.id === id) setActiveAsset(prev => prev ? { ...prev, ...updates } : null);
  };

  const handleDeleteAsset = (id: string) => {
    if ((window as any).confirm('Delete this asset permanently?')) {
      setAssets(prev => prev.filter(a => a.id !== id));
      if (activeAsset?.id === id) setActiveAsset(null);
      setTimelineItems(prev => prev.filter(item => item.assetId !== id));
    }
  };

  const handleGenerate = async (config: GenerationConfig) => {
    setIsGenerating(true);
    setGenerationProgress("Connecting to Gemini...");
    
    try {
      let resultUrl = '';
      let type = activeMediaType;
      let analysisResult = '';
      let groundingUrls: {url: string, title: string}[] = [];

      if (activeMediaType === MediaType.IMAGE) {
        if (sourceImage) {
          setGenerationProgress("Editing with Gemini...");
          resultUrl = (await editImage(sourceImage, config.prompt)) || '';
        } else {
          setGenerationProgress("Synthesizing Pro Image...");
          resultUrl = await generateImage(config.prompt, config.aspectRatio, config.stylePreset || '', config.imageSize);
        }
      } 
      else if (activeMediaType === MediaType.VIDEO) {
        setGenerationProgress("Rendering Veo Video...");
        resultUrl = await generateVideo(
          config.prompt, 
          config.aspectRatio, 
          config.resolution,
          config.durationSeconds,
          config.negativePrompt,
          sourceImage || undefined,
          (msg) => setGenerationProgress(msg)
        );
      }
      else if (activeMediaType === MediaType.AUDIO) {
        setGenerationProgress("Synthesizing Audio...");
        resultUrl = await generateSpeech(config.prompt, "Zephyr");
      }
      else if (activeMediaType === MediaType.CHAT) {
        if (config.useSearch || config.useMaps) {
          setGenerationProgress(`Retrieving Grounded Data...`);
          const res = await chatWithGrounding(config.prompt, config.useSearch ? 'search' : 'maps');
          analysisResult = res.text;
          groundingUrls = res.urls as any;
        } else {
          setGenerationProgress("Processing Thought Chain...");
          analysisResult = await chatWithThinking(config.prompt);
        }
        type = MediaType.CHAT;
        resultUrl = 'CHAT_ASSET';
      }

      const newAsset: Asset = {
        id: Date.now().toString(),
        type: type,
        url: resultUrl,
        name: config.prompt.substring(0, 24) || 'New Creation',
        createdAt: Date.now(),
        metadata: { 
          prompt: config.prompt,
          analysis: analysisResult,
          width: groundingUrls.length 
        }
      };
      
      (newAsset.metadata as any).grounding = groundingUrls;

      setAssets(prev => [newAsset, ...prev]);
      setActiveAsset(newAsset);
      setGenerationProgress("Generation Complete");
      setSourceImage(null);

    } catch (error: any) {
      console.error(error);
      setGenerationProgress(`Error: ${error.message}`);
      setTimeout(() => setGenerationProgress(''), 5000);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-200 font-sans overflow-hidden">
      <MenuBar 
        onNew={handleNewProject}
        onSave={handleSaveProject}
        onLoad={handleLoadProject}
        onImport={handleImportMedia}
        onExport={handleExportProject}
        onStudioAction={handleStudioAction}
        onOpenHelp={() => setShowHelp(true)}
      />

      {isVoiceActive && <LiveVoiceSession onClose={() => setIsVoiceActive(false)} />}
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
      
      <div className="flex-1 flex overflow-hidden">
        <div style={{ width: `${sidebarWidth}px` }} className="flex-shrink-0 flex">
          <Sidebar 
            activeTool={activeTool} 
            onToolChange={setActiveTool} 
            assets={assets} 
            folders={folders}
            onAddFolder={handleAddFolder}
            onUpdateFolder={handleUpdateFolder}
            onDeleteFolder={handleDeleteFolder}
            onMoveToFolder={handleMoveToFolder}
            onDragStart={(e, a) => setDraggedAsset(a)} 
            onSelectAsset={setActiveAsset}
            onDeleteAsset={handleDeleteAsset}
            onUpdateAsset={handleUpdateAsset}
          />
          <div 
            onMouseDown={() => setIsResizing('sidebar')}
            className="w-1 hover:bg-blue-500 cursor-col-resize transition-colors group flex items-center justify-center relative z-20"
          >
            <div className="absolute inset-y-0 -left-1 -right-1"></div>
          </div>
        </div>

        <div className="flex-1 flex flex-col relative z-0 min-w-0">
          <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-2">
            {!sourceImage ? (
              <label className="bg-slate-800/80 backdrop-blur border border-slate-700 px-3 py-1.5 rounded-full cursor-pointer hover:bg-slate-700 transition-all flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-300 shadow-xl border border-white/5 hover:border-white/10">
                <Upload size={14} className="text-blue-400" /> Source Media
                <input type="file" hidden accept="image/*" onChange={handleFileUpload} />
              </label>
            ) : (
              <div className="relative group">
                <img src={sourceImage} className="w-16 h-16 object-cover rounded-xl border-2 border-blue-500 shadow-2xl" alt="source" />
                <button onClick={() => setSourceImage(null)} className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                  <X size={10} />
                </button>
              </div>
            )}
            <button 
              onClick={() => setIsVoiceActive(true)}
              className="bg-blue-600/20 backdrop-blur border border-blue-500/50 px-3 py-1.5 rounded-full hover:bg-blue-600/30 text-blue-400 transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest shadow-xl"
            >
              <Mic size={14} /> Voice AI
            </button>
          </div>

          <div className="flex-1 flex flex-col relative overflow-hidden">
             <Canvas 
              activeAsset={activeAsset} 
              onDrop={(e) => {
                e.preventDefault();
                if (draggedAsset) {
                  setActiveAsset(draggedAsset);
                  setTimelineItems(prev => [...prev, {
                    id: Date.now().toString(),
                    assetId: draggedAsset.id,
                    trackId: draggedAsset.type === MediaType.AUDIO ? 3 : 1,
                    startTime: 0,
                    duration: 5,
                    name: draggedAsset.name,
                    type: draggedAsset.type,
                  }]);
                }
              }}
            />
            
            {activeAsset?.type === MediaType.CHAT && (
              <div className="h-1/3 bg-slate-900/98 backdrop-blur-xl p-6 overflow-y-auto border-t border-slate-700 shadow-[0_-20px_50px_rgba(0,0,0,0.5)] flex-shrink-0 animate-in slide-in-from-bottom duration-500">
                 <div className="max-w-4xl mx-auto">
                   <div className="flex items-center justify-between mb-4">
                    <h3 className="text-blue-400 font-black flex items-center gap-2 text-xs uppercase tracking-[0.2em]">
                      <MessageSquare size={16} /> Intelligence Feed
                    </h3>
                    <button onClick={() => setActiveAsset(null)} className="text-slate-500 hover:text-white transition-colors bg-slate-800 p-1 rounded-full">
                      <X size={14}/>
                    </button>
                   </div>
                   
                   <div className="text-sm leading-relaxed text-slate-300 whitespace-pre-wrap mb-6 bg-slate-950/50 p-6 rounded-2xl border border-slate-800 shadow-inner">
                     {activeAsset.metadata?.analysis}
                   </div>
                   
                   {(activeAsset.metadata as any).grounding?.length > 0 && (
                     <div className="space-y-3">
                       <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-1.5">
                         <ExternalLink size={10}/> Data Sources
                       </h4>
                       <div className="flex flex-wrap gap-2">
                         {(activeAsset.metadata as any).grounding.map((link: any, i: number) => (
                           <a 
                             key={i} 
                             href={link.url} 
                             target="_blank" 
                             rel="noopener noreferrer"
                             className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-blue-600/20 rounded-full border border-slate-700 hover:border-blue-500/50 transition-all group max-w-[250px] shadow-sm"
                           >
                             <ExternalLink size={10} className="text-blue-500"/>
                             <span className="text-[10px] text-slate-300 truncate font-bold group-hover:text-blue-100">{link.title || link.url}</span>
                           </a>
                         ))}
                       </div>
                     </div>
                   )}
                 </div>
              </div>
            )}
          </div>
        </div>

        <div style={{ width: `${controlPanelWidth}px` }} className="flex-shrink-0 flex">
          <div 
            onMouseDown={() => setIsResizing('control')}
            className="w-1 hover:bg-purple-500 cursor-col-resize transition-colors flex items-center justify-center relative z-20"
          >
            <div className="absolute inset-y-0 -left-1 -right-1"></div>
          </div>
          {activeTool === 'team' ? (
            <CollaborationPanel collaborators={collaborators} comments={comments} onInvite={() => {}} onAddComment={(t) => setComments(p => [...p, { id: 'c'+Date.now(), userId: 'u1', text: t, timestamp: Date.now() }])} />
          ) : (
            <ControlPanel 
              activeMediaType={activeMediaType} 
              activeAsset={activeAsset}
              folders={folders}
              onMediaTypeChange={setActiveMediaType} 
              onGenerate={handleGenerate} 
              onUpdateAsset={handleUpdateAsset}
              onDeleteAsset={handleDeleteAsset}
              isGenerating={isGenerating} 
              generationProgress={generationProgress} 
            />
          )}
        </div>
      </div>

      <div style={{ height: `${timelineHeight}px` }} className="flex-shrink-0 flex flex-col">
        <div 
          onMouseDown={() => setIsResizing('timeline')}
          className="h-1 hover:bg-blue-500 cursor-row-resize transition-colors relative z-30"
        >
          <div className="absolute inset-x-0 -top-1 -bottom-1"></div>
        </div>
        <Timeline items={timelineItems} currentTime={0} duration={15} />
      </div>
    </div>
  );
};

export default App;