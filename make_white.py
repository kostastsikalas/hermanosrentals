from PIL import Image

def make_white(input_path, output_path):
    img = Image.open(input_path)
    img = img.convert("RGBA")
    data = img.getdata()
    
    new_data = []
    for item in data:
        # item is (R, G, B, A)
        if item[3] > 0:
            # Change all non-transparent pixels to white, keep the original alpha
            new_data.append((255, 255, 255, item[3]))
        else:
            new_data.append(item)
            
    img.putdata(new_data)
    img.save(output_path, "PNG")

if __name__ == "__main__":
    make_white("public/logo_transparent.png", "public/logo_white.png")
    print("logo_white.png created successfully!")
