import React from "react";
import Head from "next/head";
import Link from "next/link";

function Home() {
  return (
    <React.Fragment>
      <Head>
        <title>Neuphony - Chart It</title>
      </Head>
      <div className="grid grid-col-1 text-2xl w-full text-center">
        <img className="ml-auto mr-auto" src="/images/logo.png" />
      </div>
      <div className="mt-4 w-full flex-wrap flex justify-center">
        <Link href="https://neuphony.com/">
          <a className="btn-blue">Visit Website</a>
        </Link>
      </div>
      <div className="mt-4 w-full flex-wrap flex justify-center">
        <Link href="/next">
          <a className="btn-blue">Go to Task</a>
        </Link>
      </div>
      <div className="mt-4 w-full flex-wrap flex justify-center">
        <Link href="/new_chsrt">
          <a className="btn-blue">Go to new chart</a>
        </Link>
      </div>
    </React.Fragment>
  );
}

export default Home;
