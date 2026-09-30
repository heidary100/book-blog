#!/usr/bin/env python3
"""Extract text, TOC and cover from an EPUB for note scaffolding.

Usage: python3 scripts/extract_epub.py <book.epub> <out-dir>

Writes into <out-dir>:
  toc.json                     ordered list of {order, label, file}
  pages/<order:02d>-<slug>.txt plain text of each spine document
  cover.<ext>                  cover image, if found

Read-only on the source epub; everything is written to the output dir.
"""

import json
import re
import sys
import zipfile
from html.parser import HTMLParser
from pathlib import Path
from xml.etree import ElementTree as ET


class TextExtractor(HTMLParser):
    SKIP = {"style", "script", "head", "title"}
    BLOCK = {
        "p", "div", "h1", "h2", "h3", "h4", "h5", "h6", "li", "tr",
        "br", "blockquote", "section", "article", "figcaption",
    }

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.parts: list[str] = []
        self.skip = 0

    def handle_starttag(self, tag, attrs):
        if tag in self.SKIP:
            self.skip += 1
        elif tag in self.BLOCK:
            self.parts.append("\n")

    def handle_endtag(self, tag):
        if tag in self.SKIP:
            self.skip = max(0, self.skip - 1)
        elif tag in self.BLOCK:
            self.parts.append("\n")

    def handle_data(self, data):
        if not self.skip:
            self.parts.append(data)


def strip_html(xhtml: str) -> str:
    p = TextExtractor()
    p.feed(xhtml)
    text = "".join(p.parts)
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n\s*\n+", "\n\n", text)
    return text.strip()


def local_name(tag: str) -> str:
    return tag.split("}")[-1]


def find_attr(el: ET.Element, name: str) -> str | None:
    return el.attrib.get(name) or el.attrib.get(
        "{http://www.w3.org/1999/xlink}" + name
    )


def main(epub_path: str, out_dir: str) -> None:
    z = zipfile.ZipFile(epub_path)
    out = Path(out_dir)
    (out / "pages").mkdir(parents=True, exist_ok=True)

    # locate the OPF
    container = z.read("META-INF/container.xml").decode()
    opf_path = re.search(r'full-path="([^"]+)"', container).group(1)
    opf_root = ET.fromstring(z.read(opf_path))

    manifest: dict[str, dict] = {}
    spine: list[str] = []
    cover_id: str | None = None
    for el in opf_root.iter():
        tag = local_name(el.tag)
        if tag == "item":
            manifest[el.attrib["id"]] = {
                "href": find_attr(el, "href") or el.attrib["href"],
                "media-type": el.attrib.get("media-type", ""),
            }
        elif tag == "itemref":
            spine.append(el.attrib["idref"])
        elif tag == "meta" and el.attrib.get("name") == "cover":
            cover_id = el.attrib.get("content")

    opf_dir = Path(opf_path).parent

    # TOC labels: prefer EPUB3 nav, fall back to NCX
    labels: dict[str, str] = {}  # href (fragment-stripped) -> label
    for item in manifest.values():
        if item["media-type"] == "application/x-dtbncx+xml":
            ncx_root = ET.fromstring(z.read(str(opf_dir / item["href"])))
            for nav_point in ncx_root.iter():
                if local_name(nav_point.tag) != "navPoint":
                    continue
                label = ""
                src = ""
                for child in nav_point.iter():
                    if local_name(child.tag) == "text" and not label:
                        label = (child.text or "").strip()
                    elif local_name(child.tag) == "content":
                        src = find_attr(child, "src") or ""
                if label and src:
                    href = src.split("#")[0]
                    labels.setdefault(href, label)
            break

    # write pages in spine order
    toc = []
    for order, idref in enumerate(spine):
        item = manifest.get(idref)
        if not item:
            continue
        href = (str(opf_dir / item["href"])).replace("\\", "/")
        label = labels.get(item["href"]) or labels.get(Path(item["href"]).name) or Path(item["href"]).stem
        text = strip_html(z.read(href).decode())
        if not text:
            continue
        page = {
            "order": len(toc),
            "label": label,
            "file": item["href"],
        }
        toc.append(page)
        slug = re.sub(r"[^a-z0-9]+", "-", label.lower()).strip("-")[:60]
        fname = f"{page['order']:02d}-{slug}.txt"
        page["txt"] = f"pages/{fname}"
        (out / "pages" / fname).write_text(text)

    (out / "toc.json").write_text(json.dumps(toc, indent=2))

    # cover image
    if cover_id and cover_id in manifest:
        cover_href = str(opf_dir / manifest[cover_id]["href"])
        ext = Path(cover_href).suffix or ".jpg"
        (out / f"cover{ext}").write_bytes(z.read(cover_href))
        print(f"cover -> cover{ext}")

    print(f"{len(toc)} documents -> {out}/ (toc.json, pages/)")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    main(sys.argv[1], sys.argv[2])
