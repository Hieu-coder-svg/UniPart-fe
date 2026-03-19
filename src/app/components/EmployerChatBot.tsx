import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

export function EmployerChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Xin chào! Tôi là trợ lý AI của UniPart. Tôi có thể giúp bạn tư vấn về các gói dịch vụ, bảng giá và hướng dẫn tuyển dụng. Bạn cần hỗ trợ gì?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // AI Response Logic
  const getAIResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();

    // Pricing questions
    if (message.includes("giá") || message.includes("bảng giá") || message.includes("chi phí")) {
      if (message.includes("basic")) {
        return "Gói Basic có giá 2.700.000đ/tháng, bao gồm:\n\n✅ 60 tin thường/tháng\n✅ Tối đa 2 tin/ngày\n✅ 5 tin tuyển gấp\n✅ Hỗ trợ email\n✅ Thống kê cơ bản\n\nGói này phù hợp cho doanh nghiệp nhỏ có nhu cầu tuyển dụng vừa phải.";
      } else if (message.includes("advance") || message.includes("advanced")) {
        return "Gói Advance có giá 6.000.000đ/tháng - Đây là gói phổ biến nhất! Bao gồm:\n\n✅ 150 tin thường/tháng\n✅ Tối đa 5 tin/ngày\n✅ 10 tin tuyển gấp\n✅ Hỗ trợ ưu tiên\n✅ Hiển thị nổi bật\n✅ Thống kê chi tiết\n✅ Quản lý ứng viên\n\nTiết kiệm 55% so với mua lẻ!";
      } else if (message.includes("premium")) {
        return "Gói Premium có giá 10.500.000đ/tháng - Cho doanh nghiệp lớn:\n\n✅ 300 tin thường/tháng\n✅ Tối đa 10 tin/ngày\n✅ 20 tin tuyển gấp\n✅ Hỗ trợ 24/7\n✅ Hiển thị ưu tiên cao\n✅ Phân tích chi tiết\n✅ Tư vấn chiến lược\n✅ Account manager riêng\n\nLà lựa chọn tốt nhất cho doanh nghiệp có nhu cầu tuyển dụng thường xuyên.";
      } else {
        return "UniPart có 3 gói dịch vụ chính:\n\n📦 Basic: 2.700.000đ/tháng (60 tin)\n📦 Advance: 6.000.000đ/tháng (150 tin) - Phổ biến nhất\n📦 Premium: 10.500.000đ/tháng (300 tin)\n\nNgoài ra, bạn có thể mua lẻ:\n• 1 tin thường: 50.000đ\n• 1 tin tuyển gấp: 70.000đ\n\nBạn muốn tìm hiểu chi tiết gói nào?";
      }
    }

    // Comparison questions
    if (message.includes("so sánh") || message.includes("khác nhau") || message.includes("nên chọn")) {
      return "Gợi ý chọn gói phù hợp:\n\n🏢 Doanh nghiệp nhỏ (< 10 nhân viên):\n→ Gói Basic hoặc mua lẻ\n\n🏪 Doanh nghiệp vừa (10-50 nhân viên):\n→ Gói Advance (tiết kiệm 55%)\n\n🏭 Doanh nghiệp lớn (> 50 nhân viên):\n→ Gói Premium (có account manager riêng)\n\nBạn thuộc loại hình nào để tôi tư vấn cụ thể hơn?";
    }

    // Service questions
    if (message.includes("dịch vụ") || message.includes("tính năng") || message.includes("lợi ích")) {
      return "UniPart cung cấp các dịch vụ chính:\n\n🎯 Tìm kiếm thông minh: AI kết nối ứng viên phù hợp\n⭐ Hiển thị ưu tiên: Tin của bạn xuất hiện vị trí nổi bật\n📊 Phân tích chi tiết: Thống kê lượt xem, ứng viên\n👥 Quản lý ứng viên: Quản lý và phản hồi dễ dàng\n⚡ Đăng tin nhanh: Chỉ 3 phút để đăng tin\n✅ Ứng viên xác thực: Sinh viên xác thực qua email trường\n\nBạn quan tâm tính năng nào nhất?";
    }

    // How to post questions
    if (message.includes("đăng tin") || message.includes("tuyển dụng") || message.includes("hướng dẫn")) {
      return "Cách đăng tin tuyển dụng rất đơn giản:\n\n1️⃣ Đăng ký tài khoản miễn phí\n2️⃣ Chọn gói dịch vụ hoặc mua lẻ\n3️⃣ Điền thông tin công việc (chỉ 3 phút)\n4️⃣ Đăng tin và nhận CV ngay trong ngày!\n\n💡 Mẹo: Tin 'Tuyển gấp' được ưu tiên hiển thị và nhận CV nhanh hơn 3x!";
    }

    // Urgent hiring questions
    if (message.includes("gấp") || message.includes("khẩn cấp") || message.includes("urgent")) {
      return "Tin 'Tuyển gấp' có nhiều ưu điểm:\n\n⚡ Hiển thị ở vị trí TOP\n⚡ Badge đặc biệt thu hút ứng viên\n⚡ Nhận CV nhanh hơn 3x so với tin thường\n⚡ Push notification đến ứng viên phù hợp\n\nGiá: 70.000đ/tin (hoặc có sẵn trong gói)\n\nBạn có nhu cầu tuyển gấp không?";
    }

    // Payment questions
    if (message.includes("thanh toán") || message.includes("payment") || message.includes("chuyển khoản")) {
      return "Phương thức thanh toán linh hoạt:\n\n💳 Chuyển khoản ngân hàng\n💳 Ví điện tử (MoMo, ZaloPay)\n💳 Thẻ tín dụng/ghi nợ\n\n📝 Xuất hóa đơn VAT đầy đủ\n🔒 Thanh toán an toàn, bảo mật\n\nSau khi thanh toán, tài khoản được kích hoạt ngay lập tức!";
    }

    // Support questions
    if (message.includes("hỗ trợ") || message.includes("liên hệ") || message.includes("support")) {
      return "Bạn có thể liên hệ hỗ trợ qua:\n\n📞 Hotline: 1900-xxxx (8:00 - 22:00)\n📧 Email: support@unipart.vn\n💬 Live Chat: Trên website\n\nĐội ngũ hỗ trợ nhiệt tình, phản hồi trong 15 phút!\n\nGói Premium có Account Manager riêng hỗ trợ 24/7.";
    }

    // Student pool questions
    if (message.includes("sinh viên") || message.includes("ứng viên") || message.includes("student")) {
      return "Nguồn ứng viên của UniPart:\n\n👨‍🎓 Hơn 10,000 sinh viên hoạt động\n🎓 Từ các trường đại học uy tín\n✅ 100% xác thực qua email trường\n⭐ Đánh giá từ nhà tuyển dụng trước\n\nSinh viên trên UniPart:\n• Nhiệt tình, năng động\n• Sẵn sàng làm linh hoạt\n• Học hỏi nhanh chóng\n\nTỷ lệ hài lòng: 95%!";
    }

    // Trial questions
    if (message.includes("dùng thử") || message.includes("miễn phí") || message.includes("trial")) {
      return "🎁 Ưu đãi đặc biệt:\n\n✨ Đăng ký ngay hôm nay nhận:\n• 3 tin thường MIỄN PHÍ\n• 1 tin tuyển gấp MIỄN PHÍ\n• Tư v��n miễn phí từ chuyên gia\n\n⏰ Có hiệu lực 30 ngày\n🚀 Không cần thẻ tín dụng\n\nBạn muốn đăng ký dùng thử ngay?";
    }

    // Default response with suggestions
    return "Tôi có thể giúp bạn về:\n\n💰 Bảng giá & So sánh gói\n📦 Tính năng & Dịch vụ\n📝 Hướng dẫn đăng tin\n⚡ Tuyển dụng gấp\n💳 Thanh toán\n👨‍🎓 Nguồn ứng viên\n🎁 Ưu đãi miễn phí\n\nBạn quan tâm điều gì nhất?";
  };

  // Get contextual quick questions based on last message
  const getQuickQuestions = (): string[] => {
    if (messages.length <= 1) {
      // Initial questions
      return [
        "Bảng giá các gói?",
        "Gói nào phù hợp tôi?",
        "Tuyển gấp như thế nào?",
        "Ưu đãi miễn phí?",
      ];
    }

    const lastBotMessage = messages
      .slice()
      .reverse()
      .find((m) => m.sender === "bot")?.text.toLowerCase() || "";

    // After pricing info
    if (lastBotMessage.includes("basic") || lastBotMessage.includes("advance") || lastBotMessage.includes("premium")) {
      return [
        "So sánh các gói",
        "Tuyển gấp như thế nào?",
        "Cách thanh toán?",
        "Đăng tin như thế nào?",
      ];
    }

    // After urgent hiring info
    if (lastBotMessage.includes("tuyển gấp")) {
      return [
        "Bảng giá các gói?",
        "Nguồn ứng viên?",
        "Ưu đãi miễn phí?",
        "Liên hệ hỗ trợ?",
      ];
    }

    // After trial/promo info
    if (lastBotMessage.includes("miễn phí") || lastBotMessage.includes("ưu đãi")) {
      return [
        "Đăng ký ngay",
        "Bảng giá các gói?",
        "Tính năng gì?",
        "Cách thanh toán?",
      ];
    }

    // Default follow-up questions
    return [
      "Chi tiết gói Advance?",
      "Tuyển gấp như thế nào?",
      "Nguồn ứng viên?",
      "Liên hệ hỗ trợ?",
    ];
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate AI thinking delay
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getAIResponse(inputValue),
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000); // Random delay 1-2s for realism
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Quick questions
  const quickQuestions = getQuickQuestions();

  const handleQuickQuestion = (question: string) => {
    // Automatically send the message without needing to click send
    const userMessage: Message = {
      id: Date.now().toString(),
      text: question,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    // Simulate AI thinking delay
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getAIResponse(question),
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-full shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300 flex items-center justify-center group"
        >
          <MessageCircle className="w-7 h-7" />
          <span className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
          </span>
          
          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 px-4 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Tư vấn miễn phí
            <div className="absolute top-full right-4 -mt-1 border-4 border-transparent border-t-gray-900"></div>
          </div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <div className="font-semibold">Trợ lý AI UniPart</div>
                <div className="text-xs text-orange-100 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  Online - Phản hồi ngay
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`flex gap-2 max-w-[80%] ${
                    message.sender === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.sender === "user"
                        ? "bg-gradient-to-r from-orange-600 to-red-600"
                        : "bg-gradient-to-r from-blue-600 to-purple-600"
                    }`}
                  >
                    {message.sender === "user" ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <Bot className="w-4 h-4 text-white" />
                    )}
                  </div>

                  {/* Message bubble */}
                  <div>
                    <div
                      className={`rounded-2xl px-4 py-2 ${
                        message.sender === "user"
                          ? "bg-gradient-to-r from-orange-600 to-red-600 text-white"
                          : "bg-white text-gray-800 border border-gray-200"
                      }`}
                    >
                      <div className="text-sm whitespace-pre-line">{message.text}</div>
                    </div>
                    <div className="text-xs text-gray-400 mt-1 px-1">
                      {message.timestamp.toLocaleTimeString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex gap-2 max-w-[80%]">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-r from-blue-600 to-purple-600">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-white rounded-2xl px-4 py-3 border border-gray-200">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick questions - show after bot messages when not typing */}
            {!isTyping && messages.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs text-gray-500 px-1">💡 Câu hỏi gợi ý:</div>
                <div className="grid grid-cols-2 gap-2">
                  {quickQuestions.map((question, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQuickQuestion(question)}
                      className="text-left px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-700 hover:border-orange-500 hover:text-orange-600 hover:shadow-md transition-all"
                    >
                      {question}
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
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Nhập câu hỏi của bạn..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-orange-500 text-sm"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                className="w-10 h-10 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="text-xs text-gray-400 mt-2 text-center">
              Powered by UniPart AI • Phản hồi tức thì
            </div>
          </div>
        </div>
      )}
    </>
  );
}