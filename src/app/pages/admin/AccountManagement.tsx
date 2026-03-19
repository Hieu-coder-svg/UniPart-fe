import { Search, Filter, Edit, Trash2, Shield, Ban, CheckCircle, X } from "lucide-react";
import { useState } from "react";

interface Account {
  id: string;
  username: string;
  email: string;
  role: "admin" | "manager" | "employer" | "student";
  status: "active" | "suspended" | "banned";
  createdAt: string;
  lastLogin: string;
  permissions: string[];
}

export default function AccountManagement() {
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  const accounts: Account[] = [
    {
      id: "1",
      username: "admin_master",
      email: "admin@unipart.com",
      role: "admin",
      status: "active",
      createdAt: "2024-01-15",
      lastLogin: "2 giờ trước",
      permissions: ["all"],
    },
    {
      id: "2",
      username: "manager_hcm",
      email: "manager.hcm@unipart.com",
      role: "manager",
      status: "active",
      createdAt: "2024-02-20",
      lastLogin: "1 ngày trước",
      permissions: ["manage_users", "manage_reports", "view_analytics"],
    },
    {
      id: "3",
      username: "manager_hn",
      email: "manager.hn@unipart.com",
      role: "manager",
      status: "active",
      createdAt: "2024-02-20",
      lastLogin: "3 giờ trước",
      permissions: ["manage_users", "manage_reports", "view_analytics"],
    },
    {
      id: "4",
      username: "support_01",
      email: "support01@unipart.com",
      role: "manager",
      status: "suspended",
      createdAt: "2024-03-10",
      lastLogin: "1 tuần trước",
      permissions: ["manage_reports", "view_analytics"],
    },
    {
      id: "5",
      username: "nguyenvana",
      email: "nguyenvana@student.hcmut.edu.vn",
      role: "student",
      status: "active",
      createdAt: "2024-03-01",
      lastLogin: "30 phút trước",
      permissions: ["view_jobs", "apply_jobs"],
    },
    {
      id: "6",
      username: "tranthib",
      email: "tranthib@student.hcmus.edu.vn",
      role: "student",
      status: "active",
      createdAt: "2024-03-05",
      lastLogin: "2 giờ trước",
      permissions: ["view_jobs", "apply_jobs"],
    },
    {
      id: "7",
      username: "lequangc",
      email: "lequangc@student.uel.edu.vn",
      role: "student",
      status: "active",
      createdAt: "2024-03-10",
      lastLogin: "5 giờ trước",
      permissions: ["view_jobs", "apply_jobs"],
    },
    {
      id: "8",
      username: "phamhoaid",
      email: "phamhoaid@student.huflit.edu.vn",
      role: "student",
      status: "suspended",
      createdAt: "2024-02-28",
      lastLogin: "3 ngày trước",
      permissions: ["view_jobs"],
    },
    {
      id: "9",
      username: "vothie",
      email: "vothie@student.tdtu.edu.vn",
      role: "student",
      status: "active",
      createdAt: "2024-03-12",
      lastLogin: "1 giờ trước",
      permissions: ["view_jobs", "apply_jobs"],
    },
    {
      id: "10",
      username: "dangminhf",
      email: "dangminhf@student.uit.edu.vn",
      role: "student",
      status: "active",
      createdAt: "2024-03-08",
      lastLogin: "4 giờ trước",
      permissions: ["view_jobs", "apply_jobs"],
    },
    {
      id: "11",
      username: "hoanglong",
      email: "hoanglong@student.hcmiu.edu.vn",
      role: "student",
      status: "active",
      createdAt: "2024-03-15",
      lastLogin: "15 phút trước",
      permissions: ["view_jobs", "apply_jobs"],
    },
    {
      id: "12",
      username: "ngomyhanh",
      email: "ngomyhanh@student.ntu.edu.vn",
      role: "student",
      status: "active",
      createdAt: "2024-03-11",
      lastLogin: "6 giờ trước",
      permissions: ["view_jobs", "apply_jobs"],
    },
    {
      id: "13",
      username: "techgroup_hr",
      email: "hr@techgroup.vn",
      role: "employer",
      status: "active",
      createdAt: "2024-02-15",
      lastLogin: "1 giờ trước",
      permissions: ["post_jobs", "view_applicants", "manage_posts"],
    },
    {
      id: "14",
      username: "coffeehouse_recruit",
      email: "recruit@thecoffeehouse.vn",
      role: "employer",
      status: "active",
      createdAt: "2024-02-20",
      lastLogin: "3 giờ trước",
      permissions: ["post_jobs", "view_applicants", "manage_posts"],
    },
    {
      id: "15",
      username: "shopeeVN",
      email: "careers@shopee.vn",
      role: "employer",
      status: "active",
      createdAt: "2024-01-28",
      lastLogin: "30 phút trước",
      permissions: ["post_jobs", "view_applicants", "manage_posts", "premium_features"],
    },
  ];

  const handleEdit = (account: Account) => {
    setEditingAccount(account);
    setShowEditModal(true);
  };

  const roleLabels = {
    admin: "Admin",
    manager: "Manager",
    employer: "Nhà tuyển dụng",
    student: "Sinh viên",
  };

  const roleColors = {
    admin: "bg-red-100 text-red-700 border-red-200",
    manager: "bg-blue-100 text-blue-700 border-blue-200",
    employer: "bg-purple-100 text-purple-700 border-purple-200",
    student: "bg-green-100 text-green-700 border-green-200",
  };

  return (
    <div className="p-6 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl mb-2">Quản lý Tài khoản</h1>
          <p className="text-gray-600">Quản lý tài khoản quản trị và phân quyền</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm tài khoản..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-pink-600 text-white px-5 py-2.5 rounded-lg hover:shadow-lg transition-all">
            <Shield className="w-4 h-4" />
            Tạo tài khoản mới
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-3">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Filter className="w-4 h-4" />
          Bộ lọc
        </button>

        {showFilters && (
          <>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
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
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Hoạt động</option>
              <option value="suspended">Tạm khóa</option>
              <option value="banned">Cấm</option>
            </select>

            {(filterRole !== "all" || filterStatus !== "all") && (
              <button
                onClick={() => {
                  setFilterRole("all");
                  setFilterStatus("all");
                }}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
              >
                Xóa bộ lọc
              </button>
            )}
          </>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Tài khoản
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Vai trò
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Trạng thái
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Đăng nhập gần nhất
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Quyền hạn
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {accounts
                .filter((account) =>
                  account.username.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .filter((account) => filterRole === "all" || account.role === filterRole)
                .filter((account) => filterStatus === "all" || account.status === filterStatus)
                .map((account) => (
                  <tr key={account.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{account.username}</div>
                        <div className="text-sm text-gray-500">{account.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${
                          roleColors[account.role]
                        }`}
                      >
                        {roleLabels[account.role]}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          account.status === "active"
                            ? "bg-green-100 text-green-700"
                            : account.status === "suspended"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {account.status === "active"
                          ? "Hoạt động"
                          : account.status === "suspended"
                          ? "Tạm khóa"
                          : "Cấm"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{account.lastLogin}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {account.permissions.slice(0, 2).map((perm, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
                          >
                            {perm === "all" ? "Toàn quyền" : perm.replace("_", " ")}
                          </span>
                        ))}
                        {account.permissions.length > 2 && (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                            +{account.permissions.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(account)}
                          className="p-2 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
                        >
                          <Edit className="w-4 h-4 text-blue-600" />
                        </button>
                        {account.status === "active" && account.role !== "admin" && (
                          <button className="p-2 bg-orange-100 rounded-lg hover:bg-orange-200 transition-colors">
                            <Ban className="w-4 h-4 text-orange-600" />
                          </button>
                        )}
                        {account.role !== "admin" && (
                          <button className="p-2 bg-red-100 rounded-lg hover:bg-red-200 transition-colors">
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && editingAccount && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl">Chỉnh sửa tài khoản</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên đăng nhập
                  </label>
                  <input
                    type="text"
                    defaultValue={editingAccount.username}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    defaultValue={editingAccount.email}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vai trò
                </label>
                <select
                  defaultValue={editingAccount.role}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="employer">Nhà tuyển dụng</option>
                  <option value="student">Sinh viên</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trạng thái
                </label>
                <select
                  defaultValue={editingAccount.status}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="active">Hoạt động</option>
                  <option value="suspended">Tạm khóa</option>
                  <option value="banned">Cấm</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Quyền hạn
                </label>
                <div className="space-y-2">
                  {[
                    { id: "all", label: "Toàn quyền (Admin)" },
                    { id: "manage_users", label: "Quản lý người dùng" },
                    { id: "manage_reports", label: "Quản lý báo cáo" },
                    { id: "manage_packages", label: "Quản lý gói dịch vụ" },
                    { id: "view_analytics", label: "Xem thống kê" },
                    { id: "system_backup", label: "Sao lưu hệ thống" },
                  ].map((perm) => (
                    <label key={perm.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked={editingAccount.permissions.includes(perm.id)}
                        className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                      />
                      <span className="text-sm text-gray-700">{perm.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-pink-600 text-white px-5 py-2.5 rounded-lg hover:shadow-lg transition-all">
                <CheckCircle className="w-4 h-4" />
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}