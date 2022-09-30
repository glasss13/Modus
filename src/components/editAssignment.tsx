import { SummativeGradeValue } from "@prisma/client";
import { AiOutlinePlus as PlusIcon } from "react-icons/ai";
import { useState } from "react";
import { Button, Divider, Input } from "react-daisyui";
import { inferQueryOutput, trpc } from "../utils/trpc";
import Modal from "./modal";

type Assignment = Exclude<inferQueryOutput<"assignment.byId">, null>;

const EditAssignment: React.FC<{
  assignment: Assignment;
  open: boolean;
  onClose?: () => void;
}> = ({ assignment, open, ...props }) => {
  const [editPressed, setEditPressed] = useState(false);
  const [assignmentName, setAssignmentName] = useState(assignment.name);

  const context = trpc.useContext();

  const [assessedStandards, setAssessedStandards] = useState<
    {
      name?: string;
      standardId?: string;
      value?: SummativeGradeValue;
    }[]
  >(() =>
    assignment.grades.map(grade => ({
      name: grade.standard.name,
      standardId: grade.standardId,
      value: grade.value,
    })),
  );

  const { mutateAsync: patchAssignment, isLoading } = trpc.useMutation(
    ["assignment.patchById"],
    {
      onSuccess() {
        context.invalidateQueries();
      },
    },
  );

  const { mutateAsync: deleteAssignment, isLoading: deleteLoading } =
    trpc.useMutation(["assignment.deleteById"], {
      onSuccess() {
        context.invalidateQueries();
      },
    });

  const onClose = () => {
    setEditPressed(false);
    props.onClose?.();
  };

  const onClickDelete = async () => {
    await deleteAssignment({ id: assignment.id });
    onClose();
  };

  const removeAssessed = (idx: number) => {
    setAssessedStandards(standards => {
      const copy = [...standards];
      copy.splice(idx, 1);
      return copy;
    });
  };

  const onClickEdit = async () => {
    setEditPressed(true);

    if (assignmentName === "") return;

    const grades = [];
    for (const standard of assessedStandards) {
      if (
        standard.standardId == null ||
        standard.value == null ||
        standard.name == null
      )
        return;

      grades.push({ value: standard.value, standardId: standard.standardId });
    }

    await patchAssignment({
      id: assignment.id,
      name: assignmentName,
      grades,
    });

    onClose();
  };

  return (
    <Modal open={open} onClickBackdrop={onClose} onClickEscape={onClose}>
      <Modal.Header className="mb-2 ml-1 text-2xl font-bold">
        <Button
          size="sm"
          shape="circle"
          className="absolute right-3 top-3"
          onClick={onClose}>
          ✕
        </Button>
        Edit assignment
      </Modal.Header>
      <Divider />
      <Modal.Body>
        <Input
          color={`${editPressed && assignmentName === "" ? "error" : "ghost"}`}
          className="mb-6"
          placeholder="Assignment name"
          value={assignmentName}
          onChange={({ target }) => setAssignmentName(target.value)}
        />
        <h3 className="mt-4 mb-2 text-xl">Assessed:</h3>
        {assessedStandards.map((assessed, idx) => (
          <div
            key={assessed.standardId ?? idx}
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
              className={`select select-bordered w-1/2 focus:outline-offset-0 ${
                editPressed && assessed.name == null ? "select-error" : ""
              }`}
              key={assessed.standardId ?? idx}
              onChange={({ target }) => {
                const selectedStandardName =
                  target.options[target.options.selectedIndex]?.value;
                if (selectedStandardName == null) return;
                const selectedStandardId = assignment.class.standards.find(
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
              {assignment.class.standards
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
                editPressed && assessed.value == null ? "select-error" : ""
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
          className="mt-6 gap-2 rounded-md pl-2"
          disabled={
            assessedStandards.length >= assignment.class.standards.length
          }
          onClick={() => setAssessedStandards(values => [...values, {}])}>
          select standard
        </Button>

        <Modal.Actions className="flex justify-between">
          <Button color="error" onClick={onClickDelete} loading={deleteLoading}>
            delete
          </Button>
          <Button color="primary" onClick={onClickEdit} loading={isLoading}>
            edit assignment
          </Button>
        </Modal.Actions>
      </Modal.Body>
    </Modal>
  );
};

export default EditAssignment;
