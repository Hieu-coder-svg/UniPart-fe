import React from "react";
import {
  Search,
  Filter,
  Download,
  Star,
  Mail,
  Phone,
  Calendar,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Eye,
  User,
  BookOpen,
  Briefcase,
  MapPin,
  MessageSquare,
  Loader2,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { applicationService, ApplicationResponse } from "../../../services/applicationService";
import { useApplicationRealTime } from "../../../hooks/useApplicationRealTime";
import { userService } from "../../../services/userService";
import { reviewService, ReviewResponse } from "../../../services/reviewService";
import { useAuth } from "../../contexts/AuthContext";

type TabStatus = "all" | "PENDING" | "ACCEPTED" | "REJECTED" | "COMPLETED";

const STATUS_CONFIG: Record<string, { label: string; className: string; icon: React.ElementType }> = {
  PENDING: {
    label: "Chờ xem xét",
    className: "bg-gradient-to-r from-yellow-500 to-orange-500 text-white",
    icon: Clock,
  },
  ACCEPTED: {
    label: "Đã chấp nhận",
    className: "bg-gradient-to-r from-green-500 to-emerald-500 text-white",
    icon: CheckCircle,
  },
  REJECTED: {
    label: "Từ chối",
    className: "bg-gradient-to-r from-red-500 to-red-600 text-white",
    icon: XCircle,
  },
  COMPLETED: {
    label: "Hoàn thành",
    className: "bg-gradient-to-r from-blue-500 to-blue-600 text-white",
    icon: Star,
  },
};

export default function EmployerApplicants() {
  const [activeTab, setActiveTab] = useState<TabStatus>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [applications, setApplications] = useState<ApplicationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<{
    id: number;
    name: string;
    avatar?: string;
    email: string;
    phone?: string;
    university?: string;
    major?: string;
    bio?: string;
    skills?: string[];
    experience?: string;
    cvUrl?: string;
    rating?: number;
    reviews?: ReviewResponse[];
  } | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // ── Review states ──
  const [reviewModal, setReviewModal] = useState<{
    applicationId: number;
    jobId: number;
    studentId: string;
    studentName: string;
    studentAvatar?: string;
    jobTitle: string;
  } | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewHover, setReviewHover] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  // Key = "studentId_jobId" to track which student+job combos have been reviewed
  const [reviewedMap, setReviewedMap] = useState<Record<string, ReviewResponse>>({});
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const makeReviewKey = (studentId: string, jobId: number) => `${studentId}_${jobId}`;

  // ── Review detail modal state ──
  const [reviewDetailModal, setReviewDetailModal] = useState<{
    studentName: string;
    jobTitle: string;
    employerReview: ReviewResponse | null;
    studentReview: ReviewResponse | null;
    loading: boolean;
  } | null>(null);

  const fetchApplications = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    if (showLoading) setError(null);
    try {
      const res = await applicationService.getEmployerApplications();
      if (res.result) {
        setApplications(res.result);
        // Fetch all reviews for each completed student to check review status
        const completedApps = res.result.filter(a => a.status === "COMPLETED");
        const uniqueStudentIds = [...new Set(completedApps.map(a => a.studentId))];
        for (const studentId of uniqueStudentIds) {
          try {
            const reviewRes = await reviewService.getReviewsByStudentId(studentId);
            if (reviewRes.result) {
              // Only keep EMPLOYER_TO_STUDENT reviews
              const employerReviews = reviewRes.result.filter(r => r.reviewType === "EMPLOYER_TO_STUDENT");
              const newEntries: Record<string, ReviewResponse> = {};
              for (const review of employerReviews) {
                newEntries[makeReviewKey(review.studentId, review.jobId)] = review;
              }
              if (Object.keys(newEntries).length > 0) {
                setReviewedMap(prev => ({ ...prev, ...newEntries }));
              }
            }
          } catch {
            // No reviews yet — ignore
          }
        }
      }
    } catch (err) {
      console.error("Error fetching applications:", err);
      if (showLoading) setError("Không thể tải danh sách ứng viên. Vui lòng thử lại.");
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // --- WebSocket real-time: listen for new application notifications ---
  useApplicationRealTime({
    onNewApplication: () => {
      fetchApplications(false); // Silent refresh on new application
    },
  });

  // --- Polling fallback (every 10s) in case WebSocket drops ---
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchApplications(false);
    }, 10000);
    return () => clearInterval(intervalId);
  }, []);

  // --- Initial load ---
  useEffect(() => {
    fetchApplications(true);
  }, []);

  // --- Computed stats ---
  const stats = useMemo(() => {
    const uniqueStudents = new Set(applications.map((a) => a.studentId)).size;
    const totalApplications = applications.length;
    const pending = applications.filter((a) => a.status === "PENDING").length;
    const accepted = applications.filter((a) => a.status === "ACCEPTED").length;
    const rejected = applications.filter((a) => a.status === "REJECTED").length;
    return [
      {
        label: "Tổng ứng viên",
        value: uniqueStudents,
        sub: totalApplications !== uniqueStudents ? `${totalApplications} đơn` : null,
        color: "from-blue-500 to-blue-600",
      },
      { label: "Chờ xem xét", value: pending, sub: null, color: "from-yellow-500 to-orange-500" },
      { label: "Đã chấp nhận", value: accepted, sub: null, color: "from-green-500 to-emerald-500" },
      { label: "Đã từ chối", value: rejected, sub: null, color: "from-red-500 to-red-600" },
    ];
  }, [applications]);

  // --- Tab counts ---
  const tabCounts = useMemo(() => ({
    all: applications.length,
    PENDING: applications.filter((a) => a.status === "PENDING").length,
    ACCEPTED: applications.filter((a) => a.status === "ACCEPTED").length,
    REJECTED: applications.filter((a) => a.status === "REJECTED").length,
    COMPLETED: applications.filter((a) => a.status === "COMPLETED").length,
  }), [applications]);

  // --- Filtered list ---
  const filteredApplicants = useMemo(() => {
    return applications.filter((app) => {
      const matchesTab = activeTab === "all" || app.status === activeTab;
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        app.studentName.toLowerCase().includes(searchLower) ||
        (app.jobTitle && app.jobTitle.toLowerCase().includes(searchLower)) ||
        (app.studentEmail && app.studentEmail.toLowerCase().includes(searchLower)) ||
        (app.studentUniversity && app.studentUniversity.toLowerCase().includes(searchLower));
      return matchesTab && matchesSearch;
    });
  }, [applications, activeTab, searchTerm]);

  // --- Actions ---
  const handleAccept = async (id: number) => {
    setUpdatingId(id);
    try {
      const res = await applicationService.acceptApplication(id);
      if (res.result) {
        setApplications((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status: res.result!.status } : a))
        );
      }
    } catch (err) {
      console.error("Error accepting application:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleReject = async (id: number) => {
    setUpdatingId(id);
    try {
      const res = await applicationService.rejectApplication(id);
      if (res.result) {
        setApplications((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status: res.result!.status } : a))
        );
      }
    } catch (err) {
      console.error("Error rejecting application:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleComplete = async (id: number) => {
    setUpdatingId(id);
    try {
      const res = await applicationService.completeApplication(id);
      if (res.result) {
        setApplications((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status: res.result!.status } : a))
        );
      }
    } catch (err) {
      console.error("Error completing application:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  // ── Review handler ──
  const handleOpenReview = (applicant: ApplicationResponse) => {
    setReviewModal({
      applicationId: applicant.id,
      jobId: applicant.jobId,
      studentId: applicant.studentId,
      studentName: applicant.studentName,
      studentAvatar: applicant.studentAvatar,
      jobTitle: applicant.jobTitle,
    });
    setReviewRating(5);
    setReviewHover(0);
    setReviewComment("");
    setReviewSuccess(false);
  };

  const handleSubmitReview = async () => {
    if (!reviewModal) return;
    if (!reviewComment.trim()) return;
    setSubmittingReview(true);
    try {
      const res = await reviewService.employerReviewStudent({
        jobId: reviewModal.jobId,
        studentId: reviewModal.studentId,
        rating: reviewRating,
        comment: reviewComment.trim(),
      });
      if (res.result) {
        const key = makeReviewKey(reviewModal.studentId, reviewModal.jobId);
        setReviewedMap(prev => ({
          ...prev,
          [key]: res.result!,
        }));
        setReviewSuccess(true);
        // Auto close after 2s
        setTimeout(() => {
          setReviewModal(null);
          setReviewSuccess(false);
        }, 2000);
      }
    } catch (err) {
      console.error("Error submitting review:", err);
    } finally {
      setSubmittingReview(false);
    }
  };

  // ── View review detail handler ──
  const handleViewReviewDetail = async (applicant: ApplicationResponse) => {
    const reviewKey = makeReviewKey(applicant.studentId, applicant.jobId);
    const myReview = reviewedMap[reviewKey] || null;

    setReviewDetailModal({
      studentName: applicant.studentName,
      jobTitle: applicant.jobTitle,
      employerReview: myReview,
      studentReview: null,
      loading: true,
    });

    // Fetch student's review for this employer
    try {
      const res = await reviewService.getReviewsWrittenByStudent(applicant.studentId);
      if (res.result) {
        // Find the review from this specific student for this specific job
        const studentReview = res.result.find(
          r => r.jobId == applicant.jobId
        ) || null;
        setReviewDetailModal(prev => prev ? { ...prev, studentReview, loading: false } : null);
      } else {
        setReviewDetailModal(prev => prev ? { ...prev, loading: false } : null);
      }
    } catch {
      setReviewDetailModal(prev => prev ? { ...prev, loading: false } : null);
    }
  };

  const handleViewProfile = async (studentId: number, studentName: string, studentEmail: string, studentPhone?: string, studentUniversity?: string, studentMajor?: string) => {
    setLoadingProfile(true);
    try {
      const [res, reviewsRes] = await Promise.all([
        userService.getStudentById(studentId),
        reviewService.getReviewsByStudentId(studentId.toString()).catch(() => null)
      ]);

      let averageRating = 0;
      let employerReviews: ReviewResponse[] = [];
      if (reviewsRes && reviewsRes.result) {
        employerReviews = reviewsRes.result.filter(r => r.reviewType === "EMPLOYER_TO_STUDENT");
        if (employerReviews.length > 0) {
          averageRating = employerReviews.reduce((acc, r) => acc + r.rating, 0) / employerReviews.length;
        }
      }

      if (res.result) {
        // Parse skills from string to array if needed
        let skills: string[] | undefined = res.result.skills;
        if (typeof skills === 'string' && skills) {
          try {
            skills = JSON.parse(skills);
          } catch {
            skills = skills.split(',').map((s: string) => s.trim()).filter(Boolean);
          }
        }
        
        setSelectedStudent({
          id: studentId,
          name: res.result.fullName || studentName,
          avatar: res.result.avatar,
          email: res.result.email || studentEmail,
          phone: res.result.phoneNumber || studentPhone,
          university: res.result.university || studentUniversity,
          major: res.result.major || studentMajor,
          bio: res.result.bio,
          skills: skills,
          experience: res.result.experience,
          cvUrl: res.result.cvUrl,
          rating: averageRating,
          reviews: employerReviews,
        });
      } else {
        setSelectedStudent({
          id: studentId,
          name: studentName,
          email: studentEmail,
          phone: studentPhone,
          university: studentUniversity,
          major: studentMajor,
          rating: averageRating,
          reviews: employerReviews,
        });
      }
    } catch {
      setSelectedStudent({
        id: studentId,
        name: studentName,
        email: studentEmail,
        phone: studentPhone,
        university: studentUniversity,
        major: studentMajor,
        rating: 0,
      });
    } finally {
      setLoadingProfile(false);
    }
  };

  const tabs: { key: TabStatus; label: string }[] = [
    { key: "all", label: "Tất cả" },
    { key: "PENDING", label: "Chờ xem xét" },
    { key: "ACCEPTED", label: "Đã chấp nhận" },
    { key: "REJECTED", label: "Từ chối" },
    { key: "COMPLETED", label: "Hoàn thành" },
  ];

  return (
    <>
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Quản lý ứng viên
          </h1>
          <p className="text-gray-600 text-lg">
            Xem và quản lý các ứng viên ứng tuyển vào vị trí của bạn
          </p>
        </div>
        <button
          onClick={fetchApplications}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 border-2 border-gray-200 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition-all font-medium disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          <span>Làm mới</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading
          ? Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg animate-pulse"
              >
                <div className="h-10 bg-gray-200 rounded mb-2 w-16" />
                <div className="h-4 bg-gray-100 rounded w-24" />
              </div>
            ))
          : stats.map((stat, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-300 group cursor-pointer"
              >
                <div
                  className={`text-4xl font-bold mb-1 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}
                >
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
                {stat.sub && (
                  <div className="text-xs text-gray-400 mt-1">({stat.sub})</div>
                )}
              </div>
            ))}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3 text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm ứng viên, vị trí, trường..."
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
            />
          </div>
          <button className="flex items-center gap-2 px-6 py-3 border-2 border-gray-200 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition-all font-medium">
            <Filter className="w-5 h-5" />
            <span>Lọc</span>
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 font-medium">
            <Download className="w-5 h-5" />
            <span>Xuất Excel</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mt-6 border-b-2 border-gray-200 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-6 py-3 -mb-0.5 border-b-4 transition-all font-medium whitespace-nowrap ${
                activeTab === tab.key
                  ? "border-orange-600 text-orange-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab.label} ({tabCounts[tab.key]})
            </button>
          ))}
        </div>
      </div>

      {/* Applicants List */}
      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-gray-100 p-6 shadow-lg animate-pulse"
            >
              <div className="flex gap-4">
                <div className="w-20 h-20 bg-gray-200 rounded-2xl flex-shrink-0" />
                <div className="flex-1 space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-40" />
                  <div className="h-4 bg-gray-100 rounded w-64" />
                  <div className="h-4 bg-gray-100 rounded w-48" />
                </div>
              </div>
            </div>
          ))
        ) : filteredApplicants.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 shadow-lg text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-500 mb-2">
              {searchTerm ? "Không tìm thấy ứng viên" : "Chưa có ứng viên nào"}
            </h3>
            <p className="text-gray-400">
              {searchTerm
                ? "Thử tìm với từ khóa khác"
                : "Ứng viên sẽ xuất hiện khi họ ứng tuyển vào vị trí của bạn"}
            </p>
          </div>
        ) : (
          filteredApplicants.map((applicant) => {
            const statusCfg = STATUS_CONFIG[applicant.status] || STATUS_CONFIG["PENDING"];
            const StatusIcon = statusCfg.icon;
            const isUpdating = updatingId === applicant.id;

            return (
              <div
                key={applicant.id}
                className="bg-white rounded-2xl border border-gray-100 p-6 shadow-lg hover:shadow-2xl hover:border-orange-300 transition-all duration-300 group"
              >
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Avatar & Basic Info */}
                  <div className="flex gap-4">
                    {applicant.studentAvatar ? (
                      <img
                        src={applicant.studentAvatar}
                        alt={applicant.studentName}
                        className="w-20 h-20 rounded-2xl object-cover shadow-xl group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div
                      className={`w-20 h-20 bg-gradient-to-br from-orange-600 to-red-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold flex-shrink-0 shadow-xl group-hover:scale-110 transition-transform duration-300 ${applicant.studentAvatar ? 'hidden' : ''}`}
                    >
                      {applicant.studentName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2 text-gray-900 group-hover:text-orange-600 transition-colors">
                        {applicant.studentName}
                      </h3>
                      <div className="space-y-1.5 text-sm text-gray-600">
                        {applicant.studentEmail && (
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-orange-500" />
                            <span>{applicant.studentEmail}</span>
                          </div>
                        )}
                        {applicant.studentPhone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-orange-500" />
                            <span>{applicant.studentPhone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex-1 grid sm:grid-cols-2 gap-4">
                    {applicant.studentUniversity && (
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl">
                        <div className="text-sm text-blue-600 mb-1 font-medium">Trường học</div>
                        <div className="text-gray-900 font-semibold">{applicant.studentUniversity}</div>
                      </div>
                    )}
                    {applicant.studentMajor && (
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl">
                        <div className="text-sm text-purple-600 mb-1 font-medium">Chuyên ngành</div>
                        <div className="text-gray-900 font-semibold">{applicant.studentMajor}</div>
                      </div>
                    )}
                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl">
                      <div className="text-sm text-green-600 mb-1 font-medium">Vị trí ứng tuyển</div>
                      <div className="text-gray-900 font-semibold">{applicant.jobTitle}</div>
                    </div>
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl">
                      <div className="text-sm text-orange-600 mb-1 font-medium">Ngày ứng tuyển</div>
                      <div className="text-gray-900 font-semibold">
                        {new Date(applicant.appliedAt).toLocaleDateString("vi-VN")}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-3 lg:min-w-[180px]">
                    {/* Status badge */}
                    <span
                      className={`px-4 py-2 rounded-xl text-sm text-center font-medium shadow-lg flex items-center justify-center gap-2 ${statusCfg.className}`}
                    >
                      <StatusIcon className="w-4 h-4" />
                      {statusCfg.label}
                    </span>

                    {/* Accept button — only when PENDING */}
                    {applicant.status === "PENDING" && (
                      <button
                        onClick={() => handleAccept(applicant.id)}
                        disabled={isUpdating}
                        className="px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isUpdating ? "Đang xử lý..." : "✓ Chấp nhận"}
                      </button>
                    )}

                    {/* Reject button — only when PENDING */}
                    {applicant.status === "PENDING" && (
                      <button
                        onClick={() => handleReject(applicant.id)}
                        disabled={isUpdating}
                        className="px-4 py-3 border-2 border-red-200 text-red-600 rounded-xl hover:bg-red-50 hover:border-red-400 transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isUpdating ? "Đang xử lý..." : "✕ Từ chối"}
                      </button>
                    )}

                    {/* Complete button — only when ACCEPTED */}
                    {applicant.status === "ACCEPTED" && (
                      <button
                        onClick={() => handleComplete(applicant.id)}
                        disabled={isUpdating}
                        className="px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isUpdating ? "Đang xử lý..." : "✓ Hoàn thành"}
                      </button>
                    )}

                    {/* Review button — only when COMPLETED */}
                    {applicant.status === "COMPLETED" && (() => {
                      const reviewKey = makeReviewKey(applicant.studentId, applicant.jobId);
                      const existingReview = reviewedMap[reviewKey];
                      return existingReview ? (
                        <button
                          onClick={() => handleViewReviewDetail(applicant)}
                          className="px-4 py-3 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl text-sm font-medium flex items-center justify-center gap-2 text-amber-700 hover:border-amber-400 hover:shadow-md transition-all cursor-pointer"
                        >
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                          Đã đánh giá ({existingReview.rating}/5)
                        </button>
                      ) : (
                        <button
                          onClick={() => handleOpenReview(applicant)}
                          className="px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 text-sm font-medium flex items-center justify-center gap-2"
                        >
                          <Star className="w-4 h-4" />
                          Đánh giá
                        </button>
                      );
                    })()}

                    {/* View reviews button — always show for COMPLETED */}
                    {applicant.status === "COMPLETED" && (
                      <button
                        onClick={() => handleViewReviewDetail(applicant)}
                        className="px-4 py-3 border-2 border-purple-200 text-purple-600 rounded-xl hover:bg-purple-50 hover:border-purple-400 transition-all text-sm font-medium flex items-center justify-center gap-2"
                      >
                        <MessageSquare className="w-4 h-4" />
                        Xem đánh giá
                      </button>
                    )}

                    {/* View Profile button */}
                    <button
                      onClick={() => handleViewProfile(
                        applicant.studentId,
                        applicant.studentName,
                        applicant.studentEmail,
                        applicant.studentPhone,
                        applicant.studentUniversity,
                        applicant.studentMajor
                      )}
                      className="px-4 py-3 border-2 border-blue-200 text-blue-600 rounded-xl hover:bg-blue-50 hover:border-blue-400 transition-all text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Xem hồ sơ
                    </button>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-6 pt-4 border-t-2 border-gray-100 flex flex-wrap gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-orange-500" />
                    <span>
                      Ứng tuyển ngày:{" "}
                      <strong>{new Date(applicant.appliedAt).toLocaleDateString("vi-VN")}</strong>
                    </span>
                  </div>
                  {applicant.completedAt && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>
                        Hoàn thành:{" "}
                        <strong>{new Date(applicant.completedAt).toLocaleDateString("vi-VN")}</strong>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── Student Profile Modal ── */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl">
          {loadingProfile ? (
            <div className="p-8 flex flex-col items-center justify-center">
              <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4" />
              <p className="text-gray-500">Đang tải hồ sơ...</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold">Hồ sơ ứng viên</h3>
                  <button
                    onClick={() => setSelectedStudent(null)}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                {/* Avatar & Name */}
                <div className="flex items-center gap-4 mb-6">
                  {selectedStudent.avatar ? (
                    <img
                      src={selectedStudent.avatar}
                      alt={selectedStudent.name}
                      className="w-20 h-20 rounded-full object-cover shadow-lg"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div
                    className={`w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg ${selectedStudent.avatar ? 'hidden' : ''}`}
                  >
                    {selectedStudent.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold text-gray-900">{selectedStudent.name}</h4>
                    <p className="text-gray-500">{selectedStudent.email}</p>
                    {selectedStudent.rating !== undefined && selectedStudent.rating > 0 && (
                      <div className="flex items-center gap-1 mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= Math.round(selectedStudent.rating!)
                                ? "fill-amber-400 text-amber-400"
                                : "fill-gray-200 text-gray-200"
                            }`}
                          />
                        ))}
                        <span className="text-sm font-medium text-gray-600 ml-1">
                          ({selectedStudent.rating.toFixed(1)})
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Info Grid */}
                <div className="space-y-4">
                  {selectedStudent.phone && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <Phone className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-xs text-gray-500">Số điện thoại</p>
                        <p className="font-medium text-gray-900">{selectedStudent.phone}</p>
                      </div>
                    </div>
                  )}

                  {selectedStudent.university && (
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-xs text-blue-500">Trường học</p>
                        <p className="font-medium text-gray-900">{selectedStudent.university}</p>
                      </div>
                    </div>
                  )}

                  {selectedStudent.major && (
                    <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl">
                      <User className="w-5 h-5 text-purple-600" />
                      <div>
                        <p className="text-xs text-purple-500">Chuyên ngành</p>
                        <p className="font-medium text-gray-900">{selectedStudent.major}</p>
                      </div>
                    </div>
                  )}

                  {selectedStudent.bio && (
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <p className="text-xs text-gray-500 font-medium">Giới thiệu</p>
                      </div>
                      <p className="text-gray-700">{selectedStudent.bio}</p>
                    </div>
                  )}

                  {selectedStudent.skills && selectedStudent.skills.length > 0 && (
                    <div className="p-4 bg-green-50 rounded-xl">
                      <div className="flex items-center gap-2 mb-3">
                        <Briefcase className="w-4 h-4 text-green-600" />
                        <p className="text-xs text-green-500 font-medium">Kỹ năng</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedStudent.skills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedStudent.experience && (
                    <div className="p-4 bg-amber-50 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <Briefcase className="w-4 h-4 text-amber-600" />
                        <p className="text-xs text-amber-500 font-medium">Kinh nghiệm</p>
                      </div>
                      <p className="text-gray-700 whitespace-pre-line">{selectedStudent.experience}</p>
                    </div>
                  )}

                  {selectedStudent.cvUrl && (
                    <a
                      href={selectedStudent.cvUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full p-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all font-medium"
                    >
                      <Download className="w-5 h-5" />
                      Tải CV
                    </a>
                  )}

                  {selectedStudent.reviews && selectedStudent.reviews.length > 0 && (
                    <div className="pt-4 mt-2 border-t border-gray-100">
                      <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-amber-500" />
                        Đánh giá từ nhà tuyển dụng
                      </h4>
                      <div className="space-y-3">
                        {selectedStudent.reviews.map((review) => (
                          <div key={review.id} className="p-4 bg-amber-50/50 rounded-xl border border-amber-100/50">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`w-3.5 h-3.5 ${star <= review.rating ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"}`}
                                  />
                                ))}
                              </div>
                              <span className="text-xs text-gray-500">
                                {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                              </span>
                            </div>
                            {review.comment && (
                              <p className="text-sm text-gray-700 italic">"{review.comment}"</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    )}

    {/* ── Review Modal ── */}
    {reviewModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => !submittingReview && setReviewModal(null)}>
        <div
          className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl transform transition-all"
          onClick={e => e.stopPropagation()}
        >
          {reviewSuccess ? (
            /* ── Success state ── */
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-bounce">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Đánh giá thành công!</h3>
              <p className="text-gray-500">Cảm ơn bạn đã đánh giá sinh viên.</p>
            </div>
          ) : (
            <>
              {/* ── Header ── */}
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                      <Star className="w-5 h-5 fill-white text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">Đánh giá sinh viên</h3>
                      <p className="text-sm text-white/80">Chia sẻ nhận xét của bạn</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setReviewModal(null)}
                    disabled={submittingReview}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors disabled:opacity-50"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* ── Content ── */}
              <div className="p-6 space-y-6">
                {/* Student info */}
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-md overflow-hidden">
                    {reviewModal.studentAvatar ? (
                      <img
                        src={reviewModal.studentAvatar}
                        alt={reviewModal.studentName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <span className={reviewModal.studentAvatar ? 'hidden' : ''}>{reviewModal.studentName.charAt(0).toUpperCase()}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{reviewModal.studentName}</h4>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5" />
                      {reviewModal.jobTitle}
                    </p>
                  </div>
                </div>

                {/* Star rating */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Đánh giá sao</label>
                  <div className="flex items-center justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        onMouseEnter={() => setReviewHover(star)}
                        onMouseLeave={() => setReviewHover(0)}
                        className="group transition-all duration-200 hover:scale-125 focus:outline-none"
                      >
                        <Star
                          className={`w-10 h-10 transition-all duration-200 ${
                            star <= (reviewHover || reviewRating)
                              ? "fill-amber-400 text-amber-400 drop-shadow-md"
                              : "fill-gray-200 text-gray-200 group-hover:fill-amber-200 group-hover:text-amber-200"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <div className="text-center mt-2">
                    <span className="text-sm font-medium text-gray-500">
                      {reviewRating === 1 && "Không tốt"}
                      {reviewRating === 2 && "Cần cải thiện"}
                      {reviewRating === 3 && "Bình thường"}
                      {reviewRating === 4 && "Tốt"}
                      {reviewRating === 5 && "Xuất sắc"}
                    </span>
                  </div>
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <MessageSquare className="w-4 h-4 inline mr-1.5" />
                    Nhận xét
                  </label>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Chia sẻ trải nghiệm làm việc với sinh viên này..."
                    rows={4}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all resize-none text-sm"
                  />
                  <p className="text-xs text-gray-400 mt-1.5">
                    {reviewComment.length}/500 ký tự
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setReviewModal(null)}
                    disabled={submittingReview}
                    className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-all font-medium disabled:opacity-50"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleSubmitReview}
                    disabled={submittingReview || !reviewComment.trim()}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {submittingReview ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Đang gửi...
                      </>
                    ) : (
                      <>
                        <Star className="w-4 h-4" />
                        Gửi đánh giá
                      </>
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    )}

    {/* ── Review Detail Modal ── */}
    {reviewDetailModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setReviewDetailModal(null)}>
        <div
          className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl transform transition-all"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Chi tiết đánh giá</h3>
                  <p className="text-sm text-white/80">{reviewDetailModal.studentName} — {reviewDetailModal.jobTitle}</p>
                </div>
              </div>
              <button
                onClick={() => setReviewDetailModal(null)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)] space-y-6">

            {reviewDetailModal.loading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="w-10 h-10 text-purple-500 animate-spin mb-3" />
                <p className="text-gray-500 text-sm">Đang tải đánh giá...</p>
              </div>
            ) : (
              <>
                {/* ── Employer's review of student ── */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
                      <Star className="w-4 h-4 text-white fill-white" />
                    </div>
                    <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Đánh giá của bạn cho sinh viên</h4>
                  </div>
                  {reviewDetailModal.employerReview ? (
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-5">
                      {/* Star display */}
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map(s => (
                            <Star
                              key={s}
                              className={`w-5 h-5 ${s <= reviewDetailModal.employerReview!.rating ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"}`}
                            />
                          ))}
                        </div>
                        <span className="text-lg font-bold text-amber-700">{reviewDetailModal.employerReview.rating}/5</span>
                      </div>
                      {/* Comment */}
                      {reviewDetailModal.employerReview.comment && (
                        <p className="text-gray-700 text-sm leading-relaxed italic">
                          "{reviewDetailModal.employerReview.comment}"
                        </p>
                      )}
                      {/* Date */}
                      <p className="text-xs text-amber-600/60 mt-3">
                        {new Date(reviewDetailModal.employerReview.createdAt).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  ) : (
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 text-center">
                      <Star className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-400 text-sm">Bạn chưa đánh giá sinh viên này</p>
                    </div>
                  )}
                </div>

                {/* Divider */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-xs text-gray-400 font-medium">đánh giá 2 chiều</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>

                {/* ── Student's review of employer ── */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Đánh giá của sinh viên cho bạn</h4>
                  </div>
                  {reviewDetailModal.studentReview ? (
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5">
                      {/* Star display */}
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map(s => (
                            <Star
                              key={s}
                              className={`w-5 h-5 ${s <= reviewDetailModal.studentReview!.rating ? "fill-blue-400 text-blue-400" : "fill-gray-200 text-gray-200"}`}
                            />
                          ))}
                        </div>
                        <span className="text-lg font-bold text-blue-700">{reviewDetailModal.studentReview.rating}/5</span>
                      </div>
                      {/* Comment */}
                      {reviewDetailModal.studentReview.comment && (
                        <p className="text-gray-700 text-sm leading-relaxed italic">
                          "{reviewDetailModal.studentReview.comment}"
                        </p>
                      )}
                      {/* Date */}
                      <p className="text-xs text-blue-600/60 mt-3">
                        {new Date(reviewDetailModal.studentReview.createdAt).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  ) : (
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 text-center">
                      <User className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-400 text-sm">Sinh viên chưa đánh giá bạn</p>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Close button */}
            <button
              onClick={() => setReviewDetailModal(null)}
              className="w-full px-4 py-3 border-2 border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-all font-medium"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    )}
    </div>
    </>
  );
}