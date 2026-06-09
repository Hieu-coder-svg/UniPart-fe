import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { CheckCircle, XCircle, Loader2, ArrowRight } from "lucide-react";
import { purchaseService } from "../../services/purchaseService";

export default function PaymentSuccess() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const success = searchParams.get("success");
    const error = searchParams.get("error");
    const packageId = searchParams.get("packageId");
    const txnRef = searchParams.get("txnRef");

    const isSuccess = success === "true" && !error;

    useEffect(() => {
        // Refresh purchases data after payment
        if (isSuccess) {
            // Could trigger a refresh of purchase data here
        }
    }, [isSuccess]);

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 max-w-lg w-full text-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <CheckCircle className="w-12 h-12 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-3">Thanh toán thành công!</h1>
                    <p className="text-gray-600 mb-6">
                        Cảm ơn bạn đã mua gói dịch vụ. Gói của bạn đã được kích hoạt.
                    </p>
                    {txnRef && (
                        <div className="bg-gray-50 rounded-xl p-4 mb-6">
                            <div className="text-sm text-gray-500">Mã giao dịch</div>
                            <div className="font-mono font-semibold text-gray-900">{txnRef}</div>
                        </div>
                    )}
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => navigate("/employer/dashboard")}
                            className="w-full py-3 px-6 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
                        >
                            <span>Về Dashboard</span>
                            <ArrowRight className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => navigate("/employer/dashboard/buy-posts")}
                            className="w-full py-3 px-6 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all"
                        >
                            Tiếp tục mua gói khác
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 max-w-lg w-full text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-red-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <XCircle className="w-12 h-12 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-3">Thanh toán thất bại</h1>
                <p className="text-gray-600 mb-6">
                    {error === "invalid_signature"
                        ? "Xác thực thanh toán không hợp lệ. Vui lòng thử lại."
                        : "Đã xảy ra lỗi trong quá trình thanh toán. Vui lòng thử lại."}
                </p>
                {txnRef && (
                    <div className="bg-gray-50 rounded-xl p-4 mb-6">
                        <div className="text-sm text-gray-500">Mã giao dịch</div>
                        <div className="font-mono font-semibold text-gray-900">{txnRef}</div>
                    </div>
                )}
                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => navigate("/employer/dashboard/buy-posts")}
                        className="w-full py-3 px-6 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                        <span>Thử lại</span>
                        <ArrowRight className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => navigate("/employer/dashboard")}
                        className="w-full py-3 px-6 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all"
                    >
                        Về Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
}
