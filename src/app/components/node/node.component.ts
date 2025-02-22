import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Node } from '../../models/node.model';

// Import Node modules (available in Electron with nodeIntegration enabled)
declare const window: any;
declare const __dirname: string;
const isElectron = window && window.process && window.process.type;
let fs: any = null;
let path: any = null;
if (isElectron && window.require) {
  try {
    fs = window.require('fs');
    path = window.require('path');
  } catch (e) {
    console.error('Error loading Electron modules:', e);
  }
} else {
  // Provide a minimal fallback for path operations in non-Electron environments.
  path = {
    join: (...args: string[]) => args.join('/'),
    relative: (from: string, to: string) => to
  };
}

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
      const file: any = event.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        // Check if file.path is available and non-empty.
        if (isElectron && fs && path && file.path && file.path.trim() !== '') {
          // Electron-specific: copy file using fs
          const targetFolder = path.join(__dirname, 'user_images');
          if (!fs.existsSync(targetFolder)) {
            fs.mkdirSync(targetFolder, { recursive: true });
          }
          const targetFile = path.join(targetFolder, `${Date.now()}_${file.name}`);
          const sourcePath = file.path;
          fs.copyFile(sourcePath, targetFile, (err: any) => {
            if (err) {
              console.error('Error copying file:', err);
            } else {
              const relativePath = path.relative(__dirname, targetFile);
              this.node.imageUrl = relativePath;
            }
          });
        } else {
          // Fallback: use FileReader to read the file as Data URL
          const reader = new FileReader();
          reader.onload = (e: any) => {
            this.node.imageUrl = e.target.result; // Data URL preview
          };
          reader.readAsDataURL(file);
        }
      }
    }
  }
}