import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild, computed, signal } from '@angular/core';

const WEDDING_DATE = new Date('2026-11-22T16:00:00-03:00').getTime();

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('envelopeOverlay') private readonly envelopeOverlay?: ElementRef<HTMLElement>;
  @ViewChild('bgMusic') private readonly bgMusic?: ElementRef<HTMLAudioElement>;

  protected readonly showOverlay = signal(true);
  protected readonly envelopeOpened = signal(false);

  private readonly now = signal(Date.now());
  private readonly remaining = computed(() => Math.max(0, WEDDING_DATE - this.now()));

  protected readonly days = computed(() => Math.floor(this.remaining() / 86_400_000));
  protected readonly hours = computed(() => this.pad(Math.floor(this.remaining() / 3_600_000) % 24));
  protected readonly minutes = computed(() => this.pad(Math.floor(this.remaining() / 60_000) % 60));
  protected readonly seconds = computed(() => this.pad(Math.floor(this.remaining() / 1000) % 60));

  private opening = false;
  private countdownTimer?: ReturnType<typeof setInterval>;
  private openTimers: ReturnType<typeof setTimeout>[] = [];
  private musicFadeTimer?: ReturnType<typeof setInterval>;

  constructor(private readonly elementRef: ElementRef<HTMLElement>) {}

  ngOnInit(): void {
    this.countdownTimer = setInterval(() => this.now.set(Date.now()), 1000);
    if (this.showOverlay()) {
      document.body.style.overflow = 'hidden';
    }
  }

  ngAfterViewInit(): void {
    this.envelopeOverlay?.nativeElement.focus({ preventScroll: true });
    this.setupReveal();
  }

  ngOnDestroy(): void {
    clearInterval(this.countdownTimer);
    clearInterval(this.musicFadeTimer);
    this.openTimers.forEach((timer) => clearTimeout(timer));
    document.body.style.overflow = '';
  }

  protected openEnvelope(): void {
    if (this.opening) {
      return;
    }
    this.opening = true;
    this.envelopeOpened.set(true);
    this.fadeInMusic();

    this.openTimers.push(
      setTimeout(() => window.scrollTo(0, 0), 1100),
      setTimeout(() => {
        this.showOverlay.set(false);
        document.body.style.overflow = '';
      }, 2000),
    );
  }

  protected onEnvelopeKey(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.openEnvelope();
    }
  }

  private fadeInMusic(duration = 4000, targetVolume = 1): void {
    const audio = this.bgMusic?.nativeElement;
    if (!audio) {
      return;
    }
    audio.volume = 0;
    audio.play().catch(() => {});

    const steps = 40;
    const stepTime = duration / steps;
    let step = 0;
    this.musicFadeTimer = setInterval(() => {
      step++;
      audio.volume = Math.min(targetVolume, (targetVolume / steps) * step);
      if (step >= steps) {
        clearInterval(this.musicFadeTimer);
      }
    }, stepTime);
  }

  private pad(value: number): string {
    return String(value).padStart(2, '0');
  }

  private setupReveal(): void {
    const revealEls = Array.from(this.elementRef.nativeElement.querySelectorAll<HTMLElement>('.reveal'));

    if (typeof IntersectionObserver === 'undefined' || revealEls.length === 0) {
      revealEls.forEach((el) => el.classList.add('reveal--visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) {
            continue;
          }
          entry.target.classList.add('reveal--visible');
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -10% 0px' },
    );

    revealEls.forEach((el) => observer.observe(el));
  }
}
