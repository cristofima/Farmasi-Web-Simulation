import { TreeNode } from "primeng/api";
import { TeamMemberModel } from "../models/team-member.model";
import { MonthlyBonusModel } from "../models/monthly-bonus.model";
import { TitleEnum } from "../enums/title.enum";

export class TeamMemberUtil {

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
        node.data.sp = node.children.filter(f => f.data.bonification < 18).reduce((acc, child) => acc + child.data.gv, 0);
      } else {
        node.data.gv = node.data.pv;
      }

      this.calculateBonificaionAndTitle(node);
    });
  }

  private static calculateBonificaionAndTitle(node: TreeNode) {
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
      title = TitleEnum.LiderVirtual;

      if (!node.children) return;

      let lidersAt25 = 0;

      node.children.forEach(c => {
        if (c.data.bonification == 25) lidersAt25++;
      });

      if (node.data.sp >= 10000 && lidersAt25 >= 30 && node.data.tp >= 240) {
        title = TitleEnum.JefeEjectutivo;
      } else if (node.data.sp >= 10000 && lidersAt25 >= 30 && node.data.tp >= 120) {
        title = TitleEnum.JefePresidente;
      } else if (node.data.sp >= 10000 && lidersAt25 >= 20 && node.data.tp >= 60) {
        title = TitleEnum.Presidente;
      } else if (node.data.sp >= 10000 && lidersAt25 >= 16 && node.data.tp >= 30) {
        title = TitleEnum.Vicepresidente;
      } else if (node.data.sp >= 5000 && lidersAt25 >= 12 && node.data.tp >= 15) {
        title = TitleEnum.DirectorDiamante;
      } else if (node.data.sp >= 5000 && lidersAt25 >= 8) {
        title = TitleEnum.DirectorEsmeralda;
      } else if (node.data.sp >= 2500 && lidersAt25 >= 4) {
        title = TitleEnum.DirectorPlatino;
      } else if (node.data.sp >= 2500 && lidersAt25 >= 2) {
        title = TitleEnum.DirectorOro;
      } else if (node.data.sp >= 1500 && lidersAt25 >= 1) {
        title = TitleEnum.DirectorBronce;
      } else if (node.data.sp >= 1500) {
        title = TitleEnum.Director;
      }
    }

    node.data.title = title;
  }

  static calculateMonthlyBonus(treeNode: TreeNode): MonthlyBonusModel {
    let personalBonus = treeNode.data.pv * treeNode.data.bonification / 100;
    let grupalBonus = 0;
    let leadershipBonusArr: number[] = [];
    let carBonus = 0;

    if (treeNode.children) {
      let myBonification = treeNode.data.bonification;
      grupalBonus = treeNode.children.reduce((acc, child) => acc + child.data.gv * (myBonification - child.data.bonification) / 100, 0);
      carBonus = this.getCarBonus(treeNode);

      if (treeNode.data.gv >= 5000 && treeNode.data.sp >= 1500) {
        let lpByGen = this.getLeadershipPercentageByGeneration(treeNode.data.title);
        let sumGrupalVolumeArr: number[] = [];

        lpByGen.forEach((_, index) => {
          sumGrupalVolumeArr.push(this.getSumGrupalVolumeByGeneration(treeNode, index + 1));
        });

        for (var i = 0; i < sumGrupalVolumeArr.length - 1; i++) {
          leadershipBonusArr.push((sumGrupalVolumeArr[i] - sumGrupalVolumeArr[i + 1]) * lpByGen[i] / 100);
        }
      }
    }

    return { personalBonus, grupalBonus, leadershipBonusArr, carBonus };
  }

  private static getSumGrupalVolumeByGeneration(treeNode: TreeNode, targetGeneration: number, currentGeneration: number = 1): number {
    if (currentGeneration === targetGeneration) {
      return treeNode.children?.reduce((acc, child) => acc + child.data.gv, 0) as number;
    }

    let sum = 0;
    treeNode.children?.forEach(child => {
      sum += this.getSumGrupalVolumeByGeneration(child, targetGeneration, currentGeneration + 1);
    });

    return sum;
  }

  private static getLeadershipPercentageByGeneration(title: string) {
    if (title == TitleEnum.Director) {
      return [4, 3, 2, 1.5, 0];
    } else if (title == TitleEnum.DirectorBronce) {
      return [4.5, 3.25, 2.25, 1.75, 0];
    } else if (title == TitleEnum.DirectorOro) {
      return [5, 3.5, 2.5, 2, 0];
    } else if (title == TitleEnum.DirectorPlatino) {
      return [5.5, 4, 2.75, 2.2, 0];
    } else if (title == TitleEnum.DirectorEsmeralda) {
      return [6, 4.5, 3, 2.5, 0];
    } else if (title == TitleEnum.DirectorDiamante) {
      return [6.5, 5, 3.25, 2.75, 1.5, 0];
    } else if (title == TitleEnum.Vicepresidente) {
      return [7, 5.5, 3.5, 3, 1.75, 0];
    } else if (title == TitleEnum.Presidente) {
      return [7.5, 6, 3.75, 3.25, 2, 0.75, 0];
    } else if (title == TitleEnum.JefePresidente) {
      return [8, 6.5, 4, 3.5, 2.25, 1, 0];
    } else if (title == TitleEnum.JefeEjectutivo) {
      return [8.5, 7, 4.25, 3.75, 2.5, 1.25, 0.5, 0];
    }

    return [];
  }

  private static getCarBonus(treeNode: TreeNode) {
    let title = treeNode.data.title;

    if (title == TitleEnum.DirectorOro) {
      return 350;
    } else if (title == TitleEnum.DirectorPlatino) {
      return 400;
    } else if (title == TitleEnum.DirectorEsmeralda) {
      return 450;
    } else if (title == TitleEnum.DirectorDiamante) {
      return 500;
    } else if (title == TitleEnum.Vicepresidente) {
      return 550;
    } else if (title == TitleEnum.Presidente) {
      return 600;
    } else if (title == TitleEnum.JefePresidente) {
      return 650;
    } else if (title == TitleEnum.JefeEjectutivo) {
      return 700;
    }

    return 0;
  }
}
