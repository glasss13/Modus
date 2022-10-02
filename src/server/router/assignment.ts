import { createProtectedRouter } from "./context";
import { z } from "zod";
import { SummativeGradeValue, Prisma } from "@prisma/client";

const fullAssignment = Prisma.validator<Prisma.AssignmentInclude>()({
  grades: {
    include: {
      standard: true,
    },
  },
});

export const assignmentRouter = createProtectedRouter()
  .query("all", {
    async resolve({ ctx }) {
      return await ctx.prisma.assignment.findMany({
        where: {
          userId: ctx.session.user.id,
        },
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
          id_userId: {
            id: input.id,
            userId: ctx.session.user.id,
          },
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
            assignmentId: input.id,
            userId: ctx.session.user.id,
          },
        });
      }

      let updateArgs;

      if (input.grades) {
        updateArgs =
          Prisma.validator<Prisma.AssignmentUpdateWithWhereUniqueWithoutClassInput>()(
            {
              where: {
                id_userId: {
                  id: input.id,
                  userId: ctx.session.user.id,
                },
              },
              data: {
                name: input.name,
                grades: {
                  create: input.grades.map(x => ({
                    standard: {
                      connect: {
                        id: x.standardId,
                      },
                    },
                    user: {
                      connect: {
                        id: ctx.session.user.id,
                      },
                    },
                    value: x.value,
                  })),
                },
              },
            },
          );
      } else {
        updateArgs =
          Prisma.validator<Prisma.AssignmentUpdateWithWhereUniqueWithoutClassInput>()(
            {
              where: {
                id_userId: {
                  id: input.id,
                  userId: ctx.session.user.id,
                },
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
          assignmentId: input.id,
          userId: ctx.session.user.id,
        },
      });

      const deleteAssignmentOperation = ctx.prisma.assignment.delete({
        where: {
          id_userId: {
            id: input.id,
            userId: ctx.session.user.id,
          },
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
          classId: input.classId,
          userId: ctx.session.user.id,
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
        user: {
          connect: {
            id: ctx.session.user.id,
          },
        },
        class: {
          connect: {
            id: input.classId,
          },
        },
        grades: {
          create: input.grades.map(g => ({
            value: g.value,
            standard: {
              connect: {
                id: g.standardId,
              },
            },
            user: {
              connect: {
                id: ctx.session.user.id,
              },
            },
          })),
        },
      });

      return await ctx.prisma.assignment.create({
        data: assignmentData,
      });
    },
  });
