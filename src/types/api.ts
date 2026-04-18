// Shared types matching backend Pydantic schemas

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Project {
  id: string;
  project_id: string;
  project_name: string;
  client_name: string;
  project_context: string | null;
  document_type: string;
  prompt: string | null;
  status: string;
  progress: number;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentSection {
  id: string;
  type: "heading" | "paragraph" | "bullet_list" | "numbered_list" | "table" | "callout";
  content?: string;
  level?: number;
  items?: string[];
  headers?: string[];
  rows?: string[][];
  variant?: string;
}

export interface DocumentMetadata {
  client_name: string;
  prepared_by: string;
  date: string;
  version: number;
}

export interface DocumentContent {
  document_id?: string;
  project_id: string;
  document_type: string;
  title: string;
  metadata: DocumentMetadata;
  sections: DocumentSection[];
  sources?: Array<{
    file: string;
    chunk_ids: string[];
    relevance_score: number;
  }>;
}

export interface DocumentResponse {
  id: string;
  title: string;
  document_type: string;
  content_json: DocumentContent | null;
  version: number;
  is_finalized: boolean;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  message_type: string;
  metadata_json: Record<string, unknown> | null;
  created_at: string;
}

export interface DocumentPatch {
  section_id: string;
  action: "replace" | "insert_after" | "delete";
  after_section?: string;
  new_content?: DocumentSection;
}

export interface ChatStreamEvent {
  type: "chat_token" | "document_update" | "done" | "error";
  content?: string;
  patches?: DocumentPatch[];
}

export interface DropboxConnection {
  connected: boolean;
  connected_at?: string;
  last_synced_at?: string;
  account_id?: string;
  root_folder_path?: string;
}

export interface DropboxFile {
  id: string;
  name: string;
  path: string;
  size: number;
  file_type: string;
  modified_at?: string;
  client_name?: string;
  ingestion_status?: string;
}

export interface ExportResponse {
  download_url: string;
  file_name: string;
  format: string;
  size?: number;
}
