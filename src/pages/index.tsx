import type { NextPage } from "next";
import Head from "next/head";
import { trpc } from "../utils/trpc";
import ClassCard from "../components/classCard";
import CreateClass from "../components/createClass";

const Home: NextPage = () => {
  const { data: classes } = trpc.useQuery(["class.getClasses"]);

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
        {classes ? (
          classes.map(class_ => (
            <ClassCard
              key={class_.id}
              name={class_.name}
              standards={class_.standards}
            />
          ))
        ) : (
          <p>loading...</p>
        )}
        <CreateClass />
      </main>
    </>
  );
};

export default Home;
