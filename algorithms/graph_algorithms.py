# Graph algorithms for visualization: DFS, BFS, Dijkstra
# Each function returns a list of steps for visualization

def dfs(graph, start_node):
    """
    Depth-First Search algorithm implementation.
    Returns steps of the algorithm for visualization.
    """
    nodes = graph["nodes"]
    links = graph["links"]
    start_node = int(start_node) if not isinstance(start_node, int) else start_node
    node_ids = [node["id"] for node in nodes]
    if start_node not in node_ids:
        return []
    # Build adjacency list
    adj_list = {node["id"]: [] for node in nodes}
    for link in links:
        source = link["source"]
        target = link["target"]
        weight = link.get("weight", 1)
        if isinstance(source, dict):
            source = source["id"]
        if isinstance(target, dict):
            target = target["id"]
        adj_list[source].append({"target": target, "weight": weight})
        adj_list[target].append({"target": source, "weight": weight})
    visited = set()
    stack = [start_node]
    path = []
    steps = []
    def dfs_recursive(node):
        visited.add(node)
        path.append(node)
        steps.append({
            "type": "visit",
            "node": node,
            "action": f"Visiting node {node}",
            "reason": f"DFS explores this node as it's either the start node or an unvisited neighbor of the current node."
        })
        for neighbor in adj_list[node]:
            target = neighbor["target"]
            if target not in visited:
                steps.append({
                    "type": "explore",
                    "from": node,
                    "to": target,
                    "action": f"Exploring edge from {node} to {target}",
                    "reason": f"DFS checks each unvisited neighbor of the current node."
                })
                dfs_recursive(target)
        steps.append({
            "type": "complete",
            "node": node,
            "action": f"Completed exploration of node {node}",
            "reason": f"All neighbors of this node have been visited."
        })
        if node != path[-1]:
            current_index = path.index(node)
            if current_index < len(path) - 1:
                next_node = path[current_index + 1]
                steps.append({
                    "type": "backtrack",
                    "from": node,
                    "to": next_node,
                    "action": f"Backtracking from {node} to {next_node}",
                    "reason": f"DFS backtracks when all neighbors of a node have been explored."
                })
    dfs_recursive(start_node)
    return steps

def bfs(graph, start_node):
    """
    Breadth-First Search algorithm implementation.
    Returns steps of the algorithm for visualization.
    """
    from collections import deque
    nodes = graph["nodes"]
    links = graph["links"]
    start_node = int(start_node) if not isinstance(start_node, int) else start_node
    node_ids = [node["id"] for node in nodes]
    if start_node not in node_ids:
        return []
    # Build adjacency list
    adj_list = {node["id"]: [] for node in nodes}
    for link in links:
        source = link["source"]
        target = link["target"]
        weight = link.get("weight", 1)
        if isinstance(source, dict):
            source = source["id"]
        if isinstance(target, dict):
            target = target["id"]
        adj_list[source].append({"target": target, "weight": weight})
        adj_list[target].append({"target": source, "weight": weight})
    visited = set()
    queue = deque([start_node])
    visited.add(start_node)
    steps = []
    steps.append({
        "type": "visit",
        "node": start_node,
        "action": f"Starting BFS from node {start_node}",
        "reason": f"BFS begins by visiting the start node and adding it to the queue."
    })
    while queue:
        current = queue.popleft()
        for neighbor in adj_list[current]:
            target = neighbor["target"]
            if target not in visited:
                visited.add(target)
                queue.append(target)
                steps.append({
                    "type": "explore",
                    "from": current,
                    "to": target,
                    "action": f"Exploring edge from {current} to {target}",
                    "reason": f"BFS explores all edges from the current node to unvisited neighbors."
                })
                steps.append({
                    "type": "visit",
                    "node": target,
                    "action": f"Visiting node {target}",
                    "reason": f"BFS visits this node as it's an unvisited neighbor at the current level."
                })
        steps.append({
            "type": "complete",
            "node": current,
            "action": f"Completed exploration of node {current}",
            "reason": f"All neighbors of this node have been discovered and added to the queue."
        })
    return steps

def dijkstra(graph, start_node):
    """
    Dijkstra's algorithm implementation.
    Returns steps of the algorithm for visualization.
    """
    import heapq
    nodes = graph["nodes"]
    links = graph["links"]
    start_node = int(start_node) if not isinstance(start_node, int) else start_node
    node_ids = [node["id"] for node in nodes]
    if start_node not in node_ids:
        return []
    # Build adjacency list
    adj_list = {node["id"]: [] for node in nodes}
    for link in links:
        source = link["source"]
        target = link["target"]
        weight = link.get("weight", 1)
        if isinstance(source, dict):
            source = source["id"]
        if isinstance(target, dict):
            target = target["id"]
        adj_list[source].append({"target": target, "weight": weight})
        adj_list[target].append({"target": source, "weight": weight})
    distances = {node["id"]: float('infinity') for node in nodes}
    distances[start_node] = 0
    previous = {node["id"]: None for node in nodes}
    pq = [(0, start_node)]
    visited = set()
    steps = []
    steps.append({
        "type": "distance",
        "node": start_node,
        "distance": 0,
        "action": f"Setting initial distance of start node {start_node} to 0",
        "reason": f"Dijkstra's algorithm initializes the distance to the start node as 0."
    })
    while pq:
        current_distance, current_node = heapq.heappop(pq)
        if current_node in visited:
            continue
        visited.add(current_node)
        steps.append({
            "type": "visit",
            "node": current_node,
            "action": f"Visiting node {current_node} with distance {current_distance}",
            "reason": f"Dijkstra's algorithm selects the unvisited node with the smallest known distance."
        })
        for neighbor in adj_list[current_node]:
            target = neighbor["target"]
            weight = neighbor["weight"]
            if target in visited:
                continue
            old_distance = distances[target]
            new_distance = distances[current_node] + weight
            success = new_distance < old_distance
            steps.append({
                "type": "relax",
                "from": current_node,
                "to": target,
                "success": success,
                "newDistance": new_distance if success else old_distance,
                "action": f"Trying to relax edge from {current_node} to {target} (weight: {weight})",
                "reason": f"Checking if path through {current_node} provides a shorter distance to {target}."
            })
            if success:
                distances[target] = new_distance
                previous[target] = current_node
                heapq.heappush(pq, (new_distance, target))
                steps.append({
                    "type": "distance",
                    "node": target,
                    "distance": new_distance,
                    "action": f"Updated distance to node {target} to {new_distance}",
                    "reason": f"Found shorter path to {target} through node {current_node}."
                })
        steps.append({
            "type": "complete",
            "node": current_node,
            "action": f"Completed processing of node {current_node}",
            "reason": f"All edges from this node have been considered for relaxation."
        })
    final_paths = []
    for node in nodes:
        node_id = node["id"]
        if node_id != start_node and previous[node_id] is not None:
            path = []
            current = node_id
            while current is not None:
                if previous[current] is not None:
                    path.append((previous[current], current))
                current = previous[current]
            final_paths.extend(path)
    if final_paths:
        steps.append({
            "type": "path",
            "edges": list(set(final_paths)),
            "action": f"Final shortest paths from node {start_node}",
            "reason": f"The algorithm has found the shortest path from the start node to all reachable nodes."
        })
    return steps