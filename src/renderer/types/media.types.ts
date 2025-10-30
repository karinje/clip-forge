export interface MediaClip {
  id: string;
  name: string;
  filePath: string;
  duration: number;
  resolution: { width: number; height: number };
  format: string;
  codec: string;
  fileSize: number;
  fps?: number;
  bitrate?: number;
  thumbnail?: string;
  createdAt: Date;
  type?: 'video' | 'audio'; // Type of media file
  hasVideo?: boolean; // Whether file has video stream
  hasAudio?: boolean; // Whether file has audio stream
}

