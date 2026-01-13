#Author: Jake Kerrigan

#This script interfaces with chordColorer.py to a find a minimally even coloring of the given base chord.

import chordColorer

'''
Treat each note of the base chord as if it were the first note of our rhythm, or origin of the chormatic scale
Chose which which treatment leads to the lowest eveness score.
In other words maximallyEvenColorer offset's the normal polygon so that the vertices align with one of the base chords.
'''
def color(baseChord, m, n):
    minScore = float('inf')
    minColoring = []
    minoffSet = 0
    for b in baseChord:
        offsetBaseChord = [offset(b, note) for note in baseChord]
        offsetMode = [offset(b, note) for note in m]
        offsetMode.sort()
        offsetBaseChord.sort()
        coloring, score = chordColorer.chordColorerHelper(offsetBaseChord, offsetMode, n)
        coloring = [reset(b, note) for note in coloring]
        if score < minScore:
            minColoring=coloring
            minScore = score
            minoffSet = b
    minColoring.sort()
    return minColoring, minScore, minoffSet


#offset the pitch class (pc) by the new origin (b)
def offset(b, pc):
    pc -= b
    if pc < 0:
        pc = 12 - abs(pc)
    return pc


#reset the pitch class (pc) to origin 0 - inverse of offset
def reset(b, pc):
    return (b + pc) % 12




if __name__ == "__main__":
    o = 6
    baseChord = [11]
    m = [0,2,4,5,7,9,11]
    color(baseChord, m, o)


