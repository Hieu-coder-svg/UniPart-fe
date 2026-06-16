import { useState, useRef, useEffect } from "react";
import { X, Briefcase, MapPin, DollarSign, Users, Clock, ImagePlus, Loader2, AlertTriangle, Package, Zap } from "lucide-react";
import { jobService, JobCreationRequest, JobType, JobTypeLabels } from "../../services/jobService";
import { uploadImageToCloudinary } from "../../services/uploadService";
import { userService } from "../../services/userService";
import { Link } from "react-router";
import MapPicker from "./MapPicker";

const getLocalExpiryDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

interface CreateJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateJobModal({ isOpen, onClose, onSuccess }: CreateJobModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [remainingPosts, setRemainingPosts] = useState<number | null>(null);
  const [remainingUrgentPosts, setRemainingUrgentPosts] = useState<number | null>(null);
  const [remainingMonthlyPosts, setRemainingMonthlyPosts] = useState<number | null>(null);
  const [remainingMonthlyUrgentPosts, setRemainingMonthlyUrgentPosts] = useState<number | null>(null);
  const [currentPackage, setCurrentPackage] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [formData, setFormData] = useState<JobCreationRequest>({
    title: "",
    description: "",
    workingShift: "Full-time",
    jobType: undefined,
    vacancies: 1,
    urgent: false,
    address: "",
    locationLatitude: undefined,
    locationLongitude: undefined,
    salary: 0,
    expiredAt: getLocalExpiryDate(),
    timeSlots: []
  });

  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMapClick = async (lat: number, lng: number) => {
    setFormData(prev => ({ ...prev, locationLatitude: Number(lat.toFixed(6)), locationLongitude: Number(lng.toFixed(6)) }));
    
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
      const data = await response.json();
      if (data && data.display_name) {
        setFormData(prev => ({ ...prev, address: data.display_name }));
      } else {
        setFormData(prev => ({ ...prev, address: `Tọa độ: ${lat.toFixed(4)}, ${lng.toFixed(4)}` }));
      }
    } catch (error) {
      console.error("Failed to fetch address", error);
      setFormData(prev => ({ ...prev, address: `Tọa độ: ${lat.toFixed(4)}, ${lng.toFixed(4)}` }));
    }
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({ ...formData, address: value });

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (value.trim().length > 2) {
      searchTimeoutRef.current = setTimeout(async () => {
        setIsLoadingAddress(true);
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&limit=5&countrycodes=vn`);
          const data = await response.json();
          setAddressSuggestions(data || []);
          setShowSuggestions(true);
        } catch (error) {
          console.error("Failed to fetch suggestions", error);
        } finally {
          setIsLoadingAddress(false);
        }
      }, 500);
    } else {
      setAddressSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectSuggestion = (suggestion: any) => {
    const lat = parseFloat(suggestion.lat);
    const lng = parseFloat(suggestion.lon);
    setFormData({ ...formData, address: suggestion.display_name, locationLatitude: lat, locationLongitude: lng });
    setShowSuggestions(false);
    setAddressSuggestions([]);
  };

  useEffect(() => {
    const fetchInfo = () => {
      userService.getEmployerMyInfo().then(res => {
        if (res.result) {
          setRemainingPosts(res.result.remainingPosts !== undefined ? res.result.remainingPosts : 0);
          setRemainingUrgentPosts(res.result.remainingUrgentPosts !== undefined ? res.result.remainingUrgentPosts : 0);
          setRemainingMonthlyPosts(res.result.remainingMonthlyPosts !== undefined ? res.result.remainingMonthlyPosts : 0);
          setRemainingMonthlyUrgentPosts(res.result.remainingMonthlyUrgentPosts !== undefined ? res.result.remainingMonthlyUrgentPosts : 0);
          setCurrentPackage(res.result.currentPackage || "Gói Cơ bản");
        }
      }).catch(err => console.error("Failed to fetch employer info", err));
    };

    if (isOpen) {
      setFormData({
        title: "",
        description: "",
        workingShift: "Full-time",
        jobType: undefined,
        vacancies: 1,
        urgent: false,
        address: "",
        locationLatitude: undefined,
        locationLongitude: undefined,
        salary: 0,
        expiredAt: getLocalExpiryDate(),
        timeSlots: []
      });
      setImageFile(null);
      setImagePreview("");
      fetchInfo();
      
      window.addEventListener('focus', fetchInfo);
      return () => {
        window.removeEventListener('focus', fetchInfo);
      };
    }
  }, [isOpen]);

  const isPremium = currentPackage !== "Gói Cơ bản" && currentPackage !== "Miễn phí" && currentPackage !== "";

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile && !formData.image) {
      setError("Vui lòng tải lên ảnh bìa công việc");
      return;
    }
    if (!formData.jobType) {
      setError("Vui lòng chọn ngành nghề");
      return;
    }
    if (formData.urgent) {
      if ((remainingUrgentPosts === null || remainingUrgentPosts <= 0) && (remainingMonthlyUrgentPosts === null || remainingMonthlyUrgentPosts <= 0)) {
        setError("Bạn đã hết lượt đăng tin tuyển gấp. Vui lòng mua thêm gói để tiếp tục.");
        return;
      }
    } else {
      if ((remainingPosts === null || remainingPosts <= 0) && (remainingMonthlyPosts === null || remainingMonthlyPosts <= 0)) {
        setError("Bạn đã hết lượt đăng tin bình thường. Vui lòng mua thêm gói để tiếp tục.");
        return;
      }
    }
    setLoading(true);
    setError("");
    try {
      let imageUrl = formData.image;
      if (imageFile) {
        imageUrl = await uploadImageToCloudinary(imageFile);
      }
      await jobService.createJob({ ...formData, image: imageUrl });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Đã xảy ra lỗi khi tạo tin tuyển dụng");
    } finally {
      setLoading(false);
    }
  };

  const isOutOfPosts = remainingPosts !== null && remainingUrgentPosts !== null && remainingMonthlyPosts !== null && remainingMonthlyUrgentPosts !== null && remainingPosts <= 0 && remainingUrgentPosts <= 0 && remainingMonthlyPosts <= 0 && remainingMonthlyUrgentPosts <= 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
        <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex items-center justify-between z-50">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Đăng tin tuyển dụng mới
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {isOutOfPosts ? (
          <div className="p-8 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Hết lượt đăng tin</h3>
            <p className="text-gray-600 max-w-md">
              Tài khoản của bạn hiện không còn lượt đăng tin tuyển dụng nào. Vui lòng nâng cấp gói hoặc mua thêm lượt để tiếp tục đăng tin.
            </p>
            <Link 
              to="/employer/dashboard/buy-posts" 
              onClick={onClose}
              className="mt-4 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl font-medium hover:shadow-lg transition-all inline-block"
            >
              Mua thêm lượt đăng
            </Link>
          </div>
        ) : (
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {(remainingPosts !== null && remainingPosts > 0) || (remainingUrgentPosts !== null && remainingUrgentPosts > 0) || (remainingMonthlyPosts !== null && remainingMonthlyPosts > 0) || (remainingMonthlyUrgentPosts !== null && remainingMonthlyUrgentPosts > 0) ? (
            <div className="p-4 bg-white border border-indigo-100 rounded-xl shadow-sm text-sm">
              <div className="flex justify-between items-center mb-3">
                <span className="font-semibold text-gray-700">Lượt đăng tin hiện có:</span>
                <Link to="/employer/dashboard/buy-posts" onClick={onClose} className="text-indigo-600 hover:text-indigo-700 font-medium hover:underline flex items-center gap-1 text-xs bg-indigo-50 px-2.5 py-1 rounded-md transition-colors">
                  Mua thêm
                </Link>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="px-2.5 py-1.5 bg-blue-50 text-blue-700 rounded-lg border border-blue-100 flex items-center gap-1.5 font-medium text-xs">
                  <Package className="w-3.5 h-3.5" />
                  Tin thường (lẻ): <span className="font-bold text-sm">{remainingPosts || 0}</span>
                </span>
                <span className="px-2.5 py-1.5 bg-orange-50 text-orange-700 rounded-lg border border-orange-100 flex items-center gap-1.5 font-medium text-xs">
                  <Zap className="w-3.5 h-3.5" />
                  Tin gấp (lẻ): <span className="font-bold text-sm">{remainingUrgentPosts || 0}</span>
                </span>
                <span className="px-2.5 py-1.5 bg-purple-50 text-purple-700 rounded-lg border border-purple-100 flex items-center gap-1.5 font-medium text-xs">
                  <Package className="w-3.5 h-3.5" />
                  Tin thường trong ngày (gói tháng): <span className="font-bold text-sm">{remainingMonthlyPosts || 0}</span>
                </span>
                <span className="px-2.5 py-1.5 bg-pink-50 text-pink-700 rounded-lg border border-pink-100 flex items-center gap-1.5 font-medium text-xs">
                  <Zap className="w-3.5 h-3.5" />
                  Tin gấp (gói tháng): <span className="font-bold text-sm">{remainingMonthlyUrgentPosts || 0}</span>
                </span>
              </div>
            </div>
          ) : null}
          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          <div className="flex items-center gap-2 pt-2 pb-2">
            <input
              type="checkbox"
              id="urgent"
              checked={formData.urgent}
              disabled={(remainingUrgentPosts === null || remainingUrgentPosts <= 0) && (remainingMonthlyUrgentPosts === null || remainingMonthlyUrgentPosts <= 0)}
              onChange={(e) => setFormData({...formData, urgent: e.target.checked})}
              className={`w-5 h-5 rounded border-gray-300 ${((remainingUrgentPosts && remainingUrgentPosts > 0) || (remainingMonthlyUrgentPosts && remainingMonthlyUrgentPosts > 0)) ? 'text-orange-600 focus:ring-orange-500 cursor-pointer' : 'text-gray-300 bg-gray-100 cursor-not-allowed'}`}
            />
            <div className="flex flex-col">
              <label htmlFor="urgent" className={`font-medium ${((remainingUrgentPosts && remainingUrgentPosts > 0) || (remainingMonthlyUrgentPosts && remainingMonthlyUrgentPosts > 0)) ? 'text-gray-700 cursor-pointer' : 'text-gray-400 cursor-not-allowed'}`}>
                Đánh dấu là tin tuyển gấp
              </label>
              {((!remainingUrgentPosts || remainingUrgentPosts <= 0) && (!remainingMonthlyUrgentPosts || remainingMonthlyUrgentPosts <= 0)) && (
                <span className="text-[10px] text-red-500 mt-0.5">
                  Bạn đã hết lượt. <a href="/employer/dashboard/buy-posts" target="_blank" rel="noopener noreferrer" className="underline hover:text-red-700">Mua thêm gói tuyển gấp</a>
                </span>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ảnh bìa công việc</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-orange-500 transition-colors">
                <div className="space-y-1 text-center">
                  {imagePreview ? (
                    <div className="relative inline-block">
                      <img src={imagePreview} alt="Preview" className="max-h-40 rounded-lg shadow-md" />
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview("");
                        }}
                        className="absolute -top-3 -right-3 bg-red-100 text-red-600 hover:bg-red-200 rounded-full p-1.5 shadow-sm transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <ImagePlus className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                      <div className="flex text-sm text-gray-600 justify-center">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-orange-600 hover:text-orange-500 focus-within:outline-none"
                        >
                          <span>Tải ảnh lên</span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            className="sr-only"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setImageFile(file);
                                setImagePreview(URL.createObjectURL(file));
                              }
                            }}
                          />
                        </label>
                        <p className="pl-1">hoặc kéo thả</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">PNG, JPG, GIF tối đa 10MB</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề công việc *</label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500"
                  placeholder="VD: Nhân viên phục vụ part-time"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ngành nghề *</label>
                <select
                  value={formData.jobType || ""}
                  onChange={(e) => setFormData({...formData, jobType: e.target.value as JobType})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500"
                  required
                >
                  <option value="" disabled>Chọn ngành nghề</option>
                  {Object.entries(JobTypeLabels).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ca làm việc *</label>
                <select
                  value={formData.workingShift}
                  onChange={(e) => setFormData({...formData, workingShift: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500"
                  required
                >
                  <option value="Ca Sáng">Ca Sáng</option>
                  <option value="Ca Chiều">Ca Chiều</option>
                  <option value="Ca Tối">Ca Tối</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Ca Linh Hoạt">Ca Linh Hoạt</option>
                  <option value="Tự do">Tự do</option>
                  <option value="Xoay ca">Xoay ca</option>
                  <option value="Làm tại nhà">Làm tại nhà</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng tuyển *</label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.vacancies}
                    onChange={(e) => setFormData({...formData, vacancies: parseInt(e.target.value) || 1})}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mức lương (VNĐ)/giờ làm *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₫</span>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.salary === 0 ? '' : formData.salary}
                    onChange={(e) => setFormData({...formData, salary: e.target.value === '' ? 0 : parseInt(e.target.value)})}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500"
                    placeholder="VD: 5000000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ngày hết hạn *</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="datetime-local"
                    required
                    disabled
                    value={formData.expiredAt}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            <div className="relative z-20">
              <label className="block text-sm font-medium text-gray-700 mb-1">Địa điểm làm việc</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={handleAddressChange}
                  onFocus={() => { if (addressSuggestions.length > 0) setShowSuggestions(true); }}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500"
                  placeholder="Nhập địa chỉ làm việc"
                  autoComplete="off"
                />
                {isLoadingAddress && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />}
              </div>

              {showSuggestions && addressSuggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                  {addressSuggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectSuggestion(suggestion)}
                      className="w-full text-left px-4 py-3 hover:bg-orange-50 border-b border-gray-100 last:border-0 transition-colors"
                    >
                      <div className="text-sm font-medium text-gray-800 line-clamp-1">{suggestion.display_name.split(',')[0]}</div>
                      <div className="text-xs text-gray-500 line-clamp-1">{suggestion.display_name}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>



            {/* Map Picker */}
            <div className="relative z-10">
              <MapPicker 
                position={formData.locationLatitude && formData.locationLongitude ? [formData.locationLatitude, formData.locationLongitude] : null}
                onPositionChange={handleMapClick}
              />
            </div>

            {/* Time Slots */}
            <div className="border border-gray-200 rounded-xl p-4 space-y-4 bg-gray-50">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700">Thời gian làm việc (Time slots)</label>
                <button
                  type="button"
                  onClick={() => setFormData({
                    ...formData, 
                    timeSlots: [...(formData.timeSlots || []), { workDate: "", startTime: "", endTime: "" }]
                  })}
                  className="text-sm px-3 py-1 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 font-medium transition-colors"
                >
                  + Thêm ca làm
                </button>
              </div>
              
              {formData.timeSlots?.map((slot, index) => (
                <div key={index} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                  <div className="sm:col-span-1">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Ngày làm</label>
                    <input
                      type="date"
                      required
                      value={slot.workDate}
                      onChange={(e) => {
                        const newSlots = [...(formData.timeSlots || [])];
                        newSlots[index].workDate = e.target.value;
                        setFormData({...formData, timeSlots: newSlots});
                      }}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div className="sm:col-span-1">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Bắt đầu</label>
                    <input
                      type="time"
                      required
                      value={slot.startTime}
                      onChange={(e) => {
                        const newStartTime = e.target.value;
                        const newSlots = [...(formData.timeSlots || [])];
                        newSlots[index].startTime = newStartTime;
                        
                        if (newStartTime) {
                          const [hours, minutes] = newStartTime.split(':');
                          const endHours = (parseInt(hours, 10) + 1).toString().padStart(2, '0');
                          const finalHours = endHours === '24' ? '00' : endHours;
                          newSlots[index].endTime = `${finalHours}:${minutes}`;
                        }
                        
                        setFormData({...formData, timeSlots: newSlots});
                      }}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div className="sm:col-span-1">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Kết thúc</label>
                    <input
                      type="time"
                      required
                      value={slot.endTime}
                      onChange={(e) => {
                        const newSlots = [...(formData.timeSlots || [])];
                        newSlots[index].endTime = e.target.value;
                        setFormData({...formData, timeSlots: newSlots});
                      }}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div className="sm:col-span-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        const newSlots = formData.timeSlots?.filter((_, i) => i !== index);
                        setFormData({...formData, timeSlots: newSlots});
                      }}
                      className="p-2 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
              {(!formData.timeSlots || formData.timeSlots.length === 0) && (
                <div className="text-sm text-gray-500 text-center py-4 bg-white rounded-lg border border-gray-200 border-dashed">
                  Chưa có ca làm việc nào. Bấm "+ Thêm ca làm" để tạo.
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả công việc</label>
              <textarea
                rows={4}
                required
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500"
                placeholder="Mô tả chi tiết công việc, yêu cầu, quyền lợi..."
              ></textarea>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl font-medium hover:shadow-lg disabled:opacity-50 transition-all"
            >
              {loading ? "Đang xử lý..." : "Đăng tin"}
            </button>
          </div>
        </form>
        )}
      </div>
    </div>
  );
}
