/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Sparkles, Trash2, ArrowDownCircle } from 'lucide-react';
import { MessageBubble } from './Message';
import { Message as MessageType } from '../types';
import { getModelResponseStream, validateInput } from '../services/ollama_gemma4';

export function ChatInterface() {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (autoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const isAtBottom = scrollHeight - scrollTop <= clientHeight + 100;
    setAutoScroll(isAtBottom);
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isTyping) return;

    const userText = input.trim();
    setInput('');
    
    // Guardrails check (Phase 1.3)
    const validation = validateInput(userText);
    
    const userMessage: MessageType = {
      id: Date.now().toString(),
      role: 'user',
      content: userText,
      status: 'sent',
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);

    if (!validation.isValid) {
      const errorMsg: MessageType = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: validation.reason || "Safety violation.",
        status: 'error',
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMsg]);
      return;
    }

    setIsTyping(true);
    const modelMessageId = (Date.now() + 2).toString();
    
    try {
      let fullResponse = "";
      setMessages(prev => [...prev, {
        id: modelMessageId,
        role: 'model',
        content: "",
        status: 'sending',
        timestamp: Date.now(),
      }]);

      // Phase 2.3 & 3.1: Streaming with context management
      const stream = getModelResponseStream([...messages, userMessage]);
      
      for await (const chunk of stream) {
        fullResponse += chunk;
        setMessages(prev => 
          prev.map(msg => 
            msg.id === modelMessageId 
              ? { ...msg, content: fullResponse } 
              : msg
          )
        );
      }

      setMessages(prev => 
        prev.map(msg => 
          msg.id === modelMessageId 
            ? { ...msg, status: 'sent' } 
            : msg
        )
      );
    } catch (err) {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === modelMessageId 
            ? { ...msg, content: "Sorry, I encountered an error. Please try again.", status: 'error' } 
            : msg
        )
      );
    } finally {
      setIsTyping(false);
    }
  };

  const clearChat = () => {
    if (confirm("Clear conversation history?")) {
      setMessages([]);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-zinc-50 font-sans text-zinc-900 overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 bg-white border-bottom border-zinc-200 px-6 py-4 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-zinc-900 rounded-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">Nexus</h1>
            <p className="text-[10px] text-zinc-400 font-mono uppercase tracking-widest">Quantum Interface v2.5</p>
          </div>
        </div>
        <button 
          onClick={clearChat}
          className="p-2 text-zinc-400 hover:text-red-500 transition-colors"
          title="Clear Chat"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </header>

      {/* Chat Area */}
      <main 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-8 sm:px-6 lg:px-8 custom-scrollbar relative"
      >
        <div className="max-w-3xl mx-auto">
          {messages.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center h-[60vh] text-center"
            >
              <div className="w-20 h-20 bg-zinc-100 rounded-3xl flex items-center justify-center mb-6">
                <Sparkles className="w-10 h-10 text-zinc-300" />
              </div>
              <h2 className="text-2xl font-light text-zinc-400 mb-2">How can I assist you today?</h2>
              <p className="text-sm text-zinc-400 max-w-xs mx-auto">
                Ask me anything from coding challenges to creative writing.
              </p>
            </motion.div>
          ) : (
            <>
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
              {isTyping && messages[messages.length-1]?.role === 'user' && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-2 ml-12 mb-6"
                >
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </motion.div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Scroll to bottom FAB */}
        <AnimatePresence>
          {!autoScroll && messages.length > 0 && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              onClick={() => { setAutoScroll(true); scrollToBottom(); }}
              className="fixed bottom-28 right-8 p-3 bg-white border border-zinc-200 rounded-full shadow-lg text-zinc-500 hover:text-zinc-900 z-20"
            >
              <ArrowDownCircle className="w-6 h-6" />
            </motion.button>
          )}
        </AnimatePresence>
      </main>

      {/* Input Area */}
      <footer className="flex-shrink-0 bg-white border-t border-zinc-200 px-4 py-4 sm:px-6 lg:px-8 pb-8">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSend} className="relative group">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message Nexus..."
              className="w-full bg-zinc-100 border-none rounded-2xl px-6 py-4 pr-14 text-sm focus:ring-2 focus:ring-zinc-900 transition-all outline-none"
              disabled={isTyping}
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className={`absolute right-2 top-2 p-2 rounded-xl transition-all ${
                input.trim() && !isTyping 
                  ? 'bg-zinc-900 text-white shadow-md hover:scale-105 active:scale-95' 
                  : 'bg-zinc-200 text-zinc-400'
              }`}
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
          <p className="text-[10px] text-center text-zinc-400 mt-3 font-medium uppercase tracking-tight">
            AI can make mistakes. Verify important values.
          </p>
        </div>
      </footer>
    </div>
  );
}
