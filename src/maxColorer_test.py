#Testing file for maximallyEvenColorer

import maximallyEvenColorer

#C augmented over altered mode

def test_cAugmented():
    base = [7,11] #g ,b
    mode = [0,1,3,4,5,6,8,10]
    expectedColoring = [3,7,11]
    coloring, _, _ = maximallyEvenColorer.color(base, mode, 3)
    assert(set(coloring) == set(expectedColoring))


#C major over C ionian
def test_cMajor():
    base = [0,7] #c, g
    mode = [0,2,4,5,7,9,11]
    expectedColoring = [0,4,7]
    coloring, _, _ = maximallyEvenColorer.color(base, mode, 3)
    assert(coloring == expectedColoring)
    

#C major over C ionian
def test_rootlessCMajor7():
    base = [4,7] #e, g
    mode = [2,4,5,7,9,11]
    expectedColoring = [4,7,11]
    coloring, _, _ = maximallyEvenColorer.color(base, mode, 3)
    assert(coloring == expectedColoring)

def test_base_6():
    base = [2,4,6,9,11]
    mode = [2,4,6,7,9,10,11]
    expectedColoring = [2,4,6,7,9,10,11]
    coloring, _, _ = maximallyEvenColorer.color(base, mode, 7)
    assert(coloring == expectedColoring)


def test_base_7():
    mode = [1,2,3,5,8,9,10]
    base = [2,3,5,8,9,10]
    expectedColoring = [1,2,3,5,8,9,10]
    coloring, _, _ = maximallyEvenColorer.color(base, mode, 7)
    assert(coloring == expectedColoring)

def test_error():
    mode = [0,3,6,9,11]
    base = [0,7]
    expectedColoring = [0,3,7,9]
    coloring, _, _ = maximallyEvenColorer.color(base, mode, 4)
    assert(coloring == expectedColoring)


def test_c_minor():
    mode = [0,2,3,5,7,9,11]
    base = [0,7]
    expectedColoring = [0,3,7]
    coloring, _, _ = maximallyEvenColorer.color(base, mode, 3)
    assert(coloring == expectedColoring)


