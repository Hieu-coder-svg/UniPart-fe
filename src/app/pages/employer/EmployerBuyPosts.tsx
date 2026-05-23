import { Check, Zap, Package, ShoppingCart, CreditCard, ArrowRight, Sparkles, TrendingUp, Loader2, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { purchaseService, PurchasePackageResponse } from "../../../services/purchaseService";
import { PackageResponse } from "../../../services/packageService";

export default function EmployerBuyPosts() {
  const [packages, setPackages] = useState<PackageResponse[]>([]);
  const [purchases, setPurchases] = useState<PurchasePackageResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Pagination & Filter for Purchase History
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [filterType, setFilterType] = useState<string>("ALL");

  const processedPurchases = useMemo(() => {
    let result = [...purchases];
    
    // Sort by newest first
    result.sort((a, b) => new Date(b.purchasedAt).getTime() - new Date(a.purchasedAt).getTime());
    
    // Filter
    if (filterStatus !== "ALL") {
      result = result.filter(p => p.paymentStatus === filterStatus);
    }
    if (filterType !== "ALL") {
      // Assuming PAY_PER_TIN covers ONE_TIME as well
      result = result.filter(p => p.packageType === filterType || (filterType === "PAY_PER_TIN" && p.packageType === "ONE_TIME"));
    }
    
    return result;
  }, [purchases, filterStatus, filterType]);

  const totalPages = Math.max(1, Math.ceil(processedPurchases.length / itemsPerPage));
  const paginatedPurchases = processedPurchases.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [showHistory, filterStatus, filterType]);

  useEffect(() => {
    fetchData();
    checkPaymentResult();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [packagesData, purchasesData] = await Promise.all([
        purchaseService.getAllPackages(),
        purchaseService.getMyPurchases()
      ]);
      setPackages(packagesData);
      setPurchases(purchasesData);
    } catch (err: any) {
      setError(err.message || "Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const checkPaymentResult = () => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "true") {
      setPaymentSuccess(true);
      fetchData();
      window.history.replaceState({}, "", window.location.pathname);
    } else if (params.get("error")) {
      setPaymentError("Thanh toán thất bại. Vui lòng thử lại.");
      window.history.replaceState({}, "", window.location.pathname);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const handleBuyPackage = async (packageId: number) => {
    try {
      setPurchasing(packageId);
      setError(null);
      const result = await purchaseService.createPaymentUrl(packageId);
      window.location.href = result.paymentUrl;
    } catch (err: any) {
      setError(err.message || "Không thể tạo thanh toán");
      setPurchasing(null);
    }
  };

  const monthlyPackages = packages.filter((p) => p.packageType === "MONTHLY");
  const oneTimePackages = packages.filter((p) => p.packageType === "PAY_PER_TIN" || p.packageType === "ONE_TIME");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Thành công</span>;
      case "PENDING":
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">Đang chờ</span>;
      case "FAILED":
        return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">Thất bại</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">{status}</span>;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Success/Error Messages */}
      {paymentSuccess && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 text-green-700">
          <Check className="w-5 h-5 flex-shrink-0" />
          <span>Thanh toán thành công! Cảm ơn bạn đã mua gói dịch vụ.</span>
        </div>
      )}
      {paymentError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{paymentError}</span>
        </div>
      )}

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-100 to-red-100 rounded-full mb-4">
          <Sparkles className="w-4 h-4 text-orange-600" />
          <span className="text-sm font-medium text-orange-700">Mua tin tuyển dụng</span>
        </div>
        <h1 className="text-4xl mb-4">Chọn gói phù hợp với bạn</h1>
        <p className="text-xl text-gray-600">
          Linh hoạt mua theo số lượng hoặc đăng ký gói tháng để tiết kiệm chi phí
        </p>
      </div>

      {/* Stats Banner */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-2xl">
        <div className="grid md:grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-4xl font-bold mb-2">{purchases.filter(p => p.paymentStatus === "SUCCESS").length || 0}</div>
            <div className="text-blue-100">Gói đã mua</div>
          </div>
          <div>
            <div className="text-4xl font-bold mb-2">{purchases.filter(p => p.paymentStatus === "SUCCESS" && p.packageType === "MONTHLY").length || 0}</div>
            <div className="text-blue-100">Gói tháng</div>
          </div>
          <div>
            <div className="text-4xl font-bold mb-2">{purchases.reduce((sum, p) => sum + (p.tinsPurchased || 0), 0)}</div>
            <div className="text-blue-100">Tin đã mua</div>
          </div>
        </div>
      </div>

      {/* Toggle View */}
      <div className="flex justify-center gap-4">
        <button
          onClick={() => setShowHistory(false)}
          className={`px-6 py-2 rounded-lg font-medium transition-all ${
            !showHistory
              ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Mua gói dịch vụ
        </button>
        <button
          onClick={() => setShowHistory(true)}
          className={`px-6 py-2 rounded-lg font-medium transition-all ${
            showHistory
              ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Lịch sử mua hàng
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
        </div>
      ) : showHistory ? (
        /* Purchase History */
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-xl font-semibold">Lịch sử mua hàng</h2>
            
            <div className="flex items-center gap-3">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm"
              >
                <option value="ALL">Tất cả gói</option>
                <option value="MONTHLY">Gói theo tháng</option>
                <option value="PAY_PER_TIN">Gói mua lẻ</option>
              </select>
              
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm"
              >
                <option value="ALL">Mọi trạng thái</option>
                <option value="SUCCESS">Thành công</option>
                <option value="PENDING">Đang chờ</option>
                <option value="FAILED">Thất bại</option>
              </select>
            </div>
          </div>
          {processedPurchases.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>Không tìm thấy giao dịch nào phù hợp</p>
            </div>
          ) : (
            <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Gói dịch vụ</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Loại</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Thanh toán</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Ngày mua</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedPurchases.map((purchase) => (
                    <tr key={purchase.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{purchase.packageName}</div>
                        {purchase.tinsPurchased && (
                          <div className="text-sm text-gray-500">{purchase.tinsPurchased} tin</div>
                        )}
                        {purchase.startDate && purchase.endDate && (
                          <div className="text-sm text-gray-500">
                            {new Date(purchase.startDate).toLocaleDateString("vi-VN")} - {new Date(purchase.endDate).toLocaleDateString("vi-VN")}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          purchase.packageType === "MONTHLY"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-blue-100 text-blue-700"
                        }`}>
                          {purchase.packageType === "MONTHLY" ? "Theo tháng" : "Mua lẻ"}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-900">
                        {formatCurrency(purchase.pricePaid)}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {new Date(purchase.purchasedAt).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(purchase.paymentStatus)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
                <span className="text-sm text-gray-500 font-medium">
                  Hiển thị {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, processedPurchases.length)} trong số {processedPurchases.length} giao dịch
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-lg border border-gray-300 text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div className="flex items-center px-4 font-medium text-sm text-gray-700">
                    Trang {currentPage} / {totalPages}
                  </div>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded-lg border border-gray-300 text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
            </>
          )}
        </div>
      ) : (
        <>
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Mua theo số lượng - Tin thường */}
          {oneTimePackages.filter(p => p.tinType === "NORMAL" || !p.tinType).length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">Tin tuyển dụng thường</h2>
                  <p className="text-gray-600">Hiển thị trong danh sách tìm kiếm tiêu chuẩn</p>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {oneTimePackages
                  .filter((p) => p.tinType === "NORMAL" || !p.tinType)
                  .map((pkg) => (
                    <div
                      key={pkg.id}
                      className="relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-gray-200 hover:border-blue-300"
                    >
                      <div className="text-center mb-6">
                        <div className="text-5xl font-bold text-gray-900 mb-2">{pkg.tinQuantity}</div>
                        <div className="text-gray-600">Tin tuyển dụng</div>
                      </div>
                      <div className="text-center mb-6">
                        <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1">
                          {formatCurrency(pkg.price)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatCurrency(pkg.price / (pkg.tinQuantity || 1))}/tin
                        </div>
                      </div>
                      <button
                        onClick={() => handleBuyPackage(pkg.id)}
                        disabled={purchasing === pkg.id}
                        className={`w-full py-3 rounded-xl font-medium transition-all duration-300 ${
                          purchasing === pkg.id
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl"
                        }`}
                      >
                        {purchasing === pkg.id ? (
                          <div className="flex items-center justify-center gap-2">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Đang xử lý...</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            <ShoppingCart className="w-5 h-5" />
                            <span>Mua ngay</span>
                          </div>
                        )}
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Mua theo số lượng - Tin gấp */}
          {oneTimePackages.filter(p => p.tinType === "URGENT").length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">Tin tuyển gấp</h2>
                  <p className="text-gray-600">Được đẩy lên top và hiển thị nổi bật với badge "Tuyển gấp"</p>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {oneTimePackages
                  .filter((p) => p.tinType === "URGENT")
                  .map((pkg) => (
                    <div
                      key={pkg.id}
                      className="relative bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-orange-200 hover:border-orange-400"
                    >
                      <div className="absolute -top-2 -right-2">
                        <span className="px-3 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-medium rounded-full shadow-lg flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          Gấp
                        </span>
                      </div>
                      <div className="text-center mb-6 pt-4">
                        <div className="text-5xl font-bold text-gray-900 mb-2">{pkg.tinQuantity}</div>
                        <div className="text-gray-700 font-medium">Tin tuyển gấp</div>
                      </div>
                      <div className="text-center mb-6">
                        <div className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent mb-1">
                          {formatCurrency(pkg.price)}
                        </div>
                        <div className="text-sm text-gray-600">
                          {formatCurrency(pkg.price / (pkg.tinQuantity || 1))}/tin
                        </div>
                      </div>
                      <button
                        onClick={() => handleBuyPackage(pkg.id)}
                        disabled={purchasing === pkg.id}
                        className={`w-full py-3 rounded-xl font-medium transition-all duration-300 ${
                          purchasing === pkg.id
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg hover:shadow-xl"
                        }`}
                      >
                        {purchasing === pkg.id ? (
                          <div className="flex items-center justify-center gap-2">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Đang xử lý...</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            <Zap className="w-5 h-5" />
                            <span>Mua ngay</span>
                          </div>
                        )}
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Gói theo tháng */}
          {monthlyPackages.length > 0 && (
            <div>
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full mb-4">
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-700">Tiết kiệm hơn với gói tháng</span>
                </div>
                <h2 className="text-3xl font-semibold text-gray-900 mb-2">Gói đăng ký theo tháng</h2>
                <p className="text-gray-600">Phù hợp cho doanh nghiệp có nhu cầu tuyển dụng thường xuyên</p>
              </div>
              <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {monthlyPackages.map((pkg, index) => (
                  <div
                    key={pkg.id}
                    className={`relative bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border-2 ${
                      index === 1
                        ? "border-orange-500 transform scale-105 md:scale-110"
                        : "border-gray-200 hover:border-orange-300"
                    }`}
                  >
                    {index === 1 && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <span className="px-6 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium rounded-full shadow-lg">
                          Được yêu thích nhất
                        </span>
                      </div>
                    )}
                    <div className="text-center mb-6">
                      <div className={`w-16 h-16 bg-gradient-to-br ${index === 0 ? "from-gray-500 to-gray-600" : index === 1 ? "from-orange-500 to-red-500" : "from-purple-500 to-pink-500"} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                        <Package className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{pkg.name}</h3>
                      <div className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
                        {formatCurrency(pkg.price)}
                      </div>
                      <div className="text-sm text-gray-500">/ tháng</div>
                    </div>
                    <div className="space-y-3 mb-8">
                      <div className="flex items-start gap-3">
                        <div className="w-5 h-5 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-gray-700">{pkg.normalTinsLimit} tin thường/tháng</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-5 h-5 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-gray-700">Tối đa {pkg.maxNormalTinsPerDay} tin/ngày</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-5 h-5 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-gray-700">{pkg.urgentTinsLimit} tin tuyển gấp</span>
                      </div>
                      {pkg.description && (
                        <div className="flex items-start gap-3">
                          <div className="w-5 h-5 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                          <span className="text-gray-700">{pkg.description}</span>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleBuyPackage(pkg.id)}
                      disabled={purchasing === pkg.id}
                      className={`w-full py-4 rounded-xl font-medium transition-all duration-300 ${
                        purchasing === pkg.id
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : index === 1
                          ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
                          : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                      }`}
                    >
                      {purchasing === pkg.id ? (
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Đang xử lý...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <span>Đăng ký ngay</span>
                          <ArrowRight className="w-5 h-5" />
                        </div>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {packages.length === 0 && (
            <div className="text-center py-20 text-gray-500">
              <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>Chưa có gói dịch vụ nào được cấu hình</p>
            </div>
          )}
        </>
      )}

      {/* FAQ or Support Section */}
      {!showHistory && packages.length > 0 && (
        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-8 border-2 border-orange-200">
          <div className="max-w-3xl mx-auto text-center">
            <CreditCard className="w-12 h-12 text-orange-600 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">Thanh toán an toàn & linh hoạt</h3>
            <p className="text-gray-700 mb-6">
              Chúng tôi chấp nhận thanh toán qua Ngân hàng, MoMo, ZaloPay, VNPay và thẻ quốc tế.
              Mọi giao dịch được bảo mật với công nghệ mã hóa SSL.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {["Visa", "Mastercard", "MoMo", "ZaloPay", "VNPay"].map((brand, idx) => (
                <div
                  key={idx}
                  className="px-6 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-700 font-medium shadow-sm"
                >
                  {brand}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
