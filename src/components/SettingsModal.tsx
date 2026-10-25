import React, { useState } from 'react';
import {
  X,
  Sliders,
  Trash2,
  Download,
  Check,
  CheckCircle2,
} from 'lucide-react';
import { AppSettings, Conversation } from '../types/chat';
import { AVAILABLE_MODELS, PERSONA_PRESETS } from '../constants/presets';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  conversations: Conversation[];
  onClearAllConversations: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  conversations,
  onClearAllConversations,
}) => {
  const [activeTab, setActiveTab] = useState<'model' | 'persona' | 'data'>('model');
  const [confirmClear, setConfirmClear] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSelectPersona = (id: string) => {
    const preset = PERSONA_PRESETS.find((p) => p.id === id);
    if (preset) {
      onUpdateSettings({
        activePersonaId: id,
        systemInstruction: preset.systemPrompt,
      });
    } else if (id === 'custom') {
      onUpdateSettings({
        activePersonaId: 'custom',
      });
    }
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        settings,
        conversations,
      },
      null,
      2
    );
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gemini-chat-studio-export-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div
        className="fixed inset-0"
        onClick={onClose}
      />

      <div className="relative w-full max-w-xl rounded-2xl bg-[#0f172a] border border-slate-800 shadow-2xl overflow-hidden z-10 flex flex-col max-h-[85vh] text-slate-100">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-950/60 flex items-center justify-center text-indigo-400">
              <Sliders className="w-4 h-4" />
            </div>
            <h2 className="font-semibold text-slate-100 text-base">
              Settings & Configuration
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex border-b border-slate-800 px-5 bg-[#0b1120]">
          <button
            onClick={() => setActiveTab('model')}
            className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
              activeTab === 'model'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Model & Parameters
          </button>
          <button
            onClick={() => setActiveTab('persona')}
            className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
              activeTab === 'persona'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Persona & Instructions
          </button>
          <button
            onClick={() => setActiveTab('data')}
            className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
              activeTab === 'data'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Data & Privacy
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-5 text-sm flex-1">
          {activeTab === 'model' && (
            <>
              <div>
                <label className="block font-medium text-slate-200 text-xs mb-2">
                  Active Gemini Model
                </label>
                <div className="space-y-2">
                  {AVAILABLE_MODELS.map((model) => {
                    const isSelected = settings.activeModel === model.id;
                    return (
                      <div
                        key={model.id}
                        onClick={() => onUpdateSettings({ activeModel: model.id })}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-950/40'
                            : 'border-slate-800 bg-[#090e1a] hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-100 text-xs">
                              {model.name}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                              {model.badge}
                            </span>
                          </div>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
                        </div>
                        <p className="mt-1 text-xs text-slate-400">
                          {model.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <label className="font-medium text-slate-200 text-xs">
                    Temperature: <span className="font-mono text-indigo-400">{settings.temperature}</span>
                  </label>
                  <span className="text-[11px] text-slate-400">
                    {settings.temperature <= 0.3 ? 'Precise & Direct' : settings.temperature <= 0.8 ? 'Balanced' : 'Creative & Expressive'}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1.5"
                  step="0.1"
                  value={settings.temperature}
                  onChange={(e) => onUpdateSettings({ temperature: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                  <span>0.0 (Strict)</span>
                  <span>0.7 (Default)</span>
                  <span>1.5 (Creative)</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-medium text-slate-200 text-xs">
                    Stream Real-time Responses
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Display tokens progressively as they are generated
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.streamResponses}
                  onChange={(e) => onUpdateSettings({ streamResponses: e.target.checked })}
                  className="w-4 h-4 rounded text-indigo-500 accent-indigo-500 cursor-pointer"
                />
              </div>
            </>
          )}

          {activeTab === 'persona' && (
            <>
              <div>
                <label className="block font-medium text-slate-200 text-xs mb-2">
                  Choose a Persona Preset
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                  {PERSONA_PRESETS.map((preset) => {
                    const isSelected = settings.activePersonaId === preset.id;
                    return (
                      <div
                        key={preset.id}
                        onClick={() => handleSelectPersona(preset.id)}
                        className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-950/40'
                            : 'border-slate-800 bg-[#090e1a] hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-slate-100 text-xs">
                            {preset.name}
                          </span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-2">
                          {preset.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-200 text-xs mb-1.5">
                  System Instruction Prompt
                </label>
                <textarea
                  value={settings.systemInstruction}
                  onChange={(e) =>
                    onUpdateSettings({
                      systemInstruction: e.target.value,
                      activePersonaId: 'custom',
                    })
                  }
                  rows={4}
                  placeholder="Define behavior, role, constraints, or personality guidelines for the model..."
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-800 bg-[#090e1a] text-slate-200 focus:outline-none focus:border-indigo-500 leading-relaxed font-mono"
                />
              </div>
            </>
          )}

          {activeTab === 'data' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-[#090e1a] border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-medium text-slate-200 text-xs">
                    Export Chat Archive
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Download all {conversations.length} conversation threads in JSON format
                  </div>
                </div>
                <button
                  onClick={handleExportData}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
                >
                  {downloadSuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Exported</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      <span>Export</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-3.5 rounded-xl border border-rose-900/60 bg-rose-950/20 flex items-center justify-between">
                <div>
                  <div className="font-medium text-rose-300 text-xs">
                    Clear All Chat History
                  </div>
                  <div className="text-[11px] text-rose-400/70">
                    Permanently delete all stored conversations from browser storage
                  </div>
                </div>

                {confirmClear ? (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setConfirmClear(false)}
                      className="px-2.5 py-1 text-xs text-slate-400 hover:bg-slate-800 rounded"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        onClearAllConversations();
                        setConfirmClear(false);
                        onClose();
                      }}
                      className="px-2.5 py-1 text-xs font-medium bg-rose-600 hover:bg-rose-500 text-white rounded transition-colors"
                    >
                      Confirm
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmClear(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-rose-800 text-rose-300 hover:bg-rose-900/40 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear All</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="px-5 py-3 border-t border-slate-800 bg-[#0b1120] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
