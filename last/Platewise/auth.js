const apiBase = '';

function openWelcome(name) {
  const title = document.getElementById('welcomeTitle');
  const message = document.getElementById('welcomeMessage');
  if (title && message) {
    title.textContent = 'Welcome to PlateWise';
    message.textContent = name ? `Welcome, ${name}. Your meal plan is ready.` : 'Your meal plan is ready.';
  }
}

document.addEventListener('DOMContentLoaded', function () {
  const signupForm = document.getElementById('signupForm');
  const signinForm = document.getElementById('signinForm');

  if (signupForm) {
    signupForm.addEventListener('submit', async function (event) {
      event.preventDefault();
      const payload = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value
      };

      try {
        const response = await fetch(`${apiBase}/api/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const result = await response.json();
        if (!response.ok) {
          alert(result.message || 'Sign up failed');
          return;
        }

        localStorage.setItem('platewise_user', JSON.stringify(result.user));
        window.location.href = 'welcome.html';
      } catch (error) {
        alert('Sign up could not be completed');
      }
    });
  }

  if (signinForm) {
    signinForm.addEventListener('submit', async function (event) {
      event.preventDefault();
      const payload = {
        email: document.getElementById('email').value,
        password: document.getElementById('password').value
      };

      try {
        const response = await fetch(`${apiBase}/api/signin`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const result = await response.json();
        if (!response.ok) {
          alert(result.message || 'Sign in failed');
          return;
        }

        localStorage.setItem('platewise_user', JSON.stringify(result.user));
        window.location.href = 'welcome.html';
      } catch (error) {
        alert('Sign in could not be completed');
      }
    });
  }

  const currentUser = localStorage.getItem('platewise_user');
  if (document.getElementById('welcomeTitle') && currentUser) {
    const user = JSON.parse(currentUser);
    if (user && user.name) {
      openWelcome(user.name);
    }
  }

  const signOut = document.getElementById('signOut');
  if (signOut) {
    signOut.addEventListener('click', function () {
      localStorage.removeItem('platewise_user');
    });
  }
});
