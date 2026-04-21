"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  FolderOpen,
  CheckCircle,
  Circle,
  ChevronRight,
  BookOpen,
  HardDrive,
  ArrowLeft,
  Calendar,
  User,
  FileCheck,
  Play,
  Trash2,
  Plus,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ProjectDetails = {
  projectId: string;
  projectName: string;
  clientName: string;
  projectContext: string;
  documentType: string;
  prompt: string;
  referenceFiles: string[];
};

type DropboxFile = {
  id: string;
  name: string;
  path: string;
  size: number;
  type: string;
  modifiedAt: Date;
  folderName: string;
  projectId?: string;
};

type AnalysisWorkspaceProps = {
  projectDetails: ProjectDetails;
  dropboxFiles: DropboxFile[];
  onBack: () => void;
  onProceedToChat: () => void;
};

// Default TOC structure based on document type
const generateTOC = (documentType: string) => {
  const baseTOC = [
    {
      section: "1. Executive Summary",
      topics: ["Overview", "Key Findings", "Recommendations"],
      completed: false,
    },
    {
      section: "2. Background & Context",
      topics: ["Client Situation", "Regulatory Framework", "Scope of Analysis"],
      completed: false,
    },
    {
      section: "3. Detailed Analysis",
      topics: ["Tax Implications", "Compliance Requirements", "Risk Assessment"],
      completed: false,
    },
    {
      section: "4. Strategic Recommendations",
      topics: ["Short-term Actions", "Long-term Strategy", "Implementation Roadmap"],
      completed: false,
    },
    {
      section: "5. Conclusion",
      topics: ["Summary of Findings", "Next Steps"],
      completed: false,
    },
  ];

  if (documentType === "Memo") {
    return baseTOC;
  }

  if (documentType === "Deck") {
    return [
      {
        section: "1. Title Slide",
        topics: ["Project Name", "Client", "Date"],
        completed: false,
      },
      {
        section: "2. Agenda",
        topics: ["Meeting Objectives", "Key Discussion Points"],
        completed: false,
      },
      {
        section: "3. Executive Overview",
        topics: ["Current Situation", "Key Challenges", "Proposed Solutions"],
        completed: false,
      },
      {
        section: "4. Detailed Analysis",
        topics: ["Financial Impact", "Regulatory Compliance", "Risk Matrix"],
        completed: false,
      },
      {
        section: "5. Recommendations",
        topics: ["Strategic Options", "Implementation Timeline", "Resource Requirements"],
        completed: false,
      },
      {
        section: "6. Next Steps",
        topics: ["Action Items", "Timeline", "Responsibilities"],
        completed: false,
      },
    ];
  }

  if (documentType === "Email") {
    return [
      {
        section: "1. Email Structure",
        topics: ["Subject Line", "Salutation", "Opening"],
        completed: false,
      },
      {
        section: "2. Main Content",
        topics: ["Purpose of Communication", "Key Points", "Supporting Details"],
        completed: false,
      },
      {
        section: "3. Call to Action",
        topics: ["Required Actions", "Deadlines", "Contact Information"],
        completed: false,
      },
      {
        section: "4. Closing",
        topics: ["Sign-off", "Attachments Reference", "Disclaimer"],
        completed: false,
      },
    ];
  }

  return baseTOC;
};

export default function AnalysisWorkspace({
  projectDetails,
  dropboxFiles,
  onBack,
  onProceedToChat,
}: AnalysisWorkspaceProps) {
  const [toc, setToc] = useState(() => generateTOC(projectDetails.documentType));
  const [activeSection, setActiveSection] = useState(0);
  const [relevantFiles, setRelevantFiles] = useState<DropboxFile[]>(() => 
    dropboxFiles.filter((file) => {
      const fileName = file.name.toLowerCase();
      const projectName = projectDetails.projectName.toLowerCase();
      const clientName = projectDetails.clientName.toLowerCase();
      const prompt = projectDetails.prompt.toLowerCase();
        
      // Match against project name, client name, or keywords in the prompt
      return (
        file.projectId === projectDetails.projectId ||
        fileName.includes(projectName) ||
        fileName.includes(clientName) ||
        projectName.includes(fileName.split('.')[0]) ||
        clientName.includes(fileName.split('.')[0]) ||
        // Check if prompt mentions the file
        prompt.split(' ').some((word) => word.length > 3 && fileName.includes(word))
      );
    })
  );
  const [showAddFileForm, setShowAddFileForm] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [showAddSectionForm, setShowAddSectionForm] = useState(false);
  const [newSectionName, setNewSectionName] = useState("");
  const [newSectionTopics, setNewSectionTopics] = useState("");

  const toggleTopicComplete = (sectionIndex: number) => {
    setToc((prev) =>
      prev.map((section, idx) =>
        idx === sectionIndex ? { ...section, completed: !section.completed } : section
      )
    );
  };

  const deleteFile = (fileId: string) => {
    setRelevantFiles((prev) => prev.filter((file) => file.id !== fileId));
  };

  const addManualFile = () => {
    if (!newFileName.trim()) return;
    
    const newFile: DropboxFile = {
      id: `manual-${Date.now()}`,
      name: newFileName.trim(),
      path: `/manual/${newFileName.trim()}`,
      size: 0,
      type: "manual",
      modifiedAt: new Date(),
      folderName: "Manual Upload",
    };
    
    setRelevantFiles((prev) => [...prev, newFile]);
    setNewFileName("");
    setShowAddFileForm(false);
  };

  const deleteSection = (sectionIndex: number) => {
    setToc((prev) => {
      const newToc = prev.filter((_, idx) => idx !== sectionIndex);
      if (activeSection >= newToc.length) {
        setActiveSection(Math.max(0, newToc.length - 1));
      }
      return newToc;
    });
  };

  const addSection = () => {
    if (!newSectionName.trim()) return;
    
    const topics = newSectionTopics
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
    
    const newSection = {
      section: newSectionName.trim(),
      topics: topics.length > 0 ? topics : ["New Topic"],
      completed: false,
    };
    
    setToc((prev) => [...prev, newSection]);
    setNewSectionName("");
    setNewSectionTopics("");
    setShowAddSectionForm(false);
  };

  const completedCount = toc.filter((s) => s.completed).length;
  const progressPercentage = toc.length > 0 ? Math.round((completedCount / toc.length) * 100) : 0;

  // Filter Dropbox files relevant to this project based on prompt and project details
  // (Now managed by state)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6 flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <Button
            onClick={onBack}
            variant="outline"
            className="h-12 px-6 text-base font-semibold"
          >
            <ArrowLeft className="size-5 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-[#000000]">
              Project Overview
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              {projectDetails.projectId} - {projectDetails.projectName}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-lg border-2 border-[#ea8c47]/30 bg-gradient-to-r from-[#ea8c47]/10 to-[#f3b372]/10 px-4 py-2">
            <p className="text-sm font-bold text-[#ea8c47]">
              {projectDetails.documentType}
            </p>
          </div>
          <div className="rounded-lg bg-[#ea8c47] px-4 py-2 text-white">
            <p className="text-sm font-bold">Progress: {progressPercentage}%</p>
          </div>
        </div>
      </motion.div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column: Project Details */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="col-span-3 rounded-xl border-2 border-slate-200 bg-white shadow-xl overflow-hidden"
        >
          {/* Project Details Header */}
          <div className="border-b-2 border-slate-200 bg-gradient-to-r from-[#ea8c47] to-[#f3b372] p-5 text-white">
            <div className="flex items-center gap-3">
              <FolderOpen className="size-6" />
              <h2 className="text-xl font-bold">Project Details</h2>
            </div>
          </div>

          <div className="p-5 space-y-5">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileCheck className="size-4 text-[#ea8c47]" />
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Project ID
                </p>
              </div>
              <p className="text-sm font-bold text-[#000000] bg-[#ea8c47]/10 px-3 py-2 rounded-lg">
                {projectDetails.projectId}
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="size-4 text-[#ea8c47]" />
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Project Name
                </p>
              </div>
              <p className="text-sm font-semibold text-[#000000]">
                {projectDetails.projectName}
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <User className="size-4 text-[#ea8c47]" />
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Client Name
                </p>
              </div>
              <p className="text-sm font-semibold text-[#000000]">
                {projectDetails.clientName}
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileCheck className="size-4 text-[#ea8c47]" />
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Document Type
                </p>
              </div>
              <div className="rounded-lg border-2 border-[#ea8c47]/30 bg-gradient-to-r from-[#ea8c47]/10 to-[#f3b372]/10 px-3 py-2">
                <p className="text-sm font-bold text-[#ea8c47]">
                  {projectDetails.documentType}
                </p>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="size-4 text-[#ea8c47]" />
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Project Context
                </p>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg">
                {projectDetails.projectContext}
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="size-4 text-[#ea8c47]" />
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Prompt
                </p>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg">
                {projectDetails.prompt}
              </p>
            </div>

            {projectDetails.referenceFiles.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="size-4 text-[#ea8c47]" />
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Reference Files ({projectDetails.referenceFiles.length})
                  </p>
                </div>
                <ul className="space-y-2">
                  {projectDetails.referenceFiles.map((file, idx) => (
                    <li
                      key={idx}
                      className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
                    >
                      <FileText className="size-4 text-[#ea8c47]" />
                      <span className="text-sm text-[#000000]">{file}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </motion.div>

        {/* Middle Column: Dropbox Files */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="col-span-5 rounded-xl border-2 border-slate-200 bg-white shadow-xl overflow-hidden"
        >
          {/* Dropbox Files Header */}
          <div className="border-b-2 border-slate-200 bg-gradient-to-r from-[#424242] to-[#000000] p-5 text-white">
            <div className="flex items-center gap-3">
              <HardDrive className="size-6" />
              <div>
                <h2 className="text-xl font-bold">Dropbox Files</h2>
                <p className="text-sm text-white/75">
                  {relevantFiles.length} file(s) matched for analysis
                </p>
              </div>
            </div>
          </div>

          <div className="p-5">
            {/* Add File Button */}
            <div className="mb-4">
              <Button
                onClick={() => setShowAddFileForm(!showAddFileForm)}
                variant="outline"
                className="w-full h-10 text-sm font-semibold border-2 border-dashed border-[#ea8c47]/50 hover:border-[#ea8c47] hover:bg-[#ea8c47]/5"
              >
                <Plus className="size-4 mr-2" />
                {showAddFileForm ? "Cancel" : "Add Manual File"}
              </Button>
            </div>

            {/* Add File Form */}
            {showAddFileForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mb-4 p-4 rounded-lg border-2 border-[#ea8c47]/30 bg-[#ea8c47]/5"
              >
                <div className="space-y-3">
                  <input
                    type="text"
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    placeholder="Enter file name (e.g., contract.pdf)"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-[#ea8c47] focus:outline-none"
                    onKeyDown={(e) => e.key === "Enter" && addManualFile()}
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={addManualFile}
                      size="sm"
                      className="flex-1 bg-[#ea8c47] hover:bg-[#ea8c47]/90"
                    >
                      <Plus className="size-4 mr-1" />
                      Add File
                    </Button>
                    <Button
                      onClick={() => {
                        setShowAddFileForm(false);
                        setNewFileName("");
                      }}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {relevantFiles.length === 0 ? (
              <div className="text-center py-16">
                <HardDrive className="size-16 mx-auto mb-4 text-slate-300" />
                <p className="text-base text-slate-500">
                  No Dropbox files found for this project
                </p>
                <p className="text-sm text-slate-400 mt-2">
                  Files will appear here when available
                </p>
              </div>
            ) : (
              <ul className="space-y-3 max-h-[520px] overflow-y-auto">
                {relevantFiles.map((file) => (
                  <li
                    key={file.id}
                    className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 hover:border-[#ea8c47]/50 hover:bg-[#ea8c47]/5 transition-all group"
                  >
                    <FileText className="size-5 text-[#ea8c47] mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#000000] truncate">
                        {file.name}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <FolderOpen className="size-3" />
                          {file.folderName}
                        </span>
                        {file.size > 0 && <span>{(file.size / 1024).toFixed(1)} KB</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="size-5 text-green-500 flex-shrink-0" />
                      <button
                        onClick={() => deleteFile(file.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-100 rounded"
                        title="Remove file"
                      >
                        <Trash2 className="size-4 text-red-500" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </motion.div>

        {/* Right Column: Task Outline & TOC */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="col-span-4 rounded-xl border-2 border-slate-200 bg-white shadow-xl overflow-hidden flex flex-col"
        >
          <div className="border-b-2 border-slate-200 bg-gradient-to-r from-[#000000] to-[#424242] p-5 text-white">
            <div className="flex items-center gap-3">
              <BookOpen className="size-6" />
              <div>
                <h2 className="text-xl font-bold">Analysis Outline</h2>
                <p className="text-sm text-white/75">
                  Table of Contents (TOC)
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 flex-1 flex flex-col">
            {/* Progress Bar */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-slate-600">
                  Overall Progress
                </p>
                <p className="text-xs font-bold text-[#ea8c47]">
                  {completedCount}/{toc.length} sections
                </p>
              </div>
              <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-[#ea8c47] to-[#f3b372]"
                />
              </div>
            </div>

            {/* Add Section Button */}
            <div className="mb-4">
              <Button
                onClick={() => setShowAddSectionForm(!showAddSectionForm)}
                variant="outline"
                className="w-full h-10 text-sm font-semibold border-2 border-dashed border-[#ea8c47]/50 hover:border-[#ea8c47] hover:bg-[#ea8c47]/5"
              >
                <Plus className="size-4 mr-2" />
                {showAddSectionForm ? "Cancel" : "Add New Section"}
              </Button>
            </div>

            {/* Add Section Form */}
            {showAddSectionForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mb-4 p-4 rounded-lg border-2 border-[#ea8c47]/30 bg-[#ea8c47]/5"
              >
                <div className="space-y-3">
                  <input
                    type="text"
                    value={newSectionName}
                    onChange={(e) => setNewSectionName(e.target.value)}
                    placeholder="Section name (e.g., 6. Risk Analysis)"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-[#ea8c47] focus:outline-none"
                  />
                  <input
                    type="text"
                    value={newSectionTopics}
                    onChange={(e) => setNewSectionTopics(e.target.value)}
                    placeholder="Topics (comma-separated, e.g., Market Risk, Financial Risk)"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-[#ea8c47] focus:outline-none"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={addSection}
                      size="sm"
                      className="flex-1 bg-[#ea8c47] hover:bg-[#ea8c47]/90"
                    >
                      <Plus className="size-4 mr-1" />
                      Add Section
                    </Button>
                    <Button
                      onClick={() => {
                        setShowAddSectionForm(false);
                        setNewSectionName("");
                        setNewSectionTopics("");
                      }}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TOC Sections */}
            <div className="space-y-3 max-h-[450px] overflow-y-auto flex-1">
              {toc.map((section, index) => (
                <div
                  key={index}
                  className={cn(
                    "rounded-lg border-2 transition-all cursor-pointer",
                    activeSection === index
                      ? "border-[#ea8c47] bg-[#ea8c47]/5"
                      : "border-slate-200 bg-white hover:border-slate-300",
                    section.completed && "border-green-400 bg-green-50"
                  )}
                  onClick={() => setActiveSection(index)}
                >
                  {/* Section Header */}
                  <div className="p-3 flex items-start gap-2 group">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTopicComplete(index);
                      }}
                      className="mt-0.5 flex-shrink-0"
                    >
                      {section.completed ? (
                        <CheckCircle className="size-5 text-green-500" />
                      ) : (
                        <Circle className="size-5 text-slate-400" />
                      )}
                    </button>
                    <div className="flex-1">
                      <p
                        className={cn(
                          "text-sm font-bold",
                          section.completed
                            ? "text-green-700 line-through"
                            : "text-[#000000]"
                        )}
                      >
                        {section.section}
                      </p>
                      <ChevronRight
                        className={cn(
                          "size-4 mt-1 transition-transform",
                          activeSection === index && "rotate-90",
                          "text-slate-500"
                        )}
                      />
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSection(index);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-100 rounded flex-shrink-0"
                      title="Delete section"
                    >
                      <X className="size-4 text-red-500" />
                    </button>
                  </div>

                  {/* Topics (expandable) */}
                  {activeSection === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-3 pb-3 pt-1"
                    >
                      <div className="ml-7 space-y-1">
                        {section.topics.map((topic, topicIdx) => (
                          <div
                            key={topicIdx}
                            className="flex items-center gap-2 text-xs text-slate-600"
                          >
                            <div className="size-1.5 rounded-full bg-[#ea8c47]" />
                            <span>{topic}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Start Process Button */}
          <div className="border-t-2 border-slate-200 p-5 bg-gradient-to-r from-slate-50 to-white">
            <Button
              onClick={onProceedToChat}
              className="w-full h-14 text-base font-bold bg-gradient-to-r from-[#ea8c47] to-[#f3b372] hover:shadow-lg hover:shadow-[#ea8c47]/30 transition-all"
            >
              <Play className="size-5 mr-2" />
              Start Analysis & Proceed to Chat
            </Button>
            <p className="text-xs text-center text-slate-500 mt-3">
              This will initialize the AI analysis and open the chat interface
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
