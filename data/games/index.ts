import type { Game } from "./types";
import { dokkaebi } from "./dokkaebi";
import { tempal } from "./tempal";

export const GAMES: Game[] = [dokkaebi, tempal];

export const GAME_MAP: Record<string, Game> = Object.fromEntries(
  GAMES.map((g) => [g.slug, g]),
);

export function getGame(slug: string): Game | undefined {
  return GAME_MAP[slug];
}
