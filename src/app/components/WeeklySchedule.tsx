import { useState, useEffect } from "react";
import { Clock, Info, Loader2, Save } from "lucide-react";

interface WeeklyScheduleProps {
  editable?: boolean;
  busySlots?: Record<string, number[]>; // dayOfWeek -> busyTimeSlotIds
  onSave?: (busySlots: Record<string, number[]>) => void;
  isLoading?: boolean;
}

export default function WeeklySchedule({ 
  editable = true, 
  busySlots = {}, 
  onSave,
  isLoading = false 
}: WeeklyScheduleProps) {
  const days = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "CN"];
  const hours = Array.from({ length: 16 }, (_, i) => i + 6); // 6am to 9pm (6, 7, 8, ..., 21)

  // Internal grid state derived from busySlots
  const [schedule, setSchedule] = useState<boolean[][]>(() => {
    const grid = Array(7).fill(null).map(() => Array(16).fill(false));
    days.forEach((day, dIdx) => {
      const busyIds = busySlots[day] || [];
      busyIds.forEach(id => {
        const hIdx = id - 1; // Assuming IDs are 1-based and correspond to hours 6-21
        if (hIdx >= 0 && hIdx < 16) {
          grid[dIdx][hIdx] = true;
        }
      });
    });
    return grid;
  });

  // Update internal state if busySlots prop changes
  useEffect(() => {
    const grid = Array(7).fill(null).map(() => Array(16).fill(false));
    days.forEach((day, dIdx) => {
      const busyIds = busySlots[day] || [];
      busyIds.forEach(id => {
        const hIdx = id - 1;
        if (hIdx >= 0 && hIdx < 16) grid[dIdx][hIdx] = true;
      });
    });
    setSchedule(grid);
  }, [busySlots]);

  // Drag state
  const [isDragging, setIsDragging] = useState(false);
  const [dragValue, setDragValue] = useState<boolean>(false);

  const handleMouseDown = (dayIndex: number, hourIndex: number) => {
    if (!editable) return;
    const currentValue = schedule[dayIndex][hourIndex];
    setIsDragging(true);
    setDragValue(!currentValue);
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
      newSchedule.forEach(day => { day[hourIndex] = !allSelected; });
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

  const handleSave = () => {
    if (!onSave) return;
    const result: Record<string, number[]> = {};
    schedule.forEach((dayGrid, dIdx) => {
      const busyIds: number[] = [];
      dayGrid.forEach((isBusy, hIdx) => {
        if (isBusy) busyIds.push(hIdx + 1); // ID = hour index + 1
      });
      if (busyIds.length > 0) {
        result[days[dIdx]] = busyIds;
      }
    });
    onSave(result);
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false);
    document.addEventListener('mouseup', handleGlobalMouseUp);
    return () => document.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  return (
    <div className="space-y-4" onMouseLeave={handleMouseUp}>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-500" />
            Lịch học & Thời gian bận
          </h3>
          <div className="flex items-start gap-2 text-sm text-gray-500 mt-1">
            <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p>
              {editable 
                ? "Đánh dấu những khoảng thời gian bạn phải đi học hoặc bận việc riêng. Hệ thống sẽ tự động lọc các công việc không trùng lịch."
                : "Thời gian bận của sinh viên (không thể nhận việc)"}
            </p>
          </div>
        </div>
        
        {editable && (
          <div className="flex gap-2">
            <button onClick={selectAll} className="px-3 py-1.5 text-xs bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors font-medium border border-orange-100">
              Bận cả tuần
            </button>
            <button onClick={clearAll} className="px-3 py-1.5 text-xs bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors font-medium border border-gray-200">
              Xóa trắng
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 text-sm bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-orange-500 rounded border border-orange-600 shadow-sm"></div>
          <span className="text-gray-600 font-medium">Đang bận (Học)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-white rounded border border-gray-300"></div>
          <span className="text-gray-600 font-medium">Thời gian rảnh</span>
        </div>
        <div className="ml-auto text-xs text-gray-400">
          Tổng cộng: <span className="font-bold text-orange-600">{schedule.flat().filter(Boolean).length}</span> giờ bận
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="inline-block min-w-full">
          <div className="grid grid-cols-[70px_repeat(7,minmax(60px,1fr))] bg-gray-50 border-b border-gray-100">
            <div className="p-3 border-r border-gray-100 flex items-center justify-center">
              <Clock className="w-4 h-4 text-gray-400" />
            </div>
            {days.map((day, dayIndex) => (
              <button
                key={day}
                onClick={() => toggleDay(dayIndex)}
                disabled={!editable}
                className={`p-3 text-center text-xs font-bold border-r border-gray-100 last:border-r-0 ${
                  editable ? 'hover:bg-orange-50 cursor-pointer transition-colors' : 'cursor-default'
                } ${dayIndex === 6 ? 'text-red-500' : 'text-gray-700'}`}
              >
                {day}
              </button>
            ))}
          </div>

          {hours.map((hour, hourIndex) => (
            <div key={hour} className="grid grid-cols-[70px_repeat(7,minmax(60px,1fr))] border-b border-gray-50 last:border-b-0">
              <button
                onClick={() => toggleHour(hourIndex)}
                disabled={!editable}
                className={`p-2 text-[10px] font-bold text-gray-500 border-r border-gray-100 flex items-center justify-center bg-gray-50/50 ${
                  editable ? 'hover:bg-orange-50 cursor-pointer transition-colors' : 'cursor-default'
                }`}
              >
                {hour}:00
              </button>

              {days.map((_, dayIndex) => (
                <button
                  key={dayIndex}
                  onMouseDown={() => handleMouseDown(dayIndex, hourIndex)}
                  onMouseEnter={() => handleMouseEnter(dayIndex, hourIndex)}
                  onMouseUp={handleMouseUp}
                  disabled={!editable}
                  className={`p-2 border-r border-gray-100 last:border-r-0 transition-all h-10 ${
                    schedule[dayIndex][hourIndex]
                      ? 'bg-orange-500 hover:bg-orange-600 shadow-inner'
                      : 'bg-white hover:bg-orange-50'
                  } ${editable ? 'cursor-pointer' : 'cursor-default'}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {editable && onSave && (
        <div className="pt-4">
          <button 
            onClick={handleSave}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-200 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Lưu lịch học của tôi
          </button>
        </div>
      )}
    </div>
  );
}