"use client";

import { ConnectButton, SuiClientProvider, WalletProvider } from "@mysten/dapp-kit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Theme } from "@radix-ui/themes";
import { networkConfig } from "../config/networkConfig";

import "@mysten/dapp-kit/dist/index.css";
import "@radix-ui/themes/styles.css";

import "../style/button.css";
import { useState } from "react";
import Load from "./upload";
import DownloadFile from "./download";

const queryClient = new QueryClient();

export default function Home() {
  const [activeComponent, setActiveComponent] = useState<"A" | "B" | null>(null);

  return (
    <Theme>
      <QueryClientProvider client={queryClient}>
        <SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
          <WalletProvider autoConnect>
            <div className="navbar-container">
              {/* 将 h1 改为按钮，点击后回到选择状态 */}
              <button
  onClick={() => setActiveComponent(null)}
  style={{
    display: "flex",
    alignItems: "center", // 使图片和文本垂直居中
    padding: "10px 20px",
    fontSize: "16px",
    borderRadius: "5px",
    cursor: "pointer",
    color: "black", // 修改字体颜色为蓝色
    border: "none",
    transition: "background-color 0.3s, color 0.3s",
  }}
>
  {/* 图片 */}
  <img
    src="menu.png" // 这里替换成你的图片路径
    alt="Go Back"
    style={{
      width: "20px", // 设置图片大小
      height: "20px", // 设置图片高度
      marginRight: "10px", // 图片和文本之间的间距
    }}
  />
  Home
</button>

              <ConnectButton />
            </div>

<div style={{ height: "80vh", overflow: "hidden" }}>
  {/* 按钮, 只有在没有选择组件时才显示 */}
  {activeComponent === null && (
    <div style={{ display: "flex", width: "100%", height: "100%" }}>
      
      <div
        style={{
          display: "flex",
          justifyContent: "center", // 水平居中按钮
          alignItems: "center", // 垂直居中按钮
          gap: "20px", // 按钮之间的间距
          flex: 1, // 让按钮部分占据一部分空间
          padding: "10px",
        }}
      >
        <button
          style={{
            padding: "5px 5px", // 设置按钮大小
            fontSize: "18px",
            borderRadius: "5px",
            cursor: "pointer",
            backgroundColor: "black",
            color: "white",
            border: "none",
            transition: "background-color 0.3s, color 0.3s",
            width: "100px", // 固定按钮宽度
          }}
          onClick={() => setActiveComponent("A")}
        >
          Upload
        </button>
        <button
          style={{
            padding: "5px 5px", // 设置按钮大小
            fontSize: "18px",
            borderRadius: "5px",
            cursor: "pointer",
            backgroundColor: "white",
            color: "black",
            border: "2px solid gray",
            transition: "background-color 0.3s, color 0.3s",
            width: "100px", // 固定按钮宽度
          }}
          onClick={() => setActiveComponent("B")}
        >
          Download
        </button>
      </div>

      <div
  style={{
    flex: 2,
    padding: "20px",
    display: "flex", // 使用 flex 布局
    justifyContent: "center", // 水平居中
    alignItems: "center", // 垂直居中
  }}
>
  <img
    src="home.png" // 替换为图片的路径
    alt="Home"
    style={{
      width: "50%", // 设置宽度为父容器的 80%
      height: "auto", // 高度自动调整以保持比例
    }}
  />
</div>

    </div>
  )}

  {/* 根据状态渲染不同组件 */}
  {activeComponent === "A" && <Load />}
  {activeComponent === "B" && <DownloadFile />}

  {/* 如果没有选择组件，则显示提示 */}
  {activeComponent === null && <p>Select a component to view</p>}
</div>

          </WalletProvider>
        </SuiClientProvider>
      </QueryClientProvider>
    </Theme>
  );
}
