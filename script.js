 /* Slideshow */

 $('.properties_slider').slick({
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 2000,
        adaptiveHeight: true,
        responsive: [
            {
                breakpoint: 480, // Mobile breakpoint
                settings: {
                    vertical: false,
                    verticalSwiping: false,
                    slidesToShow: 1,
                    slidesToScroll: 1
                }
            }
        ]
    });


    /* Form */

      document.getElementById('contact-form').onsubmit = async (e) => {
    e.preventDefault();

    const form = e.target;
      const phoneInput = form.phone.value.trim();
    const statusBox = document.getElementById('form-status');
    statusBox.textContent = '';

     // Validate phone with JS
  const intlRegex = /^\+?[\d\s().-]{7,20}$/;
  if (!intlRegex.test(phoneInput)) {
    statusBox.style.color = 'red';
    statusBox.textContent = '❌ אנא הזן מספר טלפון תקין.';
    return;
  }

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    grecaptcha.ready(() => {
      grecaptcha.execute('6Lebs2krAAAAANPvZI7JSobGiU8q0TmOSHlAvNdE', { action: 'submit' })
        .then(async (token) => {
          const file = form.file.files[0];

          if (file) {
            const reader = new FileReader();

            reader.onload = async () => {
              const base64 = btoa([...new Uint8Array(reader.result)]
                .map(b => String.fromCharCode(b)).join(''));

              await sendForm({
                name: form.name.value,
                email: form.email.value,
                phone: form.phone.value,
                message: form.message.value,
                filename: file.name,
                mimetype: file.type,
                filedata: base64,
                recaptcha: token
              }, statusBox, form);
            };

            reader.readAsArrayBuffer(file);
          } else {
            await sendForm({
              name: form.name.value,
              email: form.email.value,
              phone: form.phone.value,
              message: form.message.value,
              recaptcha: token
            }, statusBox, form);
          }
        });
    });
  };

async function sendForm(payload, statusBox, form) {
  console.log("🔄 Starting form submission...");
  console.log("📦 Payload:", payload);

  try {
    const response = await fetch("https://script.google.com/macros/s/AKfycbzWCufAW0qOhjpLXKF8F42hxf-A5Br2nxpChWOhXPvqwD5qrnb2O-J-yPgduIcr4J6nHQ/exec", {
      method: "POST",
      headers: {
        "Content-Type": "text/plain" // avoids preflight and keeps things CORS-safe
      },
      body: JSON.stringify(payload)
    });

    console.log("✅ Response received. Status:", response.status);

    const contentType = response.headers.get("Content-Type");
    console.log("📨 Response Content-Type:", contentType);

    if (!response.ok) {
      console.error("❌ HTTP Error:", response.status, response.statusText);
      statusBox.style.color = "red";
      statusBox.textContent = "שגיאה בשליחה: שגיאת שרת (HTTP " + response.status + ")";
      return;
    }

    const json = await response.json();
    console.log("📨 Parsed JSON:", json);

    if (json.success) {
      statusBox.style.color = "green";
      statusBox.textContent = ":הטופס נשלח בהצלחה";
      form.reset();
    } else {
      statusBox.style.color = "red";
      statusBox.textContent = "שגיאה בשליחה: " + (json.error || "נסה שוב מאוחר יותר");
    }

  } catch (err) {
    console.error("❗ Fetch failed:", err);
    statusBox.style.color = "red";
    statusBox.textContent = "שגיאה בשליחה: בעיית חיבור או שרת";
  }
}

