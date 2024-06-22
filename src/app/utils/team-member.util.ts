import { TreeNode } from "primeng/api";
import { TeamMemberModel } from "../models/team-member.model";
import { MonthlyBonusModel } from "../models/monthly-bonus.model";
import { TitleEnum, TitlePointEnum } from "../enums/title.enum";
import { BUILDING_BONUS_AMOUNT_PER_GROUP, GROUP_NEW_ACTIVE_BI_FOR_BUILDING_BONUS, MIN_NEW_ACTIVE_BI_FOR_POWER_BONUS, MIN_PV_TO_BE_ACTIVE, POWER_BONUS_AMOUNT } from "../constants/farmasi.constant";

export class TeamMemberUtil {

  /**
   * Convert a list of team members into a tree structure.
   * @param teamMembers - Array of team members.
   * @returns Tree structure of team members.
   */
  static listToTree(teamMembers: TeamMemberModel[]) {
    let treeSearchResponses: TreeNode[] = [];
    teamMembers.map((searchResponse) => {
      let treeNode: TreeNode = {
        type: 'person',
        expanded: true,
        data: {
          id: searchResponse.id,
          parentId: searchResponse.parentId,
          name: searchResponse.name,
          title: null,
          bonification: 0,
          pv: searchResponse.personalVolume,
          isNew: !!searchResponse.isNew,
          gv: 0,
          sp: 0,
          tp: 0
        }
      };

      treeSearchResponses.push(treeNode)
    });

    const nest = (items: TreeNode[], id = undefined): TreeNode[] => {
      return items
        .filter((item: TreeNode) => item.data.parentId === id)
        .map((item: TreeNode) => ({ ...item, children: nest(items, item.data.id) }));
    };

    return nest(treeSearchResponses);
  }

  static calculateFields(tree: TreeNode[]) {
    tree.forEach((node) => {
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

  private static setSidePoints(node: TreeNode) {
    if (!node.children) return;

    let sidePoints = node.children.filter(f => f.data.bonification < 18).reduce((acc, child) => acc + child.data.gv, 0);

    [18, 22].forEach(bonification => {
      let maxChildID = this.getChildIDWithMaxGVAtXBonus(node, bonification);
      sidePoints += node.children!.filter(f => f.data.bonification == bonification && f.data.id != maxChildID).reduce((acc, child) => acc + child.data.gv, 0);
    });

    node.data.sp = sidePoints;
  }

  private static getChildIDWithMaxGVAtXBonus(node: TreeNode, bonification: number): string | null {
    if (!node.children) return null;

    let children = node.children.filter(f => f.data.bonification == bonification);
    if (children.length == 0) return null;

    let maxChild = children[0];
    children.forEach(child => {
      if (child.data.bonification == bonification && child.data.gv > maxChild.data.gv) {
        maxChild = child;
      }
    });

    return maxChild.data.id;
  }

  private static calculateBonificationAndTitle(node: TreeNode) {
    let title = "";

    if (node.data.gv < 5000) {
      title = TitleEnum.BeautyInfluencer;
    }

    if (node.data.gv >= 200 && node.data.gv < 400) {
      node.data.bonification = 3;
    } else if (node.data.gv >= 400 && node.data.gv < 600) {
      node.data.bonification = 6;
    } else if (node.data.gv >= 600 && node.data.gv < 900) {
      node.data.bonification = 9;
    } else if (node.data.gv >= 900 && node.data.gv < 1400) {
      node.data.bonification = 12;
    } else if (node.data.gv >= 1400 && node.data.gv < 2200) {
      node.data.bonification = 15;
    } else if (node.data.gv >= 2200 && node.data.gv < 3600) {
      node.data.bonification = 18;
    } else if (node.data.gv >= 3600 && node.data.gv < 5000) {
      node.data.bonification = 22;
    } else if (node.data.gv >= 5000) {
      node.data.bonification = 25;
      title = TitleEnum.VirtualManager;

      if (!node.children) return;

      let lidersAt25 = 0;
      let titlePoints = 0;

      const titleEnumValues = Object.values(TitleEnum);

      node.children.forEach(c => {
        if (c.data.bonification == 25) lidersAt25++;
        if (c.data.title == TitleEnum.BeautyInfluencer) return;

        let titleKey = Object.keys(TitleEnum)[titleEnumValues.indexOf(c.data.title)];
        let titlePointKey = Object.keys(TitlePointEnum).find(key => key == titleKey);
        if (titlePointKey) {
          titlePoints += TitlePointEnum[titlePointKey as keyof typeof TitlePointEnum];
        }
      });

      node.data.tp = titlePoints;

      if (node.data.sp >= 10000 && lidersAt25 >= 30 && node.data.tp >= 240) {
        title = TitleEnum.ExecutiveBossDirector;
      } else if (node.data.sp >= 10000 && lidersAt25 >= 30 && node.data.tp >= 120) {
        title = TitleEnum.BossDirector;
      } else if (node.data.sp >= 10000 && lidersAt25 >= 20 && node.data.tp >= 60) {
        title = TitleEnum.President;
      } else if (node.data.sp >= 10000 && lidersAt25 >= 16 && node.data.tp >= 30) {
        title = TitleEnum.VicePresident;
      } else if (node.data.sp >= 5000 && lidersAt25 >= 12 && node.data.tp >= 15) {
        title = TitleEnum.DiamondDirector;
      } else if (node.data.sp >= 5000 && lidersAt25 >= 8) {
        title = TitleEnum.EmeraldDirector;
      } else if (node.data.sp >= 2500 && lidersAt25 >= 4) {
        title = TitleEnum.PlatinumDirector;
      } else if (node.data.sp >= 2500 && lidersAt25 >= 2) {
        title = TitleEnum.GoldenDirector;
      } else if (node.data.sp >= 1500 && lidersAt25 >= 1) {
        title = TitleEnum.BronzeDirector;
      } else if (node.data.sp >= 1500) {
        title = TitleEnum.Director;
      }
    }

    node.data.title = title;
  }

  static calculateMonthlyBonus(treeNode: TreeNode): MonthlyBonusModel {
    let personalBonus = treeNode.data.pv * treeNode.data.bonification / 100;
    let groupBonus = 0;
    let leadershipBonusArr: number[] = [];
    let carBonus = 0;
    let buildingBonus = 0;
    let powerBonus = 0;

    if (treeNode.children) {
      let myBonification = treeNode.data.bonification;
      groupBonus = treeNode.children.reduce((acc, child) => acc + child.data.gv * (myBonification - child.data.bonification) / 100, 0);
      carBonus = this.getCarBonus(treeNode);

      const totalNewActiveBI = treeNode.children.reduce((acc, child) => (child.data.isNew && child.data.pv >= MIN_PV_TO_BE_ACTIVE) ? acc + 1 : acc, 0);
      
      if(totalNewActiveBI >= MIN_NEW_ACTIVE_BI_FOR_POWER_BONUS) powerBonus = POWER_BONUS_AMOUNT;
      if(totalNewActiveBI >= GROUP_NEW_ACTIVE_BI_FOR_BUILDING_BONUS){
        buildingBonus = Math.floor(totalNewActiveBI / GROUP_NEW_ACTIVE_BI_FOR_BUILDING_BONUS) * BUILDING_BONUS_AMOUNT_PER_GROUP;
      }

      if (treeNode.data.gv >= 5000 && treeNode.data.sp >= 1500) {
        let lpByGen = this.getLeadershipPercentageByGeneration(treeNode.data.title);
        let sumGroupVolumeArr: number[] = [];

        lpByGen.forEach((_, index) => {
          sumGroupVolumeArr.push(this.getSumGroupVolumeByGeneration(treeNode, index + 1));
        });

        for (var i = 0; i < sumGroupVolumeArr.length - 1; i++) {
          leadershipBonusArr.push((sumGroupVolumeArr[i] - sumGroupVolumeArr[i + 1]) * lpByGen[i] / 100);
        }
      }
    }

    const monthlyBonus: MonthlyBonusModel = {
      personalBonus,
      groupBonus,
      leadershipBonusArr,
      carBonus,
      buildingBonus,
      powerBonus
    };

    return monthlyBonus;
  }

  private static getSumGroupVolumeByGeneration(treeNode: TreeNode, targetGeneration: number, currentGeneration: number = 1): number {
    if (currentGeneration === targetGeneration) {
      return treeNode.children?.reduce((acc, child) => acc + child.data.gv, 0) as number;
    }

    let sum = 0;
    treeNode.children?.forEach(child => {
      sum += this.getSumGroupVolumeByGeneration(child, targetGeneration, currentGeneration + 1);
    });

    return sum;
  }

  private static getLeadershipPercentageByGeneration(title: string) {
    if (title == TitleEnum.Director) {
      return [4, 3, 2, 1.5, 0];
    } else if (title == TitleEnum.BronzeDirector) {
      return [4.5, 3.25, 2.25, 1.75, 0];
    } else if (title == TitleEnum.GoldenDirector) {
      return [5, 3.5, 2.5, 2, 0];
    } else if (title == TitleEnum.PlatinumDirector) {
      return [5.5, 4, 2.75, 2.2, 0];
    } else if (title == TitleEnum.EmeraldDirector) {
      return [6, 4.5, 3, 2.5, 0];
    } else if (title == TitleEnum.DiamondDirector) {
      return [6.5, 5, 3.25, 2.75, 1.5, 0];
    } else if (title == TitleEnum.VicePresident) {
      return [7, 5.5, 3.5, 3, 1.75, 0];
    } else if (title == TitleEnum.President) {
      return [7.5, 6, 3.75, 3.25, 2, 0.75, 0];
    } else if (title == TitleEnum.BossDirector) {
      return [8, 6.5, 4, 3.5, 2.25, 1, 0];
    } else if (title == TitleEnum.ExecutiveBossDirector) {
      return [8.5, 7, 4.25, 3.75, 2.5, 1.25, 0.5, 0];
    }

    return [];
  }

  private static getCarBonus(treeNode: TreeNode) {
    let title = treeNode.data.title;

    if (title == TitleEnum.GoldenDirector) {
      return 350;
    } else if (title == TitleEnum.PlatinumDirector) {
      return 400;
    } else if (title == TitleEnum.EmeraldDirector) {
      return 450;
    } else if (title == TitleEnum.DiamondDirector) {
      return 500;
    } else if (title == TitleEnum.VicePresident) {
      return 550;
    } else if (title == TitleEnum.President) {
      return 600;
    } else if (title == TitleEnum.BossDirector) {
      return 650;
    } else if (title == TitleEnum.ExecutiveBossDirector) {
      return 700;
    }

    return 0;
  }
}
