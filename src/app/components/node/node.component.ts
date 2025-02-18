import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Node } from '../../models/node.model';

// Import Node modules (available in Electron with nodeIntegration enabled)
import * as fs from 'fs';
import * as path from 'path';
@Component({
  selector: 'app-node',
  standalone: true,  // if using standalone; adjust if you're not
  imports: [CommonModule, FormsModule], // Needed for ngModel and common directives
  templateUrl: './node.component.html',
  styleUrls: ['./node.component.css']
})
export class NodeComponent {
  @Input() node!: Node;
  @Input() allNodes: Node[] = [];
  @Output() addChild = new EventEmitter<Node>();
  @Output() remove = new EventEmitter<string>();

  // New properties for inline editing.
  isEditing: boolean = false;
  editedText: string = '';
  editedImageUrl: string = '';

  // Returns the child nodes of this node.
  getChildNodes(): Node[] {
    return this.allNodes.filter(n => n.parentId === this.node.id);
  }

  onAddChild(): void {
    this.addChild.emit(this.node);
  }

  onRemove(): void {
    this.remove.emit(this.node.id);
  }

  // Toggle into edit mode and set up initial values.
  toggleEdit(): void {
    this.isEditing = true;
    this.editedText = this.node.text;
    this.editedImageUrl = this.node.imageUrl;
  }

  // Save changes to the node and exit edit mode.
  saveEdit(): void {
    this.node.text = this.editedText;
    this.node.imageUrl = this.editedImageUrl;
    this.isEditing = false;
  }

  // Cancel editing and revert to display mode.
  cancelEdit(): void {
    this.isEditing = false;
  }
}