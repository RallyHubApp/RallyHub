import { test, expect } from '@playwright/test';

test('directory logo preparation trims common transparent and white padding but preserves non-white backgrounds', async ({ page }) => {
  await page.goto('/e2e/directoryLogoHarness.html');

  await page.getByRole('button', { name: 'Transparent padding' }).click();
  let result = page.getByTestId('result');
  await expect(result).toHaveAttribute('data-trimmed', 'true');
  expect(Number(await result.getAttribute('data-width'))).toBeLessThan(260);
  expect(Number(await result.getAttribute('data-height'))).toBeLessThan(260);

  await page.getByRole('button', { name: 'White padding' }).click();
  result = page.getByTestId('result');
  await expect(result).toHaveAttribute('data-trimmed', 'true');
  expect(Number(await result.getAttribute('data-width'))).toBeLessThan(260);
  expect(Number(await result.getAttribute('data-height'))).toBeLessThan(230);

  await page.getByRole('button', { name: 'Dark background' }).click();
  result = page.getByTestId('result');
  await expect(result).toHaveAttribute('data-trimmed', 'false');
  await expect(result).toHaveAttribute('data-width', '300');
  await expect(result).toHaveAttribute('data-height', '300');
});

test('seeded Galway and Limerick directory logos are square and visually centred with useful fill', async ({ page }) => {
  await page.goto('/directory');
  const measurements = await page.evaluate(async () => {
    const names = ['galway-pickleball.webp', 'galway-county-pickleball.webp', 'limerick-city-pickleball.webp'];
    const out = {};
    for (const name of names) {
      const img = new Image();
      img.src = '/' + name;
      await img.decode();
      const c = document.createElement('canvas'); c.width = img.naturalWidth; c.height = img.naturalHeight;
      const ctx = c.getContext('2d'); ctx.drawImage(img, 0, 0);
      const d = ctx.getImageData(0, 0, c.width, c.height).data;
      let minX=c.width,minY=c.height,maxX=-1,maxY=-1;
      for (let y=0;y<c.height;y++) for(let x=0;x<c.width;x++) {
        const i=(y*c.width+x)*4; const r=d[i],g=d[i+1],b=d[i+2],a=d[i+3];
        if (a>20 && !(r>240&&g>240&&b>240)) { minX=Math.min(minX,x);minY=Math.min(minY,y);maxX=Math.max(maxX,x);maxY=Math.max(maxY,y); }
      }
      const visibleW=maxX-minX+1, visibleH=maxY-minY+1;
      out[name]={w:c.width,h:c.height,visibleW,visibleH,cx:(minX+maxX)/2,cy:(minY+maxY)/2};
    }
    return out;
  });
  for (const [name,m] of Object.entries(measurements)) {
    expect(m.w, name).toBe(256); expect(m.h, name).toBe(256);
    expect(Math.max(m.visibleW,m.visibleH), name).toBeGreaterThanOrEqual(210);
    expect(Math.abs(m.cx-127.5), `${name} horizontal centre`).toBeLessThanOrEqual(8);
    expect(Math.abs(m.cy-127.5), `${name} vertical centre`).toBeLessThanOrEqual(8);
  }
});
