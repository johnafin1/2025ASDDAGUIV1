import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NodeComponent } from './components/node/node.component';

@Component({
  selector: 'app-root',
  standalone: true, // Mark this component as standalone
  imports: [CommonModule, NodeComponent], // Import CommonModule for ngFor, etc., and your NodeComponent
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = '2025ASDDAGUI';
  
  nodes: any[] = []; // Replace "any" with your Node interface as needed

  addRootNode(): void {
    const newNode = {
      id: this.generateId(),
      text: 'New Node',
      imageUrl: 'assets/default.png',
      layer: 1,
      parentId: null,
      action: null
    };
    this.nodes.push(newNode);
  }

  addChildNode(parent: any): void {
    const maxChildren = parent.layer === 1 ? 12 : parent.layer === 2 ? 8 : 0;
    if (this.getChildren(parent.id).length >= maxChildren) {
      alert('Maximum children reached for this node.');
      return;
    }
    const newNode = {
      id: this.generateId(),
      text: 'New Node',
      imageUrl: 'assets/default.png',
      layer: parent.layer + 1,
      parentId: parent.id,
      action: null
    };
    this.nodes.push(newNode);
  }

  removeNode(nodeId: string): void {
    const removeRecursively = (id: string) => {
      this.getChildren(id).forEach(child => removeRecursively(child.id));
      this.nodes = this.nodes.filter(n => n.id !== id);
    };
    removeRecursively(nodeId);
  }

  getChildren(parentId: string): any[] {
    return this.nodes.filter(node => node.parentId === parentId);
  }

  getRootNodes(): any[] {
    return this.nodes.filter(node => node.parentId === null);
  }

  generateId(): string {
    return Date.now().toString() + Math.floor(Math.random() * 1000).toString();
  }
}