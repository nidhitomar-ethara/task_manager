import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { projectService } from '../../services/endpoints';
import { formatDate } from '../../utils/helpers';
import { HiPlus, HiOutlineBriefcase, HiOutlineUserGroup, HiOutlineClock } from 'react-icons/hi';
import toast from 'react-hot-toast';
import './Projects.css';

const ProjectsList = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await projectService.getAll();
      setProjects(res.data.data);
    } catch (error) {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await projectService.create(newProject);
      setProjects([res.data.data, ...projects]);
      setShowModal(false);
      setNewProject({ name: '', description: '' });
      toast.success('Project created successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create project');
    } finally {
      setSubmitting(false);
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
    <div className="container animate-fade-in projects-container">
      <div className="projects-header">
        <div>
          <h1>My Projects</h1>
          <p>Manage and track all your team projects in one place.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <HiPlus size={20} /> New Project
        </button>
      </div>

      <div className="projects-grid">
        {projects.length > 0 ? (
          projects.map((project) => (
            <Link key={project._id} to={`/projects/${project._id}`} className="project-card glass-card">
              <div className="project-card-icon">
                <HiOutlineBriefcase size={24} />
              </div>
              <h3 className="project-card-title">{project.name}</h3>
              <p className="project-card-desc">
                {project.description || 'No description provided.'}
              </p>
              
              <div className="project-card-footer">
                <div className="project-stat">
                  <HiOutlineUserGroup size={16} />
                  <span>{project.members.length} members</span>
                </div>
                <div className="project-stat">
                  <HiOutlineClock size={16} />
                  <span>Updated {formatDate(project.updatedAt)}</span>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="empty-state glass-card" style={{ gridColumn: '1 / -1' }}>
            <div className="empty-icon">
              <HiOutlineBriefcase size={48} />
            </div>
            <h3>No projects found</h3>
            <p>You haven't created or joined any projects yet.</p>
            <button className="btn btn-primary" onClick={() => setShowModal(true)} style={{ marginTop: '1rem' }}>
              Create your first project
            </button>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Create New Project</h2>
              <button className="btn-ghost" onClick={() => setShowModal(false)} style={{ fontSize: '1.5rem', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                &times;
              </button>
            </div>
            <form onSubmit={handleCreateProject}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Project Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={newProject.name}
                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                    placeholder="E.g., Website Redesign"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Description (Optional)</label>
                  <textarea
                    className="form-input form-textarea"
                    value={newProject.description}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                    placeholder="What is this project about?"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? <div className="loader loader-sm"></div> : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsList;
