import React from "react";
import EditTopicForm from "@/app/components/EditTopicForm/EditTopicForm";
import { Topic } from "@/types/topic";
import { headers } from "next/headers";

const EditTopicPage = async ({ params }: { params: { id: string } }) => {
  const headersList = headers();
  const host = headersList.get("x-forwarded-host");
  const proto = headersList.get("x-forwarded-proto");
  const cookie = headersList.get("cookie");
  console.log(`Proto: ${proto}, Host: ${host}`);

  try {
    // const res = await fetch(`${proto}://${host}/api/topics/${params.id}`);
    console.log("[JAC]URL: ", `${proto}://${host}/api/topics/${params.id}`);
    const res = await fetch(`${proto}://${host}/api/topics/${params.id}`, {
      method: "GET",
      headers: {
        Cookie: cookie,
      },
    });

    if (res.status === 404)
      return (
        <div>
          <h1>Topic Not Found</h1>
        </div>
      );

    if (res.status !== 200) {
      let data;
      let error;
      try {
        data = await res.json();
      } catch (err) {
        error = err;
      }
      // const error = data?.error || null;
      if (error) {
        console.error("[JAC]Error: ", error);
      }
      return (
        <div>
          <h1>Error Getting topic: {error?.toString() || "unknown error"}</h1>
        </div>
      );
    }

    const topic = (await res.json()) as Topic;
    return (
      <div>
        <h1>Edit Topic</h1>
        <EditTopicForm topic={topic} />
      </div>
    );
  } catch (err) {
    console.error("[JAC]Error: ", err);
  }
};

export default EditTopicPage;
