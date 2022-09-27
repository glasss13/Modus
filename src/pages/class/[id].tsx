import { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { Button } from "react-daisyui";
import { trpc } from "../../utils/trpc";
import CreateAssignment from "../../components/createAssignment";

const ClassPageContent: React.FC<{ id: string }> = ({ id }) => {
  const { data: class_ } = trpc.useQuery(["class.byId", { id }]);
  const { mutate: deleteClass } = trpc.useMutation(["class.deleteById"]);
  const [showAssignmentDialog, setShowAssignmentDialog] = useState(false);

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

  const closeDialog = () => setShowAssignmentDialog(false);

  return (
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
      <Button onClick={() => deleteClass({ id: class_.id })}>delete</Button>
      <Button onClick={() => setShowAssignmentDialog(true)}>
        add assignment
      </Button>
      <CreateAssignment
        open={showAssignmentDialog}
        class_={class_}
        onClose={closeDialog}
      />
    </main>
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
