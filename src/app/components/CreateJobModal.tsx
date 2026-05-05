import { useState } from "react";
import { X, Briefcase, MapPin, DollarSign, Users, Clock, ImagePlus } from "lucide-react";
import { jobService, JobCreationRequest } from "../../services/jobService";
import { uploadImageToCloudinary } from "../../services/uploadService";
import MapPicker from "./MapPicker";
interface CreateJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateJobModal({ isOpen, onClose, onSuccess }: CreateJobModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [formData, setFormData] = useState<JobCreationRequest>({
    title: "",
    description: "",
    workingShift: "Full-time",
    vacancies: 1,
    urgent: false,
    address: "",
    locationLatitude: undefined,
    locationLongitude: undefined,
    salary: 0,
    expiredAt: new Date(Date.now() + 7 * 86400000).toISOString().split('.')[0], // default 7 days
    timeSlots: []
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Đăng tin tuyển dụng mới
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Loại công việc / Ca làm việc *</label>
                <select
                  value={formData.workingShift}
                  onChange={(e) => setFormData({...formData, workingShift: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Mức lương (VNĐ) *</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.salary}
                    onChange={(e) => setFormData({...formData, salary: parseInt(e.target.value) || 0})}
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
                    value={formData.expiredAt}
                    onChange={(e) => setFormData({...formData, expiredAt: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Địa điểm làm việc</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500"
                  placeholder="Nhập địa chỉ làm việc"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vĩ độ bản đồ (Latitude)</label>
                <input
                  type="number"
                  step="any"
                  value={formData.locationLatitude || ""}
                  onChange={(e) => setFormData({...formData, locationLatitude: parseFloat(e.target.value) || undefined})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500"
                  placeholder="VD: 21.0285"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kinh độ bản đồ (Longitude)</label>
                <input
                  type="number"
                  step="any"
                  value={formData.locationLongitude || ""}
                  onChange={(e) => setFormData({...formData, locationLongitude: parseFloat(e.target.value) || undefined})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500"
                  placeholder="VD: 105.8542"
                />
              </div>
            </div>

            {/* Map Picker */}
            <MapPicker 
              position={formData.locationLatitude && formData.locationLongitude ? [formData.locationLatitude, formData.locationLongitude] : null}
              onPositionChange={(lat, lng) => setFormData({...formData, locationLatitude: Number(lat.toFixed(6)), locationLongitude: Number(lng.toFixed(6))})}
            />

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
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500"
                placeholder="Mô tả chi tiết công việc, yêu cầu, quyền lợi..."
              ></textarea>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="urgent"
                checked={formData.urgent}
                onChange={(e) => setFormData({...formData, urgent: e.target.checked})}
                className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500 border-gray-300"
              />
              <label htmlFor="urgent" className="text-gray-700 font-medium">Đánh dấu là tin tuyển gấp</label>
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
      </div>
    </div>
  );
}
