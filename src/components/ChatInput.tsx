import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowUp,
  Square,
  Paperclip,
  X,
  FileCode,
} from 'lucide-react';
import { FileAttachment } from '../types/chat';

interface ChatInputProps {
  onSendMessage: (content: string, attachments?: FileAttachment[]) => void;
  onStopStreaming?: () => void;
  isStreaming: boolean;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onStopStreaming,
  isStreaming,
  disabled = false,
}) => {
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 180)}px`;
    }
  }, [input]);

  const handleProcessFiles = async (files: FileList | File[]) => {
    const newAttachments: FileAttachment[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const isImg = file.type.startsWith('image/');

      if (isImg) {
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(file);
        });

        newAttachments.push({
          id: `${Date.now()}-${Math.random()}`,
          name: file.name,
          size: file.size,
          mimeType: file.type,
          base64,
        });
      } else {
        const textContent = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsText(file);
        });

        newAttachments.push({
          id: `${Date.now()}-${Math.random()}`,
          name: file.name,
          size: file.size,
          mimeType: file.type || 'text/plain',
          content: textContent,
        });
      }
    }

    setAttachments((prev) => [...prev, ...newAttachments]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleProcessFiles(e.target.files);
      e.target.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleProcessFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isStreaming) {
      if (onStopStreaming) onStopStreaming();
      return;
    }

    const trimmed = input.trim();
    if (!trimmed && attachments.length === 0) return;

    onSendMessage(trimmed, attachments.length > 0 ? attachments : undefined);
    setInput('');
    setAttachments([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const canSubmit = input.trim().length > 0 || attachments.length > 0;

  return (
    <div className="w-full px-3 sm:px-4 pb-3 sm:pb-4 pt-1 bg-linear-to-t from-[#090d16] via-[#090d16]/95 to-transparent">
      <div className="max-w-3xl mx-auto">
        <form
          onSubmit={handleSubmit}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`relative rounded-2xl border transition-all duration-150 ${
            isDragging
              ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-950/40'
              : 'border-slate-800 bg-[#0f172a] shadow-xl focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500/30'
          }`}
        >
          {attachments.length > 0 && (
            <div className="p-2.5 pb-0 flex flex-wrap gap-2">
              {attachments.map((file) => {
                const isImage = file.mimeType?.startsWith('image/') && file.base64;
                return (
                  <div
                    key={file.id}
                    className="relative flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800 text-xs text-slate-300 border border-slate-700"
                  >
                    {isImage ? (
                      <div className="w-4 h-4 rounded overflow-hidden">
                        <img src={file.base64} alt={file.name} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <FileCode className="w-3.5 h-3.5 text-indigo-400" />
                    )}
                    <span className="truncate max-w-[120px] font-medium">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeAttachment(file.id)}
                      className="p-0.5 hover:text-rose-400 rounded text-slate-400"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex items-end gap-2 px-3 py-2.5">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              multiple
              accept="image/*,.txt,.md,.json,.ts,.js,.py,.html,.css,.csv"
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || isStreaming}
              className="p-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors shrink-0 disabled:opacity-50"
              title="Attach code or image file"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={disabled}
              placeholder={isStreaming ? 'Gemini is responding...' : 'Ask anything, describe a task, or attach code...'}
              rows={1}
              className="flex-1 max-h-44 py-1.5 px-1 bg-transparent text-slate-100 placeholder:text-slate-500 resize-none text-sm leading-relaxed focus:outline-none"
            />

            {isStreaming ? (
              <button
                type="button"
                onClick={onStopStreaming}
                className="p-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white shrink-0 shadow-xs transition-colors"
                title="Stop generation"
              >
                <Square className="w-4 h-4 fill-white" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!canSubmit || disabled}
                className={`p-2 rounded-xl shrink-0 transition-colors shadow-xs ${
                  canSubmit && !disabled
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                    : 'bg-slate-800/80 text-slate-500 cursor-not-allowed'
                }`}
                title="Send message (Enter)"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
            )}
          </div>
        </form>

        <div className="mt-2 px-2 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <span>Press <kbd className="font-mono text-[10px] px-1 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">Enter</kbd> to send, <kbd className="font-mono text-[10px] px-1 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">Shift + Enter</kbd> for newline</span>
          </div>
          {input.length > 0 && (
            <span className="font-mono tabular-nums text-slate-400">
              {input.length} chars
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
