import { useParams, Link } from "react-router";
import { useState, useEffect } from "react";
import { jobService, JobResponse } from "../../../services/jobService";
import { useAuth } from "../../contexts/AuthContext";
import {
  MapPin,
  Clock,
  DollarSign,
  Star,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Share2,
  Bookmark,
  Loader2
} from "lucide-react";
import { ImageWithFallback } from "../../components/figma/ImageWithFallback";

export default function JobDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  
  const [job, setJob] = useState<JobResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (id) {
      fetchJobDetail(Number(id));
      if (user) {
        checkSavedStatus(Number(id));
      }
    }
  }, [id, user]);

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

  const checkSavedStatus = async (jobId: number) => {
    try {
      const res = await jobService.isJobSaved(jobId);
      if (res.result !== undefined) {
        setIsSaved(res.result);
      }
    } catch (error) {
      console.error("Failed to check saved status", error);
    }
  };

  const handleToggleSave = async () => {
    if (!user) {
      alert("Vui lòng đăng nhập để lưu việc làm!");
      return;
    }
    if (!job) return;

    setIsSaving(true);
    try {
      if (isSaved) {
        await jobService.unsaveJob(job.id);
        setIsSaved(false);
      } else {
        await jobService.saveJob(job.id);
        setIsSaved(true);
      }
    } catch (error) {
      console.error("Failed to toggle save", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleApply = () => {
    alert("Ứng tuyển thành công! Nhà tuyển dụng sẽ sớm liên hệ với bạn.");
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
          {job.image && (
            <div className="w-full h-64 md:h-80 overflow-hidden">
              <ImageWithFallback
                src={job.image}
                alt={job.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

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
                    <Bookmark className={`w-5 h-5 ${isSaved ? "fill-blue-600 text-blue-600" : "text-gray-600"}`} />
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
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <MapPin className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="text-sm text-gray-600">Địa điểm</div>
                  <div>{job.address}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Clock className="w-5 h-5 text-purple-600" />
                <div>
                  <div className="text-sm text-gray-600">Ca làm việc</div>
                  <div>{job.workingShift}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <DollarSign className="w-5 h-5 text-green-600" />
                <div>
                  <div className="text-sm text-gray-600">Lương</div>
                  <div>{job.salary.toLocaleString()}đ</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <AlertCircle className="w-5 h-5 text-orange-600" />
                <div>
                  <div className="text-sm text-gray-600">Số lượng tuyển</div>
                  <div>{job.vacancies} người</div>
                </div>
              </div>
            </div>

            {/* Apply Button */}
            <button 
              onClick={handleApply}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300"
            >
              Ứng tuyển ngay
            </button>
          </div>
        </div>

        {/* Job Description */}
        <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold">Mô tả công việc</h2>
          <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
            {job.description}
          </div>
        </div>

        {/* Reviews - Removed since backend doesn't have review data for jobs yet */}
      </div>
    </div>
  );
}