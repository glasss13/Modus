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

const getGradeValue = (grade: SummativeGradeValue) => {
  switch (grade) {
    case "EE":
      return 100;
    case "ME":
      return 89.4;
    case "AE":
      return 76.4;
    case "BE":
      return 46.6;
    case "NE":
      return 0.9;
  }
};

const summativeAverage = (grades: SummativeGradeValueOnly[]) => {
  const gradesValues = grades.map(grade => getGradeValue(grade.value));
  const mid = Math.floor(gradesValues.length / 2);

  const sorted = [...gradesValues].sort((a, b) => a - b);

  const a = sorted[mid];
  const b = sorted[mid - 1];
  if (!a || !b) {
    return null;
  }

  if (gradesValues.length % 2 !== 0) {
    return a;
  } else {
    return (a + b) / 2;
  }
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
    .map(standard => summativeAverage(standard.summativeGrades))
    .filter((avg): avg is number => avg !== null);

  if (averages.length === 0) return null;

  return averages.reduce((a, b) => a + b) / averages.length;
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
  { cutoff: 96.5, grade: LetterGrade.APlus },
  { cutoff: 92.5, grade: LetterGrade.A },
  { cutoff: 89.5, grade: LetterGrade.AMinus },
  { cutoff: 86.5, grade: LetterGrade.BPlus },
  { cutoff: 82.5, grade: LetterGrade.B },
  { cutoff: 79.5, grade: LetterGrade.BMinus },
  { cutoff: 76.5, grade: LetterGrade.CPlus },
  { cutoff: 72.5, grade: LetterGrade.C },
  { cutoff: 69.5, grade: LetterGrade.CMinus },
  { cutoff: 66.5, grade: LetterGrade.DPlus },
  { cutoff: 64.5, grade: LetterGrade.D },
  { cutoff: 0, grade: LetterGrade.F },
];
