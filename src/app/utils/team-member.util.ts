import { TreeNode } from 'primeng/api';
import { TeamMemberModel } from '../models/team-member.model';
import { TitleEnum, TitlePointEnum } from '../enums/title.enum';
import { TreeNodeUtil } from './tree-node.util';
import { bonusLevelRanges } from '../constants/bonus-level-range.constant';

export class TeamMemberUtil {
  static listToTree(teamMembers: TeamMemberModel[]): TreeNode[] {
    const treeNodes: TreeNode[] = teamMembers.map((member) =>
      this.mapToTreeNode(member),
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
        gv: 0,
        sp: 0,
        tp: 0,
      },
    };
  }

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

    const firstGenerationVolume = node.children.reduce(
      (acc, child) => acc + child.data.gv,
      0,
    );
    const volumeAt25 = node.children
      .filter((child) => child.data.bonification === 25)
      .reduce((acc, child) => acc + child.data.gv, 0);
    const maxVolumeAt18Or22 = node.children
      .filter(
        (child) =>
          child.data.bonification === 18 || child.data.bonification === 22,
      )
      .reduce((max, child) => Math.max(max, child.data.gv), 0);

    node.data.sp = firstGenerationVolume - volumeAt25 - maxVolumeAt18Or22;
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
      titlePoints,
    );
    node.data.bonification = bonusLevelRange.bonusLevel;
    node.data.title = bonusLevelRange.title;
  }

  private static getMaxBonusLevelRange(
    gv: number,
    sp: number,
    legs: number,
    tp: number,
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
      return acc + this.getTitlePoints(child.data.title);
    }, 0);
  }

  private static getTitlePoints(title: TitleEnum): number {
    switch (title) {
      case TitleEnum.VirtualManager:
        return TitlePointEnum.VirtualManager;
      case TitleEnum.Director:
        return TitlePointEnum.Director;
      case TitleEnum.BronzeDirector:
        return TitlePointEnum.BronzeDirector;
      case TitleEnum.GoldenDirector:
        return TitlePointEnum.GoldenDirector;
      case TitleEnum.PlatinumDirector:
        return TitlePointEnum.PlatinumDirector;
      case TitleEnum.EmeraldDirector:
        return TitlePointEnum.DirectorEsmeralda;
      case TitleEnum.DiamondDirector:
        return TitlePointEnum.DiamondDirector;
      case TitleEnum.VicePresident:
        return TitlePointEnum.VicePresident;
      case TitleEnum.President:
        return TitlePointEnum.President;
      case TitleEnum.BossDirector:
        return TitlePointEnum.BossDirector;
      case TitleEnum.ExecutiveBossDirector:
        return TitlePointEnum.ExecutiveBossDirector;
      default:
        return 0;
    }
  }
}
