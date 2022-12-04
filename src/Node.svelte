<script lang="ts">
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();

    import { onMount } from "svelte";
    import { MouseButton, NodeSettingsData } from "./scripts/types";

    // ================= VARIABLES =================
    export let xpos = 0;
    export let ypos = 0;
    export let text = "";
    export let settings: NodeSettingsData;

    let div!: HTMLDivElement;

    let isSelected = false;
    let isEditing = false;
    let lastValue = "";

    $: position = { x: xpos - 82, y: ypos - 15.5 };

    // ================= SETUP =================
    onMount(() => {
        select();
        startEditing();
    });

    // ================= FUNCTIONS =================
    function onMouseDown(event: MouseEvent): void {
        if (event.button === MouseButton.LEFT) {
            if (!event.ctrlKey) {
                select();
                dispatch("started-dragging");
            }
        }
    }

    function onMouseUp(event: MouseEvent): void {
        if (event.button === MouseButton.LEFT) {
            if (event.ctrlKey) {
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

    function select(): void {
        isSelected = true;
        dispatch("selected", { deselect });
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
    style="left: {position.x}px; top: {position.y}px; background-color: {settings.color};"
    class="node"
    class:selected={isSelected}
    contenteditable={isEditing}
    on:mousedown={onMouseDown}
    on:mouseup={onMouseUp}
    on:dblclick={onDoubleClick}
    on:keydown={onKeyDown}
    on:blur={onBlur}>
    {text}
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

    .node:hover {
        cursor: pointer;
    }

    .node:focus {
        outline: none;
    }

    .node.selected {
        box-shadow: 0px 0px 10px 3px rgba(33, 106, 251, 0.25);
        border: 1px solid rgb(33, 106, 251);
    }
</style>
