import React from "react";
import TopicVote from "@/app/topics/[id]/vote/components/TopicVote";
import { headers } from "next/headers";
import { TOPICS_API_ENDPOINT } from "@/app/config/paths";
import { Topic } from "@/types/topic";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import TempSignIn from "@/app/components/TempSignin/TempSignIn";

const VoteOnTopicPage = async ({ params }: { params: { id: string } }) => {
  const session = await getServerSession(authOptions);
  const headersList = headers();
  const host = headersList.get("x-forwarded-host");
  const proto = headersList.get("x-forwarded-proto");
  const cookie = headersList.get("cookie");

  if (!session?.user.id) {
    return (
      <div>
        <p>Please sign in to view topics</p>
        <TempSignIn />
      </div>
    );
  }

  if (!host || !proto) {
    return (
      <div>
        <h1>
          Error Getting topic:{" "}
          {"There is a problem on the server, please try again later."}
        </h1>
      </div>
    );
  }

  const res = await fetch(
    `${proto}://${host}${TOPICS_API_ENDPOINT}/${params.id}`,
    {
      method: "GET",
      headers: {
        Cookie: cookie!,
      },
    },
  );

  if (res.status === 404)
    return (
      <div>
        <h1>Topic Not Found</h1>
      </div>
    );

  if (res.status !== 200) {
    let error;
    try {
      const data = await res.json();
      error = data?.error || "Unknown Error";
    } catch (err) {
      error = err;
    }

    return (
      <div>
        <h1>Error Getting topic: {error?.toString() || "Unknown Error"}</h1>
      </div>
    );
  }

  const topic = (await res.json()) as Topic;

  return (
    <div>
      <h1>vote page</h1>
      <TopicVote topic={topic} />
    </div>
  );
};
export default VoteOnTopicPage;
