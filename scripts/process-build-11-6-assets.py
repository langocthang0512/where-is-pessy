from pathlib import Path
from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
BACKGROUND_SOURCE = ROOT / "assets" / "backgrounds" / "build-11-6-source"
BACKGROUND_OUTPUT = ROOT / "assets" / "backgrounds"

BACKGROUNDS = {
    "SwordDuel.png": "FootballField",
    "SkyAbduction.png": "SkyKidnap",
    "ShanghaiBundFlat.png": "ShanghaiBund",
    "CasinoRoomFlat.png": "CasinoRoom",
}


def cover_resize(image, width, height):
    source_ratio = image.width / image.height
    target_ratio = width / height

    if source_ratio > target_ratio:
        crop_width = round(image.height * target_ratio)
        left = (image.width - crop_width) // 2
        image = image.crop((left, 0, left + crop_width, image.height))
    else:
        crop_height = round(image.width / target_ratio)
        top = (image.height - crop_height) // 2
        image = image.crop((0, top, image.width, top + crop_height))

    return image.resize((width, height), Image.Resampling.LANCZOS)


for source_name, output_stem in BACKGROUNDS.items():
    with Image.open(BACKGROUND_SOURCE / source_name) as source:
        final = cover_resize(source.convert("RGB"), 1920, 1080)
        final.save(BACKGROUND_OUTPUT / f"{output_stem}.png", optimize=True)
        final.save(BACKGROUND_OUTPUT / f"{output_stem}.webp", "WEBP", quality=86, method=6)

with Image.open(ROOT / "assets" / "cards" / "Ancient_Card_Back_Fallback_Source.png") as source:
    final = cover_resize(source.convert("RGB"), 500, 700)
    final.save(ROOT / "assets" / "cards" / "Ancient_Card_Back.png", optimize=True)

print("Processed four Build 11.6 scene backgrounds and the ancient card back.")
