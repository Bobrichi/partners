(() => {
  const current = location.pathname.split('/').pop() || 'index.html';
  const modules = [
    ['dashboard.html', 'Dashboard', '&#9635;'],
    ['members.html', 'Member profiles', '&#9823;', 'Members'],
    ['records.html', 'Member records', '&#9776;', 'Members'],
    ['portal.html', 'Member portal', '&#9673;', 'Members'],
    ['savings.html', 'Savings and shares', '$', 'Finance'],
    ['loans.html', 'Loans', '&#8599;', 'Finance'],
    ['records.html', 'Transactions', '&#8646;', 'Finance'],
    ['reports.html', 'Reports', '&#9638;'],
    ['admin.html', 'Administration', '&#9881;']
  ];
  let sidebar = document.querySelector('.module-sidebar');
  const shared = !sidebar;
  if (shared) {
    const grouped = name => modules.filter(item => item[3] === name);
    const link = ([href, label, icon]) => `<a class="module-link" href="${href}"><span class="module-icon" aria-hidden="true">${icon}</span><span>${label}</span></a>`;
    sidebar = document.createElement('aside');
    sidebar.className = 'app-module-sidebar module-sidebar';
    sidebar.setAttribute('aria-label', 'System navigation');
    sidebar.innerHTML = `<a class="sidebar-brand" href="dashboard.html"><img src="images/logo.jpeg" alt=""><span>WFP<span>SACCO workspace</span></span></a><button class="sidebar-collapse" type="button" aria-expanded="true" aria-label="Collapse sidebar"><span>&lt;</span><span class="collapse-label">Collapse menu</span></button><nav class="module-nav" aria-label="System modules">${link(modules[0])}<details class="module-group"><summary><span class="module-icon" aria-hidden="true">&#9823;</span><span>Members</span><span class="submenu-chevron" aria-hidden="true">&#8964;</span></summary><div class="module-submenu">${grouped('Members').map(link).join('')}</div></details><details class="module-group"><summary><span class="module-icon" aria-hidden="true">&#9638;</span><span>Finance</span><span class="submenu-chevron" aria-hidden="true">&#8964;</span></summary><div class="module-submenu">${grouped('Finance').map(link).join('')}</div></details>${link(modules[7])}${link(modules[8])}</nav><a class="sidebar-help" href="index.html">&lt;- <span>Sign in / Home</span></a>`;
    document.body.prepend(sidebar);
    document.body.classList.add('with-app-sidebar');
    const mobile = document.createElement('button');
    mobile.className = 'app-sidebar-mobile-toggle';
    mobile.type = 'button';
    mobile.setAttribute('aria-expanded', 'false');
    mobile.textContent = 'Menu';
    document.body.append(mobile);
    const setMobileOpen = open => {
      sidebar.classList.toggle('mobile-open', open);
      mobile.setAttribute('aria-expanded', String(open));
      mobile.textContent = open ? 'Close menu' : 'Menu';
    };
    mobile.addEventListener('click', () => setMobileOpen(!sidebar.classList.contains('mobile-open')));
    document.querySelectorAll('.module-nav a').forEach(a => a.addEventListener('click', () => setMobileOpen(false)));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && sidebar.classList.contains('mobile-open')) {
        setMobileOpen(false);
        mobile.focus();
      }
    });
  }
  sidebar.querySelectorAll('.module-nav a').forEach(a => {
    if (a.getAttribute('href') === current) {
      a.classList.add('is-active');
      a.setAttribute('aria-current', 'page');
      const group = a.closest('details');
      if (group) group.open = true;
    }
  });
  const collapse = sidebar.querySelector('.sidebar-collapse');
  if (collapse) collapse.addEventListener('click', () => {
    if (shared) sidebar.classList.toggle('is-collapsed');
    else sidebar.closest('.dashboard-layout')?.classList.toggle('is-collapsed');
    const collapsed = shared ? sidebar.classList.contains('is-collapsed') : sidebar.closest('.dashboard-layout')?.classList.contains('is-collapsed');
    collapse.setAttribute('aria-expanded', String(!collapsed));
    collapse.setAttribute('aria-label', collapsed ? 'Expand sidebar' : 'Collapse sidebar');
  });
})();
