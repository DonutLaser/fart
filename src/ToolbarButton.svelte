<script lang="ts">
    // ================= VARIABLES =================
    export let name = "";
</script>

<button class="toolbar-button" on:click>{name}</button>

<style>
    .toolbar-button {
        padding-left: 1rem;
        padding-right: 1rem;
        padding-top: 0.5rem;
        padding-bottom: 0.5rem;

        background-color: white;
        border: 1px solid #ddd;
        border-radius: 0.35rem;
    }

    .toolbar-button:hover {
        background-color: #f8f8f8;
        box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.1);

        cursor: pointer;
    }

    .toolbar-button:active {
        background-color: #f5f5f5;
        box-shadow: 0px 0px 4px 0px rgba(0, 0, 0, 0.1);
    }
</style>
