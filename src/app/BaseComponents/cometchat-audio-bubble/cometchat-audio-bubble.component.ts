import { Component, ElementRef, Input, OnInit, ViewChild, OnDestroy, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import WaveSurfer from './src/wavesurfer';

@Component({
  imports: [CommonModule],
  selector: 'app-cometchat-audio-bubble',
  standalone: true,
  templateUrl: './cometchat-audio-bubble.component.html',
  styleUrls: ['./cometchat-audio-bubble.component.css']
})
export class CometChatAudioBubbleComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() src: string | any = '';
  @Input() isSentByMe: boolean = true;

  @ViewChild('waveformRef', { static: false }) waveformRef!: ElementRef<HTMLDivElement>;

  waveSurfer: WaveSurfer | null = null;
  isPlaying: boolean = false;
  currentTime: number = 0;
  duration: number = 0;
  isLoading: boolean = false;
  isDownloading: boolean = false;
  progress: number = 0;
  hasError: boolean = false;

  private abortController: AbortController | null = null;
  private initRetryCount: number = 0;
  private readonly MAX_RETRIES = 5;
  private initializationTimeout: any = null;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    // Don't initialize here - wait for AfterViewInit
  }

  ngAfterViewInit() {
    // Wait for next tick to ensure DOM is fully rendered
    this.initializationTimeout = setTimeout(() => {
      this.initializeWaveSurfer();
    }, 150);
  }

  ngOnDestroy() {
    this.cleanup();
    if (this.initializationTimeout) {
      clearTimeout(this.initializationTimeout);
    }
  }

  private cleanup() {
    if (this.waveSurfer) {
      try {
        this.waveSurfer.destroy();
      } catch (e) {
        console.warn('[AudioBubble] Error destroying wavesurfer:', e);
      }
      this.waveSurfer = null;
    }

    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }

  initializeWaveSurfer() {
    // Validate container
    if (!this.waveformRef?.nativeElement) {
      console.error('[AudioBubble] Container element not found');
      if (this.initRetryCount < this.MAX_RETRIES) {
        this.initRetryCount++;
        setTimeout(() => this.initializeWaveSurfer(), 200);
      }
      return;
    }

    const container = this.waveformRef.nativeElement;
    
    // Ensure container has dimensions
    const rect = container.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      console.warn('[AudioBubble] Container has no dimensions:', rect, 'retrying...');
      if (this.initRetryCount < this.MAX_RETRIES) {
        this.initRetryCount++;
        setTimeout(() => this.initializeWaveSurfer(), 250);
      } else {
        console.error('[AudioBubble] Failed to initialize after max retries - container has no dimensions');
        this.hasError = true;
        this.cdr.detectChanges();
      }
      return;
    }

    // Validate audio source
    if (!this.src) {
      console.error('[AudioBubble] No audio source provided');
      this.hasError = true;
      this.cdr.detectChanges();
      return;
    }

    // Clear any existing instance
    if (this.waveSurfer) {
      try {
        this.waveSurfer.destroy();
      } catch (e) {
        console.warn('[AudioBubble] Error destroying previous instance:', e);
      }
      this.waveSurfer = null;
    }

    this.isLoading = true;
    this.hasError = false;
    this.cdr.detectChanges();

    try {
      const root = document.documentElement;

      const progressbarColor = this.isSentByMe
        ? getComputedStyle(root).getPropertyValue('--chat-static-white').trim() || '#ffffff'
        : getComputedStyle(root).getPropertyValue('--chat-primary-color').trim() || '#3498db';
      
      const waveColor = this.isSentByMe
        ? getComputedStyle(root).getPropertyValue('--chat-neutral-color-500').trim() || '#cccccc'
        : getComputedStyle(root).getPropertyValue('--chat-static-white').trim() || '#a0c4e8';
      
      const barRadiusStr = getComputedStyle(root).getPropertyValue('--chat-radius-max').trim().replace('px', '');
      const barRadius = parseInt(barRadiusStr) || 2;

      console.log('[AudioBubble] Container dimensions:', rect.width, 'x', rect.height);

      // Create WaveSurfer instance with proper configuration
      this.waveSurfer = WaveSurfer.create({
        container: container,
        height: 16,
        normalize: true,
        waveColor: waveColor,
        progressColor: progressbarColor,
        cursorWidth: 0,
        barWidth: 2,
        barGap: 3,
        barRadius: barRadius,
        barHeight: 1.2,
        minPxPerSec: 1,
        fillParent: true,
        mediaControls: false,
        interact: true,
        dragToSeek: true,
        hideScrollbar: true,
        audioRate: 1,
        autoScroll: false,
        autoCenter: false,
        backend: 'WebAudio',
      });

      // Set up event listeners before loading
      this.setupEventListeners();

      // Load audio
      this.waveSurfer.load(this.src);

    } catch (error) {
      console.error('[AudioBubble] Error initializing WaveSurfer:', error);
      this.isLoading = false;
      this.hasError = true;
      this.cdr.detectChanges();
    }
  }

  private setupEventListeners() {
    if (!this.waveSurfer) return;

    // Ready event
    this.waveSurfer.on('ready', () => {
      const duration = this.waveSurfer!.getDuration();
      
      if (!Number.isFinite(duration) || duration <= 0) {
        console.warn('[AudioBubble] Invalid duration:', duration);
        this.hasError = true;
      } else {
        this.duration = duration;
      }
      
      this.isLoading = false;
      this.cdr.detectChanges();
    });

    // Error event
    this.waveSurfer.on('error', (error: any) => {
      console.error('[WaveSurfer Error]:', error);
      this.isLoading = false;
      this.hasError = true;
      this.cdr.detectChanges();
    });

    // Loading event
    this.waveSurfer.on('loading', (percent: number) => {
      this.progress = percent;
      this.cdr.detectChanges();
    });

    // Audio process event
    this.waveSurfer.on('audioprocess', (time: number) => {
      this.currentTime = time;
      this.cdr.detectChanges();
    });

    // Seek event
    this.waveSurfer.on('seeking', (time: number) => {
      this.currentTime = time;
      this.cdr.detectChanges();
    });

    // Finish event
    this.waveSurfer.on('finish', () => {
      this.waveSurfer!.seekTo(0);
      this.isPlaying = false;
      this.currentTime = 0;
      this.cdr.detectChanges();
    });

    // Play event
    this.waveSurfer.on('play', () => {
      this.isPlaying = true;
      this.cdr.detectChanges();
    });

    // Pause event
    this.waveSurfer.on('pause', () => {
      this.isPlaying = false;
      this.cdr.detectChanges();
    });
  }

  formatTime(timeInSeconds: number): string {
    if (!Number.isFinite(timeInSeconds) || timeInSeconds < 0) {
      return '0:00';
    }
    
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }

  async downloadAudio() {
    if (!this.src) {
      console.error('[AudioBubble] No source to download');
      return;
    }

    this.isDownloading = true;
    this.progress = 0;
    this.abortController = new AbortController();
    const { signal } = this.abortController;

    try {
      const response = await fetch(this.src, { signal });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      if (!response.body) {
        throw new Error('ReadableStream not supported');
      }

      const reader = response.body.getReader();
      const contentLength = parseInt(response.headers.get('Content-Length') || '0');
      
      let receivedLength = 0;
      const chunks: Uint8Array[] = [];

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        chunks.push(value);
        receivedLength += value.length;
        
        if (contentLength > 0) {
          this.progress = Math.floor((receivedLength / contentLength) * 100);
          this.cdr.detectChanges();
        }
      }

      // Create blob and download
      const blob = new Blob(chunks, { type: 'audio/mpeg' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const filename = this.src.split('/').pop()?.split('?')[0] || 'audio.mp3';
      
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      URL.revokeObjectURL(url);
      
      this.isDownloading = false;
      this.progress = 0;
      this.cdr.detectChanges();
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('[AudioBubble] Download aborted');
      } else {
        console.error('[AudioBubble] Download error:', error);
      }
      
      this.isDownloading = false;
      this.progress = 0;
      this.cdr.detectChanges();
    }
  }

  cancelDownload() {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }

  handlePlayPause() {
    if (this.isLoading || !this.waveSurfer || this.hasError) {
      return;
    }

    try {
      if (this.waveSurfer.isPlaying()) {
        this.waveSurfer.pause();
      } else {
        this.waveSurfer.play();
      }
    } catch (error) {
      console.error('[AudioBubble] Play/Pause error:', error);
      this.hasError = true;
      this.cdr.detectChanges();
    }
  }
}