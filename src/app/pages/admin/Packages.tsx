import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, CheckCircle, TrendingUp, X, Loader2, AlertCircle } from "lucide-react";
import { packageService, PackageRequest, PackageResponse } from "../../../services/packageService";

export default function AdminPackages() {
  const [packages, setPackages] = useState<PackageResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState<PackageResponse | null>(null);
  const [formData, setFormData] = useState<any>({
    name: "",
    packageType: "MONTHLY",
    price: "",
    description: "",
    durationDays: 30,
    normalTinsLimit: 60,
    maxNormalTinsPerDay: 2,
    urgentTinsLimit: 5,
    tinType: "NORMAL",
    tinQuantity: 1,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const data = await packageService.getAllPackages();
      setPackages(data);
    } catch (err: any) {
      setError(err.message || "Không thể tải danh sách gói dịch vụ");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (pkg?: PackageResponse) => {
    if (pkg) {
      setEditingPackage(pkg);
      setFormData({
        name: pkg.name,
        packageType: pkg.packageType as "MONTHLY" | "PAY_PER_TIN",
        price: pkg.price,
        description: pkg.description || "",
        durationDays: pkg.durationDays ?? 30,
        normalTinsLimit: pkg.normalTinsLimit ?? 60,
        maxNormalTinsPerDay: pkg.maxNormalTinsPerDay ?? 2,
        urgentTinsLimit: pkg.urgentTinsLimit ?? 5,
        tinType: pkg.tinType || "NORMAL",
        tinQuantity: pkg.tinQuantity ?? 1,
      });
    } else {
      setEditingPackage(null);
      setFormData({
        name: "",
        packageType: "MONTHLY",
        price: "",
        description: "",
        durationDays: 30,
        normalTinsLimit: 60,
        maxNormalTinsPerDay: 2,
        urgentTinsLimit: 5,
        tinType: "NORMAL",
        tinQuantity: 1,
      });
    }
    setError(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPackage(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const submitData: PackageRequest = {
        ...formData,
        price: Number(formData.price) || 0,
        durationDays: formData.packageType === "MONTHLY" ? (Number(formData.durationDays) || 30) : undefined,
        normalTinsLimit: formData.packageType === "MONTHLY" ? (Number(formData.normalTinsLimit) || 0) : undefined,
        maxNormalTinsPerDay: formData.packageType === "MONTHLY" ? (Number(formData.maxNormalTinsPerDay) || 0) : undefined,
        urgentTinsLimit: formData.packageType === "MONTHLY" ? (Number(formData.urgentTinsLimit) || 0) : undefined,
        tinType: formData.packageType === "PAY_PER_TIN" || formData.packageType === "ONE_TIME" ? formData.tinType : undefined,
        tinQuantity: formData.packageType === "PAY_PER_TIN" || formData.packageType === "ONE_TIME" ? (Number(formData.tinQuantity) || 1) : undefined,
      };

      if (editingPackage) {
        await packageService.updatePackage(editingPackage.id, submitData);
      } else {
        await packageService.createPackage(submitData);
      }
      await fetchPackages();
      handleCloseModal();
    } catch (err: any) {
      setError(err.message || "Đã xảy ra lỗi");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await packageService.deletePackage(id);
      await fetchPackages();
      setDeleteConfirm(null);
    } catch (err: any) {
      setError(err.message || "Không thể xóa gói dịch vụ");
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price) + "đ";
  };

  const monthlyPackages = packages.filter((p) => p.packageType === "MONTHLY");
  const oneTimePackages = packages.filter((p) => p.packageType === "PAY_PER_TIN" || p.packageType === "ONE_TIME");

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl mb-2">Quản lý Gói dịch vụ</h1>
          <p className="text-gray-600 text-sm sm:text-base">Quản lý giá và gói dịch vụ cho nhà tuyển dụng</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center w-full sm:w-auto gap-2 bg-gradient-to-r from-red-600 to-pink-600 text-white px-5 py-2.5 rounded-lg hover:shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          Thêm gói mới
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-red-600" />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Monthly Packages */}
          <div>
            <h2 className="text-2xl bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent mb-6">
              GÓI THEO THÁNG (MONTHLY)
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {monthlyPackages.length === 0 ? (
                <div className="col-span-full text-center py-8 text-gray-500">
                  Chưa có gói theo tháng nào
                </div>
              ) : (
                monthlyPackages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className="bg-white rounded-2xl p-6 shadow-sm border-2 border-gray-200 transition-all hover:shadow-xl"
                  >
                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-semibold mb-3 text-gray-900">{pkg.name}</h3>
                      <div className="mb-2">
                        <span className="text-4xl font-bold text-gray-900">
                          {formatPrice(pkg.price)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">/ tháng</div>
                    </div>

                    <div className="space-y-4 mb-6">
                      <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="font-semibold text-gray-900">
                            {pkg.normalTinsLimit} tin thường/tháng
                          </div>
                          <div className="text-sm text-gray-600">
                            Tối đa {pkg.maxNormalTinsPerDay} tin/ngày
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="font-semibold text-gray-900">
                            {pkg.urgentTinsLimit} tin tuyển gấp
                          </div>
                          <div className="text-sm text-gray-600">Hiển thị ưu tiên</div>
                        </div>
                      </div>
                    </div>

                    {pkg.description && (
                      <div className="pt-4 border-t border-gray-200 mb-4">
                        <p className="text-sm text-gray-600">{pkg.description}</p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenModal(pkg)}
                        className="flex-1 flex items-center justify-center gap-2 p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <Edit className="w-4 h-4 text-gray-600" />
                        <span className="text-sm">Sửa</span>
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(pkg.id)}
                        className="flex-1 flex items-center justify-center gap-2 p-2 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                        <span className="text-sm text-red-600">Xóa</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* One-Time Packages */}
          <div>
            <h2 className="text-2xl bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-6">
              GÓI MUA LẺ (ONE-TIME)
            </h2>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px]">
                  <thead className="bg-gradient-to-r from-green-50 to-emerald-50 border-b-2 border-green-200">
                    <tr>
                      <th className="px-6 py-4 text-left font-semibold text-gray-900 whitespace-nowrap">Tên gói</th>
                      <th className="px-6 py-4 text-left font-semibold text-gray-900 whitespace-nowrap">Loại tin</th>
                      <th className="px-6 py-4 text-left font-semibold text-gray-900 whitespace-nowrap">Số lượng</th>
                      <th className="px-6 py-4 text-right font-semibold text-gray-900 whitespace-nowrap">Giá</th>
                      <th className="px-6 py-4 text-right font-semibold text-gray-900 whitespace-nowrap">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {oneTimePackages.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                          Chưa có gói mua lẻ nào
                        </td>
                      </tr>
                    ) : (
                      oneTimePackages.map((pkg) => (
                        <tr key={pkg.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-4 font-medium text-gray-900">{pkg.name}</td>
                          <td className="px-4 py-4">
                            <span className={`px-2 py-1 rounded-full text-[10px] md:text-xs font-medium ${
                              pkg.tinType === "URGENT"
                                ? "bg-orange-100 text-orange-700"
                                : "bg-blue-100 text-blue-700"
                            }`}>
                              {pkg.tinType === "URGENT" ? "Tin gấp" : "Tin thường"}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-gray-600">{pkg.tinQuantity} tin</td>
                          <td className="px-4 py-4 text-right font-semibold text-red-600 whitespace-nowrap">
                            {formatPrice(pkg.price)}
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleOpenModal(pkg)}
                                className="p-1.5 md:p-2 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
                              >
                                <Edit className="w-4 h-4 text-blue-600" />
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(pkg.id)}
                                className="p-1.5 md:p-2 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
                              >
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {editingPackage ? "Chỉnh sửa gói dịch vụ" : "Thêm gói dịch vụ mới"}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên gói <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="VD: Basic, Premium, Tin thường..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Loại gói <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.packageType}
                  onChange={(e) => setFormData({ ...formData, packageType: e.target.value as "MONTHLY" | "ONE_TIME" })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="MONTHLY">Theo tháng (Monthly)</option>
                  <option value="PAY_PER_TIN">Mua lẻ (One-time)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Giá (VNĐ) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value === '' ? '' : Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="VD: 2700000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                <textarea
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  rows={3}
                  placeholder="Mô tả gói dịch vụ..."
                />
              </div>

              {formData.packageType === "MONTHLY" ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Thời hạn (ngày)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.durationDays}
                      onChange={(e) => setFormData({ ...formData, durationDays: e.target.value === '' ? '' : Number(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số tin thường/tháng
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.normalTinsLimit}
                      onChange={(e) => setFormData({ ...formData, normalTinsLimit: e.target.value === '' ? '' : Number(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tin/ngày (max)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.maxNormalTinsPerDay}
                      onChange={(e) => setFormData({ ...formData, maxNormalTinsPerDay: e.target.value === '' ? '' : Number(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số tin gấp/tháng
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.urgentTinsLimit}
                      onChange={(e) => setFormData({ ...formData, urgentTinsLimit: e.target.value === '' ? '' : Number(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Loại tin</label>
                    <select
                      value={formData.tinType || "NORMAL"}
                      onChange={(e) => setFormData({ ...formData, tinType: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="NORMAL">Tin thường</option>
                      <option value="URGENT">Tin gấp</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng tin</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.tinQuantity}
                      onChange={(e) => setFormData({ ...formData, tinQuantity: e.target.value === '' ? '' : Number(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingPackage ? "Cập nhật" : "Tạo mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-center mb-2">Xác nhận xóa</h3>
            <p className="text-gray-500 text-center mb-6">
              Bạn có chắc chắn muốn xóa gói dịch vụ này không?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
