export interface Post {
  id: string;
  author: string;
  avatar: string;
  date: string;
  content: string;
  likes: number;
  comments: number;
  category: 'Kinh nghiệm' | 'Cảnh báo' | 'Mẹo' | 'Hỏi đáp';
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  distance: number;
  hourlyRate: number;
  shift: string;
  workingHours: string;
  hoursPerWeek: number;
  urgent: boolean;
  category: string;
  description: string;
  requirements: string[];
  rating: number;
  reviewCount: number;
  postedDate: string;
  salaryRange: string;
  featured: boolean;
  logo: string;
  image: string;
}

export interface Review {
  id: string;
  jobId: string;
  studentName: string;
  rating: number;
  date: string;
  comment: string;
  verified: boolean;
}

// Manager Dashboard Interfaces
export interface ServicePackage {
  id: string;
  name: string;
  price: number;
  duration: number; // days
  features: string[];
  jobPostLimit: number;
  highlightPosts: number;
  urgentTag: boolean;
  priority: 'basic' | 'standard' | 'premium';
  isActive: boolean;
  subscriberCount: number;
}

export interface UserReport {
  id: string;
  reporterName: string;
  reporterType: 'student' | 'employer';
  targetName: string;
  targetType: 'student' | 'employer' | 'job' | 'post';
  reason: string;
  description: string;
  status: 'pending' | 'reviewing' | 'resolved' | 'rejected';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  resolvedAt?: string;
  images?: string[];
}

export interface SystemStats {
  totalUsers: number;
  totalStudents: number;
  totalEmployers: number;
  totalJobs: number;
  activeJobs: number;
  totalRevenue: number;
  monthlyRevenue: number;
  totalReports: number;
  pendingReports: number;
  resolvedReports: number;
}

export interface UserManagement {
  id: string;
  name: string;
  email: string;
  type: 'student' | 'employer';
  status: 'active' | 'suspended' | 'banned';
  joinDate: string;
  lastActive: string;
  totalJobs?: number; // for students
  totalPosts?: number; // for employers
  rating?: number;
}

export interface JobApproval {
  id: string;
  title: string;
  company: string;
  employerName: string;
  category: string;
  hourlyRate: number;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewNote?: string;
}

export const mockJobs: Job[] = [
  {
    id: '1',
    title: 'Nhân viên pha chế',
    company: 'Highlands Coffee',
    location: 'Quận 1, TP.HCM',
    distance: 0.8,
    hourlyRate: 35000,
    shift: 'Tối',
    workingHours: '18:00 - 22:00',
    hoursPerWeek: 20,
    urgent: true,
    category: 'F&B',
    description: 'Cần nhân viên pha chế có kinh nghiệm, thái độ thân thiện và nhiệt tình. Làm việc trong môi trường năng động, đồng nghiệp trẻ trung.',
    requirements: ['Có kinh nghim pha chế', 'Giao tiếp tốt', 'Làm việc nhóm'],
    rating: 4.5,
    reviewCount: 23,
    postedDate: '2 giờ trước',
    salaryRange: '25.000đ - 35.000đ/giờ',
    featured: true,
    logo: '☕',
    image: 'https://images.unsplash.com/photo-1616547092703-79f311f472ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2ZmZWUlMjBzaG9wJTIwYmFyaXN0YXxlbnwxfHx8fDE3NzMzNjM3MjJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: '2',
    title: 'Gia sư Toán - Lý',
    company: 'Trung tâm Gia sư Vstar',
    location: 'Quận 3, TP.HCM',
    distance: 1.2,
    hourlyRate: 80000,
    shift: 'Chiều',
    workingHours: '14:00 - 17:00',
    hoursPerWeek: 10,
    urgent: false,
    category: 'Giáo dục',
    description: 'Tìm sinh viên xuất sắc dạy kèm Toán, Lý cho học sinh cấp 2, 3. Lịch linh hoạt, phù hợp với sinh viên.',
    requirements: ['Điểm số tốt', 'Kinh nghiệm dạy học', 'Kiên nhẫn'],
    rating: 4.8,
    reviewCount: 45,
    postedDate: '1 ngày trước',
    salaryRange: '70.000đ - 100.000đ/giờ',
    featured: true,
    logo: '📚',
    image: 'https://images.unsplash.com/photo-1630406144797-821be1f35d75?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0dXRvciUyMHRlYWNoaW5nJTIwc3R1ZGVudHxlbnwxfHx8fDE3NzM0NTk4NDd8MA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: '3',
    title: 'Nhân viên bán hàng',
    company: 'Cửa hàng thời trang H&M',
    location: 'Quận 10, TP.HCM',
    distance: 2.5,
    hourlyRate: 30000,
    shift: 'Cuối tuần',
    workingHours: '9:00 - 18:00',
    hoursPerWeek: 16,
    urgent: true,
    category: 'Bán lẻ',
    description: 'Tuyển nhân viên bán hàng part-time cuối tuần, chủ yếu làm thứ 7 - chủ nhật. Môi trường trẻ trung, năng động.',
    requirements: ['Ngoại hình khá', 'Nhiệt tình', 'Yêu thích thời trang'],
    rating: 4.2,
    reviewCount: 18,
    postedDate: '3 giờ trước',
    salaryRange: '25.000đ - 30.000đ/giờ',
    featured: false,
    logo: '👔',
    image: 'https://images.unsplash.com/photo-1562280963-8a5475740a10?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXRhaWwlMjBzdG9yZSUyMHNob3BwaW5nfGVufDF8fHx8MTc3MzM0NzMzMXww&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: '4',
    title: 'Phụ bếp',
    company: 'Nhà hàng Món Huế',
    location: 'Quận 5, TP.HCM',
    distance: 3.0,
    hourlyRate: 28000,
    shift: 'Sáng',
    workingHours: '6:00 - 11:00',
    hoursPerWeek: 15,
    urgent: false,
    category: 'F&B',
    description: 'Cần phụ bếp sáng giúp chuẩn bị nguyên liệu, rửa rau củ. Không cần kinh nghiệm, được training.',
    requirements: ['Chăm chỉ', 'Sức khỏe tốt', 'Có thể làm sớm'],
    rating: 4.0,
    reviewCount: 12,
    postedDate: '2 ngày trước',
    salaryRange: '25.000đ - 30.000đ/giờ',
    featured: false,
    logo: '🍜',
    image: 'https://images.unsplash.com/photo-1762329924239-e204f101fca4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXN0YXVyYW50JTIwa2l0Y2hlbiUyMGZvb2R8ZW58MXx8fHwxNzczMzc2MDYyfDA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: '5',
    title: 'Content Writer',
    company: 'Công ty TNHH Digital Marketing',
    location: 'Quận Bình Thạnh, TP.HCM',
    distance: 1.8,
    hourlyRate: 50000,
    shift: 'Chiều',
    workingHours: '13:00 - 17:00',
    hoursPerWeek: 12,
    urgent: false,
    category: 'Marketing',
    description: 'Tìm sinh viên viết content cho mng xã hội, blog. Làm việc linh hoạt, có thể online.',
    requirements: ['Viết tốt tiếng Việt', 'Am hiểu social media', 'Sáng tạo'],
    rating: 4.6,
    reviewCount: 31,
    postedDate: '5 ngày trước',
    salaryRange: '40.000đ - 60.000đ/giờ',
    featured: true,
    logo: '✍️',
    image: 'https://images.unsplash.com/photo-1769798643655-e0f10f62c3fd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYXJrZXRpbmclMjBldmVudCUyMHByb21vdGlvbnxlbnwxfHx8fDE3NzM0NTk4NDl8MA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: '6',
    title: 'Nhân viên kho',
    company: 'Kho Lazada',
    location: 'Quận 7, TP.HCM',
    distance: 4.2,
    hourlyRate: 32000,
    shift: 'Tối',
    workingHours: '18:00 - 22:00',
    hoursPerWeek: 20,
    urgent: true,
    category: 'Logistics',
    description: 'Cần nhiều nhân viên kho ca tối, làm việc từ 18h-22h. Công việc chính là sắp xếp hàng hóa.',
    requirements: ['Khỏe mạnh', 'Có thể mang vác', 'Cẩn thận'],
    rating: 3.8,
    reviewCount: 56,
    postedDate: '4 giờ trước',
    salaryRange: '30.000đ - 35.000đ/giờ',
    featured: false,
    logo: '📦',
    image: 'https://images.unsplash.com/photo-1768796373708-e1b62a0f2900?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3YXJlaG91c2UlMjBkZWxpdmVyeSUyMHdvcmtlcnxlbnwxfHx8fDE3NzM0NTk4NDl8MA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: '7',
    title: 'Lễ tân khách sạn',
    company: 'Khách sạn Liberty Central',
    location: 'Quận 1, TP.HCM',
    distance: 0.5,
    hourlyRate: 38000,
    shift: 'Sáng',
    workingHours: '6:00 - 14:00',
    hoursPerWeek: 24,
    urgent: false,
    category: 'Khách sạn',
    description: 'Tuyển nhân viên lễ tân ca sáng, làm việc tại khách sạn 4 sao. Cần giao tiếp tiếng Anh tốt, thân thiện, chuyên nghiệp.',
    requirements: ['Tiếng Anh giao tiếp', 'Ngoại hình khá', 'Kỹ năng giao tiếp tốt'],
    rating: 4.4,
    reviewCount: 28,
    postedDate: '6 giờ trước',
    salaryRange: '35.000đ - 40.000đ/giờ',
    featured: false,
    logo: '🏨',
    image: 'https://images.unsplash.com/photo-1565262353342-6e919eab5b58?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvZmZpY2UlMjByZWNlcHRpb25pc3QlMjBkZXNrfGVufDF8fHx8MTc3Mzc2MTYyOHww&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: '8',
    title: 'Thiết kế đồ họa',
    company: 'Studio Creative Design',
    location: 'Quận 3, TP.HCM',
    distance: 1.5,
    hourlyRate: 55000,
    shift: 'Chiều',
    workingHours: '13:00 - 18:00',
    hoursPerWeek: 15,
    urgent: true,
    category: 'Thiết kế',
    description: 'Cần designer làm part-time thiết kế poster, banner cho social media và in ấn. Sử dụng thành thạo Photoshop, Illustrator.',
    requirements: ['Biết Photoshop, AI', 'Sáng tạo', 'Portfolio mẫu'],
    rating: 4.7,
    reviewCount: 34,
    postedDate: '1 ngày trước',
    salaryRange: '50.000đ - 60.000đ/giờ',
    featured: true,
    logo: '🎨',
    image: 'https://images.unsplash.com/photo-1695891689981-0be360e84d3f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmFwaGljJTIwZGVzaWduZXIlMjB3b3Jrc3BhY2V8ZW58MXx8fHwxNzczNjcwNTQwfDA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: '9',
    title: 'Tư vấn khách hàng qua điện thoại',
    company: 'Trung tâm Chăm sóc Khách hàng Viettel',
    location: 'Quận 7, TP.HCM',
    distance: 3.8,
    hourlyRate: 33000,
    shift: 'Tối',
    workingHours: '17:00 - 21:00',
    hoursPerWeek: 16,
    urgent: false,
    category: 'Dịch vụ khách hàng',
    description: 'Tuyển nhân viên telesale/tư vấn khách hàng part-time ca tối. Công việc nhẹ nhàng, có training kỹ lưỡng.',
    requirements: ['Giọng nói rõ ràng', 'Kiên nhẫn', 'Giao tiếp tốt'],
    rating: 4.1,
    reviewCount: 47,
    postedDate: '3 ngày trước',
    salaryRange: '30.000đ - 35.000đ/giờ',
    featured: false,
    logo: '📞',
    image: 'https://images.unsplash.com/photo-1558731991-cb3430a08bb7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXN0b21lciUyMHNlcnZpY2UlMjBwaG9uZXxlbnwxfHx8fDE3NzM2NjM0NDd8MA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: '10',
    title: 'Nhân viên phục vụ nhà hàng',
    company: 'Pizza 4Ps',
    location: 'Quận 1, TP.HCM',
    distance: 1.1,
    hourlyRate: 36000,
    shift: 'Cuối tuần',
    workingHours: '10:00 - 22:00',
    hoursPerWeek: 20,
    urgent: true,
    category: 'F&B',
    description: 'Tuyển nhân viên phục vụ part-time cuối tuần tại nhà hàng Pizza 4Ps. Môi trường chuyên nghiệp, được tips từ khách.',
    requirements: ['Thân thiện', 'Nhanh nhẹn', 'Có thể làm ca dài'],
    rating: 4.6,
    reviewCount: 52,
    postedDate: '8 giờ trước',
    salaryRange: '32.000đ - 40.000đ/giờ',
    featured: true,
    logo: '🍕',
    image: 'https://images.unsplash.com/photo-1688487197602-9c40fa317e74?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXN0YXVyYW50JTIwc2VydmVyJTIwd2FpdGVyfGVufDF8fHx8MTc3Mzc2MTYyOXww&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: '11',
    title: 'Huấn luyện viên Gym',
    company: 'California Fitness & Yoga',
    location: 'Quận 3, TP.HCM',
    distance: 2.2,
    hourlyRate: 65000,
    shift: 'Chiều',
    workingHours: '16:00 - 20:00',
    hoursPerWeek: 12,
    urgent: false,
    category: 'Thể thao',
    description: 'Tìm PT part-time hướng dẫn tập gym cho hội viên. Ưu tiên sinh viên Thể dục thể thao hoặc có chứng chỉ PT.',
    requirements: ['Hiểu biết về gym', 'Nhiệt tình', 'Có chứng chỉ PT (ưu tiên)'],
    rating: 4.8,
    reviewCount: 19,
    postedDate: '2 ngày trước',
    salaryRange: '60.000đ - 70.000đ/giờ',
    featured: false,
    logo: '💪',
    image: 'https://images.unsplash.com/photo-1696563996353-214a3690bb11?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxneW0lMjBmaXRuZXNzJTIwdHJhaW5lcnxlbnwxfHx8fDE3NzM3NjE2Mjl8MA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    id: '12',
    title: 'Nhân viên sự kiện',
    company: 'Event Plus',
    location: 'Quận Bình Thạnh, TP.HCM',
    distance: 2.8,
    hourlyRate: 42000,
    shift: 'Cuối tuần',
    workingHours: 'Linh hoạt',
    hoursPerWeek: 16,
    urgent: true,
    category: 'Sự kiện',
    description: 'Tuyển nhân viên setup, trang trí và hỗ trợ tổ chức sự kiện cuối tuần. Lịch linh hoạt, công việc đa dạng và thú vị.',
    requirements: ['Năng động', 'Làm việc nhóm tốt', 'Thích công việc ngoài trời'],
    rating: 4.3,
    reviewCount: 41,
    postedDate: '5 giờ trước',
    salaryRange: '40.000đ - 45.000đ/giờ',
    featured: false,
    logo: '🎉',
    image: 'https://images.unsplash.com/photo-1758526348305-eb423c3bd362?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxldmVudCUyMHN0YWZmJTIwc2V0dXB8ZW58MXx8fHwxNzczNzYxNjMwfDA&ixlib=rb-4.1.0&q=80&w=1080',
  },
];

export const mockReviews: Review[] = [
  {
    id: '1',
    jobId: '1',
    studentName: 'Nguyễn Văn A',
    rating: 5,
    date: '2 tuần trước',
    comment: 'Môi trường làm việc tốt, quản lý thân thiện. Lương trả đúng hạn, có cơ hội học hỏi nhiều kỹ năng mới.',
    verified: true,
  },
  {
    id: '2',
    jobId: '1',
    studentName: 'Trần Thị B',
    rating: 4,
    date: '1 tháng trước',
    comment: 'Công việc phù hợp với sinh viên, giờ giấc linh hoạt. Tuy nhiên, giờ cao điểm hơi bận.',
    verified: true,
  },
  {
    id: '3',
    jobId: '2',
    studentName: 'Lê Minh C',
    rating: 5,
    date: '3 tuần trước',
    comment: 'Trung tâm uy tín, học trò ngoan, phụ huynh dễ thương. Lương cao, phù hợp với lịch học.',
    verified: true,
  },
];

export const mockPosts: Post[] = [
  {
    id: '1',
    author: 'Phạm Thu Hà',
    avatar: '👩‍🎓',
    date: '2 giờ trước',
    content: 'Mình vừa làm part-time tại quán cafe gần trường được 2 tháng. Chia sẻ một số kinh nghiệm: nên chọn chỗ gần trường để tiết kiệm thời gian di chuyển, làm việc nhóm thì nên chọn ca cố định để quen việc. Ai cần tư vấn thì inbox mình nhé!',
    likes: 24,
    comments: 8,
    category: 'Kinh nghiệm',
  },
  {
    id: '2',
    author: 'Hoàng Minh Tuấn',
    avatar: '👨‍💼',
    date: '5 giờ trước',
    content: '⚠️ CẢNH BÁO: Quán bún đậu trên đường ABC không trả lương đúng hạn, làm việc không có hợp đồng. Mọi người cẩn thận!',
    likes: 67,
    comments: 23,
    category: 'Cảnh báo',
  },
  {
    id: '3',
    author: 'Nguyễn Lan Anh',
    avatar: '👩‍💻',
    date: '1 ngày trước',
    content: 'Tip nhỏ cho các bạn đi xin việc: nên chuẩn bị CV ngắn gọn, mặc đồ gọn gàng, đến đúng giờ và thể hiện thái độ nhiệt tình. Mình đã pass 5/6 cuộc phỏng vấn với cách này!',
    likes: 89,
    comments: 15,
    category: 'Mẹo',
  },
  {
    id: '4',
    author: 'Trần Quốc Bảo',
    avatar: '🧑‍🎓',
    date: '3 giờ trước',
    content: 'Có ai làm việc part-time kiêm được học không? Mình thấy lịch học quá dày, không biết có nên nhận thêm việc không. Mọi người tư vấn giúp mình với!',
    likes: 12,
    comments: 31,
    category: 'Hỏi đáp',
  },
];

// Manager Dashboard Mock Data
export const mockServicePackages: ServicePackage[] = [
  {
    id: '1',
    name: 'Gói Cơ bản',
    price: 0,
    duration: 30,
    features: ['Đăng 3 tin tuyển dụng/tháng', 'Hiển thị trong 7 ngày', 'Hỗ trợ email'],
    jobPostLimit: 3,
    highlightPosts: 0,
    urgentTag: false,
    priority: 'basic',
    isActive: true,
    subscriberCount: 245,
  },
  {
    id: '2',
    name: 'Gói Tiêu chuẩn',
    price: 299000,
    duration: 30,
    features: [
      'Đăng 10 tin tuyển dụng/tháng',
      'Hiển thị trong 14 ngày',
      '3 tin nổi bật',
      'Hỗ trợ ưu tiên',
      'Thống kê ứng viên'
    ],
    jobPostLimit: 10,
    highlightPosts: 3,
    urgentTag: false,
    priority: 'standard',
    isActive: true,
    subscriberCount: 89,
  },
  {
    id: '3',
    name: 'Gói Premium',
    price: 599000,
    duration: 30,
    features: [
      'Đăng không giới hạn tin tuyển dụng',
      'Hiển thị trong 30 ngày',
      'Tin nổi bật không giới hạn',
      'Tag "TUYỂN GẤP"',
      'Hỗ trợ 24/7',
      'Thống kê chi tiết',
      'AI đề xuất ứng viên'
    ],
    jobPostLimit: -1, // unlimited
    highlightPosts: -1, // unlimited
    urgentTag: true,
    priority: 'premium',
    isActive: true,
    subscriberCount: 34,
  },
];

export const mockUserReports: UserReport[] = [
  {
    id: '1',
    reporterName: 'Nguyễn Văn A',
    reporterType: 'student',
    targetName: 'Quán Cafe ABC',
    targetType: 'employer',
    reason: 'Không trả lương đúng hạn',
    description: 'Tôi đã làm việc 2 tháng nhưng chủ quán không trả lương đúng thời gian đã thỏa thuận. Đã nhắc nhở nhiều lần nhưng vẫn bị lờ đi.',
    status: 'pending',
    priority: 'high',
    createdAt: '2024-03-10 14:30',
  },
  {
    id: '2',
    reporterName: 'Trần Thị B',
    reporterType: 'student',
    targetName: 'Lê Minh C',
    targetType: 'student',
    reason: 'Spam, quấy rối',
    description: 'Người này liên tục spam tin nhắn trong cộng đồng, quảng cáo dịch vụ không liên quan.',
    status: 'reviewing',
    priority: 'medium',
    createdAt: '2024-03-11 09:15',
  },
  {
    id: '3',
    reporterName: 'Công ty XYZ',
    reporterType: 'employer',
    targetName: 'Phạm Văn D',
    targetType: 'student',
    reason: 'Không đến làm không báo',
    description: 'Ứng viên đã nhận việc nhưng không đến làm vào ngày đầu tiên và không liên lạc được.',
    status: 'resolved',
    priority: 'low',
    createdAt: '2024-03-08 16:45',
    resolvedAt: '2024-03-09 10:20',
  },
  {
    id: '4',
    reporterName: 'Hoàng Thị E',
    reporterType: 'student',
    targetName: 'Tin tuyển Content Writer',
    targetType: 'job',
    reason: 'Thông tin sai lệch',
    description: 'Tin đăng ghi lương 50k/h nhưng thực tế chỉ trả 30k/h. Yêu cầu làm thêm nhiều việc ngoài mô tả.',
    status: 'pending',
    priority: 'high',
    createdAt: '2024-03-12 11:20',
  },
  {
    id: '5',
    reporterName: 'Nguyễn F',
    reporterType: 'employer',
    targetName: 'Bài viết cảnh báo quán ABC',
    targetType: 'post',
    reason: 'Nội dung sai sự thật',
    description: 'Bài viết đưa thông tin sai lệch về công ty chúng tôi, ảnh hưởng đến uy tín.',
    status: 'reviewing',
    priority: 'high',
    createdAt: '2024-03-13 08:00',
  },
];

export const mockSystemStats: SystemStats = {
  totalUsers: 12458,
  totalStudents: 10234,
  totalEmployers: 2224,
  totalJobs: 1847,
  activeJobs: 1253,
  totalRevenue: 145680000,
  monthlyRevenue: 28450000,
  totalReports: 156,
  pendingReports: 12,
  resolvedReports: 128,
};

export const mockUsers: UserManagement[] = [
  {
    id: '1',
    name: 'Nguyễn Văn An',
    email: 'nguyenvanan@email.com',
    type: 'student',
    status: 'active',
    joinDate: '2025-01-15',
    lastActive: '2 giờ trước',
    totalJobs: 8,
    rating: 4.7,
  },
  {
    id: '2',
    name: 'Highlands Coffee',
    email: 'highlands@company.com',
    type: 'employer',
    status: 'active',
    joinDate: '2024-11-20',
    lastActive: '1 ngày trước',
    totalPosts: 23,
    rating: 4.5,
  },
  {
    id: '3',
    name: 'Trần Thị Bình',
    email: 'tranbinh@email.com',
    type: 'student',
    status: 'suspended',
    joinDate: '2025-02-01',
    lastActive: '5 ngày trước',
    totalJobs: 2,
    rating: 3.2,
  },
  {
    id: '4',
    name: 'Quán Cafe ABC',
    email: 'cafeabc@email.com',
    type: 'employer',
    status: 'banned',
    joinDate: '2024-12-10',
    lastActive: '2 tuần trước',
    totalPosts: 15,
    rating: 2.8,
  },
];

export const mockJobApprovals: JobApproval[] = [
  {
    id: '1',
    title: 'Nhân viên phục vụ',
    company: 'Nhà hàng Sushi World',
    employerName: 'Nguyễn Quản Lý',
    category: 'F&B',
    hourlyRate: 35000,
    status: 'pending',
    submittedAt: '2024-03-14 10:30',
  },
  {
    id: '2',
    title: 'Gia sư Tiếng Anh',
    company: 'Trung tâm Anh ngữ ILA',
    employerName: 'Trần Giám Đốc',
    category: 'Giáo dục',
    hourlyRate: 120000,
    status: 'pending',
    submittedAt: '2024-03-14 09:15',
  },
  {
    id: '3',
    title: 'Nhân viên giao hàng',
    company: 'GrabFood',
    employerName: 'Lê Quản Lý',
    category: 'Logistics',
    hourlyRate: 40000,
    status: 'approved',
    submittedAt: '2024-03-13 14:20',
    reviewedAt: '2024-03-13 16:45',
    reviewNote: 'Thông tin đầy đủ, phù hợp',
  },
];