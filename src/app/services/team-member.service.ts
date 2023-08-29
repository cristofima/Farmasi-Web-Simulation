import { Injectable } from '@angular/core';
import { TeamMemberModel } from '../models/team-member.model';
import { TreeNode } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class TeamMemberService {

  addTeamMember(teamMember: TeamMemberModel) {
    const teamMembers = this.getTeamMembers();
    teamMembers.push(teamMember);
    localStorage.setItem('teamMembers', JSON.stringify(teamMembers));
  }

  editTeamMember(id: string, name: string, personalVolume: number, selectedParentId?: string) {
    const teamMembers = this.getTeamMembers();
    const teamMember = teamMembers.find(x => x.id === id);
    if (teamMember) {
      teamMember.name = name;
      teamMember.personalVolume = personalVolume;
      teamMember.parentId = selectedParentId;
    }

    localStorage.setItem('teamMembers', JSON.stringify(teamMembers));
  }

  getTeamMembers() {
    const teamMembers = localStorage.getItem('teamMembers');
    return teamMembers ? JSON.parse(teamMembers) as TeamMemberModel[] : [];
  }

  deleteTeamMember(treeNode: TreeNode) {
    this.deleteChildren(treeNode);
  }

  private deleteChildren(treeNode: TreeNode) {
    const teamMembers = this.getTeamMembers();
    const children = treeNode.children as TreeNode[];
    children.forEach(child => {
      if (child.children && child.children.length > 0) {
        this.deleteChildren(child);
      }
    });

    const teamMember = teamMembers.find(x => x.id === treeNode.data.id);
    if (teamMember) {
      teamMembers.splice(teamMembers.indexOf(teamMember), 1);
    }

    localStorage.setItem('teamMembers', JSON.stringify(teamMembers));
  }
}
