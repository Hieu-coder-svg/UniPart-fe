import { useState, useEffect } from "react";
import { Clock, Info } from "lucide-react";

interface WeeklyScheduleProps {
  editable?: boolean;
}

export default function WeeklySchedule({ editable = true }: WeeklyScheduleProps) {
  // Initialize schedule: days x hours (7 days, 6am-10pm = 16 hours)
  const [schedule, setSchedule] = useState<boolean[][]>(() => {
    // Create 7 days x 16 hours grid (all false initially)
    return Array(7).fill(null).map(() => Array(16).fill(false));
  });

  // Drag state
  const [isDragging, setIsDragging] = useState(false);
  const [dragValue, setDragValue] = useState<boolean>(false);

  const days = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "CN"];
  const hours = Array.from({ length: 16 }, (_, i) => i + 6); // 6am to 9pm (6, 7, 8, ..., 21)

  const handleMouseDown = (dayIndex: number, hourIndex: number) => {
    if (!editable) return;
    
    const currentValue = schedule[dayIndex][hourIndex];
    setIsDragging(true);
    setDragValue(!currentValue);
    
    // Toggle the initial cell
    setSchedule(prev => {
      const newSchedule = prev.map(day => [...day]);
      newSchedule[dayIndex][hourIndex] = !currentValue;
      return newSchedule;
    });
  };

  const handleMouseEnter = (dayIndex: number, hourIndex: number) => {
    if (!editable || !isDragging) return;
    
    setSchedule(prev => {
      const newSchedule = prev.map(day => [...day]);
      newSchedule[dayIndex][hourIndex] = dragValue;
      return newSchedule;
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const toggleDay = (dayIndex: number) => {
    if (!editable) return;
    
    setSchedule(prev => {
      const newSchedule = prev.map(day => [...day]);
      const allSelected = newSchedule[dayIndex].every(slot => slot);
      newSchedule[dayIndex] = newSchedule[dayIndex].map(() => !allSelected);
      return newSchedule;
    });
  };

  const toggleHour = (hourIndex: number) => {
    if (!editable) return;
    
    setSchedule(prev => {
      const newSchedule = prev.map(day => [...day]);
      const allSelected = newSchedule.every(day => day[hourIndex]);
      newSchedule.forEach(day => {
        day[hourIndex] = !allSelected;
      });
      return newSchedule;
    });
  };

  const clearAll = () => {
    if (!editable) return;
    setSchedule(Array(7).fill(null).map(() => Array(16).fill(false)));
  };

  const selectAll = () => {
    if (!editable) return;
    setSchedule(Array(7).fill(null).map(() => Array(16).fill(true)));
  };

  const getFreeHoursCount = () => {
    return schedule.reduce((total, day) => 
      total + day.filter(slot => slot).length, 0
    );
  };

  // Add global mouseup listener to handle drag end
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, []);

  return (
    <div className="space-y-4" onMouseLeave={handleMouseUp}>
      {/* Header with info and actions */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h3 className="mb-2">Lịch rảnh trong tuần</h3>
          <div className="flex items-start gap-2 text-sm text-gray-600">
            <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p>
              {editable 
                ? "Click và kéo để chọn nhiều ô liên tiếp. Nhấp vào tiêu đề ngày/giờ để chọn cả cột/hàng."
                : "Hiển thị thời gian rảnh của sinh viên"}
            </p>
          </div>
        </div>
        
        {editable && (
          <div className="flex gap-2">
            <button
              onClick={selectAll}
              className="px-3 py-1.5 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
            >
              Chọn tất cả
            </button>
            <button
              onClick={clearAll}
              className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Xóa tất cả
            </button>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
        <Clock className="w-5 h-5 text-blue-600" />
        <div>
          <div className="text-sm text-gray-600">Tổng số giờ rảnh</div>
          <div className="text-2xl text-blue-600">{getFreeHoursCount()} giờ/tuần</div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-green-500 rounded border border-green-600"></div>
          <span className="text-gray-600">Rảnh</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gray-100 rounded border border-gray-300"></div>
          <span className="text-gray-600">Bận</span>
        </div>
      </div>

      {/* Schedule Grid */}
      <div className="overflow-x-auto -mx-4 px-4">
        <div className="inline-block min-w-full">
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            {/* Header row with days */}
            <div className="grid grid-cols-[60px_repeat(7,minmax(50px,1fr))] bg-gray-50 border-b border-gray-200">
              <div className="p-2 border-r border-gray-200 flex items-center justify-center">
                <Clock className="w-4 h-4 text-gray-400" />
              </div>
              {days.map((day, dayIndex) => (
                <button
                  key={day}
                  onClick={() => toggleDay(dayIndex)}
                  disabled={!editable}
                  className={`p-2 text-center text-sm font-medium border-r border-gray-200 last:border-r-0 ${
                    editable ? 'hover:bg-blue-50 cursor-pointer transition-colors' : 'cursor-default'
                  } ${dayIndex === 6 ? 'text-red-600' : 'text-gray-700'}`}
                  title={editable ? `Click để chọn/bỏ chọn ${day}` : ''}
                >
                  {day}
                </button>
              ))}
            </div>

            {/* Time rows */}
            {hours.map((hour, hourIndex) => (
              <div
                key={hour}
                className="grid grid-cols-[60px_repeat(7,minmax(50px,1fr))] border-b border-gray-200 last:border-b-0"
              >
                {/* Hour label */}
                <button
                  onClick={() => toggleHour(hourIndex)}
                  disabled={!editable}
                  className={`p-2 text-xs text-gray-600 border-r border-gray-200 flex items-center justify-center bg-gray-50 ${
                    editable ? 'hover:bg-blue-50 cursor-pointer transition-colors' : 'cursor-default'
                  }`}
                  title={editable ? `Click để chọn/bỏ chọn ${hour}:00` : ''}
                >
                  {hour}:00
                </button>

                {/* Day slots */}
                {days.map((_, dayIndex) => (
                  <button
                    key={dayIndex}
                    onMouseDown={() => handleMouseDown(dayIndex, hourIndex)}
                    onMouseEnter={() => handleMouseEnter(dayIndex, hourIndex)}
                    onMouseUp={handleMouseUp}
                    disabled={!editable}
                    className={`p-2 border-r border-gray-200 last:border-r-0 transition-all ${
                      schedule[dayIndex][hourIndex]
                        ? 'bg-green-500 hover:bg-green-600'
                        : 'bg-white hover:bg-green-50'
                    } ${editable ? 'cursor-pointer' : 'cursor-default'}`}
                    title={`${days[dayIndex]} ${hour}:00-${hour + 1}:00`}
                  >
                    <div className="h-6"></div>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile friendly view - show selected times as list */}
      <div className="md:hidden mt-6">
        <h4 className="mb-3 text-sm">Danh sách thời gian rảnh:</h4>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {schedule.map((day, dayIndex) => {
            const freeSlots = day
              .map((isFree, hourIndex) => isFree ? hours[hourIndex] : null)
              .filter(h => h !== null);
            
            if (freeSlots.length === 0) return null;
            
            return (
              <div key={dayIndex} className="p-3 bg-green-50 rounded-lg text-sm">
                <div className="font-medium text-green-800 mb-1">{days[dayIndex]}</div>
                <div className="text-gray-700">
                  {freeSlots.map(h => `${h}:00`).join(', ')}
                </div>
              </div>
            );
          })}
          {getFreeHoursCount() === 0 && (
            <div className="text-center text-gray-500 py-4">
              Chưa có thời gian rảnh nào được đánh dấu
            </div>
          )}
        </div>
      </div>

      {editable && (
        <div className="pt-4 border-t border-gray-200">
          <button className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Lưu lịch rảnh
          </button>
        </div>
      )}
    </div>
  );
}