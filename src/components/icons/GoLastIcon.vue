<script setup>
import { useId } from "vue";

const ids = Array.from({ length: 2 }, () => useId());
</script>
<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 16 16"
    width="16"
    height="16"
  >
    <defs>
      <linearGradient
        :id="ids[0]"
        x1="6"
        x2="6"
        y1="11"
        y2="8"
        gradientTransform="matrix(0 -1 -1 0 16 12)"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0" stop-opacity=".158" />
        <stop offset="1" stop-opacity="0" />
      </linearGradient>
      <linearGradient
        :id="ids[1]"
        x1="6"
        x2="6"
        y1="5"
        y2="8"
        gradientTransform="matrix(0 -1 -1 0 16 1044.4)"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0" stop-color="#fff" stop-opacity=".158" />
        <stop offset="1" stop-color="#fff" stop-opacity="0" />
      </linearGradient>
    </defs>
    <path
      fill="#4e9a06"
      stroke="#2a5703"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="1.083"
      d="M28 14c-10.392 0-10.392 0-5.196-9S28-4 33.196 5s5.196 9-5.196 9z"
      transform="matrix(1.2196 0 0 .69841 11.851 -2.3)"
    />
    <path fill="#555753" d="M1 16h14v-1H1z" color="#000" />
    <path
      fill="#fff"
      stroke="#888a85"
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M12.8 8.388c-.074-.47-.824-.629-2.268-.677V2.12c0-.343-.202-.619-.453-.619H5.997c-.252 0-.454.276-.454.62v5.592c-3.095.102-2.74.677-.383 3.87 2.875 3.891 2.88 3.891 5.755 0 1.257-1.704 1.969-2.655 1.885-3.194z"
    />
    <g fill="#60b60e">
      <path
        d="M8.043 9c-2.837 0-2.837 0-1.418 2 1.418 2 1.418 2 2.836 0s1.418-2-1.418-2z"
      />
      <path d="M9 10V3H7v7z" color="#000" />
    </g>
    <path
      :fill="`url(#${ids[0]})`"
      d="M6 7h7v2H6zm1 1c0 2.837 0 2.837-2 1.418C3 8 3 8 5 6.582 7 5.163 7 5.163 7 8z"
      color="#000"
      transform="matrix(0 -1 -1 0 16 16)"
    />
    <path
      :fill="`url(#${ids[1]})`"
      d="M6 1039.4h7v2H6zm1 1c0 2.837 0 2.837-2 1.418-2-1.418-2-1.418 0-2.836 2-1.419 2-1.419 2 1.418z"
      color="#000"
      transform="matrix(0 -1 -1 0 1048.4 16)"
    />
  </svg>
</template>
