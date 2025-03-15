// app/layout.tsx
import React from "react";
import WalletContextProvider from "../components/WalletContextProvider";

export const metadata = {
  title: "Solana Create Core Asset",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <head>
        <title>Solana Create Core Asset</title>
      </head>
      <body>
        <WalletContextProvider>{children}</WalletContextProvider>
      </body>
    </html>
  );
}
