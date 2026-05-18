import { useState, useEffect, useRef } from "react";
import { X, Briefcase, MapPin, DollarSign, Users, Clock, ImagePlus, Eye, EyeOff, Loader2 } from "lucide-react";
import { jobService, JobResponse, JobCreationRequest } from "../../services/jobService";
import { uploadImageToCloudinary } from "../../services/uploadService";
import { userService } from "../../services/userService";
import MapPicker from "./MapPicker";

interface EditJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  job: JobResponse | null;
}

export function EditJobModal({ isOpen, onClose, onSuccess, job }: EditJobModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPackage, setCurrentPackage] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [formData, setFormData] = useState<JobCreationRequest & { isHide: boolean }>({
    title: "",
    description: "",
    workingShift: "Full-time",
    vacancies: 1,
    urgent: false,
    address: "",
    locationLatitude: undefined,
    locationLongitude: undefined,
    salary: 0,
    expiredAt: "",
    timeSlots: [],
    isHide: false
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
      }
    } catch (error) {
      console.error("Failed to fetch address", error);
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
    if (job && isOpen) {
      setFormData({
        title: job.title || "",
        description: job.description || "",
        workingShift: job.workingShift || "Full-time",
        vacancies: job.vacancies || 1,
        urgent: job.urgent || false,
        address: job.address || "",
        locationLatitude: job.locationLatitude,
        locationLongitude: job.locationLongitude,
        salary: job.salary || 0,
        expiredAt: job.expiredAt ? job.expiredAt.split('.')[0] : "",
        timeSlots: job.timeSlots || [],
        isHide: job.isHide || false,
        image: job.image
      });
      setImagePreview(job.image || "");
      
      userService.getEmployerMyInfo().then(res => {
        if (res.result) {
          setCurrentPackage(res.result.currentPackage || "Gói Cơ bản");
        }
      }).catch(err => console.error("Failed to fetch employer info", err));
    }
  }, [job, isOpen]);

  const isPremium = currentPackage !== "Gói Cơ bản" && currentPackage !== "Miễn phí" && currentPackage !== "";

  if (!isOpen || !job) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      let imageUrl = formData.image;
      if (imageFile) {
        imageUrl = await uploadImageToCloudinary(imageFile);
      }
      
      // Standardize data for backend
      const updateData = {
        ...formData,
        image: imageUrl,
        // Ensure LocalDateTime format: YYYY-MM-DDTHH:mm:ss
        expiredAt: formData.expiredAt ? (formData.expiredAt.length === 16 ? `${formData.expiredAt}:00` : formData.expiredAt) : null,
        timeSlots: formData.timeSlots?.map(slot => ({
          ...slot,
          // Ensure LocalTime format: HH:mm:ss
          startTime: slot.startTime.length === 5 ? `${slot.startTime}:00` : slot.startTime,
          endTime: slot.endTime.length === 5 ? `${slot.endTime}:00` : slot.endTime
        }))
      };

      console.log("Sending update data:", updateData);
      const res = await jobService.updateJob(job.id, updateData);
      
      if (res.code === 1000) {
        onSuccess();
        onClose();
      } else {
        setError(res.message || "Cập nhật thất bại");
      }
    } catch (err: any) {
      console.error("Update job error:", err);
      setError(err.message || "Đã xảy ra lỗi khi cập nhật tin tuyển dụng");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex items-center justify-between z-50">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Chỉnh sửa tin tuyển dụng
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Status & Urgent Toggle Row */}
            <div className="flex flex-wrap gap-4 items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-100">
               <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isHide"
                      checked={formData.isHide}
                      onChange={(e) => setFormData({...formData, isHide: e.target.checked})}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                    />
                    <label htmlFor="isHide" className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                       {formData.isHide ? <EyeOff className="w-4 h-4 text-gray-500" /> : <Eye className="w-4 h-4 text-blue-500" />}
                       Ẩn tin này
                    </label>
                  </div>
               </div>

               <div className="flex items-start gap-2 pt-0.5">
                <input
                  type="checkbox"
                  id="urgent"
                  checked={formData.urgent}
                  disabled={!isPremium}
                  onChange={(e) => setFormData({...formData, urgent: e.target.checked})}
                  className={`w-5 h-5 rounded border-gray-300 mt-0.5 ${isPremium ? 'text-orange-600 focus:ring-orange-500' : 'text-gray-300 bg-gray-100 cursor-not-allowed'}`}
                />
                <div className="flex flex-col">
                  <label htmlFor="urgent" className={`text-sm font-semibold ${isPremium ? 'text-gray-700' : 'text-gray-400'}`}>Tuyển gấp 🔥</label>
                  {!isPremium && <span className="text-[10px] text-red-500">Yêu cầu nâng cấp gói</span>}
                </div>
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ảnh bìa công việc</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-blue-500 transition-colors">
                <div className="space-y-1 text-center">
                  {imagePreview ? (
                    <div className="relative inline-block">
                      <img src={imagePreview} alt="Preview" className="max-h-40 rounded-lg shadow-md" />
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview("");
                          setFormData({...formData, image: ""});
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
                          htmlFor="file-upload-edit"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                        >
                          <span>Thay đổi ảnh</span>
                          <input
                            id="file-upload-edit"
                            name="file-upload-edit"
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
                      </div>
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
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  placeholder="VD: Nhân viên phục vụ part-time"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Loại công việc / Ca làm việc *</label>
                <select
                  value={formData.workingShift}
                  onChange={(e) => setFormData({...formData, workingShift: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
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
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mức lương (VNĐ) *</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.salary}
                    onChange={(e) => setFormData({...formData, salary: parseInt(e.target.value) || 0})}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
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
                    value={formData.expiredAt}
                    onChange={(e) => setFormData({...formData, expiredAt: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
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
                  value={formData.address}
                  onChange={handleAddressChange}
                  onFocus={() => { if (addressSuggestions.length > 0) setShowSuggestions(true); }}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
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
                      className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-gray-100 last:border-0 transition-colors"
                    >
                      <div className="text-sm font-medium text-gray-800 line-clamp-1">{suggestion.display_name.split(',')[0]}</div>
                      <div className="text-xs text-gray-500 line-clamp-1">{suggestion.display_name}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

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
                  className="text-sm px-3 py-1 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 font-medium transition-colors"
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
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="sm:col-span-1">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Bắt đầu</label>
                    <input
                      type="time"
                      required
                      value={slot.startTime}
                      onChange={(e) => {
                        const newSlots = [...(formData.timeSlots || [])];
                        newSlots[index].startTime = e.target.value;
                        setFormData({...formData, timeSlots: newSlots});
                      }}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
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
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
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
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả công việc</label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
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
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg disabled:opacity-50 transition-all"
            >
              {loading ? "Đang lưu..." : "Cập nhật tin"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
