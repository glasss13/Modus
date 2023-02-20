import {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { Breadcrumbs, Button, Divider } from "react-daisyui";
import { trpc } from "../../../utils/trpc";
import CreateAssignment from "../../../components/createAssignment";
import { calculateLetterGrade, LetterGrade } from "../../../utils/grade";
import { AiOutlineHome as HomeIcon } from "react-icons/ai";
import { GiNotebook as NotebookIcon } from "react-icons/gi";
import AssignmentCard from "../../../components/assignmentCard";
import StandardsChart from "../../../components/standardsChart";
import Modal from "../../../components/modal";
import { useState } from "react";
import EditClassDialog from "../../../components/editClassDialog";
import { prisma } from "../../../server/db/client";
import { getServerAuthSession } from "../../../server/common/get-server-auth-session";
import { fullClass } from "../../../server/router/class";
import Head from "next/head";

const LetterGradeSpan: React.FC<{ grade: LetterGrade }> = ({ grade }) => {
  return grade.toString().length > 1 ? (
    <>
      <span>{grade.toString()[0]}</span>
      <span className="text-xl">{grade.toString()[1]}</span>
    </>
  ) : (
    <span>{grade.toString()[0]}</span>
  );
};

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const session = await getServerAuthSession(ctx);
  if (session?.user == null)
    return {
      redirect: { destination: "/signIn", permanent: false },
      props: {},
    };

  const id = ctx.params?.id;
  if (typeof id !== "string") return { notFound: true, props: {} };

  const class_ = await prisma.class.findUnique({
    where: {
      id_userId: {
        id,
        userId: session.user.id,
      },
    },
    include: fullClass,
  });

  if (class_ == null) return { notFound: true, props: {} };

  return {
    props: { class_ },
  };
};

const ClassPage: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ class_ }) => {
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(false);
  const context = trpc.useContext();
  const { mutate: deleteClass } = trpc.useMutation(["class.deleteById"], {
    onSuccess() {
      context.invalidateQueries();
    },
  });

  const router = useRouter();

  // This won't ever be the case but typescript is being annoying
  if (class_ == null) return null;

  const letterGrade = calculateLetterGrade(class_.standards);
  return (
    <>
      <Head>
        <title>{class_.name}</title>
      </Head>
      <main className="container mx-auto">
        <div className="flex flex-col items-center">
          <h1 className="mt-2 text-center text-3xl">{class_.name}</h1>
          <h2 className="mt-2 flex h-12 w-12 items-center justify-center rounded-lg text-center text-3xl backdrop-brightness-150">
            {letterGrade == null ? (
              <span>--</span>
            ) : (
              <LetterGradeSpan grade={letterGrade} />
            )}
          </h2>
          <Breadcrumbs>
            <Link href="/">
              <Breadcrumbs.Item className="link link-hover">
                <HomeIcon className="mr-1 h-4 w-4" />
                Classes
              </Breadcrumbs.Item>
            </Link>
            <Breadcrumbs.Item>
              <NotebookIcon className="mr-1 h-4 w-4" />
              {class_.name}
            </Breadcrumbs.Item>
          </Breadcrumbs>
        </div>
        <Divider />
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/3">
            {class_.assignments.length === 0 ? (
              <h2 className="mb-4 text-center text-xl">
                No assignments yet :(
              </h2>
            ) : (
              <h2 className="mb-4 text-center text-xl">Assignments</h2>
            )}

            <div className="flex flex-col">
              {class_.assignments.map(assignment => (
                <AssignmentCard key={assignment.id} assignment={assignment} />
              ))}

              <CreateAssignment class_={class_} />
            </div>
          </div>

          <div className="mt-8 ml-0 grow md:mt-0 md:ml-12">
            <h2 className="mb-4 text-center text-xl">Standards</h2>
            <StandardsChart standards={class_.standards} />
          </div>
        </div>
        <div className="mt-16 flex gap-4">
          <Button
            color="info"
            className="w-1/3 md:w-auto"
            onClick={() => setEditing(true)}>
            edit class
          </Button>
          <EditClassDialog
            class_={class_}
            open={editing}
            onClose={() => setEditing(false)}
          />

          <Button
            className="w-1/3 md:w-auto"
            color="error"
            onClick={() => setDeleting(true)}>
            delete class
          </Button>

          <Link href={`/class/${class_.id}/simulator`}>
            <Button className="w-1/3 md:w-auto" color="success">
              grade simulator
            </Button>
          </Link>

          <Modal
            open={deleting}
            className="rounded-xl"
            onClickEscape={() => setDeleting(false)}
            onClickBackdrop={() => setDeleting(false)}>
            <Modal.Header className="text-center font-semibold">
              ARE YOU SURE?
            </Modal.Header>
            <Modal.Body>
              <p className="text-center text-lg text-red-600">
                Deletion is <u>PERMANENT</u>
              </p>
            </Modal.Body>
            <Modal.Actions className="mt-8 flex justify-center">
              <Button
                color="error"
                className="grow"
                onClick={() => {
                  router.replace("/");
                  setDeleting(false);
                  deleteClass({ id: class_.id });
                }}>
                yes
              </Button>
              <Button
                color="info"
                className="grow"
                onClick={() => setDeleting(false)}>
                no
              </Button>
            </Modal.Actions>
          </Modal>
        </div>
      </main>
    </>
  );
};

export default ClassPage;
