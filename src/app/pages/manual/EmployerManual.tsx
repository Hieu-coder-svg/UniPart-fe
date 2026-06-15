import { BookOpen, Briefcase, Users, MessageSquare, TrendingUp } from "lucide-react";
import { Link } from "react-router";

export default function EmployerManual() {
  const steps = [
    {
      icon: <Briefcase className="w-6 h-6 text-orange-500" />,
      title: "1. Đăng tin tuyển dụng",
      desc: "Tạo và đăng tải các vị trí công việc chi tiết. Sử dụng các gói đăng tin để tiếp cận được nhiều ứng viên tiềm năng hơn."
    },
    {
      icon: <Users className="w-6 h-6 text-blue-500" />,
      title: "2. Quản lý ứng viên",
      desc: "Theo dõi danh sách ứng viên, xem CV chi tiết và thay đổi trạng thái (Chấp nhận/Từ chối) ngay trên Dashboard."
    },
    {
      icon: <MessageSquare className="w-6 h-6 text-green-500" />,
      title: "3. Tương tác trực tiếp",
      desc: "Sử dụng tính năng nhắn tin tích hợp để trao đổi và phỏng vấn trực tuyến với ứng viên một cách nhanh chóng."
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-purple-500" />,
      title: "4. Phân tích hiệu quả",
      desc: "Xem các báo cáo thống kê về lượt xem tin, tỷ lệ chuyển đổi để tối ưu hóa chiến lược tuyển dụng của bạn."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-fadeIn">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
          <BookOpen className="w-8 h-8 text-orange-600" />
          Hướng dẫn dành cho Nhà tuyển dụng
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Khám phá cách sử dụng các công cụ tuyển dụng trên UniHire để tìm kiếm những ứng viên sinh viên tài năng nhất cho doanh nghiệp của bạn.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {steps.map((step, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="bg-orange-50 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
              {step.icon}
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
            <p className="text-gray-600 leading-relaxed">{step.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 bg-orange-50 rounded-2xl p-8 text-center">
        <h2 className="text-xl font-semibold text-orange-900 mb-2">Sẵn sàng tuyển dụng?</h2>
        <p className="text-orange-700 mb-6">Bắt đầu đăng tin công việc đầu tiên của bạn ngay hôm nay.</p>
        <Link to="/employer/dashboard/jobs" className="inline-block bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2.5 rounded-xl font-medium hover:shadow-lg transition-all hover:-translate-y-0.5">
          Đi đến Dashboard
        </Link>
      </div>
    </div>
  );
}
