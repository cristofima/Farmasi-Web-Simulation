import { TreeNode } from 'primeng/api';
import {
  LeadershipFIDetail,
  LeadershipGenerationDetail,
  MonthlyBonusModel,
} from '../models/monthly-bonus.model';
import { TitleEnum } from '../enums/title.enum';

export class BonusCalculator {
  static calculateMonthlyBonus(treeNode: TreeNode): MonthlyBonusModel {
    const personalBonus = this.calculatePersonalBonus(treeNode);
    const groupBonus = this.calculateGroupBonus(treeNode);
    const carBonus = this.calculateCarBonus(treeNode);
    const { leadershipBonusArr, leadershipDetails } =
      this.calculateLeadershipBonuses(treeNode);

    return {
      personalBonus,
      groupBonus,
      leadershipBonusArr,
      leadershipDetails,
      carBonus,
    };
  }

  private static calculatePersonalBonus(treeNode: TreeNode): number {
    return (treeNode.data.pv * treeNode.data.bonification) / 100;
  }

  private static calculateGroupBonus(treeNode: TreeNode): number {
    if (!treeNode.children) return 0;
    const myBonification = treeNode.data.bonification;
    return treeNode.children.reduce(
      (acc, child) =>
        acc +
        (child.data.gv * (myBonification - child.data.bonification)) / 100,
      0,
    );
  }

  private static calculateCarBonus(treeNode: TreeNode): number {
    const title: TitleEnum = treeNode.data.title;

    const carBonusMap: { [key in TitleEnum]?: number } = {
      [TitleEnum.GoldenDirector]: 300,
      [TitleEnum.PlatinumDirector]: 350,
      [TitleEnum.EmeraldDirector]: 400,
      [TitleEnum.DiamondDirector]: 450,
      [TitleEnum.VicePresident]: 500,
      [TitleEnum.President]: 550,
      [TitleEnum.BossDirector]: 600,
      [TitleEnum.ExecutiveBossDirector]: 650,
    };
    return carBonusMap[title] || 0;
  }

  private static calculateLeadershipBonuses(
    treeNode: TreeNode,
  ): { leadershipBonusArr: number[]; leadershipDetails: LeadershipGenerationDetail[] } {
    if (!treeNode.children || treeNode.data.gv < 5000 || treeNode.data.sp < 1500) {
      return { leadershipBonusArr: [], leadershipDetails: [] };
    }

    const lpByGen = this.getLeadershipPercentageByGeneration(treeNode.data.title);
    if (lpByGen.length === 0) {
      return { leadershipBonusArr: [], leadershipDetails: [] };
    }

    const generations = lpByGen.length;
    const lgvByGen: number[] = Array(generations).fill(0);
    const fisByGeneration: LeadershipFIDetail[][] = Array.from(
      { length: generations },
      () => [],
    );

    this.collectLGVAndFIs(treeNode.children, lgvByGen, fisByGeneration, 0);

    const leadershipDetails: LeadershipGenerationDetail[] = lpByGen.map(
      (percentage, index) => {
        const lgv = lgvByGen[index] || 0;
        const nextLgv = lgvByGen[index + 1] || 0;
        const differentialLgv = lgv - nextLgv;
        const amount = (differentialLgv * percentage) / 100;

        return {
          generation: index + 1,
          percentage,
          lgv,
          differentialLgv,
          amount,
          fis: fisByGeneration[index] || [],
        };
      },
    );

    const leadershipBonusArr = leadershipDetails.map((detail) => detail.amount);

    return { leadershipBonusArr, leadershipDetails };
  }

  private static collectLGVAndFIs(
    children: TreeNode[],
    lgvByGen: number[],
    fisByGen: LeadershipFIDetail[][],
    currentGen: number,
  ): void {
    if (currentGen >= lgvByGen.length || !children) return;

    const qualifyingBonusLevels = [18, 22, 25];

    children.forEach((child) => {
      if (qualifyingBonusLevels.includes(child.data.bonification)) {
        lgvByGen[currentGen] += child.data.gv;
        fisByGen[currentGen].push({
          name: child.data.name,
          bonification: child.data.bonification,
          gv: child.data.gv,
        });
      }

      if (child.children && child.children.length > 0) {
        this.collectLGVAndFIs(child.children, lgvByGen, fisByGen, currentGen + 1);
      }
    });
  }

  private static getLeadershipPercentageByGeneration(title: string): number[] {
    const leadershipPercentages: { [key in TitleEnum]?: number[] } = {
      [TitleEnum.Director]: [4, 3, 2, 1.5, 0],
      [TitleEnum.BronzeDirector]: [4.5, 3.25, 2.25, 1.75, 0],
      [TitleEnum.GoldenDirector]: [5, 3.5, 2.5, 2, 0],
      [TitleEnum.PlatinumDirector]: [5.5, 4, 2.75, 2.2, 0],
      [TitleEnum.EmeraldDirector]: [6, 4.5, 3, 2.5, 0],
      [TitleEnum.DiamondDirector]: [6.5, 5, 3.25, 2.75, 1.5, 0],
      [TitleEnum.VicePresident]: [7, 5.5, 3.5, 3, 1.75, 0],
      [TitleEnum.President]: [7.5, 6, 3.75, 3.25, 2, 0.75, 0],
      [TitleEnum.BossDirector]: [8, 6.5, 4, 3.5, 2.25, 1, 0],
      [TitleEnum.ExecutiveBossDirector]: [8.5, 7, 4.25, 3.75, 2.5, 1.25, 0.5, 0],
    };

    return leadershipPercentages[title as TitleEnum] || [];
  }
}
