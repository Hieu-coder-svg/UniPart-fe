import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, ArrowLeft, KeyRound, MailCheck, ShieldCheck, CheckCircle } from "lucide-react";

import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { useAuth } from "../../contexts/AuthContext";

const emailSchema = z.object({
  email: z.string().email("Email không hợp lệ").nonempty("Email không được để trống"),
});

const resetPasswordSchema = z.object({
  otp: z
    .string()
    .min(6, "OTP phải gồm 6 chữ số")
    .max(6, "OTP phải gồm 6 chữ số")
    .regex(/^\d+$/, "OTP chỉ bao gồm các chữ số"),
  newPassword: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  confirmPassword: z.string().min(6, "Vui lòng xác nhận lại mật khẩu"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"],
});

type EmailFormData = z.infer<typeof emailSchema>;
type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

type Step = "REQUEST_OTP" | "RESET_PASSWORD" | "SUCCESS";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { forgotPassword, resetPassword, isLoading } = useAuth();
  
  const [step, setStep] = useState<Step>("REQUEST_OTP");
  const [email, setEmail] = useState<string>("");

  const emailForm = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
  });

  const resetForm = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onEmailSubmit = async (data: EmailFormData) => {
    try {
      await forgotPassword({ email: data.email });
      setEmail(data.email);
      setStep("RESET_PASSWORD");
      toast.success("Đã gửi mã OTP khôi phục mật khẩu. Vui lòng kiểm tra email.");
    } catch (error: any) {
      console.error("[ForgotPassword] Error:", error);
      const backendMsg: string = error?.backendMessage || error?.response?.data?.message || "";
      const backendCode: number = error?.backendCode || error?.response?.data?.code || 0;

      if (backendCode === 1003 || backendMsg.includes("Email không hợp lệ") || backendMsg.includes("not found")) {
        toast.error("Email này chưa được đăng ký trong hệ thống. Vui lòng kiểm tra lại.");
      } else if (
        backendMsg.toLowerCase().includes("mail") ||
        backendMsg.toLowerCase().includes("smtp") ||
        backendMsg.toLowerCase().includes("messaging") ||
        error?.message?.toLowerCase().includes("mail")
      ) {
        toast.error("Không thể gửi email. Có thể hệ thống email đang gặp sự cố, vui lòng thử lại sau.");
      } else {
        toast.error(error?.message || "Gửi yêu cầu thất bại. Vui lòng thử lại sau.");
      }
    }
  };

  const onResetSubmit = async (data: ResetPasswordFormData) => {
    try {
      await resetPassword({
        email,
        otp: data.otp,
        newPassword: data.newPassword,
      });
      setStep("SUCCESS");
      toast.success("Mật khẩu của bạn đã được thay đổi thành công.");
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error.message || "Đổi mật khẩu thất bại, vui lòng kiểm tra lại mã OTP.";
      toast.error(errorMessage);
    }
  };

  if (step === "SUCCESS") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50 p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 p-8 text-center space-y-6 animate-in fade-in zoom-in duration-500">
          <div className="mx-auto w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Thành công!</h1>
          <p className="text-muted-foreground text-base px-4">
            Mật khẩu của bạn đã được thay đổi. Bạn có thể đăng nhập bằng mật khẩu mới.
          </p>
          <div className="pt-6">
            <Button 
              onClick={() => navigate("/login")} 
              className="w-full h-12 text-base rounded-xl bg-green-600 hover:bg-green-700 text-white transition-colors"
            >
              Quay lại đăng nhập
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50 p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 p-8 space-y-6 relative">
        <button 
          onClick={() => {
            if (step === "RESET_PASSWORD") setStep("REQUEST_OTP");
            else navigate("/login");
          }}
          className="absolute top-6 left-6 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {step === "REQUEST_OTP" && (
          <>
            <div className="text-center space-y-2 pt-4">
              <div className="mx-auto w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                <KeyRound className="w-8 h-8 text-indigo-600" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">Quên mật khẩu?</h1>
              <p className="text-muted-foreground text-sm px-4">
                Đừng lo lắng! Nhập email của bạn và chúng tôi sẽ gửi mã OTP để khôi phục mật khẩu.
              </p>
            </div>

            <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email đã đăng ký</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className={`h-12 bg-gray-50 border-gray-200 focus:bg-white transition-all ${
                    emailForm.formState.errors.email ? "border-destructive focus-visible:ring-destructive" : ""
                  }`}
                  {...emailForm.register("email")}
                  disabled={isLoading}
                />
                {emailForm.formState.errors.email && (
                  <p className="text-sm text-destructive">{emailForm.formState.errors.email.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full h-12 text-base rounded-xl bg-indigo-600 hover:bg-indigo-700" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Đang gửi yêu cầu...
                  </>
                ) : (
                  "Nhận mã OTP"
                )}
              </Button>
            </form>
          </>
        )}

        {step === "RESET_PASSWORD" && (
          <>
            <div className="text-center space-y-2 pt-4">
              <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                <ShieldCheck className="w-8 h-8 text-blue-600" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">Tạo mật khẩu mới</h1>
              <p className="text-muted-foreground text-sm px-4">
                Nhập mã OTP đã được gửi tới <strong>{email}</strong> và thiết lập mật khẩu mới.
              </p>
            </div>

            <form onSubmit={resetForm.handleSubmit(onResetSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">Mã OTP</Label>
                <Input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  placeholder="••••••"
                  maxLength={6}
                  className={`h-12 text-center tracking-widest bg-gray-50 border-gray-200 focus:bg-white transition-all ${
                    resetForm.formState.errors.otp ? "border-destructive focus-visible:ring-destructive" : ""
                  }`}
                  {...resetForm.register("otp")}
                  disabled={isLoading}
                />
                {resetForm.formState.errors.otp && (
                  <p className="text-sm text-destructive">{resetForm.formState.errors.otp.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">Mật khẩu mới</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="••••••••"
                  className={`h-12 bg-gray-50 border-gray-200 focus:bg-white transition-all ${
                    resetForm.formState.errors.newPassword ? "border-destructive focus-visible:ring-destructive" : ""
                  }`}
                  {...resetForm.register("newPassword")}
                  disabled={isLoading}
                />
                {resetForm.formState.errors.newPassword && (
                  <p className="text-sm text-destructive">{resetForm.formState.errors.newPassword.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  className={`h-12 bg-gray-50 border-gray-200 focus:bg-white transition-all ${
                    resetForm.formState.errors.confirmPassword ? "border-destructive focus-visible:ring-destructive" : ""
                  }`}
                  {...resetForm.register("confirmPassword")}
                  disabled={isLoading}
                />
                {resetForm.formState.errors.confirmPassword && (
                  <p className="text-sm text-destructive">{resetForm.formState.errors.confirmPassword.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full h-12 text-base rounded-xl mt-4 bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  "Đổi mật khẩu"
                )}
              </Button>
            </form>
          </>
        )}

        <div className="text-center pt-4 border-t border-gray-100 mt-6">
          <p className="text-sm text-muted-foreground">
            Nhớ mật khẩu?{" "}
            <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-medium hover:underline">
              Đăng nhập ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
