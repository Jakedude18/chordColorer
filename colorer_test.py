import chordColorer

#C major over C ionian
def test_cMajor():
    base = [0,7] #c, g
    mode = [0,2,4,5,7,9,11]
    expectedColoring = [0,4,7]
    coloring, _ = chordColorer.chordColorerHelper(base, mode, 3)
    assert(coloring == expectedColoring)



#C augmented over altered mode
#base = g, b [7,11]
#mode = [0,1,3,4,6,8,10]
#coloring = [3,7,11]



