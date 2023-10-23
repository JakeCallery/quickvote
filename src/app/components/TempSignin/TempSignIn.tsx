"use client";
import React from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

const TempSignIn = () => {
  const { status, data: session } = useSession();

  return (
    <div>
      {status === "loading" && <div>Loading...</div>}
      {status === "authenticated" && (
        <div>
          <p>{session.user?.name}</p>{" "}
          <Link href="/api/auth/signout">Sign Out</Link>
        </div>
      )}
      {status === "unauthenticated" && (
        <Link href="/api/auth/signin">Sign In</Link>
      )}
    </div>
  );
};

export default TempSignIn;
