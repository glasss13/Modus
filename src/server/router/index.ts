import { createRouter } from "./context";
import superjson from "superjson";

import { classRouter } from "./class";
import { assignmentRouter } from "./assignment";

export const appRouter = createRouter()
  .transformer(superjson)
  .merge("class.", classRouter)
  .merge("assignment.", assignmentRouter);

// export type definition of API
export type AppRouter = typeof appRouter;
