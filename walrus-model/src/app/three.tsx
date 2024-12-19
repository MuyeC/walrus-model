import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { useEffect, useRef } from "react";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

interface ModelViewerProps {
  modelFile: File | string | null; // 可以是文件对象或文件路径
}

export default function ModelViewer({ modelFile }: ModelViewerProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const frameId = useRef<number | null>(null);
  const gltfSceneRef = useRef<THREE.Group | null>(null); // 用于保存加载的 GLTF 模型场景

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.set(0.7256215264804704, 4.519021875192757, 2);

    // 初始化渲染器
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth * 0.66, window.innerHeight * 0.78);

    // 设置 OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 1.45, 0);

    // 添加环境光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    // 添加点光源
    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    // 加载 GLTF 模型
    const loadModel = (file: File | string) => {
      const loader = new GLTFLoader();

      if (typeof file === "string") {
        // 如果是文件路径，则加载该路径的文件
        loader.load(
          file,
          (gltf) => {
            console.log("Model Loaded from URL");
            scene.add(gltf.scene); // 添加加载的场景到空场景中
            gltfSceneRef.current = gltf.scene; // 保存加载的场景
          },
          undefined,
          (error) => {
            console.error(error);
          }
        );
      } else {
        // 如果是文件对象，则使用 FileReader 读取文件
        const reader = new FileReader();
        reader.onload = (e) => {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          loader.parse(arrayBuffer, "", (gltf) => {
            console.log("Model Loaded from File");
            scene.add(gltf.scene); // 添加加载的场景到空场景中
            gltfSceneRef.current = gltf.scene; // 保存加载的场景
          });
        };
        reader.readAsArrayBuffer(file);
      }
    };

    // 如果没有传入 modelFile，则加载默认的 ./mod.glb 文件
    const modelToLoad = modelFile || './mod.glb'; // 默认加载 ./mod.glb

    // 加载模型
    loadModel(modelToLoad);

    // 渲染和动画
    const animate = () => {
      frameId.current = requestAnimationFrame(animate);
      renderer.render(scene, camera);
      controls.update(); // 更新 OrbitControls
    };

    // 开始动画
    animate();

    // 将渲染器的 DOM 元素添加到 ref 的容器中
    if (mountRef.current) {
      mountRef.current.appendChild(renderer.domElement);
    }

    // 清理函数
    return () => {
      // 清理加载的模型（如果有）
      if (gltfSceneRef.current) {
        scene.remove(gltfSceneRef.current);
      }

      // 移除渲染器的 DOM 元素
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }

      // 取消动画帧
      if (frameId.current) {
        cancelAnimationFrame(frameId.current);
      }

      // 清理渲染器、控制器和其他资源
      renderer.dispose();
      controls.dispose();
    };
  }, [modelFile]); // 依赖 modelFile 变化，加载新模型

  return <div ref={mountRef} />; // 渲染 Three.js 场景
}
