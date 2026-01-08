from PIL import Image, ImageDraw, ImageFont
import os

# Create a 512x512 image with green background
img = Image.new('RGBA', (512, 512), (34, 197, 94, 255))  # Islamic green color
draw = ImageDraw.Draw(img)

# Try to use a font, if not available, use default
try:
    font = ImageFont.truetype("arial.ttf", 60)
except:
    font = ImageFont.load_default()

# Add text "Coran Pro Free"
text = "Coran\nPro\nFree"
bbox = draw.textbbox((0, 0), text, font=font)
text_width = bbox[2] - bbox[0]
text_height = bbox[3] - bbox[1]
x = (512 - text_width) // 2
y = (512 - text_height) // 2

draw.text((x, y), text, fill=(255, 255, 255, 255), font=font, align="center")

# Save as favicon.png in client/public
img.save('Quran-Pro/client/public/favicon.png')

# Also save as logo.png
img.save('logo.png')

print("Logo created successfully")
