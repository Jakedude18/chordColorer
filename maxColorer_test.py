import maximallyEvenColorer

#C augmented over altered mode

def test_cAugmented():
    base = [7,11] #g ,b
    mode = [0,1,3,4,5,6,8,10]
    expectedColoring = [3,7,11]
    coloring, _ = maximallyEvenColorer.color(base, mode, 3)
    assert(set(coloring) == set(expectedColoring))


#C major over C ionian
def test_cMajor():
    base = [0,7] #c, g
    mode = [0,2,4,5,7,9,11]
    expectedColoring = [0,4,7]
    coloring, _ = maximallyEvenColorer.color(base, mode, 3)
    assert(coloring == expectedColoring)


