import type { NextPage } from "next";
import { trpc } from "../utils/trpc";
import ClassCard from "../components/classCard";
import CreateClass from "../components/createClass";
import { Button } from "react-daisyui";

const Home: NextPage = () => {
  const { data: classes } = trpc.useQuery(["class.getClasses"]);

  return (
    <>
      <h1 className="text-center text-5xl md:text-[5rem] leading-normal font-extrabold">
        Modus Grade Calculator
      </h1>
      <main className="container flex flex-col min-h-screen mx-auto p-1 w-2/3  ">
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
