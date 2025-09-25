import { useState, useMemo } from 'react';

const Calendar = ({ projects = [] }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const navigateMonth = (direction) => {
    const newDate = new Date(currentYear, currentMonth + direction, 1);
    setCurrentDate(newDate);
  };

  const projectsByDate = useMemo(() => {
    const dateMap = new Map();

    projects.forEach((project) => {
      if (project.dueDate) {
        const [day, monthStr, year] = project.dueDate.split(' ');
        const monthIndex = new Date(`${monthStr} 1, 2000`).getMonth();
        const projectDate = new Date(parseInt(year), monthIndex, parseInt(day));

        if (
          projectDate.getMonth() === currentMonth &&
          projectDate.getFullYear() === currentYear
        ) {
          const dateKey = projectDate.getDate();
          if (!dateMap.has(dateKey)) {
            dateMap.set(dateKey, []);
          }
          dateMap.get(dateKey).push(project);
        }
      }
    });

    return dateMap;
  }, [projects, currentMonth, currentYear]);

  const calendarDays = [];

  for (let i = 0; i < startingDayOfWeek; i++) {
    const prevMonthDate = new Date(
      currentYear,
      currentMonth,
      -startingDayOfWeek + i + 1
    );
    calendarDays.push({
      day: prevMonthDate.getDate(),
      isCurrentMonth: false,
      isPrevMonth: true,
      projects: [],
    });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push({
      day,
      isCurrentMonth: true,
      isPrevMonth: false,
      projects: projectsByDate.get(day) || [],
    });
  }

  const remainingCells = 42 - calendarDays.length;
  for (let i = 1; i <= remainingCells; i++) {
    calendarDays.push({
      day: i,
      isCurrentMonth: false,
      isPrevMonth: false,
      projects: [],
    });
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'in progress':
        return 'bg-blue-500';
      case 'on track':
        return 'bg-green-500';
      case 'at risk':
        return 'bg-red-500';
      case 'completed':
        return 'bg-gray-400';
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 text-gray-600 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigateMonth(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <h2 className="text-l font-medium text-gray-900">
          {monthNames[currentMonth]} {currentYear}
        </h2>

        <button
          onClick={() => navigateMonth(1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-700">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-4">
        {dayNames.map((day) => (
          <div
            key={day}
            className="text-center text-sm font-medium text-gray-600 py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {calendarDays.map((dateObj, index) => (
          <div
            key={index}
            className={`
              min-h-[80px] p-2 rounded-xl border transition-colors relative
              ${
                dateObj.isCurrentMonth
                  ? 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  : 'bg-white border-gray-100'
              }
              ${
                dateObj.projects.length > 0 && dateObj.isCurrentMonth
                  ? 'ring-1 ring-gray-300'
                  : ''
              }
            `}>
            <div
              className={`text-sm font-medium mb-2 ${
                dateObj.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
              }`}>
              {dateObj.day}
            </div>

            {dateObj.projects.length > 0 && (
              <div className="space-y-1">
                {dateObj.projects.slice(0, 2).map((project, projectIndex) => (
                  <div
                    key={projectIndex}
                    className="flex items-center gap-1.5 text-xs bg-white border border-gray-200  rounded-md px-2 py-1 hover:bg-gray-50 transition-colors cursor-pointer shadow-sm"
                    title={`${project.name} - ${project.status}`}>
                    <div
                      className={`w-2 h-2 rounded-full flex-shrink-0 ${getStatusColor(
                        project.status
                      )}`}
                    />
                    <span className="truncate text-gray-700 font-medium">
                      {project.name}
                    </span>
                  </div>
                ))}

                {dateObj.projects.length > 2 && (
                  <div className="text-xs text-gray-500 text-center py-1 font-medium">
                    +{dateObj.projects.length - 2} more
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-4 mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span className="text-xs text-gray-600">In Progress</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-xs text-gray-600">On Track</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-xs text-gray-600">At Risk</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gray-400" />
          <span className="text-xs text-gray-600">Completed</span>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
