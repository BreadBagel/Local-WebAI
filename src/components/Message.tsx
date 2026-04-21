/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from "motion/react";
import { User, Bot, AlertCircle } from "lucide-react";
import { Message as MessageType } from "../types";

interface MessageBubbleProps {
  message: MessageType;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const isError = message.status === 'error';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`flex max-w-[85%] sm:max-w-[75%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser ? 'bg-zinc-800 ml-3' : 'bg-emerald-600 mr-3'
        }`}>
          {isUser ? (
            <User className="w-5 h-5 text-white" />
          ) : (
            <Bot className="w-5 h-5 text-white" />
          )}
        </div>

        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
            isUser 
              ? 'bg-zinc-100 text-zinc-900 rounded-tr-none' 
              : 'bg-white border border-zinc-200 text-zinc-800 shadow-sm rounded-tl-none'
          } ${isError ? 'border-red-200 bg-red-50 text-red-900' : ''}`}>
            {isError && <AlertCircle className="w-4 h-4 inline-block mr-2 -mt-1 text-red-500" />}
            <span className="whitespace-pre-wrap">{message.content}</span>
          </div>
          
          <span className="text-[10px] text-zinc-400 mt-1 uppercase tracking-wider font-medium">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
