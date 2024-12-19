"use client"

import "../style/button.css";
import { useEffect, useState } from "react";
import APP1 from "./three";
import $ from "jquery";
import { Transaction } from "@mysten/sui/transactions";
import { useAccounts, useSignAndExecuteTransaction } from "@mysten/dapp-kit";

import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";

export default function Load() {

  const [file, setFile] = useState<File | null>(null); // 存储选中的文件
  const [inputValue, setInputValue] = useState('一个模型'); // 设置描述输入框的默认值
  const [inputValue1, setInputValue1] = useState('1');      // 设置周期输入框的默认值
  
  const [loading, setLoading] = useState(false); // 上传进度状态
  const [responseMessage, setResponseMessage] = useState(''); // 用于存储返回的消息
  const [inputblob, setInputblob] = useState(''); // 存储周期输入框的值
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const client = new SuiClient({ url: getFullnodeUrl("testnet") });
  const [account] = useAccounts();


  useEffect(() => {
  }, [inputblob,inputValue,inputValue1]);
  
  


  // 只允许输入字母、汉字和空格
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (/^[A-Za-z\u4e00-\u9fa5\s]*$/.test(value)) {
      setInputValue(value);
    }
  };

  // 只允许正整数
  const handleInputChange1 = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (/^[1-9]\d*$|^0$/.test(value)) {
      setInputValue1(value);
    }
  };

  // 文件选择处理
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile); // 更新选中的文件
      console.log("选中的文件:", selectedFile.name); // 文件选择日志
    } else {
      setFile(null); // 如果没有文件，设置为 null
    }
  };

  // 上传按钮点击处理
  // 上传按钮点击处理
const handleUploadClick = () => {
  if (file) {
    const publisher = 'https://publisher.walrus-testnet.walrus.space'; // 替换为你的 PUBLISHER URL
    const url = `${publisher}/v1/store?epochs=${inputValue1 || 1}`;

    // 开始上传时设置加载状态
    setLoading(true);
    setResponseMessage('');
    // 创建 Blob 对象直接上传文件
    const blob = new Blob([file], { type: file.type });

    // 使用 jQuery 的 ajax 方法发起 PUT 请求
    $.ajax({
      url: url,
      type: "PUT",
      data: blob,  // 直接上传文件 Blob 数据
      processData: false, // 不让 jQuery 自动处理数据
      contentType: "application/octet-stream", // 设置请求体的内容类型为二进制流
      success: async function(response) {
        // 上传成功后，设置返回消息和 blobId
        setResponseMessage('File uploaded successfully: ' + JSON.stringify(response));
        const blobId = response.alreadyCertified ? response.alreadyCertified.blobId : null;
        setInputblob(blobId);

        // 打印 blobId
        console.log('Blob ID:', blobId);

        // 在上传成功后执行 Transaction
        if (blobId) {
          try {
            const tx = new Transaction();
              tx.moveCall({
                target: `0xa8e5a92d6f55c99f14ed1120e68e0ec9c57abf298757f2fd82d012debd41a24f::model::create_model`,
                arguments: [
                  tx.pure.string(blobId),
                  tx.pure.string(file.name),
                  tx.pure.string(inputValue1),
                  tx.pure.string(inputValue),
                ],
              });
            
            // 执行签名并发送交易
            signAndExecuteTransaction({
              transaction: tx,
            });

            const res = await client.devInspectTransactionBlock({
              transactionBlock: tx,
              sender: account.address,
            });

            if (res.effects.status.status == "success") {
              console.log("Transaction successful");
            }
            console.log("Transaction result:", res);
          } catch (e) {
            console.error("Transaction error:", e);
          }
        }
      },
      error: function(xhr, status, error) {
        setResponseMessage('File upload failed: ' + error); // 失败时显示错误信息
      },
      complete: function() {
        setLoading(false); // 上传完成，关闭加载状态
      },
    });
  } else {
    console.log("没有选择文件进行上传"); // 当没有文件时，输出日志
  }
};

  

  // 关闭弹窗
  const handleClosePopup = () => {
    setLoading(false);
    setResponseMessage('');
  };

  return (
    <>
      <div className="flex-container">
        <div className="box box-1">
          <h1 style={{ padding: "20px 30px" }}>Upload </h1>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            {/* 文件选择按钮 */}
            <div style={{ marginLeft: "10px", flex: 1 }}>
              <input
                type="file"
                id="file-upload"
                onChange={handleFileChange} // 处理文件选择
                style={{ display: "none" }}
              />
              <label htmlFor="file-upload" className="button button-file">
                选择文件
              </label>
            </div>

            {/* 上传按钮 */}
            <div style={{ marginRight: "10px", flex: 1 }}>
              <button className="button button-upload" onClick={handleUploadClick}>
                {loading ? "上传中..." : "上传"} {/* 按钮文案根据 loading 状态变化 */}
              </button>
            </div>
          </div>

          {/* 显示已选择的文件 */}
          <div className="file-name" style={{ visibility: file ? "visible" : "hidden" }}>
            <p>{file ? file.name : ''}</p>
          </div>

          {/* 描述输入框 */}
          <div style={{ display: 'flex', marginLeft: '10px', alignItems: 'center' }}>
            <h1>描述:</h1>
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              placeholder="一个模型"
              className="input-text"
            />
          </div>

          {/* 存储周期输入框 */}
          <div style={{ display: 'flex', marginLeft: '10px', alignItems: 'center' }}>
            <h1>存储周期:</h1>
            <input
              type="text"
              value={inputValue1}
              onChange={handleInputChange1}
              className="input-number"
              placeholder="1"
            />
          </div>
        </div>

        {/* 将文件传递给 APP1 组件，传递 null 当没有文件时 */}
        <div className="box box-2">
          {/* 如果有文件，则传递给 APP1，否则传递 null */}
          <APP1 modelFile={file || null} />
        </div>
      </div>

      {/* 居中上传弹窗 */}
      {loading && (
        <div className="popup">
          <div className="popup-content">
            <button className="popup-close" onClick={handleClosePopup}>×</button>
            <h2>正在上传...</h2>
            <p>请稍候，上传完成后会显示结果。</p>
          </div>
        </div>
      )}

      {/* 显示返回消息 */}
      {responseMessage && (
        <div className="popup">
          <div className="popup-content">
            <button className="popup-close" onClick={handleClosePopup}>×</button>
            <h2>上传结果</h2>
            <p>{responseMessage}</p>
          </div>
        </div>
      )}
    </>
  );
}
