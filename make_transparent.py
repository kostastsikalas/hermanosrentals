from PIL import Image
import sys

def make_transparent(img_path, out_path):
    img = Image.open(img_path)
    img = img.convert("RGBA")
    datas = img.getdata()

    newData = []
    # threshold for white
    for item in datas:
        if item[0] > 230 and item[1] > 230 and item[2] > 230:
            newData.append((255, 255, 255, 0))
        else:
            newData.append(item)

    img.putdata(newData)
    img.save(out_path, "PNG")

make_transparent("public/logo.png", "public/logo_transparent.png")
print("Done")
