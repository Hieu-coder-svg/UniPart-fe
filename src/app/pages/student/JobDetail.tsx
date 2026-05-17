import { useParams, Link } from "react-router";
import { useState, useEffect } from "react";
import { jobService, JobResponse } from "../../../services/jobService";
import { useAuth } from "../../contexts/AuthContext";
import { useSavedJobs } from "../../contexts/SavedJobsContext";
import { applicationService } from "../../../services/applicationService";
import { userService } from "../../../services/userService";
import { Timer, Map as MapIcon, Calendar, Info, Clock, DollarSign, Star, AlertCircle, CheckCircle, ArrowLeft, Share2, Bookmark, Loader2, MapPin } from "lucide-react";
import { ImageWithFallback } from "../../components/figma/ImageWithFallback";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { calculateDistance, formatDistance } from "../../../utils/location";
import { StudentResponse } from "../../../services/userService";

// Fix for default marker icon in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

export default function JobDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { isJobSaved, saveJob, unsaveJob } = useSavedJobs();

  const [job, setJob] = useState<JobResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [applicationId, setApplicationId] = useState<number | null>(null);
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0);
  const [studentInfo, setStudentInfo] = useState<StudentResponse | null>(null);

  useEffect(() => {
    if (id) {
      fetchJobDetail(Number(id));
      if (user && user.role === "STUDENT") {
        checkApplicationStatus(Number(id));
        fetchStudentInfo();
      }
    }
  }, [id, user]);

  const fetchStudentInfo = async () => {
    try {
      const res = await userService.getStudentMyInfo();
      if (res.result) {
        setStudentInfo(res.result);
      }
    } catch (error) {
      console.error("Failed to fetch student info", error);
    }
  };

  const checkApplicationStatus = async (jobId: number) => {
    try {
      const studentRes = await userService.getStudentMyInfo();
      if (!studentRes.result) return;
      
      const res = await jobService.getStudentJobHistory(studentRes.result.id);
      if (res.result) {
        // jobService.getStudentJobHistory returns JobResponse[] where id is jobId, and applicationId is the application's ID.
        const applicationJob = res.result.find(app => app.id === jobId);
        if (applicationJob && applicationJob.applicationId) {
          setHasApplied(true);
          setApplicationId(applicationJob.applicationId);
        } else {
          setHasApplied(false);
          setApplicationId(null);
        }
      }
    } catch (e) {
      console.error("Failed to check application status:", e);
    }
  };

  const fetchJobDetail = async (jobId: number) => {
    setIsLoading(true);
    try {
      const res = await jobService.getJobDetail(jobId);
      if (res.result) {
        setJob(res.result);
      }
    } catch (error) {
      console.error("Failed to fetch job details", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!job) return;
    const cooldownData = localStorage.getItem(`cooldown_job_${job.id}`);
    if (cooldownData) {
      const cooldownUntil = parseInt(cooldownData, 10);
      const now = new Date().getTime();
      if (now < cooldownUntil) {
        setCooldownRemaining(Math.floor((cooldownUntil - now) / 1000));
      } else {
        localStorage.removeItem(`cooldown_job_${job.id}`);
      }
    }
  }, [job, hasApplied]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (cooldownRemaining > 0 && !hasApplied) {
      interval = setInterval(() => {
        setCooldownRemaining(prev => {
          if (prev <= 1) {
            if (job) localStorage.removeItem(`cooldown_job_${job.id}`);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [cooldownRemaining, hasApplied, job]);

  const handleToggleSave = async () => {
    if (!user) {
      alert("Vui lòng đăng nhập để lưu việc làm!");
      return;
    }
    if (!job) return;

    setIsSaving(true);
    try {
      if (isJobSaved(job.id)) {
        await unsaveJob(job.id);
      } else {
        await saveJob(job.id);
      }
    } catch (error) {
      console.error("Failed to toggle save", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleApply = async () => {
    if (!user) {
      alert("Vui lòng đăng nhập để ứng tuyển!");
      return;
    }
    if (!job) return;
    
    if (cooldownRemaining > 0) {
      alert("Bạn phải chờ hết thời gian đếm ngược mới được ứng tuyển lại!");
      return;
    }

    setIsApplying(true);
    try {
      const response = await applicationService.applyJob({ jobId: job.id });
      if (response.result) {
        setHasApplied(true);
        setApplicationId(response.result.id);
        // Clear cooldown if it exists when successfully applying
        localStorage.removeItem(`cooldown_job_${job.id}`);
        setCooldownRemaining(0);
      }
      alert("Ứng tuyển thành công! Nhà tuyển dụng sẽ sớm liên hệ với bạn.");
    } catch (error: any) {
      alert(error.message || "Đã xảy ra lỗi khi ứng tuyển. Vui lòng thử lại sau.");
    } finally {
      setIsApplying(false);
    }
  };

  const handleCancelApplication = async () => {
    if (!applicationId) {
      alert("Không có thông tin ứng tuyển để hủy.");
      return;
    }

    setIsCancelling(true);
    try {
      await applicationService.deleteApplyJob(applicationId);
      setHasApplied(false);
      setApplicationId(null);
      
      // Set 5 minutes cooldown (5 * 60 * 1000)
      if (job) {
        const cooldownUntil = new Date().getTime() + 5 * 60 * 1000;
        localStorage.setItem(`cooldown_job_${job.id}`, cooldownUntil.toString());
        setCooldownRemaining(5 * 60);
      }
      
      alert("Bạn đã hủy ứng tuyển thành công. Vui lòng đợi 5 phút để có thể ứng tuyển lại công việc này.");
    } catch (error: any) {
      alert(error.message || "Hủy ứng tuyển thất bại. Vui lòng thử lại sau.");
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="mb-2 text-xl font-bold">Không tìm thấy công việc</h2>
          <Link to="/jobs" className="text-blue-600 hover:underline">
            Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          to="/jobs"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Quay lại
        </Link>

        {/* Job Header */}
        <div className="bg-white rounded-xl overflow-hidden shadow-sm mb-6">
          {/* Job Image Banner */}
          <div className="w-full h-64 md:h-80 overflow-hidden">
            <ImageWithFallback
              src={job.image || "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80"}
              alt={job.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-2xl font-bold">{job.title}</h1>
                  {job.urgent && (
                    <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap">
                      Tuyển gấp
                    </span>
                  )}
                </div>
                <h3 className="text-gray-600">{job.employerName}</h3>
              </div>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Share2 className="w-5 h-5 text-gray-600" />
                </button>
                <button 
                  onClick={handleToggleSave}
                  disabled={isSaving}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {isSaving ? (
                    <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                  ) : (
                    <Bookmark className={`w-5 h-5 ${job && isJobSaved(job.id) ? "fill-blue-600 text-blue-600" : "text-gray-600"}`} />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-6">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <span>
                5.0 (0 đánh giá)
              </span>
            </div>

            {/* Job Info Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="flex flex-col items-center text-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                <DollarSign className="w-5 h-5 text-emerald-600 mb-1" />
                <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Lương/giờ</div>
                <div className="text-sm font-bold text-emerald-700">{job.salary.toLocaleString()}đ</div>
              </div>

              <div className="flex flex-col items-center text-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                <Clock className="w-5 h-5 text-blue-600 mb-1" />
                <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Ca làm</div>
                <div className="text-sm font-bold text-blue-700">{job.workingShift}</div>
              </div>

              <div className="flex flex-col items-center text-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                <AlertCircle className="w-5 h-5 text-orange-600 mb-1" />
                <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Số lượng</div>
                <div className="text-sm font-bold text-orange-700">{job.vacancies} người</div>
              </div>

              <div className="flex flex-col items-center text-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                <Calendar className="w-5 h-5 text-purple-600 mb-1" />
                <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Hạn nộp</div>
                <div className="text-sm font-bold text-purple-700">
                  {job.expiredAt ? new Date(job.expiredAt).toLocaleDateString("vi-VN") : "N/A"}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 mb-6">
              <div className="flex items-center gap-3 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                <MapIcon className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <div className="flex-1">
                  <div className="text-xs font-bold text-blue-400 uppercase tracking-wider">Địa điểm làm việc</div>
                  <div className="text-sm text-gray-700 font-medium">{job.address}</div>
                </div>
                {user?.role === "STUDENT" && (
                  <>
                    {studentInfo?.latitude != null && studentInfo?.longitude != null && job.locationLatitude != null && job.locationLongitude != null ? (
                      <div className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm">
                        <MapPin className="w-3.5 h-3.5" />
                        {formatDistance(calculateDistance(studentInfo.latitude, studentInfo.longitude, job.locationLatitude, job.locationLongitude))}
                      </div>
                    ) : (
                      <div className="text-[10px] text-gray-400 italic text-right">
                        {studentInfo?.latitude == null || studentInfo?.longitude == null 
                          ? "Cập nhật vị trí hồ sơ để xem khoảng cách"
                          : "Công việc này chưa có tọa độ vị trí"}
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="flex items-center gap-3 p-4 bg-amber-50/50 rounded-xl border border-amber-100">
                <Timer className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <div>
                  <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">Ngày đăng tin</div>
                  <div className="text-sm text-gray-700 font-medium">
                    {new Date(job.createdAt).toLocaleDateString("vi-VN")}
                  </div>
                </div>
              </div>
            </div>

            {/* Apply Button */}
            {hasApplied ? (
              <button
                onClick={handleCancelApplication}
                disabled={isCancelling}
                className="w-full flex items-center justify-center bg-white border border-red-400 text-red-600 py-3 rounded-lg font-semibold hover:bg-red-50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCancelling ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Đang hủy...
                  </>
                ) : (
                  "Hủy ứng tuyển"
                )}
              </button>
            ) : cooldownRemaining > 0 ? (
              <button 
                disabled
                className="w-full flex items-center justify-center bg-gray-300 text-gray-600 py-3 rounded-lg font-semibold cursor-not-allowed"
              >
                <Timer className="w-5 h-5 mr-2" />
                Thử lại sau {Math.floor(cooldownRemaining / 60)}:{(cooldownRemaining % 60).toString().padStart(2, '0')}
              </button>
            ) : (
              <button 
                onClick={handleApply}
                disabled={isApplying}
                className="w-full flex items-center justify-center bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isApplying ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Đang xử lý...
                  </>
                ) : (
                  "Ứng tuyển ngay"
                )}
              </button>
            )}
          </div>
        </div>

        {/* Job Description */}
        <div className="bg-white rounded-xl p-6 mb-6 shadow-sm border border-gray-100">
          <h2 className="mb-4 text-lg font-bold flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-600" />
            Mô tả công việc
          </h2>
          <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
            {job.description}
          </div>
        </div>

        {/* Time Slots */}
        {job.timeSlots && job.timeSlots.length > 0 && (
          <div className="bg-white rounded-xl p-6 mb-6 shadow-sm border border-gray-100">
            <h2 className="mb-4 text-lg font-bold flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-600" />
              Lịch làm việc chi tiết
            </h2>
            <div className="grid gap-3">
              {job.timeSlots.map((slot, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-bold text-gray-700">
                      {new Date(slot.workDate).toLocaleDateString("vi-VN", { weekday: 'long', day: 'numeric', month: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">
                    {slot.startTime.substring(0, 5)} - {slot.endTime.substring(0, 5)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Location Map */}
        {job.locationLatitude && job.locationLongitude && (
          <div className="bg-white rounded-xl p-6 mb-6 shadow-sm border border-gray-100">
            <h2 className="mb-4 text-lg font-bold flex items-center gap-2">
              <MapIcon className="w-5 h-5 text-rose-600" />
              Vị trí trên bản đồ
            </h2>
            <div className="relative h-64 w-full rounded-xl overflow-hidden border border-gray-200" style={{ zIndex: 0, isolation: "isolate" }}>
              <MapContainer
                center={[job.locationLatitude, job.locationLongitude]}
                zoom={15}
                scrollWheelZoom={false}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[job.locationLatitude, job.locationLongitude]}>
                  <Popup>{job.title}</Popup>
                </Marker>
              </MapContainer>
            </div>
          </div>
        )}

        {/* Reviews - Removed since backend doesn't have review data for jobs yet */}
      </div>
    </div>
  );
}