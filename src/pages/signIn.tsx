import { signIn, useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/router";

export default function SignIn() {
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      signIn("google");
    } else if (status === "authenticated") {
      router.push("/");
    }
  }, [router, status]);

  return <></>;
}
