<script lang="ts">
    import { Flowchart, MouseButton, NodeConnection, NodeData, NodeRef } from "./scripts/types";
    import Node from "./Node.svelte";
    import Connection from "./Connection.svelte";
    import Toolbar from "./Toolbar.svelte";
    import { onMount } from "svelte";
    import { Event, subscribe } from "./scripts/event-bus";
    import { getFlowchartJson, parseFlowchartJson } from "./services/app-service";
    import NodeSettings from "./NodeSettings.svelte";

    // ================= VARIABLES =================
    let nextId = 0;

    let nodes: NodeData[] = [];
    let selectedDataIndex: number = -1;
    let selectedNodeRef: NodeRef;
    let connections: NodeConnection[] = [];
    let isDraggingSelectedNode = false;

    // ================= SUBSCRIPTIONS =================
    const subscriptions: Function[] = [];
    onMount(() => {
        subscriptions.push(subscribe(Event.SAVE, onSave));
        subscriptions.push(subscribe(Event.LOAD, onLoad));
    });

    function onSave() {
        const chart = getFlowchartJson(nodes, connections);

        const downloadLink = document.createElement("a");
        downloadLink.href = window.URL.createObjectURL(new Blob([JSON.stringify(chart)], { type: "application/json" }));
        downloadLink.setAttribute("download", "Flowchart.json");
        document.body.appendChild(downloadLink);
        downloadLink.click();

        document.body.removeChild(downloadLink);
    }

    function onLoad(file: any) {
        const reader = new FileReader();
        reader.addEventListener("load", (event) => {
            const contents: Flowchart = JSON.parse(event.target.result as string);
            const res = parseFlowchartJson(contents);

            nodes = res.nodes;
            connections = res.connections;
        });

        reader.readAsText(file);
    }

    // ================= FUNCTIONS =================
    function onClick(event: MouseEvent): void {
        const target = event.target as HTMLDivElement;
        if (!target.classList.contains("app")) {
            return;
        }

        if (event.button === MouseButton.LEFT) {
            if (event.shiftKey) {
                nodes = [
                    ...nodes,
                    {
                        text: "",
                        position: { x: event.clientX, y: event.clientY },
                        id: nextId++,
                        settings: { color: "white" },
                    },
                ];
                if (event.ctrlKey) {
                    // Connect to the new node automatically
                    onNodeConnected(nodes.length - 1);
                }
            } else {
                if (isDraggingSelectedNode) {
                    isDraggingSelectedNode = false;
                } else {
                    // Cannot deselect node if it was just dragged, bad ux
                    deselectNode();
                }
            }
        }
    }

    function onKeyDown(event: KeyboardEvent): void {
        if (event.key === "Delete") {
            if (selectedDataIndex >= 0) {
                connections = connections.filter(
                    (conn) =>
                        conn.fromNodeId !== nodes[selectedDataIndex].id && conn.toNodeId !== nodes[selectedDataIndex].id
                );

                nodes.splice(selectedDataIndex, 1);
                nodes = nodes;

                selectedNodeRef = null;
                selectedDataIndex = -1;
            }
        }
    }

    function onMouseMove(event: MouseEvent): void {
        if (!isDraggingSelectedNode) {
            return;
        }

        nodes[selectedDataIndex].position.x += event.movementX;
        nodes[selectedDataIndex].position.y += event.movementY;
    }

    function onNodeSelected(ref: NodeRef, dataIndex: number): void {
        if (nodes[selectedDataIndex]?.id === nodes[dataIndex].id) {
            return;
        }

        deselectNode();

        selectedNodeRef = ref;
        selectedDataIndex = dataIndex;
    }

    function onNodeStartedDragging(): void {
        isDraggingSelectedNode = true;
    }

    function onNodeEndedDragging(): void {
        isDraggingSelectedNode = false;
    }

    function onNodeConnected(dataIndex: number): void {
        if (selectedDataIndex < 0) {
            return;
        }

        console.log(selectedDataIndex, dataIndex);

        connections = [...connections, { fromNodeId: nodes[selectedDataIndex].id, toNodeId: nodes[dataIndex].id }];
        console.log("nodes", JSON.stringify(nodes, null, 2));
    }

    function onNodeEdited(value: string): void {
        nodes[selectedDataIndex].text = value;
    }

    function deselectNode(): void {
        if (selectedNodeRef) {
            selectedNodeRef.deselect();
        }

        selectedNodeRef = null;
        selectedDataIndex = -1;
    }
</script>

<svelte:window on:keydown={onKeyDown} on:mousemove={onMouseMove} />

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="app" on:click={onClick}>
    <div class="node-settings-div">
        {#if selectedDataIndex >= 0}
            <NodeSettings bind:settings={nodes[selectedDataIndex].settings} />
        {/if}
        <!-- <NodeSettings settings={} /> -->
    </div>
    {#each nodes as node, index (node.id)}
        <Node
            xpos={node.position.x}
            ypos={node.position.y}
            settings={node.settings}
            bind:text={node.text}
            on:selected={(event) => {
                onNodeSelected(event.detail, index);
            }}
            on:started-dragging={onNodeStartedDragging}
            on:ended-dragging={onNodeEndedDragging}
            on:connected={() => {
                onNodeConnected(index);
            }}
            on:edited={(event) => {
                onNodeEdited(event.detail);
            }} />
    {/each}
    <svg>
        {#each connections as connection}
            <Connection
                from={nodes.find((n) => n.id === connection.fromNodeId).position}
                to={nodes.find((n) => n.id === connection.toNodeId).position} />
        {/each}
    </svg>
    <Toolbar />
</div>

<style>
    .app {
        position: relative;

        width: 100%;
        height: 100%;

        background-size: 100px 100px;
        background-position: 0 0, 0 0, -50px -50px, 50px 50px;
        background-image: linear-gradient(45deg, #eee 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #eee 75%), linear-gradient(45deg, transparent 75%, #eeee 75%),
            linear-gradient(45deg, #eee 25%, transparent 25%);
    }

    .node-settings-div {
        display: flex;
        column-gap: 0.75rem;
        align-items: center;
        justify-content: center;

        position: absolute;
        top: 0;

        width: 100%;
        height: 64px;

        padding-left: 1rem;
        padding-right: 1rem;
        padding-top: 0.5rem;
        padding-bottom: 0.5rem;
    }

    svg {
        width: 100%;
        height: 100%;

        pointer-events: none;
    }
</style>
