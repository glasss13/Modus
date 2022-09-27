import { createRouter } from "./context";
import superjson from "superjson";

import { exampleRouter } from "./example";
import { protectedExampleRouter } from "./protected-example-router";
import { classRouter } from "./class";
import { assignmentRouter } from "./assignment";

export const appRouter = createRouter()
  .transformer(superjson)
  .merge("class.", classRouter)
  .merge("assignment.", assignmentRouter)
  .merge("example.", exampleRouter)
  .merge("auth.", protectedExampleRouter);

// export type definition of API
export type AppRouter = typeof appRouter;
