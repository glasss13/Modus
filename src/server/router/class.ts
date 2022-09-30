import { createRouter } from "./context";
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

export const classRouter = createRouter()
  .query("getClasses", {
    async resolve({ ctx }) {
      return await ctx.prisma.class.findMany({
        include: fullClass,
      });
    },
  })
  .query("byId", {
    input: z.object({
      id: z.string(),
    }),
    async resolve({ input, ctx }) {
      return await ctx.prisma.class.findFirst({
        where: {
          id: {
            equals: input.id,
          },
        },
        include: fullClass,
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
          classId: { equals: input.id },
        },
      });

      const deleteGradesOperation = ctx.prisma.summativeGrade.deleteMany({
        where: { standardId: { in: standards.map(standard => standard.id) } },
      });

      const deleteAssignmentsOperation = ctx.prisma.assignment.deleteMany({
        where: { classId: { equals: input.id } },
      });

      const deleteStandardsOperation = ctx.prisma.standard.deleteMany({
        where: { classId: { equals: input.id } },
      });

      const deleteClassOperation = ctx.prisma.class.delete({
        where: { id: input.id },
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
      const classData = Prisma.validator<Prisma.ClassCreateInput>()({
        name: input.name,
        standards: {
          create: input.standards.map(standard => ({
            name: standard.name,
            summativeGrades: {
              createMany: {
                data: standard.grades.map(grade => ({ value: grade })),
              },
            },
          })),
        },
      });

      return await ctx.prisma.class.create({
        data: classData,
      });
    },
  });
