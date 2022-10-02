import type { NextPage } from "next";
import { trpc } from "../utils/trpc";
import ClassCard from "../components/classCard";
import CreateClass from "../components/createClass";
import { Button, Collapse } from "react-daisyui";
import { signIn, useSession, signOut } from "next-auth/react";
import Image from "next/image";
import { BiLogOut as LogOutIcon } from "react-icons/bi";
import { useState } from "react";

const Home: NextPage = () => {
  const { data: classes } = trpc.useQuery(["class.getClasses"]);
  const { data: session, status } = useSession();
  const [drop, setDrop] = useState(false);

  return (
    <>
      {status === "authenticated" ? (
        <Collapse
          onMouseEnter={() => setDrop(true)}
          onMouseLeave={() => setDrop(false)}
          open={drop}
          className="absolute right-8 top-4 rounded-lg border border-gray-600 bg-opacity-30">
          <Collapse.Title className="flex items-center gap-2 bg-base-100 px-2">
            <Image
              className="rounded-full"
              src={session.user?.image ?? ""}
              width={32}
              height={32}
              alt=""
            />
            {session.user?.name}
          </Collapse.Title>
          <Collapse.Content className="bg-base-100 pl-1">
            <div
              className="flex cursor-pointer items-center gap-2 text-red-600"
              onClick={() => signOut()}>
              <LogOutIcon className="text-3xl" />
              <p className="text-md">Sign Out</p>
            </div>
          </Collapse.Content>
        </Collapse>
      ) : (
        <Button
          className="absolute right-6 top-3 rounded-lg bg-gray-600 bg-opacity-40"
          onClick={() => signIn("google")}>
          sign in
        </Button>
      )}

      <h1 className="text-center text-5xl font-extrabold leading-normal md:text-[5rem]">
        Modus Grade Calculator
      </h1>
      <main className="container mx-auto flex min-h-screen w-2/3 flex-col p-1  ">
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
