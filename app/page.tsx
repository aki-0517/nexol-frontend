"use client";

import React, { useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Metaplex, Nft, walletAdapterIdentity } from "@metaplex-foundation/js";

export default function Home() {
  const wallet = useWallet();
  const { publicKey } = wallet;
  const { connection } = useConnection();

  const [nftName, setNftName] = useState("");
  const [nftDescription, setNftDescription] = useState("");
  const [externalUrl, setExternalUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [rarity, setRarity] = useState("");
  const [txSig, setTxSig] = useState("");
  const [mintedNft, setMintedNft] = useState<Nft>();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!publicKey) {
      alert("ウォレットを接続してください");
      return;
    }

    try {
      // Metaplex インスタンスをウォレットアダプターを利用して作成
      const metaplex = Metaplex.make(connection).use(walletAdapterIdentity(wallet));

      // ユーザー入力からメタデータオブジェクトを作成
      const metadata = {
        name: nftName,
        description: nftDescription,
        image: imageUrl,
        external_url: externalUrl,
        attributes: [
          {
            trait_type: "rarity",
            value: rarity,
          },
        ],
      };

      // メタデータをアップロードし、URIを取得
      const { uri } = await metaplex.nfts().uploadMetadata(metadata);

      // NFTをmint（例として、sellerFeeBasisPoints は 5% のロイヤリティに設定）
      const { nft, response } = await metaplex.nfts().create({
        uri,
        name: nftName,
        sellerFeeBasisPoints: 500,
      });

      setTxSig(response.signature);
      setMintedNft(nft);
    } catch (err: any) {
      console.error("Error minting NFT:", err);
      alert("トランザクション失敗: " + err.message);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ marginBottom: "20px" }}>
        <WalletMultiButton />
      </div>
      {publicKey ? (
        <>
          <h1>NFT Mint (Client Side)</h1>
          <form onSubmit={onSubmit}>
            <div style={{ marginBottom: "10px" }}>
              <label style={{ marginRight: "10px" }}>NFT Name:</label>
              <input
                type="text"
                value={nftName}
                onChange={(e) => setNftName(e.target.value)}
                placeholder="NFT の名前"
                required
              />
            </div>
            <div style={{ marginBottom: "10px" }}>
              <label style={{ marginRight: "10px" }}>Description:</label>
              <input
                type="text"
                value={nftDescription}
                onChange={(e) => setNftDescription(e.target.value)}
                placeholder="NFT の説明"
                required
              />
            </div>
            <div style={{ marginBottom: "10px" }}>
              <label style={{ marginRight: "10px" }}>External URL:</label>
              <input
                type="url"
                value={externalUrl}
                onChange={(e) => setExternalUrl(e.target.value)}
                placeholder="外部リンク URL"
                required
              />
            </div>
            <div style={{ marginBottom: "10px" }}>
              <label style={{ marginRight: "10px" }}>Image URL:</label>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="画像の URL を入力"
                required
              />
            </div>
            <div style={{ marginBottom: "10px" }}>
              <label style={{ marginRight: "10px" }}>Rarity:</label>
              <input
                type="text"
                value={rarity}
                onChange={(e) => setRarity(e.target.value)}
                placeholder="例: max"
                required
              />
            </div>
            <button type="submit">NFT Mint</button>
          </form>
          {txSig && (
            <p style={{ marginTop: "20px" }}>
              Transaction Signature: <br />
              {txSig}
            </p>
          )}
          {mintedNft && (
            <div style={{ marginTop: "20px" }}>
              <h2>Minted NFT Details</h2>
              <p>Name: {mintedNft.name}</p>
            </div>
          )}
        </>
      ) : (
        <p>ウォレットを接続してください</p>
      )}
    </div>
  );
}
