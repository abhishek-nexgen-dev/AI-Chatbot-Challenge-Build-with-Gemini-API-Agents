import React from 'react';
import { Sparkles, ArrowRight, Code, Server, Database, FileText } from 'lucide-react';
import { SUGGESTED_PROMPTS, SuggestedPrompt } from '../constants/presets';

interface WelcomeScreenProps {
  onSelectPrompt: (promptText: string) => void;
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Code & Systems':
      return <Code className="w-4 h-4 text-indigo-400" />;
    case 'Architecture':
      return <Server className="w-4 h-4 text-violet-400" />;
    case 'Data & DB':
      return <Database className="w-4 h-4 text-emerald-400" />;
    case 'Strategy & Copy':
      return <FileText className="w-4 h-4 text-sky-400" />;
    default:
      return <Sparkles className="w-4 h-4 text-indigo-400" />;
  }
};

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onSelectPrompt }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 max-w-3xl mx-auto w-full select-none">
      <div className="mb-5 sm:mb-6 flex items-center justify-center">
        <div className="relative flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-linear-to-tr from-indigo-600 via-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/20">
          <Sparkles className="w-6 h-6 sm:w-7 sm:h-7" />
        </div>
      </div>

      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-slate-100">
          What would you like to build or explore?
        </h1>
        <p className="mt-2 text-xs sm:text-sm md:text-base text-slate-400 max-w-lg mx-auto leading-relaxed">
          Ask questions, debug code, brainstorm systems architecture, or analyze data with Gemini.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 w-full">
        {SUGGESTED_PROMPTS.map((item: SuggestedPrompt) => (
          <button
            key={item.id}
            onClick={() => onSelectPrompt(item.prompt)}
            className="group flex flex-col items-start p-3.5 sm:p-4 text-left rounded-xl border border-slate-800/80 bg-[#0f172a]/70 hover:bg-[#131c33] hover:border-indigo-500/50 transition-all duration-150 shadow-xs hover:shadow-sm"
          >
            <div className="flex items-center justify-between w-full mb-1.5 sm:mb-2">
              <div className="flex items-center gap-1.5 sm:gap-2">
                {getCategoryIcon(item.category)}
                <span className="text-[11px] sm:text-xs font-medium text-slate-400">
                  {item.category}
                </span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
            </div>

            <div className="font-semibold text-xs sm:text-sm text-slate-100 mb-1 group-hover:text-indigo-400 transition-colors">
              {item.title}
            </div>

            <p className="text-[11px] sm:text-xs text-slate-400 line-clamp-2 leading-relaxed">
              {item.prompt}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};
