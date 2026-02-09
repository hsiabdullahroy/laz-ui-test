import { test, expect } from "@playwright/test";

test.describe("Component Validation", () => {
  test.beforeEach(async ({ page }) => {
    console.log(`Running ${test.info().title}`);
    await page.goto("/zakat/maal");
  });

  test.describe("Positive Test Cases", () => {
    test("should display zakat nominal", async ({ page }) => {
      await page.getByPlaceholder("0").fill("100000");

      await expect(page.getByText("Rp 100.000")).toBeVisible();
    });

    test("should select Flip payment method", async ({ page }) => {
      const radioFlip = page.getByRole("radio", { name: /Flip/i });

      await radioFlip.check({ force: true });
      await expect(radioFlip).toBeChecked();
    });

    test("should accept valid Nama Lengkap input", async ({ page }) => {
      const inputName = page.getByLabel(/nama lengkap/i);

      await inputName.fill("Fulanah");
      await expect(inputName).toHaveValue("Fulanah");
    });

    test("should accept valid Nomor WhatsApp input", async ({ page }) => {
      const inputPhone = page.getByLabel(/Nomor WhatsApp/i);
      await inputPhone.fill("628123456789");
      await expect(inputPhone).toHaveValue("628123456789");
    });

    test.describe("Email Validation", () => {
      test("should accept valid Email input", async ({ page }) => {
        const inputEmail = page.getByLabel(/Email/i);
        await inputEmail.fill("fulanah@example.com");
        await expect(inputEmail).toHaveValue("fulanah@example.com");
      });
      //
      test("should pass with valid email if Nomor WhatsApp is empty", async ({
        page,
      }) => {
        await page.getByPlaceholder("0").fill("10000");

        await page.getByRole("radio", { name: /Flip/i }).check({ force: true });
        await page.locator('input[name="full_name"]').fill("Fulanah");
        await page.locator('input[name="email"]').fill("fulanah@example.com");
        await page
          .getByRole("button", { name: /Tunaikan zakat sekarang/i })
          .click();

        await expect(page).toHaveURL(/.*\/bayar\/zakat-maal\/\d+/);
      });

      test("should pass with empty email if Nomor WhatsApp is valid", async ({
        page,
      }) => {
        await page.getByPlaceholder("0").fill("10000");

        await page.getByRole("radio", { name: /Flip/i }).check({ force: true });
        await page.locator('input[name="full_name"]').fill("Fulanah");
        await page.locator('input[name="phone_number"]').fill("628123456789");
        await page
          .getByRole("button", { name: /Tunaikan zakat sekarang/i })
          .click();

        await expect(page).toHaveURL(/.*\/bayar\/zakat-maal\/\d+/);
      });
    });
  });

  test.describe("Negative Test Cases", () => {
    test.describe("Zakat Nominal", () => {
      test("should show error message when Zakat Nominal is empty", async ({
        page,
      }) => {
        await page.getByPlaceholder("0").fill("");
        await page
          .getByRole("button", { name: /Tunaikan zakat sekarang/i })
          .click();
        await expect(page.getByText(/Nominal wajib diisi/i)).toBeVisible();
      });

      test("should show error message when Zakat Nominal is less than 10000", async ({
        page,
      }) => {
        await page.getByPlaceholder("0").fill("9999");
        await page
          .getByRole("button", { name: /Tunaikan zakat sekarang/i })
          .click();
        await expect(page.getByText(/Minimal donasi Rp 10.000/i)).toBeVisible();
      });
    });

    test.describe("Payment Method", () => {
      test("should show error message when Payment Method is not selected", async ({
        page,
      }) => {
        await page.getByPlaceholder("0").fill("10000");

        await page
          .getByRole("button", { name: /Tunaikan zakat sekarang/i })
          .click();
        await expect(page.getByText(/Invalid input/i)).toBeVisible();
      });
    });

    test.describe("Full Name", () => {
      test("should show error message when Nama Lengkap is empty", async ({
        page,
      }) => {
        await page.getByPlaceholder("0").fill("10000");

        await page.getByRole("radio", { name: /Flip/i }).check({ force: true });

        await page
          .getByRole("button", { name: /Tunaikan zakat sekarang/i })
          .click();
        await expect(page.getByText(/Nama lengkap wajib diisi/i)).toBeVisible();
        await expect(page.locator('input[name="full_name"]')).toHaveAttribute(
          "aria-invalid",
          "true",
        );
      });

      test("should reject numeric input in Nama lengkap", async ({ page }) => {
        await page.getByPlaceholder("0").fill("10000");

        await page.getByRole("radio", { name: /Flip/i }).check({ force: true });

        await page.locator('input[name="full_name"]').fill("123");

        await page
          .getByRole("button", { name: /Tunaikan zakat sekarang/i })
          .click();
        await expect(page.locator('input[name="full_name"]')).toHaveAttribute(
          "aria-invalid",
          "true",
        );
      });

      test("should reject leading space character in Nama lengkap", async ({
        page,
      }) => {
        await page.getByPlaceholder("0").fill("10000");

        await page.getByRole("radio", { name: /Flip/i }).check({ force: true });

        await page.locator('input[name="full_name"]').fill(" ");

        await page
          .getByRole("button", { name: /Tunaikan zakat sekarang/i })
          .click();
        await expect(page.locator('input[name="full_name"]')).toHaveAttribute(
          "aria-invalid",
          "true",
        );
      });
    });

    test.describe("WhatsApp Number", () => {
      test("should validate nomor WhatsApp when left empty", async ({
        page,
      }) => {
        await page.getByPlaceholder("0").fill("10000");

        await page.getByRole("radio", { name: /Flip/i }).check({ force: true });
        // await page.locator('input[name="full_name"]').fill("Fulanah");

        await page
          .getByRole("button", { name: /Tunaikan zakat sekarang/i })
          .click();
        await expect(
          page.getByText(/Isi salah satu: Email atau WhatsApp/i),
        ).toHaveCount(2);
        await expect(
          page.locator('input[name="phone_number"]'),
        ).toHaveAttribute("aria-invalid", "true");
      });

      test("should reject Nomor WhatsApp whithout country code 62", async ({
        page,
      }) => {
        await page.getByPlaceholder("0").fill("10000");

        await page.getByRole("radio", { name: /Flip/i }).check({ force: true });
        // await page.locator('input[name="full_name"]').fill("Fulanah");

        await page.locator('input[name="phone_number"]').fill("08123456789");

        await page
          .getByRole("button", { name: /Tunaikan zakat sekarang/i })
          .click();
        await expect(
          page.getByText(/Nomor HP harus diawali kode negara/i),
        ).toBeVisible();
        await expect(
          page.locator('input[name="phone_number"]'),
        ).toHaveAttribute("aria-invalid", "true");
      });

      test("should reject Nomor WhatsApp with if less than 8 digit", async ({
        page,
      }) => {
        await page.getByPlaceholder("0").fill("10000");

        await page.getByRole("radio", { name: /Flip/i }).check({ force: true });

        await page.locator('input[name="phone_number"]').fill("6281234");

        await page
          .getByRole("button", { name: /Tunaikan zakat sekarang/i })
          .click();
        await expect(page.getByText(/8-15 digit/i)).toBeVisible();
        await expect(
          page.locator('input[name="phone_number"]'),
        ).toHaveAttribute("aria-invalid", "true");
      });

      test("should validate non-numeric input for Nomor WhatsApp", async ({
        page,
      }) => {
        await page.getByPlaceholder("0").fill("10000");

        await page.getByRole("radio", { name: /Flip/i }).check({ force: true });

        await page.locator('input[name="phone_number"]').fill("abc");

        await page
          .getByRole("button", { name: /Tunaikan zakat sekarang/i })
          .click();
        await expect(
          page.getByText(/Nomor HP harus diawali kode negara/i),
        ).toBeVisible();
        await expect(
          page.locator('input[name="phone_number"]'),
        ).toHaveAttribute("aria-invalid", "true");
      });
    });
    // menguji input email dengan mengosongkan nomor WhatsApp, karena ada pesan error: `Isi salah satu: Email atau WhatsApp`

    test.describe("email address", () => {
      // 1. harus menolak input email tanpa tanda @
      test("should reject email input without @ symbol", async ({ page }) => {
        await page.getByPlaceholder("0").fill("10000");

        await page.getByRole("radio", { name: /Flip/i }).check({ force: true });
        await page.locator('input[name="full_name"]').fill("Fulanah");

        await page.locator('input[name="email"]').fill("fulanah");

        await page
          .getByRole("button", { name: /Tunaikan zakat sekarang/i })
          .click();
        const isValid = await page
          .locator('input[name="email"]:invalid')
          .isVisible();

        expect(isValid).toBeTruthy();
      });

      //2. harus menolak input email yang tidak sesuai format email yang benar
      test("should reject email input that does not match email format", async ({
        page,
      }) => {
        await page.getByPlaceholder("0").fill("10000");

        await page.getByRole("radio", { name: /Flip/i }).check({ force: true });
        await page.locator('input[name="full_name"]').fill("Fulanah");
        const emailInput = page.locator('input[name="email"]');
        await emailInput.fill("fulanah@example");

        const isValid = await emailInput.evaluate((el: HTMLInputElement) =>
          el.checkValidity(),
        );
        expect(isValid).toBe(false);
        await expect(page).toHaveURL(/.*\/zakat-maal$/);

        const msg = await emailInput.evaluate(
          (el: HTMLInputElement) => el.validationMessage,
        );
        expect(msg).not.toBe("");
      });
    });
  });
});

test.describe("Zakat Journey Flow", () => {
  test.describe("Flip", () => {
    test("should successfully process BSI VA payment through Flip and display transaction details", async ({
      page,
      context,
    }) => {
      const nominalInput = "100000";
      const nominalRegex = /Rp\s?100\.000/;

      await page.goto("/zakat/maal");

      // input nominal zakat
      await page.getByPlaceholder("0").fill(nominalInput);

      // pilih metode pembayaran flip
      await page.getByRole("radio", { name: /Flip/i }).check({ force: true });

      // input nama lengkap
      await page.getByLabel(/nama lengkap/i).fill("Fulanah");

      //input nomor whatsapp
      await page.getByLabel(/Nomor WhatsApp/i).fill("628123456789");

      //input email
      await page.getByLabel(/Email/i).fill("fulanah@example.com");

      // klik tombol
      await page
        .getByRole("button", {
          name: /Tunaikan zakat sekarang/i,
        })
        .click();

      await expect(page).toHaveURL(/.*\/bayar\/zakat-maal\/\d+/);

      const flipButton = page.getByRole("link", { name: /Bayar Via Flip/i });
      await expect(flipButton).toBeVisible();
      await expect(flipButton).toHaveAttribute("href", /.*flip\.id.*/);
      await expect(page.getByText(nominalRegex)).toBeVisible();

      const pagePromise = context.waitForEvent("page");
      await flipButton.click();

      const flipPage = await pagePromise;
      await flipPage.waitForLoadState("load");
      await expect(flipPage).toHaveURL(/.*flip\.id\/.*\/payment-methods.*/);
      await expect(flipPage.getByText(nominalRegex)).toBeVisible();

      const vaCategory = flipPage
        .locator('button[data-qaid="qa-payment-method-category-button"]')
        .filter({ hasText: "Virtual Account" });
      await vaCategory.click();

      const bsiOption = flipPage
        .locator('div[data-qaid="qa-payment-method-options"]')
        .filter({ hasText: "BSI VA" });
      await bsiOption.click();

      const methodSelected = flipPage.locator(
        '[data-qaid="qa-payment-summary-method-selected"]',
      );
      await expect(methodSelected).toHaveText("BSI VA");

      const lanjutkanBtn = flipPage.locator(
        '[data-qaid="qa-payment-summary-continue-button"]',
      );
      await lanjutkanBtn.click();

      const pahamBtn = flipPage.getByRole("button", {
        name: "Tidak, Sudah Paham",
      });
      await pahamBtn.click();

      await expect(flipPage.getByText("Sedang Diproses")).toBeVisible();

      const berhasilBtn = flipPage.locator('button:has-text("Berhasil")');
      await berhasilBtn.click();

      await expect(
        flipPage.locator('h1[data-qaid="qa-payment-title-nav"]'),
      ).toHaveText("Transaksi berhasil");

      await flipPage
        .locator('[data-qaid="qa-payment-transaction-detail"]')
        .click();

      const totalAmountInDetail = flipPage.locator(
        '[data-qaid="qa-transaction-detail-modal-total-amount"]',
      );
      await expect(totalAmountInDetail).toBeVisible();
      await expect(totalAmountInDetail).toHaveText(nominalRegex);
    });
  });

  test.describe("BSI", () => {
    test("should successfully generate BSI payment code (Virtual Account) after submission", async ({
      page,
      context,
    }) => {
      const nominalInput = "100000";
      const nominalRegex = /Rp\s?100\.000/;

      await context.grantPermissions(["clipboard-read", "clipboard-write"]);
      await page.goto("/zakat/maal");

      // input nominal zakat
      await page.getByPlaceholder("0").fill(nominalInput);

      // pilih metode pembayaran BSI
      await page.getByRole("radio", { name: /BSI/i }).check({ force: true });

      // input nama lengkap
      await page.getByLabel(/nama lengkap/i).fill("Fulanah");

      //input nomor whatsapp
      await page.getByLabel(/Nomor WhatsApp/i).fill("628123456789");

      //input email
      await page.getByLabel(/Email/i).fill("fulanah@example.com");

      // klik tombol
      await page
        .getByRole("button", {
          name: /Tunaikan zakat sekarang/i,
        })
        .click();

      await expect(page).toHaveURL(/.*\/bayar\/zakat-maal\/\d+/);
      await expect(page.getByText("BSI Virtual Account")).toBeVisible();

      await expect(page.getByText(nominalRegex)).toBeVisible();

      await expect(page.getByText(/\d{8,}/)).toBeVisible();
      const va = await page.getByText(/\d{8,}/).innerText();

      await page
        .locator('button[data-slot="button"]')
        .filter({ has: page.locator("svg.lucide-copy") })
        .click();

      const clipboardText = await page.evaluate(() =>
        navigator.clipboard.readText(),
      );
      expect(clipboardText).toBe(va);
    });
  });
});
