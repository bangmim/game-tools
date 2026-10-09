import type { Game } from "./types";
import { dokkaebi } from "./dokkaebi";

export const GAMES: Game[] = [dokkaebi];

export const GAME_MAP: Record<string, Game> = Object.fromEntries(
  GAMES.map((g) => [g.slug, g]),
);

export function getGame(slug: string): Game | undefined {
  return GAME_MAP[slug];
}
