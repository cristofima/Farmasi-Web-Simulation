import { TreeNode } from "primeng/api";
import { MonthlyBonusModel } from "../models/monthly-bonus.model";
import { TitleEnum } from "../enums/title.enum";
import {
  BUILDING_BONUS_AMOUNT_PER_GROUP,
  GROUP_NEW_ACTIVE_BI_FOR_BUILDING_BONUS,
  MIN_NEW_ACTIVE_BI_FOR_POWER_BONUS,
  MIN_PV_TO_BE_ACTIVE,
  POWER_BONUS_AMOUNT
} from "../constants/farmasi.constant";

export class BonusCalculator {

  static calculateMonthlyBonus(treeNode: TreeNode): MonthlyBonusModel {
    const personalBonus = this.calculatePersonalBonus(treeNode);
    const groupBonus = this.calculateGroupBonus(treeNode);
    const carBonus = this.calculateCarBonus(treeNode);
    const buildingBonus = this.calculateBuildingBonus(treeNode);
    const powerBonus = this.calculatePowerBonus(treeNode);
    const leadershipBonusArr = this.calculateLeadershipBonuses(treeNode);

    return {
      personalBonus,
      groupBonus,
      leadershipBonusArr,
      carBonus,
      buildingBonus,
      powerBonus
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

  private static calculatePowerBonus(treeNode: TreeNode): number {
    return this.countNewActiveBI(treeNode) >= MIN_NEW_ACTIVE_BI_FOR_POWER_BONUS ? POWER_BONUS_AMOUNT : 0;
  }

  private static calculateLeadershipBonuses(treeNode: TreeNode): number[] {
    if (!treeNode.children || treeNode.data.gv < 5000 || treeNode.data.sp < 1500) return [];

    const lpByGen = this.getLeadershipPercentageByGeneration(treeNode.data.title);
    const sumGroupVolumeArr = this.getSumGroupVolumeByGeneration(treeNode, lpByGen.length);

    return lpByGen.map((percentage, index) => {
      if (index === sumGroupVolumeArr.length - 1) return 0;
      return (sumGroupVolumeArr[index] - sumGroupVolumeArr[index + 1]) * percentage / 100;
    });
  }

  private static countNewActiveBI(treeNode: TreeNode): number {
    return treeNode.children
      ? treeNode.children.reduce((acc, child) => (child.data.isNew && child.data.pv >= MIN_PV_TO_BE_ACTIVE) ? acc + 1 : acc, 0)
      : 0;
  }

  private static getSumGroupVolumeByGeneration(treeNode: TreeNode, generations: number, currentGeneration: number = 1): number[] {
    if (!treeNode.children) return Array(generations).fill(0);

    const sumGroupVolumes = Array(generations).fill(0);
    sumGroupVolumes[currentGeneration - 1] = treeNode.children.reduce((acc, child) => acc + child.data.gv, 0);

    treeNode.children.forEach(child => {
      const childVolumes = this.getSumGroupVolumeByGeneration(child, generations, currentGeneration + 1);
      childVolumes.forEach((volume, index) => {
        sumGroupVolumes[index] += volume;
      });
    });

    return sumGroupVolumes;
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
