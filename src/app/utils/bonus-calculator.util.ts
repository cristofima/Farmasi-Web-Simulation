import { TreeNode } from "primeng/api";
import { MonthlyBonusModel } from "../models/monthly-bonus.model";
import { TitleEnum } from "../enums/title.enum";
import {
  BUILDING_BONUS_AMOUNT_PER_GROUP,
  GROUP_NEW_ACTIVE_BI_FOR_BUILDING_BONUS,
  MIN_PV_TO_BE_ACTIVE,
} from "../constants/farmasi.constant";

export class BonusCalculator {

  static calculateMonthlyBonus(treeNode: TreeNode): MonthlyBonusModel {
    const personalBonus = this.calculatePersonalBonus(treeNode);
    const groupBonus = this.calculateGroupBonus(treeNode);
    const carBonus = this.calculateCarBonus(treeNode);
    const buildingBonus = this.calculateBuildingBonus(treeNode);
    const leadershipBonusArr = this.calculateLeadershipBonuses(treeNode);

    return {
      personalBonus,
      groupBonus,
      leadershipBonusArr,
      carBonus,
      buildingBonus,
    };
  }

  private static calculatePersonalBonus(treeNode: TreeNode): number {
    return treeNode.data.pv * treeNode.data.bonification / 100;
  }

  private static calculateGroupBonus(treeNode: TreeNode): number {
    if (!treeNode.children) return 0;
    const myBonification = treeNode.data.bonification;
    return treeNode.children.reduce((acc, child) => acc + child.data.gv * (myBonification - child.data.bonification) / 100, 0);
  }

  private static calculateCarBonus(treeNode: TreeNode): number {
    const title: TitleEnum = treeNode.data.title;

    const carBonusMap: { [key in TitleEnum]?: number } = {
      [TitleEnum.GoldenDirector]: 350,
      [TitleEnum.PlatinumDirector]: 400,
      [TitleEnum.EmeraldDirector]: 450,
      [TitleEnum.DiamondDirector]: 500,
      [TitleEnum.VicePresident]: 550,
      [TitleEnum.President]: 600,
      [TitleEnum.BossDirector]: 650,
      [TitleEnum.ExecutiveBossDirector]: 700
    };
    return carBonusMap[title] || 0;
  }

  private static calculateBuildingBonus(treeNode: TreeNode): number {
    const totalNewActiveBI = this.countNewActiveBI(treeNode);
    return totalNewActiveBI >= GROUP_NEW_ACTIVE_BI_FOR_BUILDING_BONUS
      ? Math.floor(totalNewActiveBI / GROUP_NEW_ACTIVE_BI_FOR_BUILDING_BONUS) * BUILDING_BONUS_AMOUNT_PER_GROUP
      : 0;
  }

  /**
   * Calculate Leadership Bonuses using differential LGV (Leadership Group Volume) formula.
   * LGV = Total GV from FIs at 25%, 22%, and 18% bonus levels combined.
   * Bonus per generation = (LGV_GenN - LGV_GenN+1) × Percentage%
   * 
   * Requirements: GV >= 5000 and SP >= 1500
   */
  private static calculateLeadershipBonuses(treeNode: TreeNode): number[] {
    if (!treeNode.children || treeNode.data.gv < 5000 || treeNode.data.sp < 1500) return [];

    const lpByGen = this.getLeadershipPercentageByGeneration(treeNode.data.title);
    if (lpByGen.length === 0) return [];

    const generations = lpByGen.length;
    // Get cumulative LGV (Leadership Group Volume) for each generation
    // LGV includes GV from FIs at 18%, 22%, and 25% bonus levels
    const lgvByGeneration = this.getLGVByGeneration(treeNode, generations);

    // Leadership bonus uses differential formula: (LGV_GenN - LGV_GenN+1) × %
    return lpByGen.map((percentage, index) => {
      const currentLGV = lgvByGeneration[index] || 0;
      const nextLGV = lgvByGeneration[index + 1] || 0;
      return (currentLGV - nextLGV) * percentage / 100;
    });
  }

  private static countNewActiveBI(treeNode: TreeNode): number {
    return treeNode.children
      ? treeNode.children.reduce((acc, child) => (child.data.isNew && child.data.pv >= MIN_PV_TO_BE_ACTIVE) ? acc + 1 : acc, 0)
      : 0;
  }

  /**
   * Get cumulative Leadership Group Volume (LGV) for each generation.
   * LGV = Total GV from FIs at 18%, 22%, and 25% bonus levels.
   * Each generation's LGV includes all qualifying FIs from that generation onwards (cumulative downward).
   */
  private static getLGVByGeneration(treeNode: TreeNode, generations: number): number[] {
    // First, get raw LGV for each generation level
    const rawLGVByGen = Array(generations + 1).fill(0);
    this.accumulateLGV(treeNode, rawLGVByGen, 0);

    // Convert to cumulative LGV (each generation includes all below)
    // This is needed for the differential calculation
    const cumulativeLGV = Array(generations + 1).fill(0);
    for (let i = generations; i >= 0; i--) {
      cumulativeLGV[i] = rawLGVByGen[i] + (cumulativeLGV[i + 1] || 0);
    }

    return cumulativeLGV;
  }

  private static accumulateLGV(treeNode: TreeNode, volumes: number[], currentGen: number): void {
    if (!treeNode.children || currentGen >= volumes.length) return;

    // LGV includes GV from FIs at 18%, 22%, and 25% bonus levels
    const qualifyingBonusLevels = [18, 22, 25];
    const lgv = treeNode.children
      .filter(child => qualifyingBonusLevels.includes(child.data.bonification))
      .reduce((acc, child) => acc + child.data.gv, 0);
    
    volumes[currentGen] += lgv;

    // Recurse into ALL children to find qualifying FIs in deeper generations
    treeNode.children.forEach(child => {
      this.accumulateLGV(child, volumes, currentGen + 1);
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
      [TitleEnum.ExecutiveBossDirector]: [8.5, 7, 4.25, 3.75, 2.5, 1.25, 0.5, 0]
    };

    return leadershipPercentages[title as TitleEnum] || [];
  }
}
