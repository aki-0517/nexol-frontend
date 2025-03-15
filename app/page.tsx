"use client";

import React, { useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import * as anchor from "@project-serum/anchor";

// on-chain プログラムの ID
const PROGRAM_ID = new PublicKey("G8sAEnDs3GjHqQEQyLzDCrdbE4nY4LAXHh6ibRfFzmHx");

// 最低限の IDL 定義（必要に応じて更新してください）
const idl = {
  version: "0.1.0",
  name: "create_core_asset_example",
  instructions: [
    {
      name: "createCoreAsset",
      accounts: [
        { name: "asset", isMut: true, isSigner: true },
        { name: "collection", isMut: true, isSigner: false, optional: true },
        { name: "authority", isMut: false, isSigner: true, optional: true },
        { name: "payer", isMut: true, isSigner: true },
        { name: "owner", isMut: false, isSigner: false, optional: true },
        { name: "updateAuthority", isMut: false, isSigner: false, optional: true },
        { name: "systemProgram", isMut: false, isSigner: false },
        { name: "mplCoreProgram", isMut: false, isSigner: false }
      ],
      args: [
        { name: "name", type: "string" },
        { name: "uri", type: "string" }
      ]
    }
  ]
};

const Home: React.FC = () => {
  const { connection } = useConnection();
  // sendTransaction ではなく、signTransaction を利用
  const { publicKey, signTransaction, signAllTransactions } = useWallet();
  const [name, setName] = useState<string>("");
  const [uri, setUri] = useState<string>("");
  const [txSig, setTxSig] = useState<string>("");

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    

    if (!publicKey) {
      alert("ウォレットを接続してください");
      return;
    }

    // Anchor Provider の作成（ウォレットオブジェクトとして signTransaction を渡す）
    const provider = new anchor.AnchorProvider(
      connection,
      {
        publicKey,
        signTransaction: signTransaction!,
        signAllTransactions: signAllTransactions!,
      },
      {}
    );

    // プログラムインスタンスの作成
    const program = new anchor.Program(idl as anchor.Idl, PROGRAM_ID, provider);

    try {
      const tx = await program.rpc.createCoreAsset(name, uri, {
        accounts: {
          asset: publicKey,
          // オプションのアカウントは必要に応じて設定
          collection: publicKey,
          authority: publicKey,
          payer: publicKey,
          owner: publicKey,
          updateAuthority: publicKey,
          systemProgram: SystemProgram.programId,
          // mpl_core_program には実際の MPL Core のアドレスを指定する必要があります。
          // ここでは例として同じ PROGRAM_ID を利用しています。
          mplCoreProgram: PROGRAM_ID,
        },
      });
      setTxSig(tx);
      alert("トランザクション送信: " + tx);
    } catch (err: any) {
      console.error(err);
      alert("トランザクション失敗: " + err.message);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Create Core Asset</h1>
      <form onSubmit={onSubmit}>
        <div>
          <label>Asset Name: </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="名前を入力"
            required
          />
        </div>
        <div>
          <label>URI: </label>
          <input
            type="text"
            value={uri}
            onChange={(e) => setUri(e.target.value)}
            placeholder="URI を入力"
            required
          />
        </div>
        <button type="submit">アセット作成</button>
      </form>
      {txSig && (
        <p>
          Transaction Signature: <br />
          {txSig}
        </p>
      )}
    </div>
  );
};

export default Home;
