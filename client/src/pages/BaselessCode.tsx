
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

interface CodeFile {
  id: string;
  name: string;
  content: string;
  language: string;
  path: string;
  isFolder: boolean;
  children?: CodeFile[];
}

interface CodeProject {
  id: number;
  name: string;
  description: string;
  language: string;
  framework: string;
  files: CodeFile[];
  isPublic: boolean;
}

export default function BaselessCode() {
  const [projects, setProjects] = useState<CodeProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<CodeProject | null>(null);
  const [selectedFile, setSelectedFile] = useState<CodeFile | null>(null);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [projectForm, setProjectForm] = useState({
    name: "",
    description: "",
    language: "javascript",
    framework: "",
  });
  const { toast } = useToast();

  // Mock initial projects
  useEffect(() => {
    const mockProjects: CodeProject[] = [
      {
        id: 1,
        name: "Personal Website",
        description: "My portfolio website built with React",
        language: "javascript",
        framework: "react",
        isPublic: true,
        files: [
          {
            id: "1",
            name: "index.html",
            content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Portfolio</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <header>
        <h1>Welcome to My Portfolio</h1>
        <nav>
            <a href="#about">About</a>
            <a href="#projects">Projects</a>
            <a href="#contact">Contact</a>
        </nav>
    </header>
    
    <main>
        <section id="about">
            <h2>About Me</h2>
            <p>I'm a passionate web developer...</p>
        </section>
        
        <section id="projects">
            <h2>My Projects</h2>
            <div class="project-grid">
                <!-- Projects will be loaded here -->
            </div>
        </section>
    </main>
    
    <script src="script.js"></script>
</body>
</html>`,
            language: "html",
            path: "/",
            isFolder: false,
          },
          {
            id: "2",
            name: "styles.css",
            content: `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Arial', sans-serif;
    line-height: 1.6;
    color: #333;
}

header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 2rem 0;
    text-align: center;
}

nav a {
    color: white;
    text-decoration: none;
    margin: 0 1rem;
    padding: 0.5rem 1rem;
    border-radius: 5px;
    transition: background 0.3s;
}

nav a:hover {
    background: rgba(255, 255, 255, 0.2);
}

.project-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    padding: 2rem;
}`,
            language: "css",
            path: "/",
            isFolder: false,
          },
          {
            id: "3",
            name: "script.js",
            content: `// Portfolio JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('nav a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Load projects dynamically
    loadProjects();
});

function loadProjects() {
    const projectGrid = document.querySelector('.project-grid');
    
    const projects = [
        {
            title: 'E-commerce Platform',
            description: 'A full-stack e-commerce solution',
            tech: ['React', 'Node.js', 'MongoDB']
        },
        {
            title: 'Task Management App',
            description: 'Collaborative task management tool',
            tech: ['Vue.js', 'Express', 'PostgreSQL']
        },
        {
            title: 'Weather Dashboard',
            description: 'Real-time weather monitoring',
            tech: ['JavaScript', 'Weather API', 'Chart.js']
        }
    ];
    
    projectGrid.innerHTML = projects.map(project => \`
        <div class="project-card">
            <h3>\${project.title}</h3>
            <p>\${project.description}</p>
            <div class="tech-stack">
                \${project.tech.map(tech => \`<span class="tech-tag">\${tech}</span>\`).join('')}
            </div>
        </div>
    \`).join('');
}`,
            language: "javascript",
            path: "/",
            isFolder: false,
          }
        ]
      }
    ];
    setProjects(mockProjects);
    setSelectedProject(mockProjects[0]);
  }, []);

  const getLanguageIcon = (language: string) => {
    const icons: { [key: string]: string } = {
      html: "fab fa-html5 text-orange-500",
      css: "fab fa-css3-alt text-blue-500",
      javascript: "fab fa-js-square text-yellow-500",
      typescript: "fab fa-js-square text-blue-600",
      python: "fab fa-python text-green-500",
      php: "fab fa-php text-purple-500",
      java: "fab fa-java text-red-500",
      react: "fab fa-react text-blue-400",
      vue: "fab fa-vuejs text-green-400",
      angular: "fab fa-angular text-red-600",
    };
    return icons[language] || "fas fa-file-code text-gray-500";
  };

  const createProject = () => {
    const newProject: CodeProject = {
      id: Date.now(),
      ...projectForm,
      files: [
        {
          id: "new-1",
          name: "index.html",
          content: "<!DOCTYPE html>\n<html>\n<head>\n    <title>New Project</title>\n</head>\n<body>\n    <h1>Hello World!</h1>\n</body>\n</html>",
          language: "html",
          path: "/",
          isFolder: false,
        }
      ],
      isPublic: false,
    };

    setProjects([...projects, newProject]);
    setSelectedProject(newProject);
    setProjectForm({ name: "", description: "", language: "javascript", framework: "" });
    setIsCreatingProject(false);
    toast({ title: "Project created successfully" });
  };

  const saveFile = () => {
    if (!selectedFile || !selectedProject) return;
    
    // Update the file content in the project
    const updatedProject = {
      ...selectedProject,
      files: selectedProject.files.map(file =>
        file.id === selectedFile.id ? selectedFile : file
      )
    };

    setProjects(projects.map(p => p.id === selectedProject.id ? updatedProject : p));
    setSelectedProject(updatedProject);
    toast({ title: "File saved successfully" });
  };

  const createNewFile = (name: string, language: string) => {
    if (!selectedProject) return;

    const newFile: CodeFile = {
      id: Date.now().toString(),
      name,
      content: getTemplateContent(language),
      language,
      path: "/",
      isFolder: false,
    };

    const updatedProject = {
      ...selectedProject,
      files: [...selectedProject.files, newFile]
    };

    setProjects(projects.map(p => p.id === selectedProject.id ? updatedProject : p));
    setSelectedProject(updatedProject);
    setSelectedFile(newFile);
    toast({ title: "File created successfully" });
  };

  const getTemplateContent = (language: string) => {
    const templates: { [key: string]: string } = {
      html: "<!DOCTYPE html>\n<html>\n<head>\n    <title>New File</title>\n</head>\n<body>\n    \n</body>\n</html>",
      css: "/* CSS Styles */\n\n",
      javascript: "// JavaScript Code\n\n",
      python: "# Python Code\n\n",
      php: "<?php\n// PHP Code\n\n?>",
    };
    return templates[language] || "";
  };

  const runCode = () => {
    if (!selectedProject) return;
    
    // Mock code execution
    toast({ title: "Code executed successfully", description: "Check the output panel for results" });
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold">Baseless Code</h1>
            {selectedProject && (
              <Badge variant="outline">
                <i className={getLanguageIcon(selectedProject.language) + " mr-2"}></i>
                {selectedProject.name}
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={runCode}>
              <i className="fas fa-play mr-2"></i>
              Run
            </Button>
            <Button variant="outline" size="sm" onClick={saveFile}>
              <i className="fas fa-save mr-2"></i>
              Save
            </Button>
            <Button size="sm" onClick={() => setIsCreatingProject(true)}>
              <i className="fas fa-plus mr-2"></i>
              New Project
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 border-r bg-gray-50">
          <Tabs defaultValue="projects" className="h-full">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="projects">Projects</TabsTrigger>
              <TabsTrigger value="files">Files</TabsTrigger>
            </TabsList>

            <TabsContent value="projects" className="h-full p-4">
              <div className="space-y-3">
                {projects.map((project) => (
                  <Card
                    key={project.id}
                    className={`cursor-pointer transition-colors ${
                      selectedProject?.id === project.id ? "border-blue-500 bg-blue-50" : "hover:bg-gray-100"
                    }`}
                    onClick={() => setSelectedProject(project)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium">{project.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <i className={getLanguageIcon(project.language)}></i>
                            <span className="text-xs text-gray-500 capitalize">
                              {project.language}
                              {project.framework && ` • ${project.framework}`}
                            </span>
                          </div>
                        </div>
                        {project.isPublic && (
                          <Badge variant="secondary" className="text-xs">
                            Public
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="files" className="h-full p-4">
              {selectedProject ? (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">Project Files</h3>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <i className="fas fa-plus"></i>
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Create New File</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="fileName">File Name</Label>
                            <Input id="fileName" placeholder="example.js" />
                          </div>
                          <div>
                            <Label htmlFor="fileLanguage">Language</Label>
                            <Select defaultValue="javascript">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="html">HTML</SelectItem>
                                <SelectItem value="css">CSS</SelectItem>
                                <SelectItem value="javascript">JavaScript</SelectItem>
                                <SelectItem value="typescript">TypeScript</SelectItem>
                                <SelectItem value="python">Python</SelectItem>
                                <SelectItem value="php">PHP</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <Button onClick={() => createNewFile("new-file.js", "javascript")}>
                            Create File
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                  {selectedProject.files.map((file) => (
                    <div
                      key={file.id}
                      className={`flex items-center space-x-2 p-2 rounded cursor-pointer transition-colors ${
                        selectedFile?.id === file.id ? "bg-blue-100" : "hover:bg-gray-100"
                      }`}
                      onClick={() => setSelectedFile(file)}
                    >
                      <i className={getLanguageIcon(file.language)}></i>
                      <span className="text-sm">{file.name}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <i className="fas fa-folder-open text-4xl mb-4"></i>
                  <p>Select a project to view files</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Main Editor */}
        <div className="flex-1 flex flex-col">
          {selectedFile ? (
            <>
              <div className="border-b p-2 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <i className={getLanguageIcon(selectedFile.language)}></i>
                  <span className="font-medium">{selectedFile.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <i className="fas fa-search"></i>
                  </Button>
                  <Button variant="ghost" size="sm">
                    <i className="fas fa-cog"></i>
                  </Button>
                </div>
              </div>
              <div className="flex-1 p-4">
                <Textarea
                  value={selectedFile.content}
                  onChange={(e) => setSelectedFile({ ...selectedFile, content: e.target.value })}
                  className="w-full h-full font-mono text-sm resize-none border-0 focus:ring-0"
                  placeholder="Start coding..."
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <i className="fas fa-code text-6xl mb-4"></i>
                <p>Select a file to start coding</p>
              </div>
            </div>
          )}
        </div>

        {/* Output Panel */}
        <div className="w-80 border-l bg-gray-50">
          <Tabs defaultValue="output" className="h-full">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="output">Output</TabsTrigger>
              <TabsTrigger value="terminal">Terminal</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>

            <TabsContent value="output" className="h-full p-4">
              <div className="font-mono text-sm">
                <div className="text-green-600">✓ Code executed successfully</div>
                <div className="text-gray-600 mt-2">Output will appear here...</div>
              </div>
            </TabsContent>

            <TabsContent value="terminal" className="h-full p-4">
              <div className="bg-black text-green-400 p-3 rounded font-mono text-sm">
                <div>$ npm install</div>
                <div>$ npm run dev</div>
                <div className="text-gray-400">Ready for commands...</div>
              </div>
            </TabsContent>

            <TabsContent value="preview" className="h-full p-4">
              <div className="border rounded h-full bg-white">
                <div className="p-4 text-center text-gray-500">
                  <i className="fas fa-eye text-4xl mb-4"></i>
                  <p>Live preview will appear here</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Create Project Dialog */}
      <Dialog open={isCreatingProject} onOpenChange={setIsCreatingProject}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="projectName">Project Name</Label>
              <Input
                id="projectName"
                value={projectForm.name}
                onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                placeholder="My Awesome Project"
              />
            </div>
            <div>
              <Label htmlFor="projectDescription">Description</Label>
              <Textarea
                id="projectDescription"
                value={projectForm.description}
                onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                placeholder="Describe your project..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="projectLanguage">Primary Language</Label>
                <Select value={projectForm.language} onValueChange={(value) => setProjectForm({ ...projectForm, language: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="html">HTML</SelectItem>
                    <SelectItem value="javascript">JavaScript</SelectItem>
                    <SelectItem value="typescript">TypeScript</SelectItem>
                    <SelectItem value="python">Python</SelectItem>
                    <SelectItem value="php">PHP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="projectFramework">Framework (Optional)</Label>
                <Select value={projectForm.framework} onValueChange={(value) => setProjectForm({ ...projectForm, framework: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="react">React</SelectItem>
                    <SelectItem value="vue">Vue.js</SelectItem>
                    <SelectItem value="angular">Angular</SelectItem>
                    <SelectItem value="express">Express.js</SelectItem>
                    <SelectItem value="django">Django</SelectItem>
                    <SelectItem value="laravel">Laravel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCreatingProject(false)}>
                Cancel
              </Button>
              <Button onClick={createProject}>
                Create Project
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
