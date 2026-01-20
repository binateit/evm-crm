import { Result } from "./result.types";

// File type enum matching backend
export enum FileType {
  Image = 1,
  Document = 2,
  DocumentImage = 3,
}

// Request types
export interface FileUploadRequest {
  name: string | null;
  extension: string | null;
  data: string | null; // Base64 encoded data
}

export interface BatchFileUploadRequest {
  files: FileUploadRequest[] | null;
}

// Response types
export interface FileUploadResponse {
  filePath: string | null;
  fileName: string | null;
  fileSize: number;
}

export interface BatchFileUploadResponse {
  files: FileUploadResponse[] | null;
  totalCount: number;
  totalSize: number;
}

// Result wrapper types
export type FileUploadResponseResult = Result<FileUploadResponse>;
export type BatchFileUploadResponseResult = Result<BatchFileUploadResponse>;
