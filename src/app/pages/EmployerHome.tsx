import { Link } from "react-router";
import {
  Briefcase,
  Users,
  TrendingUp,
  Shield,
  Clock,
  Target,
  CheckCircle,
  Search,
  MapPin,
  Star,
  Check,
  Package,
  Phone,
  Mail,
  MessageCircle,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { EmployerChatBot } from "../components/EmployerChatBot";
import logoImage from "figma:asset/0a7c93682f2192d9ef554feedaa9950d9d4f744f.png";

export default function EmployerHome() {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Services
  const services = [
    {
      icon: Search,
      title: "Tìm kiếm thông minh",
      description: "Hệ thống AI giúp kết nối với ứng viên phù hợp nhất",
      color: "blue",
    },
    {
      icon: Star,
      title: "Hiển thị ưu tiên",
      description: "Tin tuyển dụng của bạn xuất hiện ở vị trí nổi bật",
      color: "purple",
    },
    {
      icon: Clock,
      title: "Phân tích chi tiết",
      description: "Thống kê lượt xem, ứng viên và hiệu quả tuyển dụng",
      color: "green",
    },
    {
      icon: Users,
      title: "Quản lý ứng viên",
      description: "Dễ dàng quản lý và phản hồi ứng viên trong một nền tảng",
      color: "orange",
    },
    {
      icon: CheckCircle,
      title: "Đăng tin nhanh chóng",
      description: "Chỉ 3 phút để đăng tin và tiếp cận hàng ngàn sinh viên",
      color: "red",
    },
    {
      icon: Shield,
      title: "Ứng viên đã xác thực",
      description: "Sinh viên được xác thực qua email trường đại học",
      color: "indigo",
    },
  ];

  // Stats
  const stats = [
    { number: "10,000+", label: "Sinh viên hoạt động" },
    { number: "500+", label: "Doanh nghiệp tin tưởng" },
    { number: "5,000+", label: "Tin tuyển dụng/tháng" },
    { number: "95%", label: "Tỷ lệ hài lòng" },
  ];

  // Pricing packages
  const pricingPackages = [
    {
      name: "Basic",
      price: 2700000,
      description: "Phù hợp cho doanh nghiệp nhỏ",
      gradient: "from-blue-500 to-cyan-500",
      features: [
        "60 tin thường/tháng",
        "Tối đa 2 tin/ngày",
        "5 tin tuyển gấp",
        "Hỗ trợ email",
        "Thống kê cơ bản",
      ],
    },
    {
      name: "Advance",
      price: 6000000,
      description: "Lựa chọn phổ biến nhất",
      gradient: "from-purple-500 to-pink-500",
      popular: true,
      features: [
        "150 tin thường/tháng",
        "Tối đa 5 tin/ngày",
        "10 tin tuyển gấp",
        "Hỗ trợ ưu tiên",
        "Hiển thị nổi bật",
        "Thống kê chi tiết",
        "Quản lý ứng viên",
      ],
    },
    {
      name: "Premium",
      price: 10500000,
      description: "Cho doanh nghiệp lớn",
      gradient: "from-orange-500 to-red-500",
      features: [
        "300 tin thường/tháng",
        "Tối đa 10 tin/ngày",
        "20 tin tuyển gấp",
        "Hỗ trợ 24/7",
        "Hiển thị ưu tiên cao",
        "Phân tích chi tiết",
        "Tư vấn chiến lược",
        "Account manager riêng",
      ],
    },
  ];

  // Testimonials
  const testimonials = [
    {
      name: "Nguyễn Minh Tuấn",
      company: "Highlands Coffee",
      role: "HR Manager",
      content: "UniPart giúp chúng tôi tìm được nhân viên part-time chất lượng chỉ trong vài ngày. Hệ thống rất dễ sử dụng!",
      rating: 5,
    },
    {
      name: "Trần Thị Hương",
      company: "The Coffee House",
      role: "Store Manager",
      content: "Các bạn sinh viên trên UniPart rất nhiệt tình và có trách nhi��m. Ti rất hài lòng với dịch vụ này.",
      rating: 5,
    },
    {
      name: "Lê Văn Đức",
      company: "Circle K",
      role: "Area Manager",
      content: "Tiết kiệm thời gian và chi phí tuyển dụng đáng kể. Đội ngũ hỗ trợ nhiệt tình và chuyên nghiệp.",
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header/Navigation */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center">
              <img src={logoImage} alt="UniPart Employer" className="h-24 cursor-pointer hover:opacity-80 transition-opacity" />
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              <a href="#services" className="text-gray-600 hover:text-orange-600 transition-colors">
                Dịch vụ
              </a>
              <a href="#pricing" className="text-gray-600 hover:text-orange-600 transition-colors">
                Bảng giá
              </a>
              <a href="#support" className="text-gray-600 hover:text-orange-600 transition-colors">
                Hỗ trợ
              </a>
              <Link
                to="/employer/login"
                className="px-4 py-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
              >
                Đăng nhập
              </Link>
              <Link
                to="/employer/login"
                className="px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:shadow-lg transition-all"
              >
                Đăng ký ngay
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-orange-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-red-500 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm mb-6">
                🚀 Nền tảng tuyển dụng sinh viên #1 Việt Nam
              </div>
              <h1 className="text-4xl md:text-5xl mb-6">
                Tìm nhân sự sinh viên 
                <span className="block bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  nhanh chóng & hiệu quả
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Kết nối với hơn 10,000 sinh viên ưu tú, sẵn sàng làm việc bán thời gian. 
                Đăng tin chỉ trong 3 phút, nhận CV ngay trong ngày.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/employer/login"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl hover:shadow-xl transition-all"
                >
                  <span>Đăng tin miễn phí</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <a
                  href="#pricing"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-700 border-2 border-gray-300 rounded-xl hover:border-orange-600 hover:text-orange-600 transition-all"
                >
                  <span>Xem bảng giá</span>
                </a>
              </div>
            </div>

            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-2xl">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1601509876296-aba16d4c10a4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHRlYW0lMjBjb2xsYWJvcmF0aW9ufGVufDF8fHx8MTc3MzY2NTE5NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Business team"
                  className="w-full h-[400px] object-cover"
                />
              </div>
              {/* Floating cards */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-xl p-4 border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Check className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Ứng viên mới</div>
                    <div className="text-xl">+124 hôm nay</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-4xl mb-2 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  {stat.number}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl mb-4">
              Tại sao chọn <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">UniPart?</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Giải pháp tuyển dụng toàn diện với công nghệ hiện đại
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-8 border border-gray-200 hover:shadow-xl hover:border-orange-200 transition-all group"
              >
                <div className={`w-14 h-14 bg-${service.color}-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <service.icon className={`w-7 h-7 text-${service.color}-600`} />
                </div>
                <h3 className="text-xl mb-3">{service.title}</h3>
                <p className="text-gray-600">{service.description}</p>
              </div>
            ))}
          </div>

          {/* Feature Image */}
          <div className="mt-16 rounded-2xl overflow-hidden shadow-2xl">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1598870784088-35e7058da12c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvZmZpY2UlMjByZWNydWl0aW5nJTIwbWVldGluZ3xlbnwxfHx8fDE3NzM3NjM0ODJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Professional recruitment"
              className="w-full h-[400px] object-cover"
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl mb-4">Bảng giá linh hoạt</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Chọn gói phù hợp với nhu cầu tuyển dụng của bạn
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {pricingPackages.map((pkg, idx) => (
              <div
                key={idx}
                className={`relative bg-white border-2 rounded-2xl p-8 hover:shadow-2xl transition-all ${
                  pkg.popular
                    ? "border-purple-500 shadow-xl scale-105"
                    : "border-gray-200"
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <div className="px-4 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full text-sm shadow-lg">
                      ⭐ Phổ biến nhất
                    </div>
                  </div>
                )}

                <div className="text-center mb-8">
                  <div
                    className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${pkg.gradient} flex items-center justify-center`}
                  >
                    <Package className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl mb-2">{pkg.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{pkg.description}</p>
                  <div className={`text-4xl mb-1 bg-gradient-to-r ${pkg.gradient} bg-clip-text text-transparent`}>
                    {formatCurrency(pkg.price)}
                  </div>
                  <div className="text-sm text-gray-500">/tháng</div>
                </div>

                <ul className="space-y-3 mb-8">
                  {pkg.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-2">
                      <Check className="w-5 h-5 flex-shrink-0 text-green-500 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  to="/employer/login"
                  className={`block w-full py-3 rounded-xl text-center transition-all ${
                    pkg.popular
                      ? `bg-gradient-to-r ${pkg.gradient} text-white hover:shadow-lg`
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Chọn gói này
                </Link>
              </div>
            ))}
          </div>

          {/* Pay per post */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-200">
            <div className="text-center mb-6">
              <h3 className="text-2xl mb-2">Hoặc mua theo số lượng tin</h3>
              <p className="text-gray-600">Linh hoạt cho nhu cầu ngắn hạn</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 text-center border border-gray-200">
                <div className="text-3xl mb-2">1 tin</div>
                <div className="text-xl text-orange-600 mb-1">50,000đ - 70,000đ</div>
                <div className="text-sm text-gray-500">Tin thường / Tin gấp</div>
              </div>
              <div className="bg-white rounded-xl p-6 text-center border-2 border-purple-500">
                <div className="text-3xl mb-2">3 tin</div>
                <div className="text-xl text-orange-600 mb-1">135,000đ - 189,000đ</div>
                <div className="text-sm text-gray-500">Tiết kiệm 10%</div>
              </div>
              <div className="bg-white rounded-xl p-6 text-center border border-gray-200">
                <div className="text-3xl mb-2">5 tin</div>
                <div className="text-xl text-orange-600 mb-1">200,000đ - 224,000đ</div>
                <div className="text-sm text-gray-500">Tiết kiệm 20%</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gradient-to-br from-orange-50 to-red-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl mb-4">Khách hàng nói gì về chúng tôi</h2>
            <p className="text-xl text-gray-600">Hơn 500 doanh nghiệp tin tưởng sử dụng</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">"{testimonial.content}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-red-600 rounded-full flex items-center justify-center text-white">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">
                      {testimonial.role} - {testimonial.company}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Support Section */}
      <section id="support" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl mb-6">
                Hỗ trợ tận tình
                <span className="block bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  24/7
                </span>
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Đội ngũ chuyên viên luôn sẵn sàng hỗ trợ bạn trong quá trình tuyển dụng
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="mb-1">Hotline</h3>
                    <p className="text-gray-600">1900-xxxx (8:00 - 22:00)</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="mb-1">Email</h3>
                    <p className="text-gray-600">support@unipart.vn</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="mb-1">Live Chat</h3>
                    <p className="text-gray-600">Trò chuyện trực tiếp với chúng tôi</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden shadow-2xl">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1758205307912-5896ff0c65ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBzdXBwb3J0JTIwc2VydmljZXxlbnwxfHx8fDE3NzM3NjM0ODN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Customer support"
                className="w-full h-[400px] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-orange-600 to-red-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl mb-6">Sẵn sàng tìm nhân sự?</h2>
          <p className="text-xl mb-8 text-orange-100">
            Đăng tin miễn phí và nhận CV từ sinh viên ngay hm nay
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/employer/login"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-orange-600 rounded-xl hover:bg-orange-50 transition-all"
            >
              <span>Đăng ký miễn phí</span>
              <ChevronRight className="w-5 h-5" />
            </Link>
            <Link
              to="/employer/dashboard"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-orange-500 text-white rounded-xl hover:bg-orange-400 transition-all border border-white"
            >
              <span>Xem Dashboard</span>
            </Link>
          </div>

          <div className="mt-12 pt-8 border-t border-white/20">
            <p className="text-orange-100 mb-4">Bạn là sinh viên tìm việc?</p>
            <Link
              to="/"
              className="inline-block text-white hover:underline"
            >
              Khám phá việc làm tại đây →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 pt-12 pb-6 md:pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {/* About Section */}
            <div>
              <div className="mb-4">
                <Link to="/">
                  <img src={logoImage} alt="UniPart Employer" className="h-22 cursor-pointer hover:opacity-80 transition-opacity" />
                </Link>
              </div>
              <p className="text-sm text-gray-400 mb-4">
                Nền tảng tuyển dụng sinh viên hàng đầu Việt Nam. 
                Kết nối doanh nghiệp với nguồn nhân lực trẻ chất lượng cao.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-white font-semibold mb-4">Liên kết nhanh</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#services" className="text-sm hover:text-orange-400 transition-colors">
                    Dịch vụ
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="text-sm hover:text-orange-400 transition-colors">
                    Bảng giá
                  </a>
                </li>
                <li>
                  <Link to="/employer/dashboard" className="text-sm hover:text-orange-400 transition-colors">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <a href="#support" className="text-sm hover:text-orange-400 transition-colors">
                    Hỗ trợ
                  </a>
                </li>
                <li>
                  <Link to="/employer/login" className="text-sm hover:text-orange-400 transition-colors">
                    Đăng nhập
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-white font-semibold mb-4">Hỗ trợ</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-sm hover:text-orange-400 transition-colors">
                    Trung tâm trợ giúp
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm hover:text-orange-400 transition-colors">
                    Hướng dẫn đăng tin
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm hover:text-orange-400 transition-colors">
                    Điều khoản sử dụng
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm hover:text-orange-400 transition-colors">
                    Chính sách bảo mật
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm hover:text-orange-400 transition-colors">
                    Câu hỏi thường gặp
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-white font-semibold mb-4">Liên hệ</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2 text-sm">
                  <MapPin className="w-4 h-4 mt-1 flex-shrink-0 text-orange-400" />
                  <span>268 Lý Thường Kiệt, Quận 10, TP. HCM</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 flex-shrink-0 text-orange-400" />
                  <a href="tel:+84123456789" className="hover:text-orange-400 transition-colors">
                    +84 123 456 789
                  </a>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 flex-shrink-0 text-orange-400" />
                  <a href="mailto:employer@unipart.vn" className="hover:text-orange-400 transition-colors">
                    employer@unipart.vn
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-6 border-t border-gray-800">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-gray-400">
                © {new Date().getFullYear()} UniPart Employer. All rights reserved.
              </p>
              <div className="flex gap-6 text-sm">
                <a href="#" className="hover:text-orange-400 transition-colors">
                  Bản đồ trang
                </a>
                <a href="#" className="hover:text-orange-400 transition-colors">
                  An toàn & Bảo mật
                </a>
                <a href="#" className="hover:text-orange-400 transition-colors">
                  Accessibility
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* AI ChatBot */}
      <EmployerChatBot />
    </div>
  );
}