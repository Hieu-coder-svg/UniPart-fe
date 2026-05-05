import { useNotifications } from "../../contexts/NotificationContext";
import { Bell, Loader2, WifiOff } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

export default function Notifications() {
  const { notifications, isConnected, markAsRead, refetch } = useNotifications();

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Thông báo của bạn</h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                {!isConnected && (
                  <>
                    <WifiOff className="w-3.5 h-3.5 text-orange-400" />
                    <span className="text-xs text-orange-500 font-medium">Đang kết nối lại...</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {notifications.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg">Bạn chưa có thông báo nào.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-6 transition-colors hover:bg-gray-50 flex items-start gap-4 cursor-pointer ${
                    !notif.isRead ? "bg-blue-50/50" : ""
                  }`}
                  onClick={async () => {
                    if (!notif.isRead) {
                      await markAsRead(notif.id);
                    }
                  }}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`text-base font-semibold ${!notif.isRead ? "text-gray-900" : "text-gray-700"}`}>
                        {notif.title}
                      </h3>
                      {!notif.isRead && (
                        <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></span>
                      )}
                    </div>
                    <p className={`text-sm mb-2 ${!notif.isRead ? "text-gray-700" : "text-gray-500"}`}>
                      {notif.content}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">
                        {notif.createdAt
                          ? format(new Date(notif.createdAt), "dd/MM/yyyy HH:mm", { locale: vi })
                          : ""}
                      </span>
                      {notif.isRead && (
                        <span className="text-xs text-gray-500 font-medium">Đã đọc</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
