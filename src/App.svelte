<script lang="ts">
    import { Flowchart, MouseButton, NodeConnection, NodeData, NodeRef } from "./scripts/types";
    import Node from "./Node.svelte";
    import Connection from "./Connection.svelte";
    import Toolbar from "./Toolbar.svelte";
    import { onMount } from "svelte";
    import { Event, subscribe } from "./scripts/event-bus";
    import * as app from "./services/app-service";
    import NodeSettings from "./NodeSettings.svelte";

    // ================= VARIABLES =================
    let nodes: NodeData[] = [];
    let selectedDataIndices: number[] = [];
    let connections: NodeConnection[] = [];
    let isDraggingSelectedNode = false;

    // ================= SUBSCRIPTIONS =================
    const subscriptions: Function[] = [];
    onMount(() => {
        subscriptions.push(subscribe(Event.CLEAR_CONNECTIONS, onClearConnections));
        subscriptions.push(subscribe(Event.SAVE, onSave));
        subscriptions.push(subscribe(Event.LOAD, onLoad));
    });

    function onClearConnections() {
        for (const index of selectedDataIndices) {
            if (nodes[index].isLabel) {
                continue;
            }

            connections = connections.filter(
                (conn) => conn.fromNodeId !== nodes[index].id && conn.toNodeId !== nodes[index].id
            );
        }
    }

    function onSave(): void {
        const chart = app.getFlowchartJson(nodes, connections);

        const downloadLink = document.createElement("a");
        downloadLink.href = window.URL.createObjectURL(new Blob([JSON.stringify(chart)], { type: "application/json" }));
        downloadLink.setAttribute("download", "Flowchart.json");
        document.body.appendChild(downloadLink);
        downloadLink.click();

        document.body.removeChild(downloadLink);
    }

    function onLoad(file: any): void {
        const reader = new FileReader();
        reader.addEventListener("load", (event) => {
            const contents: Flowchart = JSON.parse(event.target.result as string);
            const res = app.parseFlowchartJson(contents);

            nodes = res.nodes;
            connections = res.connections;

            app.setInitialNodeId(Math.max(...nodes.map((n) => n.id)) + 1);
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
            if (event.shiftKey || event.altKey) {
                const color = event.altKey ? "black" : "white;";
                nodes = [...nodes, app.createNewNode({ x: event.clientX, y: event.clientY }, event.altKey, color)];

                if (event.ctrlKey && event.shiftKey) {
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
            for (const index of selectedDataIndices) {
                connections = connections.filter(
                    (conn) => conn.fromNodeId !== nodes[index].id && conn.toNodeId !== nodes[index].id
                );

                nodes.splice(index, 1);
                nodes = nodes;

                selectedDataIndices = [];
            }
        } else if (event.key === "D" && event.shiftKey) {
            if (selectedDataIndices.length === 1) {
                nodes = [...nodes, app.duplicateNode(nodes[selectedDataIndices[0]])];
            }
        }
    }

    function onMouseMove(event: MouseEvent): void {
        if (!isDraggingSelectedNode) {
            return;
        }

        for (const index of selectedDataIndices) {
            nodes[index].position.x += event.movementX;
            nodes[index].position.y += event.movementY;
        }
    }

    function onNodeSelected(append: boolean, dataIndex: number): void {
        let alreadySelected = false;
        for (const index of selectedDataIndices) {
            if (nodes[index].id === nodes[dataIndex].id) {
                alreadySelected = true;
            }
        }

        if (alreadySelected) {
            return;
        }

        if (append) {
            selectedDataIndices = [...selectedDataIndices, dataIndex];
        } else {
            deselectNode();
            selectedDataIndices = [dataIndex];
        }
    }

    function onNodeStartedDragging(): void {
        isDraggingSelectedNode = true;
    }

    function onNodeEndedDragging(): void {
        isDraggingSelectedNode = false;
    }

    function onNodeConnected(dataIndex: number): void {
        if (selectedDataIndices.length !== 1) {
            return;
        }

        const index1 = app.findConnectionIndex(connections, nodes[selectedDataIndices[0]].id, nodes[dataIndex].id);
        const index2 = app.findConnectionIndex(connections, nodes[dataIndex].id, nodes[selectedDataIndices[0]].id);
        if (index1 >= 0) {
            connections.splice(index1, 1);
            connections = connections;
        } else if (index2 >= 0) {
            connections.splice(index2, 1);
            connections = connections;
        } else {
            connections = [
                ...connections,
                { fromNodeId: nodes[selectedDataIndices[0]].id, toNodeId: nodes[dataIndex].id },
            ];
        }
    }

    function onNodeEdited(value: string, nodeIndex: number): void {
        nodes[nodeIndex].text = value;
    }

    function deselectNode(): void {
        selectedDataIndices = [];
    }
</script>

<svelte:window on:keydown={onKeyDown} on:mousemove={onMouseMove} />

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="app" on:click={onClick}>
    <div class="node-settings-div">
        {#if selectedDataIndices.length === 1}
            <NodeSettings bind:settings={nodes[selectedDataIndices[0]].settings} />
        {/if}
        <!-- <NodeSettings settings={} /> -->
    </div>
    {#each nodes as node, index (node.id)}
        <Node
            data={node}
            isSelected={selectedDataIndices.includes(index)}
            on:selected={(event) => {
                onNodeSelected(event.detail, index);
            }}
            on:started-dragging={onNodeStartedDragging}
            on:ended-dragging={onNodeEndedDragging}
            on:connected={() => {
                onNodeConnected(index);
            }}
            on:edited={(event) => {
                onNodeEdited(event.detail, index);
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
