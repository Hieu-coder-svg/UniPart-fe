import { useState, useRef, useEffect } from "react";
import {
  MessageCircle,
  X,
  Send,
  Sparkles,
  ExternalLink,
  DollarSign,
  Clock,
  MapPin,
} from "lucide-react";
import unibotAvatar from "../../assets/linhvat.png";
import { Link } from "react-router";
import { type Job } from "../data/mockData";
import { chatService } from "../../services/chatService";
import { jobService } from "../../services/jobService";
import { ChatRequest, AIResponse } from "../../types/chat";

// Lightweight markdown → HTML converter
const renderMarkdown = (text: string): string => {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    // **bold**
    .replace(/\*\*(.+?)\*\*/g, "<strong class='font-semibold text-gray-900'>$1</strong>")
    // *italic*
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    // newline → <br>
    .replace(/\n/g, "<br />");
};

type Message = {
  text: string;
  isBot: boolean;
  jobs?: Job[];
};

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [hasDragged, setHasDragged] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = sessionStorage.getItem("studentChatHistory");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Error parsing student chat history:", e);
    }
    return [{ text: "Xin chào! Tôi là trợ lý AI của UniHire. Tôi có thể giúp bạn tìm công việc phù hợp với lịch học và sở thích của bạn! 🎯", isBot: true }];
  });

  useEffect(() => {
    sessionStorage.setItem("studentChatHistory", JSON.stringify(messages));
  }, [messages]);
  const [input, setInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  const quickReplies = [
    "Tìm việc lương cao",
    "Việc làm cuối tuần",
    "Công việc ca tối",
    "Làm gần Quận 1",
    "Việc gần tôi (10km)",
    "Việc làm F&B",
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!isOpen || (e.target as HTMLElement).closest('.drag-handle')) {
      e.preventDefault();
      setIsDragging(true);
      setHasDragged(false);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (isDragging) {
      setHasDragged(true);
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;

      const el = chatRef.current;
      const width = (isOpen && el) ? el.offsetWidth : 112;
      const height = (isOpen && el) ? el.offsetHeight : 112;

      const maxPosX = 12;
      const minPosX = 24 - (window.innerWidth - width - 12);

      const maxPosY = 12;
      const minPosY = 24 - (window.innerHeight - height - 12);

      setPosition({
        x: Math.max(minPosX, Math.min(newX, maxPosX)),
        y: Math.max(minPosY, Math.min(newY, maxPosY)),
      });
    }
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
      window.addEventListener('pointercancel', handlePointerUp);
      return () => {
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
        window.removeEventListener('pointercancel', handlePointerUp);
      };
    }
  }, [isDragging, dragStart, position]);

  useEffect(() => {
    if (isOpen && chatRef.current) {
      const timeoutId = setTimeout(() => {
        if (!chatRef.current) return;
        const el = chatRef.current;
        const rect = el.getBoundingClientRect();

        let deltaX = 0;
        let deltaY = 0;

        if (rect.top < 12) {
          deltaY = 12 - rect.top;
        } else if (rect.bottom > window.innerHeight - 12) {
          deltaY = window.innerHeight - 12 - rect.bottom;
        }

        if (rect.left < 12) {
          deltaX = 12 - rect.left;
        } else if (rect.right > window.innerWidth - 12) {
          deltaX = window.innerWidth - 12 - rect.right;
        }

        if (deltaX !== 0 || deltaY !== 0) {
          setPosition(prev => ({
            x: prev.x + deltaX,
            y: prev.y + deltaY
          }));
        }
      }, 50);
      return () => clearTimeout(timeoutId);
    }
  }, [isOpen, messages]);

  const [isSending, setIsSending] = useState(false);

  const handleSend = async (text?: string) => {
    const messageText = text || input;
    if (!messageText.trim() || isSending) return;

    const userMessage: Message = { text: messageText, isBot: false };
    setMessages((prev) => [...prev, userMessage]);
    setShowSuggestions(false);
    setInput("");
    setIsSending(true);

    try {
      const token = localStorage.getItem("access_token");

      // Chỉ gọi AI API khi đã đăng nhập
      if (!token) {
        setMessages((prev) => [
          ...prev,
          { text: "Bạn cần **đăng nhập** để sử dụng tính năng tìm việc thông minh nhé! 🔐", isBot: true },
        ]);
        setIsSending(false);
        return;
      }

      // Call the backend API
      const chatRequest: ChatRequest = {
        message: messageText,
        context: "student_chat"
      };

      const response = await chatService.sendMessage(chatRequest);
      const aiResponse = response.result;


      let finalJobs: Job[] = [];

      // Fetch real jobs if recommendations exist
      if (aiResponse.recommendations && aiResponse.recommendations.length > 0) {
        try {
          const jobPromises = aiResponse.recommendations.map(rec =>
            jobService.getJobDetail(Number(rec.id)).catch(() => null)
          );

          const jobResponses = await Promise.all(jobPromises);

          jobResponses.forEach(res => {
            if (res && res.result) {
              const jobData = res.result;
              finalJobs.push({
                id: String(jobData.id),
                title: jobData.title,
                company: jobData.employerName || "Công ty",
                location: jobData.address || "Chưa cập nhật",
                distance: 0,
                hourlyRate: jobData.salary || 0,
                shift: jobData.workingShift || "Khác",
                workingHours: "",
                hoursPerWeek: 0,
                urgent: jobData.urgent || false,
                category: "Khác",
                description: jobData.description || "",
                requirements: [],
                rating: 5.0,
                reviewCount: 0,
                postedDate: jobData.createdAt || "Vừa xong",
                salaryRange: "",
                featured: false,
                logo: "🏢",
                image: jobData.image || ""
              });
            }
          });
        } catch (error) {
          console.error("Error fetching recommended jobs:", error);
        }
      }

      // Process the AI response and add jobs if needed
      if (finalJobs.length === 0) {
        finalJobs = aiResponse.jobs && aiResponse.jobs.length > 0
          ? aiResponse.jobs
          : [];
      }

      const botResponse: Message = {
        text: aiResponse.message,
        isBot: true,
        jobs: finalJobs.length > 0 ? finalJobs : undefined
      };

      setMessages((prev) => [...prev, botResponse]);
    } catch (error) {
      console.error("Chat API error:", error);
      setMessages((prev) => [
        ...prev,
        { text: "Xin lỗi, tôi đang gặp sự cố kết nối. Vui lòng thử lại sau! 🔄", isBot: true },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSend(suggestion);
  };



  const [showGreeting, setShowGreeting] = useState(true);
  const [tiltStyle, setTiltStyle] = useState({ transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)' });

  useEffect(() => {
    // Show greeting periodically or initially
    const timer = setTimeout(() => {
      setShowGreeting(false);
    }, 8000);
    return () => clearTimeout(timer);
  }, []);

  const handleBotPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (isDragging) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -25;
    const rotateY = ((x - centerX) / centerX) * 25;

    setTiltStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.15, 1.15, 1.15)`,
      transition: 'transform 0.1s ease-out'
    });
  };

  const handleBotPointerLeave = () => {
    setTiltStyle({ 
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
      transition: 'transform 0.5s ease-out'
    });
    setTimeout(() => setShowGreeting(false), 3000);
  };

  if (!isOpen) {
    return (
      <div
        className="fixed z-50 pointer-events-none"
        style={{
          width: "7rem",
          height: "7rem",
          bottom: `${(window.innerWidth < 768 ? 80 : 60) - position.y}px`,
          right: `${24 - position.x}px`,
          perspective: "1000px"
        }}
      >
        {/* Welcome message bubble */}
        <div 
          className={`absolute bottom-full right-0 mb-4 whitespace-nowrap px-4 py-2.5 bg-white rounded-2xl shadow-xl border border-blue-100 text-sm font-medium text-gray-700 transition-all duration-500 pointer-events-auto cursor-pointer flex items-center gap-2 ${showGreeting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
          onClick={() => setIsOpen(true)}
          onMouseEnter={() => setShowGreeting(true)}
          style={{ animation: 'bounce 2s infinite' }}
        >
          <span className="animate-wave inline-block origin-bottom-right">👋</span> Xin chào! Cần tìm việc làm?
          <div className="absolute -bottom-2 right-8 border-8 border-transparent border-t-white"></div>
        </div>
        
        <button
          onPointerDown={handlePointerDown}
          onPointerMove={handleBotPointerMove}
          onPointerLeave={handleBotPointerLeave}
          onClick={() => {
            if (!hasDragged) setIsOpen(true);
          }}
          onMouseEnter={() => setShowGreeting(true)}
          className="w-full h-full flex items-center justify-center group drop-shadow-2xl animate-bounce pointer-events-auto"
          style={{
            cursor: isDragging ? 'grabbing' : 'grab',
            touchAction: 'none',
            animationDuration: "3s",
            ...tiltStyle
          }}
          title="Trò chuyện với AI"
        >
          <img src={unibotAvatar} alt="ChatBot Mascot" className="w-full h-full object-contain pointer-events-none drop-shadow-[0_10px_20px_rgba(0,0,0,0.3)] transition-all duration-300 origin-bottom" style={{ transformStyle: 'preserve-3d' }} />
          <div className="absolute top-0 right-0 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center z-10 shadow-md" style={{ transform: 'translateZ(30px)' }}>
            <Sparkles className="w-3 h-3 text-white animate-pulse" />
          </div>
        </button>
      </div>
    );
  }

  return (
    <div
      ref={chatRef}
      className="fixed z-50"
      style={{
        width: "420px",
        maxWidth: "calc(100vw - 32px)",
        maxHeight: "calc(100vh - 48px)",
        bottom: `${(window.innerWidth < 768 ? 80 : 24) - position.y}px`,
        right: `${24 - position.x}px`,
        cursor: isDragging ? 'grabbing' : 'default',
        touchAction: 'none'
      }}
      onPointerDown={handlePointerDown}
    >
      <div className="bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col overflow-hidden h-full max-h-[520px]">
        {/* Header */}
        <div className="drag-handle bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 cursor-grab active:cursor-grabbing flex items-center justify-between select-none flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center overflow-hidden border border-white/20">
              <img src={unibotAvatar} alt="UniBot" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="font-semibold flex items-center gap-1">
                UniBot
                <Sparkles className="w-3 h-3" />
              </div>
              <div className="text-xs text-blue-100">Trợ lý tìm việc thông minh</div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                setIsOpen(false);
              }}
              className="p-1 hover:bg-white/20 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Chat Content */}
        {!isMinimized && (
          <>
            <div
              className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0 relative"
              style={{
                backgroundColor: '#f9fafb',
                backgroundImage: `linear-gradient(rgba(249, 250, 251, 0.92), rgba(249, 250, 251, 0.92)), url(${unibotAvatar})`,
                backgroundSize: 'contain',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                backgroundAttachment: 'local'
              }}
            >
              {messages.map((msg, idx) => (
                <div key={idx}>
                  <div
                    className={`flex ${msg.isBot ? "justify-start" : "justify-end"} animate-fadeIn`}
                  >
                    <div className="flex gap-2 items-end max-w-[85%]">
                      {msg.isBot && (
                        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-white border border-gray-100 overflow-hidden">
                          <img src={unibotAvatar} alt="UniBot" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div
                        className={`px-4 py-3 rounded-lg shadow-sm ${msg.isBot
                          ? "bg-white text-gray-800 border border-gray-100"
                          : "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                          }`}
                      >
                        {msg.isBot ? (
                          <div
                            className="text-sm leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.text) }}
                          />
                        ) : (
                          <div className="text-sm leading-relaxed whitespace-pre-line">{msg.text}</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Job Cards */}
                  {msg.jobs && msg.jobs.length > 0 && (
                    <div className="mt-3 space-y-2 animate-fadeIn">
                      {msg.jobs.map((job) => (
                        <JobChatCard key={job.id} job={job} />
                      ))}
                      <div className="text-center pt-2">
                        <Link
                          to="/jobs"
                          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Xem tất cả công việc
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Typing indicator */}
              {isSending && (
                <div className="flex justify-start animate-fadeIn">
                  <div className="flex gap-2 items-end">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-white border border-gray-100 overflow-hidden">
                      <img src={unibotAvatar} alt="UniBot" className="w-full h-full object-cover" />
                    </div>
                    <div className="bg-white rounded-2xl px-4 py-3 border border-gray-100 shadow-sm">
                      <div className="flex gap-1 items-center">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Replies */}
              {showSuggestions && messages.length === 1 && (
                <div className="pt-2 space-y-2">
                  <div className="text-xs text-gray-500 px-1">💡 Câu hỏi gợi ý:</div>
                  <div className="flex flex-wrap gap-2">
                    {quickReplies.map((reply, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSuggestionClick(reply)}
                        className="px-3 py-2 bg-white border border-blue-200 text-blue-600 rounded-lg text-sm hover:bg-blue-50 hover:border-blue-400 transition-all shadow-sm"
                      >
                        {reply}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-gray-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Nhập yêu cầu của bạn..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={() => handleSend()}
                  className="px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function JobChatCard({ job }: { job: Job }) {
  return (
    <Link
      to={`/jobs/${job.id}`}
      className="block bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-3 border border-blue-100 hover:border-blue-300 hover:shadow-md transition-all group"
    >
      <div className="flex flex-col gap-2">

        {/* Job Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="font-semibold text-sm text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
              {job.title}
            </h4>
            {job.urgent && (
              <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full font-semibold flex-shrink-0">
                GẤP
              </span>
            )}
          </div>
          <p className="text-xs text-gray-600 mb-2 truncate">{job.company}</p>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <DollarSign className="w-3.5 h-3.5 text-green-600" />
              <span className="font-semibold text-green-600">{job.hourlyRate.toLocaleString()}đ/giờ</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <Clock className="w-3.5 h-3.5" />
              <span>{job.shift}{job.workingHours ? ` (${job.workingHours})` : ""}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              <span className="truncate">{job.location}</span>
              <span className="text-blue-600 font-medium">• {job.distance}km</span>
            </div>
          </div>

          <div className="mt-2 flex items-center gap-1.5 flex-wrap">
            <span className="px-2 py-0.5 bg-white text-blue-600 text-xs rounded-full border border-blue-200 font-medium">
              {job.category}
            </span>
            <span className="text-xs text-gray-500">⭐ {job.rating}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}