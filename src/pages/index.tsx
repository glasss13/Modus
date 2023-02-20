import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import ClassCard from "../components/classCard";
import CreateClass from "../components/createClass";
import { getServerAuthSession } from "../server/common/get-server-auth-session";
import { prisma } from "../server/db/client";
import { Prisma } from "@prisma/client";

const fullClass = Prisma.validator<Prisma.ClassInclude>()({
  standards: {
    include: {
      summativeGrades: true,
    },
  },
  assignments: {
    include: {
      grades: {
        include: {
          standard: true,
        },
      },
      class: {
        include: {
          standards: true,
        },
      },
    },
  },
});

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const session = await getServerAuthSession(ctx);

  if (session?.user == null)
    return {
      redirect: {
        destination: "/signIn",
        permanent: false,
      },
      props: { classes: [] },
    };

  const classes = await prisma.class.findMany({
    where: {
      userId: session.user.id,
    },
    include: fullClass,
  });

  return {
    props: { classes },
  };
};

const Home: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ classes }) => {
  return (
    <>
      <h1 className="text-center text-5xl font-extrabold leading-normal md:text-[5rem]">
        Modus
      </h1>
      <main className="container mx-auto flex min-h-screen w-2/3 flex-col p-1  ">
        {/* {isError && error.data?.code === "UNAUTHORIZED" ? } */}
        {classes.map(class_ => (
          <ClassCard
            key={class_.id}
            id={class_.id}
            name={class_.name}
            standards={class_.standards}
          />
        ))}
        <CreateClass />
      </main>
    </>
  );
};

export default Home;
