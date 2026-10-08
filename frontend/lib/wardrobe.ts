/** Surface colours only; violet is reserved for accents and interaction. */
export type Swatch = "rose" | "peach" | "orchid";

export type Garment = {
  name: string;
  kind: "top" | "bottom";
  /** Palette colour for the photo placeholder until real photos are in. */
  swatch: Swatch;
};

export const buttonDown: Garment = {
  name: "Button-down",
  kind: "top",
  swatch: "orchid",
};

export const trousers: Garment = {
  name: "Dark trousers",
  kind: "bottom",
  swatch: "peach",
};

export const printedCami: Garment = {
  name: "Printed cami",
  kind: "top",
  swatch: "rose",
};

export const wideLegJeans: Garment = {
  name: "Wide-leg jeans",
  kind: "bottom",
  swatch: "peach",
};

export const wardrobe = [buttonDown, trousers, printedCami, wideLegJeans];
