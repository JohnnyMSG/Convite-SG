import { AfterViewInit, Component, ElementRef, signal } from '@angular/core';
import {NgOptimizedImage} from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [
    NgOptimizedImage
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements AfterViewInit {
  protected readonly menuOpen = signal(false);

  constructor(private readonly elementRef: ElementRef<HTMLElement>) {}

  protected toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }

  ngAfterViewInit(): void {
    const revealEls = this.elementRef.nativeElement.querySelectorAll('.reveal');

    if (typeof IntersectionObserver === 'undefined' || revealEls.length === 0) {
      revealEls.forEach((el) => el.classList.add('reveal--visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          entry.target.classList.toggle('reveal--visible', entry.isIntersecting);
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' },
    );

    revealEls.forEach((el) => observer.observe(el));
  }
}
