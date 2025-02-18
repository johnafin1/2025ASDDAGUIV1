import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Node } from '../../models/node.model';

// Import Node modules (available in Electron with nodeIntegration enabled)
declare const window: any;
declare const __dirname: string;
const fs = window.require('fs');
const path = window.require('path');
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
  @Input() editMode: boolean = false;
  @Output() addChild = new EventEmitter<Node>();
  @Output() remove = new EventEmitter<string>();

  // New properties for inline editing.
  expanded: boolean = true;

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

  toggleExpanded(): void {
    this.expanded = !this.expanded;
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  // When a file is dropped on the image container:
  onDrop(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      // Check if the file is an image.
      if (file.type.startsWith('image/')) {
        // Define a target folder (e.g. a folder named "user_images" in the app folder).
        const targetFolder = path.join(__dirname, 'user_images');
        // Create the folder if it doesn't exist.
        if (!fs.existsSync(targetFolder)) {
          fs.mkdirSync(targetFolder, { recursive: true });
        }
        // Build a target file name using a timestamp.
        const targetFile = path.join(targetFolder, `${Date.now()}_${file.name}`);
        // Electron's File objects have a "path" property.
        const sourcePath = file.webkitRelativePath;
        // Copy the file to the target folder.
        fs.copyFile(sourcePath, targetFile, (err: any) => {
          if (err) {
            console.error('Error copying file:', err);
          } else {
            // Update the node's imageUrl with a relative path.
            const relativePath = path.relative(__dirname, targetFile);
            this.node.imageUrl = relativePath;
          }
        });
      }
    }
  }
}