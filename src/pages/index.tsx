import type { GetServerSideProps, NextPage } from "next";
import { trpc } from "../utils/trpc";
import ClassCard from "../components/classCard";
import CreateClass from "../components/createClass";
import { Button } from "react-daisyui";
import { getServerAuthSession } from "../server/common/get-server-auth-session";

export const getServerSideProps: GetServerSideProps = async ctx => {
  const session = await getServerAuthSession(ctx);

  if (session?.user == null)
    return {
      redirect: {
        destination: "/signIn",
        permanent: false,
      },
    };

  return {
    props: {},
  };
};

const Home: NextPage = () => {
  const { data: classes, error, isError } = trpc.useQuery(["class.getClasses"]);

  return (
    <>
      <h1 className="text-center text-5xl font-extrabold leading-normal md:text-[5rem]">
        Modus
      </h1>
      <main className="container mx-auto flex min-h-screen w-2/3 flex-col p-1  ">
        {/* {isError && error.data?.code === "UNAUTHORIZED" ? } */}
        {classes ? (
          classes.map(class_ => (
            <ClassCard
              key={class_.id}
              id={class_.id}
              name={class_.name}
              standards={class_.standards}
            />
          ))
        ) : (
          <Button size="lg" color="ghost" loading />
        )}
        <CreateClass />
      </main>
    </>
  );
};

export default Home;
