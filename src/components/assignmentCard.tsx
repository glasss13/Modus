import { SummativeGradeValue } from "@prisma/client";
import { useState } from "react";
import { Card, Tooltip } from "react-daisyui";
import { inferQueryOutput } from "../utils/trpc";
import EditAssignment from "./editAssignment";

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

type Assignment = Exclude<inferQueryOutput<"assignment.byId">, null>;

const AssignmentCard: React.FC<{
  assignment: Assignment;
}> = ({ assignment }) => {
  const [showEdit, setShowEdit] = useState(false);

  return (
    <>
      <Card
        onClick={() => setShowEdit(true)}
        className="mt-4 overflow-visible rounded-xl border-gray-600 bg-base-100 transition-transform first:mt-0 hover:scale-105 hover:transform hover:cursor-pointer hover:brightness-125">
        <Card.Body className=" pb-4">
          <Card.Title>{assignment.name}</Card.Title>
          <p className="text-gray-500">
            {`${assignment.grades.length} standard${
              assignment.grades.length !== 1 ? "s" : ""
            } assessed`}
          </p>
          <div className="mt-6 flex flex-wrap-reverse gap-1 ">
            {assignment.grades
              .sort((a, b) => gradeValue(a.value) - gradeValue(b.value))
              .map(grade => (
                <Tooltip
                  key={grade.id}
                  message={`${grade.value} - ${grade.standard.name}`}>
                  <div
                    className={`h-4 w-4 rounded-sm bg-${grade.value.toLowerCase()}`}
                  />
                </Tooltip>
              ))}
          </div>
        </Card.Body>
      </Card>
      <EditAssignment
        assignment={assignment}
        open={showEdit}
        onClose={() => setShowEdit(false)}
      />
    </>
  );
};

export default AssignmentCard;
