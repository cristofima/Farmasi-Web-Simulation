import { TreeNode } from 'primeng/api';
import { TeamMemberModel } from '../models/team-member.model';
import { TitleEnum, TitlePointEnum } from '../enums/title.enum';
import { TreeNodeUtil } from './tree-node.util';
import { bonusLevelRanges } from '../constants/bonus-level-range.constant';

export class TeamMemberUtil {
  /**
   * Convert a list of team members into a tree structure.
   * @param teamMembers - Array of team members.
   * @returns Tree structure of team members.
   */
  static listToTree(teamMembers: TeamMemberModel[]): TreeNode[] {
    const treeNodes: TreeNode[] = teamMembers.map((member) =>
      this.mapToTreeNode(member)
    );
    return TreeNodeUtil.nest(treeNodes);
  }

  private static mapToTreeNode(member: TeamMemberModel): TreeNode {
    return {
      type: 'person',
      expanded: true,
      data: {
        id: member.id,
        parentId: member.parentId,
        name: member.name,
        title: null,
        bonification: 0,
        pv: member.personalVolume,
        isNew: !!member.isNew,
        gv: 0,
        sp: 0,
        tp: 0,
      },
    };
  }

  /**
   * Calculate additional fields such as GV, SP, and bonification for each node in the tree.
   * @param tree - Tree structure of team members.
   */
  static calculateFields(tree: TreeNode[]): void {
    tree.forEach((node) => {
      if (node.children) {
        this.calculateFields(node.children);
        node.data.gv =
          node.data.pv +
          node.children.reduce((acc, child) => acc + child.data.gv, 0);
        this.setSidePoints(node);
      } else {
        node.data.gv = node.data.pv;
      }
      this.calculateBonificationAndTitle(node);
    });
  }

  private static setSidePoints(node: TreeNode): void {
    if (!node.children) return;

    const sidePoints = node.children
      .filter((child) => child.data.bonification < 18)
      .reduce((acc, child) => acc + child.data.gv, 0);

    [18, 22].forEach((bonification) => {
      const maxChildID = this.getChildIDWithMaxGVAtXBonus(node, bonification);
      node
        .children!.filter(
          (child) =>
            child.data.bonification === bonification &&
            child.data.id !== maxChildID
        )
        .reduce((acc, child) => acc + child.data.gv, 0);
    });

    node.data.sp = sidePoints;
  }

  private static getChildIDWithMaxGVAtXBonus(
    node: TreeNode,
    bonification: number
  ): string | null {
    if (!node.children) return null;

    const maxChild = node.children
      .filter((child) => child.data.bonification === bonification)
      .reduce(
        (prev, current) => (prev.data.gv > current.data.gv ? prev : current),
        node.children[0]
      );

    return maxChild ? maxChild.data.id : null;
  }

  private static calculateBonificationAndTitle(node: TreeNode): void {
    const titlePoints = this.calculateTitlePoints(node);
    node.data.tp = titlePoints;

    const leadersAt25 =
      node.children?.filter((child) => child.data.bonification === 25).length ||
      0;

    const bonusLevelRange = TeamMemberUtil.getMaxBonusLevelRange(
      node.data.gv,
      node.data.sp,
      leadersAt25,
      titlePoints
    );
    node.data.bonification = bonusLevelRange.bonusLevel;
    node.data.title = bonusLevelRange.title;
  }

  private static getMaxBonusLevelRange(
    gv: number,
    sp: number,
    legs: number,
    tp: number
  ) {
    for (const range of bonusLevelRanges) {
      if (
        gv >= range.gv &&
        (range.sp === undefined || sp >= range.sp) &&
        (range.legs === undefined || legs >= range.legs) &&
        (range.tp === undefined || tp >= range.tp)
      ) {
        return range;
      }
    }

    return bonusLevelRanges[bonusLevelRanges.length - 1];
  }

  private static calculateTitlePoints(node: TreeNode): number {
    if (!node.children) return 0;

    return node.children.reduce((acc, child) => {
      if (child.data.title === TitleEnum.BeautyInfluencer) return acc;

      const titleEnumValues = Object.values(TitleEnum);
      const titleKey =
        Object.keys(TitleEnum)[titleEnumValues.indexOf(child.data.title)];
      const titlePointKey = Object.keys(TitlePointEnum).find(
        (key) => key === titleKey
      );
      return titlePointKey
        ? acc + TitlePointEnum[titlePointKey as keyof typeof TitlePointEnum]
        : acc;
    }, 0);
  }
}
