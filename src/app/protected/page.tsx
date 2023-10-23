import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const ProtectedPage = async () => {
  const session = await getServerSession(authOptions);
  return (
    <div>
      <p>Hello {session?.user?.name}</p>
    </div>
  );
};

export default ProtectedPage;
