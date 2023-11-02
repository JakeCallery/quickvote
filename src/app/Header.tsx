"use client";
import React from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

const MyComponent = () => {
  const { status, data: session } = useSession();

  return (
    <div className="navbar bg-base-200">
      <div className="flex-1">
        <Link className="btn btn-ghost normal-case text-3xl" href="/">
          <span className="text-primary">QuickVote</span>
        </Link>
      </div>
      <div className="flex-none gap-2">
        <div className="dropdown dropdown-end">
          <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
            <div className="w-10 rounded-full bg-secondary">
              {session?.user?.image ? (
                <img src={session?.user.image} alt="User Profile Image" />
              ) : null}
            </div>
          </label>
          <ul
            tabIndex={0}
            className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52"
          >
            <li>
              {status === "authenticated" ? (
                <Link href="/api/auth/signout">Sign Out</Link>
              ) : (
                <Link href="/api/auth/signin">Sign In</Link>
              )}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MyComponent;
