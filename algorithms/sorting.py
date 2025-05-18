import random
# QuickSort algorithm with multiple pivot strategies and step recording for visualization
def quicksort(arr, pivot_method="last"):
    """
    QuickSort algorithm implementation with different pivot selection strategies.
    Args:
        arr: The array to sort
        pivot_method: The pivot selection method. Options:
            - "last": Last element as pivot (default)
            - "first": First element as pivot
            - "middle": Middle element as pivot
            - "random": Random element as pivot
            - "median": Median of first, middle, last elements
    Returns:
        steps: A list of steps for visualization
    """
    steps = []
    # Helper to choose pivot index based on method
    def choose_pivot(arr, low, high, method):
        if method == "first":
            return low
        elif method == "middle":
            return (low + high) 
        elif method == "random":
            return random.randint(low, high)
        elif method == "median":
            mid = (low + high) 
            if arr[low] > arr[mid]:
                if arr[mid] > arr[high]:
                    return mid
                elif arr[low] > arr[high]:
                    return high
                else:
                    return low
            else:
                if arr[low] > arr[high]:
                    return low
                elif arr[mid] > arr[high]:
                    return high
                else:
                    return mid
        else:
            return high
    # Partition the array and record steps for visualization
    def partition(arr, low, high, pivot_idx):
        pivot = arr[pivot_idx]
        arr[pivot_idx], arr[high] = arr[high], arr[pivot_idx]
        steps.append({
            "type": "pivot",
            "pivot": pivot_idx,
            "range": [low, high],
            "array": arr.copy()
        })
        i = low - 1
        steps.append({
            "type": "pointers",
            "i_pointer": i,
            "j_pointer": low,
            "range": [low, high],
            "array": arr.copy()
        })
        for j in range(low, high):
            steps.append({
                "type": "compare",
                "comparing": [j, high],
                "i_pointer": i,
                "j_pointer": j,
                "range": [low, high],
                "array": arr.copy()
            })
            if arr[j] <= pivot:
                i += 1
                arr[i], arr[j] = arr[j], arr[i]
                if i != j:
                    steps.append({
                        "type": "swap",
                        "swapping": [i, j],
                        "i_pointer": i,
                        "j_pointer": j,
                        "range": [low, high],
                        "array": arr.copy()
                    })
        arr[i + 1], arr[high] = arr[high], arr[i + 1]
        steps.append({
            "type": "swap",
            "swapping": [i + 1, high],
            "i_pointer": i,
            "j_pointer": high,
            "range": [low, high],
            "array": arr.copy()
        })
        steps.append({
            "type": "sorted",
            "sorted": [i + 1],
            "range": [low, high],
            "array": arr.copy()
        })
        return i + 1
    # Recursive quicksort with step recording
    def quicksort_recursive(arr, low, high):
        if low < high:
            steps.append({
                "type": "range",
                "range": [low, high],
                "array": arr.copy()
            })
            pivot_idx = choose_pivot(arr, low, high, pivot_method)
            pi = partition(arr, low, high, pivot_idx)
            quicksort_recursive(arr, low, pi - 1)
            quicksort_recursive(arr, pi + 1, high)
    quicksort_recursive(arr, 0, len(arr) - 1)
    steps.append({
        "type": "sorted",
        "sorted": list(range(len(arr))),
        "array": arr.copy()
    })
    return steps