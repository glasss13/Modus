import {
  Assignment,
  Standard,
  SummativeGrade,
  SummativeGradeValue,
} from "@prisma/client";
import Link from "next/link";
import { Card, Tooltip } from "react-daisyui";

const gradeValue = (grade: SummativeGradeValue) => {
  switch (grade) {
    case "EE":
      return 4;
    case "ME":
      return 3;
    case "AE":
      return 2;
    case "BE":
      return 1;
    case "NE":
      return 0;
  }
};

const AssignmentCard: React.FC<{
  assignment: Assignment & {
    grades: (SummativeGrade & {
      standard: Standard;
    })[];
  };
}> = ({ assignment }) => {
  return (
    <Link key={assignment.id} href={`/assignment/${assignment.id}`}>
      <Card className="bg-base-100 rounded-xl border-gray-600 first:mt-0 mt-4 hover:brightness-125 hover:cursor-pointer transition-transform hover:transform hover:scale-105">
        <Card.Body className="pb-4">
          <Card.Title>{assignment.name}</Card.Title>
          <p className="text-gray-500">
            {`${assignment.grades.length} standard${
              assignment.grades.length !== 1 ? "s" : ""
            } assessed`}
          </p>
          <div className="flex gap-1 flex-wrap-reverse mt-6">
            {assignment.grades
              .sort((a, b) => gradeValue(a.value) - gradeValue(b.value))
              .map(grade => (
                <Tooltip key={grade.id} message={grade.value}>
                  <div
                    className={`w-4 h-4 rounded-sm bg-${grade.value.toLowerCase()}`}
                  />
                </Tooltip>
              ))}
          </div>
        </Card.Body>
      </Card>
    </Link>
  );
};

export default AssignmentCard;
