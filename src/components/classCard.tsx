import Link from "next/link";
import { Card } from "react-daisyui";
import {
  StandardWithGrades,
  calculateLetterGrade,
  calculateGradeAverage,
  getGradeValue,
  LetterGrade,
} from "../utils/grade";

interface Props {
  id: string;
  name: string;
  standards: StandardWithGrades[];
}

const ClassCard = (props: Props) => {
  const letterGrade = calculateLetterGrade(props.standards);
  const gradeProgress = calculateGradeAverage(props.standards);

  const letterGradeColor = (letterGrade: LetterGrade | null) => {
    if (letterGrade === null) return "progress-ghost";
    switch (letterGrade) {
      case LetterGrade.APlus:
      case LetterGrade.A:
      case LetterGrade.AMinus:
      case LetterGrade.BPlus:
        return "progress-success";
      case LetterGrade.B:
      case LetterGrade.BMinus:
      case LetterGrade.CPlus:
        return "progress-warning";
      case LetterGrade.C:
      case LetterGrade.CMinus:
        return "progress-accent";
      default:
        return "progress-error";
    }
  };

  return (
    <Link href={`/class/${props.id}`}>
      <Card className="bg-base-100 rounded-xl border-gray-600 first:mt-0 mt-4 hover:brightness-125 hover:cursor-pointer transition-transform hover:transform hover:scale-105">
        <Card.Body>
          <Card.Title>{props.name}</Card.Title>
          <p>{letterGrade ?? "--"}</p>
          <progress
            className={`progress ${letterGradeColor(letterGrade)} bg-neutral`}
            value={
              (gradeProgress ?? getGradeValue("BE")) -
              getGradeValue("BE") * 0.95
            }
            max={100 - getGradeValue("BE") * 0.95}
          />
        </Card.Body>
      </Card>
    </Link>
  );
};
export default ClassCard;
