import { Prisma, SummativeGradeValue } from "@prisma/client";

const standardWithGrades = Prisma.validator<Prisma.StandardArgs>()({
  select: {
    summativeGrades: {
      select: {
        value: true,
      },
    },
  },
});

export type StandardWithGrades = Prisma.StandardGetPayload<
  typeof standardWithGrades
>;

const summativeGradeValueOnly = Prisma.validator<Prisma.SummativeGradeArgs>()({
  select: {
    value: true,
  },
});

export type SummativeGradeValueOnly = Prisma.SummativeGradeGetPayload<
  typeof summativeGradeValueOnly
>;

export const getGradeValue = (grade: SummativeGradeValue) => {
  switch (grade) {
    case "EE":
      return 100;
    case "ME":
      return 92.8;
    case "AE":
      return 76.4;
    case "BE":
      return 50;
    case "NE":
      return 0.9;
  }
};

export const summativeAverage = (grades: SummativeGradeValueOnly[]) => {
  if (grades.length === 0) return null;
  const gradesValues = grades.map(({ value }) => getGradeValue(value));
  const mean =
    gradesValues.reduce((prev, curr) => prev + curr, 0) / gradesValues.length;
  return mean;
};

export enum LetterGrade {
  APlus = "A+",
  A = "A",
  AMinus = "A-",
  BPlus = "B+",
  B = "B",
  BMinus = "B-",
  CPlus = "C+",
  C = "C",
  CMinus = "C-",
  DPlus = "D+",
  D = "D",
  DMinus = "D-",
  F = "F",
}

export const calculateGradeAverage = (standards: StandardWithGrades[]) => {
  const averages = standards
    .map(({ summativeGrades }) => summativeAverage(summativeGrades))
    .filter((avg): avg is number => avg !== null);

  if (averages.length === 0) return null;

  return averages.reduce((a, b) => a + b, 0) / averages.length;
};

export const calculateLetterGrade = (standards: StandardWithGrades[]) => {
  const average = calculateGradeAverage(standards);
  if (average === null) return null;

  for (const { cutoff, grade } of gradeCutoffs) {
    if (average >= cutoff) return grade;
  }
  return LetterGrade.F;
};

export const gradeCutoffs = [
  { cutoff: 95.5, grade: LetterGrade.APlus },
  { cutoff: 91.9, grade: LetterGrade.A },
  { cutoff: 88.3, grade: LetterGrade.AMinus },
  { cutoff: 82.2, grade: LetterGrade.BPlus },
  { cutoff: 78.6, grade: LetterGrade.B },
  { cutoff: 77.5, grade: LetterGrade.BMinus },
  { cutoff: 75.4, grade: LetterGrade.CPlus },
  { cutoff: 72.3, grade: LetterGrade.C },
  { cutoff: 69.2, grade: LetterGrade.CMinus },
  { cutoff: 67.1, grade: LetterGrade.DPlus },
  { cutoff: 65, grade: LetterGrade.D },
  { cutoff: 0, grade: LetterGrade.F },
];
