import { Search, Filter, Eye, Shield, Ban } from "lucide-react";
import { mockUsers } from "../../data/mockData";

export default function AdminUsersManagement() {
  return (
    <div className="p-6 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl mb-2">Quản lý Người dùng</h1>
          <p className="text-gray-600">Quản lý tài khoản sinh viên và nhà tuyển dụng</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm người dùng..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <button className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
            <Filter className="w-4 h-4" />
            Lọc
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Người dùng
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Loại
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Trạng thái
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Hoạt động
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Đánh giá
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {mockUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        user.type === "student"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-purple-100 text-purple-700"
                      }`}
                    >
                      {user.type === "student" ? "Sinh viên" : "Nhà tuyển dụng"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        user.status === "active"
                          ? "bg-green-100 text-green-700"
                          : user.status === "suspended"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {user.status === "active"
                        ? "Hoạt động"
                        : user.status === "suspended"
                        ? "Tạm khóa"
                        : "Cấm"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{user.lastActive}</td>
                  <td className="px-6 py-4">
                    {user.rating && (
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-500">⭐</span>
                        <span className="text-sm font-medium">{user.rating}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors">
                        <Eye className="w-4 h-4 text-blue-600" />
                      </button>
                      {user.status === "active" && (
                        <button className="p-2 bg-orange-100 rounded-lg hover:bg-orange-200 transition-colors">
                          <Shield className="w-4 h-4 text-orange-600" />
                        </button>
                      )}
                      {user.status !== "banned" && (
                        <button className="p-2 bg-red-100 rounded-lg hover:bg-red-200 transition-colors">
                          <Ban className="w-4 h-4 text-red-600" />
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
    </div>
  );
}
