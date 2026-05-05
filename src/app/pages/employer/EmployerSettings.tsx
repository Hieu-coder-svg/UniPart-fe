import {
  Building2, User, Lock, Mail, Phone, MapPin, Save, Loader2,
  Eye, EyeOff, CheckCircle, AlertCircle, Camera, Calendar, Users
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { userService, EmployerResponse, EmployerUpdateRequest } from "../../../services/userService";
import { authService } from "../../../services/authService";
import { uploadImageToCloudinary } from "../../../services/uploadService";

type Tab = "personal" | "password";

interface Toast {
  type: "success" | "error";
  message: string;
}

export default function EmployerSettings() {
  const [activeTab, setActiveTab] = useState<Tab>("personal");
  const [profile, setProfile] = useState<EmployerResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Merged form state
  const [companyName, setCompanyName] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [companyDesc, setCompanyDesc] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Password form state
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [changingPass, setChangingPass] = useState(false);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await userService.getEmployerMyInfo();
        if (res.result) {
          const p = res.result;
          setProfile(p);
          setCompanyName(p.companyName || "");
          setCompanyAddress(p.companyAddress || "");
          setPhoneNumber(p.phoneNumber || "");
          setCompanyDesc(p.description || "");
          setAvatarUrl(p.avatar || "");
          setFullName(p.fullName || "");
          setEmail(p.email || "");
          setDateOfBirth(p.dateOfBirth || "");
          setGender(p.gender || "");
        }
      } catch (e) {
        console.error(e);
        showToast("error", "Không thể tải thông tin hồ sơ.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    try {
      setIsUploadingAvatar(true);
      const url = await uploadImageToCloudinary(e.target.files[0]);
      setAvatarUrl(url);
      showToast("success", "Tải ảnh lên thành công! Nhấn Lưu để cập nhật.");
    } catch {
      showToast("error", "Lỗi tải ảnh lên. Vui lòng thử lại.");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSaveProfile = async () => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) newErrors.fullName = "Vui lòng nhập họ và tên.";
    
    if (!email.trim()) {
      newErrors.email = "Vui lòng nhập email.";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        newErrors.email = "Email không đúng định dạng.";
      }
    }

    if (!dateOfBirth) {
      newErrors.dateOfBirth = "Vui lòng chọn ngày sinh.";
    } else {
      const dob = new Date(dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const m = today.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
        age--;
      }
      if (age < 18) {
        newErrors.dateOfBirth = "Bạn phải đủ 18 tuổi.";
      }
    }

    if (!gender) newErrors.gender = "Vui lòng chọn giới tính.";
    if (!companyName.trim()) newErrors.companyName = "Vui lòng nhập tên công ty.";
    
    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = "Vui lòng nhập số điện thoại.";
    } else {
      const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
      if (!phoneRegex.test(phoneNumber)) {
        newErrors.phoneNumber = "Số điện thoại không hợp lệ.";
      }
    }

    if (!companyAddress.trim()) newErrors.companyAddress = "Vui lòng nhập địa chỉ trụ sở.";

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      showToast("error", "Vui lòng kiểm tra lại các trường bị lỗi.");
      return;
    }

    setSaving(true);
    try {
      const req: EmployerUpdateRequest = {
        fullName,
        companyName,
        companyAddress,
        phoneNumber,
        email,
        description: companyDesc,
        avatar: avatarUrl,
        dateOfBirth: dateOfBirth ? dateOfBirth : undefined,
        gender: gender ? gender : undefined
      };
      const res = await userService.updateProfileEmployer(req);
      if (res.result) {
        setProfile(res.result);
        showToast("success", "Cập nhật hồ sơ thành công!");
      }
    } catch (e: any) {
      showToast("error", e?.message || "Lỗi cập nhật thông tin.");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPass || !newPass || !confirmPass) {
      showToast("error", "Vui lòng điền đầy đủ các trường mật khẩu.");
      return;
    }
    if (newPass.length < 6) {
      showToast("error", "Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }
    if (newPass !== confirmPass) {
      showToast("error", "Xác nhận mật khẩu không khớp.");
      return;
    }
    setChangingPass(true);
    try {
      const username = profile?.username || localStorage.getItem("username") || "";
      await authService.changePassword({ username, password: currentPass, newPassword: newPass });
      showToast("success", "Đổi mật khẩu thành công!");
      setCurrentPass(""); setNewPass(""); setConfirmPass("");
    } catch (e: any) {
      showToast("error", e?.message || "Đổi mật khẩu thất bại. Kiểm tra lại mật khẩu hiện tại.");
    } finally {
      setChangingPass(false);
    }
  };

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "personal", label: "Hồ sơ cá nhân", icon: User },
    { id: "password", label: "Đổi mật khẩu", icon: Lock },
  ];

  const initials = (profile?.companyName || "?").charAt(0).toUpperCase();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
      </div>
    );
  }

  const getInputClassName = (fieldError?: string) => {
    const baseClass = "w-full px-4 py-3 border rounded-xl focus:outline-none transition ";
    if (fieldError) {
      return baseClass + "border-red-500 focus:ring-2 focus:ring-red-400 focus:border-red-500 bg-red-50/50";
    }
    return baseClass + "border-gray-200 focus:ring-2 focus:ring-orange-400";
  };
  
  const getIconInputClassName = (fieldError?: string) => {
    const baseClass = "w-full pl-11 pr-4 py-3 border rounded-xl focus:outline-none transition ";
    if (fieldError) {
      return baseClass + "border-red-500 focus:ring-2 focus:ring-red-400 focus:border-red-500 bg-red-50/50";
    }
    return baseClass + "border-gray-200 focus:ring-2 focus:ring-orange-400";
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl text-white transition-all duration-300 ${
          toast.type === "success" ? "bg-gradient-to-r from-green-500 to-emerald-600" : "bg-gradient-to-r from-red-500 to-rose-600"
        }`}>
          {toast.type === "success" ? <CheckCircle className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
          <span className="font-medium">{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
          Hồ sơ của tôi
        </h1>
        <p className="text-gray-500 mt-1">Quản lý thông tin hồ sơ và bảo mật tài khoản</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
        <div className="flex gap-1 p-2 border-b border-gray-100 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl transition-all font-medium whitespace-nowrap text-sm ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg"
                  : "text-gray-600 hover:bg-orange-50 hover:text-orange-600"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* ── Personal/Company Merged Tab ── */}
          {activeTab === "personal" && (
            <div className="space-y-8">
              {/* Profile Header & Avatar */}
              <div className="flex flex-col md:flex-row items-center gap-6 p-6 bg-orange-50/50 rounded-2xl border border-orange-100/50">
                <div className="relative group">
                  <div className="w-28 h-28 rounded-2xl overflow-hidden bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-xl ring-4 ring-white">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Avatar/Logo" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white text-5xl font-bold">{initials}</span>
                    )}
                    {isUploadingAvatar && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-white" />
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-3 -right-3 w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center shadow-xl hover:bg-orange-700 hover:scale-110 transition-all border-2 border-white"
                  >
                    <Camera className="w-4 h-4 text-white" />
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                </div>
                <div className="text-center md:text-left">
                  <h2 className="text-2xl font-bold text-gray-800">{companyName || "Chưa cập nhật tên công ty"}</h2>
                  <p className="text-gray-500 font-medium">{fullName || profile?.fullName}</p>
                  <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
                    <span className="px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-xs font-bold tracking-wide uppercase">Nhà tuyển dụng</span>
                    <span className="text-sm text-gray-400">@{profile?.username}</span>
                  </div>
                </div>
              </div>

              {/* Form Grid */}
              <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
                {/* Thông tin cá nhân */}
                <div className="col-span-full pb-2 border-b border-gray-100">
                  <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <User className="w-5 h-5 text-orange-500" />
                    Thông tin cá nhân
                  </h3>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Họ và tên *</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (errors.fullName) setErrors({ ...errors, fullName: "" });
                    }}
                    placeholder="Nhập họ và tên"
                    className={getInputClassName(errors.fullName)}
                  />
                  {errors.fullName && <p className="text-red-500 text-sm mt-1.5 font-medium ml-1">{errors.fullName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <div className="relative">
                    <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${errors.email ? 'text-red-400' : 'text-gray-400'}`} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors({ ...errors, email: "" });
                      }}
                      placeholder="Nhập email"
                      className={getIconInputClassName(errors.email)}
                    />
                  </div>
                  {errors.email && <p className="text-red-500 text-sm mt-1.5 font-medium ml-1">{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ngày sinh *</label>
                  <div className="relative">
                    <Calendar className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${errors.dateOfBirth ? 'text-red-400' : 'text-gray-400'}`} />
                    <input
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => {
                        setDateOfBirth(e.target.value);
                        if (errors.dateOfBirth) setErrors({ ...errors, dateOfBirth: "" });
                      }}
                      className={getIconInputClassName(errors.dateOfBirth)}
                    />
                  </div>
                  {errors.dateOfBirth && <p className="text-red-500 text-sm mt-1.5 font-medium ml-1">{errors.dateOfBirth}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Giới tính *</label>
                  <div className="relative">
                    <Users className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${errors.gender ? 'text-red-400' : 'text-gray-400'}`} />
                    <select
                      value={gender}
                      onChange={(e) => {
                        setGender(e.target.value);
                        if (errors.gender) setErrors({ ...errors, gender: "" });
                      }}
                      className={getIconInputClassName(errors.gender) + " appearance-none"}
                    >
                      <option value="">Chọn giới tính</option>
                      <option value="MALE">Nam</option>
                      <option value="FEMALE">Nữ</option>
                      <option value="OTHER">Khác</option>
                    </select>
                  </div>
                  {errors.gender && <p className="text-red-500 text-sm mt-1.5 font-medium ml-1">{errors.gender}</p>}
                </div>

                {/* Thông tin công ty */}
                <div className="col-span-full pt-4 pb-2 border-b border-gray-100 mt-2">
                  <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-orange-500" />
                    Thông tin doanh nghiệp
                  </h3>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tên công ty *</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => {
                      setCompanyName(e.target.value);
                      if (errors.companyName) setErrors({ ...errors, companyName: "" });
                    }}
                    placeholder="Tên công ty"
                    className={getInputClassName(errors.companyName)}
                  />
                  {errors.companyName && <p className="text-red-500 text-sm mt-1.5 font-medium ml-1">{errors.companyName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại liên hệ *</label>
                  <div className="relative">
                    <Phone className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${errors.phoneNumber ? 'text-red-400' : 'text-gray-400'}`} />
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => {
                        setPhoneNumber(e.target.value);
                        if (errors.phoneNumber) setErrors({ ...errors, phoneNumber: "" });
                      }}
                      placeholder="Số điện thoại"
                      className={getIconInputClassName(errors.phoneNumber)}
                    />
                  </div>
                  {errors.phoneNumber && <p className="text-red-500 text-sm mt-1.5 font-medium ml-1">{errors.phoneNumber}</p>}
                </div>
                <div className="col-span-full">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Địa chỉ trụ sở *</label>
                  <div className="relative">
                    <MapPin className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${errors.companyAddress ? 'text-red-400' : 'text-gray-400'}`} />
                    <input
                      type="text"
                      value={companyAddress}
                      onChange={(e) => {
                        setCompanyAddress(e.target.value);
                        if (errors.companyAddress) setErrors({ ...errors, companyAddress: "" });
                      }}
                      placeholder="Địa chỉ công ty"
                      className={getIconInputClassName(errors.companyAddress)}
                    />
                  </div>
                  {errors.companyAddress && <p className="text-red-500 text-sm mt-1.5 font-medium ml-1">{errors.companyAddress}</p>}
                </div>
                <div className="col-span-full">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả công ty</label>
                  <textarea
                    rows={4}
                    value={companyDesc}
                    onChange={(e) => setCompanyDesc(e.target.value)}
                    placeholder="Giới thiệu về công ty..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 transition resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-6 border-t border-gray-100">
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white font-medium rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  Lưu thay đổi
                </button>
              </div>
            </div>
          )}

          {/* ── Password Tab ── */}
          {activeTab === "password" && (
            <div className="space-y-6 max-w-md mx-auto pt-4">
              <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl text-sm text-orange-800">
                Mật khẩu phải có ít nhất <strong>6 ký tự</strong>. Sau khi đổi, bạn sẽ cần đăng nhập lại.
              </div>

              {[
                { label: "Mật khẩu hiện tại", value: currentPass, setter: setCurrentPass, show: showCurrent, toggle: () => setShowCurrent(v => !v) },
                { label: "Mật khẩu mới", value: newPass, setter: setNewPass, show: showNew, toggle: () => setShowNew(v => !v) },
                { label: "Xác nhận mật khẩu mới", value: confirmPass, setter: setConfirmPass, show: showConfirm, toggle: () => setShowConfirm(v => !v) },
              ].map((field, idx) => (
                <div key={idx}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{field.label}</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={field.show ? "text" : "password"}
                      value={field.value}
                      onChange={(e) => field.setter(e.target.value)}
                      className="w-full pl-11 pr-11 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
                    />
                    <button
                      type="button"
                      onClick={field.toggle}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                    >
                      {field.show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {idx === 2 && confirmPass && newPass !== confirmPass && (
                    <p className="text-xs text-red-500 mt-1.5 font-medium ml-1">Mật khẩu xác nhận không khớp</p>
                  )}
                </div>
              ))}

              <button
                onClick={handleChangePassword}
                disabled={changingPass}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white font-medium rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:hover:translate-y-0 w-full justify-center mt-8"
              >
                {changingPass ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lock className="w-5 h-5" />}
                Đổi mật khẩu
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}