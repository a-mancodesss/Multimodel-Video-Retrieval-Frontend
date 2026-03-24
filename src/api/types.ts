export type StreamStatus =
  | 'initiating'
  | 'processing'
  | 'creating_video'
  | 'complete'

export interface StreamOutput {
  status: StreamStatus
  timestamps: [number, number][]
}

export interface UploadResponse {
  message: string
}

export interface HistoryEntry {
  id: string
  prompt: string
  filename: string
  timestamps: [number, number][]
  file: File
  createdAt: Date
}
