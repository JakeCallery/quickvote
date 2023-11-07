import { Logger } from "next-axiom";

import {
  PrismaClientInitializationError,
  PrismaClientKnownRequestError,
  PrismaClientRustPanicError,
  PrismaClientUnknownRequestError,
} from "@prisma/client/runtime/library";
import { NextRequest, NextResponse } from "next/server";
import { JWT } from "next-auth/jwt";
import * as crypto from "crypto";

export const handlePrismaError = async (
  request: NextRequest,
  error: any,
  token: JWT | null,
) => {
  const log = new Logger();

  const digest = crypto
    .createHash("sha1")
    .update(
      Date.now().toString() +
        token?.sub?.toString() +
        request.url +
        error.toString(),
    )
    .digest("hex");

  if (error instanceof PrismaClientKnownRequestError) {
    log.info("PrismaClientKnownRequestError", {
      code: "400",
      url: request.url,
      message: error.message,
      error: error,
      digest: digest,
    });
    await log.flush();
    return NextResponse.json({ error: error.message }, { status: 400 });
  } else if (
    error instanceof PrismaClientRustPanicError ||
    error instanceof PrismaClientInitializationError ||
    error instanceof PrismaClientUnknownRequestError
  ) {
    log.error("PrismaClientError", {
      code: "500",
      url: request.url,
      message: error.message,
      error: error,
    });
    await log.flush();
    return NextResponse.json({ error: error.message }, { status: 500 });
  } else {
    if ("toString" in error && typeof error.toString === "function") {
      log.error("Unhandled Server Error", {
        code: "500",
        url: request.url,
        message: error.toString(),
        error: error,
      });
      await log.flush();
      return NextResponse.json({ error: error.toString() }, { status: 500 });
    }
    log.error("Unhandled Server Error", {
      code: "500",
      url: request.url,
      message: "",
      error: error,
    });
    await log.flush();
    return NextResponse.json({ error: error }, { status: 500 });
  }
};
