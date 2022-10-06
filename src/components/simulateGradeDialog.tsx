import { useMemo, useState } from "react";
import { AiOutlinePlus as PlusIcon } from "react-icons/ai";
import { Button, Divider, Table } from "react-daisyui";
import { calculateLetterGrade, LetterGrade } from "../utils/grade";
import { inferQueryOutput } from "../utils/trpc";
import Modal from "./modal";
import { Standard, SummativeGrade, SummativeGradeValue } from "@prisma/client";

type Class = Exclude<inferQueryOutput<"class.byId">, null>;

type GradesToAdd = {
  standardId: string;
  value: 4 | 3 | 2 | 1 | 0;
}[];

const valueFromNumber = (num: 4 | 3 | 2 | 1 | 0) => {
  switch (num) {
    case 4:
      return SummativeGradeValue.EE;
    case 3:
      return SummativeGradeValue.ME;
    case 2:
      return SummativeGradeValue.AE;
    case 1:
      return SummativeGradeValue.BE;
    case 0:
      return SummativeGradeValue.NE;
  }
};

const letterGradeNum = (letterGrade: LetterGrade) => {
  switch (letterGrade) {
    case LetterGrade.F:
      return 0;
    case LetterGrade.DMinus:
      return 1;
    case LetterGrade.D:
      return 2;
    case LetterGrade.DPlus:
      return 3;
    case LetterGrade.CMinus:
      return 4;
    case LetterGrade.C:
      return 5;
    case LetterGrade.CPlus:
      return 6;
    case LetterGrade.BMinus:
      return 7;
    case LetterGrade.B:
      return 8;
    case LetterGrade.BPlus:
      return 9;
    case LetterGrade.AMinus:
      return 10;
    case LetterGrade.A:
      return 11;
    case LetterGrade.APlus:
      return 12;
  }
};

const crazyFunction = (
  gradesToAdd: GradesToAdd,
  idx: number,
  outList: GradesToAdd[],
  minimumLetterGrade: LetterGrade,
  class_: Class,
) => {
  if (gradesToAdd[idx]!.value > 0) {
    gradesToAdd[idx]!.value--;

    const classStandards = JSON.parse(
      JSON.stringify(class_.standards),
    ) as (Standard & {
      summativeGrades: SummativeGrade[];
    })[];

    for (const grade of gradesToAdd) {
      const foundIdx = classStandards.findIndex(
        std => std.id === grade.standardId,
      );
      if (foundIdx !== -1) {
        classStandards[foundIdx]!.summativeGrades.push({
          id: "",
          standardId: classStandards[foundIdx]!.id,
          userId: "",
          value: valueFromNumber(grade.value),
          assignmentId: null,
        });
      }
    }

    const letterGrade = calculateLetterGrade(classStandards);

    if (
      letterGrade == null ||
      letterGradeNum(letterGrade) < letterGradeNum(minimumLetterGrade)
    ) {
      if (idx === 0) return;

      gradesToAdd[idx]!.value = 4;

      crazyFunction(gradesToAdd, idx - 1, outList, minimumLetterGrade, class_);
      return;
    }

    outList.push(JSON.parse(JSON.stringify(gradesToAdd)));

    crazyFunction(
      gradesToAdd,
      gradesToAdd.length - 1,
      outList,
      minimumLetterGrade,
      class_,
    );
    return;
  }

  if (idx === 0) return;

  gradesToAdd[idx]!.value = 4;

  crazyFunction(gradesToAdd, idx - 1, outList, minimumLetterGrade, class_);
  return;
};

const SimulateGradeDialog: React.FC<{
  open: boolean;
  class_: Class;
  onClose?: () => void;
}> = ({ open, class_, onClose }) => {
  const [assessedStandards, setAssessedStandards] = useState<
    { name?: string; standardId?: string }[]
  >([]);

  const letterGrade = useMemo(
    () => calculateLetterGrade(class_.standards),
    [class_.standards],
  );

  const [desiredGrade, setDesiredGrade] = useState<LetterGrade | null>(
    letterGrade,
  );

  const removeAssessed = (idx: number) => {
    setAssessedStandards(values => {
      const copy = [...values];
      copy.splice(idx, 1);
      return copy;
    });
  };

  const onChangeSelected = (
    e: React.ChangeEvent<HTMLSelectElement>,
    idx: number,
  ) => {
    const selectedStandardName = e.target.value;
    const selectedStandardId = class_.standards.find(
      std => std.name === selectedStandardName,
    )?.id;
    if (selectedStandardId == null) return;

    setAssessedStandards(values => {
      const copy = [...values];
      const toModify = copy[idx];
      if (toModify == null) return copy;
      toModify.name = selectedStandardName;
      toModify.standardId = selectedStandardId;
      return copy;
    });
  };

  const possibleGrades = useMemo(() => {
    const allStandardsDefined = !assessedStandards.some(
      std => std.name == null || std.standardId == null,
    );

    if (!allStandardsDefined) return null;

    const gradesToAdd = assessedStandards.map(std => ({
      standardId: std.standardId!,
      value: 4 as 4 | 3 | 2 | 1 | 0,
    }));

    if (gradesToAdd.length === 0) return null;

    const oList: GradesToAdd[] = [];

    //

    const classStandards = JSON.parse(
      JSON.stringify(class_.standards),
    ) as (Standard & {
      summativeGrades: SummativeGrade[];
    })[];

    for (const grade of gradesToAdd) {
      const foundIdx = classStandards.findIndex(
        std => std.id === grade.standardId,
      );
      if (foundIdx !== -1) {
        classStandards[foundIdx]!.summativeGrades.push({
          id: "",
          standardId: classStandards[foundIdx]!.id,
          userId: "",
          value: valueFromNumber(grade.value),
          assignmentId: null,
        });
      }
    }

    const letterGrade = calculateLetterGrade(classStandards);

    if (
      letterGrade != null &&
      letterGradeNum(letterGrade) >=
        letterGradeNum(desiredGrade ?? LetterGrade.APlus)
    ) {
      oList.push(JSON.parse(JSON.stringify(gradesToAdd)));
    }

    //

    crazyFunction(
      gradesToAdd,
      gradesToAdd.length - 1,
      oList,
      desiredGrade ?? LetterGrade.APlus,
      class_,
    );

    console.log(oList);

    return oList;
  }, [assessedStandards, class_, desiredGrade]);

  return (
    <Modal
      open={open}
      onClickBackdrop={onClose}
      onClickEscape={onClose}
      className="w-3/4 max-w-5xl">
      <Modal.Header className="mb-2 ml-1 text-2xl font-bold">
        <Button
          size="sm"
          shape="circle"
          className="absolute right-3 top-3"
          onClick={onClose}>
          ✕
        </Button>
        Grade Simulator
      </Modal.Header>
      <Divider />
      <Modal.Body>
        <div className="flex items-center justify-center gap-1">
          <p className="text-lg">I want</p>
          <select
            className="select select-sm bg-base-200 pr-6 pl-2 text-center text-lg outline-none"
            onChange={({ target }) =>
              setDesiredGrade(target.value as LetterGrade)
            }
            value={desiredGrade ?? "A+"}>
            {Object.values(LetterGrade).map(grade => (
              <option value={grade.toString()} key={grade.toString()}>
                {grade.toString()}
              </option>
            ))}
          </select>
        </div>
        <br />
        <div className="flex">
          <div className="flex flex-col">
            <h2 className="font-bold">Assessed Standards</h2>
            {assessedStandards.map((std, idx) => (
              <div
                key={std.standardId ?? idx}
                className="mt-4 flex items-center gap-2 first:mt-0">
                <Button
                  onClick={() => removeAssessed(idx)}
                  shape="circle"
                  color="error"
                  size="xs"
                  variant="outline">
                  -
                </Button>
                <select
                  className="select select-bordered"
                  value={std.name ?? ""}
                  onChange={e => onChangeSelected(e, idx)}>
                  <option value="" disabled>
                    --
                  </option>
                  {class_.standards
                    .filter(
                      std =>
                        assessedStandards[idx]?.standardId === std.id ||
                        assessedStandards.findIndex(
                          it => it.standardId === std.id,
                        ) === -1,
                    )
                    .map(std => (
                      <option key={std.id} value={std.name}>
                        {std.name}
                      </option>
                    ))}
                </select>
              </div>
            ))}

            <Button
              startIcon={<PlusIcon className="text-2xl" />}
              className="mt-6 gap-2 rounded-md pl-2"
              disabled={assessedStandards.length >= class_.standards.length}
              onClick={() => setAssessedStandards(values => [...values, {}])}>
              select standard
            </Button>
          </div>
          <div className="flex flex-col">
            <div className="overflow-x-auto">
              <Table>
                <Table.Head>
                  {assessedStandards.map(std => (
                    <span key={std.standardId ?? Math.random()}>
                      {std.name ?? "test"}
                    </span>
                  ))}
                </Table.Head>
                <Table.Body>
                  {possibleGrades ? (
                    possibleGrades.map((possibleGrade, idx) => (
                      <Table.Row key={idx}>
                        {possibleGrade.map(grade => (
                          <span key={grade.standardId}>
                            {valueFromNumber(grade.value)}
                          </span>
                        ))}
                      </Table.Row>
                    ))
                  ) : (
                    <Table.Row>
                      <span>Not good</span>
                      <span>Not good</span>
                    </Table.Row>
                  )}
                </Table.Body>
              </Table>
            </div>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default SimulateGradeDialog;
