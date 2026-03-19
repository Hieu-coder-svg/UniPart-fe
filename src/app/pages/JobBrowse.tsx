import { useState } from "react";
import { Link } from "react-router";
import { mockJobs, type Job } from "../data/mockData";
import {
  Search,
  MapPin,
  DollarSign,
  Clock,
  Building2,
  Bookmark,
  TrendingUp,
  Star,
  Zap,
} from "lucide-react";
import AdBanner from "../components/AdBanner";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

export default function JobBrowse() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedShift, setSelectedShift] = useState<string>("all");
  const [selectedSalary, setSelectedSalary] = useState<string>("all");

  const filteredJobs = mockJobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation =
      selectedLocation === "all" || job.location.includes(selectedLocation);
    const matchesCategory =
      selectedCategory === "all" || job.category === selectedCategory;
    const matchesShift = selectedShift === "all" || job.shift === selectedShift;
    const matchesSalary =
      selectedSalary === "all" ||
      (selectedSalary === "high" && job.hourlyRate >= 50000) ||
      (selectedSalary === "medium" &&
        job.hourlyRate >= 30000 &&
        job.hourlyRate < 50000) ||
      (selectedSalary === "low" && job.hourlyRate < 30000);

    return (
      matchesSearch &&
      matchesLocation &&
      matchesCategory &&
      matchesShift &&
      matchesSalary
    );
  });

  // Việc làm nổi bật: Tất cả jobs có urgent = true
  const featuredJobs = filteredJobs.filter((job) => job.urgent);
  const normalJobs = filteredJobs.filter((job) => !job.urgent);

  const categories = Array.from(new Set(mockJobs.map((job) => job.category)));
  const locations = [
    "Quận 1",
    "Quận 3",
    "Quận 5",
    "Quận 7",
    "Quận 10",
    "Quận Bình Thạnh",
  ];
  const shifts = ["Sáng", "Chiều", "Tối", "Cuối tuần"];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Large Ad Banner at Top */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <AdBanner position="top" />
        </div>
      </div>

      {/* Advanced Search Bar */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Keyword Search */}
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Vị trí ứng tuyển, công ty..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Location */}
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
              >
                <option value="all">Tất cả địa điểm</option>
                {locations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Button */}
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-semibold">
              <Search className="w-5 h-5" />
              Tìm kiếm
            </button>
          </div>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3 overflow-x-auto pb-2">
            <span className="text-sm text-gray-600 whitespace-nowrap">
              Lọc nhanh:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() =>
                  setSelectedCategory(selectedCategory === cat ? "all" : cat)
                }
                className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 md:pb-8">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar Filters */}
          <aside className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-lg shadow-sm p-5 sticky top-40">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Bộ lọc tìm kiếm
              </h3>

              {/* Shift Filter */}
              <div className="mb-5">
                <label className="block text-sm font-medium mb-3">
                  Ca làm việc
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="shift"
                      checked={selectedShift === "all"}
                      onChange={() => setSelectedShift("all")}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm">Tất cả</span>
                  </label>
                  {shifts.map((shift) => (
                    <label
                      key={shift}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="shift"
                        checked={selectedShift === shift}
                        onChange={() => setSelectedShift(shift)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm">{shift}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Salary Filter */}
              <div>
                <label className="block text-sm font-medium mb-3">
                  Mức lương/giờ
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="salary"
                      checked={selectedSalary === "all"}
                      onChange={() => setSelectedSalary("all")}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm">Tất cả</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="salary"
                      checked={selectedSalary === "high"}
                      onChange={() => setSelectedSalary("high")}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm">Trên 50.000đ</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="salary"
                      checked={selectedSalary === "medium"}
                      onChange={() => setSelectedSalary("medium")}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm">30.000đ - 50.000đ</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="salary"
                      checked={selectedSalary === "low"}
                      onChange={() => setSelectedSalary("low")}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm">Dưới 30.000đ</span>
                  </label>
                </div>
              </div>

              {/* Reset Filters */}
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedLocation("all");
                  setSelectedCategory("all");
                  setSelectedShift("all");
                  setSelectedSalary("all");
                }}
                className="w-full mt-5 px-4 py-2 text-sm text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
              >
                Xóa bộ lọc
              </button>
            </div>
          </aside>

          {/* Job Listings */}
          <main className="lg:col-span-3 space-y-6">
            {/* Results Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">
                  {filteredJobs.length > 0 ? (
                    <>
                      Có <span className="text-blue-600">{filteredJobs.length}</span> việc làm phù hợp
                    </>
                  ) : (
                    "Không tìm thấy việc làm phù hợp"
                  )}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Cập nhật lúc {new Date().toLocaleTimeString("vi-VN")}
                </p>
              </div>
            </div>

            {/* Featured Jobs */}
            {featuredJobs.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-orange-500" />
                  <h3 className="font-semibold text-lg">Việc làm nổi bật</h3>
                </div>
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {featuredJobs.map((job) => (
                    <FeaturedJobCard key={job.id} job={job} />
                  ))}
                </div>
              </div>
            )}

            {/* All Jobs */}
            {normalJobs.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-4">
                  Tất cả việc làm
                </h3>
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {normalJobs.map((job) => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>
              </div>
            )}

            {/* No Results */}
            {filteredJobs.length === 0 && (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  Không tìm thấy việc làm phù hợp
                </h3>
                <p className="text-gray-600 mb-4">
                  Thử điều chỉnh bộ lọc hoặc tìm kiếm với từ khóa khác
                </p>
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedLocation("all");
                    setSelectedCategory("all");
                    setSelectedShift("all");
                    setSelectedSalary("all");
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Xóa bộ lọc
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

function FeaturedJobCard({ job }: { job: Job }) {
  const [saved, setSaved] = useState(false);

  return (
    <Link
      to={`/jobs/${job.id}`}
      className="block bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 rounded-lg p-5 hover:shadow-lg transition-all group relative h-full"
    >
      {/* Bookmark Button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          setSaved(!saved);
        }}
        className="absolute top-4 right-4 z-10 p-2 bg-white hover:bg-gray-50 rounded-lg transition-colors shadow-sm"
      >
        <Bookmark
          className={`w-5 h-5 ${
            saved
              ? "fill-blue-600 text-blue-600"
              : "text-gray-400 hover:text-blue-600"
          }`}
        />
      </button>

      <div className="flex flex-col h-full">
        {/* Job Image */}
        {job.image && (
          <div className="mb-4 -mx-5 -mt-5 rounded-t-lg overflow-hidden">
            <ImageWithFallback
              src={job.image}
              alt={job.title}
              className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}

        {/* Job Info */}
        <div className="flex-1 flex flex-col">
          <div className="mb-3 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <h3 className="font-semibold text-lg group-hover:text-blue-600 transition-colors line-clamp-2">
                {job.title}
              </h3>
              <Zap className="w-5 h-5 text-orange-500 flex-shrink-0" />
            </div>
            <p className="text-gray-700 font-medium truncate">{job.company}</p>
          </div>

          <div className="space-y-2 mb-3">
            <div className="flex items-center justify-center gap-2 text-sm text-green-600">
              <DollarSign className="w-4 h-4" />
              <span className="font-semibold">{job.salaryRange}</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              <span className="truncate">{job.location}</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>{job.shift}{job.workingHours ? ` (${job.workingHours})` : ""}</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span>
                {job.rating} ({job.reviewCount})
              </span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 flex-wrap mt-auto">
            <span className="px-3 py-1 bg-white text-blue-600 text-xs font-medium rounded-full border border-blue-200">
              {job.category}
            </span>
            {job.urgent && (
              <span className="px-3 py-1 bg-red-100 text-red-600 text-xs font-semibold rounded-full">
                TUYỂN GẤP
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 text-center mt-2">{job.postedDate}</p>
        </div>
      </div>
    </Link>
  );
}

function JobCard({ job }: { job: Job }) {
  const [saved, setSaved] = useState(false);

  return (
    <Link
      to={`/jobs/${job.id}`}
      className="block bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md hover:border-blue-300 transition-all group h-full"
    >
      {/* Bookmark Button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          setSaved(!saved);
        }}
        className="absolute top-4 right-4 z-10 p-2 hover:bg-gray-50 rounded-lg transition-colors"
      >
        <Bookmark
          className={`w-5 h-5 ${
            saved
              ? "fill-blue-600 text-blue-600"
              : "text-gray-400 hover:text-blue-600"
          }`}
        />
      </button>

      <div className="flex flex-col h-full relative">
        {/* Job Image */}
        {job.image && (
          <div className="mb-4 -mx-5 -mt-5 rounded-t-lg overflow-hidden">
            <ImageWithFallback
              src={job.image}
              alt={job.title}
              className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}

        {/* Job Info */}
        <div className="flex-1 flex flex-col">
          <div className="mb-3 text-center">
            <h3 className="font-semibold text-lg group-hover:text-blue-600 transition-colors mb-2 line-clamp-2">
              {job.title}
            </h3>
            <p className="text-gray-600 truncate">{job.company}</p>
          </div>

          <div className="space-y-2 mb-3">
            <div className="flex items-center justify-center gap-2 text-sm text-green-600">
              <DollarSign className="w-4 h-4" />
              <span className="font-semibold">{job.salaryRange}</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              <span className="truncate">{job.location}</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>{job.shift}{job.workingHours ? ` (${job.workingHours})` : ""}</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span>
                {job.rating} ({job.reviewCount})
              </span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 flex-wrap mt-auto">
            <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded-full">
              {job.category}
            </span>
            {job.urgent && (
              <span className="px-3 py-1 bg-red-100 text-red-600 text-xs font-semibold rounded-full">
                TUYỂN GẤP
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 text-center mt-2">{job.postedDate}</p>
        </div>
      </div>
    </Link>
  );
}