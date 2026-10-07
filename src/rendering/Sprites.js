export function drawPixels(ctx, rows, palette, x, y, size = 1) {
  rows.forEach((row, dy) => {
    [...row].forEach((pixel, dx) => {
      if (palette[pixel]) {
        ctx.fillStyle = palette[pixel];
        ctx.fillRect(x + dx * size, y + dy * size, size, size);
      }
    });
  });
}
