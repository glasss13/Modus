import { createProtectedRouter } from "./context";
import { z } from "zod";
import { SummativeGradeValue, Prisma } from "@prisma/client";

const fullClass = Prisma.validator<Prisma.ClassInclude>()({
  standards: {
    include: {
      summativeGrades: true,
    },
  },
  assignments: {
    include: {
      grades: {
        include: {
          standard: true,
        },
      },
      class: {
        include: {
          standards: true,
        },
      },
    },
  },
});

export const classRouter = createProtectedRouter()
  .query("getClasses", {
    async resolve({ ctx }) {
      return await ctx.prisma.class.findMany({
        where: {
          userId: ctx.session.user.id,
        },
        include: fullClass,
      });
    },
  })
  .query("byId", {
    input: z.object({
      id: z.string(),
    }),
    async resolve({ input, ctx }) {
      return await ctx.prisma.class.findUnique({
        where: {
          id_userId: {
            id: input.id,
            userId: ctx.session.user.id,
          },
        },
        include: fullClass,
      });
    },
  })
  .mutation("patchById", {
    input: z.object({
      id: z.string(),
      name: z.string().optional(),
      standards: z
        .array(
          z.object({
            name: z.string(),
            id: z.string().optional(),
          }),
        )
        .optional(),
    }),
    async resolve({ input, ctx }) {
      // const classExistsAndAuthorized =
      //   (await ctx.prisma.class.count({
      //     where: {
      //       id: input.id,
      //       userId: ctx.session.user.id,
      //     },
      //   })) > 0;

      // if (!classExistsAndAuthorized) {
      //   return null;
      // }

      const standardsToDeleteWhereClause = {
        classId: input.id,

        id: {
          notIn: input.standards
            ?.filter((std): std is Required<typeof std> => !!std.id)
            .map(std => std.id),
        },
        userId: ctx.session.user.id,
      };

      const deleteGradesOperation = ctx.prisma.summativeGrade.deleteMany({
        where: {
          standard: standardsToDeleteWhereClause,
        },
      });

      const deleteStandardsOperation = ctx.prisma.standard.deleteMany({
        where: standardsToDeleteWhereClause,
      });

      await ctx.prisma.$transaction([
        deleteGradesOperation,
        deleteStandardsOperation,
      ]);

      await ctx.prisma.class.update({
        where: {
          id_userId: {
            id: input.id,
            userId: ctx.session.user.id,
          },
        },
        data: {
          name: input.name,
          standards:
            input.standards == null
              ? undefined
              : {
                  connectOrCreate: input.standards.map(std => ({
                    where: {
                      id:
                        std.id ?? "IF_THE_ID_IS_UNDEFINED_CREATE_NEW_STANDARD",
                    },
                    create: {
                      name: std.name,
                      user: {
                        connect: {
                          id: ctx.session.user.id,
                        },
                      },
                      // userId: ctx.session.user.id,
                    },
                  })),
                },
        },
      });
    },
  })
  .mutation("deleteById", {
    input: z.object({
      id: z.string(),
    }),
    async resolve({ input, ctx }) {
      const standards = await ctx.prisma.standard.findMany({
        where: {
          classId: input.id,
          userId: ctx.session.user.id,
        },
      });

      const deleteGradesOperation = ctx.prisma.summativeGrade.deleteMany({
        where: {
          standardId: { in: standards.map(standard => standard.id) },
          userId: ctx.session.user.id,
        },
      });

      const deleteAssignmentsOperation = ctx.prisma.assignment.deleteMany({
        where: { classId: input.id, userId: ctx.session.user.id },
      });

      const deleteStandardsOperation = ctx.prisma.standard.deleteMany({
        where: { classId: input.id, userId: ctx.session.user.id },
      });

      const deleteClassOperation = ctx.prisma.class.delete({
        where: {
          id_userId: {
            id: input.id,
            userId: ctx.session.user.id,
          },
        },
        // where: { id: input.id, userId: ctx.session.user.id },
      });

      await ctx.prisma.$transaction([
        deleteGradesOperation,
        deleteAssignmentsOperation,
        deleteStandardsOperation,
        deleteClassOperation,
      ]);
    },
  })
  .mutation("makeClass", {
    input: z.object({
      name: z.string(),
      standards: z.array(
        z.object({
          name: z.string(),
          grades: z.array(z.nativeEnum(SummativeGradeValue)),
        }),
      ),
    }),
    async resolve({ input, ctx }) {
      const connectUser = {
        connect: {
          id: ctx.session.user.id,
        },
      };

      const classData = Prisma.validator<Prisma.ClassCreateInput>()({
        name: input.name,
        user: connectUser,
        standards: {
          create: input.standards.map(standard => ({
            name: standard.name,
            summativeGrades: {
              create: standard.grades.map(grade => ({
                value: grade,
                user: connectUser,
              })),
            },
            user: connectUser,
          })),
        },
      });

      return await ctx.prisma.class.create({
        data: classData,
      });
    },
  });
