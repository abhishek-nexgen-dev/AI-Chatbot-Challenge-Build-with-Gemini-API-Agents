import React, { useState, useMemo } from 'react';
import {
  Plus,
  MessageSquare,
  Search,
  Trash2,
  Edit2,
  Check,
  X,
  Pin,
  Settings,
  Sun,
  Moon,
  Sparkles,
  ChevronLeft,
} from 'lucide-react';
import { Conversation, AppSettings } from '../types/chat';

interface SidebarProps {
  conversations: Conversation[];
  activeConversationId: string;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onDeleteConversation: (id: string) => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  onTogglePinConversation: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  onRenameConversation,
  onTogglePinConversation,
  isOpen,
  onClose,
  onOpenSettings,
  settings,
  onUpdateSettings,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const query = searchQuery.toLowerCase();
    return conversations.filter(
      (c) =>
        c.title.toLowerCase().includes(query) ||
        c.messages.some((m) => m.content.toLowerCase().includes(query))
    );
  }, [conversations, searchQuery]);

  const groupedConversations = useMemo(() => {
    const pinned: Conversation[] = [];
    const today: Conversation[] = [];
    const yesterday: Conversation[] = [];
    const last7Days: Conversation[] = [];
    const older: Conversation[] = [];

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterdayStart = todayStart - 86400000;
    const sevenDaysStart = todayStart - 86400000 * 7;

    for (const c of filteredConversations) {
      if (c.pinned) {
        pinned.push(c);
        continue;
      }
      const time = c.updatedAt || c.createdAt;
      if (time >= todayStart) {
        today.push(c);
      } else if (time >= yesterdayStart) {
        yesterday.push(c);
      } else if (time >= sevenDaysStart) {
        last7Days.push(c);
      } else {
        older.push(c);
      }
    }

    return { pinned, today, yesterday, last7Days, older };
  }, [filteredConversations]);

  const handleStartRename = (c: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(c.id);
    setEditTitle(c.title);
  };

  const handleSaveRename = (id: string, e: React.MouseEvent | React.FormEvent) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      onRenameConversation(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleCancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
  };

  const renderConversationItem = (c: Conversation) => {
    const isActive = c.id === activeConversationId;
    const isEditing = editingId === c.id;

    return (
      <div
        key={c.id}
        onClick={() => {
          onSelectConversation(c.id);
          if (window.innerWidth < 1024) onClose();
        }}
        className={`group relative flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer text-sm transition-colors ${
          isActive
            ? 'bg-slate-200/80 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium'
            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
          {c.pinned ? (
            <Pin className="w-4 h-4 shrink-0 text-indigo-500 fill-indigo-500/20" />
          ) : (
            <MessageSquare className="w-4 h-4 shrink-0 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300" />
          )}

          {isEditing ? (
            <div className="flex items-center gap-1 flex-1 min-w-0" onClick={(e) => e.stopPropagation()}>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveRename(c.id, e);
                  if (e.key === 'Escape') setEditingId(null);
                }}
                autoFocus
                className="w-full px-2 py-0.5 text-xs rounded border border-indigo-400 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none"
              />
              <button
                onClick={(e) => handleSaveRename(c.id, e)}
                className="p-1 hover:text-emerald-500 rounded"
                title="Save"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleCancelRename}
                className="p-1 hover:text-rose-500 rounded"
                title="Cancel"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <span className="truncate flex-1 text-[13px]">{c.title || 'Untitled Chat'}</span>
          )}
        </div>

        {!isEditing && (
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTogglePinConversation(c.id);
              }}
              className="p-1 text-slate-400 hover:text-indigo-500 rounded hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors"
              title={c.pinned ? 'Unpin' : 'Pin to top'}
            >
              <Pin className={`w-3.5 h-3.5 ${c.pinned ? 'text-indigo-500 fill-indigo-500/20' : ''}`} />
            </button>
            <button
              onClick={(e) => handleStartRename(c, e)}
              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors"
              title="Rename title"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteConversation(c.id);
              }}
              className="p-1 text-slate-400 hover:text-rose-500 rounded hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors"
              title="Delete conversation"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderGroup = (label: string, items: Conversation[]) => {
    if (items.length === 0) return null;
    return (
      <div key={label} className="mb-4">
        <div className="px-3 py-1 text-[11px] font-semibold tracking-wider uppercase text-slate-600 dark:text-slate-300">
          {label}
        </div>
        <div className="space-y-0.5">{items.map(renderConversationItem)}</div>
      </div>
    );
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 flex flex-col w-72 bg-[#0c1220] border-r border-slate-800/80 transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-3.5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-linear-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-900 dark:text-slate-100 tracking-tight text-sm">
              Gemini Studio
            </span>
          </div>

          <button
            onClick={onClose}
            className="lg:hidden p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-md hover:bg-slate-200/60 dark:hover:bg-slate-800"
            title="Close sidebar"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3 space-y-2">
          <button
            onClick={() => {
              onNewChat();
              if (window.innerWidth < 1024) onClose();
            }}
            className="w-full flex items-center justify-between px-3.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-medium rounded-lg shadow-xs transition-colors text-sm"
          >
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              <span>New Chat</span>
            </div>
            <kbd className="hidden sm:inline-block text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/50 text-indigo-100 font-mono">
              ⌘K
            </kbd>
          </button>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-800 bg-[#070b14] text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 py-1">
          {conversations.length === 0 ? (
            <div className="px-4 py-8 text-center text-xs text-slate-400">
              No chat history yet. Start a new conversation!
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="px-4 py-8 text-center text-xs text-slate-400">
              No chats matching "{searchQuery}"
            </div>
          ) : (
            <>
              {renderGroup('Pinned', groupedConversations.pinned)}
              {renderGroup('Today', groupedConversations.today)}
              {renderGroup('Yesterday', groupedConversations.yesterday)}
              {renderGroup('Previous 7 Days', groupedConversations.last7Days)}
              {renderGroup('Older', groupedConversations.older)}
            </>
          )}
        </div>

        <div className="p-3 border-t border-slate-800/80 space-y-1 bg-[#090e1a]/60">
          <button
            onClick={onOpenSettings}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800/70 hover:text-white transition-colors"
          >
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-slate-400" />
              <span>Settings & Personas</span>
            </div>
            <span className="text-[11px] text-slate-400 capitalize">{settings.activeModel.split('-')[1] || 'Flash'}</span>
          </button>
        </div>
      </aside>
    </>
  );
};
