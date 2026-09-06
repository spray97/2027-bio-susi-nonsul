/* 2027 생명공학 수시 논술 — 공용 스크립트
   - 다크모드 토글 (localStorage)
   - IntersectionObserver 진입 애니메이션
   - index: 표 정렬(기본 논술고사일 asc) + 행/카드 클릭 이동
   데이터는 빌드 시 HTML에 하드 렌더됨. JS는 진행형 향상만 담당(file:// 에서도 동작). */
(function () {
  "use strict";

  /* ---------- 테마 ---------- */
  var root = document.documentElement;
  try {
    var saved = localStorage.getItem("bio-nonsul-theme");
    if (saved === "dark" || saved === "light") root.setAttribute("data-theme", saved);
  } catch (e) {}

  function currentTheme() {
    var t = root.getAttribute("data-theme");
    if (t) return t;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  function syncToggleIcon() {
    var btn = document.querySelector(".theme-toggle iconify-icon");
    if (btn) btn.setAttribute("icon", currentTheme() === "dark" ? "solar:sun-2-linear" : "solar:moon-linear");
  }
  var toggle = document.querySelector(".theme-toggle");
  if (toggle) {
    syncToggleIcon();
    toggle.addEventListener("click", function () {
      var next = currentTheme() === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("bio-nonsul-theme", next); } catch (e) {}
      syncToggleIcon();
    });
  }

  /* ---------- 진입 애니메이션 (순수 CSS, JS는 가벼운 스태거만) ---------- */
  document.querySelectorAll(".reveal").forEach(function (el, i) {
    el.style.setProperty("--i", i % 6);
  });

  /* ---------- 행/카드 클릭 이동 ---------- */
  function wireNav(el) {
    var href = el.getAttribute("data-href");
    if (!href) return;
    el.addEventListener("click", function (ev) {
      if (ev.target.closest("a")) return; // 버튼/링크는 자체 동작
      location.href = href;
    });
    el.addEventListener("keydown", function (ev) {
      if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); location.href = href; }
    });
  }
  document.querySelectorAll("tr[data-href], .u-card[data-href]").forEach(wireNav);

  /* ---------- 표 정렬 ---------- */
  var table = document.querySelector("table.grid");
  if (!table) return;
  var tbody = table.tBodies[0];
  var rows = Array.prototype.slice.call(tbody.rows);

  var keyOf = {
    exam: function (r) { return r.getAttribute("data-exam") || "9999-99-99"; },
    apply: function (r) { return r.getAttribute("data-apply") || "9999-99-99"; },
    name: function (r) { return r.getAttribute("data-name") || ""; }
  };

  function sortBy(key, dir) {
    var f = keyOf[key] || keyOf.exam;
    rows.sort(function (a, b) {
      var va = f(a), vb = f(b), c;
      if (key === "name") c = va.localeCompare(vb, "ko");
      else c = va < vb ? -1 : va > vb ? 1 : 0;
      // 동률 시: 논술고사일 → 대학명(가나다) 순으로 안정적 정렬
      if (c === 0 && key !== "exam") c = keyOf.exam(a).localeCompare(keyOf.exam(b));
      if (c === 0 && key !== "name") c = keyOf.name(a).localeCompare(keyOf.name(b), "ko");
      return dir === "desc" ? -c : c;
    });
    rows.forEach(function (r) { tbody.appendChild(r); });
    table.querySelectorAll("thead th.sortable").forEach(function (th) {
      th.setAttribute("aria-sort", th.getAttribute("data-key") === key ? (dir === "desc" ? "descending" : "ascending") : "none");
    });
  }

  table.querySelectorAll("thead th.sortable").forEach(function (th) {
    th.addEventListener("click", function () {
      var key = th.getAttribute("data-key");
      var cur = th.getAttribute("aria-sort");
      var dir = cur === "ascending" ? "desc" : "asc";
      sortBy(key, dir);
    });
  });

  // 기본 정렬: 논술고사일 오름차순
  sortBy("exam", "asc");
})();
