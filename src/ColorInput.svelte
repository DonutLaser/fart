<script lang="ts">
    // ================= VARIABLES =================
    export let value = "";

    let input!: HTMLInputElement;

    // ================= FUNCTIONS =================
    function onClick(): void {
        input.click();
    }

    function onColorInput(): void {
        value = input.value;
    }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="color-input" style="background-color: {value}" on:click={onClick}>
    <input bind:this={input} type="color" on:input={onColorInput} />
</div>

<style>
    .color-input {
        width: 64px;
        height: 32px;

        border: 1px solid #ddd;
        border-radius: 0.35rem;
    }

    .color-input:hover {
        cursor: pointer;
    }

    .color-input:active {
        box-shadow: 0px 0px 4px 0px rgba(0, 0, 0, 0.1);
    }

    input {
        visibility: hidden;
        width: 100%;
        height: 100%;
    }
</style>
