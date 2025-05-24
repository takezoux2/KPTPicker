export type KPTKind = "K" | "P" | "T";

export type KPTData = {
  kind: KPTKind;
  text: string;
  createdAt: Date;
  postUser: string;
};
