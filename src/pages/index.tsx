import type { GetServerSidePropsContext } from "next";
import { Button } from "react-daisyui";
import ClassCard from "../components/classCard";
import CreateClass from "../components/createClass";
import { getServerAuthSession } from "../server/common/get-server-auth-session";
import { trpc } from "../utils/trpc";

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
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

export default function Home() {
  const { data: classes, isLoading } = trpc.useQuery(["class.getClasses"]);
  return (
    <>
      <h1 className="text-center text-5xl font-extrabold leading-normal md:text-[5rem]">
        Modus
      </h1>
      <main className="container mx-auto flex min-h-screen w-2/3 flex-col p-1  ">
        {}
        {classes ? (
          classes.map(class_ => (
            <ClassCard
              key={class_.id}
              id={class_.id}
              name={class_.name}
              standards={class_.standards}
            />
          ))
        ) : isLoading ? (
          <Button size="lg" color="ghost" loading />
        ) : null}
        <CreateClass />
      </main>
    </>
  );
}
