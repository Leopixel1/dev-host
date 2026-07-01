import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Editor from '@monaco-editor/react';
import { ArrowLeft, Save, FilePlus, Code, Layout, Globe, ExternalLink } from 'lucide-react';

function ProjectEditor() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [files, setFiles] = useState([]);
  const [activeFile, setActiveFile] = useState(null);
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [newFileName, setNewFileName] = useState('');

  useEffect(() => {
    fetchProjectAndFiles();
  }, [id]);

  const fetchProjectAndFiles = async () => {
    try {
      const projRes = await axios.get(`/api/projects/${id}`);
      setProject(projRes.data);

      const filesRes = await axios.get(`/api/files/${id}`);
      setFiles(filesRes.data);

      if (filesRes.data.length > 0) {
        // Find index.html or fallback to the first file
        const indexFile = filesRes.data.find(f => f.path === '/index.html') || filesRes.data[0];
        loadFile(indexFile.path);
      }
    } catch (err) {
      console.error('Error fetching data', err);
    }
  };

  const loadFile = async (path) => {
    try {
      const res = await axios.get(`/api/files/${id}/content?path=${encodeURIComponent(path)}`);
      setContent(res.data.content);
      setActiveFile(path);
      setSaveStatus('');
    } catch (err) {
      console.error('Error loading file', err);
    }
  };

  const saveFile = async () => {
    if (!activeFile) return;
    setIsSaving(true);
    setSaveStatus('Saving...');
    try {
      await axios.put(`/api/files/${id}`, { path: activeFile, content });
      setSaveStatus('Saved');
      setTimeout(() => setSaveStatus(''), 2000);
      fetchProjectAndFiles(); // Refresh file list to update timestamps
    } catch (err) {
      console.error('Error saving file', err);
      setSaveStatus('Error saving');
    } finally {
      setIsSaving(false);
    }
  };

  const createNewFile = async (e) => {
    e.preventDefault();
    if (!newFileName) return;

    let path = newFileName;
    if (!path.startsWith('/')) {
      path = '/' + path;
    }

    try {
      await axios.put(`/api/files/${id}`, { path, content: '' });
      setIsCreatingFile(false);
      setNewFileName('');
      await fetchProjectAndFiles();
      loadFile(path);
    } catch (err) {
      console.error('Error creating file', err);
    }
  };

  const getLanguage = (path) => {
    if (!path) return 'plaintext';
    if (path.endsWith('.js')) return 'javascript';
    if (path.endsWith('.css')) return 'css';
    if (path.endsWith('.html')) return 'html';
    if (path.endsWith('.json')) return 'json';
    return 'plaintext';
  };

  if (!project) return <div className="p-8 flex justify-center items-center h-screen">Loading...</div>;

  return (
    <div className="flex h-screen bg-[#1e1e1e] text-gray-300 font-sans overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-[#252526] border-r border-[#333333] flex flex-col">
        <div className="p-4 border-b border-[#333333] flex items-center justify-between">
          <Link to="/" className="text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="font-semibold text-white truncate px-2">{project.name}</div>
          <a
            href={`http://${project.subdomain}.localhost:3000`}
            target="_blank"
            rel="noreferrer"
            className="text-gray-400 hover:text-blue-400 transition-colors"
            title="Open Site"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        <div className="p-4 flex-grow overflow-y-auto">
          <div className="flex justify-between items-center mb-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
            <span>Files</span>
            <button
              onClick={() => setIsCreatingFile(true)}
              className="hover:text-white transition-colors"
              title="New File"
            >
              <FilePlus className="w-4 h-4" />
            </button>
          </div>

          {isCreatingFile && (
            <form onSubmit={createNewFile} className="mb-2">
              <input
                autoFocus
                type="text"
                className="w-full bg-[#3c3c3c] border border-blue-500 rounded px-2 py-1 text-sm text-white outline-none"
                placeholder="filename.html"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                onBlur={() => setIsCreatingFile(false)}
              />
            </form>
          )}

          <ul className="space-y-1">
            {files.map((file) => (
              <li key={file.path}>
                <button
                  onClick={() => loadFile(file.path)}
                  className={`w-full text-left px-2 py-1.5 rounded text-sm flex items-center gap-2 transition-colors ${
                    activeFile === file.path
                      ? 'bg-[#37373d] text-white'
                      : 'text-gray-400 hover:bg-[#2a2d2e] hover:text-gray-200'
                  }`}
                >
                  {file.path.endsWith('.html') ? <Layout className="w-4 h-4 text-orange-400" /> :
                   file.path.endsWith('.css') ? <Code className="w-4 h-4 text-blue-400" /> :
                   file.path.endsWith('.js') ? <Code className="w-4 h-4 text-yellow-400" /> :
                   <Code className="w-4 h-4 text-gray-400" />}
                  <span className="truncate">{file.path}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex-grow flex flex-col bg-[#1e1e1e]">
        {activeFile ? (
          <>
            <div className="h-12 bg-[#2d2d2d] flex items-center justify-between px-4 border-b border-[#1e1e1e]">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-400">{project.name}</span>
                <span className="text-gray-600">/</span>
                <span className="text-white font-medium">{activeFile}</span>
              </div>
              <div className="flex items-center gap-4">
                {saveStatus && <span className="text-sm text-gray-400">{saveStatus}</span>}
                <button
                  onClick={saveFile}
                  disabled={isSaving}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  Save
                </button>
              </div>
            </div>
            <div className="flex-grow relative">
              <Editor
                height="100%"
                language={getLanguage(activeFile)}
                theme="vs-dark"
                value={content}
                onChange={(value) => {
                  setContent(value);
                  if (saveStatus === 'Saved') setSaveStatus(''); // Clear saved status on change
                }}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  wordWrap: 'on',
                  padding: { top: 16 },
                }}
              />
            </div>
          </>
        ) : (
          <div className="flex-grow flex flex-col items-center justify-center text-gray-500">
            <Globe className="w-16 h-16 mb-4 opacity-20" />
            <p>Select a file to start editing</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProjectEditor;
