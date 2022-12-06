<script lang="ts">
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();

    import { onMount } from "svelte";
    import { MouseButton, NodeData } from "./scripts/types";

    // ================= VARIABLES =================
    export let data: NodeData;

    let div!: HTMLDivElement;

    let isSelected = false;
    let isEditing = false;
    let lastValue = "";

    $: position = { x: data.position.x - 82, y: data.position.y - 15.5 };
    $: colorStyle = data.isLabel ? `color: ${data.settings.color};` : `background-color: ${data.settings.color};`;

    // ================= SETUP =================
    onMount(() => {
        select(false);
        startEditing();
    });

    // ================= FUNCTIONS =================
    function onMouseDown(event: MouseEvent): void {
        if (event.button === MouseButton.LEFT) {
            if (!event.ctrlKey) {
                select(event.shiftKey);
                dispatch("started-dragging");
            }
        }
    }

    function onMouseUp(event: MouseEvent): void {
        if (event.button === MouseButton.LEFT) {
            if (event.ctrlKey && !data.isLabel) {
                dispatch("connected");
            }

            dispatch("ended-dragging");
        }
    }

    function onDoubleClick(): void {
        startEditing();
    }

    function onKeyDown(event: KeyboardEvent): void {
        event.stopPropagation();

        if (event.key === "Enter") {
            div.blur();
        } else if (event.key === "Escape") {
            div.textContent = lastValue;
            div.blur();
        }
    }

    function onBlur(): void {
        stopEditing();
    }

    function select(append: boolean): void {
        isSelected = true;
        dispatch("selected", { ref: { deselect }, append });
    }

    export function deselect(): void {
        isSelected = false;
        isEditing = false;
    }

    function startEditing(): void {
        isEditing = true;
        lastValue = div.textContent;

        setTimeout(() => {
            div.focus();
        }, 0);
    }

    function stopEditing(): void {
        isEditing = false;
        dispatch("edited", div.textContent);
    }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
    bind:this={div}
    style="left: {position.x}px; top: {position.y}px; {colorStyle}"
    class="node"
    class:label={data.isLabel}
    class:selected={isSelected}
    contenteditable={isEditing}
    on:mousedown={onMouseDown}
    on:mouseup={onMouseUp}
    on:dblclick={onDoubleClick}
    on:keydown={onKeyDown}
    on:blur={onBlur}>
    {data.text}
</div>

<style>
    .node {
        display: flex;
        align-items: center;
        justify-content: center;

        position: absolute;

        min-width: 164px;
        min-height: 32px;
        max-width: 460px;
        height: fit-content;

        padding: 0.5rem;

        border: 1px solid #888;
        border-radius: 0.2rem;
        box-shadow: 0px 0px 10px 3px rgba(0, 0, 0, 0.2);

        word-break: break-word;
        user-select: none;
        z-index: 1;
    }

    .node.label {
        border: 1px solid transparent; /* Trick to make sure text does not jump 1 pixel when border is gone */
        box-shadow: none;

        background-color: transparent !important;
    }

    .node:hover {
        cursor: pointer;
    }

    .node:focus {
        outline: none;
    }

    .node:not(.label).selected {
        box-shadow: 0px 0px 10px 3px rgba(33, 106, 251, 0.25);
        border: 1px solid rgb(33, 106, 251);
    }

    .node.label.selected {
        border: 1px solid rgb(33, 106, 251);
    }
</style>
