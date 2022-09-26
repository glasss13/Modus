import { createRouter } from "./context";
import { z } from "zod";
import { SummativeGradeValue, Prisma } from "@prisma/client";

export const classRouter = createRouter()
  .query("getClasses", {
    async resolve({ ctx }) {
      return await ctx.prisma.class.findMany({
        include: {
          standards: {
            include: {
              summativeGrades: true,
            },
          },
        },
      });
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
