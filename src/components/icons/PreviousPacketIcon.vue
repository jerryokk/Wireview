<script setup>
import { useId } from "vue";

const gradients = Array.from({ length: 4 }, () => useId());
</script>
<template>
  <svg width="16" height="16" view-box="0 0 16 16">
    <defs>
      <linearGradient :id="gradients[0]">
        <stop
          offset="0"
          style="stop-color: #ffffff; stop-opacity: 0.15753424"
        />
        <stop offset="1" style="stop-color: #ffffff; stop-opacity: 0" />
      </linearGradient>
      <linearGradient :id="gradients[1]">
        <stop
          style="stop-color: #000000; stop-opacity: 0.15753424"
          offset="0"
        />
        <stop style="stop-color: #000000; stop-opacity: 0" offset="1" />
      </linearGradient>
      <linearGradient
        :xlink:href="'#' + gradients[0]"
        :id="gradients[2]"
        gradientUnits="userSpaceOnUse"
        x1="6"
        y1="5"
        x2="6"
        y2="8"
        gradientTransform="translate(4,-4)"
      />
      <linearGradient
        :xlink:href="'#' + gradients[1]"
        :id="gradients[3]"
        gradientUnits="userSpaceOnUse"
        x1="6"
        y1="11"
        x2="6"
        y2="8"
        gradientTransform="translate(4,0)"
      />
    </defs>
    <path
      style="
        fill: #ffffff;
        stroke: #888a85;
        stroke-width: 1;
        stroke-linecap: round;
        stroke-linejoin: round;
        stroke-miterlimit: 4;
        stroke-opacity: 1;
        stroke-dasharray: none;
      "
      d="m 7.6116279,3.2567 c 0.4712323,0.074 0.6290623,0.8236 0.677227,2.2678 0.00669,-2e-4 0.012619,0 0.019355,0 l 5.5726111,0 c 0.343025,0 0.619179,0.2022 0.619179,0.4537 l 0,4.082 c 0,0.2513 -0.276154,0.4535 -0.619179,0.4535 l -5.5726111,0 c -0.00669,0 -0.012668,10e-5 -0.019355,0 -0.1032296,3.0955 -0.6777991,2.7404 -3.8698688,0.3829 -3.89198088,-2.8745 -3.89198088,-2.8804 0,-5.7548 1.7027424,-1.2575 2.6538843,-1.9687 3.1926418,-1.8851 z"
    />
    <path
      transform="matrix(0,-0.27296167,0.22222222,0,3.8888889,15.6429)"
      d="M 28,14 C 17.607695,14 17.607695,14 22.803847,5.0000001 28,-4 28,-4 33.196152,4.9999999 38.392305,14 38.392305,14 28,14 z"
      style="fill: #60b60e; fill-opacity: 1; stroke: none"
    />
    <rect
      y="7"
      x="6"
      height="2"
      width="7"
      style="
        color: #000000;
        fill: #60b60e;
        display: inline;
        enable-background: accumulate;
        fill-opacity: 1;
      "
    />
    <path
      :fill="`url(#${gradients[3]})`"
      d="m 6,7 7,0 0,2 -7,0 z M 7,7.9999732 C 7,10.836674 7,10.836674 5,9.4183238 3,7.9999732 3,7.9999732 5,6.5816229 7,5.1632723 7,5.1632723 7,7.9999732 z"
    />
    <path
      transform="translate(0,4)"
      d="m 6,3 7,0 0,2 -7,0 z m 1,1 c 0,2.8367 0,2.8367 -2,1.4183 -2,-1.4183 -2,-1.4183 0,-2.8367 2,-1.4183 2,-1.4183 2,1.4184 z"
      :fill="`url(#${gradients[2]})`"
    />
  </svg>
</template>
