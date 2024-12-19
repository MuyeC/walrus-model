"use client";
import $ from "jquery";
import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import React, { useState, useEffect } from 'react';
import { useAccounts, useSuiClientQuery } from "@mysten/dapp-kit";

const C = () => {
  // 状态管理：存储输入的 Blob ID 和下载状态
  const [blobId, setBlobId] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [account] = useAccounts();
  const [ownedObjects, setOwnedObjects] = useState<any[]>([]);

  useEffect(() => {
    // 获取用户拥有的对象
    const fetchOwnedObjects = async () => {
      if (!account) return; // 确保账户已加载

      setStatus('正在获取对象数据...');

      const client = new SuiClient({
        url: getFullnodeUrl('testnet'),
      });

      try {
        const object_list = await client.getOwnedObjects({
          owner: account.address,
          filter: {
            StructType: `0xa8e5a92d6f55c99f14ed1120e68e0ec9c57abf298757f2fd82d012debd41a24f::model::Modelibrary`,
          },
        });
        setOwnedObjects(object_list.data);
        setStatus('对象数据获取成功');
      } catch (error) {
        console.error('获取对象失败:', error);
        setStatus('获取对象失败');
      }
    };

    fetchOwnedObjects();
  }, [account]);

  // 处理输入框的变化
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setBlobId(event.target.value);
  };

  // 处理下载逻辑
  const handleDownload = () => {
    if (!blobId) {
      setStatus('请输入一个有效的 Blob ID');
      return;
    }

    setStatus('下载中...');

    const AGGREGATOR = 'https://aggregator.walrus-testnet.walrus.space';
    const url = `${AGGREGATOR}/v1/${blobId}`;

    // 使用 jQuery 发起 GET 请求并下载文件
    $.ajax({
      url: url,
      method: 'GET',
      xhrFields: {
        responseType: 'blob',
      },
      success: (data: Blob) => {
        const link = document.createElement('a');
        const blob = new Blob([data], { type: 'application/octet-stream' });
        const url = window.URL.createObjectURL(blob);
        link.href = url;
        link.download = `${blobId}.file`;
        link.click();
        window.URL.revokeObjectURL(url);
        setStatus('下载成功！');
      },
      error: (error) => {
        console.error('下载错误:', error);
        setStatus('下载失败，请检查 Blob ID 或网络连接');
      },
    });
  };

  // 新的按钮事件处理函数，打印日志1
  const handlePrintLog = async () => {
    if (ownedObjects.length == 0) {
      setStatus('没有找到任何对象');
      return;
    }

    setStatus('正在打印日志...');
    console.log(ownedObjects)

    for (const item of ownedObjects) {
      const whiteListObjectId = item?.data?.objectId; // 取出 objectId
      console.log(whiteListObjectId);

      const { data, isPending, isError, error, refetch } = useSuiClientQuery(
        'getOwnedObjects',
        { owner: '0x123' },
        {
          gcTime: 10000,
        },
      );
      console.log(data)
    }
  };

  return (
    <div>
      <h1>文件下载</h1>
      <input
        type="text"
        value={blobId}
        onChange={handleInputChange}
        placeholder="请输入 Blob ID"
      />
      <button onClick={handleDownload}>下载文件</button>
      <button onClick={handlePrintLog}>打印日志1</button>
      <p>{status}</p>

      {/* 显示查询结果 */}
      {ownedObjects.length > 0 && (
        <div>
          <h2>拥有的对象:</h2>
          <pre>{JSON.stringify(ownedObjects, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default C;
