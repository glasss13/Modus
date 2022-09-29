import { useState } from "react";
import { trpc } from "../utils/trpc";
import { AiOutlinePlus as PlusIcon } from "react-icons/ai";
import Modal from "../components/modal";
import {
  Badge,
  Button,
  Card,
  Divider,
  Indicator,
  Input,
  Tooltip,
} from "react-daisyui";

const CreateClass = () => {
  const [showDialog, setShowDialog] = useState(false);
  const [className, setClassName] = useState<string>("");
  const [standards, setStandards] = useState<string[]>([]);
  const [createPressed, setCreatePressed] = useState(false);

  const context = trpc.useContext();
  const { mutate: makeClass, isLoading } = trpc.useMutation(
    ["class.makeClass"],
    {
      onSuccess() {
        context.invalidateQueries();
      },
    },
  );

  const resetState = () => {
    setStandards([]);
    setClassName("");
    setShowDialog(false);
    setCreatePressed(false);
  };

  const onClickCreate = () => {
    setCreatePressed(true);

    if (standards.some(name => name === "") || className === "") return;

    makeClass({
      name: className,
      standards: standards.map(name => ({
        name,
        grades: [],
      })),
    });

    resetState();
  };

  return (
    <>
      <Modal
        open={showDialog}
        className="rounded-md"
        onClickBackdrop={resetState}
        onClickEscape={resetState}>
        <Modal.Header className="mb-2 ml-1 text-2xl font-bold">
          <Button
            size="sm"
            shape="circle"
            className="absolute right-3 top-3"
            onClick={resetState}>
            ✕
          </Button>
          Create Class
        </Modal.Header>
        <Divider />
        <Modal.Body>
          <Input
            color="error"
            className={`${
              createPressed && className === ""
                ? ""
                : "border-none outline-none"
            } bg-base-200`}
            placeholder="Class name"
            value={className}
            onChange={({ target }) => setClassName(target.value)}
          />
          <h3 className="mt-4 mb-2 text-xl">Standards:</h3>
          {standards.map((standardName, idx) => (
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

              <Indicator
                className={idx !== 0 ? "hidden" : ""}
                item={
                  <Tooltip message="Input standard name. E.g. MATH1.1">
                    <Badge color="info" size="sm">
                      i
                    </Badge>
                  </Tooltip>
                }>
                <Input
                  onChange={({ target }) =>
                    setStandards(values => {
                      const copy = [...values];
                      copy[idx] = target.value;
                      return copy;
                    })
                  }
                  value={standardName}
                  size="sm"
                  color="error"
                  placeholder={`Standard ${idx + 1}`}
                  className={`${
                    createPressed && standardName === ""
                      ? ""
                      : "border-none outline-none"
                  } rounded-md bg-base-200`}
                />
              </Indicator>
            </div>
          ))}
          <Button
            startIcon={<PlusIcon className="text-2xl" />}
            className="mt-6 gap-2 rounded-md pl-2"
            onClick={() => setStandards(values => [...values, ""])}>
            Add Standard
          </Button>
        </Modal.Body>
        <Modal.Actions>
          <Button color="primary" onClick={onClickCreate} loading={isLoading}>
            Create Class
          </Button>
        </Modal.Actions>
      </Modal>
      <Card
        onClick={() => setShowDialog(true)}
        className="group mt-4 h-32 items-center justify-center rounded-xl border-2 border-dashed border-gray-600 transition-colors hover:cursor-pointer hover:bg-slate-500 hover:bg-opacity-20">
        <p className="rounded-full bg-gray-600 bg-opacity-40 text-4xl text-base-200 transition-all group-hover:scale-125 group-hover:transform group-hover:text-gray-400">
          <PlusIcon />
        </p>
      </Card>
    </>
  );
};

export default CreateClass;
