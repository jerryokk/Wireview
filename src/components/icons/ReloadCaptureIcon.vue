<script setup>
import { useId } from "vue";

const markerId = useId();
</script>
<template>
  <svg view-box="0 0 16 16" width="16px" height="16px">
    <defs>
      <marker
        orient="auto"
        refY="0"
        refX="0"
        :id="markerId"
        style="overflow: visible"
      >
        <path
          d="m 5.77,0 -8.65,5 0,-10 8.65,5 z"
          style="
            fill: #204a87;
            fill-rule: evenodd;
            stroke: #204a87;
            stroke-width: 1pt;
            marker-start: none;
          "
          transform="scale(-0.2,-0.2)"
        />
      </marker>
    </defs>
    <image
      y="0"
      x="0"
      xlink:href="../../assets/WiresharkDoc-16.png"
      height="16"
      width="16"
    />
    <path
      style="
        fill: none;
        stroke: #888a85;
        stroke-width: 1px;
        stroke-linecap: butt;
        stroke-linejoin: miter;
        stroke-opacity: 1;
      "
      d="m 1.5,0.5 0,15 13,0 0,-11 -4,-4 z"
    />
    <path
      transform="matrix(0.82031745,0,0,0.82661548,-24.72381,0.6935)"
      d="M 44.767801,8.8390093 A 4.8761611,4.8390093 0 1 1 39.89164,4"
      style="
        fill: none;
        stroke: #204a87;
        stroke-width: 2.42877483;
        stroke-linecap: butt;
        stroke-miterlimit: 4;
        stroke-opacity: 1;
        stroke-dasharray: none;
        marker-start: none;
        marker-mid: none;
      "
      :style="{
        'marker-end': `url(#${markerId})`,
      }"
    />
  </svg>
</template>
