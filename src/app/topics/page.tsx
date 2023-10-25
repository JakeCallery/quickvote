import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import TempSignIn from "@/app/components/TempSignin/TempSignIn";
import Link from "next/link";

const TopicsPage = async () => {
  const session = await getServerSession(authOptions);

  return (
    <>
      {session?.user?.name ? (
        <div>
          <h1>Topics Page</h1>
          <p>Topics List</p>
          <Link href="/createtopic">Create New Topic</Link>
        </div>
      ) : (
        <div>
          <p>Please sign in to view topics</p>
          <TempSignIn />
        </div>
      )}
    </>
  );
};

export default TopicsPage;
