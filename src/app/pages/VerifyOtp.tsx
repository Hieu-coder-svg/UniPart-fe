import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Mail, ShieldCheck, CheckCircle } from "lucide-react";

import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { useAuth } from "../contexts/AuthContext";

const verifyOtpSchema = z.object({
  otp: z
    .string()
    .min(6, "OTP phải gồm 6 chữ số")
    .max(6, "OTP phải gồm 6 chữ số")
    .regex(/^\d+$/, "OTP chỉ bao gồm các chữ số"),
});

type VerifyOtpFormData = z.infer<typeof verifyOtpSchema>;

export default function VerifyOtp() {
  const navigate = useNavigate();
  const { verifyOtp, resetOtp } = useAuth();
  const [email, setEmail] = useState<string>("");
  const [isEditingEmail, setIsEditingEmail] = useState<boolean>(false);
  const [editEmailValue, setEditEmailValue] = useState<string>("");
  const [countdown, setCountdown] = useState<number>(0);
  const [isResending, setIsResending] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const OTP_COOLDOWN_KEY = "otp_cooldown_expiry";

  useEffect(() => {
    // Try to get email from localStorage or URL params
    const storedEmail = localStorage.getItem("registeredEmail");
    if (storedEmail) {
      setEmail(storedEmail);
      setEditEmailValue(storedEmail);
      // Nếu không phải email hợp lệ (không có @) thì mở chế độ chỉnh sửa
      if (!storedEmail.includes("@")) {
        setIsEditingEmail(true);
        setEditEmailValue("");
      }
    } else {
      toast.error("Không tìm thấy email cần xác thực. Vui lòng đăng ký lại.");
      navigate("/login");
    }
  }, [navigate]);

  // Restore countdown from localStorage on mount
  useEffect(() => {
    const expiry = localStorage.getItem(OTP_COOLDOWN_KEY);
    if (expiry) {
      const remainingTime = Math.ceil((parseInt(expiry, 10) - Date.now()) / 1000);
      if (remainingTime > 0) {
        setCountdown(remainingTime);
      } else {
        localStorage.removeItem(OTP_COOLDOWN_KEY);
      }
    }
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      localStorage.removeItem(OTP_COOLDOWN_KEY);
    }
  }, [countdown]);

  const {
    register,
    handleSubmit,
    setError: setFormError,
    formState: { errors, isSubmitting },
  } = useForm<VerifyOtpFormData>({
    resolver: zodResolver(verifyOtpSchema),
  });

  const onSubmit = async (data: VerifyOtpFormData) => {
    if (!email) return;

    try {
      await verifyOtp({ email, otp: data.otp });
      localStorage.removeItem("registeredEmail");
      setIsSuccess(true);
    } catch (error: any) {
      // Because we added an interceptor, error might be a standard Error object or an AxiosError
      const errorMessage = error.response?.data?.message || error.message || "Xác thực thất bại, vui lòng kiểm tra lại mã OTP";
      toast.error(errorMessage);
      setFormError("otp", { type: "server", message: errorMessage });
    }
  };

  const handleResendOtp = async () => {
    if (!email) return;
    
    setIsResending(true);
    try {
      await resetOtp({ email });
      toast.success("Đã gửi lại mã OTP. Vui lòng kiểm tra email của bạn.");
      
      // Set cooldown for 60 seconds and save to localStorage
      const cooldownSeconds = 60;
      const expiry = Date.now() + cooldownSeconds * 1000;
      localStorage.setItem(OTP_COOLDOWN_KEY, expiry.toString());
      setCountdown(cooldownSeconds);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Gửi lại OTP thất bại";
      toast.error(errorMessage);
    } finally {
      setIsResending(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50 p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 p-8 space-y-6 text-center animate-in fade-in zoom-in duration-500">
          <div className="mx-auto w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Xác thực thành công!</h1>
          <p className="text-muted-foreground text-base px-4">
            Tài khoản của bạn đã được xác thực. Bạn có thể đăng nhập để tiếp tục sử dụng hệ thống.
          </p>
          <div className="pt-6">
            <Button 
              className="w-full h-12 text-base rounded-xl bg-green-600 hover:bg-green-700 text-white transition-colors" 
              onClick={() => navigate("/login")}
            >
              Đi đến trang đăng nhập
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50 p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
            <ShieldCheck className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Xác thực tài khoản</h1>
          <p className="text-muted-foreground text-sm">
            Mã xác thực gồm 6 chữ số đã được gửi tới email <br />
          </p>
          {isEditingEmail ? (
            <div className="space-y-2">
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-700">
                ⚠️ Vui lòng nhập đúng địa chỉ email đã đăng ký
              </div>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={editEmailValue}
                  onChange={(e) => setEditEmailValue(e.target.value)}
                  placeholder="Nhập email của bạn..."
                  className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (editEmailValue.includes("@")) {
                      setEmail(editEmailValue);
                      localStorage.setItem("registeredEmail", editEmailValue);
                      setIsEditingEmail(false);
                    } else {
                      toast.error("Email không hợp lệ");
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Xác nhận
                </button>
              </div>
            </div>
          ) : (
            <span className="font-medium text-foreground">{email}</span>
          )}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="otp" className="text-center block">Nhập mã OTP</Label>
            <Input
              id="otp"
              type="text"
              inputMode="numeric"
              placeholder="••••••"
              maxLength={6}
              className={`text-center text-2xl tracking-widest py-6 bg-gray-50 border-gray-200 focus:bg-white transition-all ${
                errors.otp ? "border-destructive focus-visible:ring-destructive" : ""
              }`}
              {...register("otp")}
              disabled={isSubmitting || isResending}
            />
            {errors.otp && (
              <p className="text-sm text-destructive text-center mt-2">{errors.otp.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full h-12 text-base rounded-xl" disabled={isSubmitting || isResending}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Đang xác thực...
              </>
            ) : (
              "Xác thực"
            )}
          </Button>
        </form>

        <div className="text-center pt-4 border-t border-gray-100">
          <p className="text-sm text-muted-foreground mb-2">Chưa nhận được mã?</p>
          <Button
            type="button"
            variant="outline"
            className="w-full bg-white hover:bg-gray-50 text-blue-600 border-blue-100 hover:border-blue-200"
            onClick={handleResendOtp}
            disabled={countdown > 0 || isResending || isSubmitting}
          >
            {isResending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang gửi...
              </>
            ) : countdown > 0 ? (
              `Gửi lại sau ${countdown}s`
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Gửi lại mã OTP
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
