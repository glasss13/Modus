import type { NextPage } from "next";
import { trpc } from "../utils/trpc";
import ClassCard from "../components/classCard";
import CreateClass from "../components/createClass";
import { Button } from "react-daisyui";

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
