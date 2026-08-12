from collections import deque
from pathlib import Path

from PIL import Image

src = Path("public/brand/kisha-buzz-logo.png")
bak = Path("public/brand/kisha-buzz-logo.original.png")
if not bak.exists():
    bak.write_bytes(src.read_bytes())

im = Image.open(src).convert("RGBA")
w, h = im.size
px = im.load()


def is_bg(r: int, g: int, b: int, a: int) -> bool:
    return a > 200 and r < 28 and g < 28 and b < 28


visited = [[False] * h for _ in range(w)]
q: deque[tuple[int, int]] = deque()

for x in range(w):
    for y in (0, h - 1):
        r, g, b, a = px[x, y]
        if is_bg(r, g, b, a):
            q.append((x, y))
            visited[x][y] = True

for y in range(h):
    for x in (0, w - 1):
        if visited[x][y]:
            continue
        r, g, b, a = px[x, y]
        if is_bg(r, g, b, a):
            q.append((x, y))
            visited[x][y] = True

removed = 0
while q:
    x, y = q.popleft()
    r, g, b, a = px[x, y]
    if is_bg(r, g, b, a):
        px[x, y] = (0, 0, 0, 0)
        removed += 1
    for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
        if 0 <= nx < w and 0 <= ny < h and not visited[nx][ny]:
            nr, ng, nb, na = px[nx, ny]
            if is_bg(nr, ng, nb, na):
                visited[nx][ny] = True
                q.append((nx, ny))

im.save(src, "PNG", optimize=True)
print(f"done size={w}x{h} removed={removed} out={src}")
