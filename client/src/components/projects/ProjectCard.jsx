import ProjectActionsMenu from './ProjectActionsMenu';
import {
  CalendarIcon,
  StatusAtRiskIcon,
  StatusCompletedIcon,
  StatusInProgressIcon,
  StatusOnTrackIcon,
} from '@/components/icons/Icons';

export default function ProjectCard({
  project,
  onEditProject,
  onDuplicateProject,
  onOpenProjectNotes,
  onDeleteProject,
  onProjectClick,
}) {
  const handleCardClick = (e) => {
    if (!e.target.closest('.options-container')) {
      onProjectClick(project);
    }
  };

  const handleEdit = () => {
    onEditProject(project);
  };

  const handleDuplicate = () => {
    onDuplicateProject(project.id);
  };

  const handleOpenNotes = () => {
    onOpenProjectNotes(project.id);
  };

  const handleDelete = () => {
    onDeleteProject(project.id);
  };

  const formatStatus = (status) => {
    if (!status) return 'In Progress';
    return status
      .toString()
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const formatDate = (value) => {
    if (!value) return 'No due date';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'No due date';
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  const getStatusIcon = (status, className = 'h-3.5 w-3.5 text-current') => {
    const normalized = status?.toLowerCase().replace(/_/g, ' ');
    switch (normalized) {
      case 'in progress':
        return <StatusInProgressIcon className={className} />;
      case 'on track':
        return <StatusOnTrackIcon className={className} />;
      case 'at risk':
        return <StatusAtRiskIcon className={className} />;
      case 'completed':
        return <StatusCompletedIcon className={className} />;
      default:
        return null;
    }
  };

  const getStatusPillClasses = (status) => {
    const normalized = status?.toLowerCase().replace(/_/g, ' ');
    switch (normalized) {
      case 'on track':
        return 'bg-green-100 text-green-700';
      case 'at risk':
        return 'bg-red-100 text-red-700';
      case 'completed':
        return 'bg-gray-100 text-gray-700';
      case 'in progress':
        return 'bg-amber-100 text-amber-700';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const completionPercentage =
    project.totalTasks > 0
      ? Math.round((project.completedTasks / project.totalTasks) * 100)
      : 0;

  return (
    <div
      className="surface-card rounded-2xl p-5 flex flex-col cursor-pointer transition-all duration-150"
      onClick={handleCardClick}>
      <div className="flex justify-between items-start mb-1 gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-gray-900 mb-1 line-clamp-1">
            {project.name}
          </h3>
        </div>

        <ProjectActionsMenu
          className="relative ml-2"
          buttonClassName="bg-none border-none cursor-pointer leading-none"
          onEdit={handleEdit}
          onDuplicate={handleDuplicate}
          onOpenNotes={handleOpenNotes}
          onDelete={handleDelete}
        />
      </div>

      <p className="text-sm text-gray-500 m-0 mb-1 leading-relaxed flex-grow line-clamp-3">
        {project.description || 'No description'}
      </p>

      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-500">Progress</span>
          <span className="text-xs font-semibold text-gray-700">
            {completionPercentage}%
          </span>
        </div>
        <div className="w-full rounded-full h-1.5 progress-track">
          <div
            className="progress-fill h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-1.5 text-xs text-gray-500">
          <span>
            {project.completedTasks || 0} of {project.totalTasks || 0} tasks
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-2">
            <CalendarIcon className="h-3.5 w-3.5 text-gray-400" />
            <span className="font-medium">
              {formatDate(project.dueDate)}
            </span>
          </div>
          <div
            className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${getStatusPillClasses(
              project.status
            )}`}>
            {getStatusIcon(project.status)}
            <span className="whitespace-nowrap">
              {formatStatus(project.status)}
            </span>
          </div>
        </div>
      </div>

    </div>
  );
}
