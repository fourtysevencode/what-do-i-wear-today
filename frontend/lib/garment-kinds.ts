// The segmentation model's DeepFashion2 classes, grouped the way people think about clothes.
const KIND_BY_LABEL: Record<string, string> = {
  "short sleeve top": "top",
  "long sleeve top": "top",
  vest: "top",
  sling: "top",
  "short sleeve outwear": "outerwear",
  "long sleeve outwear": "outerwear",
  shorts: "bottom",
  trousers: "bottom",
  skirt: "bottom",
  "short sleeve dress": "dress",
  "long sleeve dress": "dress",
  "vest dress": "dress",
  "sling dress": "dress",
};

// Top to toe, for showing an outfit the way it's worn.
const WEAR_ORDER: Record<string, number> = { outerwear: 0, top: 1, dress: 1, bottom: 2, piece: 3 };

/** The kinds an owner can set on a piece, in the order they're offered. */
export const KINDS = ["top", "bottom", "outerwear", "dress"] as const;
export type Kind = (typeof KINDS)[number];

export const isKind = (value: unknown): value is Kind => KINDS.includes(value as Kind);

type Kinded = { label: string; kind?: string | null };

/** The kind the segmentation label implies. */
export const detectedKind = (label: string) => KIND_BY_LABEL[label] ?? "piece";

/** The owner's choice if they set one, otherwise what the label implies. */
export const kindOf = (piece: Kinded) => piece.kind ?? detectedKind(piece.label);

export const displayName = (label: string) => label.charAt(0).toUpperCase() + label.slice(1);

/** What to call a piece: the owner's name for it if they gave one, otherwise its label. */
export const pieceName = (piece: { label: string; name: string | null }) => piece.name ?? displayName(piece.label);

export const MAX_NAME_LENGTH = 40;

export function byWearOrder<T extends Kinded>(items: T[]) {
  return [...items].sort((a, b) => WEAR_ORDER[kindOf(a)] - WEAR_ORDER[kindOf(b)]);
}
