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
  console.log("🔧 Sending JSON payload:", payload);

  const res = await fetch("https://script.google.com/macros/s/AKfycbyqHbUwaQPHeHWSfZmHiH2dJxgKVddKIy0piqq6NCLPhD27-KEQaMwg4a1xrVYWi0yySg/exec", {
    method: "POST",
    headers: {
      "Content-Type": "application/json" // 🔁 Match the backend test expectations
    },
    body: JSON.stringify(payload)
  });

  const text = await res.text();
  console.log("📩 Server response:", text);

  statusBox.classList.remove("success", "error");

  if (res.ok && /success/i.test(text)) {
    statusBox.classList.add("success");
    statusBox.textContent = "הטופס נשלח בהצלחה";
    form.reset();
  } else {
    statusBox.classList.add("error");
    statusBox.textContent = "שגיאה בשליחה: " + text;
  }
}


