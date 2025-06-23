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
  console.log("🔧 Starting sendForm with payload:", payload);

  const data = new FormData();
  data.append("name", payload.name);
  data.append("email", payload.email);
  data.append("phone", payload.phone);
  data.append("message", payload.message || '');
  data.append("g-recaptcha-response", payload.recaptcha);

  if (payload.filename && payload.filedata && payload.mimetype) {
    console.log("📎 File data present, preparing Blob...");
    try {
      const byteCharacters = atob(payload.filedata);
      const byteNumbers = Array.from(byteCharacters, c => c.charCodeAt(0));
      const byteArray = new Uint8Array(byteNumbers);
      const fileBlob = new Blob([byteArray], { type: payload.mimetype });

      console.log("✅ Blob created:", fileBlob);

      data.append("file", fileBlob, payload.filename);

      for (let [key, value] of data.entries()) {
  console.log(`📝 ${key}:`, value);
}
    } catch (err) {
      console.error("❌ Error building file blob:", err);
    }
  } else {
    console.warn("⚠️ No file attached or missing data");
  }

  try {
    const res = await fetch("https://script.google.com/macros/s/AKfycbzhPD0K3hzUmSHDo9wVdMyrWc0arAVcQHDvHq-5BJ1uHr-KIhUiRs63n-t78D1ewFvd9A/exec", {
      method: "POST",
      body: data
      // No headers on purpose for FormData
    });

    const text = await res.text();
    console.log("📩 Server response:", text);

    // Clear previous state
    statusBox.classList.remove("success", "error");

    if (res.ok && /success/i.test(text)) {
      statusBox.classList.add("success");
      statusBox.textContent = "הטופס נשלח בהצלחה";
      form.reset();
    } else {
      statusBox.classList.add("error");
      statusBox.textContent = "שגיאה בשליחה: " + text;
    }
  } catch (err) {
    console.error("❌ Fetch failed:", err);
    statusBox.classList.add("error");
    statusBox.textContent = "שגיאה בשליחה: בעיית תקשורת עם השרת";
  }
}


