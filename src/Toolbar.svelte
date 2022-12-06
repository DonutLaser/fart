<script lang="ts">
    import { emit, Event } from "./scripts/event-bus";
    import ToolbarButton from "./ToolbarButton.svelte";

    // ================= VARIABLES =================
    let fileInput!: HTMLInputElement;

    // ================= FUNCTIONS =================
    function onSelectConnected(): void {
        emit(Event.SELECT_CONNECTED);
    }

    function onClearConnectionsClick(): void {
        emit(Event.CLEAR_CONNECTIONS);
    }

    function onSaveClick(): void {
        emit(Event.SAVE);
    }

    function onLoadClick(): void {
        fileInput.click();
    }

    function onFileLoaded(): void {
        emit(Event.LOAD, fileInput.files[0]);
    }
</script>

<div class="toolbar">
    <ToolbarButton name="Select all connected nodes" on:click={onSelectConnected} />
    <ToolbarButton name="Clear connections" on:click={onClearConnectionsClick} />
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
