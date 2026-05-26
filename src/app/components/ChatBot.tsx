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
  const [messages, setMessages] = useState<Message[]>([
    { text: "Xin chào! Tôi là trợ lý AI của UniPart. Tôi có thể giúp bạn tìm công việc phù hợp với lịch học và sở thích của bạn! 🎯", isBot: true },
  ]);
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

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.drag-handle')) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;

      // Get bounds
      const chatElement = chatRef.current;
      if (chatElement) {
        const maxX = window.innerWidth - chatElement.offsetWidth - 8;
        const maxY = window.innerHeight - chatElement.offsetHeight - 8;

        setPosition({
          x: Math.max(-window.innerWidth + chatElement.offsetWidth + 8, Math.min(newX, maxX)),
          y: Math.max(-window.innerHeight + chatElement.offsetHeight + 8, Math.min(newY, maxY)),
        });
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart, position]);

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



  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-28 h-28 transition-transform duration-300 flex items-center justify-center z-50 hover:scale-110 group drop-shadow-2xl hover:drop-shadow-[0_20px_20px_rgba(0,0,0,0.25)]"
        title="Trò chuyện với AI"
      >
        <img src={unibotAvatar} alt="ChatBot Mascot" className="w-full h-full object-contain" />
        <div className="absolute top-0 right-0 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center z-10 shadow-md">
          <Sparkles className="w-3 h-3 text-white" />
        </div>
      </button>
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
        bottom: `${24 - position.y}px`,
        right: `${24 - position.x}px`,
        cursor: isDragging ? 'grabbing' : 'default',
      }}
      onMouseDown={handleMouseDown}
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