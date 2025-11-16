// cometchat-media-recorder.component.ts
import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CometChatAudioBubbleComponent } from '../../BaseComponents/cometchat-audio-bubble/cometchat-audio-bubble.component';

@Component({
  imports: [CommonModule, CometChatAudioBubbleComponent],
  standalone: true,
  selector: 'app-cometchat-media-recorder',
  templateUrl: './cometchat-media-recorder.component.html',
  styleUrls: ['./cometchat-media-recorder.component.css']
})
export class CometChatMediaRecorderComponent implements OnInit, OnDestroy {

  @Input() autoRecording: boolean = true;
  @Output() onCloseRecording = new EventEmitter<void>();
  @Output() onSubmitRecording = new EventEmitter<Blob>();

  mediaRecorder: MediaRecorder | undefined;
  isRecording: boolean = true;
  mediaPreviewUrl: string | undefined;
  counter: number = 0;
  isPaused: boolean = false;
  hasError: boolean = false;
  permissionState: PermissionState | string = 'prompt';

  private streamRef: MediaStream | undefined;
  private blobRef: Blob | undefined;
  private audioChunks: Blob[] = [];
  private counterRunning: boolean = true;
  private createMedia: boolean = false;
  private hasInitialized: boolean = false;
  private userCancelledRecording: boolean = false;
  private timerInterval: any;
  private permissionStatus: PermissionStatus | null = null;

  ngOnInit(): void {
    if (this.autoRecording) {
      setTimeout(() => this.handleStartRecording(), 100);
    }
    this.setupPermissionMonitoring();
  }

  ngOnDestroy(): void {
    this.handleStopRecording();
    clearInterval(this.timerInterval);
    this.clearStream();
    if (this.permissionStatus) {
      this.permissionStatus.onchange = null;
    }
  }

  private pauseActiveMedia() {
    // Implement according to your audio/video media player controls if any
  }

  private async checkMicrophonePermission(): Promise<PermissionState | string> {
    try {
      const permission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      return permission.state;
    } catch {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        return 'granted';
      } catch (err: any) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          return 'denied';
        }
        return 'prompt';
      }
    }
  }

  private startTimer() {
    clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      if (this.counterRunning) {
        this.counter++;
      }
    }, 1000);
  }

  private pauseTimer() {
    clearInterval(this.timerInterval);
  }

  private stopTimer() {
    clearInterval(this.timerInterval);
    this.counter = 0;
  }

  private clearStream() {
    if (this.streamRef) {
      this.streamRef.getTracks().forEach(track => {
        track.stop();
        track.onended = null;
      });
      this.streamRef = undefined;
    }
  }

  private reset() {
    this.pauseActiveMedia();
    this.mediaRecorder = undefined;
    this.mediaPreviewUrl = undefined;
    this.isRecording = false;
    this.isPaused = false;
    this.clearStream();
    this.audioChunks = [];
    this.blobRef = undefined;
  }

  private async initMediaRecorder(): Promise<MediaRecorder | null> {
    if (this.hasInitialized) return null;
    try {
      this.clearStream();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.hasInitialized = true;
      this.streamRef = stream;
      const audioRecorder = new MediaRecorder(stream);
      audioRecorder.ondataavailable = (e: any) => {
        if (e.data.size > 0) this.audioChunks.push(e.data);
      };
      audioRecorder.onstop = () => {
        if (this.createMedia && this.audioChunks.length > 0) {
          const recordedBlob = new Blob(this.audioChunks, { type: this.audioChunks[0]?.type || 'audio/webm' });
          this.blobRef = recordedBlob;
          this.mediaPreviewUrl = URL.createObjectURL(recordedBlob);
          this.audioChunks = [];
        }
      };
      audioRecorder.onerror = (event: any) => {
        console.error('MediaRecorder error:', event.error);
        this.hasError = true;
        this.isRecording = false;
        this.isPaused = false;
        this.clearStream();
        this.hasInitialized = false;
      };
      stream.getTracks().forEach(track => {
        track.onended = () => {
          this.hasError = true;
          this.isRecording = false;
        };
      });
      audioRecorder.start();
      this.mediaRecorder = audioRecorder;
      this.hasError = false;
      return audioRecorder;
    } catch (error: any) {
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        this.hasError = true;
        this.permissionState = 'denied';
      }
      this.hasInitialized = false;
      return null;
    }
  }

  async handleStartRecording() {
    this.pauseActiveMedia();
    const devices = await navigator.mediaDevices.enumerateDevices();
    if (!devices.some(device => device.kind === 'audioinput')) {
      return;
    }
    const currentPermissionState = await this.checkMicrophonePermission();
    if (currentPermissionState === 'denied') {
      this.hasError = true;
      this.permissionState = 'denied';
      return;
    }
    this.counterRunning = true;
    this.createMedia = true;

    if (this.isPaused && this.mediaRecorder) {
      try {
        this.mediaRecorder.resume();
        this.isPaused = false;
        this.startTimer();
        this.isRecording = true;
      } catch (error) {
        console.error('Failed to resume recording:', error);
        this.hasError = true;
      }
    } else {
      this.reset();
      const recorder = await this.initMediaRecorder();
      if (recorder) {
        this.counter = 0;
        this.startTimer();
        this.isRecording = true;
        this.hasError = false;
        this.permissionState = 'granted';
      } else {
        this.isRecording = false;
        this.createMedia = false;
      }
    }
  }

  handleStopRecording() {
    this.isPaused = false;
    this.pauseActiveMedia();

    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }

    this.isRecording = false;
    this.stopTimer();
    this.hasInitialized = false;

    // Create the blob and preview URL immediately from current chunks, if any
    if (this.audioChunks.length > 0) {
      const recordedBlob = new Blob(this.audioChunks, { type: this.audioChunks[0]?.type || 'audio/webm' });
      this.blobRef = recordedBlob;
      this.mediaPreviewUrl = URL.createObjectURL(recordedBlob);
      this.audioChunks = []; // reset chunks since blob is created
    }
    this.clearStream();
  }


  handleCloseRecording() {
    this.pauseActiveMedia();
    this.createMedia = false;
    this.userCancelledRecording = true;
    // this.onCloseRecording.emit();
    this.reset();
  }

  handleSubmitRecording() {
    this.pauseActiveMedia();
    if (this.blobRef) {
      this.onSubmitRecording.emit(this.blobRef);
      this.isRecording = false;
      this.reset();
    }
  }

  handlePauseRecording() {
    this.isPaused = true;
    this.pauseTimer();
    if (this.mediaRecorder) this.mediaRecorder.pause();
    this.counterRunning = false;
    this.hasInitialized = false;
  }

  private setupPermissionMonitoring() {
    navigator.permissions.query({ name: 'microphone' as PermissionName }).then(permission => {
      this.permissionStatus = permission;
      permission.onchange = () => {
        this.permissionState = permission.state;
        if (permission.state === 'granted') {
          this.hasError = false;
        } else if (permission.state === 'denied') {
          this.hasError = true;
          this.isRecording = false;
          this.isPaused = false;
          this.clearStream();
          this.stopTimer();
          try {
            if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
              this.mediaRecorder.stop();
            }
          } catch (error) {
            console.error('Error stopping recorder on permission denial:', error);
          }
          this.mediaRecorder = undefined;
        }
      };
    }).catch(error => {
      console.error('Permission monitoring setup failed:', error);
    });
  }

  formatTime(timeInSeconds: number): string {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
}
