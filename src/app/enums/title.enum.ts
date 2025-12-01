export enum TitleEnum {
  BeautyInfluencer = "Beauty Influencer",
  VirtualManager = "Virtual Manager",
  Director = "Director",
  BronzeDirector = "Bronze Director",
  GoldenDirector = "Golden Director",
  PlatinumDirector = "Platinum Director",
  EmeraldDirector = "Emerald Director",
  DiamondDirector = "Diamond Director",
  VicePresident = "Vice President",
  President = "President",
  BossDirector = "Boss Director",
  ExecutiveBossDirector = "Executive Boss Director"
}

/**
 * Title Points earned from frontline FIs based on their titles.
 * Used to calculate Title Points requirement for higher titles.
 * Note: Points from a single frontline leg cannot exceed your own title's point value.
 */
export enum TitlePointEnum {
  VirtualManager = 0.25,
  Director = 1,
  BronzeDirector = 1.5,
  GoldenDirector = 2.5,
  PlatinumDirector = 4,
  EmeraldDirector = 8,
  DiamondDirector = 12,
  VicePresident = 20,
  President = 35,
  BossDirector = 60,
  ExecutiveBossDirector = 100
}
