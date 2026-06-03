import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { useAuth } from "../../contexts/AuthContext";
import {
  Search,
  MapPin,
  Clock,
  TrendingUp,
  Shield,
  Users,
  Briefcase,
  BookOpen,
  Coffee,
  Truck,
  Monitor,
  Zap,
  Star,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import { ImageWithFallback } from "../../components/figma/ImageWithFallback";
import Swal from "sweetalert2";

const HANOI_DISTRICTS = [
  // 12 Quận nội thành
  "Ba Đình", "Hoàn Kiếm", "Tây Hồ", "Long Biên", "Cầu Giấy",
  "Đống Đa", "Hai Bà Trưng", "Hoàng Mai", "Thanh Xuân",
  "Nam Từ Liêm", "Bắc Từ Liêm", "Hà Đông",
  // Thị xã
  "Sơn Tây",
  // 17 Huyện ngoại thành
  "Ba Vì", "Chương Mỹ", "Đan Phượng", "Đông Anh", "Gia Lâm",
  "Hoài Đức", "Mê Linh", "Mỹ Đức", "Phú Xuyên", "Phúc Thọ",
  "Quốc Oai", "Sóc Sơn", "Thạch Thất", "Thanh Oai",
  "Thường Tín", "Ứng Hòa",
];

const quickTags = [
  { label: "Việc làm từ xa", icon: Monitor, query: "từ xa" },
  { label: "Phục vụ", icon: Coffee, query: "phục vụ" },
  { label: "Gia sư", icon: BookOpen, query: "gia sư" },
  { label: "Giao hàng", icon: Truck, query: "giao hàng" },
  { label: "Văn phòng", icon: Briefcase, query: "văn phòng" },
  { label: "Tuyển gấp", icon: Zap, query: "tuyển gấp" },
];

export default function Home() {
  const [searchValue, setSearchValue] = useState("");
  const [locationValue, setLocationValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const handleEmployerClick = (e: React.MouseEvent) => {
    if (isAuthenticated && user?.role === "STUDENT") {
      e.preventDefault();
      Swal.fire('Thông báo', 'Bạn phải đăng nhập với vai trò là nhà tuyển dụng để sử dụng chức năng này', 'info');
    }
  };

  const handleSearch = (query?: string) => {
    const q = query ?? searchValue;
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (locationValue && !query) params.set("location", locationValue);
    navigate(`/jobs?${params.toString()}`);
  };


  return (
    <div className="min-h-screen font-sans">

      {/* ═══════════════════════════════════════════════════
          HERO SECTION — Glassmorphism + Abstract Shapes
      ═══════════════════════════════════════════════════ */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden bg-[#0a0f2e]">

        {/* ── Abstract gradient blobs ── */}
        <div className="absolute inset-0 pointer-events-none select-none">
          {/* Blob 1 – top-left cyan glow */}
          <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-cyan-500/30 blur-[120px] animate-pulse" />
          {/* Blob 2 – bottom-right violet glow */}
          <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full bg-violet-600/30 blur-[100px] animate-pulse [animation-delay:1.5s]" />
          {/* Blob 3 – center blue accent */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full bg-blue-600/20 blur-[140px]" />

          {/* Geometric decorative rings */}
          <div className="absolute top-16 right-24 w-64 h-64 rounded-full border border-white/5" />
          <div className="absolute top-16 right-24 w-48 h-48 rounded-full border border-cyan-400/10 translate-x-8 translate-y-8" />
          <div className="absolute bottom-20 left-16 w-80 h-80 rounded-full border border-violet-400/10" />

          {/* Floating grid dots pattern */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "radial-gradient(circle, #fff 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />

          {/* Abstract polygon shapes */}
          <svg
            className="absolute top-10 right-10 w-72 h-72 opacity-10"
            viewBox="0 0 300 300"
            fill="none"
          >
            <polygon
              points="150,20 280,120 230,270 70,270 20,120"
              stroke="url(#g1)"
              strokeWidth="1.5"
              fill="none"
            />
            <polygon
              points="150,60 240,135 210,240 90,240 60,135"
              stroke="url(#g1)"
              strokeWidth="1"
              fill="none"
            />
            <defs>
              <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#7c3aed" />
              </linearGradient>
            </defs>
          </svg>

          <svg
            className="absolute bottom-10 left-10 w-56 h-56 opacity-10"
            viewBox="0 0 200 200"
            fill="none"
          >
            <rect
              x="20"
              y="20"
              width="160"
              height="160"
              rx="20"
              stroke="url(#g2)"
              strokeWidth="1.5"
              fill="none"
              transform="rotate(15 100 100)"
            />
            <rect
              x="40"
              y="40"
              width="120"
              height="120"
              rx="14"
              stroke="url(#g2)"
              strokeWidth="1"
              fill="none"
              transform="rotate(30 100 100)"
            />
            <defs>
              <linearGradient id="g2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#a78bfa" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* ── Main content ── */}
        <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-cyan-300 text-sm font-medium mb-8 shadow-lg">
            <Zap className="w-4 h-4 fill-cyan-400 text-cyan-400" />
            <span>Nền tảng #1 dành cho sinh viên Việt Nam</span>
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-white leading-tight tracking-tight mb-6">
            Tìm việc{" "}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400 bg-clip-text text-transparent">
                part-time
              </span>
              {/* Underline glow */}
              <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-400 to-violet-400 rounded-full opacity-80" />
            </span>
            <br />
            dành riêng cho sinh viên
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Hàng ngàn việc làm linh hoạt, phù hợp lịch học — từ gia sư, phục vụ
            đến làm việc từ xa. Bắt đầu kiếm tiền ngay hôm nay!
          </p>

          {/* ── Glassmorphism Search Bar ── */}
          <div
            className={`relative max-w-3xl mx-auto rounded-2xl transition-all duration-300 ${isFocused
                ? "shadow-[0_0_0_2px_rgba(34,211,238,0.5),0_20px_60px_rgba(34,211,238,0.15)]"
                : "shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
              }`}
          >
            <div className="flex flex-col sm:flex-row gap-0 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden">
              {/* Job keyword input */}
              <div className="flex items-center gap-3 flex-1 px-4 py-3 sm:px-5 sm:py-4 border-b sm:border-b-0 sm:border-r border-white/15">
                <Search className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Tìm kiếm công việc, vị trí..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="flex-1 bg-transparent text-white placeholder-slate-400 outline-none text-base"
                />
              </div>

              {/* Location input */}
              <div className="flex items-center gap-3 px-4 py-3 sm:px-5 sm:py-4 sm:w-52 border-b sm:border-b-0 sm:border-r border-white/15">
                <MapPin className="w-5 h-5 text-violet-400 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Khu vực..."
                  value={locationValue}
                  onChange={(e) => setLocationValue(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="flex-1 bg-transparent text-white placeholder-slate-400 outline-none text-base"
                />
              </div>

              {/* Search button */}
              <button
                onClick={() => handleSearch()}
                className="flex items-center justify-center gap-2 px-5 py-3 sm:px-7 sm:py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-base transition-all duration-200 hover:shadow-[0_0_24px_rgba(34,211,238,0.4)] active:scale-95"
              >
                <Search className="w-5 h-5" />
                <span>Tìm kiếm</span>
              </button>
            </div>
          </div>

          {/* ── Quick Tags ── */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 mt-6">
            <span className="text-slate-400 text-sm mr-1">Phổ biến:</span>
            {quickTags.map((tag) => (
              <button
                key={tag.label}
                onClick={() => handleSearch(tag.query)}
                className="group inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/8 backdrop-blur-sm border border-white/15 text-slate-300 text-sm font-medium hover:bg-white/20 hover:border-cyan-400/50 hover:text-cyan-300 hover:shadow-[0_0_12px_rgba(34,211,238,0.2)] transition-all duration-200"
              >
                <tag.icon className="w-3.5 h-3.5 group-hover:text-cyan-400 transition-colors" />
                {tag.label}
              </button>
            ))}
          </div>

          {/* ── Social proof mini stats ── */}
          <div className="flex flex-wrap items-center justify-center gap-8 mt-14">
            {[
              { value: "10,000+", label: "Sinh viên" },
              { value: "5,000+", label: "Việc làm" },
              { value: "2,000+", label: "Doanh nghiệp" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  {s.value}
                </div>
                <div className="text-slate-400 text-sm mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent pointer-events-none" />
      </section>

      {/* ═══════════════════════════════════════════════════
          FEATURES SECTION
      ═══════════════════════════════════════════════════ */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Tại sao chọn UniPart?</h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              Nền tảng tìm việc bán thời gian hàng đầu dành riêng cho sinh viên với hàng ngàn công việc chất lượng
            </p>
          </div>

          {/* Feature Image */}
          <div className="mb-14 rounded-3xl overflow-hidden shadow-2xl max-w-4xl mx-auto ring-1 ring-gray-100">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1758270705518-b61b40527e76?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaXZlcnNlJTIwc3R1ZGVudHMlMjB3b3JraW5nJTIwdG9nZXRoZXJ8ZW58MXx8fHwxNzczNDE4MjAxfDA&ixlib=rb-4.1.0&q=80&w=1080"
              alt="Students working together"
              className="w-full h-80 object-cover"
            />
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: MapPin, title: "Tìm việc gần trường", desc: "Lọc công việc theo khoảng cách, tiết kiệm thời gian di chuyển", from: "from-cyan-500", to: "to-blue-500" },
              { icon: Clock, title: "Lịch linh hoạt", desc: "Chọn ca làm việc phù hợp với thời khóa biểu học tập", from: "from-violet-500", to: "to-purple-600" },
              { icon: TrendingUp, title: "Đề xuất AI", desc: "Hệ thống AI gợi ý việc làm phù hợp với kỹ năng và sở thích", from: "from-blue-500", to: "to-cyan-500" },
              { icon: Shield, title: "Đánh giá xác thực", desc: "Đánh giá chỉ từ người đã làm việc thực tế, không thể xóa", from: "from-emerald-500", to: "to-teal-500" },
              { icon: Users, title: "Cộng đồng sinh viên", desc: "Chia sẻ kinh nghiệm, cảnh báo nơi làm việc không uy tín", from: "from-orange-500", to: "to-rose-500" },
              { icon: Search, title: "Tuyển dụng gấp", desc: "Tìm việc làm ngay trong ngày với bộ lọc \"Tuyển gấp\"", from: "from-pink-500", to: "to-violet-500" },
            ].map(({ icon: Icon, title, desc, from, to }) => (
              <div
                key={title}
                className="group text-center p-5 md:p-8 rounded-2xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-gray-50 to-white border border-gray-100 hover:border-transparent hover:-translate-y-1"
              >
                <div className={`w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br ${from} ${to} rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-6 h-6 md:w-8 md:h-8 text-white" />
                </div>
                <h3 className="mb-2 font-bold text-lg text-gray-900">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          CTA SECTION
      ═══════════════════════════════════════════════════ */}
      <section className="relative py-20 overflow-hidden">
        {/* BG */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0f2e] via-blue-900 to-violet-900" />
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
        <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-cyan-500/20 blur-[80px]" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-violet-500/20 blur-[80px]" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Sẵn sàng bắt đầu?</h2>
          <p className="text-xl mb-10 text-slate-300">
            Hàng trăm công việc đang chờ bạn khám phá
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/jobs"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-[0_0_32px_rgba(34,211,238,0.4)] hover:scale-105 transition-all duration-300"
            >
              Tìm việc ngay <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/community"
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-semibold border border-white/25 hover:bg-white/20 hover:border-white/50 transition-all duration-300"
            >
              Tham gia cộng đồng <ChevronRight className="w-5 h-5" />
            </Link>
          </div>

          {/* Employer CTA */}
          <div className="mt-14 pt-10 border-t border-white/10">
            <p className="text-slate-400 mb-4">Bạn là nhà tuyển dụng?</p>
            <Link
              to="/employer"
              onClick={handleEmployerClick}
              className="inline-flex items-center gap-2 bg-white text-blue-700 px-7 py-3 rounded-xl font-semibold hover:shadow-2xl hover:scale-105 transition-all duration-300"
            >
              Đăng tin tuyển dụng <Briefcase className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          STATS SECTION
      ═══════════════════════════════════════════════════ */}
      <section className="py-16 bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 text-center">
            {[
              { val: "10,000+", label: "Sinh viên" },
              { val: "5,000+", label: "Việc làm" },
              { val: "2,000+", label: "Doanh nghiệp" },
              { val: "98%", label: "Hài lòng" },
            ].map(({ val, label }) => (
              <div key={label}>
                <div className="text-4xl font-extrabold mb-1 bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                  {val}
                </div>
                <div className="text-gray-500 font-medium">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}