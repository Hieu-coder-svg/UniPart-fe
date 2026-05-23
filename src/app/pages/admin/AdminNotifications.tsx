import { useEffect } from "react";
import { useSearchParams } from "react-router";
import { useNotifications } from "../../contexts/NotificationContext";
import { Bell, WifiOff, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

export default function AdminNotifications() {
  const {
    notifications,
    isConnected,
    markAsRead,
    currentPage,
    setCurrentPage,
    totalPages,
    totalElements,
    refetch
  } = useNotifications();

  const [searchParams, setSearchParams] = useSearchParams();
  const pageParam = searchParams.get("page");
  const parsedPage = pageParam ? Math.max(0, parseInt(pageParam) - 1) : 0;

  useEffect(() => {
    if (parsedPage !== currentPage) {
      setCurrentPage(parsedPage);
    }
  }, [parsedPage, currentPage, setCurrentPage]);

  const handlePageChange = (newPage: number) => {
    setSearchParams(
      (prev) => {
        if (newPage <= 0) {
          prev.delete("page");
        } else {
          prev.set("page", String(newPage + 1));
        }
        return prev;
      },
      { replace: true }
    );
  };

  useEffect(() => {
    refetch();
  }, [currentPage, refetch]);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 0; i < totalPages; i++) pages.push(i);
    } else {
      pages.push(0);
      let start = Math.max(1, currentPage - 1);
      let end = Math.min(totalPages - 2, currentPage + 1);

      if (currentPage <= 2) end = 3;
      else if (currentPage >= totalPages - 3) start = totalPages - 4;

      if (start > 1) pages.push("...");
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < totalPages - 2) pages.push("...");
      pages.push(totalPages - 1);
    }
    return pages;
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bell className="w-6 h-6 text-red-600" />
            Thông báo hệ thống
          </h1>
          <p className="text-gray-500 mt-1 flex items-center gap-2">
            Quản lý và xem các thông báo quan trọng từ hệ thống.
            {!isConnected && (
              <span className="flex items-center gap-1 text-xs text-orange-500 font-medium bg-orange-50 px-2 py-0.5 rounded-md">
                <WifiOff className="w-3.5 h-3.5" />
                Đang kết nối lại...
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Không có thông báo nào</h3>
            <p className="text-gray-500 mt-1">Bạn đã đọc hết tất cả các thông báo.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notif) => (
              <div 
                key={notif.id} 
                className={`p-5 flex gap-4 transition-colors hover:bg-gray-50 cursor-pointer ${!notif.isRead ? 'bg-red-50/30' : ''}`}
                onClick={async () => {
                  if (!notif.isRead) {
                    await markAsRead(notif.id);
                  }
                }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center gap-2">
                      <h4 className={`text-base font-semibold truncate ${!notif.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                        {notif.title}
                      </h4>
                      {!notif.isRead && (
                        <span className="w-2 h-2 rounded-full bg-red-600 flex-shrink-0"></span>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 whitespace-nowrap flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {notif.createdAt ? format(new Date(notif.createdAt), "dd/MM/yyyy HH:mm", { locale: vi }) : ""}
                    </span>
                  </div>
                  <p className={`text-sm ${!notif.isRead ? 'text-gray-700' : 'text-gray-500'}`}>
                    {notif.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {notifications.length > 0 && (
          <div className="p-5 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/50">
            <p className="text-sm text-gray-500 font-medium">
              Trang <span className="text-gray-900 font-semibold">{totalPages > 0 ? currentPage + 1 : 0}</span> / <span className="text-gray-900 font-semibold">{totalPages}</span>
              {totalElements !== undefined && (
                <span className="ml-1">(Tổng số {totalElements} thông báo)</span>
              )}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
                className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </button>
              
              {getPageNumbers().map((pageVal, idx) => {
                if (pageVal === "...") {
                  return <span key={`ellipsis-${idx}`} className="px-2 text-gray-400">...</span>;
                }
                const pageIdx = pageVal as number;
                const active = pageIdx === currentPage;
                return (
                  <button
                    key={pageIdx}
                    onClick={() => handlePageChange(pageIdx)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                      active
                        ? "bg-red-600 text-white shadow-md shadow-red-500/20"
                        : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {pageIdx + 1}
                  </button>
                );
              })}

              <button
                onClick={() => handlePageChange(Math.min(totalPages - 1, currentPage + 1))}
                disabled={currentPage >= totalPages - 1}
                className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
