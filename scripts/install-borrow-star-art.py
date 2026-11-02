from pathlib import Path
from zipfile import ZipFile
from hashlib import sha256
from io import BytesIO


checksums = {
  "01-falling-star.webp": "5383dc434f1d2a01a62e1647b2b1afdc8227d1fa935f2aaf5a90a1c44f89bd06",
  "02-follow-the-light.webp": "b4933e1ec1d798c469da6a657964dcc7555ec3f77a5d97d73313c84da3e4be63",
  "03-reflection-mountain.webp": "22afeb10ad0bd676d4d2d41b55a14210fab3fd914318eaf48b8b25c9992b9081",
  "04-heaven-gate.webp": "8f2657435d512d251b5dcea57645f43731cc765f8e1120d7a615067d3b86ec2e",
  "05-lone-boat.webp": "033f55e71ce91e40ffe6a84c4459c00078dab9acf02880ba9e6f8ee20ceef352",
  "06-enter-water.webp": "9f992bbfdc91222741eea6bf889f97bc93700b69aea28eedfd0d27f40824015d",
  "07-star-palace.webp": "3697edd066d31e17fd52f2f3a51809c5fae9980826982f25cba9d10dc74f16bf",
  "08-meeting.webp": "a877fe86d578687066a76900f9f9587ab919e5f08ad0ad9f5b4347d7b061dff9",
  "09-star-returns.webp": "854366a12373dbe9a75d938b8ff73d6f2dc4732d1ff3ef707cc279c76a476680"
}
folder = Path("public/mythic-atlas/borrow-star")
with ZipFile("/tmp/borrow-star.zip") as archive:
    assert set(archive.namelist()) == set(checksums)
    for name, expected in checksums.items():
        data = archive.read(name)
        assert sha256(data).hexdigest() == expected, name
        assert data[:4] == b"RIFF" and data[8:12] == b"WEBP", name
        (folder / name).write_bytes(data)
        print(name, len(data), expected)
