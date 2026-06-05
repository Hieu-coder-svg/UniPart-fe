import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";

interface AdBannerProps {
  position?: "top" | "middle" | "bottom";
}

export default function AdBanner({ position = "middle" }: AdBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  const ads = [
    {
      title: "Khóa học Excel miễn phí cho sinh viên",
      company: "Coursera",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=200&fit=crop",
      cta: "Đăng ký ngay ",
      color: "from-green-500 to-emerald-600",
      bgColor: "from-green-50 to-emerald-50",
    },
    {
      title: "Ưu đãi 50% thẻ Grab cho sinh viên",
      company: "Grab",
      image: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=400&h=200&fit=crop",
      cta: "Nhận ưu đãi",
      color: "from-emerald-500 to-green-600",
      bgColor: "from-emerald-50 to-green-50",
    },
    {
      title: "Laptop Dell giảm giá đến 30%",
      company: "Dell Vietnam",
      image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=200&fit=crop",
      cta: "Xem ngay",
      color: "from-blue-500 to-cyan-600",
      bgColor: "from-blue-50 to-cyan-50",
    },
    {
      title: "Gói data sinh viên giá ưu đãi",
      company: "Viettel",
      image: "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400&h=200&fit=crop",
      cta: "Đăng ký",
      color: "from-red-500 to-orange-600",
      bgColor: "from-red-50 to-orange-50",
    },
    {
      title: "Giảm 40% cho đơn đầu tiên trên Shopee",
      company: "Shopee",
      image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&h=200&fit=crop",
      cta: "Mua ngay",
      color: "from-orange-500 to-red-600",
      bgColor: "from-orange-50 to-red-50",
    },
  ];

  // Auto-play carousel
  useEffect(() => {
    if (!isAutoPlay) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ads.length);
    }, 4000); // Change every 4 seconds

    return () => clearInterval(interval);
  }, [isAutoPlay, ads.length]);

  const goToNext = () => {
    setIsAutoPlay(false);
    setCurrentIndex((prev) => (prev + 1) % ads.length);
  };

  const goToPrev = () => {
    setIsAutoPlay(false);
    setCurrentIndex((prev) => (prev - 1 + ads.length) % ads.length);
  };

  const goToSlide = (index: number) => {
    setIsAutoPlay(false);
    setCurrentIndex(index);
  };

  const currentAd = ads[currentIndex];
  
  // Larger size for top banner
  const isTopBanner = position === "top";

  return (
    <div className={`relative bg-gradient-to-r ${currentAd.bgColor} border border-gray-200 rounded-lg overflow-hidden shadow-sm transition-all duration-500 ${isTopBanner ? 'shadow-md' : ''}`}>
      <div className={`flex flex-col sm:flex-row items-center gap-4 relative ${isTopBanner ? 'p-6 sm:p-8' : 'p-4'}`}>
        {/* Previous Button */}
        <button
          onClick={goToPrev}
          className={`absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full shadow-md transition-all hover:scale-110 ${isTopBanner ? 'p-3' : 'p-2'}`}
          title="Banner trước"
        >
          <ChevronLeft className={`text-gray-700 ${isTopBanner ? 'w-6 h-6' : 'w-4 h-4'}`} />
        </button>

        {/* Ad Content */}
        <div className={`flex flex-col sm:flex-row items-center w-full ${isTopBanner ? 'gap-6 px-12' : 'gap-4 px-8'}`}>
          <div className="flex-shrink-0">
            <img
              src={currentAd.image}
              alt={currentAd.title}
              className={`object-cover rounded-lg shadow-sm ${isTopBanner ? 'w-full sm:w-56 h-32 sm:h-40' : 'w-full sm:w-32 h-20'}`}
            />
          </div>

          <div className="flex-1 text-center sm:text-left">
            <div className={`text-gray-500 mb-1 ${isTopBanner ? 'text-sm' : 'text-xs'}`}>Tài trợ • {currentAd.company}</div>
            <h4 className={`mb-1 ${isTopBanner ? 'text-2xl sm:text-3xl font-bold' : ''}`}>{currentAd.title}</h4>
            <p className={`text-gray-600 ${isTopBanner ? 'text-base sm:text-lg' : 'text-sm'}`}>Cơ hội đặc biệt dành cho sinh viên UniHire</p>
          </div>

          <div className="flex-shrink-0">
            <button className={`bg-gradient-to-r ${currentAd.color} text-white rounded-lg hover:shadow-lg transition-all hover:scale-105 ${isTopBanner ? 'px-8 py-3 text-lg font-semibold' : 'px-6 py-2'}`}>
              {currentAd.cta}
            </button>
          </div>
        </div>

        {/* Next Button */}
        <button
          onClick={goToNext}
          className={`absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full shadow-md transition-all hover:scale-110 ${isTopBanner ? 'p-3' : 'p-2'}`}
          title="Banner tiếp theo"
        >
          <ChevronRight className={`text-gray-700 ${isTopBanner ? 'w-6 h-6' : 'w-4 h-4'}`} />
        </button>
      </div>

      {/* Dots Indicator */}
      <div className={`flex justify-center gap-2 ${isTopBanner ? 'pb-4' : 'pb-3'}`}>
        {ads.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all ${
              index === currentIndex
                ? `${isTopBanner ? 'w-8 h-2.5' : 'w-6 h-2'} bg-blue-600 rounded-full`
                : `${isTopBanner ? 'w-2.5 h-2.5' : 'w-2 h-2'} bg-gray-300 rounded-full hover:bg-gray-400`
            }`}
            title={`Đi đến banner ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
