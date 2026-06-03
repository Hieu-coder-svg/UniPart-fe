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
    <div className="p-6 md:p-8 relative max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Thông báo hệ thống</h1>
          <p className="text-gray-500 flex items-center gap-2">
            Quản lý và xem các thông báo quan trọng từ hệ thống.
            {!isConnected && (
              <span className="flex items-center gap-1.5 text-xs text-orange-600 font-medium bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-200">
                <WifiOff className="w-3.5 h-3.5" />
                Đang kết nối lại...
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
              <Bell className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">Không có thông báo nào</h3>
            <p className="text-gray-500">Bạn đã đọc hết tất cả các thông báo.</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {notifications.map((notif, index) => (
              <div 
                key={notif.id} 
                className={`p-5 sm:px-6 flex flex-col sm:flex-row gap-4 transition-all cursor-pointer border-b border-gray-100 last:border-0 hover:bg-gray-50 ${
                  !notif.isRead ? 'bg-red-50/20' : 'bg-white'
                }`}
                onClick={async () => {
                  if (!notif.isRead) {
                    await markAsRead(notif.id);
                  }
                }}
              >
                {/* Icon Circle */}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm border ${
                  !notif.isRead 
                    ? 'bg-red-100 text-red-600 border-red-200' 
                    : 'bg-gray-50 text-gray-400 border-gray-200'
                }`}>
                  <Bell className="w-5 h-5" />
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <h4 className={`text-base font-bold truncate ${!notif.isRead ? 'text-gray-900' : 'text-gray-600'}`}>
                        {notif.title}
                      </h4>
                      {!notif.isRead && (
                        <span className="px-2 py-0.5 rounded-md bg-gradient-to-r from-red-500 to-pink-500 text-white text-[10px] font-bold uppercase tracking-wider whitespace-nowrap shadow-sm">
                          Mới
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 whitespace-nowrap flex items-center gap-1.5 font-medium bg-gray-100/80 px-2.5 py-1 rounded-lg border border-gray-200 w-fit">
                      <Clock className="w-3.5 h-3.5" />
                      {notif.createdAt ? format(new Date(notif.createdAt), "dd/MM/yyyy HH:mm", { locale: vi }) : ""}
                    </span>
                  </div>
                  <p className={`text-sm leading-relaxed ${!notif.isRead ? 'text-gray-700 font-medium' : 'text-gray-500'}`}>
                    {notif.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {notifications.length > 0 && (
          <div className="p-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/50">
            <p className="text-sm text-gray-500 font-medium">
              Trang <span className="text-gray-900 font-bold">{totalPages > 0 ? currentPage + 1 : 0}</span> / <span className="text-gray-900 font-bold">{totalPages}</span>
              {totalElements !== undefined && (
                <span className="ml-1 text-gray-400">(Tổng cộng {totalElements} thông báo)</span>
              )}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
                className="px-3 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center justify-center"
              >
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </button>
              
              <div className="flex items-center gap-1">
                {getPageNumbers().map((pageVal, idx) => {
                  if (pageVal === "...") {
                    return <span key={`ellipsis-${idx}`} className="px-1 text-gray-400">...</span>;
                  }
                  const pageIdx = pageVal as number;
                  const active = pageIdx === currentPage;
                  return (
                    <button
                      key={pageIdx}
                      onClick={() => handlePageChange(pageIdx)}
                      className={`min-w-[36px] h-9 px-2 rounded-lg text-sm font-bold transition-all ${
                        active
                          ? "bg-red-600 text-white shadow-md shadow-red-200 border border-red-600"
                          : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {pageIdx + 1}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => handlePageChange(Math.min(totalPages - 1, currentPage + 1))}
                disabled={currentPage >= totalPages - 1}
                className="px-3 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center justify-center"
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
