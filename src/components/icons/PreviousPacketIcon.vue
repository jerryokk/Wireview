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
        y1="5"
        y2="8"
        gradientTransform="translate(4 1032.4)"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0" stop-color="#fff" stop-opacity=".158" />
        <stop offset="1" stop-color="#fff" stop-opacity="0" />
      </linearGradient>
      <linearGradient
        :id="ids[1]"
        x1="6"
        x2="6"
        y1="11"
        y2="8"
        gradientTransform="translate(4)"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0" stop-opacity=".158" />
        <stop offset="1" stop-opacity="0" />
      </linearGradient>
    </defs>
    <path
      fill="#fff"
      stroke="#888a85"
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M7.612 3.2c.47.074.629.824.677 2.268h5.592c.343 0 .619.202.619.453v4.082c0 .252-.276.454-.62.454H8.289c-.102 3.095-.677 2.74-3.87.383-3.891-2.875-3.891-2.88 0-5.755C6.123 3.828 7.074 3.116 7.613 3.2z"
    />
    <path
      fill="#4e9a06"
      stroke="#2a5703"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2.108"
      d="M28 14c-10.392 0-10.392 0-5.196-9S28-4 33.196 5s5.196 9-5.196 9z"
      transform="matrix(.63885 0 0 .35209 5.112 6)"
    />
    <g fill="#60b60e">
      <path
        d="M7 7.957c0 2.837 0 2.837-2 1.418C3 7.957 3 7.957 5 6.54S7 5.12 7 7.957z"
      />
      <path d="M6 7h7v2H6z" color="#000" />
    </g>
    <path
      :fill="`url(#${ids[1]})`"
      d="M6 7h7v2H6zm1 1c0 2.837 0 2.837-2 1.418C3 8 3 8 5 6.582 7 5.163 7 5.163 7 8z"
      color="#000"
    />
    <path
      :fill="`url(#${ids[0]})`"
      d="M6 1039.4h7v2H6zm1 1c0 2.837 0 2.837-2 1.418-2-1.418-2-1.418 0-2.836 2-1.419 2-1.419 2 1.418z"
      color="#000"
      transform="translate(0 -1032.4)"
    />
  </svg>
</template>
