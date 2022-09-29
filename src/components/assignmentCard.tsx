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
      <Card className="mt-4 rounded-xl border-gray-600 bg-base-100 transition-transform first:mt-0 hover:scale-105 hover:transform hover:cursor-pointer hover:brightness-125">
        <Card.Body className="pb-4">
          <Card.Title>{assignment.name}</Card.Title>
          <p className="text-gray-500">
            {`${assignment.grades.length} standard${
              assignment.grades.length !== 1 ? "s" : ""
            } assessed`}
          </p>
          <div className="mt-6 flex flex-wrap-reverse gap-1">
            {assignment.grades
              .sort((a, b) => gradeValue(a.value) - gradeValue(b.value))
              .map(grade => (
                <Tooltip key={grade.id} message={grade.value}>
                  <div
                    className={`h-4 w-4 rounded-sm bg-${grade.value.toLowerCase()}`}
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
