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
  .query("byId", {
    input: z.object({
      id: z.string(),
    }),
    async resolve({ input, ctx }) {
      return await ctx.prisma.assignment.findUnique({
        where: {
          id: input.id,
        },
        include: {
          class: {
            include: {
              standards: true,
            },
          },
          grades: {
            include: {
              standard: true,
            },
          },
        },
      });
    },
  })
  .mutation("patchById", {
    input: z.object({
      id: z.string(),
      name: z.string().optional(),
      grades: z
        .array(
          z.object({
            standardId: z.string(),
            value: z.nativeEnum(SummativeGradeValue),
          }),
        )
        .optional(),
    }),
    async resolve({ input, ctx }) {
      if (input.grades) {
        await ctx.prisma.summativeGrade.deleteMany({
          where: {
            assignmentId: {
              equals: input.id,
            },
          },
        });
      }

      let updateArgs;

      if (input.grades) {
        updateArgs =
          Prisma.validator<Prisma.AssignmentUpdateWithWhereUniqueWithoutClassInput>()(
            {
              where: {
                id: input.id,
              },
              data: {
                name: input.name,
                grades: {
                  createMany: {
                    data: input.grades,
                  },
                },
              },
            },
          );
      } else {
        updateArgs =
          Prisma.validator<Prisma.AssignmentUpdateWithWhereUniqueWithoutClassInput>()(
            {
              where: {
                id: input.id,
              },
              data: {
                name: input.name,
              },
            },
          );
      }

      return await ctx.prisma.assignment.update(updateArgs);
    },
  })
  .mutation("deleteById", {
    input: z.object({
      id: z.string(),
    }),
    async resolve({ input, ctx }) {
      const deleteGradeOperation = ctx.prisma.summativeGrade.deleteMany({
        where: {
          assignmentId: {
            equals: input.id,
          },
        },
      });

      const deleteAssignmentOperation = ctx.prisma.assignment.delete({
        where: {
          id: input.id,
        },
      });

      await ctx.prisma.$transaction([
        deleteGradeOperation,
        deleteAssignmentOperation,
      ]);
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
