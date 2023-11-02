import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/app/auth/Provider";
import React from "react";
import { AxiomWebVitals } from "next-axiom";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { config } from "@fortawesome/fontawesome-svg-core";
import Header from "@/app/Header";
import Head from "next/head";
import { Toaster } from "react-hot-toast";
config.autoAddCss = false;

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "QuickVote",
  description: "App to vote on topics",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AxiomWebVitals />
        <AuthProvider>
          <Header />
          {children}
        </AuthProvider>
        <Toaster position="bottom-center" />
      </body>
    </html>
  );
}
