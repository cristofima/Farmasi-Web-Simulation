import { TreeNode } from "primeng/api";

export class TreeNodeUtil {

    /**
   * Converts a flat list of tree nodes into a nested tree structure.
   * @param items - Flat list of tree nodes.
   * @param id - Parent ID for nesting.
   * @returns Nested tree structure.
   */
    static nest(items: TreeNode[], id: string | undefined = undefined): TreeNode[] {
        return items
            .filter(item => item.data.parentId === id)
            .map(item => ({ ...item, children: this.nest(items, item.data.id) }));
    }
}