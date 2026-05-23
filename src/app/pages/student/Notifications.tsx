import { useEffect, useRef } from "react";
import { useSearchParams, useLocation } from "react-router";
import { useNotifications } from "../../contexts/NotificationContext";
import { Bell, WifiOff, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

export default function Notifications() {
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
  const location = useLocation();
  const pageParam = searchParams.get("page");
  const parsedPage = pageParam ? Math.max(0, parseInt(pageParam) - 1) : 0;

  // 1. One-way sync: URL -> Context State
  useEffect(() => {
    if (parsedPage !== currentPage) {
      setCurrentPage(parsedPage);
    }
  }, [parsedPage, currentPage, setCurrentPage]);

  // 2. Function to handle page changes by updating the URL (Source of Truth)
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

  // 3. Refetch notifications when page changes
  useEffect(() => {
    refetch();
  }, [currentPage, refetch]);

  const isEmployer = location.pathname.startsWith("/employer");

  const colors = {
    iconBg: isEmployer ? "bg-orange-100 text-orange-600" : "bg-blue-100 text-blue-600",
    unreadItemBg: isEmployer ? "bg-orange-50/20" : "bg-blue-50/30",
    unreadDot: isEmployer ? "bg-orange-600" : "bg-blue-600",
    activeButton: isEmployer
      ? "bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-md shadow-orange-500/20 border-transparent"
      : "bg-blue-600 text-white shadow-md shadow-blue-500/20 border-transparent",
    hoverBg: isEmployer ? "hover:border-orange-500 hover:text-orange-600" : "hover:border-blue-500 hover:text-blue-600",
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 0; i < totalPages; i++) pages.push(i);
    } else {
      pages.push(0);

      let start = Math.max(1, currentPage - 1);
      let end = Math.min(totalPages - 2, currentPage + 1);

      if (currentPage <= 2) {
        end = 3;
      } else if (currentPage >= totalPages - 3) {
        start = totalPages - 4;
      }

      if (start > 1) {
        pages.push("...");
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 2) {
        pages.push("...");
      }

      pages.push(totalPages - 1);
    }

    return pages;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl ${colors.iconBg}`}>
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

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden p-6">
          {notifications.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg">Bạn chưa có thông báo nào.</p>
            </div>
          ) : (
            <>
              <div className="divide-y divide-gray-100 mb-6">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-6 -mx-6 transition-colors hover:bg-gray-50/80 flex items-start gap-4 cursor-pointer first:pt-0 last:pb-0 ${
                      !notif.isRead ? colors.unreadItemBg : ""
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
                          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${colors.unreadDot}`}></span>
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

              {/* Pagination Controls */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-100 mt-6">
                <p className="text-sm text-gray-500 font-medium">
                  Trang <span className="text-gray-900 font-semibold">{totalPages > 0 ? currentPage + 1 : 0}</span> trên <span className="text-gray-900 font-semibold">{totalPages}</span>
                  {totalElements !== undefined && (
                    <span className="ml-1">(Tổng số {totalElements} thông báo)</span>
                  )}
                </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(Math.max(0, currentPage - 1))}
                      disabled={currentPage === 0}
                      className={`p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                      title="Trang trước"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    
                    {getPageNumbers().map((pageVal, idx) => {
                      if (pageVal === "...") {
                        return (
                          <span
                            key={`ellipsis-${idx}`}
                            className="w-10 h-10 flex items-center justify-center text-gray-400 select-none text-sm font-bold"
                          >
                            ...
                          </span>
                        );
                      }
                      
                      const pageIdx = pageVal as number;
                      const active = pageIdx === currentPage;
                      return (
                        <button
                          key={pageIdx}
                          onClick={() => handlePageChange(pageIdx)}
                          className={`w-10 h-10 rounded-xl text-sm font-bold transition-all border ${
                            active
                              ? colors.activeButton
                              : `bg-white border-gray-200 text-gray-600 hover:bg-gray-50 ${colors.hoverBg}`
                          }`}
                        >
                          {pageIdx + 1}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => handlePageChange(Math.min(totalPages - 1, currentPage + 1))}
                      disabled={currentPage >= totalPages - 1}
                      className={`p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                      title="Trang sau"
                    >
                      <ChevronRight className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                </div>

            </>
          )}
        </div>
      </div>
    </div>
  );
}
