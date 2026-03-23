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
