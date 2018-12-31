from PIL import Image

def getImg(idx):
    return Image.open('res/cards/card' + str(idx) + '.png').convert('RGB')


rgbToImgMap = {}
rgbToPointsMap = {}

imagePointsInOrder = []

for i in range(1, 231):
    im = getImg(i)
    x, y = im.size
    x = int(x/2)
    y = y-1
    pix = im.load()
    if pix[x,y] not in rgbToImgMap:
        rgbToImgMap[pix[x,y]] = i

for rgb,idx  in rgbToImgMap.items():
    print(str(rgb) + " -- " + str(idx))
    getImg(idx).show()
    points = int(input("Give points\n>> "))
    rgbToPointsMap[rgb] = points


for i in range(1, 231):
    im = getImg(i)
    x, y = im.size
    x = int(x/2)
    y = y-1
    pix = im.load()
    imagePointsInOrder.append(rgbToPointsMap[pix[x,y]])

print(imagePointsInOrder)
