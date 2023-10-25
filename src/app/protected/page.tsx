import { Logger } from "next-axiom";
import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const ProtectedPage = async () => {
  const session = await getServerSession(authOptions);
  const log = new Logger();
  log.info("Hit protected page: ", { session: session });
  await log.flush();
  return (
    <div>
      <p>Hello {session?.user?.name}</p>
    </div>
  );
};

export default ProtectedPage;
