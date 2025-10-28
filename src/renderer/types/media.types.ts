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
}

