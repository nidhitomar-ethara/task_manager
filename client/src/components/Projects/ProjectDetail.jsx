import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { projectService, taskService } from '../../services/endpoints';
import { useAuth } from '../../contexts/AuthContext';
import { getInitials, stringToColor, getPriorityBadge } from '../../utils/helpers';
import toast from 'react-hot-toast';
import { HiPlus, HiOutlineUserAdd, HiOutlineCog } from 'react-icons/hi';
import './ProjectDetail.css';

const ProjectDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'Medium', assignedTo: '' });
  
  const isAdmin = project?.members.find(m => m.user._id === user._id)?.role === 'Admin';

  useEffect(() => {
    fetchProjectAndTasks();
  }, [id]);

  const fetchProjectAndTasks = async () => {
    try {
      const [projectRes, tasksRes] = await Promise.all([
        projectService.getOne(id),
        taskService.getAll(id)
      ]);
      setProject(projectRes.data.data);
      setTasks(tasksRes.data.data);
    } catch (error) {
      toast.error('Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const res = await taskService.create(id, newTask);
      setTasks([res.data.data, ...tasks]);
      setShowTaskModal(false);
      setNewTask({ title: '', description: '', priority: 'Medium', assignedTo: '' });
      toast.success('Task created successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create task');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await taskService.updateStatus(id, taskId, { status: newStatus });
      setTasks(tasks.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
      toast.success('Status updated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  if (loading) {
    return <div className="page-loader"><div className="loader"></div></div>;
  }

  if (!project) return <div>Project not found</div>;

  const columns = ['To Do', 'In Progress', 'Done'];

  return (
    <div className="project-detail-container animate-fade-in container">
      <div className="project-header">
        <div className="project-header-left">
          <h1>{project.name}</h1>
          <p>{project.description}</p>
          <div className="project-members-avatars">
            {project.members.map((m) => (
              <div
                key={m.user._id}
                className="avatar avatar-sm"
                title={`${m.user.name} (${m.role})`}
                style={{ background: stringToColor(m.user.name) }}
              >
                {getInitials(m.user.name)}
              </div>
            ))}
            {isAdmin && (
              <button className="avatar avatar-sm add-member-btn" title="Manage Members">
                <HiOutlineUserAdd />
              </button>
            )}
          </div>
        </div>
        <div className="project-header-right">
          {isAdmin && (
            <button className="btn btn-primary" onClick={() => setShowTaskModal(true)}>
              <HiPlus size={20} /> New Task
            </button>
          )}
        </div>
      </div>

      <div className="kanban-board">
        {columns.map(colStatus => (
          <div key={colStatus} className="kanban-column glass-card">
            <div className="kanban-column-header">
              <h3>{colStatus}</h3>
              <span className="task-count">
                {tasks.filter(t => t.status === colStatus).length}
              </span>
            </div>
            <div className="kanban-tasks">
              {tasks.filter(t => t.status === colStatus).map(task => (
                <div key={task._id} className="kanban-task">
                  <div className="task-badges">
                    <span className={`badge ${getPriorityBadge(task.priority)}`}>{task.priority}</span>
                  </div>
                  <h4 className="task-title">{task.title}</h4>
                  {task.description && <p className="task-desc">{task.description}</p>}
                  
                  <div className="task-footer">
                    {task.assignedTo ? (
                      <div className="avatar avatar-sm" title={task.assignedTo.name} style={{ background: stringToColor(task.assignedTo.name) }}>
                        {getInitials(task.assignedTo.name)}
                      </div>
                    ) : (
                      <span className="unassigned">Unassigned</span>
                    )}
                    
                    <select
                      className="form-select status-select"
                      value={task.status}
                      onChange={(e) => handleStatusChange(task._id, e.target.value)}
                    >
                      <option value="To Do">To Do</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Done">Done</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {showTaskModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Create New Task</h2>
              <button className="btn-ghost" onClick={() => setShowTaskModal(false)} style={{ fontSize: '1.5rem', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>&times;</button>
            </div>
            <form onSubmit={handleCreateTask}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Task Title</label>
                  <input
                    type="text"
                    className="form-input"
                    value={newTask.title}
                    onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-input form-textarea"
                    value={newTask.description}
                    onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <select
                    className="form-select"
                    value={newTask.priority}
                    onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Assign To</label>
                  <select
                    className="form-select"
                    value={newTask.assignedTo}
                    onChange={(e) => setNewTask({...newTask, assignedTo: e.target.value})}
                  >
                    <option value="">Unassigned</option>
                    {project.members.map(m => (
                      <option key={m.user._id} value={m.user._id}>{m.user.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowTaskModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;
