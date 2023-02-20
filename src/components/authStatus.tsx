import { useState } from "react";
import Image from "next/image";
import { Collapse } from "react-daisyui";
import { BiLogOut as LogOutIcon } from "react-icons/bi";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";

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
          className="absolute right-4 top-4 rounded-lg border border-gray-600 bg-opacity-30">
          <Collapse.Title className="flex items-center gap-2 bg-base-100 px-2">
            <Image
              className="rounded-full"
              src={session.user?.image ?? ""}
              width={32}
              height={32}
              alt=""
            />
            {/* <Image
              className="rounded-full"
              src="https://pbs.twimg.com/media/EJ60F1aX0AAYiAb.jpg"
              width={32}
              height={32}
              alt=""
            /> */}
            <p className="hidden md:block">{session.user?.name}</p>
          </Collapse.Title>
          <Collapse.Content className="bg-base-100 pl-1">
            <Link href="/">
              <div
                className="flex cursor-pointer items-center gap-2 text-red-600"
                onClick={async () => {
                  await signOut({
                    callbackUrl: "/",
                  });
                }}>
                <LogOutIcon className="text-3xl" />

                <p className="text-md hidden md:block">Sign Out</p>
              </div>
            </Link>
          </Collapse.Content>
        </Collapse>
      ) : null}
    </>
  );
};

export default AuthStatus;
