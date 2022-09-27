import { SummativeGradeValue } from "@prisma/client";
import { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { AiOutlinePlus as PlusIcon } from "react-icons/ai";
import { useState } from "react";
import { Button, Divider, Input, Select } from "react-daisyui";
import Modal from "../../components/modal";
import { trpc } from "../../utils/trpc";

const ClassPageContent: React.FC<{ id: string }> = ({ id }) => {
  const context = trpc.useContext();

  const { data: class_ } = trpc.useQuery(["class.byId", { id }]);
  const { mutateAsync: createAssignment, isLoading } = trpc.useMutation(
    ["assignment.create"],
    {
      onSuccess() {
        context.invalidateQueries();
      },
    },
  );

  const [assessedStandards, setAssessedStandards] = useState<
    {
      name: string;
      standardId: string;
      value: SummativeGradeValue;
    }[]
  >([]);
  const [showAssignmentDialog, setShowAssignmentDialog] = useState(false);
  const [assignmentName, setAssignmentName] = useState("");
  const [assignmentStandards, setAssignmentStandards] = useState<
    {
      standardId: string;
      value: SummativeGradeValue;
    }[]
  >([]);

  if (class_ === null) {
    return (
      <>
        <Head>
          <title>Invalid class</title>
          <meta name="description" content="Modus Grade Calculator" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <main>
          <h1 className="text-5xl text-center mt-2">Class not found</h1>
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
          <h1 className="text-5xl text-center mt-2">Loading...</h1>
        </main>
      </>
    );
  }

  const onClickCreate = async () => {
    const grades = assignmentStandards.filter(standard => standard.value);

    await createAssignment({
      name: assignmentName,
      classId: class_.id,
      grades,
    });

    closeDialog();
  };

  const closeDialog = () => {
    setShowAssignmentDialog(false);
    setAssignmentName("");
    setAssignmentStandards([]);
  };

  return (
    <>
      <Head>
        <title>{id}</title>
        <meta name="description" content="Modus Grade Calculator" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <h1 className="text-3xl text-center mt-2">{class_.name}</h1>
        <p>Assignments:</p>
        <div className="flex flex-col">
          {class_.assignments.map(assignment => (
            <Link key={assignment.id} href={`/assignment/${assignment.id}`}>
              {assignment.name}
            </Link>
          ))}
        </div>
        <Button onClick={() => setShowAssignmentDialog(true)}>
          add assignment
        </Button>
        <Modal open={showAssignmentDialog}>
          <Modal.Header className="text-2xl font-bold mb-2 ml-1">
            <Button
              size="sm"
              shape="circle"
              className="absolute right-3 top-3"
              onClick={closeDialog}>
              ✕
            </Button>
            Add assignment
          </Modal.Header>
          <Divider />
          <Modal.Body>
            <Input
              className="mb-6"
              placeholder="Assignment name"
              value={assignmentName}
              onChange={({ target }) => setAssignmentName(target.value)}
            />
            <h3 className="mt-4 mb-2 text-xl">Assessed:</h3>
            {assessedStandards.map((standard, idx) => (
              <div
                key={standard.standardId}
                className="flex gap-2 first:mt-0 mt-4">
                <Button
                  onClick={() => {
                    setAssessedStandards(values => {
                      const copy = [...values];
                      copy.splice(idx, 1);
                      return copy;
                    });
                  }}
                  shape="circle"
                  color="error"
                  size="xs"
                  variant="outline">
                  -
                </Button>
                <p className="w-8">{standard.name}</p>
              </div>
            ))}
            <Button
              startIcon={<PlusIcon className="text-2xl" />}
              className="gap-2 pl-2 rounded-md mt-6"
              onClick={() =>
                setAssessedStandards(values => [
                  ...values,
                  { name: "test", standardId: "4", value: "AE" },
                ])
              }>
              assess standard
            </Button>
            {/* <div className="flex gap-4">
              <div className="flex flex-col justify-around gap-y-4">
                {class_.standards.map(standard => (
                  <p key={standard.id}>{standard.name}</p>
                ))}
              </div>

              <div className="flex flex-col gap-y-4">
                {class_.standards.map(standard => (
                  <Select
                    key={standard.id}
                    defaultValue={""}
                    onChange={(e: SummativeGradeValue) => {
                      setAssignmentStandards(oldStandards => {
                        const copy = [...oldStandards];
                        const foundIdx = copy.findIndex(
                          oldStandard => oldStandard.standardId === standard.id,
                        );

                        if (foundIdx === -1) {
                          copy.push({ standardId: standard.id, value: e });
                        } else {
                          copy[foundIdx] = {
                            standardId: standard.id,
                            value: e,
                          };
                        }

                        return copy;
                      });
                    }}>
                    <Select.Option key={0} value={""} disabled>
                      --
                    </Select.Option>

                    <Select.Option key={1} value={SummativeGradeValue.EE}>
                      EE
                    </Select.Option>
                    <Select.Option key={2} value={SummativeGradeValue.ME}>
                      ME
                    </Select.Option>
                    <Select.Option key={3} value={SummativeGradeValue.AE}>
                      AE
                    </Select.Option>
                    <Select.Option key={4} value={SummativeGradeValue.BE}>
                      BE
                    </Select.Option>
                    <Select.Option key={5} value={SummativeGradeValue.NE}>
                      NE
                    </Select.Option>
                  </Select>
                ))}
              </div>
            </div> */}

            <Modal.Actions>
              <Button
                color="primary"
                onClick={onClickCreate}
                loading={isLoading}>
                create assignment
              </Button>
            </Modal.Actions>
          </Modal.Body>
        </Modal>
      </main>
    </>
  );
};

const ClassPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;

  if (typeof id !== "string") {
    return <h1>Not good</h1>;
  }

  return <ClassPageContent id={id} />;
};

export default ClassPage;
