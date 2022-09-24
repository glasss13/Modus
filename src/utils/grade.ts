export enum Grade {
  EE = 100,
  ME = 89.4,
  AE = 76.4,
  BE = 46.6,
  NE = 0.9,
}

export class Standard {
  grades: Grade[] = [];
  name: string;

  constructor(name: string, grades?: Grade[]) {
    this.name = name;
    if (grades) this.grades = grades;
  }

  summativeAverage() {
    const mid = Math.floor(this.grades.length / 2);

    const sorted = [...this.grades].sort((a, b) => a - b);

    return this.grades.length % 2 !== 0
      ? sorted[mid]!
      : (sorted[mid - 1]! + sorted[mid]!) / 2;
  }
}

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

export const calculateGradeAverage = (standards: Standard[]) => {
  if (standards.length < 1) return null;
  const averages = standards.map(standard => standard.summativeAverage());

  return averages.reduce((a, b) => a + b) / averages.length;
};

export const calculateLetterGrade = (standards: Standard[]) => {
  const average = calculateGradeAverage(standards);
  if (average === null) return LetterGrade.F;

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
