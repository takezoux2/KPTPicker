export type KPTKind = "Keep" | "Problem" | "Try" | "Other";

export type KPTData = {
  kind: KPTKind;
  text: string;
  createdAt: Date;
  postUser: string;
};
