/**
 * Register Page
 * Trang đăng ký với lựa chọn loại tài khoản
 */

import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import type { StudentRegistrationRequest, EmployerRegistrationRequest } from '@/types/auth';
import { RegisterStudentForm } from '@/app/components/auth/RegisterStudentForm';
import { RegisterEmployerForm } from '@/app/components/auth/RegisterEmployerForm';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { toast } from 'sonner';

type RegisterType = 'student' | 'employer';

export default function Register() {
  const [, navigate] = useLocation();
  const { registerStudent, registerEmployer, isLoading, error, isAuthenticated, clearError } = useAuth();
  const [registerType, setRegisterType] = useState<RegisterType>('student');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Show error toast
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
      // Error is already handled in useAuth hook
    }
  };

  const handleEmployerRegister = async (data: EmployerRegistrationRequest) => {
    try {
      await registerEmployer(data);
      toast.success('Đăng ký doanh nghiệp thành công!');
      navigate('/verify-otp');
    } catch (error) {
      // Error is already handled in useAuth hook
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary p-4">
      <div className="w-full max-w-2xl">
        <Card className="p-8 shadow-lg">
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold tracking-tight">Đăng ký tài khoản</h1>
              <p className="text-muted-foreground mt-2">
                Chọn loại tài khoản để bắt đầu
              </p>
            </div>

            {/* Account Type Selection */}
            <div className="flex justify-center space-x-4">
              <Button
                variant={registerType === 'student' ? 'default' : 'outline'}
                onClick={() => setRegisterType('student')}
                className="flex-1"
              >
                Sinh viên
              </Button>
              <Button
                variant={registerType === 'employer' ? 'default' : 'outline'}
                onClick={() => setRegisterType('employer')}
                className="flex-1"
              >
                Doanh nghiệp
              </Button>
            </div>

            {/* Registration Form */}
            {registerType === 'student' ? (
              <RegisterStudentForm onSubmit={handleStudentRegister} isLoading={isLoading} />
            ) : (
              <RegisterEmployerForm onSubmit={handleEmployerRegister} isLoading={isLoading} />
            )}

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
