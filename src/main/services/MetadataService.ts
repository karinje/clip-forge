import ffmpeg from 'fluent-ffmpeg';
import { Logger } from '../utils/logger';

const logger = new Logger('MetadataService');

export interface VideoMetadata {
  duration: number;
  width: number;
  height: number;
  format: string;
  codec: string;
  fileSize: number;
  bitrate?: number;
  fps?: number;
}

export class MetadataService {
  async getVideoMetadata(filePath: string): Promise<VideoMetadata> {
    logger.info('Extracting metadata from:', filePath);

    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) {
          logger.error('Failed to extract metadata:', err);
          reject(err);
          return;
        }

        const videoStream = metadata.streams.find(
          (s) => s.codec_type === 'video'
        );

        if (!videoStream) {
          const error = new Error('No video stream found');
          logger.error('No video stream found in file');
          reject(error);
          return;
        }

        const result: VideoMetadata = {
          duration: metadata.format.duration || 0,
          width: videoStream.width || 0,
          height: videoStream.height || 0,
          format: metadata.format.format_name || '',
          codec: videoStream.codec_name || '',
          fileSize: metadata.format.size || 0,
          bitrate: metadata.format.bit_rate,
          fps: this.getFps(videoStream),
        };

        logger.info('Metadata extracted successfully:', result);
        resolve(result);
      });
    });
  }

  private getFps(stream: any): number | undefined {
    if (stream.r_frame_rate) {
      const [num, den] = stream.r_frame_rate.split('/').map(Number);
      return den ? num / den : undefined;
    }
    return undefined;
  }
}

export const metadataService = new MetadataService();

