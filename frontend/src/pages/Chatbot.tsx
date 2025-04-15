"use client";

import { useState, useEffect, useRef } from "react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import "@/styles/Chatbot.css";
import { fetchApi } from "@/lib/api";

type Message = {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
};

export default function ChatbotUI() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [adminContact, setAdminContact] = useState<{ email: string; phone_number: string } | null>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const toggleChat = () => setIsOpen(prev => !prev);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (chatRef.current && !chatRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
      timestamp: new Date(),
    };

    const normalizedInput = inputValue.trim().toLowerCase();
    if (normalizedInput === "hallo") {
      const botMessage: Message = {
        id: Date.now().toString(),
        text: Math.random() > 0.5 ? "Hallo!" : "Guten Tag!",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, userMessage, botMessage]);
      setInputValue("");
      return;
    }

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const text = await fetchApi("ai/chat", {
        method: "POST",
        body: JSON.stringify({ question: inputValue }),
      });

      const botMessage: Message = {
        id: Date.now().toString(),
        text: typeof text === 'string' ? text : "Ich konnte Ihre Anfrage nicht verarbeiten",
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);

      if (typeof text === 'string' && text.toLowerCase().includes("ich kenne die antwort")) {
        const admins = await fetchApi("admin-profiles");
        if (admins.length > 0) {
          setAdminContact({ email: admins[0].email, phone_number: admins[0].phone_number });
        }
      } else {
        setAdminContact(null);
      }
    } catch (error) {
      console.error("Error:", error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: "Sorry, I'm having trouble connecting.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
      setAdminContact(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleEmailClick = (email: string) => {
    const subject = "Question from Visio Coaching Chatbot";
    const body = `Dear Support Team,\n\nRegarding my question in the chatbot:\n\n"${inputValue}"\n\n`;
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handlePhoneClick = (phoneNumber: string) => {
    if (window.confirm(`Do you want to call ${phoneNumber}?`)) {
      window.location.href = `tel:${phoneNumber.replace(/\s+/g, "")}`;
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={toggleChat}
        className={`
          fixed bottom-8 right-8 w-[80px] h-[80px] md:w-[110px] md:h-[110px]
          flex items-center justify-center rounded-full cursor-pointer border-3 border-transparent
          hover:border-[#A1C611] transition-all duration-300
          md:bottom-1/2 md:right-1/2 md:translate-x-1/2 md:translate-y-1/2
        `}
      >
        <Avatar className="h-full w-full">
          <AvatarImage src="avatar-bot.png" />
        </Avatar>
      </button>
    );
  }

  return (
    <div
      ref={chatRef}
      className="
        fixed inset-0 
        md:inset-auto md:w-[418px] md:h-[638px] 
        md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2
        flex flex-col bg-white rounded-none md:rounded-lg shadow-xl 
        border-0 md:border border-gray-200 overflow-hidden z-50
      "
    >
      {/* Header */}
      <div className="bg-[#00589A] text-white p-4 flex items-center justify-between rounded-t-lg">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9" style={{ backgroundColor: "#A1C611" }}>
            <AvatarImage src="avatar-bot.png" />
          </Avatar>
          <span className="font-medium text-lg md:text-base">Visio Coaching</span>
        </div>
        <button
          onClick={toggleChat}
          className="text-white hover:text-gray-200 cursor-pointer p-1 hover:bg-white/10 rounded-full"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 md:h-5 md:w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 min-h-0 overflow-y-auto chat-messages-container">
        <div className="p-6 space-y-4">
          {messages.length === 0 && (
            <div className="flex items-start gap-3">
              <Avatar className="h-9 w-9 mt-1 flex-shrink-0" style={{ backgroundColor: "#00589A" }}>
                <AvatarImage src="avatar-bot.png" />
              </Avatar>
              <div className="bg-gray-100 rounded-lg px-4 py-3 text-base md:text-sm max-w-[85%]">
                👋 Hallo! Wie kann ich Ihnen heute helfen?
              </div>
            </div>
          )}

          {messages.map(message => (
            <div key={message.id} className={`flex items-start gap-3 ${message.isUser ? "justify-end" : ""}`}>
              {!message.isUser && (
                <Avatar className="h-9 w-9 mt-1 flex-shrink-0" style={{ backgroundColor: "#00589A" }}>
                  <AvatarImage src="avatar-bot.png" />
                </Avatar>
              )}
              <div
                className={`rounded-lg px-4 py-3 text-base md:text-sm max-w-[85%] ${message.isUser ? "bg-[#A1C611] text-white" : "bg-gray-100"
                  }`}
              >
                {message.text}
                {!message.isUser && adminContact && message.text.toLowerCase().includes("ich kenne die antwort") && (
                  <div className="mt-2 text-sm text-[#00589A]">
                    <p>
                      📞 Telefon:{" "}
                      <button onClick={() => handlePhoneClick(adminContact.phone_number)} className="underline hover:text-[#003760] cursor-pointer">
                        {adminContact.phone_number}
                      </button>
                    </p>
                    <p>
                      📧 E-Mail:{" "}
                      <button onClick={() => handleEmailClick(adminContact.email)} className="underline hover:text-[#003760] cursor-pointer">
                        {adminContact.email}
                      </button>
                    </p>
                  </div>
                )}
              </div>
              {message.isUser && (
                <Avatar className="h-9 w-9 mt-1 flex-shrink-0">
                  <AvatarImage src="avatar-user.png" />
                </Avatar>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start gap-3">
              <Avatar className="h-9 w-9 mt-1 flex-shrink-0" style={{ backgroundColor: "#00589A" }}>
                <AvatarImage src="avatar-bot.png" />
              </Avatar>
              <div className="bg-gray-100 rounded-lg px-4 py-3 text-base md:text-sm max-w-[85%]">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-100"></div>
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-200"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-4 rounded-b-lg">
        <div className="flex gap-3">
          <Input
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Geben Sie Ihre Nachricht ein..."
            className="flex-1 text-base md:text-sm h-12 md:h-10 focus-visible:ring-[#A1C611] focus-visible:ring-[1.5px] cursor-text"
            disabled={isLoading}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            size="sm"
            className="h-12 md:h-10 bg-[#00589A] hover:bg-[#004880] px-5 md:px-4 text-base md:text-sm text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Senden
          </Button>
        </div>
        <p className="text-sm md:text-xs text-gray-500 mt-3 text-center">
          Unser Team ist hier, um Ihnen zu helfen.
        </p>
      </div>
    </div>
  );
}
