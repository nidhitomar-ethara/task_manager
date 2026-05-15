import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService } from '../../services/endpoints';
import { isOverdue, formatDate, getStatusBadge } from '../../utils/helpers';
import { HiOutlineBriefcase, HiOutlineClipboardList, HiOutlineCheckCircle, HiOutlineClock } from 'react-icons/hi';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await dashboardService.getStats();
      setStats(res.data.data);
    } catch (error) {
      console.error('Failed to fetch dashboard stats', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-loader">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="container dashboard-container animate-fade-in">
      <div className="dashboard-header">
        <h1>Dashboard Overview</h1>
        <p>Welcome back! Here's what's happening with your projects today.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card glass-card">
          <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary-400)' }}>
            <HiOutlineBriefcase size={24} />
          </div>
          <div className="stat-details">
            <p className="stat-label">Total Projects</p>
            <h3 className="stat-value">{stats?.totalProjects || 0}</h3>
          </div>
        </div>

        <div className="stat-card glass-card">
          <div className="stat-icon" style={{ background: 'rgba(14, 165, 233, 0.15)', color: 'var(--info-400)' }}>
            <HiOutlineClipboardList size={24} />
          </div>
          <div className="stat-details">
            <p className="stat-label">Total Tasks</p>
            <h3 className="stat-value">{stats?.totalTasks || 0}</h3>
          </div>
        </div>

        <div className="stat-card glass-card">
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-400)' }}>
            <HiOutlineCheckCircle size={24} />
          </div>
          <div className="stat-details">
            <p className="stat-label">Completed Tasks</p>
            <h3 className="stat-value">{stats?.doneTasks || 0}</h3>
          </div>
        </div>

        <div className="stat-card glass-card">
          <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.15)', color: 'var(--danger-400)' }}>
            <HiOutlineClock size={24} />
          </div>
          <div className="stat-details">
            <p className="stat-label">Overdue Tasks</p>
            <h3 className="stat-value">{stats?.overdueTasks || 0}</h3>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-section glass-card">
          <div className="section-header">
            <h2>My Assigned Tasks</h2>
          </div>
          <div className="task-list">
            {stats?.myTasks?.length > 0 ? (
              stats.myTasks.map((task) => (
                <div key={task._id} className="task-item">
                  <div className="task-info">
                    <h4>{task.title}</h4>
                    <p className="task-meta">
                      Project: {task.project?.name} • Due: {formatDate(task.dueDate) || 'No date'}
                    </p>
                  </div>
                  <span className={`badge ${getStatusBadge(task.status)}`}>
                    {task.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="empty-state">No tasks assigned to you right now.</p>
            )}
          </div>
        </div>

        <div className="dashboard-section glass-card">
          <div className="section-header">
            <h2>Recent Projects</h2>
            <Link to="/projects" className="btn btn-ghost btn-sm">View All</Link>
          </div>
          <div className="project-list">
            {stats?.recentProjects?.length > 0 ? (
              stats.recentProjects.map((project) => (
                <Link key={project._id} to={`/projects/${project._id}`} className="project-item">
                  <div className="project-icon">
                    <HiOutlineBriefcase size={20} />
                  </div>
                  <div className="project-info">
                    <h4>{project.name}</h4>
                    <p>{project.members?.length || 1} members</p>
                  </div>
                </Link>
              ))
            ) : (
              <p className="empty-state">You are not part of any projects yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
