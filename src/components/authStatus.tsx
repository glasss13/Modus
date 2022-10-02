import { useState } from "react";
import Image from "next/image";
import { Button, Collapse } from "react-daisyui";
import { BiLogOut as LogOutIcon } from "react-icons/bi";
import { signIn, useSession, signOut } from "next-auth/react";

const AuthStatus = () => {
  const [drop, setDrop] = useState(false);
  const { data: session, status } = useSession();

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
    </>
  );
};

export default AuthStatus;
