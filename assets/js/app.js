/* ==========================================================================
   AI 활용 교사 연수 — app.js
   manifest.json에 등록된 회차 폴더의 content.json을 읽어와
   왼쪽 탭 목록과 오른쪽 상세 내용을 그린다.
   ========================================================================== */

(function () {
  "use strict";

  const navEl = document.getElementById("roundNav");
  const contentEl = document.getElementById("content");
  const sidebarEl = document.getElementById("sidebar");
  const backdropEl = document.getElementById("sidebarBackdrop");
  const toggleBtn = document.getElementById("sidebarToggle");

  let rounds = []; // { id, folder, data }

  init();

  async function init() {
    try {
      const manifest = await fetchJSON("data/manifest.json");

      if (manifest.siteTitle) {
        document.getElementById("siteTitle").textContent = manifest.siteTitle;
        document.title = manifest.siteTitle;
      }
      if (manifest.siteSubtitle) {
        document.getElementById("siteSubtitle").textContent = manifest.siteSubtitle;
      }

      const entries = manifest.rounds || [];
      if (entries.length === 0) {
        navEl.innerHTML = '<li class="state-msg">등록된 회차가 없습니다.</li>';
        contentEl.innerHTML = '<div class="state-msg">manifest.json에 회차를 추가해주세요.</div>';
        return;
      }

      const loaded = await Promise.all(
        entries.map(async (entry) => {
          try {
            const data = await fetchJSON(`${entry.folder}/content.json`);
            return { id: entry.id, folder: entry.folder, data };
          } catch (e) {
            console.error(`${entry.folder}/content.json 로드 실패`, e);
            return null;
          }
        })
      );

      rounds = loaded.filter(Boolean).sort((a, b) => (a.data.round || 0) - (b.data.round || 0));

      if (rounds.length === 0) {
        navEl.innerHTML = '<li class="state-msg">회차 내용을 불러오지 못했습니다.</li>';
        return;
      }

      renderNav();

      // URL 해시로 특정 회차 지정 가능 (#round01)
      const hashId = (location.hash || "").replace("#", "");
      const startIndex = Math.max(0, rounds.findIndex((r) => r.id === hashId));
      renderRound(rounds[startIndex === -1 ? rounds.length - 1 : startIndex]);
    } catch (err) {
      console.error(err);
      navEl.innerHTML = '<li class="state-msg">목록을 불러오는 중 문제가 발생했습니다.</li>';
      contentEl.innerHTML = '<div class="state-msg">data/manifest.json 파일을 확인해주세요.</div>';
    }
  }

  function fetchJSON(path) {
    return fetch(path, { cache: "no-cache" }).then((res) => {
      if (!res.ok) throw new Error(`${path} (${res.status})`);
      return res.json();
    });
  }

  function renderNav() {
    navEl.innerHTML = "";
    rounds.forEach((r) => {
      const li = document.createElement("li");
      const btn = document.createElement("button");
      btn.className = "round-tab";
      btn.id = `tab-${r.id}`;
      btn.innerHTML = `
        <span class="tab-num">${String(r.data.round ?? "").padStart(2, "0")}</span>
        <span class="tab-text">
          <span class="tab-title">${escapeHTML(r.data.title || "제목 없음")}</span>
          <span class="tab-date">${escapeHTML(r.data.date || "")}</span>
        </span>
      `;
      btn.addEventListener("click", () => {
        renderRound(r);
        closeMobileSidebar();
      });
      li.appendChild(btn);
      navEl.appendChild(li);
    });
  }

  function renderRound(r) {
    if (!r) return;
    location.hash = r.id;

    document.querySelectorAll(".round-tab").forEach((el) => el.classList.remove("active"));
    const activeTab = document.getElementById(`tab-${r.id}`);
    if (activeTab) activeTab.classList.add("active");

    const d = r.data;

    const summaryHTML = (d.summary || [])
      .map((s) => `<li>${escapeHTML(s)}</li>`)
      .join("");

    const practiceHTML = (d.practice || [])
      .map(
        (p, i) => `
        <div class="practice-card">
          <div class="practice-head">
            <h3>${escapeHTML(p.title || "")}</h3>
            ${p.description ? `<p>${escapeHTML(p.description)}</p>` : ""}
          </div>
          <div class="practice-body">
            <button class="copy-btn" data-copy-index="${i}">복사</button>
            <pre id="practice-${r.id}-${i}">${escapeHTML(p.content || "")}</pre>
          </div>
        </div>`
      )
      .join("");

    const referencesHTML = (d.references || [])
      .map(
        (ref) =>
          `<li><a href="${escapeAttr(ref.url || "#")}" target="_blank" rel="noopener noreferrer">${escapeHTML(
            ref.label || ref.url || ""
          )}</a></li>`
      )
      .join("");

    contentEl.innerHTML = `
      <article class="page">
        <span class="round-badge"><span class="num">${String(d.round ?? "").padStart(
          2,
          "0"
        )}회차</span>${escapeHTML(d.date || "")}</span>
        <h2 class="round-title">${escapeHTML(d.title || "")}</h2>

        ${
          summaryHTML
            ? `<div class="section">
                 <div class="section-label">이번 시간 핵심 포인트</div>
                 <ul class="summary-list">${summaryHTML}</ul>
               </div>`
            : ""
        }

        ${
          practiceHTML
            ? `<div class="section">
                 <div class="section-label">실습 · 프롬프트 샘플</div>
                 ${practiceHTML}
               </div>`
            : ""
        }

        ${
          referencesHTML
            ? `<div class="section">
                 <div class="section-label">참고 자료</div>
                 <ul class="reference-list">${referencesHTML}</ul>
               </div>`
            : ""
        }

        ${
          d.nextPreview
            ? `<div class="section">
                 <div class="next-preview">
                   <strong>다음 회차 예고</strong>
                   ${escapeHTML(d.nextPreview)}
                 </div>
               </div>`
            : ""
        }
      </article>
    `;

    contentEl.querySelectorAll(".copy-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = btn.getAttribute("data-copy-index");
        const pre = document.getElementById(`practice-${r.id}-${idx}`);
        if (!pre) return;
        navigator.clipboard.writeText(pre.textContent).then(() => {
          btn.textContent = "복사됨 ✓";
          btn.classList.add("copied");
          setTimeout(() => {
            btn.textContent = "복사";
            btn.classList.remove("copied");
          }, 1500);
        });
      });
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function escapeHTML(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\n/g, "<br>");
  }

  function escapeAttr(str) {
    return String(str).replace(/"/g, "&quot;");
  }

  // ---------- 모바일 사이드바 토글 ----------
  toggleBtn.addEventListener("click", () => {
    sidebarEl.classList.add("open");
    backdropEl.classList.add("open");
  });
  backdropEl.addEventListener("click", closeMobileSidebar);

  function closeMobileSidebar() {
    sidebarEl.classList.remove("open");
    backdropEl.classList.remove("open");
  }
})();
