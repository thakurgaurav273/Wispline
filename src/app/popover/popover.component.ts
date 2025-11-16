import { CommonModule } from '@angular/common';
import {
  Component, Input, TemplateRef, ViewChild, ElementRef, Output, EventEmitter, Renderer2,
  OnInit, OnDestroy, ChangeDetectorRef
} from '@angular/core';

export type Placement = 'top' | 'right' | 'bottom' | 'left';

@Component({
  selector: 'app-popover',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './popover.component.html',
  styleUrls: ['./popover.component.css']
})
export class CometChatPopoverComponent implements OnInit, OnDestroy {
  @Input() placement: Placement = 'bottom';
  @Input() closeOnOutsideClick: boolean = true;
  @Input() showOnHover: boolean = false;
  @Input() debounceOnHover: number = 500;
  @Input() disableBackgroundInteraction: boolean = false;
  @Input() showTooltip: boolean = false;
  @Input() useParentContainer: boolean = false;

  @Input() triggerTemplate!: TemplateRef<any>;
  @Input() popoverTemplate!: TemplateRef<any>;

  @Output() onOutsideClick = new EventEmitter<void>();

  @ViewChild('popoverRef', { static: false }) popoverRef!: ElementRef<HTMLDivElement>;
  @ViewChild('triggerRef', { static: false }) triggerRef!: ElementRef<HTMLDivElement>;

  isOpen = false;
  // Holds the top-level parent view if useParentContainer is true
  private parentViewRef: HTMLElement | undefined = undefined;
  positionStyle: { [key: string]: any } = {};
  private documentClickListener: (() => void) | null = null;
  private hoverTimeout: any = null;

  constructor(private renderer: Renderer2, private cdr: ChangeDetectorRef) {}

  ngOnInit() {}

  ngOnDestroy() {
    this.removeDocumentClickListener();
    clearTimeout(this.hoverTimeout);
  }

  openPopover() {
    this.isOpen = true;
    // Set parent if using container option
    if (this.useParentContainer) {
      setTimeout(() => {
        this.parentViewRef = this.getTopMostCometChatElement();
        this.reposition();
        this.cdr.detectChanges();
      }, 0);
    } else {
      setTimeout(() => {
        this.reposition();
        this.cdr.detectChanges();
      }, 0);
    }
    if (this.closeOnOutsideClick) {
      this.addDocumentClickListener();
    }
  }

  closePopover() {
    this.isOpen = false;
    this.removeDocumentClickListener();
  }

  onTriggerClick(event: Event) {
    if (!this.showOnHover) {
      event.stopPropagation();
      this.isOpen ? this.closePopover() : this.openPopover();
    }
  }

  onMouseEnter() {
    if (this.showOnHover) {
      clearTimeout(this.hoverTimeout);
      this.hoverTimeout = setTimeout(() => {
        this.openPopover();
        this.cdr.markForCheck();
      }, this.debounceOnHover);
    }
  }

  onMouseLeave() {
    if (this.showOnHover) {
      clearTimeout(this.hoverTimeout);
      this.hoverTimeout = setTimeout(() => {
        this.closePopover();
        this.cdr.markForCheck();
      }, this.debounceOnHover);
    }
  }

  addDocumentClickListener() {
    if (!this.documentClickListener) {
      this.documentClickListener = this.renderer.listen('document', 'click', (event: MouseEvent) => {
        if (
          this.popoverRef &&
          !this.popoverRef.nativeElement.contains(event.target as Node) &&
          this.triggerRef &&
          !this.triggerRef.nativeElement.contains(event.target as Node)
        ) {
          this.closePopover();
          this.onOutsideClick.emit();
        }
      });
    }
  }

  removeDocumentClickListener() {
    if (this.documentClickListener) {
      this.documentClickListener();
      this.documentClickListener = null;
    }
  }

  // reposition() {
  //   if (!this.popoverRef || !this.triggerRef) return;
    
  //   const triggerEl = this.triggerRef.nativeElement;
  //   const popoverEl = this.popoverRef.nativeElement;
  //   const triggerRect = triggerEl.getBoundingClientRect();
  //   const popoverHeight = popoverEl.scrollHeight;
  //   const popoverWidth = popoverEl.scrollWidth;
  
  //   const spacing = 10;
  //   let positionStyle: { [key: string]: string } = {};
  
  //   if (this.useParentContainer && this.parentViewRef) {
  //     // Position relative to parent container
  //     const parentRect = this.parentViewRef.getBoundingClientRect();
  //     const availablePlacement = this.getAvailablePlacement(triggerRect, popoverHeight, parentRect);
      
  //     if (availablePlacement === 'top' || availablePlacement === 'bottom') {
  //       // Vertical placement
  //       positionStyle['top'] = availablePlacement === 'top'
  //         ? `${Math.max(parentRect.top, triggerRect.top - popoverHeight - spacing)}px`
  //         : `${Math.min(parentRect.bottom - popoverHeight, triggerRect.bottom + spacing)}px`;
        
  //       let adjustedLeft = Math.max(parentRect.left, triggerRect.left);
  //       adjustedLeft = Math.min(adjustedLeft, parentRect.right - popoverWidth - spacing);
  //       positionStyle['left'] = `${adjustedLeft}px`;
  //     } else {
  //       // Horizontal placement
  //       positionStyle['left'] = availablePlacement === 'left'
  //         ? `${Math.max(parentRect.left, triggerRect.left - popoverWidth - spacing)}px`
  //         : `${Math.min(parentRect.right - popoverWidth, triggerRect.right + spacing)}px`;
        
  //       let adjustedTop = Math.max(parentRect.top, triggerRect.top);
  //       adjustedTop = Math.min(adjustedTop, parentRect.bottom - popoverHeight - spacing);
  //       positionStyle['top'] = `${adjustedTop}px`;
  //     }
  //   } else {
  //     // Position relative to viewport
  //     const viewportHeight = window.innerHeight;
  //     const viewportWidth = window.innerWidth;
  //     const availablePlacement = this.getAvailablePlacement(triggerRect, popoverHeight);
      
  //     if (availablePlacement === 'top' || availablePlacement === 'bottom') {
  //       // Vertical placement
  //       const topPosition = triggerRect.top - popoverHeight - spacing;
  //       const bottomPosition = triggerRect.bottom + spacing;
        
  //       positionStyle['top'] = availablePlacement === 'top'
  //         ? `${topPosition < 0 ? bottomPosition : topPosition}px`
  //         : `${bottomPosition + popoverHeight > viewportHeight ? topPosition : bottomPosition}px`;
        
  //       // Ensure popover doesn't overflow horizontally
  //       let leftPosition = triggerRect.left - spacing;
  //       if (leftPosition + popoverWidth > viewportWidth - spacing) {
  //         leftPosition = viewportWidth - popoverWidth - spacing;
  //       }
  //       if (leftPosition < spacing) {
  //         leftPosition = spacing;
  //       }
  //       positionStyle['left'] = `${leftPosition}px`;
  //     } else {
  //       // Horizontal placement
  //       const leftPosition = triggerRect.left - popoverWidth - spacing;
  //       const rightPosition = triggerRect.right + spacing;
        
  //       positionStyle['left'] = availablePlacement === 'left'
  //         ? `${leftPosition < 0 ? rightPosition : leftPosition}px`
  //         : `${rightPosition + popoverWidth > viewportWidth ? leftPosition : rightPosition}px`;
        
  //       // Ensure popover doesn't overflow vertically
  //       let topPosition = triggerRect.top - spacing;
  //       if (topPosition + popoverHeight > viewportHeight - spacing) {
  //         topPosition = viewportHeight - popoverHeight - spacing;
  //       }
  //       if (topPosition < spacing) {
  //         topPosition = spacing;
  //       }
  //       positionStyle['top'] = `${topPosition}px`;
  //     }
  //   }
  
  //   this.positionStyle = positionStyle;
  // }

  reposition() {
    if (!this.popoverRef || !this.triggerRef) return;
    
    const triggerEl = this.triggerRef.nativeElement;
    const popoverEl = this.popoverRef.nativeElement;
    const triggerRect = triggerEl.getBoundingClientRect();
    const popoverHeight = popoverEl.scrollHeight;
    const popoverWidth = popoverEl.scrollWidth;
  
    const spacing = 10;
    let positionStyle: { [key: string]: string } = {};
  
    if (this.useParentContainer && this.parentViewRef) {
      // Position relative to parent container
      const parentRect = this.parentViewRef.getBoundingClientRect();
      const availablePlacement = this.getAvailablePlacement(triggerRect, popoverHeight, parentRect);
      
      if (availablePlacement === 'top' || availablePlacement === 'bottom') {
        // Vertical placement
        positionStyle['top'] = availablePlacement === 'top'
          ? `${Math.max(parentRect.top, triggerRect.top - popoverHeight - spacing)}px`
          : `${Math.min(parentRect.bottom - popoverHeight, triggerRect.bottom + spacing)}px`;
        
        // Center horizontally relative to parent container, not trigger
        let centerLeft = parentRect.left + (parentRect.width / 2) - (popoverWidth / 2);
        let adjustedLeft = Math.max(parentRect.left + spacing, centerLeft);
        adjustedLeft = Math.min(adjustedLeft, parentRect.right - popoverWidth - spacing);
        positionStyle['left'] = `${adjustedLeft}px`;
      } else {
        // Horizontal placement
        positionStyle['left'] = availablePlacement === 'left'
          ? `${Math.max(parentRect.left, triggerRect.left - popoverWidth - spacing)}px`
          : `${Math.min(parentRect.right - popoverWidth, triggerRect.right + spacing)}px`;
        
        let adjustedTop = Math.max(parentRect.top, triggerRect.top);
        adjustedTop = Math.min(adjustedTop, parentRect.bottom - popoverHeight - spacing);
        positionStyle['top'] = `${adjustedTop}px`;
      }
    } else {
      // Position relative to viewport
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      const availablePlacement = this.getAvailablePlacement(triggerRect, popoverHeight);
      
      // Find the composer container
      const composerContainer = this.getComposerContainer();
      const composerRect = composerContainer?.getBoundingClientRect();
      
      if (availablePlacement === 'top' || availablePlacement === 'bottom') {
        // Vertical placement
        const topPosition = triggerRect.top - popoverHeight - spacing;
        const bottomPosition = triggerRect.bottom + spacing;
        
        positionStyle['top'] = availablePlacement === 'top'
          ? `${topPosition < 0 ? bottomPosition : topPosition}px`
          : `${bottomPosition + popoverHeight > viewportHeight ? topPosition : bottomPosition}px`;
        
        // Center horizontally relative to composer container if available, otherwise viewport
        if (composerRect) {
          let centerLeft = composerRect.left + (composerRect.width / 2) - (popoverWidth / 2);
          if (centerLeft + popoverWidth > viewportWidth - spacing) {
            centerLeft = viewportWidth - popoverWidth - spacing;
          }
          if (centerLeft < spacing) {
            centerLeft = spacing;
          }
          positionStyle['left'] = `${composerRect.left}px`;
        } else {
          // Fallback to trigger-based centering
          let centerLeft = triggerRect.left + (triggerRect.width / 2) - (popoverWidth / 2);
          if (centerLeft + popoverWidth > viewportWidth - spacing) {
            centerLeft = viewportWidth - popoverWidth - spacing;
          }
          if (centerLeft < spacing) {
            centerLeft = spacing;
          }
          positionStyle['left'] = `${centerLeft}px`;
        }
      } else {
        // Horizontal placement
        const leftPosition = triggerRect.left - popoverWidth - spacing;
        const rightPosition = triggerRect.right + spacing;
        
        positionStyle['left'] = availablePlacement === 'left'
          ? `${leftPosition < 0 ? rightPosition : leftPosition}px`
          : `${rightPosition + popoverWidth > viewportWidth ? leftPosition : rightPosition}px`;
        
        // Ensure popover doesn't overflow vertically
        let topPosition = triggerRect.top - spacing;
        if (topPosition + popoverHeight > viewportHeight - spacing) {
          topPosition = viewportHeight - popoverHeight - spacing;
        }
        if (topPosition < spacing) {
          topPosition = spacing;
        }
        positionStyle['top'] = `${topPosition}px`;
      }
    }
  
    this.positionStyle = positionStyle;
  }
  
  
  private getAvailablePlacement(
    triggerRect: DOMRect, 
    popoverHeight: number, 
    parentRect?: DOMRect
  ): Placement {
    const spacing = 10;
    
    if (parentRect) {
      // Calculate space within parent container
      const spaceAbove = triggerRect.top - parentRect.top;
      const spaceBelow = parentRect.bottom - triggerRect.bottom;
      const spaceLeft = triggerRect.left - parentRect.left;
      const spaceRight = parentRect.right - triggerRect.right;
      
      // Check if preferred placement fits
      if (this.placement === 'top' && spaceAbove >= popoverHeight + spacing) return 'top';
      if (this.placement === 'bottom' && spaceBelow >= popoverHeight + spacing) return 'bottom';
      if (this.placement === 'left' && spaceLeft >= popoverHeight + spacing) return 'left';
      if (this.placement === 'right' && spaceRight >= popoverHeight + spacing) return 'right';
      
      // Fallback to best available space
      if (spaceAbove >= popoverHeight + spacing) return 'top';
      if (spaceBelow >= popoverHeight + spacing) return 'bottom';
      if (spaceLeft >= popoverHeight + spacing) return 'left';
      if (spaceRight >= popoverHeight + spacing) return 'right';
    } else {
      // Calculate space relative to viewport
      const spaceAbove = triggerRect.top;
      const spaceBelow = window.innerHeight - triggerRect.bottom;
      const spaceLeft = triggerRect.left;
      const spaceRight = window.innerWidth - triggerRect.right;
      
      // Check if preferred placement fits
      if (this.placement === 'top' && spaceAbove >= popoverHeight + spacing) return 'top';
      if (this.placement === 'bottom' && spaceBelow >= popoverHeight + spacing) return 'bottom';
      if (this.placement === 'left' && spaceLeft >= popoverHeight + spacing) return 'left';
      if (this.placement === 'right' && spaceRight >= popoverHeight + spacing) return 'right';
      
      // Fallback to best available space
      if (spaceAbove >= popoverHeight + spacing) return 'top';
      if (spaceBelow >= popoverHeight + spacing) return 'bottom';
      if (spaceLeft >= popoverHeight + spacing) return 'left';
      if (spaceRight >= popoverHeight + spacing) return 'right';
    }
    
    return this.placement; // Default to original placement if nothing fits
  }
  
  private getComposerContainer(): HTMLElement | null {
    if (!this.triggerRef) return null;
    
    let current = this.triggerRef.nativeElement.parentElement;
    
    // Look for the message-composer-container with cometchat class
    while (current) {
      console.log(current.classList);
      if (current.classList?.contains('message-composer-container') && 
          current.classList?.contains('cometchat')) {
        return current;
      }
      current = current.parentElement;
    }
    
    return null;
  }
  
  


  // private getAvailablePlacement(
  //   triggerRect: DOMRect, 
  //   popoverHeight: number, 
  //   parentRect?: DOMRect
  // ): Placement {
  //   const spacing = 10;
    
  //   if (parentRect) {
  //     // Calculate space within parent container
  //     const spaceAbove = triggerRect.top - parentRect.top;
  //     const spaceBelow = parentRect.bottom - triggerRect.bottom;
  //     const spaceLeft = triggerRect.left - parentRect.left;
  //     const spaceRight = parentRect.right - triggerRect.right;
      
  //     // Check if preferred placement fits
  //     if (this.placement === 'top' && spaceAbove >= popoverHeight + spacing) return 'top';
  //     if (this.placement === 'bottom' && spaceBelow >= popoverHeight + spacing) return 'bottom';
  //     if (this.placement === 'left' && spaceLeft >= popoverHeight + spacing) return 'left';
  //     if (this.placement === 'right' && spaceRight >= popoverHeight + spacing) return 'right';
      
  //     // Fallback to best available space
  //     if (spaceAbove >= popoverHeight + spacing) return 'top';
  //     if (spaceBelow >= popoverHeight + spacing) return 'bottom';
  //     if (spaceLeft >= popoverHeight + spacing) return 'left';
  //     if (spaceRight >= popoverHeight + spacing) return 'right';
  //   } else {
  //     // Calculate space relative to viewport
  //     const spaceAbove = triggerRect.top;
  //     const spaceBelow = window.innerHeight - triggerRect.bottom;
  //     const spaceLeft = triggerRect.left;
  //     const spaceRight = window.innerWidth - triggerRect.right;
      
  //     // Check if preferred placement fits
  //     if (this.placement === 'top' && spaceAbove >= popoverHeight + spacing) return 'top';
  //     if (this.placement === 'bottom' && spaceBelow >= popoverHeight + spacing) return 'bottom';
  //     if (this.placement === 'left' && spaceLeft >= popoverHeight + spacing) return 'left';
  //     if (this.placement === 'right' && spaceRight >= popoverHeight + spacing) return 'right';
      
  //     // Fallback to best available space
  //     if (spaceAbove >= popoverHeight + spacing) return 'top';
  //     if (spaceBelow >= popoverHeight + spacing) return 'bottom';
  //     if (spaceLeft >= popoverHeight + spacing) return 'left';
  //     if (spaceRight >= popoverHeight + spacing) return 'right';
  //   }
    
  //   return this.placement; // Default to original placement if nothing fits
  // }

  private getTopMostCometChatElement(): HTMLElement | undefined {
    if (!this.popoverRef) return;
    let current = this.popoverRef.nativeElement.parentElement as HTMLElement | null;
    let topMost: HTMLElement | null = null;
    while (current) {
      if (current.classList && current.classList.contains('cometchat')) {
        topMost = current;
      }
      current = current.parentElement as HTMLElement | null;
    }
    return topMost ?? undefined;
  }
}
