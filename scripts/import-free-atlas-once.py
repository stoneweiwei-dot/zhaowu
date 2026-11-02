#!/usr/bin/env python3
"""One-use, checksum-pinned transfer. Only publish the 22 paired-character scenes."""
from pathlib import Path
from io import BytesIO
from PIL import Image
from zipfile import ZipFile
from hashlib import sha256
import json, urllib.request
root=Path(__file__).resolve().parent.parent
endpoint="https://api.firestorage.ai/dev/file/shares/SGgrFxgEG-Ro/files/01a199e023c670019cb0657de510f963/download"
expected="06e97c9aadad97dfe8698da2503a954779d7b4bbc9c7e2c97c75a9a9e323e77b"
with urllib.request.urlopen(urllib.request.Request(endpoint,method="POST"),timeout=30) as response:
    url=json.load(response)["downloadUrl"]
with urllib.request.urlopen(url,timeout=180) as response:
    archive=response.read()
assert sha256(archive).hexdigest()==expected,"original archive mismatch"
out=[]
with ZipFile(BytesIO(archive)) as z:
    sources=json.loads(z.read("manifest.json"))
    assert len(sources)==22
    names=set("jia yi bing ding wu ji geng xin ren gui".split())
    branch_names=set("zi chou yin mao chen si wu wei shen you xu hai".split())
    assert set(x["id"] for x in sources)=={"stems/"+x for x in names}|{"branches/"+x for x in branch_names}
    for item in sources:
        original=z.read(item["id"]+".webp")
        assert len(original)==item["bytes"] and sha256(original).hexdigest()==item["sha256"],item["id"]
        image=Image.open(BytesIO(original)).convert("RGB")
        assert image.size==(941,1672)
        # The complete AI-generated information panels and footer aren't verified.
        # Publish only the upper paired character scene; report facts remain HTML.
        scene=image.crop((0,0,941,700)).resize((720,536),Image.Resampling.LANCZOS)
        target=root/"public/report-visuals/atlas"/(item["id"]+".webp")
        target.parent.mkdir(parents=True,exist_ok=True)
        scene.save(target,"WEBP",quality=80,method=6)
        data=target.read_bytes()
        out.append({"id":item["id"],"file":str(target.relative_to(root/"public")),
                    "sha256":sha256(data).hexdigest(),"bytes":len(data),
                    "width":720,"height":536,"originalSha256":item["sha256"],
                    "cropOriginal":[0,0,941,700]})
dest=root/"public/report-visuals/atlas/manifest.json"
dest.write_text(json.dumps({"series":"Zhaowu Stem & Branch 22",
    "source":"22 separately generated 9:16 originals; public assets contain cropped paired scenes, not unverified source typography",
    "assets":out},ensure_ascii=False,indent=2)+"\n")
print("VERIFIED:",len(out),"scene-only artworks; bytes:",sum(x["bytes"] for x in out))
