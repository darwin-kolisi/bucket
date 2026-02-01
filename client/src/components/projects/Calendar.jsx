import { useState, useMemo, useEffect, useRef } from 'react';

const Calendar = ({ projects = [], onProjectSelect }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isMobile, setIsMobile] = useState(false);
  const [popupData, setPopupData] = useState(null);
  const popupRef = useRef(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setPopupData(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

  const handleProjectClick = (project) => {
    if (onProjectSelect) {
      onProjectSelect(project);
    }
    setPopupData(null);
  };

  const handleDayClick = (e, dateObj) => {
    if (isMobile || !dateObj.projects || dateObj.projects.length === 0) {
      return;
    }
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setPopupData({
      projects: dateObj.projects,
      top: rect.bottom + window.scrollY + 5,
      left: rect.left + window.scrollX,
      minWidth: rect.width,
    });
  };

  const renderDesktopView = () => (
    <div className="grid grid-cols-7 gap-2">
      {calendarDays.map((dateObj, index) => (
        <div
          key={index}
          onClick={(e) => handleDayClick(e, dateObj)}
          className={`
            min-h-[80px] p-2 rounded-xl border transition-colors relative
            ${
              dateObj.isCurrentMonth
                ? 'bg-gray-50 border-gray-200'
                : 'bg-white border-gray-100'
            }
            ${
              dateObj.projects.length > 0 && dateObj.isCurrentMonth
                ? 'ring-1 ring-gray-300 hover:bg-gray-100 cursor-pointer'
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
                  className="flex items-center gap-1.5 text-xs bg-white border border-gray-200 rounded-md px-2 py-1 shadow-sm"
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
  );

  const renderMobileView = () => {
    const daysWithProjects = calendarDays.filter(
      (day) => day.isCurrentMonth && day.projects.length > 0
    );

    if (daysWithProjects.length === 0) {
      return (
        <div className="text-center text-sm py-8 text-gray-500 rounded-xl">
          No projects scheduled for this month
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {daysWithProjects.map((dateObj, index) => (
          <div
            key={index}
            className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
              <span className="font-bold text-lg text-gray-900">
                {dateObj.day}
              </span>
              <span className="text-sm font-medium text-gray-500 mt-0.5">
                {
                  dayNames[
                    new Date(currentYear, currentMonth, dateObj.day).getDay()
                  ]
                }
              </span>
            </div>
            <div className="space-y-1">
              {dateObj.projects.map((project, projectIndex) => (
                <button
                  key={projectIndex}
                  onClick={() => handleProjectClick(project)}
                  className="group flex w-full items-start gap-3 rounded-lg px-3 py-2 hover:bg-gray-50 text-left transition-colors">
                  <div className="flex-shrink-0 mt-1">
                    <div
                      className={`w-2 h-2 rounded-full ${getStatusColor(
                        project.status
                      )}`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate text-left">
                      {project.name}
                    </div>
                    <div className="text-gray-500 text-xs truncate text-left">
                      {project.description}
                    </div>
                    <div className="text-gray-400 text-xs mt-1 text-left">
                      Due: {project.dueDate} • {project.totalTasks || 0} tasks
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 md:p-6 text-gray-600 max-w-4xl mx-auto">
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

      {!isMobile && (
        <div className="grid grid-cols-7 gap-2 mb-4">
          {dayNames.map((day) => (
            <div
              key={day}
              className="text-center text-sm font-medium text-gray-600 py-2">
              {day}
            </div>
          ))}
        </div>
      )}

      {isMobile ? renderMobileView() : renderDesktopView()}

      {popupData && (
        <div
          ref={popupRef}
          style={{
            position: 'absolute',
            top: `${popupData.top}px`,
            left: `${popupData.left}px`,
            minWidth: `${popupData.minWidth}px`,
          }}
          className="w-72 origin-top-right rounded-xl border border-gray-200 bg-white p-2 text-sm text-gray-900 shadow-lg z-50">
          <div className="mb-2 px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
            Projects for this day
          </div>
          <div className="max-h-60 overflow-y-auto">
            {popupData.projects.map((project) => (
              <button
                key={project.id}
                onClick={() => handleProjectClick(project)}
                className="group flex w-full items-start gap-3 rounded-lg px-3 py-2 hover:bg-gray-100 text-left">
                <div className="flex-shrink-0 mt-1">
                  <div
                    className={`w-2 h-2 rounded-full ${getStatusColor(
                      project.status
                    )}`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate">
                    {project.name}
                  </div>
                  <div className="text-gray-500 text-xs truncate">
                    {project.description}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-center flex-wrap gap-4 mt-6 pt-4 border-t border-gray-200">
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
