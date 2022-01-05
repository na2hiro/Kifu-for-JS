enum KindEnum {
  FU,
  KY,
  KE,
  GI,
  KI,
  KA,
  HI,
  OU,
  TO,
  NY,
  NK,
  NG,
  UM,
  RY,
}

export type Kind = keyof typeof KindEnum;
