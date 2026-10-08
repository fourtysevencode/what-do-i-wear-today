import type { StaticImageData } from "next/image";

import buttonDownImage from "@/assets/wardrobe/button-down.png";
import printedCamiImage from "@/assets/wardrobe/printed-cami.png";
import trousersImage from "@/assets/wardrobe/trousers.png";
import wideLegJeansImage from "@/assets/wardrobe/wide-leg-jeans.png";

export type Garment = {
  name: string;
  kind: "top" | "bottom";
  image: StaticImageData;
  alt: string;
  /** Class name the segmentation model returned, where we have it on record. */
  detectedAs?: string;
};

// Cutouts produced by the segmentation pipeline (backend/services/segment.py).
export const buttonDown: Garment = {
  name: "Button-down",
  kind: "top",
  image: buttonDownImage,
  alt: "Light blue button-down shirt, cut out of a mirror photo",
  detectedAs: "long sleeve top",
};

export const trousers: Garment = {
  name: "Dark trousers",
  kind: "bottom",
  image: trousersImage,
  alt: "Dark navy trousers, cut out of a mirror photo",
  detectedAs: "trousers",
};

export const printedCami: Garment = {
  name: "Printed cami",
  kind: "top",
  image: printedCamiImage,
  alt: "Navy cami with a cream medallion print, cut out of a photo",
};

export const wideLegJeans: Garment = {
  name: "Wide-leg jeans",
  kind: "bottom",
  image: wideLegJeansImage,
  alt: "Mid-blue wide-leg jeans, cut out of a photo",
};

export const wardrobe = [buttonDown, trousers, printedCami, wideLegJeans];
