import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import {
    Send, Plus, Trash2, Edit2,
    ArrowLeft, Loader2, MessageSquare, X, Check
} from 'lucide-react';
import {
    createChat, getChatResponse, fetchChatsForChapter,
    deleteChat, renameChat, setActiveChat
} from '../features/chatSlicer';

export default function ChatPage() {
    const { roadmapId, chapterId } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { chats } = useSelector(state => state.chat);

    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editTitle, setEditTitle] = useState('');
    const messagesEndRef = useRef(null);

    // Current chapter chat data
    const chatData = chats[chapterId] || { chats: [], activeChatId: null };
    const activeChat = chatData.chats.find(c => c.id === chatData.activeChatId);

    // Load chats on page open
    useEffect(() => {
        const load = async () => {
            await dispatch(fetchChatsForChapter({ roadmapId, moduleId: chapterId }));
            setIsFetching(false);
        };
        load();
    }, [roadmapId, chapterId]);

    // Auto scroll to bottom when new message arrives
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [activeChat?.messages]);

    // ─── Handlers ─────────────────────────────────────────────

    const handleSend = async () => {
        if (!message.trim() || isLoading) return;
        const msg = message.trim();
        setMessage('');
        setIsLoading(true);

        if (!activeChat) {
            // No active chat → create new one
            const res = await dispatch(createChat({
                roadmapId, moduleId: chapterId, userMessage: msg
            }));
            if (res.payload?.success) {
                await dispatch(fetchChatsForChapter({ roadmapId, moduleId: chapterId }));
            } else {
                toast.error('Failed to create chat');
            }
        } else {
            // Active chat exists → send message
            const res = await dispatch(getChatResponse({
                chatId: activeChat.chatId, userMessage: msg
            }));
            if (res.payload?.success) {
                await dispatch(fetchChatsForChapter({ roadmapId, moduleId: chapterId }));
            } else {
                toast.error('Failed to get response');
            }
        }
        setIsLoading(false);
    };

    const handleNewChat = () => {
        dispatch(setActiveChat({ moduleId: chapterId, chatId: null }));
    };

    const handleDelete = async (e, chatId) => {
        e.stopPropagation();
        await dispatch(deleteChat({ chatId }));
        toast.success('Chat deleted');
    };

    const handleRename = async chatId => {
        if (!editTitle.trim()) { setEditingId(null); return; }
        await dispatch(renameChat({ chatId, newTitle: editTitle }));
        setEditingId(null);
        toast.success('Chat renamed');
    };

    const handleKeyDown = e => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // ─── Render ───────────────────────────────────────────────

    return (
        <div className="min-h-screen bg-slate-900 text-white flex">

            {/* ── Sidebar ───────────────────────────────────── */}
            <div className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col shrink-0">

                {/* Sidebar Header */}
                <div className="p-4 border-b border-slate-800">
                    <button onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm mb-3">
                        <ArrowLeft className="h-4 w-4" /> Back
                    </button>
                    <h2 className="font-semibold text-white">AI Chat</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Chapter {chapterId}</p>
                </div>

                {/* New Chat Button */}
                <div className="p-3 border-b border-slate-800">
                    <button onClick={handleNewChat}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors">
                        <Plus className="h-4 w-4" /> New Chat
                    </button>
                </div>

                {/* Chat List */}
                <div className="flex-1 overflow-y-auto py-2 px-2 space-y-1">
                    {isFetching ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-5 w-5 text-slate-500 animate-spin" />
                        </div>
                    ) : chatData.chats.length === 0 ? (
                        <p className="text-xs text-slate-500 text-center py-6 px-3">
                            No chats yet. Start a conversation!
                        </p>
                    ) : (
                        chatData.chats.map(chat => (
                            <div key={chat.id}
                                onClick={() => dispatch(setActiveChat({ moduleId: chapterId, chatId: chat.id }))}
                                className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${chat.id === chatData.activeChatId
                                    ? 'bg-slate-800'
                                    : 'hover:bg-slate-800/50'}`}>

                                <MessageSquare className="h-4 w-4 text-slate-500 shrink-0" />

                                {/* Rename Input or Title */}
                                {editingId === chat.id ? (
                                    <input value={editTitle}
                                        onChange={e => setEditTitle(e.target.value)}
                                        onKeyDown={e => {
                                            if (e.key === 'Enter') handleRename(chat.id);
                                            if (e.key === 'Escape') setEditingId(null);
                                        }}
                                        onClick={e => e.stopPropagation()}
                                        className="flex-1 bg-slate-700 rounded px-1.5 py-0.5 text-sm text-white outline-none"
                                        autoFocus />
                                ) : (
                                    <span className="flex-1 text-sm truncate">{chat.title}</span>
                                )}

                                {/* Action Buttons */}
                                {editingId === chat.id ? (
                                    <div className="flex gap-1">
                                        <button onClick={e => { e.stopPropagation(); handleRename(chat.id); }}
                                            className="p-1 text-green-400 hover:text-green-300 transition-colors">
                                            <Check className="h-3 w-3" />
                                        </button>
                                        <button onClick={e => { e.stopPropagation(); setEditingId(null); }}
                                            className="p-1 text-slate-400 hover:text-white transition-colors">
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="hidden group-hover:flex gap-1">
                                        <button onClick={e => {
                                            e.stopPropagation();
                                            setEditingId(chat.id);
                                            setEditTitle(chat.title);
                                        }}
                                            className="p-1 text-slate-400 hover:text-white transition-colors">
                                            <Edit2 className="h-3 w-3" />
                                        </button>
                                        <button onClick={e => handleDelete(e, chat.id)}
                                            className="p-1 text-slate-400 hover:text-red-400 transition-colors">
                                            <Trash2 className="h-3 w-3" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* ── Chat Area ─────────────────────────────────── */}
            <div className="flex-1 flex flex-col">

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {!activeChat ? (
                        // Empty state
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <MessageSquare className="h-16 w-16 text-slate-700 mb-4" />
                            <h3 className="text-xl font-semibold text-slate-400 mb-2">
                                Start a conversation
                            </h3>
                            <p className="text-slate-500 text-sm">
                                Ask anything about this chapter
                            </p>
                        </div>
                    ) : (
                        <>
                            {activeChat.messages.map((msg, i) => (
                                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm whitespace-pre-wrap ${msg.role === 'user'
                                        ? 'bg-blue-600 text-white rounded-br-sm'
                                        : 'bg-slate-800 text-slate-200 rounded-bl-sm'}`}>
                                        {msg.content}
                                    </div>
                                </div>
                            ))}

                            {/* Loading indicator */}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-slate-800 px-4 py-3 rounded-2xl rounded-bl-sm">
                                        <div className="flex gap-1">
                                            <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                            <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                            <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </>
                    )}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-slate-800">
                    <div className="flex gap-3 max-w-4xl mx-auto">
                        <input value={message}
                            onChange={e => setMessage(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask anything... (Enter to send)"
                            disabled={isLoading}
                            className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:border-blue-500/50 focus:outline-none text-sm disabled:opacity-50" />
                        <button onClick={handleSend}
                            disabled={!message.trim() || isLoading}
                            className="px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                            {isLoading
                                ? <Loader2 className="h-5 w-5 animate-spin" />
                                : <Send className="h-5 w-5" />}
                        </button>
                    </div>
                    <p className="text-xs text-slate-600 text-center mt-2">
                        Press Enter to send • Shift+Enter for new line
                    </p>
                </div>
            </div>
        </div>
    );
}