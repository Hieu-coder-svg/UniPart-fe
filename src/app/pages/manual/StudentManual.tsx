import { BookOpen, CheckCircle, Search, FileText, Bell } from "lucide-react";

export default function StudentManual() {
  const steps = [
    {
      icon: <Search className="w-6 h-6 text-blue-500" />,
      title: "1. Tìm kiếm việc làm",
      desc: "Sử dụng thanh tìm kiếm và bộ lọc trên trang chủ để tìm các công việc part-time phù hợp với chuyên ngành, mức lương và khu vực của bạn."
    },
    {
      icon: <FileText className="w-6 h-6 text-green-500" />,
      title: "2. Ứng tuyển nhanh chóng",
      desc: "Cập nhật hồ sơ cá nhân và nhấn 'Ứng tuyển' ngay tại tin tuyển dụng. Hồ sơ của bạn sẽ được gửi trực tiếp đến nhà tuyển dụng."
    },
    {
      icon: <Bell className="w-6 h-6 text-orange-500" />,
      title: "3. Nhận thông báo",
      desc: "Theo dõi trạng thái ứng tuyển và nhận thông báo ngay khi nhà tuyển dụng phản hồi hoặc có công việc mới phù hợp."
    },
    {
      icon: <CheckCircle className="w-6 h-6 text-purple-500" />,
      title: "4. Quản lý công việc",
      desc: "Sử dụng tính năng 'Việc làm đã lưu' và 'Lịch sử ứng tuyển' để quản lý hiệu quả các cơ hội việc làm của bạn."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-fadeIn">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
          <BookOpen className="w-8 h-8 text-blue-600" />
          Hướng dẫn dành cho Sinh viên
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Chào mừng bạn đến với UniHire! Dưới đây là các bước cơ bản để bạn có thể bắt đầu tìm kiếm việc làm part-time một cách dễ dàng và hiệu quả nhất.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {steps.map((step, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="bg-blue-50 w-14 h-14 rounded-xl flex items-center justify-center mb-4">
              {step.icon}
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
            <p className="text-gray-600 leading-relaxed">{step.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 bg-blue-50 rounded-2xl p-8 text-center">
        <h2 className="text-xl font-semibold text-blue-900 mb-2">Bạn cần thêm sự trợ giúp?</h2>
        <p className="text-blue-700 mb-6">Đội ngũ hỗ trợ của chúng tôi luôn sẵn sàng giải đáp thắc mắc của bạn.</p>
        <button className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md">
          Liên hệ hỗ trợ
        </button>
      </div>
    </div>
  );
}
