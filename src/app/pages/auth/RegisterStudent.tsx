import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import type { StudentRegistrationRequest } from '@/types/auth';
import { RegisterStudentForm } from '@/app/components/auth/RegisterStudentForm';
import { Card } from '@/app/components/ui/card';
import { toast } from 'sonner';

export default function RegisterStudent() {
  const [, navigate] = useLocation();
  const { registerStudent, isLoading, isAuthenticated, error, clearError } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const handleStudentRegister = async (data: StudentRegistrationRequest) => {
    try {
      await registerStudent(data);
      toast.success('Đăng ký sinh viên thành công!');
      navigate('/verify-otp');
    } catch (error) {
      // Error handled by auth hook and toast
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary p-4">
      <div className="w-full max-w-2xl">
        <Card className="p-8 shadow-lg">
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold tracking-tight">Đăng ký sinh viên</h1>
              <p className="text-muted-foreground mt-2">
                Tạo tài khoản sinh viên để bắt đầu tìm việc bán thời gian.
              </p>
            </div>

            <RegisterStudentForm onSubmit={handleStudentRegister} isLoading={isLoading} />

            <div className="text-center space-y-2">
              <p className="text-muted-foreground text-sm">
                Đã có tài khoản?{' '}
                <button
                  onClick={() => navigate('/login')}
                  className="text-primary hover:underline font-medium"
                >
                  Đăng nhập
                </button>
              </p>
              <p className="text-muted-foreground text-sm">
                Quên mật khẩu?{' '}
                <button
                  onClick={() => navigate('/forgot-password')}
                  className="text-primary hover:underline font-medium"
                >
                  Khôi phục
                </button>
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
