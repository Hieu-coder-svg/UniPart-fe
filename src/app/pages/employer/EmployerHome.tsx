import { Link, useNavigate } from "react-router";
import { useEffect, useRef, useState } from "react";
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
  Sparkles,
  Bell,
  FileText,
  Zap,
} from "lucide-react";
import { ImageWithFallback } from "../../components/figma/ImageWithFallback";
import { EmployerChatBot } from "../../components/EmployerChatBot";
import logoImage from "../../../assets/logo_new1.png";
import { useAuth } from "../../contexts/AuthContext";
import { packageService, PackageResponse } from "../../../services/packageService";

/* ── Shimmer keyframe injected once ── */
const SHIMMER_STYLE = `
  @keyframes shimmer {
    0%   { transform: translateX(-100%) skewX(-15deg); }
    100% { transform: translateX(250%)  skewX(-15deg); }
  }
  @keyframes floatUp {
    0%, 100% { transform: translateY(0px);   }
    50%       { transform: translateY(-8px);  }
  }
  @keyframes slideInRight {
    from { opacity: 0; transform: translateX(40px); }
    to   { opacity: 1; transform: translateX(0);    }
  }
  .shimmer-btn::after {
    content: '';
    position: absolute;
    top: 0; left: 0; height: 100%; width: 40%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent);
    animation: shimmer 2.4s infinite;
  }
  .float-card { animation: floatUp 3s ease-in-out infinite; }
  .float-card-2 { animation: floatUp 4s ease-in-out infinite 1s; }
  .slide-in { animation: slideInRight 0.7s ease forwards; }
`;

/* ─────────────────────────────────────────────────────────────
   STATS SECTION — animated counter + icon blocks
───────────────────────────────────────────────────────────── */
const STATS_DATA = [
  { icon: Users,      target: 10000, suffix: "+", label: "Sinh viên hoạt động",   color: "bg-blue-100 text-blue-600" },
  { icon: Briefcase,  target: 500,   suffix: "+", label: "Doanh nghiệp tin tưởng", color: "bg-orange-100 text-orange-600" },
  { icon: TrendingUp, target: 5000,  suffix: "+", label: "Tin tuyển dụng/tháng",  color: "bg-emerald-100 text-emerald-600" },
  { icon: Star,       target: 95,    suffix: "%", label: "Tỷ lệ hài lòng",        color: "bg-amber-100 text-amber-600" },
];

function useCountUp(target: number, active: boolean, duration = 1800) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [active, target, duration]);
  return count;
}

function StatBlock({ icon: Icon, target, suffix, label, color }: (typeof STATS_DATA)[0]) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const count = useCountUp(target, visible);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.4 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className="flex flex-col items-center gap-3 p-8 rounded-2xl border border-gray-100 bg-white hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${color}`}>
        <Icon className="w-7 h-7" />
      </div>
      <div className="text-4xl font-black text-gray-900">
        {target >= 1000 ? (count >= 1000 ? `${(count / 1000).toFixed(count % 1000 === 0 ? 0 : 0)}K` : count) : count}
        {suffix}
      </div>
      <div className="text-sm text-gray-500 text-center font-medium">{label}</div>
    </div>
  );
}

function StatsSection() {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-xs font-bold uppercase tracking-widest text-orange-500 mb-2">Con số biết nói</p>
          <h2 className="text-3xl font-extrabold text-gray-900">Được tin tưởng bởi hàng nghìn doanh nghiệp</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS_DATA.map((s, i) => <StatBlock key={i} {...s} />)}
        </div>
      </div>
    </section>
  );
}

export default function EmployerHome() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      if (user.role === "EMPLOYER") {
        navigate("/employer/dashboard", { replace: true });
      } else if (user.role === "ADMIN") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    }
  }, [user, isAuthenticated, isLoading, navigate]);

  const [packages, setPackages] = useState<PackageResponse[]>([]);
  const [loadingPackages, setLoadingPackages] = useState(true);
  const [errorPackages, setErrorPackages] = useState<string | null>(null);

  const fetchPackages = async () => {
    try {
      setLoadingPackages(true);
      setErrorPackages(null);
      const data = await packageService.getAllPackages();
      setPackages(data || []);
    } catch (err: any) {
      console.error("Failed to fetch packages:", err);
      setErrorPackages(err.message || "Không thể tải danh sách gói dịch vụ");
    } finally {
      setLoadingPackages(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const monthlyPackages = packages.filter((p) => p.packageType === "MONTHLY");
  const oneTimePackages = packages.filter((p) => p.packageType === "PAY_PER_TIN" || p.packageType === "ONE_TIME");

  const gradients = [
    "from-blue-500 to-cyan-500",
    "from-purple-500 to-pink-500",
    "from-orange-500 to-red-500"
  ];

  const getPackageFeatures = (pkg: PackageResponse) => {
    const list = [];
    if (pkg.normalTinsLimit !== undefined && pkg.normalTinsLimit !== null) {
      list.push(`${pkg.normalTinsLimit} tin thường/tháng`);
    }
    if (pkg.maxNormalTinsPerDay !== undefined && pkg.maxNormalTinsPerDay !== null) {
      list.push(`Tối đa ${pkg.maxNormalTinsPerDay} tin/ngày`);
    }
    if (pkg.urgentTinsLimit !== undefined && pkg.urgentTinsLimit !== null) {
      list.push(`${pkg.urgentTinsLimit} tin tuyển gấp`);
    }
    if (pkg.description) {
      list.push(pkg.description);
    } else {
      list.push("Hỗ trợ ưu tiên", "Hiển thị nổi bật", "Thống kê chi tiết");
    }
    return list;
  };

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

  // Testimonials
  const testimonials = [
    {
      name: "Nguyễn Minh Tuấn",
      company: "Highlands Coffee",
      role: "HR Manager",
      content: "UniHire giúp chúng tôi tìm được nhân viên part-time chất lượng chỉ trong vài ngày. Hệ thống rất dễ sử dụng!",
      rating: 5,
    },
    {
      name: "Trần Thị Hương",
      company: "The Coffee House",
      role: "Store Manager",
      content: "Các bạn sinh viên trên UniHire rất nhiệt tình và có trách nhiệm. Ti rất hài lòng với dịch vụ này.",
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fff9f6]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-gray-500">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header/Navigation */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center">
              <img src={logoImage} alt="UniHire Employer" className="h-24 cursor-pointer hover:opacity-80 transition-opacity" />
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

      {/* Hero Section — Mesh Gradient + Floating Elements */}
      <style dangerouslySetInnerHTML={{ __html: SHIMMER_STYLE }} />
      <section className="relative py-20 overflow-hidden" style={{
        background: "radial-gradient(ellipse at 20% 60%, rgba(251,146,60,0.18) 0%, transparent 55%), radial-gradient(ellipse at 80% 20%, rgba(239,68,68,0.12) 0%, transparent 50%), radial-gradient(ellipse at 60% 90%, rgba(253,186,116,0.15) 0%, transparent 45%), #fff9f6"
      }}>
        {/* Decorative blobs */}
        <div className="absolute top-0 left-0 w-80 h-80 bg-orange-200 rounded-full blur-[120px] opacity-30 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-red-200 rounded-full blur-[140px] opacity-25 pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-amber-100 rounded-full blur-[100px] opacity-40 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Left: Text */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold mb-6 border border-orange-200">
                <Sparkles className="w-4 h-4" />
                Nền tảng tuyển dụng sinh viên #1 Việt Nam
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
                Tìm nhân sự sinh viên{" "}
                <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                  nhanh chóng &amp; hiệu quả
                </span>
              </h1>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Kết nối với hơn 10,000 sinh viên ưu tú, sẵn sàng làm việc bán thời gian.
                Đăng tin chỉ trong <strong>3 phút</strong>, nhận CV ngay trong ngày.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Shimmer CTA */}
                <Link
                  to="/employer/login"
                  className="shimmer-btn relative overflow-hidden inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl hover:shadow-2xl hover:shadow-orange-200 hover:-translate-y-0.5 transition-all duration-200"
                >
                  <Zap className="w-5 h-5" />
                  <span className="relative z-10">Đăng tin miễn phí</span>
                  <ArrowRight className="w-5 h-5 relative z-10" />
                </Link>
                {/* Ghost CTA */}
                <a
                  href="#pricing"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/80 backdrop-blur-sm text-gray-700 border border-gray-200 hover:border-orange-400 hover:text-orange-600 rounded-xl transition-all font-semibold"
                >
                  Xem bảng giá
                  <ChevronRight className="w-4 h-4" />
                </a>
              </div>
              {/* Trust badges */}
              <div className="flex items-center gap-4 mt-6">
                {["✅ Miễn phí đăng ký", "⚡ Duyệt tin trong 1h", "🔒 Ứng viên xác thực"].map((b) => (
                  <span key={b} className="text-xs text-gray-500 font-medium">{b}</span>
                ))}
              </div>
            </div>

            {/* Right: Image + floating cards */}
            <div className="relative">
              {/* Main image */}
              <div className="rounded-[2rem] overflow-hidden shadow-2xl shadow-orange-100 ring-1 ring-orange-100">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1601509876296-aba16d4c10a4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHRlYW0lMjBjb2xsYWJvcmF0aW9ufGVufDF8fHx8MTc3MzY2NTE5NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Business team"
                  className="w-full h-[380px] object-cover"
                />
              </div>

              {/* Floating card 1 — Ứng viên mới (slide-in + float) */}
              <div className="slide-in float-card absolute -bottom-5 -left-8 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl px-4 py-3 border border-orange-100 min-w-[180px]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Bell className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Ứng viên mới</div>
                    <div className="text-lg font-extrabold text-gray-900">+124 <span className="text-sm font-normal text-gray-400">hôm nay</span></div>
                  </div>
                </div>
                <div className="mt-2 flex -space-x-2">
                  {["🧑‍💻","👩‍🎓","👨‍💼","👩‍🔬"].map((e, i) => (
                    <div key={i} className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 to-red-400 border-2 border-white flex items-center justify-center text-sm">{e}</div>
                  ))}
                  <div className="w-7 h-7 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[9px] font-bold text-gray-500">+89</div>
                </div>
              </div>

              {/* Floating card 2 — CV received */}
              <div className="slide-in float-card-2 absolute -top-5 -right-5 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl px-4 py-3 border border-blue-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-400 font-semibold uppercase">CV đã nhận</div>
                    <div className="text-base font-extrabold text-gray-900">38 <span className="text-xs font-normal text-gray-400">hôm nay</span></div>
                  </div>
                </div>
              </div>

              {/* Floating card 3 — Rating */}
              <div className="float-card absolute top-1/2 -right-8 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl px-3 py-2.5 border border-amber-100">
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="text-sm font-extrabold text-gray-900">4.9</span>
                  <span className="text-xs text-gray-400">/ 5</span>
                </div>
                <p className="text-[9px] text-gray-400 mt-0.5">500+ doanh nghiệp</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section — Icon blocks + animated counter */}
      <StatsSection />

      {/* Services Section */}
      <section id="services" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl mb-4">
              Tại sao chọn <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">UniHire?</span>
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

      {/* Pricing Section — Glassmorphism + scale popular */}
      <section id="pricing" className="py-24 relative overflow-hidden" style={{
        background: "radial-gradient(ellipse at 30% 0%, rgba(251,146,60,0.08) 0%, transparent 60%), radial-gradient(ellipse at 70% 100%, rgba(239,68,68,0.06) 0%, transparent 60%), #fafafa"
      }}>
        {/* Decorative background blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-100 rounded-full blur-[160px] opacity-30 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-orange-100 rounded-full blur-[120px] opacity-30 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold mb-4 border border-purple-200">
              <Package className="w-4 h-4" /> Bảng giá linh hoạt
            </span>
            <h2 className="text-4xl font-extrabold text-gray-900 mb-3">Chọn gói phù hợp</h2>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">
              Tất cả gói đều được dùng thử miễn phí 14 ngày, không cần thẻ tín dụng.
            </p>
          </div>

          {/* Pricing cards */}
          {loadingPackages ? (
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-white/60 backdrop-blur rounded-3xl p-8 border border-gray-200 animate-pulse h-[480px] flex flex-col justify-between shadow-sm">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gray-200"></div>
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                    <div className="h-8 bg-gray-200 rounded w-1/2 mt-4"></div>
                    <div className="space-y-2.5 mt-6">
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                      <div className="h-4 bg-gray-200 rounded w-4/5"></div>
                    </div>
                  </div>
                  <div className="h-12 bg-gray-200 rounded-2xl w-full"></div>
                </div>
              ))}
            </div>
          ) : errorPackages ? (
            <div className="text-center py-12 bg-white/60 backdrop-blur rounded-3xl p-8 border border-gray-200 mb-12 max-w-xl mx-auto">
              <p className="font-semibold text-red-600 mb-4">{errorPackages}</p>
              <button
                onClick={fetchPackages}
                className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:shadow-lg font-bold transition-all"
              >
                Thử lại
              </button>
            </div>
          ) : monthlyPackages.length === 0 ? (
            <div className="text-center py-16 bg-white/60 backdrop-blur rounded-3xl border border-gray-200 mb-12 text-gray-500 max-w-xl mx-auto">
              <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              Chưa có gói dịch vụ tháng nào được cấu hình.
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6 mb-12 items-stretch justify-center">
              {monthlyPackages.map((pkg, idx) => {
                const isPopular = idx === 1 || pkg.name.toLowerCase().includes("advance") || monthlyPackages.length === 1;
                const gradient = gradients[idx % gradients.length];
                const features = getPackageFeatures(pkg);

                return (
                  <div
                    key={pkg.id}
                    className={`relative flex flex-col rounded-3xl transition-all duration-300 ${
                      isPopular
                        ? "scale-[1.04] shadow-2xl shadow-purple-200 border-2 border-purple-400 bg-white/80 backdrop-blur-xl z-10"
                        : "bg-white/60 backdrop-blur border border-gray-200 hover:shadow-xl hover:-translate-y-1"
                    }`}
                  >
                    {/* Popular ribbon */}
                    {isPopular && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                        <div className="flex items-center gap-1.5 px-5 py-1.5 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-full text-xs font-bold shadow-lg">
                          <Star className="w-3.5 h-3.5 fill-white" /> RECOMMEND
                        </div>
                      </div>
                    )}

                    <div className="p-8 flex flex-col flex-1">
                      {/* Icon + name */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
                          <Package className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-extrabold text-gray-900">{pkg.name}</h3>
                          <p className="text-xs text-gray-400">{pkg.packageType === "MONTHLY" ? "Gói đăng ký tháng" : "Mua lẻ"}</p>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="mb-6">
                        <div className={`text-3xl font-black bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
                          {formatCurrency(pkg.price)}
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">/ {pkg.durationDays || 30} ngày · Đã gồm VAT</div>
                      </div>

                      {/* Features */}
                      <ul className="space-y-2.5 mb-8 flex-1">
                        {features.map((feature, fIdx) => (
                          <li key={fIdx} className="flex items-start gap-2.5">
                            <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <Check className="w-3 h-3 text-emerald-600" />
                            </div>
                            <span className="text-sm text-gray-700">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      {/* CTA */}
                      <Link
                        to="/employer/login"
                        className={`block w-full py-3.5 rounded-2xl text-center font-bold text-sm transition-all duration-200 ${
                          isPopular
                            ? `bg-gradient-to-r ${gradient} text-white hover:shadow-xl hover:shadow-purple-200 hover:-translate-y-0.5`
                            : "bg-gray-100 text-gray-700 hover:bg-orange-50 hover:text-orange-700 border border-gray-200"
                        }`}
                      >
                        {isPopular ? "🚀 Bắt đầu ngay" : "Chọn gói này"}
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pay per post */}
          {!loadingPackages && !errorPackages && oneTimePackages.length > 0 && (
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-gray-200 shadow-sm">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-1">Hoặc mua theo số lượng tin</h3>
                <p className="text-sm text-gray-500">Linh hoạt cho nhu cầu ngắn hạn, không cần đăng ký gói</p>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                {oneTimePackages.map((p, idx) => {
                  const isNormal = p.tinType === "NORMAL" || !p.tinType;
                  const note = isNormal ? "Tin thường" : "Tin tuyển gấp";
                  const highlight = idx === 1 || oneTimePackages.length === 1;
                  return (
                    <div key={p.id} className={`rounded-2xl p-5 text-center transition-all ${
                      highlight
                        ? "border-2 border-purple-400 bg-purple-50 shadow-md"
                        : "border border-gray-200 bg-white hover:border-orange-300 hover:shadow-sm"
                    }`}>
                      <div className="text-2xl font-black text-gray-900 mb-1">{p.tinQuantity} tin</div>
                      <div className="text-base font-bold text-orange-600 mb-1">{formatCurrency(p.price)}</div>
                      <div className="text-xs text-gray-400">{note}</div>
                      {highlight && <span className="mt-2 inline-block text-[10px] bg-purple-200 text-purple-700 px-2 py-0.5 rounded-full font-bold">PHỔ BIẾN</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
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
                    <p className="text-gray-600">0973401516</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="mb-1">Email</h3>
                    <p className="text-gray-600">unipartrecruitment@gmail.com</p>
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
                  <img src={logoImage} alt="UniHire Employer" className="h-22 cursor-pointer hover:opacity-80 transition-opacity" />
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
                  <span>Trường đại học FPT, Thạch Thất, Hà Nội</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 flex-shrink-0 text-orange-400" />
                  <a href="tel:0973401516" className="hover:text-orange-400 transition-colors">
                    0973 401 516
                  </a>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 flex-shrink-0 text-orange-400" />
                  <a href="mailto:unipartrecruitment@gmail.com" className="hover:text-orange-400 transition-colors">
                    unipartrecruitment@gmail.com
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-6 border-t border-gray-800">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-gray-400">
                © {new Date().getFullYear()} UniHire Employer. All rights reserved.
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