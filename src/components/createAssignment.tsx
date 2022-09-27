import { AiOutlinePlus as PlusIcon } from "react-icons/ai";
import { SummativeGradeValue } from "@prisma/client";
import { useState } from "react";
import { Button, Divider, Input } from "react-daisyui";
import { inferQueryOutput, trpc } from "../utils/trpc";
import Modal from "./modal";

type Class = Exclude<inferQueryOutput<"class.byId">, null>;

const CreateAssignment: React.FC<{
  open: boolean;
  class_: Class;
  onClose?: () => void;
}> = props => {
  const context = trpc.useContext();

  const [assessedStandards, setAssessedStandards] = useState<
    {
      name?: string;
      standardId?: string;
      value?: SummativeGradeValue;
    }[]
  >([]);
  const [assignmentName, setAssignmentName] = useState("");
  const [createPressed, setCreatePressed] = useState(false);

  const { mutateAsync: createAssignment, isLoading } = trpc.useMutation(
    ["assignment.create"],
    {
      onSuccess() {
        context.invalidateQueries();
      },
    },
  );

  const onClose = () => {
    setCreatePressed(false);
    setAssignmentName("");
    setAssessedStandards([]);
    props.onClose?.();
  };

  const removeAssessed = (idx: number) => {
    setAssessedStandards(values => {
      const copy = [...values];
      copy.splice(idx, 1);
      return copy;
    });
  };

  const onClickCreate = async () => {
    setCreatePressed(true);
    if (assignmentName === "") return;
    const anyStandardNotFilledOut = assessedStandards.some(
      std => std.name == null || std.standardId == null || std.value == null,
    );
    if (anyStandardNotFilledOut) return;

    const grades = assessedStandards.map(standard => ({
      standardId: standard.standardId!,
      value: standard.value!,
    }));

    await createAssignment({
      name: assignmentName,
      classId: props.class_.id,
      grades,
    });

    onClose();
  };

  return (
    <Modal open={props.open} onClickBackdrop={onClose} onClickEscape={onClose}>
      <Modal.Header className="text-2xl font-bold mb-2 ml-1">
        <Button
          size="sm"
          shape="circle"
          className="absolute right-3 top-3"
          onClick={onClose}>
          ✕
        </Button>
        Add assignment
      </Modal.Header>
      <Divider />
      <Modal.Body>
        <Input
          color={`${
            createPressed && assignmentName === "" ? "error" : "ghost"
          }`}
          className="mb-6"
          placeholder="Assignment name"
          value={assignmentName}
          onChange={({ target }) => setAssignmentName(target.value)}
        />
        <h3 className="mt-4 mb-2 text-xl">Assessed:</h3>
        {assessedStandards.map((assessed, idx) => (
          <div
            key={assessed.standardId ?? idx}
            className="flex gap-2 first:mt-0 mt-4 items-center">
            <Button
              onClick={() => removeAssessed(idx)}
              shape="circle"
              color="error"
              size="xs"
              variant="outline">
              -
            </Button>
            <select
              className={`select select-bordered focus:outline-offset-0 w-1/2 ${
                createPressed && assessed.name == null ? "select-error" : ""
              }`}
              key={assessed.standardId ?? idx}
              onChange={({ target }) => {
                const selectedStandardName =
                  target.options[target.options.selectedIndex]?.value;
                if (selectedStandardName == null) return;
                const selectedStandardId = props.class_.standards.find(
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
              }}
              value={assessed.name ?? ""}>
              <option value={""} disabled>
                --
              </option>
              {props.class_.standards
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

            <select
              className={`select select-bordered focus:outline-offset-0 ${
                createPressed && assessed.value == null ? "select-error" : ""
              }`}
              onChange={({ target }) => {
                const selectedGrade = target.options[
                  target.options.selectedIndex
                ]?.value as SummativeGradeValue | undefined;

                setAssessedStandards(values => {
                  const copy = [...values];
                  const toModify = copy[idx];
                  if (toModify == null) return copy;
                  toModify.value = selectedGrade;
                  return copy;
                });
              }}
              value={assessed.value ?? ""}>
              <option value={""} disabled>
                --
              </option>
              {Object.values(SummativeGradeValue).map(g => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
        ))}
        <Button
          startIcon={<PlusIcon className="text-2xl" />}
          className="gap-2 pl-2 rounded-md mt-6"
          disabled={assessedStandards.length >= props.class_.standards.length}
          onClick={() => setAssessedStandards(values => [...values, {}])}>
          select standard
        </Button>

        <Modal.Actions>
          <Button color="primary" onClick={onClickCreate} loading={isLoading}>
            create assignment
          </Button>
        </Modal.Actions>
      </Modal.Body>
    </Modal>
  );
};

export default CreateAssignment;
