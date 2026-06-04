import { Mail, Phone, MapPin, Facebook, Instagram, Linkedin, Twitter, Briefcase } from "lucide-react";
import { Link } from "react-router";
import logoImage from "../../assets/logo_new1.png";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 pt-12 pb-6 md:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* About Section */}
          <div>
            <div className="mb-4">
              <img src={logoImage} alt="UniPart" className="h-22" />
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Nền tảng tìm việc làm bán thời gian hàng đầu dành cho sinh viên đại học. 
              Kết nối bạn với những cơ hội phù hợp nhất.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Liên kết nhanh</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm hover:text-blue-400 transition-colors">
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link to="/jobs" className="text-sm hover:text-blue-400 transition-colors">
                  Tìm việc làm
                </Link>
              </li>
              <li>
                <Link to="/saved" className="text-sm hover:text-blue-400 transition-colors">
                  Việc làm đã lưu
                </Link>
              </li>
              <li>
                <Link to="/community" className="text-sm hover:text-blue-400 transition-colors">
                  Cộng đồng
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-sm hover:text-blue-400 transition-colors">
                  Hồ sơ cá nhân
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold mb-4">Hỗ trợ</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm hover:text-blue-400 transition-colors">
                  Trung tâm trợ giúp
                </a>
              </li>
              <li>
                <a href="#" className="text-sm hover:text-blue-400 transition-colors">
                  Điều khoản sử dụng
                </a>
              </li>
              <li>
                <a href="#" className="text-sm hover:text-blue-400 transition-colors">
                  Chính sách bảo mật
                </a>
              </li>
              <li>
                <a href="#" className="text-sm hover:text-blue-400 transition-colors">
                  Câu hỏi thường gặp
                </a>
              </li>
              <li>
                <a href="#" className="text-sm hover:text-blue-400 transition-colors">
                  Đối tác tuyển dụng
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Liên hệ</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm">
                <MapPin className="w-4 h-4 mt-1 flex-shrink-0 text-blue-400" />
                <span>268 Lý Thường Kiệt, Quận 10, TP. HCM</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 flex-shrink-0 text-blue-400" />
                <a href="tel:+84123456789" className="hover:text-blue-400 transition-colors">
                  +84 123 456 789
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 flex-shrink-0 text-blue-400" />
                <a href="mailto:support@unipart.vn" className="hover:text-blue-400 transition-colors">
                  support@unipart.vn
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400">
              © {currentYear} UniPart. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <a href="#" className="hover:text-blue-400 transition-colors">
                Bản đồ trang
              </a>
              <a href="#" className="hover:text-blue-400 transition-colors">
                An toàn & Bảo mật
              </a>
              <a href="#" className="hover:text-blue-400 transition-colors">
                Accessibility
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}