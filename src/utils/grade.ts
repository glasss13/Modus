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

enum LetterGrade {
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

const gradeCutoffs = [
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

export class Class {
  name: string;
  standards: Standard[];

  constructor(name: string, standards: Standard[]) {
    this.name = name;
    this.standards = standards;
  }

  gradeAverage() {
    const averages = this.standards.map(standard =>
      standard.summativeAverage(),
    );

    return averages.reduce((a, b) => a + b) / averages.length;
  }

  letterGrade() {
    const average = this.gradeAverage();

    for (const { cutoff, grade } of gradeCutoffs) {
      if (average >= cutoff) return grade;
    }
    return;
  }
}
