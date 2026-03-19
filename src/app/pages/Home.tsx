import { Link } from "react-router";
import { Search, MapPin, Clock, TrendingUp, Shield, Users } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-cyan-400 via-blue-500 to-blue-600 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1701576766277-c6160505581d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkZW50JTIwc3R1ZHlpbmclMjBsYXB0b3B8ZW58MXx8fHwxNzczMzg5MzQwfDA&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Students"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl mb-6 font-bold">
              Tìm việc bán thời gian phù hợp với sinh viên
            </h1>
            <p className="text-xl mb-8 text-cyan-100">
              Kết nối sinh viên với các công việc linh hoạt, phù hợp với lịch học và thời gian rảnh
            </p>
            <Link
              to="/jobs"
              className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:shadow-2xl hover:scale-105 transition-all duration-300"
            >
              <Search className="w-5 h-5" />
              Khám phá việc làm ngay
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl mb-4">Tại sao chọn UniPart?</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Nền tảng tìm việc bán thời gian hàng đầu dành riêng cho sinh viên với hàng ngàn công việc chất lượng
          </p>
          
          {/* Feature Image */}
          <div className="mb-12 rounded-2xl overflow-hidden shadow-xl max-w-4xl mx-auto">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1758270705518-b61b40527e76?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaXZlcnNlJTIwc3R1ZGVudHMlMjB3b3JraW5nJTIwdG9nZXRoZXJ8ZW58MXx8fHwxNzczNDE4MjAxfDA&ixlib=rb-4.1.0&q=80&w=1080"
              alt="Students working together"
              className="w-full h-80 object-cover"
            />
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-2xl hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-cyan-50 to-blue-50">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <h3 className="mb-2 font-bold text-lg">Tìm việc gần trường</h3>
              <p className="text-gray-600">
                Lọc công việc theo khoảng cách, tiết kiệm thời gian di chuyển
              </p>
            </div>

            <div className="text-center p-6 rounded-2xl hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-cyan-50 to-blue-50">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h3 className="mb-2 font-bold text-lg">Lịch linh hoạt</h3>
              <p className="text-gray-600">
                Chọn ca làm việc phù hợp với thời khóa biểu học tập
              </p>
            </div>

            <div className="text-center p-6 rounded-2xl hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-cyan-50 to-blue-50">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="mb-2 font-bold text-lg">Đề xuất AI</h3>
              <p className="text-gray-600">
                Hệ thống AI gợi ý việc làm phù hợp với kỹ năng và sở thích
              </p>
            </div>

            <div className="text-center p-6 rounded-2xl hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-cyan-50 to-blue-50">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="mb-2 font-bold text-lg">Đánh giá xác thực</h3>
              <p className="text-gray-600">
                Đánh giá chỉ từ người đã làm việc thực tế, không thể xóa
              </p>
            </div>

            <div className="text-center p-6 rounded-2xl hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-cyan-50 to-blue-50">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="mb-2 font-bold text-lg">Cộng đồng sinh viên</h3>
              <p className="text-gray-600">
                Chia sẻ kinh nghiệm, cảnh báo nơi làm việc không uy tín
              </p>
            </div>

            <div className="text-center p-6 rounded-2xl hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-cyan-50 to-blue-50">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Search className="w-8 h-8 text-white" />
              </div>
              <h3 className="mb-2 font-bold text-lg">Tuyển dụng gấp</h3>
              <p className="text-gray-600">
                Tìm việc làm ngay trong ngày với bộ lọc "Tuyển gấp"
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Sẵn sàng bắt đầu?</h2>
          <p className="text-xl mb-8 text-cyan-100">
            Hàng trăm công việc đang chờ bạn khám phá
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/jobs"
              className="bg-white text-blue-600 px-8 py-3 rounded-xl font-semibold hover:shadow-2xl hover:scale-105 transition-all duration-300"
            >
              Tìm việc ngay
            </Link>
            <Link
              to="/community"
              className="bg-blue-500 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-400 transition-all duration-300 border-2 border-white"
            >
              Tham gia cộng đồng
            </Link>
          </div>
          
          {/* Employer CTA */}
          <div className="mt-12 pt-8 border-t border-white/20">
            <p className="text-lg mb-4 text-cyan-100">Bạn là nhà tuyển dụng?</p>
            <Link
              to="/employer"
              className="inline-block bg-white text-blue-600 px-8 py-3 rounded-xl font-semibold hover:shadow-2xl hover:scale-105 transition-all duration-300"
            >
              Đăng tin tuyển dụng
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2 bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                10,000+
              </div>
              <div className="text-gray-600 font-medium">Sinh viên</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2 bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                5,000+
              </div>
              <div className="text-gray-600 font-medium">Việc làm</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2 bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                2,000+
              </div>
              <div className="text-gray-600 font-medium">Doanh nghiệp</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2 bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                98%
              </div>
              <div className="text-gray-600 font-medium">Hài lòng</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}