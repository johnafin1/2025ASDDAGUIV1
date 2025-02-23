export interface Node {
    id: string;
    text: string;
    imageUrl: string;
    layer: number;               // 1, 2, or 3
    parentId: string | null;     // null for root nodes
    // Optional: action property for special functions (e.g., backspace, keyboard)
    action?: string | null;
    x?: number | null;
    y?: number | null;
    visible?: boolean | null;
  }