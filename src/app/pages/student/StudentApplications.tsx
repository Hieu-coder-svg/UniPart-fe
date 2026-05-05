import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useAuth } from "../../contexts/AuthContext";
import { jobService, JobResponse } from "../../../services/jobService";
import { userService } from "../../../services/userService";
import { Loader2, FileText } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

export default function StudentApplications() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [applications, setApplications] = useState<JobResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!isAuthenticated) {
      setError("Vui lòng đăng nhập để xem lịch sử ứng tuyển.");
      setIsLoading(false);
      return;
    }

    const fetchApplications = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const studentRes = await userService.getStudentMyInfo();
        if (!studentRes.result) {
          throw new Error("Không lấy được thông tin sinh viên.");
        }

        const studentId = studentRes.result.id;
        const res = await jobService.getStudentJobHistory(studentId);
        if (res.result) {
          setApplications(res.result);
        }
      } catch (err: any) {
        setError(err.message || "Không thể tải lịch sử ứng tuyển.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplications();
  }, [authLoading, isAuthenticated]);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Lịch sử ứng tuyển</h1>
              <p className="text-sm text-gray-500">Xem lại tất cả các hồ sơ bạn đã ứng tuyển.</p>
            </div>
          </div>
          <Link
            to="/jobs"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
          >
            <span>Quay lại việc làm</span>
          </Link>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
              <p className="mt-4 text-gray-500">Đang tải lịch sử ứng tuyển...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center text-red-600">
              <p>{error}</p>
            </div>
          ) : applications.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <p className="text-lg font-semibold">Bạn chưa có hồ sơ ứng tuyển nào.</p>
              <p className="mt-2">Hãy tìm việc và ứng tuyển để xây dựng lịch sử của bạn.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {applications.map((application) => (
                <div key={application.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">{application.title}</h2>
                      <p className="text-sm text-gray-500">Nhà tuyển dụng: {application.employerName}</p>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 text-sm text-gray-600">
                      <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700">{application.status}</span>
                      <span>{application.createdAt ? format(new Date(application.createdAt), "dd/MM/yyyy HH:mm", { locale: vi }) : "-"}</span>
                    </div>
                  </div>
                  <p className="mt-3 text-gray-700">Địa điểm: <strong>{application.address}</strong></p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
