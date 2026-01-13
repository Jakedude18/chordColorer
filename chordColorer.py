#Author: Jake Kerrigan

from collections import deque

pulses = 12 # 12 notes in the chromatic scale
'''
NoteCount is the total number of notes in the final colored chord 
Will be equal to baseChord + # of color tones
Normal Interval is equal to pulses (12) / note count and is 
used to calcualte inscribed normal polygon
Memo is the memorization table used to avoid duplicate computations 
in the DP approach by colorChord
'''
global noteCount
global normalInterval
memo = dict()


""" 
Inputs - baseChord: list of notes which must be included in the final coloring
m: more or set of notes to chose coloring from
n: total number of notes in the colored chord - must be larger than len(baseChord)
Returns - Final coloring of n notes using the base coloring 
Description: Helper for chordColorer 
"""
def chordColorerHelper(baseChord, m, n):

    if (len(baseChord) > n): raise ValueError("n must be larger than len(baseChord)")

    #queue to support fifo; useful in recursion
    normalVertices = deque()
    global normalInterval
    global mode
    global noteCount
    noteCount = n
    mode = m
    normalInterval = pulses / noteCount

    for i in range(int(pulses / normalInterval)):
        normalVertices.append(i * normalInterval)
    
    base = deque(baseChord)

    coloring = colorChord(normalVertices, base, list())
    return coloring, chordEveness(coloring)



""" 
Inputs - vertices: vertices of the enscribed normal n-gon,
Used to guide coloring by assigned each one to a note from basechord + mode
base: list of notes which must be included in the final coloring
coloring: current coloring of base chord  
-- invariant: len(coloring) + len(vertices) = n --
Returns - Final coloring of n notes using the base coloring 
Description: dynmaically and recurisevly assign maxinmally even coloring to base chord
In more simple terms: find a list of integers (equal to the size of vertices) that is 
maximally even and must contain the integers from base

"""
def colorChord(vertices: deque, base: deque, coloring=[]):
    
    # Base Case - no more vertices to color (assign)
    if not vertices:
        return coloring
    

    #Check Memorization Table to avoid duplicate computation
    key = tuple([tuple(vertices), tuple(base), tuple(coloring)])
    if key in memo:
        return memo[key]
    # Make copies for recursion
    base_copy = base.copy()
    vertices_copy = vertices.copy()

    # Two cases to assign the current vertex to
    # Case 1: closet modal tone not yet used in the coloring
    closestModalTone = closetInMode(vertices_copy.popleft(), coloring)
    closestColoring = coloring + [closestModalTone]
    closestColoring = colorChord(vertices_copy, base, closestColoring)

    # If no more base notes remain we must chose case 1 - shortcut
    if not base:
        return closestColoring
    
    # Case 2: choose first base note
    baseColoring = coloring + [base_copy.popleft()]
    baseColoring = colorChord(vertices_copy, base_copy, baseColoring)
    base_copy = base.copy()


    cases = [c for c in [baseColoring, closestColoring] if c is not None]

    finalColoring = evenerColoring(cases)

    #Update memorization table
    memo[key] = finalColoring

    return finalColoring



'''
return the canidate (list of notes i.e chord) that's the most even and doesn't
contain any duplicates
'''
def evenerColoring(candidates):
    bestColoring = min(candidates, key=lambda c: chordEveness(c))

    # Make sure bestColoring has no duplicates
    while len(bestColoring) != len(set(bestColoring)):
            if len(candidates) == 1:
                return bestColoring
            candidates.remove(bestColoring)
            bestColoring = min(candidates, key=lambda c: chordEveness(c))

    return bestColoring


'''
Inputs - Index: target value who distance from output this function minimzies
In our use case it will be the vertice from the inscribed normal polygon
Coloring: list of tones already in the coloring that the function won't chose from
Return: modal tone that's not already in coloring that's closet to index
Desciption: This function generates the next color chord for one of the 3 cases
of the colorChord fuction. To do so it choses the modal tone that's closet to the
normal vertex, without allowing duplicates from the color tones.
'''
def closetInMode (index: float, coloring):
    modeDiff = list(set(mode).difference(coloring))
    closest = min(modeDiff, key=lambda x: abs(x - index))

    return closest
        
"""
Compute evenness by measuring each note's distance
to the closest normal vertex. This is the linear regression eveness metric
See more in the README.
"""
def chordEveness(coloring):

    # if len(coloring) != len(set(coloring)): return 100 # make it built in contant later
    global noteCount

    coloring_copy = coloring.copy()
    
    normalInterval = pulses / noteCount
    normalVertices = [i * normalInterval for i in range(noteCount)]
    sum_dist = 0
    for note in coloring:
        closest_vertex = min(normalVertices, key=lambda v: circular12_distance(note, v))
        sum_dist += circular12_distance(closest_vertex, note)
        normalVertices.remove(closest_vertex)
    
    return sum_dist / noteCount

"""
Returns the shortest distance between a and b on a 12-step circle. i.e using clock-arithmitic
"""
def circular12_distance(a, b):

    diff = abs(a - b) % 12
    return min(diff, 12 - diff)
    



if __name__ == "__main__":
    o = 2
    baseChord = [11]
    m = [0,2,4,5,7,9,11]
    chordColorerHelper(baseChord, m, o)
