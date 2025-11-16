import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { emojis } from './emojiData';
interface Emoji {
  emoji: string;
  name: string;
  category: string;
}
@Component({
  selector: 'app-emoji-picker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './emoji-picker.component.html',
  styleUrl: './emoji-picker.component.css',
})
export class EmojiPickerComponent {
  @Output() emojiSelected = new EventEmitter<string>();
  categories = [
    { key: 'smileys', name: 'Smileys & People', icon: '😀' },
    { key: 'animals', name: 'Animals & Nature', icon: '🐶' },
    { key: 'food', name: 'Food & Drink', icon: '🍎' },
    { key: 'sports', name: 'Sports & Activities', icon: '⚽' },
    { key: 'travel', name: 'Travel & Places', icon: '🚗' },
    { key: 'objects', name: 'Objects', icon: '💡' },
    { key: 'symbols', name: 'Symbols', icon: '❤️' },
  ];
  emojis: Emoji[] = emojis;
  searchQuery = '';
  activeCategory = 'smileys';
  filteredEmojis: Emoji[] = [];

  onSearch() {
    if (this.searchQuery.trim()) {
      this.filteredEmojis = this.emojis.filter(
        (emoji) =>
          emoji.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          emoji.emoji.includes(this.searchQuery)
      );
    } else {
      this.filteredEmojis = [];
    }
  }

  selectEmoji(emoji: Emoji) {
    this.emojiSelected.emit(emoji.emoji);
  }

  getEmojisByCategory(category: string): Emoji[] {
    return this.emojis.filter((emoji) => emoji.category === category);
  }

  scrollToCategory(categoryKey: string) {
    this.activeCategory = categoryKey;
    const element = document.querySelector(`[data-category="${categoryKey}"]`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
  private updateActiveCategory() {
    // This would be called on scroll to update active category
    // Implementation can be added based on scroll position
  }
  ngOnInit() {
    this.updateActiveCategory();
  }
}
