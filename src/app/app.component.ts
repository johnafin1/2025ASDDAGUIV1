import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NodeComponent } from './components/node/node.component';
import { Node } from './models/node.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, NodeComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Build or use an AAC language';
  mode: 'edit' | 'use' = 'edit';

  // Our DAG data
  nodes: Node[] = [];

  // For Use mode: keep track of the navigation path (selected nodes)
  selectedPath: Node[] = [];

  // For Use mode navigation: the current navigation path (temporary selection)
  currentPath: Node[] = [];

  // The final sentence words (only from bottom-level nodes)
  sentenceWords: string[] = [];

  // ----------------- Edit Mode Methods -----------------
  addRootNode(): void {
    const newNode: Node = {
      id: this.generateId(),
      text: 'New Node',
      imageUrl: 'assets/default.png', // Make sure you have a default image in assets
      layer: 1,
      parentId: null,
      action: null
    };
    this.nodes.push(newNode);
  }

  addChildNode(parent: Node): void {
    const maxChildren = parent.layer === 1 ? 12 : parent.layer === 2 ? 8 : 0;
    if (this.getChildren(parent.id).length >= maxChildren) {
      alert('Maximum children reached for this node.');
      return;
    }
    const newNode: Node = {
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

  getChildren(parentId: string): Node[] {
    return this.nodes.filter(node => node.parentId === parentId);
  }

  getRootNodes(): Node[] {
    return this.nodes.filter(node => node.parentId === null);
  }

  generateId(): string {
    return Date.now().toString() + Math.floor(Math.random() * 1000).toString();
  }

  // ----------------- Mode Toggle -----------------
  toggleMode(): void {
    if (this.mode === 'edit') {
      this.mode = 'use';
      this.currentPath = [];
    } else {
      this.mode = 'edit';
    }
  }

  // ----------------- Use Mode Methods -----------------
  getVisibleNodes(): Node[] {
    if (this.currentPath.length === 0) {
      return this.getRootNodes();
    } else {
      const lastNode = this.currentPath[this.currentPath.length - 1];
      return this.getChildren(lastNode.id);
    }
  }

  getGridCells(): (Node | null)[] {
    const visibleNodes = this.getVisibleNodes();
    const totalCells = 7 * 12; // 84 cells total
    const cells: (Node | null)[] = [];
    for (let i = 0; i < totalCells; i++) {
      if (i < visibleNodes.length) {
        cells.push(visibleNodes[i]);
      } else {
        cells.push(null);
      }
    }
    return cells;
  }

  // When a node is clicked in Use mode:
  onUseNodeClick(node: Node): void {
    // Check if the node has a special action (if so, handle it).
    if (node.action) {
      this.performAction(node);
    } else {
      // If this is not a bottom-level node, navigate into it.
      if (node.layer < 3) {
        this.currentPath.push(node);
      } else if (node.layer === 3) {
        // This is the bottom-level node: add its text to the sentence.
        this.sentenceWords.push(node.text);
        // Speak the word.
        this.speakWord(node.text);
        // Reset the navigation to start over at the top level.
        this.currentPath = [];
      }
    }
  }

  // Navigate back up in Use mode.
  goBack(): void {
    if (this.currentPath.length > 0) {
      this.currentPath.pop();
    }
  }

  // Build and return the final sentence.
  getSentence(): string {
    return this.sentenceWords.join(' ');
  }

  // Use the Web Speech API to speak a given word.
  speakWord(word: string): void {
    const utterance = new SpeechSynthesisUtterance(word);
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
  }

  
  // ----------------- Text-to-Speech -----------------
  speakSentence(): void {
    const sentence = this.getSentence();
    if (!sentence.trim()) {
      alert('No sentence to speak!');
      return;
    }
    const utterance = new SpeechSynthesisUtterance(sentence);
    speechSynthesis.speak(utterance);
  }

  // ----------------- Utility Methods -----------------
  
  // For special actions, you might still have:
  performAction(node: Node): void {
    console.log(node.id);
  }


  // ----------------- Save/Load Functionality -----------------
  saveDAG(): void {
    const data = JSON.stringify(this.nodes);
    localStorage.setItem('dagData', data);
    alert('DAG saved to local storage!');
  }

  loadDAG(): void {
    const data = localStorage.getItem('dagData');
    if (data) {
      try {
        this.nodes = JSON.parse(data);
        alert('DAG loaded from local storage!');
      } catch (e) {
        alert('Error parsing saved DAG data.');
      }
    } else {
      alert('No saved DAG found in local storage.');
    }
  }

  // ----------------- Bulk CSV Import -----------------
  importCSV(event: any): void {
    const file = event.target.files[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const text = e.target.result;
      const lines: string[] = text.split(/\r\n|\n/);
      lines.forEach(line => {
        if (line.trim().length === 0) return;
        const parts = line.split(',');
        // CSV format: text,imageUrl,layer,parentId,action
        const [textVal, imageUrl, layerStr, parentId, action] = parts;
        const node: Node = {
          id: this.generateId(),
          text: textVal.trim(),
          imageUrl: imageUrl.trim(),
          layer: parseInt(layerStr, 10),
          parentId: parentId.trim() === '' ? null : parentId.trim(),
          action: action ? action.trim() : null
        };
        this.nodes.push(node);
      });
      alert('CSV import complete!');
    };
    reader.readAsText(file);
  }
}
