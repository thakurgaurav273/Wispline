import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-create-group',
  standalone: true,
  imports:[FormsModule, CommonModule],
  templateUrl: './create-group.component.html',
  styleUrls: ['./create-group.component.css'],
})
export class CreateGroupComponent implements OnInit {
  selectedPrivacy: string = 'public';
  groupName: string = '';
  groupPassword: string = '';
  isCreating: boolean = false;

  @Output() createGroup = new EventEmitter<any>();
  @Input() closeCallback!: () => void;

  constructor() {}

  ngOnInit(): void {}

  setPrivacyType(type: string) {
    this.selectedPrivacy = type;
    if (type !== 'password') {
      this.groupPassword = '';
    }
  }
  onSubmit() {
    if (!this.groupName.trim()) {
      return;
    }
    this.isCreating = true;

    const groupData = {
      name: this.groupName,
      privacy: this.selectedPrivacy,
      password: this.groupPassword,
    };

    this.createGroup.emit(groupData);

    this.isCreating = false;
  }

  closeModal() {
    if (this.closeCallback) {
      this.closeCallback();
    }
  }

  private resetForm() {
    this.groupName = '';
    this.groupPassword = '';
    this.selectedPrivacy = 'public';
    this.isCreating = false;
  }
}
