import { TreeNode } from "primeng/api";
import { TeamMemberModel } from "../models/team-member.model";
import { TitleEnum, TitlePointEnum } from "../enums/title.enum";
import { TreeNodeUtil } from "./tree-node.util";

export class TeamMemberUtil {

  /**
   * Convert a list of team members into a tree structure.
   * @param teamMembers - Array of team members.
   * @returns Tree structure of team members.
   */
  static listToTree(teamMembers: TeamMemberModel[]): TreeNode[] {
    const treeNodes: TreeNode[] = teamMembers.map(member => this.mapToTreeNode(member));
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
        tp: 0
      }
    };
  }

  /**
   * Calculate additional fields such as GV, SP, and bonification for each node in the tree.
   * @param tree - Tree structure of team members.
   */
  static calculateFields(tree: TreeNode[]): void {
    tree.forEach(node => {
      if (node.children) {
        this.calculateFields(node.children);
        node.data.gv = node.data.pv + node.children.reduce((acc, child) => acc + child.data.gv, 0);
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
      .filter(child => child.data.bonification < 18)
      .reduce((acc, child) => acc + child.data.gv, 0);

    [18, 22].forEach(bonification => {
      const maxChildID = this.getChildIDWithMaxGVAtXBonus(node, bonification);
      node.children!
        .filter(child => child.data.bonification === bonification && child.data.id !== maxChildID)
        .reduce((acc, child) => acc + child.data.gv, 0);
    });

    node.data.sp = sidePoints;
  }

  private static getChildIDWithMaxGVAtXBonus(node: TreeNode, bonification: number): string | null {
    if (!node.children) return null;

    const maxChild = node.children
      .filter(child => child.data.bonification === bonification)
      .reduce((prev, current) => (prev.data.gv > current.data.gv ? prev : current), node.children[0]);

    return maxChild ? maxChild.data.id : null;
  }

  private static calculateBonificationAndTitle(node: TreeNode): void {
    const titlePoints = this.calculateTitlePoints(node);
    node.data.tp = titlePoints;

    const bonificationRanges = [
      { min: 200, max: 400, bonification: 3 },
      { min: 400, max: 600, bonification: 6 },
      { min: 600, max: 900, bonification: 9 },
      { min: 900, max: 1400, bonification: 12 },
      { min: 1400, max: 2200, bonification: 15 },
      { min: 2200, max: 3600, bonification: 18 },
      { min: 3600, max: 5000, bonification: 22 },
      { min: 5000, max: Infinity, bonification: 25 }
    ];

    const matchingRange = bonificationRanges.find(range => node.data.gv >= range.min && node.data.gv < range.max);
    node.data.bonification = matchingRange ? matchingRange.bonification : 0;

    node.data.title = this.determineTitle(node, titlePoints);
  }

  private static calculateTitlePoints(node: TreeNode): number {
    if (!node.children) return 0;

    return node.children.reduce((acc, child) => {
      if (child.data.title === TitleEnum.BeautyInfluencer) return acc;

      const titleEnumValues = Object.values(TitleEnum);
      const titleKey = Object.keys(TitleEnum)[titleEnumValues.indexOf(child.data.title)];
      const titlePointKey = Object.keys(TitlePointEnum).find(key => key === titleKey);
      return titlePointKey ? acc + TitlePointEnum[titlePointKey as keyof typeof TitlePointEnum] : acc;
    }, 0);
  }

  private static determineTitle(node: TreeNode, titlePoints: number): TitleEnum {
    const lidersAt25 = node.children?.filter(child => child.data.bonification === 25).length || 0;

    if (node.data.gv < 5000) return TitleEnum.BeautyInfluencer;

    if (node.data.sp >= 10000) {
      if (lidersAt25 >= 30) {
        return titlePoints >= 240 ? TitleEnum.ExecutiveBossDirector : TitleEnum.BossDirector;
      }
      if (lidersAt25 >= 20) return titlePoints >= 60 ? TitleEnum.President : TitleEnum.VicePresident;
    }

    if (node.data.sp >= 5000) {
      if (lidersAt25 >= 12) return titlePoints >= 15 ? TitleEnum.DiamondDirector : TitleEnum.EmeraldDirector;
      return TitleEnum.EmeraldDirector;
    }

    if (node.data.sp >= 2500) {
      return lidersAt25 >= 4 ? TitleEnum.PlatinumDirector : TitleEnum.GoldenDirector;
    }

    if (node.data.sp >= 1500) {
      return lidersAt25 >= 1 ? TitleEnum.BronzeDirector : TitleEnum.Director;
    }

    return TitleEnum.BeautyInfluencer;
  }
}
