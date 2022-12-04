<script lang="ts">
    import type { Point } from "./scripts/types";

    // ================= VARIABLES =================
    export let from: Point = { x: 0, y: 0 };
    export let to: Point = { x: 0, y: 0 };

    $: points = `${from.x},${from.y} ${to.x},${to.y}`;
</script>

<polyline class="connection" {points} />

<style>
    .connection {
        stroke: #888;
        stroke-width: 2px;
    }
</style>
