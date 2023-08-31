import { TreeNode } from "primeng/api";
import { TeamMemberModel } from "../models/team-member.model";
import { TeamMemberService } from "./team-member.service";

describe('TeamMemberService without Angular testing support', () => {
  let teamMemberService: TeamMemberService;

  beforeEach(() => {
    teamMemberService = new TeamMemberService();
    teamMemberService.setStorageKey('teamMembersTest');
    localStorage.clear();
  });

  it('#addTeamMember should save the data', () => {
    let teamMember: TeamMemberModel = {
      id: '1',
      name: 'Test',
      personalVolume: 100
    };

    teamMemberService.addTeamMember(teamMember);
    let savedTeamMember = teamMemberService.getTeamMember(teamMember.id);

    expect(savedTeamMember).not.toBeUndefined();
    expect(savedTeamMember!.id).toEqual(teamMember.id);
    expect(savedTeamMember!.name).toEqual(teamMember.name);
    expect(savedTeamMember!.personalVolume).toEqual(teamMember.personalVolume);
  });

  it('#editTeamMember should modify the existing data', () => {
    let teamMember: TeamMemberModel = {
      id: '2',
      name: 'Test',
      personalVolume: 70
    };

    teamMemberService.addTeamMember(teamMember);

    let newName = 'Test 2';
    let newPV = 95;
    let newParentId = '1';
    teamMemberService.editTeamMember(teamMember.id, newName, newPV, newParentId);

    let editedTeamMember = teamMemberService.getTeamMember(teamMember.id);

    expect(editedTeamMember!.name).toEqual(newName);
    expect(editedTeamMember!.personalVolume).toEqual(newPV);
    expect(editedTeamMember!.parentId).toEqual(newParentId);
  });

  it('#deleteTeamMember should delete the existing record', () => {
    let teamMember: TeamMemberModel = {
      id: '3',
      name: 'Test',
      personalVolume: 50
    };

    teamMemberService.addTeamMember(teamMember);

    let treeNode: TreeNode = {
      data: teamMember
    };

    teamMemberService.deleteTeamMember(treeNode);

    let deletedTeamMember = teamMemberService.getTeamMember(teamMember.id);

    expect(deletedTeamMember).toBeUndefined();
  });

  it('#deleteTeamMember should delete the existing record with its children', () => {
    let teamMember1: TeamMemberModel = {
      id: '1',
      name: 'Test 1',
      personalVolume: 50
    };

    let teamMember2: TeamMemberModel = {
      id: '2',
      name: 'Test 2',
      personalVolume: 80,
      parentId: teamMember1.id
    };

    let teamMember3: TeamMemberModel = {
      id: '3',
      name: 'Test 3',
      personalVolume: 110,
      parentId: teamMember2.id
    };

    teamMemberService.addTeamMember(teamMember1);
    teamMemberService.addTeamMember(teamMember2);
    teamMemberService.addTeamMember(teamMember3);

    let treeNode: TreeNode = {
      data: teamMember1,
      children: [
        {
          data: teamMember2,
          children: [
            {
              data: teamMember3
            }
          ]
        }
      ]
    };

    teamMemberService.deleteTeamMember(treeNode);

    let membersArr = teamMemberService.getTeamMembers();

    expect(membersArr.length).toEqual(0);
  });
});
