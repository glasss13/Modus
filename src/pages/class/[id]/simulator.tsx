import Head from "next/head";
import { AiOutlineHome as HomeIcon } from "react-icons/ai";
import { GiNotebook as NotebookIcon } from "react-icons/gi";
import { BiAbacus as SimulateIcon } from "react-icons/bi";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { inferQueryOutput, trpc } from "../../../utils/trpc";
import { Breadcrumbs, Button, Divider, Link } from "react-daisyui";
import {
  calculateGradeAverage,
  calculateLetterGrade,
  LetterGrade,
} from "../../../utils/grade";
import { AiOutlinePlus as PlusIcon } from "react-icons/ai";
import { useMemo, useState } from "react";
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

const calculateGradePossibilitiesHelper = (
  gradesToAdd: GradesToAdd,
  idx: number,
  minimumLetterGrade: LetterGrade,
  class_: Class,
  outList: { grades: GradesToAdd; score: number; letterGrade: LetterGrade }[],
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

      calculateGradePossibilitiesHelper(
        gradesToAdd,
        idx - 1,
        minimumLetterGrade,
        class_,
        outList,
      );
      return;
    }

    outList.push(
      JSON.parse(
        JSON.stringify({
          grades: gradesToAdd,
          letterGrade,
          score: calculateGradeAverage(classStandards),
        }),
      ),
    );

    calculateGradePossibilitiesHelper(
      gradesToAdd,
      gradesToAdd.length - 1,
      minimumLetterGrade,
      class_,
      outList,
    );
    return;
  }

  if (idx === 0) return;

  gradesToAdd[idx]!.value = 4;

  calculateGradePossibilitiesHelper(
    gradesToAdd,
    idx - 1,
    minimumLetterGrade,
    class_,
    outList,
  );
  return;
};

const calculateGradePossibilities = (
  assessedStandards: { name: string; standardId: string }[],
  minimumLetterGrade: LetterGrade,
  class_: Class,
  outList: { grades: GradesToAdd; score: number; letterGrade: LetterGrade }[],
) => {
  const gradesToAdd: GradesToAdd = assessedStandards.map(std => ({
    standardId: std.standardId,
    value: 4,
  }));

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
    letterGradeNum(letterGrade) >= letterGradeNum(minimumLetterGrade)
  ) {
    outList.push(
      JSON.parse(
        JSON.stringify({
          grades: gradesToAdd,
          letterGrade,
          score: calculateGradeAverage(classStandards),
        }),
      ),
    );
  }

  calculateGradePossibilitiesHelper(
    gradesToAdd,
    gradesToAdd.length - 1,
    minimumLetterGrade,
    class_,
    outList,
  );
};

const SimulatorPageContent: React.FC<{ id: string }> = ({ id }) => {
  const { data: class_ } = trpc.useQuery(["class.byId", { id }]);

  const [desiredGrade, setDesiredGrade] = useState<LetterGrade>();

  const [assessedStandards, setAssessedStandards] = useState<
    { name?: string; standardId?: string }[]
  >([]);

  const possibleGrades = useMemo(() => {
    if (class_ == null || assessedStandards.length == 0) return null;

    const allStandardsDefined = !assessedStandards.some(
      std => std.name == null || std.standardId == null,
    );

    if (!allStandardsDefined) return null;

    const outList: {
      grades: GradesToAdd;
      score: number;
      letterGrade: LetterGrade;
    }[] = [];

    calculateGradePossibilities(
      assessedStandards as Required<typeof assessedStandards[0]>[],
      desiredGrade ?? LetterGrade.APlus,
      class_,
      outList,
    );

    const reversedOutList = outList.sort((a, b) => a.score - b.score);
    return reversedOutList;
  }, [assessedStandards, class_, desiredGrade]);

  if (class_ === null) {
    return (
      <>
        <Head>
          <title>Invalid class</title>
          <meta name="description" content="Modus Grade Calculator" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <main>
          <h1 className="mt-2 text-center text-5xl">Class not found</h1>
        </main>
      </>
    );
  }

  if (!class_) {
    return (
      <>
        <Head>
          <title>{id}</title>
          <meta name="description" content="Modus Grade Calculator" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <main>
          <h1 className="mt-2 text-center text-5xl">Loading...</h1>
        </main>
      </>
    );
  }

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

  return (
    <main className="container mx-auto">
      <div className="flex flex-col items-center">
        <h1 className="mt-2 text-center text-3xl">{class_.name}</h1>
        <Breadcrumbs>
          <Breadcrumbs.Item className="link link-hover">
            <Link href="/">
              <HomeIcon className="mr-1 h-4 w-4" />
              Classes
            </Link>
          </Breadcrumbs.Item>
          <Breadcrumbs.Item className="link link-hover">
            <Link href={`/class/${id}`}>
              <NotebookIcon className="mr-1 h-4 w-4" />
              {class_.name}
            </Link>
          </Breadcrumbs.Item>
          <Breadcrumbs.Item>
            <SimulateIcon className="mr-1 h-4 w-4" />
            Simulator
          </Breadcrumbs.Item>
        </Breadcrumbs>
      </div>
      <Divider />
      <div className="flex flex-col items-center">
        <p>Desired Grade</p>
        <select
          className="select select-sm h-12 w-16 bg-base-100 pr-6 pl-2 text-center text-lg outline-none"
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

      <div className="flex">
        <div className="mx-auto flex flex-col">
          {/* <div className="max-h-screen overflow-auto"> */}
          <table className="table w-full">
            <tr>
              <td>
                <table className="table w-full">
                  <tr>
                    <th>
                      <Button
                        size="sm"
                        startIcon={<PlusIcon className="text-2xl" />}
                        disabled={
                          assessedStandards.length >= class_.standards.length
                        }
                        onClick={() =>
                          setAssessedStandards(values => [...values, {}])
                        }
                      />
                    </th>
                    {assessedStandards.map((std, idx) => (
                      <th key={idx}>
                        <div className="flex flex-col items-center gap-2">
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
                                  assessedStandards[idx]?.standardId ===
                                    std.id ||
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
                      </th>
                    ))}
                    <th>Score</th>
                    <th>Grade</th>
                  </tr>
                </table>
              </td>
            </tr>

            <td>
              <div className="max-h-screen overflow-auto">
                <table className="table w-full">
                  {possibleGrades ? (
                    possibleGrades.map((possibleGrade, idx) => (
                      <tr key={idx}>
                        <th />
                        {possibleGrade.grades.map(grade => (
                          <th key={grade.standardId}>
                            {valueFromNumber(grade.value)}
                          </th>
                        ))}
                        <th>{possibleGrade.score.toFixed(2)}</th>
                        <th>{possibleGrade.letterGrade}</th>
                      </tr>
                    ))
                  ) : (
                    <tr></tr>
                  )}
                </table>
              </div>
            </td>
          </table>
        </div>
      </div>
    </main>
  );
};

const SimulatorPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;

  if (typeof id !== "string") {
    return <h1>Not good</h1>;
  }

  return <SimulatorPageContent id={id} />;
};

export default SimulatorPage;
