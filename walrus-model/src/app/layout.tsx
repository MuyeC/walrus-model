import type { Metadata } from "next";
import "../style/globals.css";
import Home from "./page";
import Head from 'next/head';


export const metadata: Metadata = {
  title: "Walrus model",
};

export default function RootLayout() {
  return (
    <html>
      <body>
        <Home></Home>
      </body>
    </html>
  );
}
