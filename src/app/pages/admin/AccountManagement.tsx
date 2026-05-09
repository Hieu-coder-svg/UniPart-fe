import { Search, Filter, Ban, CheckCircle, UserPlus, X, Eye, EyeOff, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { userService } from "../../../services/userService";

interface Account {
  id: string;
  username: string;
  email: string;
  role: "admin" | "manager" | "employer" | "student";
  status: "active" | "banned";
  createdAt: string;
  lastLogin: string;
}

interface CreateAccountForm {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  roleName: string;
  fullName: string;
}

const defaultForm: CreateAccountForm = {
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
  roleName: "STUDENT",
  fullName: "",
};

export default function AccountManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [blockingId, setBlockingId] = useState<string | null>(null);

  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState<CreateAccountForm>(defaultForm);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState(false);

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const response = await userService.getAllUsers();
      if (response.result) {
        const mappedAccounts: Account[] = response.result.map((user: any) => ({
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.roleName?.toLowerCase() || "student",
          status: user.isBlocked ? "banned" : "active",
          createdAt: user.createdAt ? new Date(user.createdAt).toLocaleDateString("vi-VN") : "—",
          lastLogin: user.lastLogin
            ? new Date(user.lastLogin).toLocaleString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "Chưa đăng nhập",
        }));
        setAccounts(mappedAccounts);
      }
    } catch (error) {
      console.error("Failed to fetch accounts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBlock = async (account: Account) => {
    setBlockingId(account.id);
    try {
      if (account.status === "active") {
        await userService.blockUser(account.id);
        showToast(`Đã khóa tài khoản ${account.username}`, "success");
      } else {
        await userService.unblockUser(account.id);
        showToast(`Đã mở khóa tài khoản ${account.username}`, "success");
      }
      await fetchAccounts();
    } catch (err: any) {
      showToast(err.message || "Thao tác thất bại", "error");
    } finally {
      setBlockingId(null);
    }
  };

  const handleCreateAccount = async () => {
    setCreateError(null);

    // Validation
    if (!createForm.username || !createForm.email || !createForm.password || !createForm.fullName) {
      setCreateError("Vui lòng điền đầy đủ thông tin.");
      return;
    }
    if (createForm.password !== createForm.confirmPassword) {
      setCreateError("Mật khẩu xác nhận không khớp.");
      return;
    }
    if (createForm.password.length < 6) {
      setCreateError("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(createForm.email)) {
      setCreateError("Email không hợp lệ.");
      return;
    }

    setCreateLoading(true);
    try {
      await userService.createAccount({
        username: createForm.username,
        email: createForm.email,
        password: createForm.password,
        roleName: createForm.roleName,
        fullName: createForm.fullName,
      });
      setCreateSuccess(true);
      showToast("Tạo tài khoản thành công!", "success");
      setTimeout(() => {
        setShowCreateModal(false);
        setCreateSuccess(false);
        setCreateForm(defaultForm);
        fetchAccounts();
      }, 1500);
    } catch (err: any) {
      setCreateError(err.message || "Tạo tài khoản thất bại. Vui lòng thử lại.");
    } finally {
      setCreateLoading(false);
    }
  };

  const roleLabels: Record<string, string> = {
    admin: "Admin",
    manager: "Manager",
    employer: "Nhà tuyển dụng",
    student: "Sinh viên",
  };

  const roleColors: Record<string, string> = {
    admin: "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-sm border-0",
    manager: "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm border-0",
    employer: "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-sm border-0",
    student: "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-sm border-0",
  };

  const filteredAccounts = accounts
    .filter((a) =>
      (a.username || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.email || "").toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter((a) => filterRole === "all" || a.role === filterRole)
    .filter((a) => filterStatus === "all" || a.status === filterStatus);

  return (
    <div className="p-6 md:p-8 relative">

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl text-sm font-medium transition-all animate-fade-in ${
            toast.type === "success"
              ? "bg-green-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle className="w-5 h-5 shrink-0" />
          ) : (
            <X className="w-5 h-5 shrink-0" />
          )}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Quản lý Tài khoản</h1>
          <p className="text-gray-500">Quản lý tài khoản người dùng và phân quyền hệ thống</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm theo tên, email..."
              className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm min-w-[220px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            id="btn-create-account"
            onClick={() => {
              setShowCreateModal(true);
              setCreateForm(defaultForm);
              setCreateError(null);
              setCreateSuccess(false);
            }}
            className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-pink-600 text-white px-5 py-2.5 rounded-lg hover:shadow-lg hover:scale-105 transition-all text-sm font-medium"
          >
            <UserPlus className="w-4 h-4" />
            Tạo tài khoản mới
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Tổng tài khoản", value: accounts.length, color: "text-gray-700" },
          { label: "Đang hoạt động", value: accounts.filter(a => a.status === "active").length, color: "text-green-600" },
          { label: "Bị khóa", value: accounts.filter(a => a.status === "banned").length, color: "text-red-600" },
          { label: "Sinh viên", value: accounts.filter(a => a.role === "student").length, color: "text-purple-600" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 px-5 py-4 shadow-sm">
            <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-3">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors text-sm ${
            showFilters ? "bg-red-50 border-red-300 text-red-700" : "border-gray-300 hover:bg-gray-50"
          }`}
        >
          <Filter className="w-4 h-4" />
          Bộ lọc
        </button>

        {showFilters && (
          <>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
            >
              <option value="all">Tất cả vai trò</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="employer">Nhà tuyển dụng</option>
              <option value="student">Sinh viên</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Hoạt động</option>
              <option value="banned">Bị khóa</option>
            </select>

            {(filterRole !== "all" || filterStatus !== "all") && (
              <button
                onClick={() => { setFilterRole("all"); setFilterStatus("all"); }}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
              >
                Xóa bộ lọc
              </button>
            )}
          </>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tài khoản</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Vai trò</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Trạng thái</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Ngày tạo</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-16">
                    <div className="inline-block animate-spin w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full"></div>
                    <p className="mt-3 text-gray-500 text-sm">Đang tải dữ liệu...</p>
                  </td>
                </tr>
              ) : filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-16 text-gray-400 text-sm">
                    Không tìm thấy tài khoản nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredAccounts.map((account) => (
                  <tr key={account.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                          {(account.username || "U").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 text-sm">{account.username || "Không có tên"}</div>
                          <div className="text-xs text-gray-500">{account.email || "Không có email"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap tracking-wide ${roleColors[account.role] || "bg-gray-100 text-gray-600"}`}>
                        {roleLabels[account.role] || account.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                        account.status === "active"
                          ? "bg-green-50 text-green-700 border border-green-200"
                          : "bg-red-50 text-red-700 border border-red-200"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${account.status === "active" ? "bg-green-500" : "bg-red-500"}`} />
                        {account.status === "active" ? "Hoạt động" : "Bị khóa"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{account.createdAt}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {account.role !== "admin" && (
                          <button
                            id={`btn-block-${account.id}`}
                            onClick={() => handleToggleBlock(account)}
                            disabled={blockingId === account.id}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-60 ${
                              account.status === "active"
                                ? "bg-red-50 hover:bg-red-100 text-red-600 border border-red-200"
                                : "bg-green-50 hover:bg-green-100 text-green-600 border border-green-200"
                            }`}
                            title={account.status === "active" ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                          >
                            {blockingId === account.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : account.status === "active" ? (
                              <Ban className="w-3.5 h-3.5" />
                            ) : (
                              <CheckCircle className="w-3.5 h-3.5" />
                            )}
                            {account.status === "active" ? "Khóa" : "Mở khóa"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && filteredAccounts.length > 0 && (
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
            Hiển thị {filteredAccounts.length} / {accounts.length} tài khoản
          </div>
        )}
      </div>

      {/* Create Account Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => { setShowCreateModal(false); setCreateError(null); }}
          />
          {/* Modal */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-600 to-pink-600 px-6 py-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">Tạo tài khoản mới</h2>
                  <p className="text-red-100 text-xs mt-0.5">Điền thông tin để tạo tài khoản người dùng</p>
                </div>
                <button
                  onClick={() => { setShowCreateModal(false); setCreateError(null); }}
                  className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-4">
              {createSuccess && (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  Tạo tài khoản thành công!
                </div>
              )}

              {createError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  <X className="w-4 h-4 shrink-0" />
                  {createError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Tên đăng nhập *</label>
                  <input
                    type="text"
                    placeholder="username"
                    value={createForm.username}
                    onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Họ và tên *</label>
                  <input
                    type="text"
                    placeholder="Nguyễn Văn A"
                    value={createForm.fullName}
                    onChange={(e) => setCreateForm({ ...createForm, fullName: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Email *</label>
                <input
                  type="email"
                  placeholder="example@email.com"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Vai trò *</label>
                <select
                  value={createForm.roleName}
                  onChange={(e) => setCreateForm({ ...createForm, roleName: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="STUDENT">Sinh viên</option>
                  <option value="EMPLOYER">Nhà tuyển dụng</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Mật khẩu *</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Tối thiểu 6 ký tự"
                    value={createForm.password}
                    onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                    className="w-full px-3 py-2.5 pr-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Xác nhận mật khẩu *</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Nhập lại mật khẩu"
                    value={createForm.confirmPassword}
                    onChange={(e) => setCreateForm({ ...createForm, confirmPassword: e.target.value })}
                    className="w-full px-3 py-2.5 pr-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3 justify-end">
              <button
                onClick={() => { setShowCreateModal(false); setCreateError(null); }}
                className="px-5 py-2.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Hủy
              </button>
              <button
                id="btn-confirm-create"
                onClick={handleCreateAccount}
                disabled={createLoading || createSuccess}
                className="flex items-center gap-2 px-5 py-2.5 text-sm bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg hover:shadow-md transition-all font-medium disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {createLoading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Đang tạo...</>
                ) : (
                  <><UserPlus className="w-4 h-4" /> Tạo tài khoản</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.25s ease; }
      `}</style>
    </div>
  );
}