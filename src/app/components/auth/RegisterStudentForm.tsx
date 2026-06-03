import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import type { StudentRegistrationRequest } from '../../../types/auth';

const studentRegisterSchema = z
  .object({
    username: z.string()
      .nonempty('Tên đăng nhập không được bỏ trống')
      .min(3, 'Tên đăng nhập phải có ít nhất 3 ký tự')
      .regex(/^[a-z0-9]+$/, 'Tên đăng nhập chỉ được chứa chữ cái thường không dấu và số'),
    email: z.string().nonempty('Email không được bỏ trống').email('Email không hợp lệ'),
    password: z.string().nonempty('Mật khẩu là bắt buộc').min(6, 'Mật khẩu phải có ít nhất 6 ký tự').refine(val => !val.includes(' '), 'Mật khẩu không được chứa khoảng trắng'),
    confirmPassword: z.string().nonempty('Xác nhận mật khẩu là bắt buộc').min(6, 'Xác nhận mật khẩu phải có ít nhất 6 ký tự').refine(val => !val.includes(' '), 'Mật khẩu không được chứa khoảng trắng'),
    fullName: z.string().nonempty('Họ tên không được bỏ trống').min(3, 'Họ tên phải có ít nhất 3 ký tự'),
    dateOfBirth: z.string().nonempty('Ngày sinh là bắt buộc').refine((date) => {
      const birthDate = new Date(date);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age >= 16;
    }, { message: 'Bạn phải từ 16 tuổi trở lên để đăng ký' }),
    phoneNumber: z.string()
      .nonempty('Số điện thoại là bắt buộc')
      .regex(/^(0|\+84)(3|5|7|8|9)[0-9]{8}$/, 'Số điện thoại không hợp lệ (phải là số điện thoại Việt Nam hợp lệ)'),
    gender: z.string().nonempty('Giới tính là bắt buộc'),
    university: z.string().nonempty('Tên trường không được bỏ trống').min(2, 'Tên trường phải có ít nhất 2 ký tự'),
    major: z.string().nonempty('Ngành học không được bỏ trống').min(2, 'Ngành học phải có ít nhất 2 ký tự'),
    address: z.string().nonempty('Địa chỉ không được bỏ trống').min(3, 'Địa chỉ phải có ít nhất 3 ký tự'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu không khớp',
    path: ['confirmPassword'],
  });

type RegisterStudentFormData = z.infer<typeof studentRegisterSchema>;

interface RegisterStudentFormProps {
  onSubmit: (data: StudentRegistrationRequest) => Promise<void>;
  isLoading?: boolean;
}

export function RegisterStudentForm({ onSubmit, isLoading = false }: RegisterStudentFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterStudentFormData>({
    resolver: zodResolver(studentRegisterSchema),
  });

  const handleFormSubmit = async (data: RegisterStudentFormData) => {
    try {
      // Loại bỏ confirmPassword - backend không nhận field này
      const { confirmPassword: _, ...registrationData } = data;
      console.log('📤 [DEBUG] Payload gửi lên server:', JSON.stringify(registrationData, null, 2));
      await onSubmit(registrationData);
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
          <Input
            id="username"
            type="text"
            placeholder="Username"
            {...register('username')}
            disabled={isLoading}
            className="bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          />
          {errors.username && <p className="text-sm text-destructive">{errors.username.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Email"
            {...register('email')}
            disabled={isLoading}
            className="bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          />
          {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="fullName">Họ và tên</Label>
        <Input
          id="fullName"
          type="text"
          placeholder="Họ và tên"
          {...register('fullName')}
          disabled={isLoading}
          className="bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
        />
        {errors.fullName && <p className="text-sm text-destructive">{errors.fullName.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="dateOfBirth">Ngày sinh</Label>
          <Input
            id="dateOfBirth"
            type="date"
            {...register('dateOfBirth')}
            disabled={isLoading}
            className="bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          />
          {errors.dateOfBirth && <p className="text-sm text-destructive">{errors.dateOfBirth.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phoneNumber">Số điện thoại</Label>
          <Input
            id="phoneNumber"
            type="tel"
            placeholder="0123456789"
            {...register('phoneNumber')}
            disabled={isLoading}
            className="bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          />
          {errors.phoneNumber && <p className="text-sm text-destructive">{errors.phoneNumber.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="gender">Giới tính</Label>
          <select
            id="gender"
            {...register('gender')}
            disabled={isLoading}
            className="flex h-9 w-full min-w-0 px-3 py-1 text-base bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          >
            <option value="">Chọn giới tính</option>
            <option value="Male">Nam</option>
            <option value="Female">Nữ</option>
            <option value="Other">Khác</option>
          </select>
          {errors.gender && <p className="text-sm text-destructive">{errors.gender.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="university">Trường</Label>
          <Input
            id="university"
            type="text"
            placeholder="Tên trường"
            {...register('university')}
            disabled={isLoading}
            className="bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          />
          {errors.university && <p className="text-sm text-destructive">{errors.university.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="major">Ngành học</Label>
          <Input
            id="major"
            type="text"
            placeholder="Ngành học"
            {...register('major')}
            disabled={isLoading}
            className="bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          />
          {errors.major && <p className="text-sm text-destructive">{errors.major.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Địa chỉ</Label>
          <Input
            id="address"
            type="text"
            placeholder="Địa chỉ"
            {...register('address')}
            disabled={isLoading}
            className="bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          />
          {errors.address && <p className="text-sm text-destructive">{errors.address.message}</p>}
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
              className={`bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all pr-10 ${errors.password ? 'border-destructive' : ''}`}
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
              className={`bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all pr-10 ${errors.confirmPassword ? 'border-destructive' : ''}`}
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
          'Đăng ký sinh viên'
        )}
      </button>
    </form>
  );
}
