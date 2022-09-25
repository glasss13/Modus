import { Card } from "react-daisyui";
import { StandardWithGrades, calculateLetterGrade } from "../utils/grade";

interface Props {
  name: string;
  standards: StandardWithGrades[];
}

const ClassCard = (props: Props) => {
  const letterGrade = calculateLetterGrade(props.standards);

  return (
    <Card className="bg-base-200 rounded-xl border-gray-600 first:mt-0 mt-4">
      <Card.Body>
        <Card.Title>{props.name}</Card.Title>
        <p>{letterGrade ?? "--"}</p>
      </Card.Body>
    </Card>
  );
};
export default ClassCard;
