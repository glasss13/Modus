import { AiOutlinePlus as PlusIcon } from "react-icons/ai";
import { useState } from "react";
import { Button, Divider, Input } from "react-daisyui";
import { inferQueryOutput, trpc } from "../utils/trpc";
import Modal from "./modal";

type Class = Exclude<inferQueryOutput<"class.byId">, null>;

const EditClassDialog: React.FC<{
  class_: Class;
  open: boolean;
  onClose?: () => void;
}> = ({ class_, open, ...props }) => {
  const [editPressed, setEditPressed] = useState(false);
  const [className, setClassName] = useState(class_.name);
  const [standards, setStandards] = useState<{ id?: string; name: string }[]>(
    () => class_.standards.map(std => ({ name: std.name, id: std.id })),
  );

  const context = trpc.useContext();
  const { mutateAsync: updateClass, isLoading } = trpc.useMutation(
    "class.patchById",
    {
      onSuccess() {
        context.invalidateQueries();
      },
    },
  );

  const onClose = () => {
    setEditPressed(false);
    props.onClose?.();
  };

  const onClickEdit = async () => {
    setEditPressed(true);

    if (standards.some(std => std.name === "") || className === "") return;

    await updateClass({ id: class_.id, name: className, standards });

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
        Edit Class
      </Modal.Header>
      <Divider />
      <Modal.Body>
        <Input
          color="error"
          className={`${
            editPressed && className === "" ? "" : "border-none outline-none"
          } bg-base-200`}
          placeholder="Class name"
          value={className}
          onChange={({ target }) => setClassName(target.value)}
        />
        <h3 className="mt-4 mb-2 text-xl">Standards:</h3>
        {standards.map((standard, idx) => (
          <div key={idx} className="mt-4 flex items-center gap-2 first:mt-0">
            <Button
              onClick={() =>
                setStandards(values => {
                  const copy = [...values];
                  copy.splice(idx, 1);
                  return copy;
                })
              }
              shape="circle"
              color="error"
              size="xs"
              variant="outline">
              -
            </Button>
            <Input
              onChange={({ target }) => {
                setStandards(values => {
                  const copy = [...values];
                  const toChange = copy[idx];
                  if (toChange == null) return copy;
                  toChange.name = target.value;
                  return copy;
                });
              }}
              value={standard.name}
              size="sm"
              color="error"
              placeholder={`Standard ${idx + 1}`}
              className={`${
                editPressed && standard.name === ""
                  ? ""
                  : "border-none outline-none"
              } rounded-md bg-base-200`}
            />
          </div>
        ))}

        <Button
          startIcon={<PlusIcon className="text-2xl" />}
          className="mt-6 gap-2 rounded-md pl-2"
          onClick={() => setStandards(values => [...values, { name: "" }])}>
          Add Standard
        </Button>
      </Modal.Body>
      <Modal.Actions>
        <Button color="primary" onClick={onClickEdit} loading={isLoading}>
          save
        </Button>
      </Modal.Actions>
    </Modal>
  );
};

export default EditClassDialog;
