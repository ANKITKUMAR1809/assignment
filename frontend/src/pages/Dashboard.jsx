import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import TaskCard from '../components/TaskCard';
import Footer from '../components/Footer';
import {
  LogOut,
  Sun,
  Moon,
  Plus,
  Search,
  SlidersHorizontal,
  X,
  ListTodo,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';

const Dashboard = () => {
  const { user, token, logout, API_BASE_URL } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { addToast } = useToast();

  // Task states
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter states
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [sortBy, setSortBy] = useState('dueDate:asc');

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [taskToDeleteId, setTaskToDeleteId] = useState(null);

  // Task form state
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formStatus, setFormStatus] = useState('Pending');
  const [formPriority, setFormPriority] = useState('Medium');
  const [formDueDate, setFormDueDate] = useState('');

  // Fetch tasks
  const fetchTasks = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (search) queryParams.append('search', search);
      if (statusFilter !== 'All') queryParams.append('status', statusFilter);
      if (priorityFilter !== 'All') queryParams.append('priority', priorityFilter);
      if (sortBy) queryParams.append('sortBy', sortBy);

      const response = await fetch(`${API_BASE_URL}/tasks?${queryParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data.success) {
        setTasks(data.data);
      } else {
        addToast(data.message || 'Failed to load tasks', 'error');
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      addToast('Error loading tasks. Check your server connection.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Trigger fetch when filters change
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchTasks();
    }, 300); // 300ms debounce for search query

    return () => clearTimeout(delayDebounceFn);
  }, [search, statusFilter, priorityFilter, sortBy]);

  // Open modal for Create Task
  const handleCreateOpen = () => {
    setEditingTask(null);
    setFormTitle('');
    setFormDescription('');
    setFormStatus('Pending');
    setFormPriority('Medium');
    
    // Set default due date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setFormDueDate(tomorrow.toISOString().split('T')[0]);

    setModalOpen(true);
  };

  // Open modal for Edit Task
  const handleEditOpen = (task) => {
    setEditingTask(task);
    setFormTitle(task.title);
    setFormDescription(task.description || '');
    setFormStatus(task.status);
    setFormPriority(task.priority);
    setFormDueDate(new Date(task.dueDate).toISOString().split('T')[0]);
    setModalOpen(true);
  };

  // Handle Form Submission (Create or Edit)
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!formTitle.trim()) {
      addToast('Title is required', 'error');
      return;
    }
    if (!formDueDate) {
      addToast('Due date is required', 'error');
      return;
    }

    const payload = {
      title: formTitle,
      description: formDescription,
      status: formStatus,
      priority: formPriority,
      dueDate: formDueDate,
    };

    try {
      let response;
      if (editingTask) {
        // Edit task
        response = await fetch(`${API_BASE_URL}/tasks/${editingTask._id}`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
      } else {
        // Create task
        response = await fetch(`${API_BASE_URL}/tasks`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
      }

      const data = await response.json();

      if (data.success) {
        addToast(
          editingTask ? 'Task updated successfully!' : 'Task created successfully!',
          'success'
        );
        setModalOpen(false);
        fetchTasks();
      } else {
        addToast(data.message || 'Action failed', 'error');
      }
    } catch (error) {
      console.error('Error saving task:', error);
      addToast('An error occurred while saving the task.', 'error');
    }
  };

  // Open Delete confirmation
  const handleDeleteOpen = (id) => {
    setTaskToDeleteId(id);
    setDeleteConfirmOpen(true);
  };

  // Confirm delete task
  const handleConfirmDelete = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskToDeleteId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        addToast('Task deleted successfully!', 'success');
        setDeleteConfirmOpen(false);
        fetchTasks();
      } else {
        addToast(data.message || 'Failed to delete task', 'error');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      addToast('An error occurred while deleting the task.', 'error');
    }
  };

  // Task stats aggregation
  const getStats = () => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === 'Completed').length;
    const progress = tasks.filter((t) => t.status === 'In Progress').length;
    const pending = tasks.filter((t) => t.status === 'Pending').length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, progress, pending, percent };
  };

  const stats = getStats();

  return (
    <div className="dashboard-container">
      {/* Top Navigation Header */}
      <header className="dashboard-header">
        <div className="header-logo">
          <div className="logo-badge-sm">
            <CheckCircle className="logo-icon-sm" />
          </div>
          <h2>Taskly</h2>
        </div>

        <div className="header-actions">
          <span className="user-greeting">Hi, {user?.name || 'User'}</span>
          
          <button onClick={toggleTheme} className="btn-icon theme-toggle" title="Toggle Theme">
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          
          <button onClick={logout} className="btn btn-secondary btn-logout">
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Metrics Banner */}
      <section className="stats-section">
        <div className="stats-card total-tasks">
          <div className="stats-card-info">
            <span className="stats-label">Total Tasks</span>
            <span className="stats-value">{stats.total}</span>
          </div>
          <div className="stats-icon-wrapper blue">
            <ListTodo size={24} />
          </div>
        </div>

        <div className="stats-card pending-tasks">
          <div className="stats-card-info">
            <span className="stats-label">Pending</span>
            <span className="stats-value">{stats.pending}</span>
          </div>
          <div className="stats-icon-wrapper amber">
            <AlertCircle size={24} />
          </div>
        </div>

        <div className="stats-card progress-tasks">
          <div className="stats-card-info">
            <span className="stats-label">In Progress</span>
            <span className="stats-value">{stats.progress}</span>
          </div>
          <div className="stats-icon-wrapper indigo">
            <Clock size={24} />
          </div>
        </div>

        <div className="stats-card completed-tasks">
          <div className="stats-card-info">
            <span className="stats-label">Completed</span>
            <span className="stats-value">{stats.completed}</span>
          </div>
          <div className="stats-icon-wrapper green">
            <CheckCircle size={24} />
          </div>
        </div>

        <div className="stats-card completion-progress">
          <div className="stats-card-info">
            <span className="stats-label">Completion Rate</span>
            <span className="stats-value">{stats.percent}%</span>
          </div>
          <div className="stats-icon-wrapper purple">
            <TrendingUp size={24} />
          </div>
          <div className="progress-bar-container">
            <div className="progress-bar-fill" style={{ width: `${stats.percent}%` }}></div>
          </div>
        </div>
      </section>

      {/* Main Work Area */}
      <main className="dashboard-main">
        {/* Filter Controls Row */}
        <section className="filter-section">
          <div className="search-box">
            <Search className="search-icon" size={18} />
            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-control"
            />
          </div>

          <div className="filter-controls">
            <div className="filter-group">
              <SlidersHorizontal size={14} className="filter-icon" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="filter-select"
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div className="filter-group">
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="filter-select"
              >
                <option value="All">All Priorities</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div className="filter-group">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="filter-select"
              >
                <option value="dueDate:asc">Due Date (Asc)</option>
                <option value="dueDate:desc">Due Date (Desc)</option>
                <option value="createdAt:desc">Created (Newest)</option>
                <option value="title:asc">Title (A-Z)</option>
              </select>
            </div>

            <button onClick={handleCreateOpen} className="btn btn-primary btn-add-task">
              <Plus size={16} />
              <span>New Task</span>
            </button>
          </div>
        </section>

        {/* Task Cards Grid */}
        {loading ? (
          <div className="skeleton-grid">
            {[1, 2, 3].map((n) => (
              <div key={n} className="task-card-skeleton">
                <div className="skeleton-line title"></div>
                <div className="skeleton-line desc"></div>
                <div className="skeleton-line footer"></div>
              </div>
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <div className="empty-state">
            <ListTodo size={48} className="empty-icon" />
            <h3>No tasks found</h3>
            <p>Try refining your search queries/filters or create a new task.</p>
            <button onClick={handleCreateOpen} className="btn btn-primary" style={{ marginTop: '1rem' }}>
              <Plus size={16} />
              <span>Create Task</span>
            </button>
          </div>
        ) : (
          <section className="task-grid">
            {tasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onEdit={handleEditOpen}
                onDelete={handleDeleteOpen}
              />
            ))}
          </section>
        )}
      </main>

      <Footer />

      {/* Task Create/Edit Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingTask ? 'Edit Task' : 'Create New Task'}</h2>
              <button onClick={() => setModalOpen(false)} className="btn-close-modal">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label htmlFor="taskTitle">Task Title</label>
                <input
                  id="taskTitle"
                  type="text"
                  className="form-control"
                  placeholder="E.g., Complete backend tests"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="taskDesc">Description</label>
                <textarea
                  id="taskDesc"
                  className="form-control"
                  rows="3"
                  placeholder="Provide task notes..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                ></textarea>
              </div>

              <div className="form-row-grid">
                <div className="form-group">
                  <label htmlFor="taskStatus">Status</label>
                  <select
                    id="taskStatus"
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="form-control"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="taskPriority">Priority</label>
                  <select
                    id="taskPriority"
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value)}
                    className="form-control"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="taskDueDate">Due Date</label>
                <input
                  id="taskDueDate"
                  type="date"
                  className="form-control"
                  value={formDueDate}
                  onChange={(e) => setFormDueDate(e.target.value)}
                  required
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingTask ? 'Update Task' : 'Add Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && (
        <div className="modal-overlay">
          <div className="modal-content modal-confirm">
            <h2>Delete Task</h2>
            <p>Are you sure you want to permanently remove this task? This action cannot be undone.</p>
            <div className="modal-actions">
              <button
                onClick={() => setDeleteConfirmOpen(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button onClick={handleConfirmDelete} className="btn btn-danger">
                Delete Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
