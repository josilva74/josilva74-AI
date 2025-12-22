
import React, { useState } from 'react';
import { ASPECT_RATIOS, STYLE_PRESETS, VOICE_PRESETS, IMAGE_SIZES, SAMPLER_OPTIONS } from '../constants';
import { GenerationConfig, MediaType, Asset, Folder } from '../types';
import { Wand2, Loader2, Mic, Film, Image as ImageIcon, MessageSquare, Brain, Search, MapPin, Clock, AlertCircle, Info, Tag, Calendar, Layout, Trash2, Monitor, Sliders, Settings2 } from 'lucide-react';
import Tooltip from './Tooltip';

interface ControlPanelProps {
  isGenerating: boolean;
  generationProgress: string;
  activeMediaType: MediaType;
  activeAsset: Asset | null;
  folders: Folder[];
  onGenerate: (config: GenerationConfig) => void;
  onMediaTypeChange: (type: MediaType) => void;
  onUpdateAsset: (assetId: string, updates: Partial<Asset>) => void;
  onDeleteAsset: (assetId: string) => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ 
  isGenerating, 
  generationProgress, 
  activeMediaType,
  activeAsset,
  folders,
  onGenerate,
  onMediaTypeChange,
  onUpdateAsset,
  onDeleteAsset
}) => {
  const [tab, setTab] = useState<'generate' | 'properties'>(activeAsset ? 'properties' : 'generate');
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [imageSize, setImageSize] = useState('1K');
  const [resolution, setResolution] = useState<'720p' | '1080p'>('720p');
  const [duration, setDuration] = useState(5);
  const [style, setStyle] = useState(STYLE_PRESETS[0].value);
  const [useThinking, setUseThinking] = useState(false);
  const [useSearch, setUseSearch] = useState(false);
  const [useMaps, setUseMaps] = useState(false);
  
  // Advanced Image Params
  const [cfgScale, setCfgScale] = useState(7.0);
  const [steps, setSteps] = useState(25);
  const [sampler, setSampler] = useState(SAMPLER_OPTIONS[0].value);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Sync tab with active asset
  React.useEffect(() => {
    if (activeAsset) setTab('properties');
  }, [activeAsset]);

  const handleSubmit = () => {
    if (!prompt) return;
    onGenerate({
      prompt,
      negativePrompt,
      aspectRatio,
      resolution,
      imageSize: imageSize as any,
      durationSeconds: duration,
      model: '', 
      stylePreset: style,
      useThinking,
      useSearch,
      useMaps,
      cfgScale,
      steps,
      sampler
    });
  };

  const handleTagAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && activeAsset) {
      const val = (e.target as any).value.trim();
      if (val) {
        const currentTags = activeAsset.tags || [];
        if (!currentTags.includes(val)) {
          onUpdateAsset(activeAsset.id, { tags: [...currentTags, val] });
        }
        (e.target as any).value = '';
      }
    }
  };

  return (
    <div className="w-full bg-slate-900 border-l border-slate-700 flex flex-col h-full overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-slate-800">
        <button 
          onClick={() => setTab('generate')}
          className={`flex-1 py-3 text-[11px] font-bold uppercase tracking-wider transition-all ${tab === 'generate' ? 'text-blue-400 border-b-2 border-blue-400 bg-slate-800/50' : 'text-slate-500 hover:text-slate-300'}`}
        >
          Generator
        </button>
        <button 
          onClick={() => setTab('properties')}
          disabled={!activeAsset}
          className={`flex-1 py-3 text-[11px] font-bold uppercase tracking-wider transition-all ${tab === 'properties' ? 'text-blue-400 border-b-2 border-blue-400 bg-slate-800/50' : 'text-slate-500 hover:text-slate-300 disabled:opacity-30'}`}
        >
          Properties
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {tab === 'generate' ? (
          <div className="space-y-6">
            <div>
              <h2 className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-4">Configuration</h2>
              
              {/* Type Selector */}
              <div className="grid grid-cols-4 gap-1 bg-slate-800 p-1 rounded-lg mb-6">
                {[
                  { id: MediaType.IMAGE, icon: <ImageIcon size={14} />, label: 'Img', tip: 'Image Generation' },
                  { id: MediaType.VIDEO, icon: <Film size={14} />, label: 'Vid', tip: 'Video Synthesis' },
                  { id: MediaType.AUDIO, icon: <Mic size={14} />, label: 'Tts', tip: 'Text to Speech' },
                  { id: MediaType.CHAT, icon: <MessageSquare size={14} />, label: 'Chat', tip: 'AI Intelligence' }
                ].map(t => (
                  <Tooltip text={t.tip} key={t.id} position="bottom">
                    <button 
                      onClick={() => onMediaTypeChange(t.id)}
                      className={`w-full flex flex-col items-center justify-center gap-1 py-2 rounded text-[10px] font-medium transition-all ${activeMediaType === t.id ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                      {t.icon} {t.label}
                    </button>
                  </Tooltip>
                ))}
              </div>

              {/* Prompt */}
              <div className="mb-4">
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 tracking-tight">Prompt</label>
                <textarea 
                  value={prompt}
                  onChange={(e) => setPrompt((e.target as any).value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-md p-3 text-sm text-slate-200 focus:ring-1 focus:ring-blue-500 focus:outline-none min-h-[100px] shadow-inner"
                  placeholder={activeMediaType === MediaType.IMAGE ? "e.g. A futuristic city at sunset..." : "What do you want to create?"}
                />
              </div>

              {/* Advanced Parameters Toggle */}
              {activeMediaType === MediaType.IMAGE && (
                <div className="mb-4">
                  <button 
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex items-center gap-2 text-[10px] font-bold text-blue-400 uppercase tracking-widest hover:text-blue-300 transition-colors"
                  >
                    <Sliders size={12} />
                    {showAdvanced ? 'Hide Advanced Settings' : 'Show Advanced Settings'}
                  </button>
                  
                  {showAdvanced && (
                    <div className="mt-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700 space-y-4 animate-in slide-in-from-top-2 duration-200">
                      {/* CFG Scale */}
                      <div>
                        <div className="flex justify-between mb-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight flex items-center gap-1">
                            CFG Scale <Tooltip text="How strictly the AI follows your prompt. Higher = More accurate, Lower = More creative." position="right"><Info size={10}/></Tooltip>
                          </label>
                          <span className="text-[10px] font-mono text-blue-400">{cfgScale.toFixed(1)}</span>
                        </div>
                        {/* Fix: Use type casting (any) to access value property on event target to fix TS errors */}
                        <input 
                          type="range" min="1" max="30" step="0.5" 
                          value={cfgScale} 
                          onChange={(e) => setCfgScale(parseFloat((e.target as any).value))}
                          className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                      </div>

                      {/* Steps */}
                      <div>
                        <div className="flex justify-between mb-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight flex items-center gap-1">
                            Steps <Tooltip text="Number of iterations. Higher = More detail but slower generation." position="right"><Info size={10}/></Tooltip>
                          </label>
                          <span className="text-[10px] font-mono text-blue-400">{steps}</span>
                        </div>
                        {/* Fix: Use type casting (any) to access value property on event target to fix TS errors */}
                        <input 
                          type="range" min="10" max="100" step="1" 
                          value={steps} 
                          onChange={(e) => setSteps(parseInt((e.target as any).value))}
                          className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                      </div>

                      {/* Sampler */}
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 tracking-tight">Sampler Method</label>
                        {/* Fix: Use type casting (any) to access value property on event target to fix TS errors */}
                        <select 
                          value={sampler} 
                          onChange={(e) => setSampler((e.target as any).value)} 
                          className="w-full bg-slate-900 border border-slate-700 rounded-md p-2 text-[10px] text-slate-300 outline-none focus:border-blue-500"
                        >
                          {SAMPLER_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Negative Prompt - Show for Image and Video */}
              {(activeMediaType === MediaType.IMAGE || activeMediaType === MediaType.VIDEO) && (
                <div className="mb-4">
                  <div className="flex items-center gap-1 mb-1.5">
                    <AlertCircle size={10} className="text-slate-500"/>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-tight">Negative Prompt</label>
                  </div>
                  <textarea 
                    value={negativePrompt}
                    onChange={(e) => setNegativePrompt((e.target as any).value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 text-xs text-slate-200 focus:outline-none focus:border-red-500/50"
                    placeholder="Blurry, low quality, distorted, extra limbs..."
                  />
                </div>
              )}

              {/* Dynamic Controls */}
              {(activeMediaType === MediaType.IMAGE || activeMediaType === MediaType.VIDEO) && (
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 tracking-tight">Aspect Ratio</label>
                    <select 
                      value={aspectRatio} 
                      onChange={(e) => setAspectRatio((e.target as any).value)} 
                      className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 text-xs text-slate-200"
                    >
                      {ASPECT_RATIOS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 tracking-tight">
                      {activeMediaType === MediaType.IMAGE ? 'Quality (Size)' : 'Resolution'}
                    </label>
                    {activeMediaType === MediaType.IMAGE ? (
                      <select 
                        value={imageSize} 
                        onChange={(e) => setImageSize((e.target as any).value)} 
                        className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 text-xs text-slate-200"
                      >
                        {IMAGE_SIZES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                    ) : (
                      <select 
                        value={resolution} 
                        onChange={(e) => setResolution((e.target as any).value as any)} 
                        className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 text-xs text-slate-200"
                      >
                        <option value="720p">720p (HD)</option>
                        <option value="1080p">1080p (FHD)</option>
                      </select>
                    )}
                  </div>
                </div>
              )}

              {activeMediaType === MediaType.VIDEO && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tight flex items-center gap-1">
                      <Clock size={12}/> Duration
                    </label>
                    <span className="text-[10px] font-mono text-blue-400">{duration}s</span>
                  </div>
                  <input 
                    type="range" min="3" max="15" step="1" 
                    value={duration} 
                    onChange={(e) => setDuration(parseInt((e.target as any).value))}
                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-[8px] text-slate-600">3s</span>
                    <span className="text-[8px] text-slate-600">15s</span>
                  </div>
                </div>
              )}

              {activeMediaType === MediaType.CHAT && (
                <div className="space-y-3 mb-4 bg-slate-800/30 p-3 rounded-lg border border-slate-800">
                  <Tooltip text="Increases reasoning quality by reserving tokens for thought chains." position="right">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input type="checkbox" checked={useThinking} onChange={e => setUseThinking((e.target as any).checked)} className="rounded border-slate-700 bg-slate-800 text-blue-500 focus:ring-0" />
                      <div className="flex items-center gap-2 text-slate-400 group-hover:text-blue-400 transition-colors">
                        <Brain size={14} /> Thinking Mode
                      </div>
                    </label>
                  </Tooltip>
                  
                  <Tooltip text="Ground responses in real-time web results." position="right">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input type="checkbox" checked={useSearch} onChange={e => setUseSearch((e.target as any).checked)} className="rounded border-slate-700 bg-slate-800 text-blue-500 focus:ring-0" />
                      <div className="flex items-center gap-2 text-slate-400 group-hover:text-blue-400 transition-colors">
                        <Search size={14} /> Search Grounding
                      </div>
                    </label>
                  </Tooltip>

                  <Tooltip text="Access geographic and location-based intelligence." position="right">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input type="checkbox" checked={useMaps} onChange={e => setUseMaps((e.target as any).checked)} className="rounded border-slate-700 bg-slate-800 text-blue-500 focus:ring-0" />
                      <div className="flex items-center gap-2 text-slate-400 group-hover:text-blue-400 transition-colors">
                        <MapPin size={14} /> Maps Grounding
                      </div>
                    </label>
                  </Tooltip>
                </div>
              )}

              {(activeMediaType === MediaType.IMAGE || activeMediaType === MediaType.VIDEO) && (
                <div className="mb-4">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 tracking-tight">Style Preset</label>
                  <select 
                    value={style} 
                    onChange={(e) => setStyle((e.target as any).value)} 
                    className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 text-sm text-slate-200"
                  >
                    {STYLE_PRESETS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
              )}
            </div>
            
            <div className="pt-4">
              <button
                onClick={handleSubmit}
                disabled={isGenerating || !prompt}
                className={`w-full py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all active:scale-[0.98]
                  ${isGenerating || !prompt 
                    ? 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700' 
                    : 'bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 text-white shadow-[0_4px_20px_rgba(37,99,235,0.4)]'
                  }`}
              >
                {isGenerating ? <Loader2 className="animate-spin" size={16} /> : <Wand2 size={16} />}
                {isGenerating ? 'Processing...' : 'Run Engine'}
              </button>
              {isGenerating && (
                <p className="text-center text-[9px] text-slate-500 mt-3 font-mono animate-pulse uppercase tracking-widest">{generationProgress}</p>
              )}
            </div>
          </div>
        ) : (
          /* Asset Properties Tab */
          activeAsset && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 flex flex-col items-center">
                {activeAsset.type === MediaType.IMAGE ? (
                  <img src={activeAsset.url} className="w-full aspect-video object-cover rounded-lg shadow-lg mb-4" />
                ) : (
                  <div className="w-full aspect-video bg-slate-900 rounded-lg flex items-center justify-center mb-4">
                    <Film className="text-slate-700" size={48}/>
                  </div>
                )}
                <input 
                  type="text" 
                  value={activeAsset.name}
                  onChange={(e) => onUpdateAsset(activeAsset.id, { name: (e.target as any).value })}
                  className="w-full bg-transparent text-center font-bold text-slate-200 outline-none focus:text-blue-400"
                />
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                    <Info size={12}/> Asset Info
                  </label>
                  <div className="bg-slate-800/30 p-3 rounded-lg border border-slate-800 space-y-2">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500 flex items-center gap-1"><Calendar size={10}/> Created</span>
                      <span className="text-slate-300">{new Date(activeAsset.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500 flex items-center gap-1"><Layout size={10}/> Type</span>
                      <span className="text-slate-300">{activeAsset.type}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                    <Layout size={12}/> Organize
                  </label>
                  <select 
                    value={activeAsset.folderId || ''}
                    onChange={(e) => onUpdateAsset(activeAsset.id, { folderId: (e.target as any).value || undefined })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 text-xs text-slate-200"
                  >
                    <option value="">Uncategorized</option>
                    {folders.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                    <Tag size={12}/> Tags
                  </label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {activeAsset.tags?.map(tag => (
                      <span key={tag} className="px-2 py-0.5 bg-blue-900/40 text-blue-400 text-[10px] rounded border border-blue-800/50 flex items-center gap-1">
                        {tag}
                        <button onClick={() => onUpdateAsset(activeAsset.id, { tags: activeAsset.tags?.filter(t => t !== tag) })} className="hover:text-white">×</button>
                      </span>
                    ))}
                  </div>
                  <input 
                    type="text" 
                    placeholder="Add tag and press Enter..."
                    onKeyDown={handleTagAdd}
                    className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 text-xs text-slate-400 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="pt-4 border-t border-slate-800">
                  <button 
                    onClick={() => onDeleteAsset(activeAsset.id)}
                    className="w-full py-2 bg-red-900/20 hover:bg-red-900/30 text-red-500 text-[11px] font-bold uppercase rounded border border-red-900/30 flex items-center justify-center gap-2 transition-colors"
                  >
                    <Trash2 size={12}/> Delete Asset
                  </button>
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default ControlPanel;
