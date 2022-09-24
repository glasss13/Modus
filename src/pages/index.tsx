import type { NextPage } from "next";
import { useState } from "react";
import Head from "next/head";
import {
  Badge,
  Button,
  Card,
  Divider,
  Indicator,
  Input,
  Tooltip,
} from "react-daisyui";
import { AiOutlinePlus as PlusIcon } from "react-icons/ai";
import { Grade, calculateLetterGrade, Standard } from "../utils/grade";
import { trpc } from "../utils/trpc";
import Modal from "../components/modal";

const Home: NextPage = () => {
  // const hello = trpc.useQuery(["example.hello", { text: "from tRPC" }]);

  const standard1 = new Standard("s1", [
    Grade.EE,
    Grade.EE,
    Grade.EE,
    Grade.EE,
    Grade.EE,
  ]);
  const standard2 = new Standard("s2", [
    Grade.ME,
    Grade.ME,
    Grade.ME,
    Grade.ME,
    Grade.EE,
  ]);
  const standard3 = new Standard("s3", [
    Grade.AE,
    Grade.AE,
    Grade.EE,
    Grade.EE,
  ]);
  return (
    <>
      <Head>
        <title>Modus Grade Calculator</title>
        <meta name="description" content="Modus Grade Calculator" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <h1 className="text-center text-5xl md:text-[5rem] leading-normal font-extrabold">
        Modus Grade Calculator
      </h1>

      <main className="container flex flex-col min-h-screen mx-auto p-1 w-2/3 border border-gray-600 ">
        <Class name="English" standards={[standard1, standard2, standard3]} />
        <Class name="English" standards={[standard1, standard2, standard3]} />
        <CreateClass />
      </main>

      {/* <Button>hi</Button>
        <div className="pt-6 text-2xl text-blue-500 flex justify-center items-center w-full">
          {hello.data ? <p>{hello.data.greeting}</p> : <p>Loading..</p>}
        </div> */}
    </>
  );
};

interface Props {
  name: string;
  standards: Standard[];
}

const Class = (props: Props) => {
  const letterGrade = calculateLetterGrade(props.standards);

  return (
    <Card className="bg-base-200 rounded-xl border-gray-600 first:mt-0 mt-4">
      <Card.Body>
        <Card.Title>{props.name}</Card.Title>
        <p>{letterGrade}</p>
      </Card.Body>
    </Card>
  );
};

const CreateClass = () => {
  const [showDialog, setShowDialog] = useState(false);
  const [className, setClassName] = useState<string>("");
  const [standards, setStandards] = useState<string[]>([]);
  const [createPressed, setCreatePressed] = useState(false);

  const onClickCreate = () => {
    setCreatePressed(true);
  };

  return (
    <>
      <Modal open={showDialog} className="rounded-md">
        <Modal.Header className="text-2xl font-bold mb-2 ml-1">
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
            <div key={idx} className="flex gap-2 first:mt-0 mt-4">
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
            className="gap-2 pl-2 rounded-md mt-6"
            onClick={() => setStandards(values => [...values, ""])}>
            Add Standard
          </Button>
        </Modal.Body>
        <Modal.Actions>
          <Button color="primary" onClick={onClickCreate}>
            Create Class
          </Button>
        </Modal.Actions>
      </Modal>
      <Card
        onClick={() => setShowDialog(true)}
        className="rounded-xl border-gray-600 mt-4 h-32 items-center justify-center transition-colors border-dashed hover:bg-slate-500 hover:bg-opacity-20 hover:cursor-pointer group">
        <p>Add New Class</p>
        <p className="transition-colors text-4xl text-gray-500 group-hover:text-inherit rounded-full">
          <PlusIcon />
        </p>
      </Card>
    </>
  );
};

export default Home;
