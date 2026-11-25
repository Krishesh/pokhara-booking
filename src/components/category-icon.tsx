import {
  ArrowDownToLine,
  Cable,
  Footprints,
  Mountain,
  Plane,
  Sailboat,
  Tent,
  Waves,
  Wind,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  paragliding: Wind,
  boating: Sailboat,
  zipline: Cable,
  ultralight: Plane,
  hiking: Footprints,
  bungee: ArrowDownToLine,
  rafting: Waves,
  camping: Tent,
};

/** Icon for an activity category; a mountain for categories without their own. */
export function categoryIcon(category: string): LucideIcon {
  return ICONS[category.trim().toLowerCase()] ?? Mountain;
}

export function sentenceCase(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
