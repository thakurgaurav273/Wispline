import {
  Component,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  ViewChild,
  AfterViewChecked,
  ChangeDetectorRef,
} from '@angular/core';
import { CometChatOption } from './context-menu.model';
import { CommonModule } from '@angular/common';
import { IconComponent } from "../BaseComponents/icon/icon.component";

@Component({
  selector: 'app-context-menu',
  templateUrl: './context-menu.component.html',
  standalone: true,
  imports: [CommonModule, IconComponent],
  styleUrls: ['./context-menu.component.css'],
})
export class ContextMenuComponent implements AfterViewChecked {
  @Input() data: CometChatOption[] = [];
  @Input() topMenuSize: number = 2;
  @Input() moreIconHoverText: string = '';

  @Output() optionClicked = new EventEmitter<CometChatOption>();

  @ViewChild('moreButtonRef') moreButtonRef!: ElementRef<HTMLElement>;
  @ViewChild('subMenuRef') subMenuRef!: ElementRef<HTMLElement>;
  @Input() scrollContainer?: HTMLElement;
  showSubMenu: boolean = false;
  @Output() openMenu = new EventEmitter<boolean>(false);
  positionStyle: Record<string, string> = {};

  private shouldCalculatePosition: boolean = false;

  constructor(private cdr: ChangeDetectorRef) {}

  toggleSubMenu(): void {
    this.showSubMenu = !this.showSubMenu;

    if (this.showSubMenu) {
      this.openMenu.emit(true);
      this.shouldCalculatePosition = true;
    }
  }

  handleOptionClick(option: CometChatOption): void {
    this.optionClicked.emit(option);
    option.onClick?.();
    this.showSubMenu = false;
  }

  getTopMenu(): CometChatOption[] {
    return this.data.slice(0, this.topMenuSize - 1);
  }

  getSubMenu(): CometChatOption[] {
    return this.data.slice(this.topMenuSize - 1);
  }

  ngAfterViewChecked(): void {
    if (this.showSubMenu && this.shouldCalculatePosition) {
      this.shouldCalculatePosition = false;
      this.calculateAutoPlacement();
      this.cdr.detectChanges();
    }
  }
  private calculateAutoPlacement(): void {
    const triggerEl = this.moreButtonRef?.nativeElement;
    const submenuEl = this.subMenuRef?.nativeElement;

    if (!triggerEl || !submenuEl) return;

    const menuHeight = submenuEl.offsetHeight || 48 * this.getSubMenu().length;
    const padding = 8;

    // Use container bounds if available, otherwise fall back to window
    let containerTop = 0;
    let containerBottom = window.innerHeight;

    if (this.scrollContainer) {
      const containerRect = this.scrollContainer.getBoundingClientRect();
      containerTop = containerRect.top;
      containerBottom = containerRect.bottom;
    }

    const buttonRect = triggerEl.getBoundingClientRect();

    const spaceBelow = containerBottom - buttonRect.bottom;
    const spaceAbove = buttonRect.top - containerTop;

    let style: any = {
      left: '0',
      right: '',
      top: '',
      bottom: '',
      marginTop: '',
      marginBottom: '',
    };

    if (spaceBelow >= menuHeight + padding) {
      // Show below
      style.top = '100%';
      style.marginTop = `${padding}px`;
    } else if (spaceAbove >= menuHeight + padding) {
      // Show above
      style.bottom = '100%';
      style.marginBottom = `${padding}px`;
    } else {
      // Fallback to below
      style.top = '100%';
      style.marginTop = `${padding}px`;
    }

    this.positionStyle = style;
  }
}
