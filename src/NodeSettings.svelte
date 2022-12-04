<script lang="ts">
    import ColorInput from "./ColorInput.svelte";
    import type { NodeSettingsData } from "./scripts/types";

    // ================= VARIABLES =================
    export let settings: NodeSettingsData;
</script>

<div class="node-settings">
    <ColorInput bind:value={settings.color} />
</div>

<style>
    .node-settings {
        display: flex;
        align-items: center;
        justify-content: center;

        width: fit-content;
        height: 100%;

        padding-left: 1rem;
        padding-right: 1rem;
        padding-top: 0.5rem;
        padding-bottom: 0.5rem;

        background-color: white;
        border: 1px solid #ddd;
        border-radius: 0.35rem;
    }
</style>
