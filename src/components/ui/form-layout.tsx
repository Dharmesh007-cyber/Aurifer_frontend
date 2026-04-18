"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export type CreateProjectFormData = {
  clientName: string;
  projectName: string;
  projectContext: string;
  documentType: string;
  projectId: string;
  prompt: string;
  referenceFiles: string[];
};

type WorkspaceFormProps = {
  data: CreateProjectFormData;
  isFieldAtLimit: (field: "projectName" | "clientName" | "projectContext" | "prompt") => boolean;
  onLimitedFieldChange: (
    field: "projectName" | "clientName" | "projectContext" | "prompt",
    value: string
  ) => void;
  onDocumentTypeChange: (value: string) => void;
  onReferenceFilesAdd: (files: string[]) => void;
  onReferenceFileRemove: (index: number) => void;
  onCancel: () => void;
  onSubmit: () => void;
  isSubmitDisabled: boolean;
  autoGenerateEnabled: boolean;
  onAutoGenerateToggle: (enabled: boolean) => void;
};

export default function WorkspaceForm({
  data,
  isFieldAtLimit,
  onLimitedFieldChange,
  onDocumentTypeChange,
  onReferenceFilesAdd,
  onReferenceFileRemove,
  onCancel,
  onSubmit,
  isSubmitDisabled,
  autoGenerateEnabled,
  onAutoGenerateToggle,
}: WorkspaceFormProps) {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h3 className="text-4xl font-bold text-[#000000]">Create New Project</h3>
        <p className="mt-3 text-lg text-slate-600">Fill in the project details below to generate professional legal-tax documents.</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-10 shadow-lg">
        <div className="space-y-8">
          {/* Project ID and Name */}
          <div className="grid gap-6 md:grid-cols-4">
            <div className="md:col-span-1">
              <Label className="font-semibold text-[#000000] text-base">Project ID</Label>
              <div className="mt-3 rounded-lg border-2 border-[#ea8c47]/30 bg-gradient-to-r from-[#ea8c47]/10 to-[#f3b372]/10 px-4 py-3 text-base font-bold text-[#ea8c47]">
                {data.projectId}
              </div>
            </div>
            <div className="md:col-span-3">
              <Label htmlFor="projectName" className="font-semibold text-[#000000] text-base">
                Project Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="projectName"
                value={data.projectName}
                onChange={(e) => onLimitedFieldChange("projectName", e.target.value)}
                placeholder="Enter project name"
                className={cn("mt-3 h-12 text-base", isFieldAtLimit("projectName") && "border-red-500 bg-red-50")}
              />
            </div>
          </div>

          <Separator />

          {/* Client Name */}
          <div>
            <Label htmlFor="clientName" className="font-semibold text-[#000000] text-base">
              Client Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="clientName"
              value={data.clientName}
              onChange={(e) => onLimitedFieldChange("clientName", e.target.value)}
              placeholder="Enter client name"
              className={cn("mt-3 h-12 text-base", isFieldAtLimit("clientName") && "border-red-500 bg-red-50")}
            />
          </div>

          <Separator />

          {/* Project Context */}
          <div>
            <Label htmlFor="projectContext" className="font-semibold text-[#000000] text-base">
              Project Context <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="projectContext"
              value={data.projectContext}
              onChange={(e) => onLimitedFieldChange("projectContext", e.target.value)}
              placeholder="Describe the project requirements and objectives"
              className={cn("mt-3 min-h-[140px] text-base", isFieldAtLimit("projectContext") && "border-red-500 bg-red-50")}
            />
          </div>

          <Separator />

          {/* Document Type Dropdown */}
          <div>
            <Label className="font-semibold text-[#000000] text-base">
              Document Type <span className="text-red-500">*</span>
            </Label>
            <Select value={data.documentType} onValueChange={(value) => onDocumentTypeChange(value ?? "")}>
              <SelectTrigger className="mt-3 h-14 text-lg font-medium">
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Memo" className="text-base py-3">
                  <div className="flex flex-col">
                    <span className="font-semibold">Memo</span>
                    <span className="text-sm text-slate-500">Detailed advisory document</span>
                  </div>
                </SelectItem>
                <SelectItem value="Deck" className="text-base py-3">
                  <div className="flex flex-col">
                    <span className="font-semibold">Deck</span>
                    <span className="text-sm text-slate-500">Executive presentation</span>
                  </div>
                </SelectItem>
                <SelectItem value="Email" className="text-base py-3">
                  <div className="flex flex-col">
                    <span className="font-semibold">Email</span>
                    <span className="text-sm text-slate-500">Client communication draft</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Prompt */}
          <div>
            <Label htmlFor="prompt" className="font-semibold text-[#000000] text-base">
              Prompt for Document Generation <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="prompt"
              value={data.prompt}
              onChange={(e) => onLimitedFieldChange("prompt", e.target.value)}
              placeholder="Provide detailed instructions for the AI to generate your document"
              className={cn("mt-3 min-h-[180px] text-base", isFieldAtLimit("prompt") && "border-red-500 bg-red-50")}
            />
          </div>

          <Separator />

          {/* Reference Documents */}
          <div>
            <Label className="font-semibold text-[#000000] text-base">Reference Documents</Label>
            <p className="mt-2 text-sm text-slate-500">Upload supporting documents (PDF, DOCX, XLSX, TXT)</p>
            <div className="mt-4 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <input
                type="file"
                multiple
                accept=".pdf,.docx,.xlsx,.txt"
                onChange={(e) => onReferenceFilesAdd(Array.from(e.target.files || []).map((f) => f.name))}
                className="block w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#ea8c47] file:text-white hover:file:bg-[#d97733]"
              />
            </div>
            {data.referenceFiles.length > 0 && (
              <ul className="mt-6 space-y-3">
                {data.referenceFiles.map((file, index) => (
                  <li key={`${file}-${index}`} className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-lg bg-[#ea8c47]/10">
                        <svg className="size-5 text-[#ea8c47]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <span className="font-medium text-[#000000]">{file}</span>
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={() => onReferenceFileRemove(index)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                      Remove
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <Separator className="my-10" />
        
        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-4">
          {/* Dropbox Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onAutoGenerateToggle(!autoGenerateEnabled)}
              className={cn(
                "relative inline-flex h-7 w-14 items-center rounded-full transition-colors",
                autoGenerateEnabled ? "bg-[#ea8c47]" : "bg-slate-300"
              )}
            >
              <span
                className={cn(
                  "inline-block size-5 transform rounded-full bg-white transition-transform shadow-md",
                  autoGenerateEnabled ? "translate-x-8" : "translate-x-1"
                )}
              />
            </button>
            <div>
              <p className="text-sm font-bold text-[#000000]">Dropbox</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4">
            <Button type="button" variant="outline" onClick={onCancel} className="h-12 px-8 text-base font-semibold">
              Cancel
            </Button>
            <Button type="button" onClick={onSubmit} disabled={isSubmitDisabled} className="h-12 bg-gradient-to-r from-[#000000] to-[#424242] text-white px-10 text-base font-semibold hover:shadow-lg disabled:opacity-50">
              Generate AI Draft
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

