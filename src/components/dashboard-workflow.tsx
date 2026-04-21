"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Bell,
  Bot,
  Check,
  Clock3,
  Download,
  ExternalLink,
  File,
  FileText,
  FolderOpen,
  FolderPlus,
  HardDrive,
  History,
  Home,
  Import,
  Mail,
  MessageSquare,
  Mic,
  MicOff,
  Plus,
  Presentation,
  Settings,
  Sparkles,
  Upload,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AuriferWordmark } from "@/components/ui/aurifer-wordmark";
import { cn } from "@/lib/utils";
import { VercelV0Chat } from "@/components/ui/v0-ai-chat";
import WorkspaceForm from "@/components/ui/form-layout";
import AnalysisWorkspace from "@/components/analysis-workspace";

type ChatMessage = {
  author: string;
  time: string;
  message: string;
  isUser: boolean;
  kind?: "text" | "context-file";
  fileName?: string;
};

type ProjectDetails = {
  projectId: string;
  projectName: string;
  clientName: string;
  projectContext: string;
  documentType: string;
  prompt: string;
  referenceFiles: string[];
};

type BrowserSpeechRecognitionResult = {
  isFinal: boolean;
  0: {
    transcript: string;
  };
};

type BrowserSpeechRecognitionEvent = {
  resultIndex: number;
  results: ArrayLike<BrowserSpeechRecognitionResult>;
};

type BrowserSpeechRecognitionErrorEvent = {
  error: string;
};

type BrowserSpeechRecognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onstart: null | (() => void);
  onresult: null | ((event: BrowserSpeechRecognitionEvent) => void);
  onerror: null | ((event: BrowserSpeechRecognitionErrorEvent) => void);
  onend: null | (() => void);
  start: () => void;
  stop: () => void;
};

type BrowserSpeechRecognitionConstructor = new () => BrowserSpeechRecognition;

const createProjectId = () =>
  `AUR-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 99999)).padStart(5, "0")}`;

export default function DashboardWorkflow() {
  const searchParams = useSearchParams();

  const WORD_LIMITS = {
    projectName: 30,
    clientName: 20,
    projectContext: 100,
    prompt: 200,
  } as const;

  const [activeSection, setActiveSection] = useState<"overview" | "create-project" | "chatbot" | "finalize" | "templates" | "settings" | "analysis-workspace">("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentProjectDetails, setCurrentProjectDetails] = useState<ProjectDetails | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  
  // Settings state
  const [activeTemplateForProcess, setActiveTemplateForProcess] = useState<Record<TemplateType, boolean>>({
    Memo: true,
    Deck: true,
    Email: true,
  });
  const [selectedTemplateForProcessing, setSelectedTemplateForProcessing] = useState<Record<TemplateType, string>>({
    Memo: "default",
    Deck: "default",
    Email: "default",
  });
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [aiModel, setAiModel] = useState("gpt-4");
  const [defaultLanguage, setDefaultLanguage] = useState("en");
  const [nameFormat, setNameFormat] = useState<"formal" | "conservative" | "advisory">("formal");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [autoGenerateSummary, setAutoGenerateSummary] = useState(false);
  
  // Dropbox integration state
  const [dropboxConnected, setDropboxConnected] = useState(false);
  const [dropboxLoading, setDropboxLoading] = useState(false);
  const [selectedDropboxFolder, setSelectedDropboxFolder] = useState<string>("all");
  const [dropboxFolders, setDropboxFolders] = useState<string[]>([]);
  const [dropboxFiles, setDropboxFiles] = useState<Array<{
    id: string;
    name: string;
    type: string;
    size: string;
    modified: string;
    folderName: string;
    projectId?: string;
  }>>([]);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  
  // Current user ID (in production, get from auth session)
  const currentUserId = "user-123";
  
  // Template management state
  type TemplateType = "Memo" | "Deck" | "Email";
  const [templates, setTemplates] = useState<Record<TemplateType, { content: string; fileName: string; uploadedAt: string } | null>>({
    Memo: null,
    Deck: null,
    Email: null,
  });
  const [activeTemplateTab, setActiveTemplateTab] = useState<TemplateType>("Memo");
  const [uploadingTemplate, setUploadingTemplate] = useState(false);
  
  // Project form state
  const [projectData, setProjectData] = useState(() => ({
    clientName: "",
    projectName: "",
    projectContext: "",
    documentType: "",
    projectId: "",
    prompt: "",
    referenceFiles: [] as string[],
  }));
  
  // Toggle button state for project form
  const [autoGenerateEnabled, setAutoGenerateEnabled] = useState(true);
  
  // Document version history for download
  const [documentVersions, setDocumentVersions] = useState<Array<{version: number; content: string; timestamp: Date}>>([]);
  const [currentVersion, setCurrentVersion] = useState(1);
  
  // Speech-to-text state
  const [isListening, setIsListening] = useState(false);
  const [chatInputValue, setChatInputValue] = useState("");
  const speechRecognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const shouldRestartSpeechRef = useRef(false);
  const isListeningRef = useRef(false);
  const microphoneReadyRef = useRef(false);
  const speechBaseTextRef = useRef("");
  const chatInputValueRef = useRef("");
  const chatTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  const [wordLimitAlertsShown, setWordLimitAlertsShown] = useState<Record<string, boolean>>({});

  const countWords = (value: string) =>
    value.trim() ? value.trim().split(/\s+/).length : 0;

  const limitWords = (value: string, limit: number) => {
    const words = value.trim().split(/\s+/).filter(Boolean);
    if (words.length <= limit) {
      return value;
    }
    return words.slice(0, limit).join(" ");
  };

  const handleLimitedFieldChange = (
    field: "projectName" | "clientName" | "projectContext" | "prompt",
    value: string
  ) => {
    const limit = WORD_LIMITS[field];
    const words = countWords(value);
    const reachedLimit = words >= limit;
    const exceeded = words > limit;

    if (reachedLimit && !wordLimitAlertsShown[field]) {
      window.alert(`You have reached the word limit for ${field}. Max allowed is ${limit} words.`);
      setWordLimitAlertsShown((prev) => ({ ...prev, [field]: true }));
    }

    if (!reachedLimit && wordLimitAlertsShown[field]) {
      setWordLimitAlertsShown((prev) => ({ ...prev, [field]: false }));
    }

    setProjectData((prev) => ({
      ...prev,
      [field]: exceeded ? limitWords(value, limit) : value,
    }));
  };

  const isFieldAtLimit = (field: "projectName" | "clientName" | "projectContext" | "prompt") => {
    return countWords(projectData[field]) >= WORD_LIMITS[field];
  };

  // Template management functions
  const handleTemplateUpload = (templateType: TemplateType, file: File) => {
    setUploadingTemplate(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setTemplates((prev) => ({
        ...prev,
        [templateType]: {
          content,
          fileName: file.name,
          uploadedAt: new Date().toLocaleString("en-US", { 
            month: "short", 
            day: "numeric", 
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
          }),
        },
      }));
      setUploadingTemplate(false);
      window.alert(`${templateType} template uploaded successfully!`);
    };
    reader.readAsText(file);
  };

  const handleRemoveTemplate = (templateType: TemplateType) => {
    if (window.confirm(`Are you sure you want to remove the ${templateType} template?`)) {
      setTemplates((prev) => ({
        ...prev,
        [templateType]: null,
      }));
    }
  };

  // Chat messages grouped by project id
  const [chatMessagesByProject, setChatMessagesByProject] = useState<Record<string, ChatMessage[]>>({});
  const [selectedChatProjectId, setSelectedChatProjectId] = useState("AUR-2026-12345");

  // Memo preview state
  const [memoContent, setMemoContent] = useState("");

  // Generated documents state
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);

  // Projects list state
  const [projects, setProjects] = useState([
    { id: 1, title: "GST Return FY2025", client: "Meridian Corp", status: "Completed", date: "Apr 8, 2026", progress: 100, projectId: "AUR-2026-12345", referenceFiles: ["gst-guidelines-2025.pdf", "meridian-financials.xlsx"] },
    { id: 2, title: "VAT Compliance EU", client: "BlueWave Tech", status: "In Progress", date: "Apr 5, 2026", progress: 75, projectId: "AUR-2026-12346", referenceFiles: ["vat-regulations.docx", "compliance-checklist.pdf", "bluewave-data.xlsx"] },
    { id: 3, title: "Vendor Contracts", client: "Nexus Logistics", status: "Draft", date: "Mar 28, 2026", progress: 45, projectId: "AUR-2026-12347", referenceFiles: ["contract-template.docx", "vendor-agreement.pdf"] },
    { id: 4, title: "Transfer Pricing", client: "Orion Capital", status: "In Review", date: "Mar 20, 2026", progress: 85, projectId: "AUR-2026-12348", referenceFiles: ["pricing-policy.pdf", "financial-report.xlsx", "tax-regulations.docx", "analysis-notes.txt"] },
  ]);
  const [trendRange, setTrendRange] = useState<"7d" | "30d">("7d");
  const [hoveredTrendIndex, setHoveredTrendIndex] = useState<number | null>(null);
  const [hoveredActivityIndex, setHoveredActivityIndex] = useState<number | null>(null);
  const [activeMixType, setActiveMixType] = useState<"Memo" | "Deck" | "Email">("Memo");
  
  // Search states
  const [projectSearch, setProjectSearch] = useState("");
  const [documentSearch, setDocumentSearch] = useState("");
  const [documentTypeFilter, setDocumentTypeFilter] = useState<string>("all");
  const [documentStatusFilter, setDocumentStatusFilter] = useState<string>("all");
  
  // Pagination states
  const [projectCurrentPage, setProjectCurrentPage] = useState(1);
  const [documentCurrentPage, setDocumentCurrentPage] = useState(1);
  const [dropboxCurrentPage, setDropboxCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const lightRoseCardBg = darkMode
    ? "bg-gradient-to-br from-[#241d18] via-[#1e1915] to-[#181411]"
    : "bg-gradient-to-br from-white via-[#fffaf7] to-[#fff2e9]";
  const lightRoseSurfaceBg = darkMode
    ? "bg-gradient-to-r from-[#2b231d] to-[#211b16]"
    : "bg-gradient-to-r from-[#fff8f3] to-[#fff1e8]";
  const shellBg = darkMode
    ? "bg-[radial-gradient(circle_at_top_left,rgba(243,179,114,0.08),transparent_22%),radial-gradient(circle_at_top_right,rgba(234,140,71,0.06),transparent_28%),linear-gradient(180deg,#15110f_0%,#1b1512_45%,#110e0c_100%)]"
    : "bg-[#fafafa]";
  const sidebarBg = darkMode
    ? "bg-gradient-to-b from-[#1d1815] via-[#241d18] to-[#171311] border-[#4d3b2c]"
    : "bg-white border-slate-200";
  const borderTone = darkMode ? "border-[#4d3b2c]" : "border-slate-200";
  const panelBg = darkMode
    ? "bg-gradient-to-br from-[#241d18] via-[#1e1915] to-[#181411]"
    : "bg-gradient-to-br from-white via-[#fffaf7] to-[#fff2e9]";
  const panelHeaderBg = darkMode
    ? "bg-gradient-to-r from-[#2b221c] via-[#342821] to-[#231c17]"
    : "bg-gradient-to-r from-slate-50 to-white";
  const textPrimary = darkMode ? "text-[#f6ede5]" : "text-[#000000]";
  const textSecondary = darkMode ? "text-[#decbbb]" : "text-slate-700";
  const textMuted = darkMode ? "text-[#b79f8b]" : "text-slate-500";
  const inputTone = darkMode
    ? "border-[#5d4737] bg-[#171310] text-[#f6ede5] placeholder:text-[#b79f8b]"
    : "border-slate-300 bg-white text-[#000000] placeholder:text-slate-500";
  const neutralButtonTone = darkMode
    ? "border-[#5d4737] bg-[#1d1713] text-[#f1e4d8] hover:border-[#ea8c47] hover:text-[#f3b372] hover:bg-[#2a211c]"
    : "border-slate-300 bg-white text-slate-700 hover:border-[#ea8c47] hover:text-[#ea8c47]";
  const tableHeaderTone = darkMode
    ? "bg-gradient-to-r from-[#241d18] to-[#1d1713] border-[#4d3b2c]"
    : "bg-white border-slate-200";
  const tableRowTone = darkMode
    ? "border-[#433327] hover:bg-[#2a211c]"
    : "border-slate-200 hover:bg-slate-50";
  const statusChipTone = darkMode
    ? "bg-[#f3b372]/10 text-[#f3b372] border border-[#ea8c47]/35"
    : "bg-gradient-to-r from-[#ea8c47]/20 to-[#f3b372]/20 text-[#ea8c47] border border-[#ea8c47]/30";

  const documentTypes = ["Memo", "Deck", "Email"] as const;
  const documents = projects.flatMap((project) =>
    documentTypes.map((type) => ({
      projectId: project.projectId,
      projectName: project.title,
      type,
      status: project.status === "Completed" ? "Finalized" : "In Progress",
    }))
  );
  const mixCount = {
    Memo: documents.filter((d) => d.type === "Memo").length,
    Deck: documents.filter((d) => d.type === "Deck").length,
    Email: documents.filter((d) => d.type === "Email").length,
  };
  const totalDocs = Math.max(documents.length, 1);
  const mixPercent = {
    Memo: Math.round((mixCount.Memo / totalDocs) * 100),
    Deck: Math.round((mixCount.Deck / totalDocs) * 100),
    Email: Math.round((mixCount.Email / totalDocs) * 100),
  };

  const inProgressCount = projects.filter((p) => p.status !== "Completed").length;
  const completedCount = projects.filter((p) => p.status === "Completed").length;
  const avgProgress = Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / Math.max(projects.length, 1));
  const completedDocuments = documents.filter((d) => d.status === "Finalized").length;

  // Filtered projects (only in-progress) with search
  const inProgressProjects = projects.filter((p) => p.status !== "Completed");
  const filteredProjects = inProgressProjects.filter(
    (p) =>
      p.title.toLowerCase().includes(projectSearch.toLowerCase()) ||
      p.client.toLowerCase().includes(projectSearch.toLowerCase()) ||
      p.projectId.toLowerCase().includes(projectSearch.toLowerCase())
  );

  // Filtered documents with search and filters
  const filteredDocuments = documents.filter(
    (d) =>
      (documentTypeFilter === "all" || d.type === documentTypeFilter) &&
      (documentStatusFilter === "all" || d.status === documentStatusFilter) &&
      (d.projectId.toLowerCase().includes(documentSearch.toLowerCase()) ||
      d.projectName.toLowerCase().includes(documentSearch.toLowerCase()) ||
      d.type.toLowerCase().includes(documentSearch.toLowerCase()) ||
      d.status.toLowerCase().includes(documentSearch.toLowerCase()))
  );

  // Filtered Dropbox files
  const filteredDropboxFiles = dropboxFiles.filter(
    f => selectedDropboxFolder === 'all' || f.folderName === selectedDropboxFolder
  );

  // Pagination logic
  const paginatedProjects = filteredProjects.slice(
    (projectCurrentPage - 1) * itemsPerPage,
    projectCurrentPage * itemsPerPage
  );
  const totalProjectPages = Math.ceil(filteredProjects.length / itemsPerPage);

  const paginatedDocuments = filteredDocuments.slice(
    (documentCurrentPage - 1) * itemsPerPage,
    documentCurrentPage * itemsPerPage
  );
  const totalDocumentPages = Math.ceil(filteredDocuments.length / itemsPerPage);

  const paginatedDropboxFiles = filteredDropboxFiles.slice(
    (dropboxCurrentPage - 1) * itemsPerPage,
    dropboxCurrentPage * itemsPerPage
  );
  const totalDropboxPages = Math.ceil(filteredDropboxFiles.length / itemsPerPage);

  // Reset to page 1 when filters change
  const handleProjectSearchChange = (value: string) => {
    setProjectSearch(value);
    setProjectCurrentPage(1);
  };

  const handleDocumentSearchChange = (value: string) => {
    setDocumentSearch(value);
    setDocumentCurrentPage(1);
  };

  const handleDocumentTypeFilterChange = (value: string | null) => {
    if (value) {
      setDocumentTypeFilter(value);
      setDocumentCurrentPage(1);
    }
  };

  const handleDocumentStatusFilterChange = (value: string | null) => {
    if (value) {
      setDocumentStatusFilter(value);
      setDocumentCurrentPage(1);
    }
  };

  const handleDropboxFolderChange = (value: string | null) => {
    if (value) {
      setSelectedDropboxFolder(value);
      setDropboxCurrentPage(1);
    }
  };

  const trendLabels = trendRange === "7d"
    ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    : ["W1", "W2", "W3", "W4"];
  const trendValues = trendRange === "7d" ? [42, 48, 45, 58, 62, 57, 69] : [49, 58, 62, 71];
  const activityValues = trendRange === "7d" ? [18, 24, 20, 28, 34, 30, 38] : [22, 29, 33, 40];

  const sidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: Home, target: "overview" as const },
    { id: "projects", label: "Projects", icon: FolderOpen, target: "create-project" as const },
    { id: "documents", label: "AI Chatbot", icon: Bot, target: "chatbot" as const },
    { id: "history", label: "Export", icon: Download, target: "finalize" as const },
    { id: "templates", label: "Templates", icon: File, target: "templates" as const },
    { id: "settings", label: "Settings", icon: Settings, target: "settings" as const },
  ];

  const selectedChatProject = projects.find((project) => project.projectId === selectedChatProjectId);
  const activeChatMessages = selectedChatProjectId ? (chatMessagesByProject[selectedChatProjectId] ?? []) : [];
  
  // ALWAYS filter Dropbox files by all project details - hardcoded to show when project is selected
  const projectFilesFromDatabase = selectedChatProject
    ? dropboxFiles.filter(
        (file) =>
          file.projectId === selectedChatProjectId ||
          file.name.toLowerCase().includes(selectedChatProject.title.toLowerCase()) ||
          file.name.toLowerCase().includes(selectedChatProject.client.toLowerCase()) ||
          selectedChatProject.title.toLowerCase().includes(file.name.toLowerCase().split('.')[0]) ||
          selectedChatProject.client.toLowerCase().includes(file.name.toLowerCase().split('.')[0])
      )
    : [];
  const exportOptions = [
    { id: "memo", title: "Advisory Memo", format: "DOCX / PDF", icon: FileText, color: "from-[#ea8c47] to-[#f3b372]" },
    { id: "deck", title: "Presentation Deck", format: "PPTX", icon: Presentation, color: "from-[#000000] to-[#424242]" },
    { id: "email", title: "Client Email Draft", format: "MSG / EML", icon: Mail, color: "from-[#424242] to-[#000000]" },
    { id: "summary", title: "Executive Summary", format: "PDF", icon: History, color: "from-[#f3b372] to-[#ea8c47]" },
  ] as const;
  const allExportIds = exportOptions.map((option) => option.id);
  const selectedExportItems = exportOptions.filter((option) => selectedDocuments.includes(option.id));

  const sendChatMessage = (messageText: string) => {
    if (!selectedChatProjectId || !messageText.trim()) return;

    const newMsg = {
      author: "Consultant",
      time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      message: messageText,
      isUser: true,
      kind: "text" as const,
    };

    setChatMessagesByProject((prev) => ({
      ...prev,
      [selectedChatProjectId]: [...(prev[selectedChatProjectId] ?? []), newMsg],
    }));

    setTimeout(() => {
      // Get project name for file search
      const projectName = selectedChatProject?.title ?? "";
      
      const aiResponse = {
        author: "Tax Expert AI",
        time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        message:
          `I'm searching the database for files related to "${projectName}" and reviewing your request. I will prepare a structured draft based on the project documents.`,
        isUser: false,
        kind: "text" as const,
      };
      setChatMessagesByProject((prev) => ({
        ...prev,
        [selectedChatProjectId]: [...(prev[selectedChatProjectId] ?? []), aiResponse],
      }));
      if (!memoContent) {
        setMemoContent(
          `<h1>Draft for ${selectedChatProject?.client ?? projectData.clientName}</h1><p>${messageText}</p><p>AI suggestions will appear here as the conversation evolves.</p>`
        );
      }
    }, 1000);
  };

  const attachContextFileToChat = (file: File) => {
    // File attachment is now disabled - files are searched from database by project name
    if (!selectedChatProjectId) return;

    const projectName = selectedChatProject?.title ?? "";
    
    const fileMsg: ChatMessage = {
      author: "Consultant",
      time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      message: `Searching database for project: ${projectName}`,
      isUser: true,
      kind: "context-file",
      fileName: projectName,
    };

    setChatMessagesByProject((prev) => ({
      ...prev,
      [selectedChatProjectId]: [...(prev[selectedChatProjectId] ?? []), fileMsg],
    }));

    setTimeout(() => {
      const ack: ChatMessage = {
        author: "Tax Expert AI",
        time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        message: `I'm searching the database for files related to "${projectName}" and will use them in drafting.`,
        isUser: false,
        kind: "text",
      };
      setChatMessagesByProject((prev) => ({
        ...prev,
        [selectedChatProjectId]: [...(prev[selectedChatProjectId] ?? []), ack],
      }));
    }, 600);
  };

  // Download document function
  const downloadDocument = () => {
    if (!memoContent) {
      window.alert('No document content to download');
      return;
    }

    // Create a simple HTML format that Word can open
    const content = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset="utf-8">
  <title>${projectData.projectName || 'Document'}</title>
  <style>
    body { font-family: 'Calibri', 'Arial', sans-serif; font-size: 11pt; line-height: 1.6; margin: 72px; }
    h1 { font-size: 18pt; color: #000000; border-bottom: 2px solid #ea8c47; padding-bottom: 6pt; margin-top: 18pt; }
    h2 { font-size: 14pt; color: #333333; margin-top: 14pt; }
    h3 { font-size: 12pt; color: #555555; margin-top: 12pt; }
    p { margin: 6pt 0; }
  </style>
</head>
<body>
${memoContent}
</body>
</html>`;

    const blob = new Blob(['\ufeff', content], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectData.projectName || 'document'}_v${currentVersion}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Save version
    setDocumentVersions(prev => [...prev, {
      version: currentVersion,
      content: memoContent,
      timestamp: new Date()
    }]);
    setCurrentVersion(prev => prev + 1);
  };

  const normalizeTranscriptSpacing = (value: string) =>
    value.replace(/\s+/g, " ").replace(/\s+([,.!?;:])/g, "$1").trim();

  const syncSpeechTranscript = (nextValue: string) => {
    const normalized = normalizeTranscriptSpacing(nextValue);
    setChatInputValue(normalized);

    window.requestAnimationFrame(() => {
      chatTextareaRef.current?.focus();
      const position = normalized.length;
      chatTextareaRef.current?.setSelectionRange(position, position);
    });
  };

  const getSpeechRecognitionConstructor = () => {
    const recognitionWindow = window as Window & {
      SpeechRecognition?: BrowserSpeechRecognitionConstructor;
      webkitSpeechRecognition?: BrowserSpeechRecognitionConstructor;
    };
    return recognitionWindow.SpeechRecognition || recognitionWindow.webkitSpeechRecognition;
  };

  const ensureMicrophoneAccess = async () => {
    if (microphoneReadyRef.current) {
      return true;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      window.alert('Microphone access is not available in this browser.');
      return false;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      microphoneReadyRef.current = true;
      return true;
    } catch (error) {
      console.error('Microphone permission error:', error);
      window.alert('Microphone access is blocked. Please allow microphone access and try again.');
      return false;
    }
  };

  const stopSpeechToText = () => {
    shouldRestartSpeechRef.current = false;
    speechRecognitionRef.current?.stop();
  };

  const startSpeechToText = async () => {
    const SpeechRecognition = getSpeechRecognitionConstructor();

    if (!SpeechRecognition) {
      window.alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    if (speechRecognitionRef.current) {
      return;
    }

    const hasMicrophoneAccess = await ensureMicrophoneAccess();
    if (!hasMicrophoneAccess) {
      return;
    }

    const recognition = new SpeechRecognition();
    speechRecognitionRef.current = recognition;
    speechBaseTextRef.current = chatInputValueRef.current.trim();
    shouldRestartSpeechRef.current = true;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = navigator.language || 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      isListeningRef.current = true;
      setIsListening(true);
      chatTextareaRef.current?.focus();
    };

    recognition.onresult = (event: BrowserSpeechRecognitionEvent) => {
      let finalTranscript = "";
      let interimTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + " ";
        } else {
          interimTranscript += event.results[i][0].transcript + " ";
        }
      }

      if (finalTranscript.trim()) {
        const combinedFinal = `${speechBaseTextRef.current} ${finalTranscript.trim()}`.trim();
        speechBaseTextRef.current = combinedFinal;
        syncSpeechTranscript(combinedFinal);
      }

      const liveTranscript = `${speechBaseTextRef.current} ${interimTranscript.trim()}`.trim();
      syncSpeechTranscript(liveTranscript || speechBaseTextRef.current);
    };

    recognition.onerror = (event: BrowserSpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        shouldRestartSpeechRef.current = false;
        microphoneReadyRef.current = false;
        window.alert('Microphone access denied. Please allow microphone access.');
      } else if (event.error === 'audio-capture') {
        shouldRestartSpeechRef.current = false;
        microphoneReadyRef.current = false;
        window.alert('No microphone was detected. Please connect a microphone and try again.');
      }
    };

    recognition.onend = () => {
      speechRecognitionRef.current = null;
      isListeningRef.current = false;
      setIsListening(false);
      speechBaseTextRef.current = normalizeTranscriptSpacing(chatInputValueRef.current);
      if (shouldRestartSpeechRef.current) {
        window.setTimeout(() => {
          if (!speechRecognitionRef.current && shouldRestartSpeechRef.current) {
            void startSpeechToText();
          }
        }, 250);
      }
    };

    recognition.start();
  };

  // Speech-to-text function
  const toggleSpeechToText = async () => {
    if (isListeningRef.current || speechRecognitionRef.current) {
      stopSpeechToText();
      return;
    }

    await startSpeechToText();
  };

  useEffect(() => {
    chatInputValueRef.current = chatInputValue;
  }, [chatInputValue]);

  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  useEffect(() => {
    return () => {
      shouldRestartSpeechRef.current = false;
      speechRecognitionRef.current?.stop();
    };
  }, []);

  useEffect(() => {
    if (!projects.some((project) => project.projectId === selectedChatProjectId) && projects.length > 0) {
      setSelectedChatProjectId(projects[0].projectId);
    }
  }, [projects, selectedChatProjectId]);

  useEffect(() => {
    setProjectData((prev) =>
      prev.projectId ? prev : { ...prev, projectId: createProjectId() }
    );

    // If redirected back from OAuth with ?dropbox=connected, trust it immediately
    const dropboxParam = searchParams.get('dropbox');
    if (dropboxParam === 'connected') {
      setDropboxConnected(true);
      localStorage.setItem('dropbox_connected', 'true');
      loadDropboxFiles();
      return;
    }

    // Otherwise check via API + localStorage fallback
    checkDropboxConnection();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkDropboxConnection = async () => {
    try {
      const response = await fetch(`/api/dropbox?userId=${currentUserId}`);
      const data = await response.json();

      if (data.connected) {
        setDropboxConnected(true);
        localStorage.setItem('dropbox_connected', 'true');
        setLastSyncedAt(data.lastSyncedAt ? new Date(data.lastSyncedAt) : null);
        loadDropboxFiles();
      } else if (localStorage.getItem('dropbox_connected') === 'true') {
        // Server lost the in-memory connection (HMR / restart) but user was previously connected.
        // Show connected state and trigger a re-sync.
        setDropboxConnected(true);
        loadDropboxFiles();
      }
    } catch (error) {
      console.error('Failed to check Dropbox connection:', error);
      if (localStorage.getItem('dropbox_connected') === 'true') {
        setDropboxConnected(true);
      }
    }
  };
  
  const loadDropboxFiles = async () => {
    try {
      const response = await fetch(`/api/dropbox/files?userId=${currentUserId}`);
      const data = await response.json();

      if (data.files && data.files.length > 0) {
        applyDropboxData(data);
      } else {
        // Files are empty — trigger a fresh sync from the Dropbox API
        console.log('[Dashboard] No cached files, triggering sync...');
        const syncResponse = await fetch('/api/dropbox/files/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: currentUserId }),
        });
        const syncData = await syncResponse.json();
        if (syncData.files) {
          applyDropboxData(syncData);
        }
      }
    } catch (error) {
      console.error('Failed to load Dropbox files:', error);
    }
  };

  const applyDropboxData = (data: { files: any[]; folders?: string[] }) => {
    const formattedFiles = data.files.map((file: any) => ({
      id: file.id,
      name: file.name,
      type: file.type,
      size: formatFileSize(file.size),
      modified: new Date(file.modifiedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      folderName: file.folderName || 'Root',
      projectId: file.projectId,
    }));
    setDropboxFiles(formattedFiles);
    if (data.folders) {
      setDropboxFolders(data.folders);
    }
  };
  
  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };
  
  // Connect Dropbox
  const handleConnectDropbox = async () => {
    try {
      setDropboxLoading(true);
      
      // Get OAuth URL from backend
      const response = await fetch('/api/dropbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUserId }),
      });
      
      const data = await response.json();
      
      // Redirect to Dropbox OAuth
      if (data.authUrl) {
        window.location.href = data.authUrl;
      }
    } catch (error) {
      console.error('Failed to connect Dropbox:', error);
      setDropboxLoading(false);
    }
  };
  
  const handleDisconnectDropbox = async () => {
    if (!window.confirm('Are you sure you want to disconnect Dropbox? Your files will no longer be accessible.')) {
      return;
    }
    
    try {
      const response = await fetch('/api/dropbox', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUserId }),
      });
      
      if (response.ok) {
        setDropboxConnected(false);
        setDropboxFiles([]);
        setDropboxFolders([]);
        setLastSyncedAt(null);
        localStorage.removeItem('dropbox_connected');
        window.alert('Dropbox disconnected successfully');
      }
    } catch (error) {
      console.error('Failed to disconnect Dropbox:', error);
    }
  };
  
  const handleManualSync = async () => {
    try {
      setDropboxLoading(true);

      const response = await fetch('/api/dropbox/files/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUserId }),
      });

      const data = await response.json();

      if (data.files) {
        applyDropboxData(data);
        setLastSyncedAt(new Date());
        window.alert(`Files synced successfully! ${data.files.length} file(s) found.`);
      } else {
        window.alert(data.error || 'Sync returned no files. Check server logs.');
      }
    } catch (error) {
      console.error('Failed to sync files:', error);
      window.alert('Failed to sync files');
    } finally {
      setDropboxLoading(false);
    }
  };

  return (
    <div className={cn("min-h-screen flex transition-colors duration-300", shellBg)}>
      {/* Left Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 h-full border-r transition-all duration-300 z-50 shadow-sm",
        sidebarBg,
        sidebarOpen ? "w-72" : "w-20"
      )}
      onMouseEnter={() => setSidebarOpen(true)}
      onMouseLeave={() => setSidebarOpen(false)}
      >
        {/* Logo */}
        <div className={cn("p-5 border-b", borderTone)}>
          <Link href="/" className="flex items-center gap-3 group">
            {!sidebarOpen && (
              <span
                className={cn("text-[2rem] leading-none", darkMode ? "text-white" : "text-[#1b1b1b]")}
                style={{ fontFamily: "var(--font-philosopher), Georgia, serif" }}
                aria-label="AURIFER"
              >
                A
              </span>
            )}
            {sidebarOpen && (
              <div className="overflow-hidden">
                <AuriferWordmark size="sm" tone={darkMode ? "light" : "dark"} />
              </div>
            )}
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.target)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group",
                activeSection === item.target
                  ? cn("border border-[#ea8c47]/30 shadow-sm", darkMode ? "bg-[#2c2119] text-[#f6ede5]" : "bg-[#ea8c47]/10 text-[#000000]")
                  : cn(darkMode ? "text-[#cfbaa8] hover:bg-[#2a211c] hover:text-[#f6ede5]" : "text-[#424242] hover:bg-slate-50 hover:text-[#000000]")
              )}
            >
              <item.icon className={cn(
                "size-5 flex-shrink-0",
                activeSection === item.target ? "text-[#ea8c47]" : darkMode ? "text-[#b99c87]" : "text-[#424242]"
              )} />
              {sidebarOpen && (
                <span className="font-medium text-sm">{item.label}</span>
              )}
            </button>
          ))}
        </nav>

        {/* User Profile */}
        <div className={cn("absolute bottom-0 left-0 right-0 p-4 border-t", borderTone)}>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#ea8c47] to-[#f3b372] text-sm font-bold text-white flex-shrink-0 shadow-md">
              RA
            </div>
            {sidebarOpen && (
              <div className="overflow-hidden">
                <p className={cn("text-sm font-semibold", textPrimary)}>Rahul Agarwal</p>
                <p className={cn("text-xs mt-0.5", textSecondary)}>Senior Consultant</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={cn(
        "flex-1 transition-all duration-300 p-5 lg:p-6",
        sidebarOpen ? "ml-72" : "ml-20"
      )}>
        {/* Top Bar */}
        <div className={cn(
          "mb-5 flex items-center justify-between rounded-lg border px-5 py-3.5 shadow-sm",
          borderTone,
          panelBg
        )}>
          <div className="w-full max-w-xl">
            <Input
              placeholder="Search projects or documents..."
              className={cn("h-11 rounded-lg text-sm font-medium focus-visible:ring-[#ea8c47] focus-visible:border-[#ea8c47]", inputTone)}
            />
          </div>
          <div className="ml-4 flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={cn("rounded-lg border p-2.5 transition hover:border-[#ea8c47] hover:shadow-sm", neutralButtonTone)}
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {darkMode ? (
                <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            <button className={cn("rounded-lg border p-2.5 transition hover:border-[#ea8c47] hover:shadow-sm", neutralButtonTone)}>
              <Bell className="size-4" />
            </button>
            <div className={cn("flex items-center gap-2 rounded-lg border px-3 py-2 shadow-sm", borderTone, darkMode ? "bg-[#1d1713]" : "bg-white")}>
              <div className="flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#ea8c47] to-[#f3b372] text-xs font-bold text-white shadow-sm">RA</div>
              <div className="hidden text-left md:block">
                <p className={cn("text-sm font-bold", textPrimary)}>Rahul Agarwal</p>
                <p className={cn("text-xs font-medium", textSecondary)}>Partner</p>
              </div>
            </div>
          </div>
        </div>
        {/* Page Header */}
        {(activeSection !== "create-project" && activeSection !== "overview") && (
          <div className={cn("mb-8", (activeSection === "chatbot" || activeSection === "finalize" || activeSection === "templates" || activeSection === "settings") && "text-center")}>
            <h1 className={cn("text-4xl font-extrabold tracking-tight", textPrimary)}>
              {activeSection === "chatbot" && "AI Chat Assistant"}
              {activeSection === "finalize" && "Finalize & Export"}
              {activeSection === "templates" && "Document Templates"}
              {activeSection === "settings" && "Project Settings"}
            </h1>
            <p className={cn("mt-2 text-lg font-medium", textSecondary)}>
              {activeSection === "chatbot" && "Chat with AI to generate your documents"}
              {activeSection === "finalize" && "Select and export your generated documents"}
              {activeSection === "templates" && "Manage default templates for Memo, Deck, and Email"}
              {activeSection === "settings" && "Configure template selection and project preferences"}
            </p>
          </div>
        )}

        {activeSection === "overview" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="space-y-8">
              <div className="rounded-xl border-2 border-[#ea8c47]/30 bg-gradient-to-r from-[#000000] via-[#1a1a1a] to-[#2d2d2d] p-10 text-white shadow-2xl">
                <h2 className="text-4xl font-extrabold leading-tight">Streamline Your Tax &amp; Legal Documentation</h2>
                <p className="mt-4 max-w-2xl text-base font-medium text-white/85">Create, refine, and manage professional documents with clarity</p>
                <Button onClick={() => setActiveSection("create-project")} className="mt-8 rounded-lg bg-gradient-to-r from-[#ea8c47] to-[#f3b372] px-8 py-6 text-base font-bold text-[#000000] hover:shadow-[0_8px_24px_rgba(234,140,71,0.5)] transition-all">
                  Start New Project
                </Button>
              </div>


              <div className={cn(
                "rounded-xl border-2 p-8 shadow-lg",
                borderTone,
                panelBg
              )}>
                <div className="mb-6 flex items-center justify-between">
                  <h3 className={cn("text-2xl font-extrabold", textPrimary)}>Continue Working</h3>
                  <span className="rounded-lg bg-gradient-to-r from-[#ea8c47] to-[#f3b372] px-4 py-2 text-sm font-bold text-[#000000] shadow-md">
                    {filteredProjects.length} Active
                  </span>
                </div>
                
                {/* Search Bar */}
                <div className="mb-6">
                  <Input
                    placeholder="Search projects by name, client, or ID..."
                    value={projectSearch}
                    onChange={(e) => handleProjectSearchChange(e.target.value)}
                    className={cn("h-12 rounded-lg border-2 text-base font-medium focus-visible:ring-[#ea8c47] focus-visible:border-[#ea8c47]", inputTone, darkMode && "bg-[#1b1512]")}
                  />
                </div>

                {/* Project List */}
                <div className="space-y-4">
                  {paginatedProjects.length > 0 ? (
                    paginatedProjects.map((project) => (
                      <div
                        key={project.id}
                        className={cn(
                          "rounded-xl border-2 p-6 transition hover:border-[#ea8c47] hover:shadow-xl",
                          borderTone,
                          darkMode ? "bg-gradient-to-br from-[#251d18] via-[#201915] to-[#1a1411]" : "bg-gradient-to-br from-[#fffdfb] via-[#fff7f1] to-[#ffefe4]"
                        )}
                      >
                        <div className="mb-3 flex items-start justify-between">
                          <div>
                            <p className={cn("text-lg font-bold", textPrimary)}>{project.title}</p>
                            <p className={cn("text-sm font-medium", textSecondary)}>{project.client}</p>
                          </div>
                          <span className={cn("rounded-lg px-3 py-1.5 text-xs font-bold", project.status === "Completed" ? "bg-emerald-100 text-emerald-800" : statusChipTone)}>
                            {project.status === "Completed" ? "Finalized" : "In Progress"}
                          </span>
                        </div>
                        <p className={cn("text-sm font-medium", textSecondary)}>Preparing legal-tax advisory summary and supporting compliance notes.</p>
                        <p className={cn("mt-3 text-xs font-semibold", textMuted)}>Last updated: {project.date}</p>
                      </div>
                    ))
                  ) : (
                    <div className="py-12 text-center">
                      <p className={cn("text-base font-medium", textMuted)}>No projects found matching your search.</p>
                    </div>
                  )}
                </div>

                {/* Pagination Controls */}
                {totalProjectPages > 1 && (
                  <div className={cn("mt-6 flex items-center justify-between border-t pt-4", borderTone)}>
                    <p className={cn("text-sm font-medium", textMuted)}>
                      Showing {((projectCurrentPage - 1) * itemsPerPage) + 1}-{Math.min(projectCurrentPage * itemsPerPage, filteredProjects.length)} of {filteredProjects.length}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setProjectCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={projectCurrentPage === 1}
                        className={cn("px-4 py-2 rounded-lg border-2 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all", neutralButtonTone)}
                      >
                        Previous
                      </button>
                      {Array.from({ length: totalProjectPages }, (_, i) => i + 1).map(page => (
                        <button
                          key={page}
                          onClick={() => setProjectCurrentPage(page)}
                          className={cn(
                            "w-10 h-10 rounded-lg border-2 text-sm font-bold transition-all",
                            projectCurrentPage === page
                              ? "border-[#ea8c47] bg-gradient-to-r from-[#ea8c47] to-[#f3b372] text-white"
                              : neutralButtonTone
                          )}
                        >
                          {page}
                        </button>
                      ))}
                      <button
                        onClick={() => setProjectCurrentPage(prev => Math.min(totalProjectPages, prev + 1))}
                        disabled={projectCurrentPage === totalProjectPages}
                        className={cn("px-4 py-2 rounded-lg border-2 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all", neutralButtonTone)}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8">
              <div className={cn(
                "overflow-hidden rounded-xl border-2 shadow-lg",
                borderTone,
                panelBg
              )}>
                <div className={cn("border-b-2 p-6", borderTone)}>
                  {/* Header Row */}
                  <div className="flex flex-wrap gap-4 items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <h2 className={cn("text-2xl font-extrabold", textPrimary)}>Your Documents</h2>
                      <span className="rounded-lg bg-gradient-to-r from-[#ea8c47] to-[#f3b372] px-3 py-1.5 text-sm font-bold text-[#000000] shadow-md">
                        {filteredDocuments.length} Documents
                      </span>
                    </div>
                    <p className={cn("text-sm font-medium", textSecondary)}>Project ID, output type, status, and actions.</p>
                  </div>

                  {/* Search Bar and Filters Row */}
                  <div className="flex flex-wrap gap-3 items-center">
                    <div className="flex-1 min-w-[250px]">
                      <Input
                        placeholder="Search by project name, ID, client..."
                        value={documentSearch}
                        onChange={(e) => handleDocumentSearchChange(e.target.value)}
                        className={cn("h-10 rounded-lg border-2 text-sm font-medium focus-visible:ring-[#ea8c47] focus-visible:border-[#ea8c47]", inputTone)}
                      />
                    </div>

                    <Select value={documentTypeFilter} onValueChange={handleDocumentTypeFilterChange}>
                      <SelectTrigger className={cn("w-[130px] h-10 rounded-lg border-2 text-sm font-medium focus-visible:ring-[#ea8c47] focus-visible:border-[#ea8c47]", inputTone)}>
                        <SelectValue placeholder="All Types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="Memo">Memo</SelectItem>
                        <SelectItem value="Deck">Deck</SelectItem>
                        <SelectItem value="Email">Email</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={documentStatusFilter} onValueChange={handleDocumentStatusFilterChange}>
                      <SelectTrigger className={cn("w-[130px] h-10 rounded-lg border-2 text-sm font-medium focus-visible:ring-[#ea8c47] focus-visible:border-[#ea8c47]", inputTone)}>
                        <SelectValue placeholder="All Statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="Finalized">Finalized</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                      </SelectContent>
                    </Select>

                    {(documentTypeFilter !== "all" || documentStatusFilter !== "all" || documentSearch) ? (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setDocumentTypeFilter("all");
                          setDocumentStatusFilter("all");
                          setDocumentSearch("");
                          setDocumentCurrentPage(1);
                        }}
                        className={cn("h-10 rounded-lg border-2 px-3 text-sm font-semibold", neutralButtonTone)}
                      >
                        Clear
                      </Button>
                    ) : null}
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left min-w-[800px]">
                    <thead className={cn("sticky top-0 border-b-2", tableHeaderTone)}>
                      <tr className={cn("text-sm uppercase font-bold", textSecondary)}>
                        <th className="py-3 px-4">Project Name</th>
                        <th className="py-3 px-4">Project ID</th>
                        <th className="py-3 px-4">Document Type</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedDocuments.length > 0 ? (
                        paginatedDocuments.map((doc, idx) => (
                          <tr key={`${doc.projectId}-${doc.type}-${idx}`} className={cn("border-b text-base transition-colors", tableRowTone)}>
                            <td className={cn("py-3 px-4 font-bold", textPrimary)}>{doc.projectName}</td>
                            <td className={cn("py-3 px-4 font-semibold", textSecondary)}>{doc.projectId}</td>
                            <td className={cn("py-3 px-4 font-medium", textSecondary)}>{doc.type}</td>
                            <td className="py-3 px-4"><span className={cn("rounded-lg px-3 py-1.5 text-sm font-bold", doc.status === "Finalized" ? "bg-emerald-100 text-emerald-800" : statusChipTone)}>{doc.status}</span></td>
                            <td className="py-3 px-4 text-right"><button className={cn("rounded-lg border-2 px-4 py-2 text-sm font-bold hover:shadow-md transition-all", neutralButtonTone)}>Open</button></td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className={cn("py-8 text-center text-base font-medium", textMuted)}>
                            No documents found matching your search.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                {totalDocumentPages > 1 && (
                  <div className={cn("border-t-2 border-slate-200 px-6 py-4", lightRoseSurfaceBg)}>
                    <div className="flex items-center justify-between">
                      <p className={cn("text-sm font-medium", textMuted)}>
                        Showing {((documentCurrentPage - 1) * itemsPerPage) + 1}-{Math.min(documentCurrentPage * itemsPerPage, filteredDocuments.length)} of {filteredDocuments.length}
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setDocumentCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={documentCurrentPage === 1}
                          className="px-4 py-2 rounded-lg border-2 border-slate-300 bg-white text-sm font-semibold text-slate-700 hover:border-[#ea8c47] hover:text-[#ea8c47] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                          Previous
                        </button>
                        {Array.from({ length: totalDocumentPages }, (_, i) => i + 1).map(page => (
                          <button
                            key={page}
                            onClick={() => setDocumentCurrentPage(page)}
                            className={cn(
                              "w-10 h-10 rounded-lg border-2 text-sm font-bold transition-all",
                              documentCurrentPage === page
                                ? "border-[#ea8c47] bg-gradient-to-r from-[#ea8c47] to-[#f3b372] text-white"
                                : neutralButtonTone
                            )}
                          >
                            {page}
                          </button>
                        ))}
                        <button
                          onClick={() => setDocumentCurrentPage(prev => Math.min(totalDocumentPages, prev + 1))}
                          disabled={documentCurrentPage === totalDocumentPages}
                        className={cn("px-4 py-2 rounded-lg border-2 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all", neutralButtonTone)}
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>


          </motion.div>
        )}

        {activeSection === "analysis-workspace" && currentProjectDetails && (
          <AnalysisWorkspace
            projectDetails={currentProjectDetails}
            dropboxFiles={dropboxFiles.map((file) => ({
              ...file,
              size: parseFloat(file.size.replace(/[^0-9.]/g, '')) * 1024, // Convert to bytes
              modifiedAt: new Date(file.modified),
              path: `/${file.folderName}/${file.name}`,
            }))}
            onBack={() => setActiveSection("overview")}
            onProceedToChat={() => setActiveSection("chatbot")}
          />
        )}

        {activeSection === "chatbot" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid xl:grid-cols-2 gap-6 items-stretch"
          >
            <div className={cn(
              "xl:col-span-2 rounded-lg border p-6",
              borderTone,
              panelBg
            )}>
              <Label className={cn("text-base font-semibold mb-3 block", textPrimary)}>Select Project Chat</Label>
              <Select
                value={selectedChatProjectId}
                onValueChange={(value) => {
                  if (value) setSelectedChatProjectId(value);
                }}
              >
                <SelectTrigger className={cn("w-full rounded-lg h-12 text-base", inputTone)}>
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.projectId} value={project.projectId}>
                      {project.title} - {project.projectId}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Chat Panel */}
            <div className={cn(
              "xl:col-span-1 rounded-xl shadow-lg border overflow-hidden flex flex-col",
              borderTone,
              panelBg
            )}>
              <div className={cn("flex items-center justify-between p-5 border-b", borderTone, panelHeaderBg)}>
                <div>
                  <h3 className={cn("text-lg font-bold", textPrimary)}>AI Chatbot</h3>
                  <p className={cn("text-sm mt-1", textMuted)}>
                    Project: {selectedChatProject?.projectId ?? "No project selected"} - {selectedChatProject?.title ?? ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="size-2.5 rounded-full bg-[#ea8c47] animate-pulse" />
                  <span className="text-sm font-semibold text-[#ea8c47]">Connected</span>
                </div>
              </div>

              {/* Spacer to match Document Editor toolbar height */}
              <div className={cn("flex items-center gap-2 p-4 border-b w-full", borderTone, lightRoseSurfaceBg)}>
                <div className={cn("flex items-center gap-2 px-4 py-2 rounded-md border", borderTone, lightRoseCardBg)}>
                  <div className="size-2 rounded-full bg-[#ea8c47]" />
                  <span className={cn("text-sm font-semibold", textPrimary)}>Live Chat</span>
                </div>
                <div className={cn("w-px h-8", darkMode ? "bg-[#5d4737]" : "bg-slate-300")} />
                <span className={cn("text-xs", textMuted)}>Messages appear here in real-time</span>
              </div>
              
              <div className={cn("flex-1 p-6 space-y-4 overflow-y-auto min-h-[500px]", darkMode ? "bg-gradient-to-b from-[#171310] to-[#120f0d]" : "bg-gradient-to-b from-slate-50 to-white")}>
                {activeChatMessages.length === 0 ? (
                  <div className="text-center py-16">
                    <MessageSquare className={cn("size-16 mx-auto mb-4", darkMode ? "text-[#6a584a]" : "text-slate-300")} />
                    <p className={cn("text-base", textMuted)}>Starting conversation with your prompt...</p>
                  </div>
                ) : (
                  activeChatMessages.map((msg, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={cn(
                        "max-w-[85%] rounded-xl px-5 py-4 text-base shadow-md",
                        msg.isUser
                          ? "ml-auto bg-gradient-to-r from-[#000000] to-[#424242] text-white"
                          : darkMode ? "bg-[#241d18] text-[#f2e5d9] border border-[#4d3b2c]" : "bg-white text-[#31415b] border border-slate-200"
                      )}
                    >
                      <p className={cn(
                        "text-xs font-semibold uppercase tracking-wider mb-2",
                        msg.isUser ? "text-white/70" : darkMode ? "text-[#b79f8b]" : "text-slate-500"
                      )}>
                        {msg.author} - {msg.time}
                      </p>
                      {msg.kind === "context-file" ? (
                        <div className="space-y-2">
                          <p className="text-sm font-semibold uppercase tracking-wide text-white/80">
                            Context File
                          </p>
                          <p className="leading-relaxed">{msg.fileName ?? msg.message}</p>
                        </div>
                      ) : (
                        <p className="leading-relaxed">{msg.message}</p>
                      )}
                    </motion.div>
                  ))
                )}
              </div>
              <div className={cn("p-4 border-t", borderTone, darkMode ? "bg-[#1a1512]" : "bg-white")}>
                {/* Speech to Text Button */}
                <div className="mb-3 flex items-center justify-between">
                  <button
                    onClick={toggleSpeechToText}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all",
                      isListening
                        ? "bg-red-500 text-white animate-pulse hover:bg-red-600"
                        : darkMode ? "bg-[#2a211c] text-[#f1e4d8] hover:bg-[#3a2c22] hover:text-[#f3b372]" : "bg-slate-100 text-[#424242] hover:bg-[#ea8c47]/10 hover:text-[#ea8c47]"
                    )}
                  >
                    {isListening ? (
                      <>
                        <MicOff className="size-4" />
                        Stop Listening
                      </>
                    ) : (
                      <>
                        <Mic className="size-4" />
                        Voice Input
                      </>
                    )}
                  </button>
                  {isListening && (
                    <span className="text-xs text-red-500 font-medium">🎤 Listening... Speak now</span>
                  )}
                </div>
                <VercelV0Chat
                  onSend={sendChatMessage}
                  onAttachContextFile={attachContextFileToChat}
                  value={chatInputValue}
                  onValueChange={setChatInputValue}
                  inputRef={chatTextareaRef}
                  darkMode={darkMode}
                />
              </div>
            </div>

            {/* Document Editor */}
            <div className={cn(
              "rounded-xl shadow-lg border overflow-hidden flex flex-col",
              borderTone,
              panelBg
            )}>
              <div className={cn("flex items-center justify-between p-5 border-b", borderTone, panelHeaderBg)}>
                <div>
                  <h3 className={cn("text-lg font-bold", textPrimary)}>Document Editor</h3>
                  <p className={cn("text-sm mt-1", textMuted)}>Edit and format your document in real-time</p>
                </div>
                <div className="flex items-center gap-3">
                  {/* Version Info */}
                  {documentVersions.length > 0 && (
                    <span className="rounded-lg bg-blue-50 border border-blue-200 px-3 py-1.5 text-xs font-semibold text-blue-700">
                      {documentVersions.length} version{documentVersions.length > 1 ? 's' : ''} saved
                    </span>
                  )}
                  {/* Download Button */}
                  <button
                    onClick={() => downloadDocument()}
                    disabled={!memoContent}
                    className="rounded-lg bg-gradient-to-r from-[#ea8c47] to-[#f3b372] px-4 py-2 text-sm font-bold text-[#000000] hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Download className="size-4" />
                    Download Word
                  </button>
                  <span className="rounded-lg bg-[#f3b372]/30 px-4 py-1.5 text-sm font-semibold text-[#ea8c47]">Auto-saved</span>
                </div>
              </div>
              
              {/* Toolbar */}
              <div className={cn("flex items-center gap-2 p-4 border-b flex-wrap", borderTone, lightRoseSurfaceBg)}>
                <button
                  onClick={() => document.execCommand('bold', false)}
                  className={cn("px-4 py-2 rounded-md border text-base font-bold transition-all", neutralButtonTone)}
                  title="Bold"
                >
                  B
                </button>
                <button
                  onClick={() => document.execCommand('italic', false)}
                  className={cn("px-4 py-2 rounded-md border text-base italic transition-all", neutralButtonTone)}
                  title="Italic"
                >
                  I
                </button>
                <button
                  onClick={() => document.execCommand('underline', false)}
                  className={cn("px-4 py-2 rounded-md border text-base underline transition-all", neutralButtonTone)}
                  title="Underline"
                >
                  U
                </button>
                <div className={cn("w-px h-8", darkMode ? "bg-[#5d4737]" : "bg-slate-300")} />
                <button
                  onClick={() => document.execCommand('formatBlock', false, '<h1>')}
                  className={cn("px-4 py-2 rounded-md border text-base font-semibold transition-all", neutralButtonTone)}
                  title="Heading 1"
                >
                  H1
                </button>
                <button
                  onClick={() => document.execCommand('formatBlock', false, '<h2>')}
                  className={cn("px-4 py-2 rounded-md border text-base font-semibold transition-all", neutralButtonTone)}
                  title="Heading 2"
                >
                  H2
                </button>
                <button
                  onClick={() => document.execCommand('formatBlock', false, '<h3>')}
                  className={cn("px-4 py-2 rounded-md border text-base font-semibold transition-all", neutralButtonTone)}
                  title="Heading 3"
                >
                  H3
                </button>
                <div className={cn("w-px h-8", darkMode ? "bg-[#5d4737]" : "bg-slate-300")} />
                <button
                  onClick={() => document.execCommand('insertUnorderedList', false)}
                  className={cn("px-4 py-2 rounded-md border text-base transition-all", neutralButtonTone)}
                  title="Bullet List"
                >
                  • List
                </button>
                <button
                  onClick={() => document.execCommand('insertOrderedList', false)}
                  className={cn("px-4 py-2 rounded-md border text-base transition-all", neutralButtonTone)}
                  title="Numbered List"
                >
                  1. List
                </button>
                <div className={cn("w-px h-8", darkMode ? "bg-[#5d4737]" : "bg-slate-300")} />
                <button
                  onClick={() => document.execCommand('justifyLeft', false)}
                  className={cn("px-4 py-2 rounded-md border text-base transition-all", neutralButtonTone)}
                  title="Align Left"
                >
                  ←
                </button>
                <button
                  onClick={() => document.execCommand('justifyCenter', false)}
                  className={cn("px-4 py-2 rounded-md border text-base transition-all", neutralButtonTone)}
                  title="Align Center"
                >
                  ↔
                </button>
                <button
                  onClick={() => document.execCommand('justifyRight', false)}
                  className={cn("px-4 py-2 rounded-md border text-base transition-all", neutralButtonTone)}
                  title="Align Right"
                >
                  →
                </button>
              </div>

              {/* HTML Editor Area */}
              <div className={cn("flex-1 p-6 overflow-y-auto min-h-[500px]", darkMode ? "bg-[#171310]" : "bg-white")}>
                {memoContent ? (
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    className={cn("w-full h-full outline-none prose max-w-none", darkMode ? "prose-invert prose-headings:text-[#f6ede5] prose-p:text-[#eadbce] prose-strong:text-[#fff5ee]" : "prose-slate")}
                    style={{ minHeight: "500px" }}
                    dangerouslySetInnerHTML={{ __html: memoContent }}
                    onInput={(e) => {
                      setMemoContent(e.currentTarget.innerHTML);
                    }}
                    onBlur={(e) => {
                      // Auto-save on blur
                      console.log('Document auto-saved');
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <FileText className={cn("size-20 mx-auto mb-4", darkMode ? "text-[#6a584a]" : "text-slate-300")} />
                      <p className={cn("text-base", textMuted)}>Document will appear here as AI generates it</p>
                      <p className={cn("text-sm mt-2", darkMode ? "text-[#8f7966]" : "text-slate-400")}>You can edit it directly once generated</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Editor Footer */}
              <div className={cn("p-6 border-t", borderTone, lightRoseSurfaceBg)}>
                <div className="flex items-center justify-between mb-4">
                  <p className={cn("text-sm", textMuted)}>
                    💡 Tip: Click anywhere in the document to edit. Use the toolbar above for formatting.
                  </p>
                </div>
                
                {/* File References Tip */}
                {projectFilesFromDatabase.length > 0 && (
                  <div className="mb-4 p-4 rounded-lg bg-[#ea8c47]/5 border border-[#ea8c47]/20">
                    <p className="text-xs font-semibold text-[#000000] mb-2">📁 Reference Files from Database:</p>
                    <div className="flex flex-wrap gap-2">
                      {projectFilesFromDatabase.slice(0, 6).map((file, index) => (
                        <span
                          key={file.id}
                          className={cn(
                            "inline-flex items-center gap-1 px-3 py-1 rounded-md border border-[#ea8c47]/30 text-xs font-medium text-[#000000]",
                            lightRoseCardBg
                          )}
                        >
                          <span className="text-[#ea8c47]">📄</span>
                          {file.name}
                        </span>
                      ))}
                      {projectFilesFromDatabase.length > 6 && (
                        <span className="inline-flex items-center px-3 py-1 rounded-md bg-[#ea8c47]/10 text-xs font-medium text-[#ea8c47]">
                          +{projectFilesFromDatabase.length - 6} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
                
                <Button
                  className="rounded-lg bg-gradient-to-r from-[#000000] to-[#424242] text-white w-full py-6 text-base font-semibold hover:shadow-lg"
                  onClick={() => setActiveSection("finalize")}
                  disabled={!memoContent}
                >
                  Continue to Finalize & Export
                  <ArrowRight className="size-5 ml-2" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {activeSection === "finalize" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-7xl w-full mx-auto"
          >
            <div className={cn(
              "rounded-xl border shadow-xl overflow-hidden",
              borderTone,
              panelBg
            )}>
              <div className="border-b border-slate-200 bg-gradient-to-r from-[#000000] via-[#1f1f1f] to-[#424242] p-10 text-white">
                <div className="flex flex-wrap items-center justify-between gap-6">
                  <div className="flex items-center gap-5">
                    <div className="flex size-20 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
                      <Download className="size-10 text-[#f3b372]" />
                    </div>
                    <div>
                      <h2 className="text-4xl font-bold">Finalize & Export</h2>
                      <p className="mt-2 text-base text-white/75">Choose deliverables and export a polished package for your client.</p>
                    </div>
                  </div>
                  <div className="rounded-xl border border-white/20 bg-white/10 px-6 py-4 backdrop-blur-sm">
                    <p className="text-xs uppercase tracking-[0.12em] text-white/70">Ready To Export</p>
                    <p className="mt-2 text-3xl font-semibold">
                      {selectedDocuments.length}
                      <span className="ml-2 text-lg font-medium text-white/70">/ {exportOptions.length}</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-10">
                <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className={cn("text-base font-semibold", textPrimary)}>Document Selection</p>
                    <p className={cn("text-sm mt-1", textMuted)}>Select one or more files for final delivery.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setSelectedDocuments(allExportIds as string[])}
                      className={cn("h-11 rounded-lg px-6 text-sm font-semibold", neutralButtonTone)}
                    >
                      Select All
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setSelectedDocuments([])}
                      className={cn("h-11 rounded-lg px-6 text-sm font-semibold", neutralButtonTone)}
                    >
                      Clear
                    </Button>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  {exportOptions.map((doc) => (
                    <button
                      key={doc.id}
                      onClick={() => {
                        if (selectedDocuments.includes(doc.id)) {
                          setSelectedDocuments(selectedDocuments.filter((d) => d !== doc.id));
                        } else {
                          setSelectedDocuments([...selectedDocuments, doc.id]);
                        }
                      }}
                      className={cn(
                        "group relative rounded-xl border p-6 text-left transition-all",
                        selectedDocuments.includes(doc.id)
                          ? darkMode ? "border-[#ea8c47]/70 bg-[#2b211a] shadow-[0_14px_30px_rgba(234,140,71,0.14)]" : "border-[#ea8c47]/70 bg-[#fff8f2] shadow-[0_14px_30px_rgba(234,140,71,0.14)]"
                          : darkMode ? "border-[#4d3b2c] bg-[#1d1713] hover:border-[#6a503d] hover:shadow-md" : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md"
                      )}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-5">
                          <div className={cn("flex size-14 items-center justify-center rounded-lg bg-gradient-to-br text-white shadow-sm", doc.color)}>
                            <doc.icon className="size-6" />
                          </div>
                          <div>
                            <h3 className={cn("text-lg font-semibold", textPrimary)}>{doc.title}</h3>
                            <p className={cn("text-sm", textMuted)}>{doc.format}</p>
                          </div>
                        </div>
                        <div
                          className={cn(
                            "flex size-7 items-center justify-center rounded-full border transition",
                            selectedDocuments.includes(doc.id)
                              ? "border-[#ea8c47] bg-[#ea8c47] text-white"
                              : "border-slate-300 bg-white text-transparent group-hover:border-[#ea8c47]/60"
                          )}
                        >
                          <Check className="size-5" />
                        </div>
                      </div>
                      <p className={cn("mt-5 text-sm", textMuted)}>Includes final formatting, metadata cleanup, and ready-to-share output.</p>
                    </button>
                  ))}
                </div>

                <div className={cn("mt-8 flex flex-wrap gap-5 border-t pt-8", borderTone)}>
                  <Button
                    onClick={() => {
                      console.log("Exporting documents:", selectedDocuments);
                      alert(`Exporting ${selectedDocuments.length} document(s): ${selectedDocuments.join(", ")}`);
                      setActiveSection("overview");
                      setSelectedDocuments([]);
                      setMemoContent("");
                    }}
                    className="h-14 flex-1 rounded-lg bg-gradient-to-r from-[#000000] to-[#424242] text-lg font-semibold text-white hover:shadow-lg disabled:opacity-50"
                    disabled={selectedDocuments.length === 0}
                  >
                    <Download className="size-6 text-[#f3b372]" />
                    <span className="ml-3">Export Selected ({selectedDocuments.length})</span>
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeSection === "create-project" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-6xl w-full mx-auto"
          >
            <WorkspaceForm
              data={projectData}
              isFieldAtLimit={isFieldAtLimit}
              onLimitedFieldChange={handleLimitedFieldChange}
              onDocumentTypeChange={(value) => setProjectData((prev) => ({ ...prev, documentType: value ?? "" }))}
              onReferenceFilesAdd={(files) =>
                setProjectData((prev) => ({ ...prev, referenceFiles: [...prev.referenceFiles, ...files] }))
              }
              onReferenceFileRemove={(index) =>
                setProjectData((prev) => ({
                  ...prev,
                  referenceFiles: prev.referenceFiles.filter((_, i) => i !== index),
                }))
              }
              onCancel={() => setActiveSection("overview")}
              onSubmit={() => {
                const newProject = {
                  id: Date.now(),
                  title: projectData.projectName,
                  client: projectData.clientName,
                  status: "In Progress",
                  date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
                  progress: 0,
                  projectId: projectData.projectId,
                  referenceFiles: projectData.referenceFiles,
                };
                setProjects([newProject, ...projects]);

                // Set current project details for analysis workspace
                setCurrentProjectDetails({
                  projectId: projectData.projectId,
                  projectName: projectData.projectName,
                  clientName: projectData.clientName,
                  projectContext: projectData.projectContext,
                  documentType: projectData.documentType,
                  prompt: projectData.prompt,
                  referenceFiles: projectData.referenceFiles,
                });

                const initialMessage = {
                  author: "Consultant",
                  time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
                  message: `Document Type: ${projectData.documentType}\n${projectData.prompt}`,
                  isUser: true,
                };
                setSelectedChatProjectId(newProject.projectId);
                setChatMessagesByProject((prev) => ({
                  ...prev,
                  [newProject.projectId]: [initialMessage],
                }));

                setTimeout(() => {
                  // Search for files in database related to the new project
                  const relatedFiles = dropboxFiles.filter(
                    (file) =>
                      file.projectId === newProject.projectId ||
                      file.name.toLowerCase().includes(projectData.projectName.toLowerCase()) ||
                      file.name.toLowerCase().includes(projectData.clientName.toLowerCase())
                  );
                  
                  const aiResponse = {
                    author: "Tax Expert AI",
                    time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
                    message: `I've received your request for "${projectData.projectName}". ${relatedFiles.length > 0 ? `I found ${relatedFiles.length} file(s) in the database related to this project and will use them as reference.` : "I'm analyzing the requirements and will generate a comprehensive advisory document based on the latest UAE tax regulations."}`,
                    isUser: false,
                  };
                  setChatMessagesByProject((prev) => ({
                    ...prev,
                    [newProject.projectId]: [...(prev[newProject.projectId] ?? []), aiResponse],
                  }));
                  setMemoContent(
                    `<h1>Draft for ${projectData.clientName}</h1><p>Document Type: ${projectData.documentType}</p><p>${projectData.prompt}</p><p>AI suggestions will appear here as the conversation evolves.</p>`
                  );
                }, 1500);

                setActiveSection("analysis-workspace");
                setProjectData({
                  clientName: "",
                  projectName: "",
                  projectContext: "",
                  documentType: "",
                  projectId: createProjectId(),
                  prompt: "",
                  referenceFiles: [],
                });
              }}
              isSubmitDisabled={
                !projectData.clientName ||
                !projectData.projectName ||
                !projectData.projectContext ||
                !projectData.documentType ||
                !projectData.prompt
              }
              autoGenerateEnabled={autoGenerateEnabled}
              onAutoGenerateToggle={setAutoGenerateEnabled}
            />
          </motion.div>
        )}

        {activeSection === "templates" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-7xl w-full mx-auto"
          >
            <div className={cn(
              "rounded-xl border-2 shadow-xl overflow-hidden",
              borderTone,
              panelBg
            )}>
              {/* Header */}
              <div className="border-b-2 border-slate-200 bg-gradient-to-r from-[#000000] via-[#1a1a1a] to-[#2d2d2d] p-8 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    <div className="flex size-16 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
                      <File className="size-8 text-[#f3b372]" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-extrabold">Document Templates</h2>
                      <p className="text-base font-medium text-white/75 mt-2">Upload and manage custom templates for AI document generation</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Template Tabs */}
              <div className={cn("border-b-2 border-slate-200 p-6", lightRoseSurfaceBg)}>
                <div className="flex gap-4">
                  {(["Memo", "Deck", "Email"] as TemplateType[]).map((type) => {
                    const iconMap = {
                      Memo: FileText,
                      Deck: Presentation,
                      Email: Mail,
                    };
                    const Icon = iconMap[type];
                    const hasTemplate = templates[type] !== null;
                    
                    return (
                      <button
                        key={type}
                        onClick={() => setActiveTemplateTab(type)}
                        className={cn(
                          "flex-1 flex items-center gap-4 px-6 py-5 rounded-xl border-2 transition-all",
                          activeTemplateTab === type
                            ? "border-[#ea8c47] shadow-lg"
                            : darkMode ? "border-[#4d3b2c] hover:border-[#6a503d]" : "border-slate-200 hover:border-slate-300",
                          lightRoseCardBg
                        )}
                      >
                        <div className={cn(
                          "flex size-12 items-center justify-center rounded-lg",
                          activeTemplateTab === type ? "bg-gradient-to-br from-[#ea8c47] to-[#f3b372]" : darkMode ? "bg-[#2a211c]" : "bg-slate-100"
                        )}>
                          <Icon className={cn("size-6", activeTemplateTab === type ? "text-white" : darkMode ? "text-[#d7c0ad]" : "text-slate-600")} />
                        </div>
                        <div className="text-left flex-1">
                          <p className={cn("text-lg font-extrabold", activeTemplateTab === type ? textPrimary : textSecondary)}>
                            {type}
                          </p>
                          <p className={cn("text-sm font-medium mt-0.5", textMuted)}>
                            {hasTemplate ? "Custom Template" : "Default Template"}
                          </p>
                        </div>
                        {hasTemplate && (
                          <div className="size-3 rounded-full bg-emerald-500" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Template Content */}
              <div className="p-8">
                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Left: Template Info */}
                  <div className="space-y-6">
                    <div className={cn("rounded-xl border-2 p-6", borderTone, darkMode ? "bg-gradient-to-br from-[#211a16] to-[#181310]" : "bg-gradient-to-br from-slate-50 to-white")}>
                      <h3 className={cn("text-xl font-extrabold mb-4", textPrimary)}>
                        {activeTemplateTab} Template
                      </h3>
                      
                      {templates[activeTemplateTab] ? (
                        <div className="space-y-4">
                          <div className="flex items-start gap-4 rounded-lg bg-emerald-50 border-2 border-emerald-200 p-4">
                            <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-500">
                              <Check className="size-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <p className="text-base font-bold text-emerald-900">Custom Template Active</p>
                              <p className="text-sm font-medium text-emerald-700 mt-1">
                                Uploaded: {templates[activeTemplateTab]!.fileName}
                              </p>
                              <p className="text-xs font-semibold text-emerald-600 mt-1">
                                {templates[activeTemplateTab]!.uploadedAt}
                              </p>
                            </div>
                          </div>

                          <div className={cn("rounded-lg border-2 border-slate-200 p-4", lightRoseCardBg)}>
                            <p className={cn("text-sm font-bold mb-2", textPrimary)}>Template Preview:</p>
                            <div className={cn("max-h-[300px] overflow-y-auto rounded-lg border p-4", borderTone, lightRoseSurfaceBg)}>
                              <pre className={cn("text-xs font-mono whitespace-pre-wrap", textSecondary)}>
                                {templates[activeTemplateTab]!.content.substring(0, 500)}
                                {templates[activeTemplateTab]!.content.length > 500 && "..."}
                              </pre>
                            </div>
                          </div>

                          <Button
                            onClick={() => handleRemoveTemplate(activeTemplateTab)}
                            className="w-full h-12 rounded-lg bg-red-500 text-white font-bold hover:bg-red-600"
                          >
                            <X className="size-5 mr-2" />
                            Remove Custom Template
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex items-start gap-4 rounded-lg bg-[#fff3ea] border-2 border-[#ea8c47]/40 p-4">
                            <div className="flex size-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#ea8c47] to-[#f3b372]">
                              <FileText className="size-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <p className="text-base font-bold text-[#000000]">Default Template Active</p>
                              <p className="text-sm font-medium text-[#6d4a33] mt-1">
                                Using built-in {activeTemplateTab} template
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Upload Section */}
                  <div className="space-y-6">
                    <div className={cn("rounded-xl border-2 border-[#ea8c47]/30 p-6", darkMode ? "bg-gradient-to-br from-[#2a211b] to-[#1d1713]" : "bg-gradient-to-br from-[#ea8c47]/5 to-[#f3b372]/5")}>
                      <h3 className={cn("text-xl font-extrabold mb-4", textPrimary)}>
                        Upload New {activeTemplateTab} Template
                      </h3>

                      <div className="space-y-4">
                        <div>
                          <Label className={cn("text-sm font-semibold mb-2 block", textPrimary)}>Template Name</Label>
                          <Input
                            placeholder="Enter a name for your template..."
                            className={cn("h-11 rounded-lg border-2 text-sm font-medium focus-visible:ring-[#ea8c47] focus-visible:border-[#ea8c47]", inputTone)}
                          />
                        </div>

                        <div className={cn("rounded-xl border-2 border-dashed border-[#ea8c47]/40 p-8 text-center", darkMode ? "bg-[#1a1512]" : "bg-white")}>
                          <input
                            type="file"
                            accept=".txt,.doc,.docx,.pdf"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleTemplateUpload(activeTemplateTab, file);
                              }
                            }}
                            className={cn("block w-full text-sm file:mr-4 file:py-3 file:px-6 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-gradient-to-r file:from-[#ea8c47] file:to-[#f3b372] file:text-white hover:file:shadow-lg cursor-pointer", textSecondary)}
                          />
                          <p className={cn("text-sm font-medium mt-4", textSecondary)}>
                            Supported formats: TXT, DOC, DOCX, PDF
                          </p>
                          <p className={cn("text-xs mt-2", textMuted)}>
                            Upload a custom template to replace the default {activeTemplateTab} format
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Template Processing Settings */}
              <div className={cn(
                "mt-8 rounded-xl border-2 border-slate-200 shadow-xl overflow-hidden",
                darkMode ? "bg-[#2d2d2d]" : "bg-gradient-to-br from-white via-[#fffaf7] to-[#fff2e9]"
              )}>
                <div className="border-b-2 border-slate-200 bg-gradient-to-r from-[#000000] via-[#1a1a1a] to-[#2d2d2d] p-8 text-white">
                  <div className="flex items-center gap-5">
                    <div className="flex size-16 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
                      <FileText className="size-8 text-[#f3b372]" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-extrabold">Template Processing Settings</h2>
                      <p className="text-base font-medium text-white/75 mt-2">Select which templates to use for document generation</p>
                    </div>
                  </div>
                </div>

                <div className="p-8">
                  <div className="grid md:grid-cols-3 gap-6">
                    {(["Memo", "Deck", "Email"] as TemplateType[]).map((type) => {
                      const iconMap = {
                        Memo: FileText,
                        Deck: Presentation,
                        Email: Mail,
                      };
                      const Icon = iconMap[type];
                      const isActive = activeTemplateForProcess[type];
                      const uploadedTemplates = templates[type];
                      
                      return (
                        <div
                          key={type}
                          className={cn(
                            "relative rounded-xl border-2 p-6 transition-all",
                            isActive
                              ? "border-[#ea8c47] bg-[#fff8f2] shadow-lg"
                              : "border-slate-200 bg-white"
                          )}
                        >
                          <button
                            onClick={() => setActiveTemplateForProcess((prev) => ({ ...prev, [type]: !prev[type] }))}
                            className="w-full flex items-start justify-between mb-4"
                          >
                            <div className={cn(
                              "flex size-14 items-center justify-center rounded-lg",
                              isActive ? "bg-gradient-to-br from-[#ea8c47] to-[#f3b372]" : "bg-slate-100"
                            )}>
                              <Icon className={cn("size-7", isActive ? "text-white" : "text-slate-600")} />
                            </div>
                            <div className={cn(
                              "flex size-8 items-center justify-center rounded-full border-2 transition-all",
                              isActive ? "border-[#ea8c47] bg-[#ea8c47]" : "border-slate-300"
                            )}>
                              {isActive && <Check className="size-5 text-white" />}
                            </div>
                          </button>
                          <h3 className="text-xl font-extrabold text-[#000000] mb-2">{type}</h3>
                          <p className="text-sm font-medium text-slate-600 mb-4">
                            {isActive ? "Enabled for processing" : "Disabled for processing"}
                          </p>
                          
                          {isActive && (
                            <div className="space-y-2">
                              <Label className="text-sm font-semibold text-[#000000]">Select Template Layout</Label>
                              <Select 
                                value={selectedTemplateForProcessing[type]} 
                                onValueChange={(value) => {
                                  if (value) setSelectedTemplateForProcessing((prev) => ({ ...prev, [type]: value }));
                                }}
                              >
                                <SelectTrigger className="w-full h-10 rounded-lg border-2 border-slate-300 bg-white text-sm font-medium focus-visible:ring-[#ea8c47] focus-visible:border-[#ea8c47]">
                                  <SelectValue placeholder="Select template" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="default">Default Template</SelectItem>
                                  {uploadedTemplates && (
                                    <SelectItem value="custom">{uploadedTemplates.fileName}</SelectItem>
                                  )}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                          
                          {!isActive && templates[type] && (
                            <div className="mt-4 pt-4 border-t border-slate-200">
                              <p className="text-xs font-semibold text-emerald-700">✓ Custom template uploaded</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeSection === "settings" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-7xl w-full mx-auto"
          >
            <div className="space-y-8">
              {/* AI & Generation Settings */}
              <div className={cn(
                "rounded-xl border-2 shadow-xl overflow-hidden",
                borderTone,
                panelBg
              )}>
                <div className="border-b-2 border-slate-200 bg-gradient-to-r from-[#000000] via-[#1a1a1a] to-[#2d2d2d] p-8 text-white">
                  <div className="flex items-center gap-5">
                    <div className="flex size-16 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
                      <Bot className="size-8 text-[#f3b372]" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-extrabold">AI & Generation Settings</h2>
                      <p className="text-base font-medium text-white/75 mt-2">Configure AI model and document generation preferences</p>
                    </div>
                  </div>
                </div>

                <div className="p-8 space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label className={cn("text-base font-semibold", textPrimary)}>AI Model</Label>
                      <Select value={aiModel} onValueChange={(value) => {
                        if (value) setAiModel(value);
                      }}>
                        <SelectTrigger className={cn("w-full h-12 rounded-lg border-2 text-base font-medium focus-visible:ring-[#ea8c47] focus-visible:border-[#ea8c47]", inputTone)}>
                          <SelectValue placeholder="Select AI model" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gpt-4">GPT-4 (Recommended)</SelectItem>
                          <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                          <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                          <SelectItem value="claude-3">Claude 3</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className={cn("text-xs font-medium", textMuted)}>Choose the AI model for document generation</p>
                    </div>

                    <div className="space-y-3">
                      <Label className={cn("text-base font-semibold", textPrimary)}>Default Format</Label>
                      <Select value={nameFormat} onValueChange={(value) => setNameFormat(value as "formal" | "conservative" | "advisory")}>
                        <SelectTrigger className={cn("w-full h-12 rounded-lg border-2 text-base font-medium focus-visible:ring-[#ea8c47] focus-visible:border-[#ea8c47]", inputTone)}>
                          <SelectValue placeholder="Select format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="formal">Formal</SelectItem>
                          <SelectItem value="conservative">Conservative</SelectItem>
                          <SelectItem value="advisory">Advisory</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className={cn("text-xs font-medium", textMuted)}>Default naming format for documents</p>
                    </div>
                  </div>

                  <div className={cn("space-y-4 pt-4 border-t", borderTone)}>
                    <div className={cn("flex items-center justify-between rounded-lg border-2 p-4", borderTone, lightRoseCardBg)}>
                      <div>
                        <p className={cn("text-base font-bold", textPrimary)}>Auto-Generate Executive Summary</p>
                        <p className={cn("text-sm font-medium mt-1", textSecondary)}>Automatically create a summary for each generated document</p>
                      </div>
                      <button
                        onClick={() => setAutoGenerateSummary(!autoGenerateSummary)}
                        className={cn(
                          "relative inline-flex h-7 w-14 items-center rounded-full transition-colors",
                          autoGenerateSummary ? "bg-[#ea8c47]" : "bg-slate-300"
                        )}
                      >
                        <span
                          className={cn(
                            "inline-block size-5 transform rounded-full bg-white transition-transform shadow-md",
                            autoGenerateSummary ? "translate-x-8" : "translate-x-1"
                          )}
                        />
                      </button>
                    </div>

                    <div className={cn("flex items-center justify-between rounded-lg border-2 p-4", borderTone, lightRoseCardBg)}>
                      <div>
                        <p className={cn("text-base font-bold", textPrimary)}>Auto-Save Documents</p>
                        <p className={cn("text-sm font-medium mt-1", textSecondary)}>Automatically save documents during editing</p>
                      </div>
                      <button
                        onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
                        className={cn(
                          "relative inline-flex h-7 w-14 items-center rounded-full transition-colors",
                          autoSaveEnabled ? "bg-[#ea8c47]" : "bg-slate-300"
                        )}
                      >
                        <span
                          className={cn(
                            "inline-block size-5 transform rounded-full bg-white transition-transform shadow-md",
                            autoSaveEnabled ? "translate-x-8" : "translate-x-1"
                          )}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dropbox Integration */}
              <div className={cn(
                "rounded-xl border-2 shadow-xl overflow-hidden",
                borderTone,
                panelBg
              )}>
                <div className="border-b-2 border-slate-200 bg-gradient-to-r from-[#000000] via-[#1a1a1a] to-[#2d2d2d] p-8 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-5">
                      <div className="flex size-16 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
                        <HardDrive className="size-8 text-[#f3b372]" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-extrabold">Dropbox Integration</h2>
                        <p className="text-base font-medium text-white/75 mt-2">Connect and manage your cloud documents</p>
                      </div>
                    </div>
                    {dropboxConnected && (
                      <div className="flex items-center gap-3">
                        <Button
                          onClick={handleManualSync}
                          disabled={dropboxLoading}
                          className="h-11 rounded-lg bg-white/10 backdrop-blur-sm px-6 text-sm font-bold text-white border border-white/20 hover:bg-white/20 disabled:opacity-50"
                        >
                          {dropboxLoading ? (
                            <>
                              <svg className="animate-spin size-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Syncing...
                            </>
                          ) : (
                            <>
                              <svg className="size-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                              Sync Now
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.multiple = true;
                            input.onchange = (e) => {
                              const files = (e.target as HTMLInputElement).files;
                              if (files) {
                                Array.from(files).forEach((file) => {
                                  console.log('Uploading:', file.name);
                                });
                                window.alert(`${files.length} file(s) will be uploaded to Dropbox`);
                              }
                            };
                            input.click();
                          }}
                          className="h-11 rounded-lg bg-gradient-to-r from-[#ea8c47] to-[#f3b372] px-6 text-sm font-bold text-[#000000] hover:shadow-lg"
                        >
                          <Upload className="size-4 mr-2" />
                          Upload File
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-8">
                  {!dropboxConnected ? (
                    /* Connect Dropbox State */
                    <div className={cn("rounded-xl border-2 border-dashed p-12 text-center", darkMode ? "border-[#5d4737] bg-gradient-to-br from-[#211a16] to-[#181310]" : "border-slate-300 bg-gradient-to-br from-slate-50 to-white")}>
                      <div className="flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-[#ea8c47]/10 to-[#f3b372]/10 mx-auto mb-6">
                        <HardDrive className="size-10 text-[#ea8c47]" />
                      </div>
                      <h3 className={cn("text-2xl font-extrabold mb-3", textPrimary)}>Connect Your Dropbox</h3>
                      <p className={cn("text-base font-medium max-w-md mx-auto mb-8", textSecondary)}>
                        Securely link your Dropbox to access and reuse your documents across projects.
                      </p>
                      <Button
                        onClick={handleConnectDropbox}
                        disabled={dropboxLoading}
                        className="h-14 rounded-lg bg-gradient-to-r from-[#ea8c47] to-[#f3b372] px-8 text-base font-bold text-[#000000] hover:shadow-lg disabled:opacity-50"
                      >
                        {dropboxLoading ? (
                          <>
                            <svg className="animate-spin size-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Connecting...
                          </>
                        ) : (
                          <>
                            <HardDrive className="size-5 mr-2" />
                            Connect Dropbox
                          </>
                        )}
                      </Button>
                    </div>
                  ) : (
                    /* Connected State - File List */
                    <div className="space-y-6">
                      {/* Project Filter */}
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <Label className={cn("text-sm font-semibold mb-2 block", textPrimary)}>Filter by Folder</Label>
                          <Select value={selectedDropboxFolder} onValueChange={handleDropboxFolderChange}>
                            <SelectTrigger className={cn("w-full h-11 rounded-lg border-2 text-sm font-medium focus-visible:ring-[#ea8c47] focus-visible:border-[#ea8c47]", inputTone)}>
                              <SelectValue placeholder="All Folders" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Folders</SelectItem>
                              {dropboxFolders.map((folder) => (
                                <SelectItem key={folder} value={folder}>
                                  {folder}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-end gap-3">
                          <div className={cn("rounded-lg border-2 px-4 py-3", darkMode ? "bg-emerald-950/30 border-emerald-800" : "bg-emerald-50 border-emerald-200")}>
                            <p className="text-xs font-bold text-emerald-900">✓ Connected</p>
                            <p className="text-xs font-medium text-emerald-700 mt-0.5">
                              {lastSyncedAt ? `Last synced: ${lastSyncedAt.toLocaleString()}` : 'Dropbox synced'}
                            </p>
                          </div>
                          <Button
                            onClick={handleDisconnectDropbox}
                            variant="outline"
                            className={cn("h-11 rounded-lg border-2 px-6 text-sm font-bold", darkMode ? "border-red-800 bg-[#1d1713] text-red-300 hover:bg-red-950/30 hover:border-red-700" : "border-red-300 bg-white text-red-600 hover:bg-red-50 hover:border-red-400")}
                          >
                            <X className="size-4 mr-2" />
                            Disconnect
                          </Button>
                        </div>
                      </div>

                      {/* File List */}
                      {filteredDropboxFiles.length > 0 ? (
                        <div className={cn("rounded-xl border-2 overflow-hidden", borderTone)}>
                          <div className={cn("px-6 py-4 border-b-2", borderTone, lightRoseSurfaceBg)}>
                            <p className={cn("text-sm font-bold", textPrimary)}>
                              {filteredDropboxFiles.length} File(s)
                            </p>
                          </div>
                          <div className={cn("divide-y-2", darkMode ? "divide-[#433327]" : "divide-slate-200")}>
                            {paginatedDropboxFiles.map((file) => {
                              const getFileIcon = (type: string) => {
                                switch (type) {
                                  case 'PDF': return 'bg-red-500';
                                  case 'DOCX': case 'DOC': return 'bg-blue-500';
                                  case 'XLSX': case 'XLS': return 'bg-green-500';
                                  case 'PPTX': case 'PPT': return 'bg-orange-500';
                                  default: return 'bg-slate-500';
                                }
                              };

                              return (
                                <div
                                  key={file.id}
                                  className={cn(
                                    "px-6 py-4 flex items-center justify-between transition-colors group",
                                    darkMode ? "hover:bg-[#2a211c]" : "hover:bg-[#fff5ee]"
                                  )}
                                >
                                  <div className="flex items-center gap-4 flex-1 min-w-0">
                                    <div className={cn("flex size-11 items-center justify-center rounded-lg text-white shadow-sm", getFileIcon(file.type))}>
                                      <span className="text-xs font-extrabold">{file.type}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className={cn("text-sm font-bold truncate", textPrimary)}>{file.name}</p>
                                      <p className={cn("text-xs font-medium mt-0.5", textSecondary)}>{file.size} • {file.modified}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 ml-4">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => window.open(`#preview-${file.id}`, '_blank')}
                                      className={cn("h-9 px-4 text-xs font-semibold", neutralButtonTone)}
                                    >
                                      <ExternalLink className="size-3.5 mr-1.5" />
                                      View
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => window.alert(`Downloading ${file.name}`)}
                                      className={cn("h-9 px-4 text-xs font-semibold", neutralButtonTone)}
                                    >
                                      <Download className="size-3.5 mr-1.5" />
                                      Download
                                    </Button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Pagination Controls */}
                          {totalDropboxPages > 1 && (
                            <div className={cn("border-t-2 border-slate-200 px-6 py-4", lightRoseSurfaceBg)}>
                              <div className="flex items-center justify-between">
                                <p className={cn("text-sm font-medium", textMuted)}>
                                  Showing {((dropboxCurrentPage - 1) * itemsPerPage) + 1}-{Math.min(dropboxCurrentPage * itemsPerPage, filteredDropboxFiles.length)} of {filteredDropboxFiles.length}
                                </p>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => setDropboxCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={dropboxCurrentPage === 1}
                                    className={cn("px-4 py-2 rounded-lg border-2 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all", neutralButtonTone)}
                                  >
                                    Previous
                                  </button>
                                  {Array.from({ length: totalDropboxPages }, (_, i) => i + 1).map(page => (
                                    <button
                                      key={page}
                                      onClick={() => setDropboxCurrentPage(page)}
                                      className={cn(
                                        "w-10 h-10 rounded-lg border-2 text-sm font-bold transition-all",
                                        dropboxCurrentPage === page
                                          ? "border-[#ea8c47] bg-gradient-to-r from-[#ea8c47] to-[#f3b372] text-white"
                                          : neutralButtonTone
                                      )}
                                    >
                                      {page}
                                    </button>
                                  ))}
                                  <button
                                    onClick={() => setDropboxCurrentPage(prev => Math.min(totalDropboxPages, prev + 1))}
                                    disabled={dropboxCurrentPage === totalDropboxPages}
                                    className={cn("px-4 py-2 rounded-lg border-2 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all", neutralButtonTone)}
                                  >
                                    Next
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        /* Empty State */
                        <div className={cn("rounded-xl border-2 border-dashed p-12 text-center", darkMode ? "border-[#5d4737]" : "border-slate-300", lightRoseSurfaceBg)}>
                          <div className={cn("flex size-16 items-center justify-center rounded-full mx-auto mb-4", darkMode ? "bg-[#2a211c]" : "bg-slate-200")}>
                            <File className={cn("size-8", darkMode ? "text-[#8f7966]" : "text-slate-400")} />
                          </div>
                          <p className={cn("text-lg font-bold", textPrimary)}>No documents available</p>
                          <p className={cn("text-sm font-medium mt-2", textSecondary)}>
                            Upload files or connect Dropbox to get started
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Save Settings Button */}
              <div className="flex justify-end gap-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setActiveTemplateForProcess({ Memo: true, Deck: true, Email: true });
                    setSelectedTemplateForProcessing({ Memo: "default", Deck: "default", Email: "default" });
                    setAiModel("gpt-4");
                    setAutoSaveEnabled(true);
                    setAutoGenerateSummary(false);
                    setEmailNotifications(true);
                    window.alert("Settings reset to defaults");
                  }}
                  className={cn("h-14 rounded-lg border-2 px-8 text-base font-bold", neutralButtonTone)}
                >
                  Reset to Defaults
                </Button>
                <Button
                  onClick={() => {
                    console.log("Saving settings:", {
                      activeTemplateForProcess,
                      selectedTemplateForProcessing,
                      aiModel,
                      autoSaveEnabled,
                      autoGenerateSummary,
                    });
                    window.alert("Settings saved successfully!");
                  }}
                  className="h-14 rounded-lg bg-gradient-to-r from-[#ea8c47] to-[#f3b372] px-8 text-base font-bold text-[#000000] hover:shadow-lg"
                >
                  <Check className="size-5 mr-2" />
                  Save Settings
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
