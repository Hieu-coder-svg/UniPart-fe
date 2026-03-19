import { useParams, Link } from "react-router";
import { mockJobs, mockReviews } from "../data/mockData";
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
} from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

export default function JobDetail() {
  const { id } = useParams();
  const job = mockJobs.find((j) => j.id === id);
  const reviews = mockReviews.filter((r) => r.jobId === id);

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="mb-2">Không tìm thấy công việc</h2>
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
                  <h1>{job.title}</h1>
                  {job.urgent && (
                    <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-semibold">
                      Tuyển gấp
                    </span>
                  )}
                </div>
                <h3 className="text-gray-600">{job.company}</h3>
              </div>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Share2 className="w-5 h-5 text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Bookmark className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-6">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <span>
                {job.rating} ({job.reviewCount} đánh giá)
              </span>
            </div>

            {/* Job Info Grid */}
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <MapPin className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="text-sm text-gray-600">Địa điểm</div>
                  <div>
                    {job.location} ({job.distance} km)
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Clock className="w-5 h-5 text-purple-600" />
                <div>
                  <div className="text-sm text-gray-600">Ca làm việc</div>
                  <div>{job.shift}{job.workingHours ? ` (${job.workingHours})` : ""}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <DollarSign className="w-5 h-5 text-green-600" />
                <div>
                  <div className="text-sm text-gray-600">Lương</div>
                  <div>{job.hourlyRate.toLocaleString()}đ/giờ</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <AlertCircle className="w-5 h-5 text-orange-600" />
                <div>
                  <div className="text-sm text-gray-600">Thời gian</div>
                  <div>{job.hoursPerWeek} giờ/tuần</div>
                </div>
              </div>
            </div>

            {/* Apply Button */}
            <button className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300">
              Ứng tuyển ngay
            </button>
          </div>
        </div>

        {/* Job Description */}
        <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
          <h2 className="mb-4">Mô tả công việc</h2>
          <p className="text-gray-700 mb-6">{job.description}</p>

          <h3 className="mb-3">Yêu cầu</h3>
          <ul className="space-y-2">
            {job.requirements.map((req, index) => (
              <li key={index} className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">{req}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Reviews */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="mb-6">Đánh giá từ sinh viên</h2>

          {reviews.length > 0 ? (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span>{review.studentName.charAt(0)}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span>{review.studentName}</span>
                          {review.verified && (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-500">{review.date}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Chưa có đánh giá nào
            </div>
          )}
        </div>
      </div>
    </div>
  );
}