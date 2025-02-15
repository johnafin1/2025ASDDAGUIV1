import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Node } from '../../models/node.model';

@Component({
  selector: 'app-node',
  standalone: true, // Optional: mark as standalone
  imports: [CommonModule], // If using common directives like ngFor
  templateUrl: './node.component.html',
  styleUrls: ['./node.component.css']
})
export class NodeComponent {
  @Input() node!: Node;
  @Input() allNodes: Node[] = [];
  @Output() addChild = new EventEmitter<Node>();
  @Output() remove = new EventEmitter<string>();

  getChildNodes(): Node[] {
    return this.allNodes.filter(n => n.parentId === this.node.id);
  }

  onAddChild(): void {
    this.addChild.emit(this.node);
  }

  onRemove(): void {
    this.remove.emit(this.node.id);
  }
}