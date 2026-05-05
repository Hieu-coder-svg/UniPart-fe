import { useState, useRef, useEffect } from "react";
import {
  MessageCircle,
  X,
  Send,
  Minimize2,
  Move,
  Bot,
  User,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { chatService } from "../../services/chatService";
import { ChatRequest } from "../../types/chat";

// Lightweight markdown → HTML converter
const renderMarkdown = (text: string): string => {
  return text
    // Escape HTML first
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

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

// Local fallback AI responses for employer context
const getLocalAIResponse = (userMessage: string): string => {
  const message = userMessage.toLowerCase();

  if (message.includes("giá") || message.includes("bảng giá") || message.includes("chi phí") || message.includes("gói")) {
    if (message.includes("basic")) {
      return "Gói Basic có giá 2.700.000đ/tháng, bao gồm:\n\n✅ 60 tin thường/tháng\n✅ Tối đa 2 tin/ngày\n✅ 5 tin tuyển gấp\n✅ Hỗ trợ email\n✅ Thống kê cơ bản\n\nPhù hợp cho doanh nghiệp nhỏ có nhu cầu tuyển dụng vừa phải.";
    } else if (message.includes("advance") || message.includes("advanced")) {
      return "Gói Advance có giá 6.000.000đ/tháng - Phổ biến nhất! Bao gồm:\n\n✅ 150 tin thường/tháng\n✅ Tối đa 5 tin/ngày\n✅ 10 tin tuyển gấp\n✅ Hỗ trợ ưu tiên\n✅ Hiển thị nổi bật\n✅ Thống kê chi tiết\n✅ Quản lý ứng viên\n\nTiết kiệm 55% so với mua lẻ!";
    } else if (message.includes("premium")) {
      return "Gói Premium có giá 10.500.000đ/tháng - Cho doanh nghiệp lớn:\n\n✅ 300 tin thường/tháng\n✅ Tối đa 10 tin/ngày\n✅ 20 tin tuyển gấp\n✅ Hỗ trợ 24/7\n✅ Hiển thị ưu tiên cao\n✅ Phân tích chi tiết\n✅ Account manager riêng\n\nLựa chọn tốt nhất cho doanh nghiệp tuyển dụng thường xuyên.";
    } else {
      return "UniPart có 3 gói dịch vụ chính:\n\n📦 Basic: 2.700.000đ/tháng (60 tin)\n📦 Advance: 6.000.000đ/tháng (150 tin) - Phổ biến nhất\n📦 Premium: 10.500.000đ/tháng (300 tin)\n\nNgoài ra, bạn có thể mua lẻ:\n• 1 tin thường: 50.000đ\n• 1 tin tuyển gấp: 70.000đ\n\nBạn muốn tìm hiểu chi tiết gói nào?";
    }
  }

  if (message.includes("so sánh") || message.includes("khác nhau") || message.includes("nên chọn")) {
    return "Gợi ý chọn gói phù hợp:\n\n🏢 Doanh nghiệp nhỏ (< 10 nhân viên):\n→ Gói Basic hoặc mua lẻ\n\n🏪 Doanh nghiệp vừa (10-50 nhân viên):\n→ Gói Advance (tiết kiệm 55%)\n\n🏭 Doanh nghiệp lớn (> 50 nhân viên):\n→ Gói Premium (có account manager riêng)\n\nBạn thuộc loại hình nào để tôi tư vấn cụ thể hơn?";
  }

  if (message.includes("đăng tin") || message.includes("tuyển dụng") || message.includes("hướng dẫn")) {
    return "Cách đăng tin tuyển dụng rất đơn giản:\n\n1️⃣ Chọn 'Quản lý tin tuyển dụng'\n2️⃣ Nhấn 'Đăng tin mới'\n3️⃣ Điền thông tin công việc (chỉ 3 phút)\n4️⃣ Chọn loại tin (thường/gấp)\n5️⃣ Đăng tin và nhận CV ngay!\n\n💡 Mẹo: Tin 'Tuyển gấp' được ưu tiên hiển thị và nhận CV nhanh hơn 3x!";
  }

  if (message.includes("gấp") || message.includes("khẩn cấp") || message.includes("urgent")) {
    return "Tin 'Tuyển gấp' có nhiều ưu điểm:\n\n⚡ Hiển thị ở vị trí TOP\n⚡ Badge đặc biệt thu hút ứng viên\n⚡ Nhận CV nhanh hơn 3x so với tin thường\n⚡ Push notification đến ứng viên phù hợp\n\nGiá: 70.000đ/tin (hoặc có sẵn trong gói)\n\nBạn có nhu cầu tuyển gấp không?";
  }

  if (message.includes("thanh toán") || message.includes("payment") || message.includes("chuyển khoản")) {
    return "Phương thức thanh toán linh hoạt:\n\n💳 Chuyển khoản ngân hàng\n💳 Ví điện tử (MoMo, ZaloPay)\n💳 Thẻ tín dụng/ghi nợ\n\n📝 Xuất hóa đơn VAT đầy đủ\n🔒 Thanh toán an toàn, bảo mật\n\nSau khi thanh toán, tài khoản được kích hoạt ngay lập tức!";
  }

  if (message.includes("hỗ trợ") || message.includes("liên hệ") || message.includes("support")) {
    return "Bạn có thể liên hệ hỗ trợ qua:\n\n📞 Hotline: 1900-xxxx (8:00 - 22:00)\n📧 Email: support@unipart.vn\n💬 Live Chat: Trên website\n\nĐội ngũ hỗ trợ phản hồi trong 15 phút!\n\nGói Premium có Account Manager riêng hỗ trợ 24/7.";
  }

  if (message.includes("sinh viên") || message.includes("ứng viên") || message.includes("student")) {
    return "Nguồn ứng viên của UniPart:\n\n👨‍🎓 Hơn 10,000 sinh viên hoạt động\n🎓 Từ các trường đại học uy tín\n✅ 100% xác thực qua email trường\n⭐ Đánh giá từ nhà tuyển dụng trước\n\nSinh viên UniPart:\n• Nhiệt tình, năng động\n• Sẵn sàng làm linh hoạt\n• Học hỏi nhanh chóng\n\nTỷ lệ hài lòng: 95%!";
  }

  if (message.includes("dùng thử") || message.includes("miễn phí") || message.includes("trial")) {
    return "🎁 Ưu đãi đặc biệt:\n\n✨ Đăng ký ngay hôm nay nhận:\n• 3 tin thường MIỄN PHÍ\n• 1 tin tuyển gấp MIỄN PHÍ\n• Tư vấn miễn phí từ chuyên gia\n\n⏰ Có hiệu lực 30 ngày\n🚀 Không cần thẻ tín dụng";
  }

  return "Tôi có thể giúp bạn về:\n\n💰 Bảng giá & So sánh gói\n📝 Hướng dẫn đăng tin\n⚡ Tuyển dụng gấp\n💳 Thanh toán\n👨‍🎓 Nguồn ứng viên\n🎁 Ưu đãi miễn phí\n\nBạn quan tâm điều gì nhất?";
};

const getQuickSuggestions = (messages: Message[]): string[] => {
  if (messages.length <= 1) {
    return ["Bảng giá các gói?", "Gói nào phù hợp tôi?", "Tuyển gấp như thế nào?", "Ưu đãi miễn phí?"];
  }
  const lastBot = messages.slice().reverse().find((m) => m.sender === "bot")?.text.toLowerCase() || "";
  if (lastBot.includes("basic") || lastBot.includes("advance") || lastBot.includes("premium")) {
    return ["So sánh các gói", "Cách thanh toán?", "Đăng tin như thế nào?", "Liên hệ hỗ trợ?"];
  }
  if (lastBot.includes("tuyển gấp") || lastBot.includes("urgent")) {
    return ["Bảng giá các gói?", "Nguồn ứng viên?", "Ưu đãi miễn phí?", "Liên hệ hỗ trợ?"];
  }
  if (lastBot.includes("miễn phí") || lastBot.includes("ưu đãi")) {
    return ["Bảng giá các gói?", "Tính năng gì?", "Cách thanh toán?", "Đăng tin ngay"];
  }
  return ["Chi tiết gói Advance?", "Tuyển gấp như thế nào?", "Nguồn ứng viên?", "Liên hệ hỗ trợ?"];
};

export function EmployerChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Xin chào! Tôi là trợ lý AI của UniPart. Tôi có thể giúp bạn tư vấn về các gói dịch vụ, bảng giá và hướng dẫn tuyển dụng. Bạn cần hỗ trợ gì? 🚀",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(".drag-handle")) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      const el = chatRef.current;
      if (el) {
        const maxX = window.innerWidth - el.offsetWidth - 24;
        const maxY = window.innerHeight - el.offsetHeight - 24;
        setPosition({
          x: Math.max(-window.innerWidth + el.offsetWidth + 24, Math.min(newX, maxX)),
          y: Math.max(-window.innerHeight + el.offsetHeight + 24, Math.min(newY, maxY)),
        });
      }
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, dragStart, position]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isTyping) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text,
      sender: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    try {
      const chatRequest: ChatRequest = { message: text, context: "employer_chat" };
      const response = await chatService.sendMessage(chatRequest);
      const aiResponse = response.result;

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse.message,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: getLocalAIResponse(text),
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const quickSuggestions = getQuickSuggestions(messages);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-full shadow-2xl hover:scale-110 transition-all duration-300 flex items-center justify-center group"
        title="Tư vấn với AI"
      >
        <MessageCircle className="w-7 h-7" />
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
          <Sparkles className="w-3 h-3 text-white" />
        </span>
        <div className="absolute bottom-full right-0 mb-3 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Tư vấn miễn phí
          <div className="absolute top-full right-4 -mt-1 border-4 border-transparent border-t-gray-900" />
        </div>
      </button>
    );
  }

  return (
    <div
      ref={chatRef}
      className="fixed z-50"
      style={{
        width: "400px",
        maxWidth: "calc(100vw - 32px)",
        maxHeight: "calc(100vh - 48px)",
        bottom: `${24 - position.y}px`,
        right: `${24 - position.x}px`,
        cursor: isDragging ? "grabbing" : "default",
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden h-full max-h-[580px]">
        {/* Header */}
        <div className="drag-handle bg-gradient-to-r from-orange-600 to-red-600 text-white px-4 py-3 cursor-grab active:cursor-grabbing flex items-center justify-between select-none flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold flex items-center gap-1 text-sm">
                UniPart AI
                <Sparkles className="w-3 h-3" />
              </div>
              <div className="text-xs text-orange-100 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                Online · Phản hồi ngay
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Move className="w-4 h-4 opacity-50" />
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              title={isMinimized ? "Mở rộng" : "Thu nhỏ"}
            >
              <Minimize2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => { setIsOpen(false); setPosition({ x: 0, y: 0 }); }}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Chat Content */}
        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 min-h-0">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"} animate-fadeIn`}
                >
                  <div className={`flex gap-2 max-w-[85%] ${message.sender === "user" ? "flex-row-reverse" : "flex-row"}`}>
                    {/* Avatar */}
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.sender === "user"
                          ? "bg-gradient-to-br from-orange-600 to-red-600"
                          : "bg-gradient-to-br from-blue-600 to-purple-600"
                      }`}
                    >
                      {message.sender === "user" ? (
                        <User className="w-3.5 h-3.5 text-white" />
                      ) : (
                        <Bot className="w-3.5 h-3.5 text-white" />
                      )}
                    </div>

                    {/* Bubble */}
                    <div>
                      <div
                        className={`rounded-2xl px-4 py-2.5 shadow-sm ${
                          message.sender === "user"
                            ? "bg-gradient-to-r from-orange-600 to-red-600 text-white"
                            : "bg-white text-gray-800 border border-gray-100"
                        }`}
                      >
                        {message.sender === "bot" ? (
                          <div
                            className="text-sm leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: renderMarkdown(message.text) }}
                          />
                        ) : (
                          <div className="text-sm leading-relaxed whitespace-pre-line">{message.text}</div>
                        )}
                      </div>
                      <div className={`text-[10px] text-gray-400 mt-1 px-1 ${message.sender === "user" ? "text-right" : ""}`}>
                        {message.timestamp.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex gap-2">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-blue-600 to-purple-600">
                      <Bot className="w-3.5 h-3.5 text-white" />
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

              {/* Quick suggestions */}
              {!isTyping && (
                <div className="space-y-2">
                  <div className="text-xs text-gray-500 px-1">💡 Câu hỏi gợi ý:</div>
                  <div className="grid grid-cols-2 gap-2">
                    {quickSuggestions.map((q, idx) => (
                      <button
                        key={idx}
                        onClick={() => sendMessage(q)}
                        className="flex items-center gap-1 text-left px-3 py-2 bg-white border border-orange-200 text-orange-700 rounded-xl text-xs hover:border-orange-500 hover:bg-orange-50 hover:shadow-md transition-all"
                      >
                        <ChevronRight className="w-3 h-3 flex-shrink-0" />
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-gray-200 flex-shrink-0">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage(inputValue)}
                  placeholder="Nhập câu hỏi của bạn..."
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                />
                <button
                  onClick={() => sendMessage(inputValue)}
                  disabled={!inputValue.trim() || isTyping}
                  className="w-10 h-10 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <div className="text-[10px] text-gray-400 mt-2 text-center">
                Powered by UniPart AI · Phản hồi tức thì
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}