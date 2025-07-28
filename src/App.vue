<script setup>
import { onBeforeUnmount, onMounted } from "vue";
import IconRibbon from "./components/IconRibbon.vue";
import DisplayFilter from "./components/DisplayFilter.vue";
import DefaultLayout from "./components/layouts/DefaultLayout.vue";
import PacketList from "./components/panes/PacketList.vue";
import PacketBytes from "./components/panes/PacketBytes.vue";
import PacketDetails from "./components/panes/PacketDetails.vue";
import StatusBar from "./components/StatusBar.vue";
import { manager } from "./globals";
import Welcome from "./components/Welcome.vue";
import FindFrameBar from "./components/FindFrameBar.vue";

// 设置跨域通信
const setupPostMessageListener = () => {
  // 检查是否有等待参数，表示需要等待文件传输
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('waiting') === 'true') {
    // 通知父页面我们已准备好接收文件
    console.log("Sending ready message to opener");
    
    // 确保父窗口存在
    if (window.opener) {
      // 告诉父窗口我们已准备好接收数据
      window.opener.postMessage('ready', '*');
      
      // 监听来自父窗口的消息
      window.addEventListener('message', async (event) => {
        console.log("Received message", event.origin);
        
        // 处理文件数据消息
        if (event.data && event.data.type === 'fileData') {
          console.log(`Received file: ${event.data.name}`);
          
          try {
            // 将数据URL转换为File对象
            const response = await fetch(event.data.data);
            const blob = await response.blob();
            const file = new File(
              [blob], 
              event.data.name, 
              { type: event.data.fileType || 'application/octet-stream' }
            );
            
            // 打开文件
            manager.openFile(file);
            
            // 通知父窗口文件已成功打开
            window.opener.postMessage({
              type: 'fileOpened',
              name: event.data.name
            }, '*');
            
            // 移除URL中的waiting参数
            if (window.history && window.history.replaceState) {
              const url = new URL(window.location);
              url.searchParams.delete('waiting');
              window.history.replaceState({}, document.title, url);
            }
          } catch (error) {
            console.error("Error opening file:", error);
            
            // 通知父窗口出现错误
            window.opener.postMessage({
              type: 'error',
              message: `Error opening file: ${error.message}`
            }, '*');
          }
        }
      });
    }
  }
};

onMounted(() => {
  manager.initialize();
  
  // 等待初始化完成后设置跨域通信
  setTimeout(() => {
    setupPostMessageListener();
  }, 1000);
});

onBeforeUnmount(() => {
  manager.deinitialize();
});
</script>

<template>
  <IconRibbon />
  <DisplayFilter />
  <Welcome v-if="manager.sessionInfo === null" />
  <template v-else>
    <FindFrameBar v-show="!manager.findFrameBarHidden" />
    <DefaultLayout
      :style="{
        '--ws-row-height': manager.rowHeight + 'px',
        '--ws-font-size-monospace': manager.fontSize + 'px',
      }"
    >
      <template #slot1>
        <PacketList />
      </template>
      <template #slot2>
        <PacketDetails />
      </template>
      <template #slot3>
        <PacketBytes />
      </template>
    </DefaultLayout>
  </template>
  <StatusBar />
</template>
