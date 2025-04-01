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
        gradientTransform="matrix(-1 0 0 1 12 0)"
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
        gradientTransform="matrix(-1 0 0 1 12 1032.4)"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0" stop-color="#fff" stop-opacity=".158" />
        <stop offset="1" stop-color="#fff" stop-opacity="0" />
      </linearGradient>
    </defs>
    <path
      fill="#fff"
      stroke="#888a85"
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M8.388 3.2c-.47.074-.629.824-.677 2.268H2.12c-.343 0-.619.202-.619.453v4.082c0 .252.276.454.62.454h5.592c.102 3.095.677 2.74 3.87.383 3.891-2.875 3.891-2.88 0-5.755C9.877 3.828 8.926 3.116 8.387 3.2z"
    />
    <g fill="#60b60e">
      <path
        d="M9 7.957c0 2.837 0 2.837 2 1.418 2-1.418 2-1.418 0-2.836S9 5.12 9 7.957z"
      />
      <path d="M10 7H3v2h7z" color="#000" />
    </g>
    <path
      :fill="`url(#${ids[0]})`"
      d="M6 7h7v2H6zm1 1c0 2.837 0 2.837-2 1.418C3 8 3 8 5 6.582 7 5.163 7 5.163 7 8z"
      color="#000"
      transform="matrix(-1 0 0 1 16 0)"
    />
    <path
      :fill="`url(#${ids[1]})`"
      d="M6 1039.4h7v2H6zm1 1c0 2.837 0 2.837-2 1.418-2-1.418-2-1.418 0-2.836 2-1.419 2-1.419 2 1.418z"
      color="#000"
      transform="matrix(-1 0 0 1 16 -1032.4)"
    />
  </svg>
</template>
