import { TitleEnum } from '../enums/title.enum';

export type BonusLevelRange = {
  gv: number;
  sp?: number;
  legs?: number;
  tp?: number;
  bonusLevel: number;
  title: TitleEnum;
};

export const bonusLevelRanges: BonusLevelRange[] = [
  {
    gv: 200000,
    sp: 10000,
    legs: 30,
    tp: 240,
    bonusLevel: 25,
    title: TitleEnum.ExecutiveBossDirector,
  },
  {
    gv: 150000,
    sp: 10000,
    legs: 30,
    tp: 120,
    bonusLevel: 25,
    title: TitleEnum.BossDirector,
  },
  {
    gv: 100000,
    sp: 10000,
    legs: 20,
    tp: 60,
    bonusLevel: 25,
    title: TitleEnum.President,
  },
  {
    gv: 80000,
    sp: 10000,
    legs: 16,
    tp: 30,
    bonusLevel: 25,
    title: TitleEnum.VicePresident,
  },
  {
    gv: 60000,
    sp: 5000,
    legs: 12,
    tp: 15,
    bonusLevel: 25,
    title: TitleEnum.DiamondDirector,
  },
  {
    gv: 40000,
    sp: 5000,
    legs: 8,
    bonusLevel: 25,
    title: TitleEnum.EmeraldDirector,
  },
  {
    gv: 20000,
    sp: 2500,
    legs: 4,
    bonusLevel: 25,
    title: TitleEnum.PlatinumDirector,
  },
  {
    gv: 10000,
    sp: 2500,
    legs: 2,
    bonusLevel: 25,
    title: TitleEnum.GoldenDirector,
  },
  {
    gv: 5000,
    sp: 1500,
    legs: 1,
    bonusLevel: 25,
    title: TitleEnum.BronzeDirector,
  },
  { gv: 5000, sp: 1500, bonusLevel: 25, title: TitleEnum.Director },
  { gv: 5000, bonusLevel: 25, title: TitleEnum.VirtualManager },
  { gv: 3600, bonusLevel: 22, title: TitleEnum.BeautyInfluencer },
  { gv: 2200, bonusLevel: 18, title: TitleEnum.BeautyInfluencer },
  { gv: 1400, bonusLevel: 15, title: TitleEnum.BeautyInfluencer },
  { gv: 900, bonusLevel: 12, title: TitleEnum.BeautyInfluencer },
  { gv: 600, bonusLevel: 9, title: TitleEnum.BeautyInfluencer },
  { gv: 400, bonusLevel: 6, title: TitleEnum.BeautyInfluencer },
  { gv: 200, bonusLevel: 3, title: TitleEnum.BeautyInfluencer },
  { gv: 0, bonusLevel: 0, title: TitleEnum.BeautyInfluencer },
];
