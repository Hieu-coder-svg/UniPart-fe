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
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
            <FolderOpen className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Quản lý Chuyên mục</h1>
            <p className="text-gray-500 mt-1 text-sm">Thêm, sửa, xóa và quản lý các danh mục bài viết trên diễn đàn</p>
          </div>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-800 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
        >
          <Plus className="w-5 h-5" />
          Thêm chuyên mục
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/40 border border-gray-100 overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative w-full sm:w-80 group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm chuyên mục hoặc mô tả..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
            />
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-sm font-semibold border border-blue-100">
            <Tag className="w-4 h-4" />
            Tổng cộng: {filteredCategories.length} chuyên mục
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider w-24">
                  <div className="flex items-center gap-1"><Hash className="w-3.5 h-3.5" /> ID</div>
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Chuyên mục</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  <div className="flex items-center gap-1"><AlignLeft className="w-3.5 h-3.5" /> Mô tả</div>
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center">
                    <Loader2 className="w-10 h-10 animate-spin mx-auto text-blue-600 mb-4" />
                    <p className="text-gray-500 font-medium text-sm">Đang đồng bộ dữ liệu chuyên mục...</p>
                  </td>
                </tr>
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                      <FolderOpen className="w-10 h-10 text-gray-300" />
                    </div>
                    <h3 className="text-gray-900 font-semibold mb-1">Không tìm thấy chuyên mục nào</h3>
                    <p className="text-gray-500 text-sm">Hãy thử tìm kiếm với từ khóa khác hoặc tạo mới chuyên mục.</p>
                  </td>
                </tr>
              ) : (
                paginatedCategories.map((category) => {
                  const config = getCategoryColorConfig(category.id);
                  return (
                    <tr key={category.id} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="px-6 py-5 text-sm font-bold text-gray-300 group-hover:text-blue-400 transition-colors">
                        #{category.id}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-sm border ${config.bg} ${config.text} ${config.border}`}>
                            {config.icon}
                          </div>
                          <span className={`font-bold px-4 py-1.5 rounded-full text-sm shadow-sm border ${config.bg} ${config.text} ${config.border}`}>
                            {category.categoryName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-sm text-gray-600 max-w-md line-clamp-2 leading-relaxed">
                          {category.description || <span className="text-gray-400 italic">Chưa cập nhật mô tả</span>}
                        </p>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenModal(category)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                            title="Chỉnh sửa"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(category.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                            title="Xóa"
                          >
                            <Trash2 className="w-4 h-4" />
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
          <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/30">
            <span className="text-sm text-gray-500 font-medium">
              Hiển thị <span className="text-gray-900">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="text-gray-900">{Math.min(currentPage * itemsPerPage, filteredCategories.length)}</span> trong số <span className="text-gray-900">{filteredCategories.length}</span> chuyên mục
            </span>
            
            {totalPages > 1 && (
              <div className="flex items-center gap-1.5 p-1 bg-white border border-gray-200 rounded-xl shadow-sm">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                <div className="flex items-center px-1">
                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const page = idx + 1;
                    const isActive = page === currentPage;
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`min-w-[32px] h-8 px-2 rounded-lg text-sm font-bold transition-all ${
                          isActive 
                            ? "bg-blue-600 text-white shadow-md shadow-blue-200" 
                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
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
