(() => {
  const publicPages = new Set(['admin.html', 'portal.html']);
  const page = decodeURIComponent(location.pathname.split('/').pop() || 'dashboard.html').toLowerCase();
  if (publicPages.has(page)) return;

  const administrator = sessionStorage.getItem('wfpAdminSessionV1');
  if (administrator !== 'wobulenzipartners.com') {
    const returnTo = `${page}${location.search}${location.hash}`;
    location.replace(`admin.html?next=${encodeURIComponent(returnTo)}`);
    return;
  }

  document.addEventListener('DOMContentLoaded', () => {
    const nav = document.querySelector('.module-nav') || document.querySelector('header nav');
    if (!nav || nav.querySelector('.admin-session-link')) return;
    const signOut = document.createElement('a');
    signOut.href = 'admin.html?logout=1';
    signOut.className = 'admin-session-link';
    signOut.textContent = `Admin: ${administrator} · Sign out`;
    signOut.addEventListener('click', (event) => {
      event.preventDefault();
      sessionStorage.removeItem('wfpAdminSessionV1');
      location.replace('admin.html');
    });
    nav.appendChild(signOut);
  });
})();
