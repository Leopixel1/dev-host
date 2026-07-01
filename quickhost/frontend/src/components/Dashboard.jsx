import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Plus, Globe, ExternalLink } from 'lucide-react';

function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', subdomain: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await axios.get('/api/projects');
      setProjects(response.data);
    } catch (err) {
      console.error('Failed to fetch projects', err);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await axios.post('/api/projects', newProject);
      setNewProject({ name: '', subdomain: '' });
      setIsCreating(false);
      fetchProjects();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create project');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-3">
            <Globe className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold tracking-tight">QuickHost</h1>
          </div>
          <button
            onClick={() => setIsCreating(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            New Project
          </button>
        </header>

        {isCreating && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md">
              <h2 className="text-2xl font-semibold mb-6">Create New Project</h2>
              {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
              <form onSubmit={handleCreateProject} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="My Awesome Site"
                    value={newProject.name}
                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subdomain</label>
                  <div className="flex items-center">
                    <input
                      type="text"
                      required
                      pattern="[a-z0-9-]+"
                      title="Only lowercase letters, numbers, and hyphens"
                      className="w-full px-4 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      placeholder="my-site"
                      value={newProject.subdomain}
                      onChange={(e) => setNewProject({ ...newProject, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                    />
                    <span className="px-4 py-2 bg-gray-100 border-y border-r border-gray-300 rounded-r-lg text-gray-500">
                      .localhost
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Only lowercase letters, numbers, and hyphens.</p>
                </div>
                <div className="flex justify-end gap-3 mt-8">
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-sm"
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {projects.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 shadow-sm">
            <Globe className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No projects yet</h3>
            <p className="text-gray-500 mb-6">Create your first project to get started with QuickHost.</p>
            <button
              onClick={() => setIsCreating(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium inline-flex items-center gap-2 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div key={project.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col group">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-gray-900 truncate pr-4">{project.name}</h3>
                  <a
                    href={`http://${project.subdomain}.localhost:3000`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-gray-400 hover:text-blue-600 transition-colors"
                    title="Open Site"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </a>
                </div>
                <div className="text-sm text-gray-500 mb-6 flex-grow">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-medium bg-blue-50 text-blue-700 border border-blue-100">
                    {project.subdomain}.localhost
                  </span>
                </div>
                <Link
                  to={`/project/${project.id}`}
                  className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium py-2 rounded-lg text-center border border-gray-200 transition-colors group-hover:border-blue-200 group-hover:bg-blue-50 group-hover:text-blue-700"
                >
                  Edit Project
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
