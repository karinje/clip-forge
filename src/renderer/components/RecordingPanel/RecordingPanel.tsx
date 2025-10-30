import React, { useState, useRef, useEffect } from 'react';
import { useProjectStore } from '../../store/projectStore';
import { useTimelineStore } from '../../store/timelineStore';
import { formatTime } from '../../utils/timeFormatters';
import styles from './RecordingPanel.module.css';

interface RecordingSource {
  id: string;
  name: string;
  thumbnail: string;
  type: 'screen' | 'window';
}

export const RecordingPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [recordingType, setRecordingType] = useState<'screen' | 'webcam' | 'screen-camera'>('screen');
  const [sources, setSources] = useState<RecordingSource[]>([]);
  const [selectedSource, setSelectedSource] = useState<RecordingSource | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const recordingTimeRef = useRef<number>(0); // Store final recording time
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const screenVideoRef = useRef<HTMLVideoElement>(null);
  const cameraVideoRef = useRef<HTMLVideoElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  
  const addClip = useProjectStore(state => state.addClip);
  const addClipToTimeline = useTimelineStore(state => state.addClipToTimeline);
  const showCentiseconds = useTimelineStore(state => state.showCentiseconds);
  
  // Load sources when panel opens for screen recording
  useEffect(() => {
    if (isOpen && (recordingType === 'screen' || recordingType === 'screen-camera')) {
      loadSources();
    }
  }, [isOpen, recordingType]);
  
  // Start timer when recording
  useEffect(() => {
    if (isRecording) {
      setRecordingTime(0); // Reset to 0 when starting
      recordingTimeRef.current = 0; // Also reset ref
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          console.log('Timer tick, current time:', prev);
          return prev + 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      // Don't reset time here - we need it for saving
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isRecording]);
  
  // Update video preview when stream changes
  useEffect(() => {
    if (videoPreviewRef.current && stream) {
      videoPreviewRef.current.srcObject = stream;
    }
  }, [stream]);
  
  const loadSources = async () => {
    try {
      const sourceList = await window.electronAPI.getRecordingSources();
      setSources(sourceList);
      if (sourceList.length > 0) {
        setSelectedSource(sourceList[0]);
      }
    } catch (err) {
      setError('Failed to load recording sources');
    }
  };
  
  const startScreenRecording = async () => {
    if (!selectedSource) return;
    
    try {
      setError(null);
      
      // Get screen stream using the selected source
      const screenStream = await (navigator.mediaDevices as any).getUserMedia({
        audio: false,
        video: {
          mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: selectedSource.id,
          }
        }
      });
      
      // Get audio stream from microphone
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const combinedStream = new MediaStream([
          ...screenStream.getVideoTracks(),
          ...audioStream.getAudioTracks(),
        ]);
        setStream(combinedStream);
        startRecording(combinedStream);
      } catch (audioErr) {
        // No microphone, record without audio
        setStream(screenStream);
        startRecording(screenStream);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to start screen recording');
    }
  };
  
  const startWebcamRecording = async () => {
    try {
      setError(null);
      
      const webcamStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: true
      });
      
      setStream(webcamStream);
      startRecording(webcamStream);
    } catch (err: any) {
      setError(err.message || 'Failed to start webcam recording');
    }
  };
  
  const startScreenCameraRecording = async () => {
    if (!selectedSource) {
      console.error('No source selected');
      return;
    }
    
    console.log('Starting screen + camera recording with source:', selectedSource.id);
    
    try {
      setError(null);
      
      // Get screen stream
      console.log('Requesting screen stream...');
      const screenStream = await (navigator.mediaDevices as any).getUserMedia({
        audio: false,
        video: {
          mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: selectedSource.id,
          }
        }
      });
      console.log('Screen stream obtained:', screenStream.getVideoTracks()[0].label);
      
      // Get webcam stream
      console.log('Requesting webcam stream...');
      const cameraStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 360 }
        },
        audio: false  // We'll get audio from microphone separately
      });
      console.log('Camera stream obtained:', cameraStream.getVideoTracks()[0].label);
      
      // Get audio stream from microphone
      let audioStream: MediaStream | null = null;
      try {
        console.log('Requesting microphone stream...');
        audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log('Audio stream obtained');
      } catch (audioErr) {
        console.warn('No microphone available, recording without audio');
      }
      
      // Store streams in refs
      screenStreamRef.current = screenStream;
      cameraStreamRef.current = cameraStream;
      
      // Setup video elements for composition
      if (!screenVideoRef.current) {
        screenVideoRef.current = document.createElement('video');
      }
      if (!cameraVideoRef.current) {
        cameraVideoRef.current = document.createElement('video');
      }
      
      screenVideoRef.current.srcObject = screenStream;
      cameraVideoRef.current.srcObject = cameraStream;
      
      console.log('Waiting for video metadata to load...');
      
      // Wait for both videos to load
      await Promise.all([
        new Promise<void>((resolve) => {
          const video = screenVideoRef.current!;
          if (video.readyState >= 2) {
            // Metadata already loaded
            console.log('Screen video already loaded');
            video.play();
            resolve();
          } else {
            video.onloadedmetadata = () => {
              console.log('Screen video metadata loaded');
              video.play();
              resolve();
            };
          }
        }),
        new Promise<void>((resolve) => {
          const video = cameraVideoRef.current!;
          if (video.readyState >= 2) {
            // Metadata already loaded
            console.log('Camera video already loaded');
            video.play();
            resolve();
          } else {
            video.onloadedmetadata = () => {
              console.log('Camera video metadata loaded');
              video.play();
              resolve();
            };
          }
        })
      ]);
      
      console.log('Both videos loaded, starting composition');
      
      // Start compositing to canvas
      startCanvasComposition(screenStream, cameraStream, audioStream);
    } catch (err: any) {
      console.error('Error in startScreenCameraRecording:', err);
      setError(err.message || 'Failed to start screen + camera recording');
      // Clean up any streams that were created
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(track => track.stop());
        screenStreamRef.current = null;
      }
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach(track => track.stop());
        cameraStreamRef.current = null;
      }
    }
  };
  
  const startCanvasComposition = (
    screenStream: MediaStream,
    cameraStream: MediaStream,
    audioStream: MediaStream | null
  ) => {
    // Set recording state first so canvas JSX element gets rendered
    setIsRecording(true);
    
    // Wait for next frame to ensure canvas is rendered
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        continueCanvasComposition(screenStream, cameraStream, audioStream);
      });
    });
  };
  
  const continueCanvasComposition = (
    screenStream: MediaStream,
    cameraStream: MediaStream,
    audioStream: MediaStream | null
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.error('Canvas element not found!');
      setError('Canvas element not available');
      setIsRecording(false);
      return;
    }
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setError('Failed to create canvas context');
      setIsRecording(false);
      return;
    }
    
    // Get screen dimensions from video
    const screenVideo = screenVideoRef.current!;
    const cameraVideo = cameraVideoRef.current!;
    
    // Set canvas size to screen video size
    canvas.width = screenVideo.videoWidth || 1920;
    canvas.height = screenVideo.videoHeight || 1080;
    
    console.log('Canvas composition started:', {
      canvasWidth: canvas.width,
      canvasHeight: canvas.height,
      screenVideoWidth: screenVideo.videoWidth,
      screenVideoHeight: screenVideo.videoHeight
    });
    
    // Calculate PiP dimensions (25% of screen size, bottom-right)
    const pipScale = 0.25;
    const pipWidth = canvas.width * pipScale;
    const pipHeight = canvas.height * pipScale;
    const pipX = canvas.width - pipWidth - 20; // 20px padding from right
    const pipY = canvas.height - pipHeight - 20; // 20px padding from bottom
    
    // Animation loop to composite streams
    const drawFrame = () => {
      if (!screenStreamRef.current) {
        // Stop animation if recording stopped
        return;
      }
      
      // Draw screen video (full size)
      ctx.drawImage(screenVideo, 0, 0, canvas.width, canvas.height);
      
      // Draw camera video (PiP in bottom-right)
      ctx.drawImage(cameraVideo, pipX, pipY, pipWidth, pipHeight);
      
      // Draw border around PiP
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.strokeRect(pipX, pipY, pipWidth, pipHeight);
      
      animationFrameRef.current = requestAnimationFrame(drawFrame);
    };
    
    drawFrame();
    
    // Capture canvas stream
    console.log('Capturing canvas stream at 30 FPS...');
    const canvasStream = canvas.captureStream(30); // 30 FPS
    console.log('Canvas stream created, video tracks:', canvasStream.getVideoTracks().length);
    
    // Add audio track if available
    if (audioStream) {
      const audioTracks = audioStream.getAudioTracks();
      console.log('Adding audio tracks:', audioTracks.length);
      audioTracks.forEach(track => canvasStream.addTrack(track));
    }
    
    console.log('Setting stream and starting recording...');
    setStream(canvasStream);
    startRecording(canvasStream, true); // Skip setIsRecording since we already set it
  };
  
  const startRecording = (mediaStream: MediaStream, skipSetRecording = false) => {
    chunksRef.current = [];
    
    const options = {
      mimeType: 'video/webm;codecs=vp9',
      videoBitsPerSecond: 2500000, // 2.5 Mbps
    };
    
    try {
      mediaRecorderRef.current = new MediaRecorder(mediaStream, options);
    } catch (e) {
      // Fallback to default codec
      mediaRecorderRef.current = new MediaRecorder(mediaStream);
    }
    
    mediaRecorderRef.current.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };
    
    mediaRecorderRef.current.onstop = async () => {
      await saveRecording();
    };
    
    mediaRecorderRef.current.start();
    
    // Only set isRecording if not already set (for screen-camera mode it's set earlier)
    if (!skipSetRecording) {
      setIsRecording(true);
    }
  };
  
  const stopRecording = () => {
    // Capture the recording time BEFORE stopping - store in ref
    const finalRecordingTime = recordingTime;
    recordingTimeRef.current = finalRecordingTime;
    console.log('Stopping recording, duration:', finalRecordingTime, 'seconds');
    
    // Stop canvas animation
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    // Stop media recorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    
    // Stop combined stream
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    
    // Stop individual streams for screen+camera mode
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
      screenStreamRef.current = null;
    }
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach(track => track.stop());
      cameraStreamRef.current = null;
    }
    
    setIsRecording(false);
  };
  
  const saveRecording = async () => {
    const blob = new Blob(chunksRef.current, { type: 'video/webm' });
    const fileName = `recording_${Date.now()}.webm`;
    // Get duration from ref (captured before stopping)
    const estimatedDuration = recordingTimeRef.current;
    
    console.log('Saving recording:', {
      fileName,
      blobSize: blob.size,
      estimatedDuration,
      recordingTime,
      chunks: chunksRef.current.length
    });
    
    try {
      // Convert blob to ArrayBuffer for IPC
      const arrayBuffer = await blob.arrayBuffer();
      const result = await window.electronAPI.saveRecordingFile(arrayBuffer, fileName);
      
      console.log('Save result:', result);
      
      if (result.success && result.filePath) {
        // Wait a bit for file to be fully written
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Get metadata and add to project
        const metadataResult = await window.electronAPI.getVideoMetadata(result.filePath);
        
        console.log('Metadata result:', metadataResult);
        
        if (metadataResult.success && metadataResult.metadata && metadataResult.metadata.duration > 0) {
          const metadata = metadataResult.metadata;
          
          console.log('✅ Got metadata from ffprobe:', {
            ffprobeDuration: metadata.duration,
            estimatedDuration,
            recordingTime: recordingTime / 1000,
            width: metadata.width,
            height: metadata.height
          });
          
          // IMPORTANT: Use the ESTIMATED duration (from timer) instead of ffprobe
          // WebM files can sometimes report incorrect duration in metadata
          const actualDuration = estimatedDuration;
          console.log('📊 Using estimated duration from timer:', actualDuration);
          
          const clipId = `clip-${Date.now()}`;
          const newClip = {
            id: clipId,
            name: fileName,
            filePath: result.filePath,
            duration: actualDuration, // Use timer-based duration, not ffprobe
            resolution: {
              width: metadata.width || 1920,
              height: metadata.height || 1080,
            },
            format: metadata.format || 'webm',
            codec: metadata.codec || 'vp9',
            fps: metadata.fps,
            fileSize: blob.size,
            createdAt: new Date(),
          };
          
          console.log('📹 Adding clip to library with ID:', clipId, 'duration:', actualDuration);
          
          // IMPORTANT: Add to library first
          addClip(newClip);
          
          // Wait a tick for state to update
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Then add to timeline using the SAME clip ID
          console.log('⏱️ Adding to timeline - clipId:', clipId, 'duration:', actualDuration);
          addClipToTimeline(clipId, actualDuration);
          
          setIsOpen(false);
          setError(null);
        } else {
          // If metadata fails, still add the clip with estimated duration
          console.warn('Metadata extraction failed, using estimated duration:', estimatedDuration);
          
          // Use estimated duration, but make sure it's valid
          const finalDuration = estimatedDuration > 0 ? estimatedDuration : 10; // Fallback to 10s if somehow 0
          
          const clipId = `clip-${Date.now()}`;
          const newClip = {
            id: clipId,
            name: fileName,
            filePath: result.filePath,
            duration: finalDuration,
            resolution: {
              width: 1920,
              height: 1080,
            },
            format: 'webm',
            codec: 'vp9',
            fps: 30,
            fileSize: blob.size,
            createdAt: new Date(),
          };
          
          console.log('⚠️ Using estimated duration. Adding clip with ID:', clipId, newClip);
          
          // IMPORTANT: Add to library first
          addClip(newClip);
          
          // Wait a tick for state to update
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Then add to timeline using the SAME clip ID
          console.log('⏱️ Adding to timeline - clipId:', clipId, 'duration:', finalDuration);
          addClipToTimeline(clipId, finalDuration);
          setIsOpen(false);
          setError(null);
        }
      } else {
        setError(result.error || 'Failed to save recording');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save recording');
    }
  };
  
  const handleStart = () => {
    if (recordingType === 'screen') {
      startScreenRecording();
    } else if (recordingType === 'webcam') {
      startWebcamRecording();
    } else if (recordingType === 'screen-camera') {
      startScreenCameraRecording();
    }
  };
  
  return (
    <>
      <button
        className={styles.recordButton}
        onClick={() => setIsOpen(!isOpen)}
        title="Record video"
      >
        <span className={styles.recordIcon}>●</span> Record
      </button>
      
      {isOpen && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.header}>
              <h2>Record Video</h2>
              <button className={styles.closeButton} onClick={() => setIsOpen(false)} title="Close recording panel">×</button>
            </div>
            
            <div className={styles.tabs}>
              <button
                className={`${styles.tab} ${recordingType === 'screen' ? styles.active : ''}`}
                onClick={() => setRecordingType('screen')}
                disabled={isRecording}
                title="Record your screen"
              >
                Screen
              </button>
              <button
                className={`${styles.tab} ${recordingType === 'webcam' ? styles.active : ''}`}
                onClick={() => setRecordingType('webcam')}
                disabled={isRecording}
                title="Record from webcam"
              >
                Webcam
              </button>
              <button
                className={`${styles.tab} ${recordingType === 'screen-camera' ? styles.active : ''}`}
                onClick={() => setRecordingType('screen-camera')}
                disabled={isRecording}
                title="Record screen + camera (Picture-in-Picture)"
              >
                Screen + Camera
              </button>
            </div>
            
            {error && (
              <div className={styles.error}>{error}</div>
            )}
            
            {(recordingType === 'screen' || recordingType === 'screen-camera') && !isRecording && (
              <div className={styles.sources}>
                <h3>Select Source</h3>
                <div className={styles.sourceGrid}>
                  {sources.map(source => (
                    <div
                      key={source.id}
                      className={`${styles.source} ${selectedSource?.id === source.id ? styles.selected : ''}`}
                      onClick={() => setSelectedSource(source)}
                    >
                      <img src={source.thumbnail} alt={source.name} />
                      <div className={styles.sourceName}>{source.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {recordingType === 'webcam' && !isRecording && (
              <div className={styles.preview}>
                <p>Click "Start Recording" to begin webcam capture</p>
              </div>
            )}
            
            {isRecording && (
              <div className={styles.recording}>
                {recordingType === 'screen-camera' ? (
                  <canvas ref={canvasRef} className={styles.videoPreview} />
                ) : (
                  <video ref={videoPreviewRef} autoPlay muted className={styles.videoPreview} />
                )}
                <div className={styles.recordingIndicator}>
                  <span className={styles.recordingDot}>●</span>
                  Recording: {formatTime(recordingTime, showCentiseconds)}
                </div>
              </div>
            )}
            
            <div className={styles.controls}>
              {!isRecording ? (
                <button
                  className={styles.startButton}
                  onClick={handleStart}
                  disabled={(recordingType === 'screen' || recordingType === 'screen-camera') && !selectedSource}
                  title={
                    recordingType === 'screen' ? 'Start screen recording' :
                    recordingType === 'webcam' ? 'Start webcam recording' :
                    'Start screen + camera recording'
                  }
                >
                  Start Recording
                </button>
              ) : (
                <button className={styles.stopButton} onClick={stopRecording} title="Stop recording">
                  Stop Recording
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

