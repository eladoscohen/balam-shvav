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
    const statusBox = document.getElementById('form-status');
    const phoneInput = form.phone.value.trim();
    statusBox.textContent = '';
    statusBox.classList.remove("success", "error");

    // Validate phone
    const intlRegex = /^\+?[\d\s().-]{7,20}$/;
    if (!intlRegex.test(phoneInput)) {
      statusBox.classList.add("error");
      statusBox.textContent = '❌ אנא הזן מספר טלפון תקין.';
      return;
    }

    // Native HTML5 validation
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    // Run reCAPTCHA
    grecaptcha.ready(() => {
      grecaptcha.execute('6Lebs2krAAAAANPvZI7JSobGiU8q0TmOSHlAvNdE', { action: 'submit' })
        .then(async (token) => {
          await sendForm(form, token, statusBox);
        });
    });
  };

  async function sendForm(form, recaptchaToken, statusBox) {
    const data = new FormData(form);
    data.append("g-recaptcha-response", recaptchaToken);

    try {
      const res = await fetch("https://script.google.com/macros/s/AKfycbwmq2x2f4vkITQyZTbQ1MlhszRL0K-Vnz_6hIza1OLPveRNAObXE3AxRpWqSoLFdGmyyA/exec", {
        method: "POST",
        body: data
      });

      const text = await res.text();
      console.log("📩 Server response:", text);

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
