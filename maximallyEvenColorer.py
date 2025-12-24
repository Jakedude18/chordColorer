#This script interfaces with proto.py to a find a minimally even coloring of the given base chord.
#We treat each note of the base chord as if it were the first note of our rhythm and see which treatment leads to the lowest eveness score.
#In other words maximallyEvenColorer offset's the normal polygon so that the vertices align with one of the base chords.
import chordColorer

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

def offset(b, pc):
    pc -= b
    if pc < 0:
        pc = 12 - abs(pc)
    return pc


def reset(b, pc):
    return (b + pc) % 12





if __name__ == "__main__":
    o = 3
    baseChord = [11]
    m = [0,2,4,5,7,9,11]
    color(baseChord, m, o)