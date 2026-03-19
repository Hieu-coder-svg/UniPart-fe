import { Search, Send, Paperclip, MoreVertical, Phone, Video, Star } from "lucide-react";
import { useState } from "react";

export default function EmployerMessages() {
  const [selectedChat, setSelectedChat] = useState(1);
  const [message, setMessage] = useState("");

  const conversations = [
    {
      id: 1,
      name: "Nguyễn Văn An",
      avatar: "A",
      lastMessage: "Em cảm ơn anh/chị đã phản hồi!",
      time: "10:30",
      unread: 2,
      online: true,
      job: "Nhân viên phục vụ",
    },
    {
      id: 2,
      name: "Trần Thị Bình",
      avatar: "B",
      lastMessage: "Em có thể bắt đầu làm việc từ tuần sau",
      time: "09:15",
      unread: 0,
      online: true,
      job: "Gia sư Toán",
    },
    {
      id: 3,
      name: "Lê Minh Châu",
      avatar: "C",
      lastMessage: "Cho em hỏi về ca làm việc ạ",
      time: "Hôm qua",
      unread: 0,
      online: false,
      job: "Nhân viên kho",
    },
  ];

  const messages = [
    {
      id: 1,
      sender: "them",
      content: "Chào anh/chị, em đã xem tin tuyển dụng và rất quan tâm đến vị trí này ạ.",
      time: "10:00",
    },
    {
      id: 2,
      sender: "me",
      content: "Chào em, cảm ơn em đã quan tâm. Em có thể cho biết kinh nghiệm của em không?",
      time: "10:05",
    },
    {
      id: 3,
      sender: "them",
      content: "Dạ em đã làm part-time tại Highlands Coffee được 6 tháng ạ. Em có kinh nghiệm phục vụ khách hàng và làm việc theo ca.",
      time: "10:10",
    },
    {
      id: 4,
      sender: "me",
      content: "Tuyệt vời! Em có thể làm ca tối từ 18h-22h không?",
      time: "10:25",
    },
    {
      id: 5,
      sender: "them",
      content: "Dạ được ạ, em có thể làm ca đó. Khi nào em có thể bắt đầu làm việc ạ?",
      time: "10:28",
    },
    {
      id: 6,
      sender: "me",
      content: "Em có thể bắt đầu từ tuần sau được không? Chúng tôi sẽ có buổi training vào thứ 2.",
      time: "10:29",
    },
    {
      id: 7,
      sender: "them",
      content: "Em cảm ơn anh/chị đã phản hồi!",
      time: "10:30",
    },
  ];

  const selectedConversation = conversations.find((c) => c.id === selectedChat);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">Tin nhắn</h1>
        <p className="text-gray-600 text-lg">Trò chuyện với ứng viên</p>
      </div>

      {/* Messages Layout */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-2xl" style={{ height: "calc(100vh - 250px)" }}>
        <div className="grid md:grid-cols-3 h-full">
          {/* Conversations List */}
          <div className="border-r-2 border-gray-100 flex flex-col">
            {/* Search */}
            <div className="p-4 border-b-2 border-gray-100 bg-gradient-to-r from-orange-50 to-red-50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm tin nhắn..."
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all bg-white"
                />
              </div>
            </div>

            {/* Conversation Items */}
            <div className="flex-1 overflow-y-auto">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedChat(conv.id)}
                  className={`w-full p-4 border-b-2 border-gray-100 hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 transition-all text-left ${
                    selectedChat === conv.id ? "bg-gradient-to-r from-orange-100 to-red-100 border-l-4 border-l-orange-600" : ""
                  }`}
                >
                  <div className="flex gap-3">
                    <div className="relative">
                      <div className="w-14 h-14 bg-gradient-to-br from-orange-600 to-red-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0 shadow-lg">
                        {conv.avatar}
                      </div>
                      {conv.online && (
                        <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full animate-pulse"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-semibold truncate text-gray-900">{conv.name}</h4>
                        <span className="text-xs text-gray-500 flex-shrink-0 ml-2">{conv.time}</span>
                      </div>
                      <p className="text-sm text-gray-600 truncate mb-1">{conv.lastMessage}</p>
                      <p className="text-xs text-orange-600 font-medium">{conv.job}</p>
                    </div>
                    {conv.unread > 0 && (
                      <div className="w-6 h-6 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 shadow-lg">
                        {conv.unread}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="md:col-span-2 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-6 border-b-2 border-gray-100 bg-gradient-to-r from-orange-50 to-red-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-red-600 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg">
                          {selectedConversation.avatar}
                        </div>
                        {selectedConversation.online && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full animate-pulse"></div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">{selectedConversation.name}</h3>
                        <p className="text-sm text-gray-600">
                          {selectedConversation.online ? "🟢 Đang hoạt động" : "⚪ Offline"}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-3 hover:bg-white rounded-xl transition-all shadow-md hover:shadow-lg">
                        <Phone className="w-5 h-5 text-orange-600" />
                      </button>
                      <button className="p-3 hover:bg-white rounded-xl transition-all shadow-md hover:shadow-lg">
                        <Video className="w-5 h-5 text-orange-600" />
                      </button>
                      <button className="p-3 hover:bg-white rounded-xl transition-all shadow-md hover:shadow-lg">
                        <MoreVertical className="w-5 h-5 text-gray-600" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-br from-gray-50 to-orange-50">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[75%] ${
                          msg.sender === "me"
                            ? "bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-xl"
                            : "bg-white text-gray-900 shadow-lg border-2 border-gray-100"
                        } rounded-2xl px-5 py-3 transition-all hover:scale-105`}
                      >
                        <p className="text-sm leading-relaxed">{msg.content}</p>
                        <p
                          className={`text-xs mt-2 ${
                            msg.sender === "me" ? "text-orange-100" : "text-gray-500"
                          }`}
                        >
                          {msg.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="p-6 border-t-2 border-gray-100 bg-white">
                  <div className="flex gap-3">
                    <button className="p-3 hover:bg-gradient-to-r hover:from-orange-100 hover:to-red-100 rounded-xl transition-all shadow-md hover:shadow-lg">
                      <Paperclip className="w-5 h-5 text-orange-600" />
                    </button>
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Nhập tin nhắn..."
                      className="flex-1 px-5 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && message.trim()) {
                          setMessage("");
                        }
                      }}
                    />
                    <button
                      onClick={() => {
                        if (message.trim()) {
                          setMessage("");
                        }
                      }}
                      className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 font-medium"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500 bg-gradient-to-br from-gray-50 to-orange-50">
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-orange-200 to-red-200 rounded-3xl flex items-center justify-center mx-auto mb-4">
                    <Send className="w-12 h-12 text-orange-600" />
                  </div>
                  <p className="text-xl font-semibold mb-2 text-gray-900">Chọn một cuộc trò chuyện</p>
                  <p className="text-sm text-gray-600">để bắt đầu nhắn tin với ứng viên</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
