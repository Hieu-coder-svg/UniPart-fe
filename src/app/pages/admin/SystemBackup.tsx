import {
  Download, Upload, Database, Clock, CheckCircle,
  AlertCircle, Play, Calendar, X, RefreshCw, HardDrive,
  Loader2, FileArchive, Settings, HelpCircle, Info
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { backupService, BackupRecord, ScheduleConfig } from "../../../services/backupService";

export default function SystemBackup() {
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [backupProgress, setBackupProgress] = useState(0);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [restoreFile, setRestoreFile] = useState<File | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [schedule, setSchedule] = useState<ScheduleConfig>({
    fullEnabled: true,
    fullTime: "02:00",
    fullFrequency: "daily",
    incrementalEnabled: true,
    incrementalEvery: "6",
  });

  const [backupHistory, setBackupHistory] = useState<BackupRecord[]>([]);

  useEffect(() => {
    backupService.getHistory().then(setBackupHistory);
    backupService.getSchedule().then(setSchedule);
  }, []);

  const handleBackupNow = async () => {
    setIsBackingUp(true);
    setBackupProgress(0);

    // Simulate progress bar moving up to 90% while waiting for service
    const interval = setInterval(() => {
      setBackupProgress((prev) => {
        if (prev >= 90) return 90;
        return prev + 5;
      });
    }, 200);

    try {
      const newRecord = await backupService.createBackup("full");
      clearInterval(interval);
      setBackupProgress(100);

      setTimeout(() => {
        setBackupHistory((prev) => [newRecord, ...prev]);
        setIsBackingUp(false);
        toast.success("Sao lưu hoàn thành thành công!");
      }, 500);
    } catch (error) {
      clearInterval(interval);
      setIsBackingUp(false);
      toast.error("Sao lưu thất bại!");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setRestoreFile(file);
  };

  const handleRestore = async () => {
    if (!restoreFile) return;
    setIsRestoring(true);
    try {
      await backupService.restoreBackup(restoreFile);
      setIsRestoring(false);
      setShowRestoreModal(false);
      setRestoreFile(null);
      toast.success("Khôi phục dữ liệu thành công!");
    } catch (error) {
      setIsRestoring(false);
      toast.error("Khôi phục thất bại!");
    }
  };

  const handleDownload = async (backup: BackupRecord) => {
    const toastId = toast.loading("Đang chuẩn bị file tải xuống...");
    try {
      const datePart = backup.date.replace(/\//g, "-").replace(/ /g, "_").replace(/:/g, "-");
      const typePart = backup.type === "full" ? "full" : "gia-tang";
      const fileName = backup.fileName || `backup_${typePart}_${datePart}.zip`;

      await backupService.downloadBackup(backup.id, fileName);

      toast.success(`Đã tải xuống: ${fileName}`, { id: toastId });
    } catch (error: any) {
      console.error(error);
      let errMsg = "Tải xuống thất bại. Vui lòng đảm bảo backend đang chạy.";
      if (error.response?.status === 404) {
        errMsg = "API không tồn tại. Vui lòng Restart lại Backend Spring Boot!";
      } else if (error.response?.status === 401 || error.response?.status === 403) {
        errMsg = "Lỗi xác thực (401/403). Token của bạn không hợp lệ hoặc không đủ quyền.";
      }
      toast.error(errMsg, { id: toastId });
    }
  };

  const handleSaveSchedule = async () => {
    try {
      await backupService.updateSchedule(schedule);
      setShowScheduleModal(false);
      toast.success("Đã lưu cấu hình lịch sao lưu!");
    } catch (error) {
      toast.error("Không thể lưu cấu hình!");
    }
  };

  const totalBackups = backupHistory.length;
  const successCount = backupHistory.filter((b) => b.status === "completed").length;

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-1">Sao lưu Dữ liệu</h1>
          <p className="text-gray-500">Quản lý sao lưu và khôi phục dữ liệu hệ thống</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Quick Action Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Backup Now */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl p-6 text-white shadow-lg">
            <Database className="w-12 h-12 mb-4 opacity-80" />
            <h3 className="text-xl font-semibold mb-1">Sao lưu ngay</h3>
            <p className="text-sm opacity-80 mb-4">Tạo bản sao lưu toàn bộ hệ thống</p>
            {isBackingUp && (
              <div className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span>Đang sao lưu...</span>
                  <span>{backupProgress}%</span>
                </div>
                <div className="w-full bg-white/30 rounded-full h-2">
                  <div
                    className="bg-white h-2 rounded-full transition-all duration-100"
                    style={{ width: `${backupProgress}%` }}
                  />
                </div>
              </div>
            )}
            <button
              onClick={handleBackupNow}
              disabled={isBackingUp}
              className="w-full bg-white text-blue-600 px-4 py-2 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-blue-50 transition-colors disabled:opacity-60"
            >
              {isBackingUp ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Đang sao lưu...</>
              ) : (
                <><Play className="w-4 h-4" /> Bắt đầu</>
              )}
            </button>
          </div>

          {/* Restore */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl p-6 text-white shadow-lg">
            <Upload className="w-12 h-12 mb-4 opacity-80" />
            <h3 className="text-xl font-semibold mb-1">Khôi phục</h3>
            <p className="text-sm opacity-80 mb-4">Khôi phục từ bản sao lưu</p>
            <button
              onClick={() => setShowRestoreModal(true)}
              className="w-full bg-white text-purple-600 px-4 py-2 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-purple-50 transition-colors"
            >
              <Upload className="w-4 h-4" /> Chọn file
            </button>
          </div>

          {/* Schedule */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
            <Calendar className="w-12 h-12 mb-4 opacity-80" />
            <h3 className="text-xl font-semibold mb-1">Lịch tự động</h3>
            <p className="text-sm opacity-80 mb-4">Cấu hình sao lưu định kỳ</p>
            <button
              onClick={() => setShowScheduleModal(true)}
              className="w-full bg-white text-orange-600 px-4 py-2 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-orange-50 transition-colors"
            >
              <Calendar className="w-4 h-4" /> Cài đặt
            </button>
          </div>
        </div>

        {/* Schedule Status */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-4">Lịch sao lưu tự động</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border border-gray-100 rounded-xl bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-800">Sao lưu Dữ liệu</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${schedule.fullEnabled ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-500"}`}>
                  {schedule.fullEnabled ? "Đang hoạt động" : "Đã tắt"}
                </span>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2"><Clock className="w-4 h-4" /><span>Hàng ngày lúc {schedule.fullTime}</span></div>
              </div>
            </div>
            <div className="p-4 border border-gray-100 rounded-xl bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-800">Sao lưu gia tăng</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${schedule.incrementalEnabled ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-500"}`}>
                  {schedule.incrementalEnabled ? "Đang hoạt động" : "Đã tắt"}
                </span>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2"><Clock className="w-4 h-4" /><span>Mỗi {schedule.incrementalEvery} giờ</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* Backup History */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Lịch sử sao lưu</h2>
            <span className="text-sm text-gray-500">{totalBackups} bản sao lưu</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {["Loại", "Trạng thái", "Thời gian", "Hành động"].map((h, i) => (
                    <th key={i} className={`px-6 py-3 text-sm font-semibold text-gray-600 ${i === 3 ? "text-right" : "text-left"}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {backupHistory.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500 text-sm">
                      Chưa có bản sao lưu nào. Hãy tiến hành sao lưu ngay.
                    </td>
                  </tr>
                ) : (
                  backupHistory.map((b) => (
                    <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                          Database
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {b.status === "completed" ? (
                            <><CheckCircle className="w-4 h-4 text-green-500" /><span className="text-sm text-green-700">Hoàn thành</span></>
                          ) : b.status === "running" ? (
                            <><Loader2 className="w-4 h-4 text-blue-500 animate-spin" /><span className="text-sm text-blue-700">Đang chạy</span></>
                          ) : (
                            <><AlertCircle className="w-4 h-4 text-red-500" /><span className="text-sm text-red-700">Thất bại</span></>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{b.date}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {b.status === "completed" && (
                            <>
                              <button onClick={() => handleDownload(b)} title="Tải xuống" className="p-2 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                                <Download className="w-4 h-4 text-blue-600" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Restore Modal */}
      {showRestoreModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2"><FileArchive className="w-5 h-5 text-purple-600" /> Khôi phục dữ liệu</h3>
              <button onClick={() => { setShowRestoreModal(false); setRestoreFile(null); }} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4" /></button>
            </div>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-all"
            >
              <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
              {restoreFile ? (
                <p className="text-sm font-medium text-purple-700">{restoreFile.name}</p>
              ) : (
                <><p className="text-sm text-gray-500">Nhấn để chọn file backup</p><p className="text-xs text-gray-400 mt-1">.zip, .tar.gz, .sql</p></>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept=".zip,.gz,.sql,.tar" className="hidden" onChange={handleFileChange} />
            <div className="flex gap-3 mt-4">
              <button onClick={() => { setShowRestoreModal(false); setRestoreFile(null); }} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50">Hủy</button>
              <button
                onClick={handleRestore}
                disabled={!restoreFile || isRestoring}
                className="flex-1 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isRestoring ? <><Loader2 className="w-4 h-4 animate-spin" /> Đang khôi phục...</> : "Khôi phục"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold flex items-center gap-2"><Settings className="w-5 h-5 text-orange-600" /> Cài đặt lịch sao lưu</h3>
              <button onClick={() => setShowScheduleModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-5">
              <div className="p-4 border border-gray-100 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm">Sao lưu đầy đủ (Full)</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={schedule.fullEnabled} onChange={(e) => setSchedule(s => ({ ...s, fullEnabled: e.target.checked }))} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-checked:bg-orange-500 rounded-full peer transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5" />
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Giờ chạy</label>
                    <input type="time" value={schedule.fullTime} onChange={(e) => setSchedule(s => ({ ...s, fullTime: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Tần suất</label>
                    <select value={schedule.fullFrequency} onChange={(e) => setSchedule(s => ({ ...s, fullFrequency: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400">
                      <option value="daily">Hàng ngày</option>
                      <option value="weekly">Hàng tuần</option>
                      <option value="monthly">Hàng tháng</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="p-4 border border-gray-100 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm">Sao lưu gia tăng</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={schedule.incrementalEnabled} onChange={(e) => setSchedule(s => ({ ...s, incrementalEnabled: e.target.checked }))} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-checked:bg-orange-500 rounded-full peer transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5" />
                  </label>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Chạy mỗi (giờ)</label>
                  <select value={schedule.incrementalEvery} onChange={(e) => setSchedule(s => ({ ...s, incrementalEvery: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400">
                    {["1", "2", "3", "6", "12", "24"].map(v => <option key={v} value={v}>{v} giờ</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowScheduleModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50">Hủy</button>
              <button onClick={handleSaveSchedule} className="flex-1 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 transition-colors">Lưu cài đặt</button>
            </div>
          </div>
        </div>
      )}

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5 sticky top-0 bg-white pb-2 border-b border-gray-100 z-10">
              <h3 className="text-xl font-bold flex items-center gap-2 text-blue-700">
                <Info className="w-6 h-6" /> Hướng dẫn sao lưu dữ liệu
              </h3>
              <button onClick={() => setShowHelpModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-6 text-gray-700 text-sm">
              <p>
                Dựa trên giao diện quản trị UniPart, việc sao lưu dữ liệu được thực hiện một cách trực quan và dễ dàng. Hệ thống này hỗ trợ cả sao lưu tức thì và sao lưu tự động theo lịch trình, giúp bạn bảo vệ dữ liệu website một cách hiệu quả.
              </p>

              <div>
                <h4 className="font-bold text-lg text-gray-900 mb-2">1. Sao lưu ngay lập tức (Sao lưu ngay)</h4>
                <p className="mb-2">Tính năng này cho phép bạn tạo một bản sao lưu toàn bộ hệ thống ngay lập tức. Đây là lựa chọn lý tưởng khi bạn sắp thực hiện các thay đổi lớn trên website (ví dụ: cập nhật phiên bản, cài đặt plugin mới) và muốn có một bản sao lưu an toàn để khôi phục nếu có sự cố.</p>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="font-semibold mb-1">Các bước thực hiện:</p>
                  <ol className="list-decimal list-inside space-y-1 ml-1 text-gray-600">
                    <li>Trên giao diện Sao lưu Dữ liệu, tìm đến phần <strong>Sao lưu ngay</strong>.</li>
                    <li>Nhấp vào nút <strong>Bắt đầu</strong>.</li>
                  </ol>
                </div>
                <p className="mt-2 text-gray-500 italic text-xs">Hệ thống sẽ tiến hành tạo một bản sao lưu đầy đủ của toàn bộ dữ liệu website, bao gồm cơ sở dữ liệu, các file và nhật ký (logs). Quá trình này có thể mất một khoảng thời gian tùy thuộc vào dung lượng dữ liệu của bạn.</p>
              </div>

              <div>
                <h4 className="font-bold text-lg text-gray-900 mb-2">2. Cấu hình lịch sao lưu tự động (Lịch tự động)</h4>
                <p className="mb-2">Để đảm bảo dữ liệu luôn được bảo vệ mà không cần can thiệp thủ công, bạn nên thiết lập lịch sao lưu tự động. Giao diện UniPart cho phép bạn cấu hình các loại sao lưu khác nhau.</p>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-3">
                  <p className="font-semibold mb-1">Các bước thực hiện:</p>
                  <ol className="list-decimal list-inside space-y-1 ml-1 text-gray-600">
                    <li>Trên giao diện Sao lưu Dữ liệu, tìm đến phần <strong>Lịch tự động</strong>.</li>
                    <li>Nhấp vào nút <strong>Cài đặt</strong>.</li>
                  </ol>
                </div>
                <p className="mb-2">Sau khi nhấp vào Cài đặt, bạn sẽ được chuyển đến trang cấu hình nơi bạn có thể thiết lập tần suất, loại sao lưu (đầy đủ, gia tăng), và các thành phần cần sao lưu. Dựa trên hình ảnh, hệ thống của bạn đã có sẵn hai lịch sao lưu tự động đang hoạt động:</p>
                <ul className="list-disc list-inside space-y-2 ml-2 text-gray-600">
                  <li><strong>Sao lưu đầy đủ (Full):</strong> Thực hiện hàng ngày vào lúc 02:00 sáng, bao gồm Cơ sở dữ liệu, Các file và Nhật ký.</li>
                  <li><strong>Sao lưu gia tăng (Incremental):</strong> Thực hiện mỗi 6 giờ, chỉ bao gồm các thay đổi trong Cơ sở dữ liệu.</li>
                </ul>
                <p className="mt-2 text-gray-500 italic text-xs">Bạn có thể điều chỉnh các cài đặt này để phù hợp với nhu cầu cụ thể của website mình.</p>
              </div>

              <div>
                <h4 className="font-bold text-lg text-gray-900 mb-2">3. Khôi phục dữ liệu (Khôi phục)</h4>
                <p className="mb-2">Trong trường hợp cần thiết, bạn có thể khôi phục website từ một bản sao lưu đã có.</p>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-2">
                  <p className="font-semibold mb-1">Các bước thực hiện:</p>
                  <ol className="list-decimal list-inside space-y-1 ml-1 text-gray-600">
                    <li>Trên giao diện Sao lưu Dữ liệu, tìm đến phần <strong>Khôi phục</strong>.</li>
                    <li>Nhấp vào nút <strong>Chọn file</strong>.</li>
                  </ol>
                </div>
                <p className="text-gray-500 italic text-xs">Bạn sẽ cần chọn tệp sao lưu mà bạn muốn sử dụng để khôi phục. Hãy đảm bảo rằng bạn chọn đúng bản sao lưu và hiểu rõ tác động của việc khôi phục dữ liệu.</p>
              </div>

              <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl">
                <h4 className="font-bold text-blue-800 mb-2 flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Lời khuyên bổ sung</h4>
                <ul className="space-y-2 text-blue-900 text-sm">
                  <li><strong>Kiểm tra định kỳ:</strong> Thường xuyên kiểm tra các bản sao lưu để đảm bảo chúng hoạt động tốt và có thể khôi phục được. Đừng đợi đến khi sự cố xảy ra mới phát hiện bản sao lưu bị lỗi.</li>
                  <li><strong>Lưu trữ an toàn:</strong> Ngoài việc sao lưu trên hệ thống, hãy cân nhắc tải các bản sao lưu quan trọng về máy tính cá nhân hoặc lưu trữ trên các dịch vụ đám mây khác để có thêm một lớp bảo vệ.</li>
                </ul>
                <p className="mt-3 font-medium text-blue-800 text-center">Với các tính năng sao lưu và khôi phục được tích hợp sẵn trong UniPart, bạn có thể yên tâm hơn về sự an toàn của dữ liệu website.</p>
              </div>
            </div>

            <div className="mt-6 text-right">
              <button
                onClick={() => setShowHelpModal(false)}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
