/** Surface colours only; violet is reserved for accents and interaction. */
export type Swatch = "rose" | "peach" | "orchid";

export type Garment = {
  name: string;
  kind: "top" | "bottom";
  /** Palette colour behind the photo while it loads. */
  swatch: Swatch;
  /** Demo photo (free to use under the Pexels licence), cropped to fill the print. */
  photo: { src: string; position?: string };
};

// Pexels serves resized copies straight from its CDN; 640px covers the largest print at 2x.
const pexels = (id: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=640`;

// pexels.com/photo/22441278
export const buttonDown: Garment = {
  name: "Button-down",
  kind: "top",
  swatch: "orchid",
  photo: { src: pexels(22441278), position: "50% 40%" },
};

// pexels.com/photo/39457561
export const trousers: Garment = {
  name: "Dark trousers",
  kind: "bottom",
  swatch: "peach",
  photo: { src: pexels(39457561), position: "50% 35%" },
};

// pexels.com/photo/19895953
export const floralBlouse: Garment = {
  name: "Floral blouse",
  kind: "top",
  swatch: "rose",
  photo: { src: pexels(19895953) },
};

// pexels.com/photo/1082528
export const darkJeans: Garment = {
  name: "Dark jeans",
  kind: "bottom",
  swatch: "peach",
  photo: { src: pexels(1082528), position: "82% 50%" },
};

export const wardrobe = [buttonDown, trousers, floralBlouse, darkJeans];
