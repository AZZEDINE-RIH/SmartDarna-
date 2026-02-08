def compresser_rle(chaine):
    resultat = []
    i = 0
    while i < len(chaine):
        count = 1
        while i + 1 < len(chaine) and chaine[i] == chaine[i+1]:
            i += 1
            count += 1
        if count == 1:
            resultat.append(chaine[i])
        else:
            resultat.append(f"{count}{chaine[i]}")
        i += 1
    return ''.join(resultat)

def taux_compression(original, compressee):
    return (1 - len(compressee) / len(original)) * 100
print(compresser_rle("aaabbcccaaa"))
print(taux_compression("aaabbcccaaa", compresser_rle("aaabbcccaaa")))