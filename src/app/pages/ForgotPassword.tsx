import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, ArrowLeft, KeyRound, MailCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "../contexts/AuthContext";

const forgotPasswordSchema = z.object({
  email: z.string().email("Email không hợp lệ").nonempty("Email không được để trống"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword() {
  const [, setLocation] = useLocation();
  const { forgotPassword, isLoading } = useAuth();
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      await forgotPassword({ email: data.email });
      setIsSuccess(true);
      toast.success("Đã gửi yêu cầu khôi phục mật khẩu. Vui lòng kiểm tra email.");
    } catch (error: any) {
      toast.error(error.message || "Gửi yêu cầu thất bại. Vui lòng kiểm tra lại email.");
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50 p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 p-8 text-center space-y-6">
          <div className="mx-auto w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
            <MailCheck className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Kiểm tra email của bạn</h1>
          <p className="text-muted-foreground text-sm">
            Chúng tôi đã gửi hướng dẫn khôi phục mật khẩu. Vui lòng kiểm tra hộp thư đến hoặc hộp thư rác (spam) của bạn.
          </p>
          <Button 
            onClick={() => setLocation("/login")} 
            className="w-full h-12 text-base rounded-xl mt-4"
          >
            Quay lại đăng nhập
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50 p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 p-8 space-y-6 relative">
        <button 
          onClick={() => setLocation("/login")}
          className="absolute top-6 left-6 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2 pt-4">
          <div className="mx-auto w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
            <KeyRound className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Quên mật khẩu?</h1>
          <p className="text-muted-foreground text-sm px-4">
            Đừng lo lắng! Nhập email của bạn và chúng tôi sẽ gửi hướng dẫn khôi phục mật khẩu.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email đã đăng ký</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              className={`h-12 bg-gray-50 border-gray-200 focus:bg-white transition-all ${
                errors.email ? "border-destructive focus-visible:ring-destructive" : ""
              }`}
              {...register("email")}
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full h-12 text-base rounded-xl bg-indigo-600 hover:bg-indigo-700" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Đang gửi yêu cầu...
              </>
            ) : (
              "Gửi yêu cầu khôi phục"
            )}
          </Button>
        </form>

        <div className="text-center pt-4 border-t border-gray-100">
          <p className="text-sm text-muted-foreground">
            Nhớ mật khẩu?{" "}
            <Link href="/login" className="text-indigo-600 hover:text-indigo-700 font-medium hover:underline">
              Đăng nhập ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
