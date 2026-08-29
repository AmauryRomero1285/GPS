(function () {
  document.addEventListener("DOMContentLoaded", () => {
    const backdrop = document.getElementById("modalBackdrop");
    const registerBtn = document.getElementById("registerBtn");

    // Cache interno para no cargar la misma vista varias veces desde el servidor
    const viewsCache = {};

    // Cargar la vista HTML mediante fetch
    async function fetchView(viewName) {
      if (viewsCache[viewName]) return viewsCache[viewName];
      const response = await fetch(`./views/${viewName}.html`);
      if (!response.ok) throw new Error(`Error al cargar la vista ${viewName}`);
      const html = await response.text();
      viewsCache[viewName] = html;
      return html;
    }

    // Funciones básicas para abrir/cerrar modales
    function closeModal() {
      backdrop.style.display = "none";
      backdrop.setAttribute("aria-hidden", "true");
      backdrop.innerHTML = "";
    }

    async function openModalView(viewName, onRendered = () => {}) {
      try {
        const html = await fetchView(viewName);
        backdrop.innerHTML = html;
        backdrop.style.display = "flex";
        backdrop.setAttribute("aria-hidden", "false");
        
        // Asignar evento de cerrar a botones con data-action="close"
        backdrop.querySelectorAll('[data-action="close"]').forEach((btn) => {
          btn.addEventListener("click", closeModal);
        });

        onRendered();
      } catch (err) {
        console.error(err);
      }
    }

    // Modal de estado/confirmación dinámico (remplaza a alert)
    function showFeedback({ title, message, icon = "mark_email_read" }) {
      openModalView("modal-feedback", () => {
        document.getElementById("feedbackTitle").textContent = title;
        document.getElementById("feedbackMessage").textContent = message;
        const iconEl = document.querySelector("#feedbackIcon .material-symbols-outlined");
        if (iconEl) iconEl.textContent = icon;
      });
    }

    // Validador de fortaleza de contraseña
    const passwordIsValid = (password) =>
      password.length > 8 &&
      /[A-Z]/.test(password) &&
      /[0-9]/.test(password) &&
      /[^A-Za-z0-9]/.test(password);

    function bindPasswordEvents() {
      const passwordInput = document.getElementById("password");
      const confirmPasswordInput = document.getElementById("confirmPassword");
      const passwordStrength = document.getElementById("passwordStrength");
      const passwordMatch = document.getElementById("passwordMatch");

      if (!passwordInput || !confirmPasswordInput) return;

      function updatePasswordFeedback() {
        const password = passwordInput.value;
        const score = [
          password.length > 8,
          /[A-Z]/.test(password),
          /[0-9]/.test(password),
          /[^A-Za-z0-9]/.test(password),
        ].filter(Boolean).length;
        
        const labels = ["pendiente", "muy débil", "débil", "aceptable", "segura"];
        passwordStrength.dataset.score = score;
        passwordStrength.querySelector(".strength-label").textContent = `Seguridad: ${labels[score]}`;

        const passwordsMatch = !confirmPasswordInput.value || password === confirmPasswordInput.value;
        confirmPasswordInput.setCustomValidity(passwordsMatch ? "" : "Las contraseñas no coinciden.");
        passwordMatch.textContent = passwordsMatch ? "Las contraseñas coinciden." : "Las contraseñas no coinciden.";
        passwordMatch.classList.toggle("is-error", !passwordsMatch);
      }

      passwordInput.addEventListener("input", () => {
        passwordInput.setCustomValidity(
          passwordInput.value && !passwordIsValid(passwordInput.value)
            ? "La contraseña debe tener más de 8 caracteres, una mayúscula, un número y un símbolo."
            : ""
        );
        updatePasswordFeedback();
      });

      confirmPasswordInput.addEventListener("input", updatePasswordFeedback);
    }

    // Cargar e iniciar Modal de Registro
    function loadRegisterModal(prefillEmail = "") {
      openModalView("modal-register", () => {
        const form = document.getElementById("registerForm");
        if (prefillEmail && form.email) form.email.value = prefillEmail;
        
        bindPasswordEvents();

        document.getElementById("openResendModal")?.addEventListener("click", () => {
          loadResendModal(form.email.value);
        });

        form.addEventListener("submit", async (e) => {
          e.preventDefault();
          const passwordInput = document.getElementById("password");
          const confirmPasswordInput = document.getElementById("confirmPassword");

          if (!passwordIsValid(passwordInput.value)) {
            passwordInput.setCustomValidity("La contraseña no cumple los requisitos de seguridad.");
            passwordInput.reportValidity();
            return;
          }

          if (passwordInput.value !== confirmPasswordInput.value) {
            confirmPasswordInput.reportValidity();
            return;
          }

          const data = Object.fromEntries(new FormData(form));
          delete data.confirmPassword;

          try {
            const response = await fetch("/api/auth/register", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(data),
            });
            const result = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(result.message || "No fue posible crear la cuenta.");
            
            showFeedback({
              title: "¡Cuenta Creada!",
              message: "Te hemos enviado un enlace de confirmación a tu correo electrónico. Por favor, revísalo para continuar.",
              icon: "verified_user"
            });
          } catch (error) {
            showFeedback({
              title: "Error al registrar",
              message: error.message || "Ocurrió un error inesperado al conectar con el servidor.",
              icon: "warning"
            });
          }
        });

        form.querySelector("input")?.focus();
      });
    }

    // Cargar e iniciar Modal de Reenviar
    function loadResendModal(prefillEmail = "") {
      openModalView("modal-resend", () => {
        const form = document.getElementById("resendForm");
        const emailInput = document.getElementById("resendEmail");
        if (prefillEmail) emailInput.value = prefillEmail;

        document.getElementById("backToRegister")?.addEventListener("click", () => {
          loadRegisterModal(emailInput.value);
        });

        form.addEventListener("submit", async (e) => {
          e.preventDefault();
          const email = emailInput.value;

          try {
            const response = await fetch("/api/auth/resend-verification", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email }),
            });
            const result = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(result.message || "No fue posible reenviar el correo.");
            
            showFeedback({
              title: "Correo Reenviado",
              message: "Si existe una cuenta asociada a este correo, recibirás un enlace de activación pronto.",
              icon: "mark_email_read"
            });
          } catch (error) {
            showFeedback({
              title: "Error al enviar",
              message: error.message || "Ocurrió un error de red al intentar reenviar el correo.",
              icon: "warning"
            });
          }
        });

        emailInput?.focus();
      });
    }

    // Listeners Globales
    registerBtn?.addEventListener("click", () => loadRegisterModal());

    backdrop?.addEventListener("click", (event) => {
      if (event.target === backdrop) closeModal();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && backdrop?.style.display === "flex") closeModal();
    });
  });
})();

document.addEventListener('DOMContentLoaded', () => {
  const downloadBtn = document.getElementById('downloadBtn');

  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      // Feedback visual inmediato en el botón
      const originalText = downloadBtn.innerHTML;
      downloadBtn.style.opacity = '0.8';
      
      // Restablecer estado después de 2 segundos
      setTimeout(() => {
        downloadBtn.style.opacity = '1';
      }, 2000);
    });
  }
});