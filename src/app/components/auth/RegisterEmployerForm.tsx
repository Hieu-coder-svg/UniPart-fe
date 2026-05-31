import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import type { EmployerRegistrationRequest } from '../../../types/auth';

const employerRegisterSchema = z
  .object({
    username: z.string().nonempty('Tên đăng nhập không được bỏ trống').min(3, 'Tên đăng nhập phải có ít nhất 3 ký tự'),
    email: z.string().nonempty('Email không được bỏ trống').email('Email không hợp lệ'),
    password: z.string().nonempty('Mật khẩu không được bỏ trống').min(6, 'Mật khẩu phải có ít nhất 6 ký tự').refine(val => !val.includes(' '), 'Mật khẩu không được chứa khoảng trắng'),
    confirmPassword: z.string().nonempty('Xác nhận mật khẩu không được bỏ trống').min(6, 'Xác nhận mật khẩu phải có ít nhất 6 ký tự').refine(val => !val.includes(' '), 'Mật khẩu không được chứa khoảng trắng'),
    fullName: z.string().nonempty('Họ tên không được bỏ trống').min(3, 'Họ tên phải có ít nhất 3 ký tự'),
    companyName: z.string().nonempty('Tên công ty không được bỏ trống').min(2, 'Tên công ty phải có ít nhất 2 ký tự'),
    companyAddress: z.string().nonempty('Địa chỉ công ty không được bỏ trống').min(3, 'Địa chỉ công ty phải có ít nhất 3 ký tự'),
    dateOfBirth: z.string().optional(),
    phoneNumber: z.string().optional(),
    gender: z.string().optional(),
    description: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu không khớp',
    path: ['confirmPassword'],
  });

type RegisterEmployerFormData = z.infer<typeof employerRegisterSchema>;

interface RegisterEmployerFormProps {
  onSubmit: (data: EmployerRegistrationRequest) => Promise<void>;
  isLoading?: boolean;
}

export function RegisterEmployerForm({ onSubmit, isLoading = false }: RegisterEmployerFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterEmployerFormData>({
    resolver: zodResolver(employerRegisterSchema),
  });

  const handleFormSubmit = async (data: RegisterEmployerFormData) => {
    try {
      await onSubmit({
        ...data,
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Đăng ký thất bại';
      toast.error(errorMessage);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 w-full">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="username">Tên đăng nhập</Label>
          <Input id="username" type="text" placeholder="Username" {...register('username')} disabled={isLoading} />
          {errors.username && <p className="text-sm text-destructive">{errors.username.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="Email" {...register('email')} disabled={isLoading} />
          {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="fullName">Họ và tên</Label>
        <Input id="fullName" type="text" placeholder="Họ và tên" {...register('fullName')} disabled={isLoading} />
        {errors.fullName && <p className="text-sm text-destructive">{errors.fullName.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="companyName">Tên công ty</Label>
          <Input id="companyName" type="text" placeholder="Tên công ty" {...register('companyName')} disabled={isLoading} />
          {errors.companyName && <p className="text-sm text-destructive">{errors.companyName.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="companyAddress">Địa chỉ công ty</Label>
          <Input id="companyAddress" type="text" placeholder="Địa chỉ công ty" {...register('companyAddress')} disabled={isLoading} />
          {errors.companyAddress && <p className="text-sm text-destructive">{errors.companyAddress.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="dateOfBirth">Ngày sinh (tuỳ chọn)</Label>
          <Input id="dateOfBirth" type="date" {...register('dateOfBirth')} disabled={isLoading} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phoneNumber">Số điện thoại (tuỳ chọn)</Label>
          <Input id="phoneNumber" type="tel" placeholder="0123456789" {...register('phoneNumber')} disabled={isLoading} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="gender">Giới tính (tuỳ chọn)</Label>
          <select
            id="gender"
            {...register('gender')}
            disabled={isLoading}
            className="flex h-9 w-full min-w-0 rounded-md border border-input px-3 py-1 text-base bg-input-background transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
          >
            <option value="">Chọn giới tính</option>
            <option value="Male">Nam</option>
            <option value="Female">Nữ</option>
            <option value="Other">Khác</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Mô tả (tuỳ chọn)</Label>
          <Input id="description" type="text" placeholder="Mô tả công ty" {...register('description')} disabled={isLoading} />
        </div>
      </div>



      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="password">Mật khẩu</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              {...register('password')}
              disabled={isLoading}
              className={`pr-10 ${errors.password ? 'border-destructive' : ''}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              disabled={isLoading}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="••••••••"
              {...register('confirmPassword')}
              disabled={isLoading}
              className={`pr-10 ${errors.confirmPassword ? 'border-destructive' : ''}`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              disabled={isLoading}
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>}
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-semibold hover:shadow-2xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Đang xử lý...
          </div>
        ) : (
          'Đăng ký doanh nghiệp'
        )}
      </button>
    </form>
  );
}
