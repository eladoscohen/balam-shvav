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
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  grecaptcha.ready(() => {
    grecaptcha.execute('6Lebs2krAAAAANPvZI7JSobGiU8q0TmOSHlAvNdE', { action: 'submit' }).then(async (token) => {
      const file = form.file.files[0];
      const reader = new FileReader();

      reader.onload = async () => {
        const base64 = btoa([...new Uint8Array(reader.result)]
          .map(b => String.fromCharCode(b)).join(''));

        const payload = {
          name: form.name.value,
          email: form.email.value,
          phone: form.phone.value,
          message: form.message.value,
          filename: file.name,
          mimetype: file.type,
          filedata: base64,
          recaptcha: token  // ✅ Pass token to backend
        };

        const res = await fetch("https://script.google.com/macros/s/AKfycbywLZ8S4eNEJQ1-S8CuwhhBJkmcO27AN5HEieguKX6uWJq752I8WJ2O3vhS2qJfRYkWkA/exec", {
          method: "POST",
          body: JSON.stringify(payload),
          headers: { "Content-Type": "application/json" }
        });

        const json = await res.json();
        alert(json.success ? "✅ Sent!" : "❌ Error: " + json.error);
      };

      reader.readAsArrayBuffer(file);
    });
  });
};
