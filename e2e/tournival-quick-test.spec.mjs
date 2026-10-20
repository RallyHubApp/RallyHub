import {test,expect} from '@playwright/test';
for(const width of [390,1280]){
 test('Tournival one-click UAT quick controls '+width+'px',async({page})=>{
  await page.setViewportSize({width,height:844});
  await page.goto('/e2e/tournivalRehearsalHarness.html');
  const centre=page.getByTestId('tournival-quick-test-centre');
  await expect(centre).toBeVisible();
  await centre.getByRole('button',{name:/1 · Create Test Event/}).click();
  await expect(centre.getByText('IN PROGRESS', {exact:false})).toBeVisible();
  await centre.getByRole('button',{name:/2 · Run Qualification/}).click();
  await expect(centre.getByText('16/16')).toBeVisible();
  await centre.getByRole('button',{name:/3 · Finish Knockout/}).click();
  await expect(centre.getByText('PASS · Simulated sporting journey complete')).toBeVisible();
  await centre.getByRole('button',{name:'Run Full Acceptance'}).click();
  await expect(centre.getByText('PASS · Simulated sporting journey complete')).toBeVisible();
  const preview=page.getByTestId('tournival-quick-player-preview');
  await preview.getByRole('button',{name:'results'}).click();
  await expect(preview.getByText(/Final completed/)).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
 });
}
