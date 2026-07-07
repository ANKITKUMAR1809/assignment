import React from 'react';
import { Calendar, Edit3, Trash2, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';

const TaskCard = ({ task, onEdit, onDelete }) => {
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const isOverdue = () => {
    if (task.status === 'Completed') return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(task.dueDate);
    return dueDate < today;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle2 size={16} />;
      case 'In Progress':
        return <Clock size={16} />;
      default:
        return <AlertCircle size={16} />;
    }
  };

  return (
    <div className={`task-card ${isOverdue() ? 'task-overdue' : ''}`}>
      <div className="task-card-header">
        <span className={`badge priority-badge priority-${task.priority.toLowerCase()}`}>
          {task.priority}
        </span>
        <span className={`badge status-badge status-${task.status.toLowerCase().replace(' ', '-')}`}>
          {getStatusIcon(task.status)}
          <span>{task.status}</span>
        </span>
      </div>

      <h3 className="task-title">{task.title}</h3>
      <p className="task-desc">{task.description || 'No description provided.'}</p>

      <div className="task-card-footer">
        <div className={`task-date ${isOverdue() ? 'text-danger-custom' : ''}`}>
          <Calendar size={14} />
          <span>{formatDate(task.dueDate)}</span>
          {isOverdue() && <span className="overdue-label">(Overdue)</span>}
        </div>
        
        <div className="task-actions">
          <button
            onClick={() => onEdit(task)}
            className="btn-icon text-accent"
            title="Edit Task"
          >
            <Edit3 size={16} />
          </button>
          <button
            onClick={() => onDelete(task._id)}
            className="btn-icon text-danger"
            title="Delete Task"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
