import React, { useState } from 'react';
import { ASPECT_RATIOS, STYLE_PRESETS, VOICE_PRESETS } from '../constants';
import { GenerationConfig, MediaType } from '../types';
import { Wand2, Loader2, Mic, Film, Image as ImageIcon } from 'lucide-react';

interface ControlPanelProps {
  isGenerating: boolean;
  generationProgress: string;
  activeMediaType: MediaType;
  onGenerate: (config: GenerationConfig) => void;
  onMediaTypeChange: (type: MediaType) => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ 
  isGenerating, 
  generationProgress, 
  activeMediaType, 
  onGenerate,
  onMediaTypeChange
}) => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [style, setStyle] = useState(STYLE_PRESETS[0].value);
  const [voice, setVoice] = useState(VOICE_PRESETS[0].value);

  const handleSubmit = () => {
    if (!prompt) return;
    onGenerate({
      prompt,
      aspectRatio,
      resolution: '1080p',
      model: '', // Handled by service
      stylePreset: style,
    });
  };

  return (
    <div className="w-80 bg-slate-900 border-l border-slate-700 p-4 flex flex-col h-full overflow-y-auto">
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Properties</h2>
        
        {/* Type Selector */}
        <div className="flex bg-slate-800 p-1 rounded-lg mb-6">
          <button 
            onClick={() => onMediaTypeChange(MediaType.IMAGE)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded text-xs font-medium transition-all ${activeMediaType === MediaType.IMAGE ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <ImageIcon size={14} /> Image
          </button>
          <button 
            onClick={() => onMediaTypeChange(MediaType.VIDEO)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded text-xs font-medium transition-all ${activeMediaType === MediaType.VIDEO ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Film size={14} /> Video
          </button>
          <button 
            onClick={() => onMediaTypeChange(MediaType.AUDIO)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded text-xs font-medium transition-all ${activeMediaType === MediaType.AUDIO ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Mic size={14} /> Voice
          </button>
        </div>

        {/* Prompt */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-slate-400 mb-1">Prompt</label>
          <textarea 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-md p-3 text-sm text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none min-h-[120px]"
            placeholder={
              activeMediaType === MediaType.IMAGE ? "Describe the image you want to create..." :
              activeMediaType === MediaType.VIDEO ? "Describe the video scene and motion..." :
              "Enter the text you want the avatar to speak..."
            }
          />
        </div>

        {/* Dynamic Controls based on Type */}
        {activeMediaType !== MediaType.AUDIO && (
          <>
            <div className="mb-4">
              <label className="block text-xs font-medium text-slate-400 mb-1">Aspect Ratio</label>
              <select 
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 text-sm text-slate-200 focus:outline-none"
              >
                {ASPECT_RATIOS.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-medium text-slate-400 mb-1">Style Preset</label>
              <select 
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 text-sm text-slate-200 focus:outline-none"
              >
                {STYLE_PRESETS.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </>
        )}

        {activeMediaType === MediaType.AUDIO && (
           <div className="mb-4">
            <label className="block text-xs font-medium text-slate-400 mb-1">Voice Profile</label>
            <select 
              value={voice}
              onChange={(e) => setVoice(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 text-sm text-slate-200 focus:outline-none"
            >
              {VOICE_PRESETS.map(v => (
                <option key={v.value} value={v.value}>{v.label}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="mt-auto">
        <button
          onClick={handleSubmit}
          disabled={isGenerating || !prompt}
          className={`w-full py-3 rounded-md font-bold text-sm flex items-center justify-center gap-2 transition-all
            ${isGenerating || !prompt 
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
              : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg'
            }`}
        >
          {isGenerating ? <Loader2 className="animate-spin" size={18} /> : <Wand2 size={18} />}
          {isGenerating ? 'Generating...' : 'Generate'}
        </button>
        {isGenerating && (
          <p className="text-center text-xs text-slate-500 mt-2 animate-pulse">{generationProgress}</p>
        )}
      </div>
    </div>
  );
};

export default ControlPanel;
