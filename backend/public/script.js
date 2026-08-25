(function () {
  document.addEventListener("DOMContentLoaded", () => {
    const registerBtn = document.getElementById("registerBtn");
    const backdrop = document.getElementById("modalBackdrop");
    const registerModal = document.querySelector(".modal:not([id])");
    const resendModal = document.getElementById("resendModal");
    const registerForm = document.getElementById("registerForm");
    const resendForm = document.getElementById("resendForm");
    const passwordInput = document.getElementById("password");
    const confirmPasswordInput = document.getElementById("confirmPassword");
    const passwordStrength = document.getElementById("passwordStrength");
    const passwordMatch = document.getElementById("passwordMatch");

    const passwordIsValid = (password) =>
      password.length > 8 &&
      /[A-Z]/.test(password) &&
      /[0-9]/.test(password) &&
      /[^A-Za-z0-9]/.test(password);

    function updatePasswordFeedback() {
      const password = passwordInput.value;
      const score = [password.length > 8, /[A-Z]/.test(password), /[0-9]/.test(password), /[^A-Za-z0-9]/.test(password)].filter(Boolean).length;
      const labels = ["pendiente", "muy débil", "débil", "aceptable", "segura"];
      passwordStrength.dataset.score = score;
      passwordStrength.querySelector(".strength-label").textContent = `Seguridad: ${labels[score]}`;

      const passwordsMatch = !confirmPasswordInput.value || password === confirmPasswordInput.value;
      confirmPasswordInput.setCustomValidity(passwordsMatch ? "" : "Las contraseñas no coinciden.");
      passwordMatch.textContent = passwordsMatch ? "Las contraseñas coinciden." : "Las contraseñas no coinciden.";
      passwordMatch.classList.toggle("is-error", !passwordsMatch);
    }

    function showModal(modal) {
      backdrop.style.display = "flex";
      backdrop.setAttribute("aria-hidden", "false");
      registerModal.hidden = modal !== registerModal;
      resendModal.hidden = modal !== resendModal;
      modal.querySelector("input")?.focus();
    }

    function closeModal() {
      backdrop.style.display = "none";
      backdrop.setAttribute("aria-hidden", "true");
      registerBtn?.focus();
    }

    registerBtn?.addEventListener("click", () => showModal(registerModal));
    document.getElementById("closeModal")?.addEventListener("click", closeModal);
    document.getElementById("closeResendModal")?.addEventListener("click", closeModal);
    document.getElementById("openResendModal")?.addEventListener("click", () => {
      document.getElementById("resendEmail").value = registerForm.email.value;
      showModal(resendModal);
    });
    document.getElementById("backToRegister")?.addEventListener("click", () => showModal(registerModal));

    backdrop?.addEventListener("click", (event) => {
      if (event.target === backdrop) closeModal();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && backdrop?.style.display === "flex") closeModal();
    });

    passwordInput?.addEventListener("input", () => {
      passwordInput.setCustomValidity(
        passwordInput.value && !passwordIsValid(passwordInput.value)
          ? "La contraseña debe tener más de 8 caracteres, una mayúscula, un número y un símbolo."
          : "",
      );
      updatePasswordFeedback();
    });
    confirmPasswordInput?.addEventListener("input", updatePasswordFeedback);

    registerForm?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const password = passwordInput.value;
      updatePasswordFeedback();
      if (!passwordIsValid(password)) {
        passwordInput.setCustomValidity("La contraseña no cumple los requisitos de seguridad.");
        passwordInput.reportValidity();
        return;
      }
      if (password !== confirmPasswordInput.value) {
        confirmPasswordInput.reportValidity();
        return;
      }

      const data = Object.fromEntries(new FormData(registerForm));
      delete data.confirmPassword;
      try {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result.message || "No fue posible crear la cuenta.");
        alert("Cuenta creada. Revisa tu correo para activarla.");
        registerForm.reset();
        closeModal();
      } catch (error) {
        alert(error.message || "Error de red.");
      }
    });

    resendForm?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const email = new FormData(resendForm).get("email");
      try {
        const response = await fetch("/api/auth/resend-verification", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result.message || "No fue posible reenviar el correo.");
        alert("Si existe una cuenta pendiente, recibirás un correo de activación.");
        resendForm.reset();
        closeModal();
      } catch (error) {
        alert(error.message || "Error de red.");
      }
    });
  });
})();
