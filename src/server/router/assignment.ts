import { createRouter } from "./context";
import { z } from "zod";
import { SummativeGradeValue, Prisma } from "@prisma/client";

const fullAssignment = Prisma.validator<Prisma.AssignmentInclude>()({
  grades: {
    include: {
      standard: true,
    },
  },
});

export const assignmentRouter = createRouter()
  .query("all", {
    async resolve({ ctx }) {
      return await ctx.prisma.assignment.findMany({
        include: fullAssignment,
      });
    },
  })
  .query("byClass", {
    input: z.object({
      classId: z.string(),
    }),
    async resolve({ input, ctx }) {
      return await ctx.prisma.assignment.findMany({
        where: {
          classId: {
            equals: input.classId,
          },
        },
        include: fullAssignment,
      });
    },
  })
  .mutation("create", {
    input: z.object({
      name: z.string(),
      classId: z.string(),
      grades: z.array(
        z.object({
          standardId: z.string(),
          value: z.nativeEnum(SummativeGradeValue),
        }),
      ),
    }),
    async resolve({ input, ctx }) {
      const assignmentData = Prisma.validator<Prisma.AssignmentCreateInput>()({
        name: input.name,
        class: {
          connect: {
            id: input.classId,
          },
        },
        grades: {
          createMany: {
            data: input.grades,
          },
        },
      });

      return await ctx.prisma.assignment.create({
        data: assignmentData,
      });
    },
  });
