import { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";

const ClassPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;

  if (typeof id !== "string") {
    return <h1>Not good</h1>;
  }

  return (
    <Head>
      <title>{id}</title>
      <meta name="description" content="Modus Grade Calculator" />
      <link rel="icon" href="/favicon.ico" />
    </Head>
  );
};

export default ClassPage;
