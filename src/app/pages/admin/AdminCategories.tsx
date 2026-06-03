import { useState, useEffect, useMemo } from "react";
import { Plus, Edit2, Trash2, Search, Loader2, ChevronLeft, ChevronRight, Hash, AlignLeft, FolderOpen, Tag } from "lucide-react";
import { toast } from "sonner";
import { categoryService } from "../../../services/categoryService";
import { Category } from "../../../types/post";
import { getCategoryColorConfig } from "../student/Community";

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const res = await categoryService.getAllCategories();
      if (res.result) {
        setCategories(res.result);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to load categories");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setCategoryName(category.categoryName);
      setDescription(category.description || "");
    } else {
      setEditingCategory(null);
      setCategoryName("");
      setDescription("");
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!categoryName.trim()) {
      toast.error("Vui lòng nhập tên danh mục");
      return;
    }
    
    setIsSubmitting(true);
    try {
      if (editingCategory) {
        await categoryService.updateCategory(editingCategory.id, categoryName.trim(), description.trim());
        toast.success("Cập nhật danh mục thành công");
      } else {
        await categoryService.createCategory(categoryName.trim(), description.trim());
        toast.success("Tạo danh mục thành công");
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa danh mục này? Các bài viết thuộc danh mục này có thể bị ảnh hưởng.")) return;
    
    try {
      await categoryService.deleteCategory(id);
      toast.success("Đã xóa danh mục");
      fetchCategories();
    } catch (error: any) {
      toast.error(error.message || "Xóa thất bại");
    }
  };

  // Filter & Pagination Logic
  const filteredCategories = useMemo(() => {
    return categories.filter(c => 
      c.categoryName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [categories, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredCategories.length / itemsPerPage));
  const paginatedCategories = filteredCategories.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Reset to page 1 if search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <div className="p-6 md:p-8 relative">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Quản lý Chuyên mục</h1>
          <p className="text-gray-500">Thêm, sửa, xóa và quản lý các danh mục bài viết trên diễn đàn</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-auto">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm chuyên mục..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm sm:min-w-[220px]"
            />
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-pink-600 text-white px-5 py-2.5 rounded-lg hover:shadow-lg hover:scale-105 transition-all text-sm font-medium w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            Thêm chuyên mục
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 px-5 py-4 shadow-sm">
          <p className="text-xs text-gray-500 mb-1">Tổng chuyên mục</p>
          <p className="text-2xl font-bold text-red-600">{categories.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 px-5 py-4 shadow-sm">
          <p className="text-xs text-gray-500 mb-1">Kết quả tìm kiếm</p>
          <p className="text-2xl font-bold text-gray-900">{filteredCategories.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Table */}
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-24">ID</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Chuyên mục</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Mô tả</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="text-center py-16">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-red-600 mb-4" />
                    <p className="text-gray-500 text-sm">Đang đồng bộ dữ liệu chuyên mục...</p>
                  </td>
                </tr>
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-16 text-gray-500 text-sm">
                    Không tìm thấy chuyên mục nào phù hợp.
                  </td>
                </tr>
              ) : (
                paginatedCategories.map((category) => {
                  const config = getCategoryColorConfig(category.id);
                  return (
                    <tr key={category.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-500">
                        #{category.id}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-sm border ${config.bg} ${config.text} ${config.border}`}>
                            {config.icon}
                          </div>
                          <span className="font-medium text-gray-900 text-sm">
                            {category.categoryName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-500 max-w-md line-clamp-2">
                          {category.description || <span className="italic">Chưa cập nhật mô tả</span>}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenModal(category)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200"
                            title="Chỉnh sửa"
                          >
                            <Edit2 className="w-3.5 h-3.5" /> Sửa
                          </button>
                          <button
                            onClick={() => handleDelete(category.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all bg-red-50 hover:bg-red-100 text-red-600 border border-red-200"
                            title="Xóa"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!isLoading && filteredCategories.length > 0 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-500">
              Hiển thị <span className="font-semibold text-gray-900">{(currentPage - 1) * itemsPerPage + 1}</span> đến <span className="font-semibold text-gray-900">{Math.min(currentPage * itemsPerPage, filteredCategories.length)}</span> trong tổng số <span className="font-semibold text-gray-900">{filteredCategories.length}</span> chuyên mục
            </div>
            
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                  Trước
                </button>
                
                <span className="text-sm text-gray-600 px-2 font-medium">
                  Trang <span className="text-gray-900">{currentPage}</span> / {totalPages}
                </span>

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                  Sau
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity duration-300" 
            onClick={() => !isSubmitting && setIsModalOpen(false)} 
          />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-white/20">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3 bg-gradient-to-r from-gray-50 to-white">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                {editingCategory ? <Edit2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              </div>
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                {editingCategory ? "Cập nhật chuyên mục" : "Thêm chuyên mục mới"}
              </h2>
            </div>
            
            <div className="p-6 space-y-5 bg-white">
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-gray-700">
                  Tên chuyên mục <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="VD: Kinh nghiệm, Tìm trọ, Sự kiện..."
                  className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all outline-none"
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-gray-700">Mô tả chi tiết</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Viết một vài dòng mô tả về mục đích của chuyên mục này..."
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all outline-none resize-none leading-relaxed"
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50/80 border-t border-gray-100 flex items-center justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                disabled={isSubmitting}
                className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-200 hover:text-gray-900 rounded-xl transition-colors disabled:opacity-50"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-800 hover:shadow-lg transition-all disabled:opacity-70"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingCategory ? "Lưu thay đổi" : "Hoàn tất tạo"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
