import type { backendInterface } from "./backend";
import { createActorWithConfig } from "./config";

let actorPromise: Promise<backendInterface> | null = null;

export function getActor(): Promise<backendInterface> {
  if (!actorPromise) {
    actorPromise = createActorWithConfig().catch((err) => {
      // Reset so it retries next time
      actorPromise = null;
      throw err;
    });
  }
  return actorPromise;
}
