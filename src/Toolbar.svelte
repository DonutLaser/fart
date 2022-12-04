<script lang="ts">
    import { emit, Event } from "./scripts/event-bus";
    import ToolbarButton from "./ToolbarButton.svelte";

    // ================= VARIABLES =================
    let fileInput!: HTMLInputElement;

    // ================= FUNCTIONS =================
    function onSaveClick() {
        emit(Event.SAVE);
    }

    function onLoadClick() {
        fileInput.click();
        // emit(Event.LOAD);
    }

    function onFileLoaded() {
        emit(Event.LOAD, fileInput.files[0]);
    }
</script>

<div class="toolbar">
    <ToolbarButton name="Save" on:click={onSaveClick} />
    <ToolbarButton name="Load" on:click={onLoadClick} />
    <input bind:this={fileInput} style="display: none;" type="file" accept=".json" on:change={onFileLoaded} />
</div>

<style>
    .toolbar {
        display: flex;
        column-gap: 0.75rem;
        align-items: center;
        justify-content: center;

        position: absolute;
        bottom: 0;

        width: 100%;
        height: 64px;
    }
</style>
