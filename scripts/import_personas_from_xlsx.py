import json
import os
import re
import sys
import zipfile
import xml.etree.ElementTree as ET
from collections import defaultdict
from pathlib import Path


NS_MAIN = "http://schemas.openxmlformats.org/spreadsheetml/2006/main"
MBTI_RE = re.compile(r"\b[IE][NS][TF][JP]\b")


def _read_shared_strings(z: zipfile.ZipFile) -> list[str]:
    shared = ET.fromstring(z.read("xl/sharedStrings.xml"))
    strings: list[str] = []
    for si in shared.findall(f"{{{NS_MAIN}}}si"):
        text = "".join((t.text or "") for t in si.findall(f".//{{{NS_MAIN}}}t"))
        strings.append(text)
    return strings


def _col_to_idx(col: str) -> int:
    idx = 0
    for ch in col:
        idx = idx * 26 + (ord(ch) - 64)
    return idx


def _cell_ref(cell: str) -> tuple[int, int] | None:
    m = re.match(r"([A-Z]+)(\d+)", cell)
    if not m:
        return None
    return _col_to_idx(m.group(1)), int(m.group(2))


def _cell_value(cell: ET.Element, strings: list[str]) -> str:
    t = cell.attrib.get("t")
    v = cell.find(f"{{{NS_MAIN}}}v")
    if v is not None and v.text is not None:
        if t == "s":
            return strings[int(v.text)]
        return v.text

    inline = cell.find(f"{{{NS_MAIN}}}is")
    if inline is not None:
        return "".join((t.text or "") for t in inline.findall(f".//{{{NS_MAIN}}}t"))

    return ""


def _val_to_percent(value: str) -> int:
    try:
        x = float(value)
    except ValueError:
        x = 4.0
    x = max(1.0, min(7.0, x))
    return int(round(((x - 1.0) / 6.0) * 100.0))


def _to_axis_scores(letters: list[str], values: list[str]) -> dict[str, int]:
    letter_pct: dict[str, int] = {}
    for letter, value in zip(letters, values, strict=False):
        letter_pct[letter] = _val_to_percent(value)

    e = letter_pct.get("E", 100 - letter_pct.get("I", 50))
    n = letter_pct.get("N", 100 - letter_pct.get("S", 50))
    t = letter_pct.get("T", 100 - letter_pct.get("F", 50))
    j = letter_pct.get("J", 100 - letter_pct.get("P", 50))
    return {"E": e, "N": n, "T": t, "J": j}


def parse_personas_from_xlsx(xlsx_path: Path) -> dict[str, list[dict]]:
    z = zipfile.ZipFile(xlsx_path)
    strings = _read_shared_strings(z)
    sheet = ET.fromstring(z.read("xl/worksheets/sheet2.xml"))

    grid: dict[int, dict[int, str]] = defaultdict(dict)
    for row in sheet.findall(f".//{{{NS_MAIN}}}row"):
        row_number = int(row.attrib.get("r", "0") or 0)
        for cell in row.findall(f"{{{NS_MAIN}}}c"):
            ref = cell.attrib.get("r")
            if not ref:
                continue
            parsed = _cell_ref(ref)
            if not parsed:
                continue
            col_index, _ = parsed
            value = _cell_value(cell, strings).replace("\n", " ").strip()
            if value:
                grid[row_number][col_index] = value

    headers: list[tuple[int, str]] = []
    for r in sorted(grid.keys()):
        a = grid[r].get(1, "")
        m = MBTI_RE.search(a)
        if m and a.strip().startswith(m.group(0)):
            headers.append((r, m.group(0)))

    result: dict[str, list[dict]] = {}
    for header_row, mbti in headers:
        header = grid[header_row]
        letters = [header.get(3, ""), header.get(4, ""), header.get(5, ""), header.get(6, "")]

        people: list[dict] = []
        for idx in range(1, 4):
            row = grid.get(header_row + idx, {})
            name = row.get(2, "").strip()
            values = [row.get(3, ""), row.get(4, ""), row.get(5, ""), row.get(6, "")]
            intro = row.get(7, "").strip()
            analysis = row.get(8, "").strip()

            people.append(
                {
                    "id": f"{mbti.lower()}-{idx}",
                    "name": name,
                    "imageUrl": f"https://picsum.photos/seed/{mbti.lower()}-{idx}/800/800",
                    "intro": intro,
                    "analysis": analysis,
                    "scores": _to_axis_scores(letters, values),
                }
            )

        result[mbti] = people

    return result


def main() -> int:
    xlsx_path = Path(sys.argv[1]) if len(sys.argv) > 1 else Path.home() / "Downloads" / "性格测试.xlsx"
    out_dir = Path(sys.argv[2]) if len(sys.argv) > 2 else Path("src") / "personas" / "mbti"

    if not xlsx_path.exists():
        print(f"XLSX not found: {xlsx_path}", file=sys.stderr)
        return 2

    out_dir.mkdir(parents=True, exist_ok=True)
    personas_by_mbti = parse_personas_from_xlsx(xlsx_path)

    missing = [k for k in sorted(personas_by_mbti.keys()) if len(personas_by_mbti[k]) != 3]
    if missing:
        print(f"Warning: some MBTI groups do not have 3 people: {missing}", file=sys.stderr)

    for mbti, people in personas_by_mbti.items():
        target = out_dir / f"{mbti}.json"
        target.write_text(json.dumps(people, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    print(f"Imported {len(personas_by_mbti)} MBTI groups into {out_dir}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
