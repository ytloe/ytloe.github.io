document.addEventListener("DOMContentLoaded", () => {
  // ==========================================================
  // [新增] "最近更新于" 模块
  // ==========================================================
  const addLastUpdatedText = () => {
    // *** 您只需在这里修改日期即可 ***
    const lastUpdatedDate = "2025.07.30";

    const infoDiv = document.createElement("div");
    infoDiv.className = "update-info";
    infoDiv.textContent = `最近更新于 ${lastUpdatedDate}`;
    document.body.appendChild(infoDiv);
  };
  addLastUpdatedText();

  // ==========================================================
  // [1] 自动为所有书签设置新标签页打开
  // ==========================================================
  const allBookmarkLinks = document.querySelectorAll(".bookmark-item");
  allBookmarkLinks.forEach(link => {
    if (link.getAttribute("href") && !link.getAttribute("href").startsWith("#")) {
      link.setAttribute("target", "_blank");
      link.setAttribute("rel", "noopener noreferrer");
    }
  });

  // ==========================================================
  // [2] 全局禁止拖拽书签链接
  // ==========================================================
  document.addEventListener("dragstart", event => {
    if (event.target.closest(".bookmark-item")) {
      event.preventDefault();
    }
  });

  // --- 主题管理模块 ---
  const themeToggleBtn = document.getElementById("theme-toggle-btn");
  const body = document.body;
  const applyTheme = theme => {
    theme === "dark" ? body.classList.add("dark-mode") : body.classList.remove("dark-mode");
  };
  const toggleTheme = () => {
    const currentTheme = body.classList.contains("dark-mode") ? "light" : "dark";
    applyTheme(currentTheme);
    localStorage.setItem("theme", currentTheme);
  };
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme) {
    applyTheme(savedTheme);
  } else {
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    applyTheme(prefersDark ? "dark" : "light");
  }
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", toggleTheme);
  }

  // --- 侧栏与内容切换模块 ---
  const sidebar = document.getElementById("sidebar");
  const sidebarToggleBtn = document.getElementById("sidebar-toggle");
  const categoryButtons = document.querySelectorAll(".category-btn");
  const contentSections = document.querySelectorAll(".content-section");
  sidebarToggleBtn.addEventListener("click", event => {
    event.stopPropagation();
    sidebar.classList.toggle("open");
  });
  document.addEventListener("click", event => {
    if (sidebar.classList.contains("open") && !sidebar.contains(event.target) && event.target !== sidebarToggleBtn) {
      sidebar.classList.remove("open");
    }
  });
  categoryButtons.forEach(button => {
    button.addEventListener("click", () => {
      const targetId = button.getAttribute("data-target");
      contentSections.forEach(section => {
        section.classList.remove("active");
      });
      const targetSection = document.getElementById(targetId);
      if (targetSection) {
        targetSection.classList.add("active");
        applyMasonryLayout();
      }
      if (window.innerWidth < 768) {
        sidebar.classList.remove("open");
      }
    });
  });

  // --- 瀑布流布局模块 ---
  const applyMasonryLayout = () => {
    const container = document.querySelector(".content-section.active .bookmark-container");
    if (!container) return;
    const cards = Array.from(container.children).filter(child => child.classList.contains("category-card"));
    if (cards.length === 0) {
      container.style.height = "0px";
      return;
    }
    const cardWidth = 280;
    const gap = 20;
    let numColumns = Math.floor(container.clientWidth / (cardWidth + gap));
    if (numColumns < 1) numColumns = 1;
    if (window.innerWidth <= 620) {
      numColumns = 1;
    }
    const totalLayoutWidth = numColumns * cardWidth + (numColumns - 1) * gap;
    let horizontalOffset = (container.clientWidth - totalLayoutWidth) / 2;
    if (horizontalOffset < 0) {
      horizontalOffset = gap / 2;
    }
    const columnHeights = Array(numColumns).fill(0);
    cards.forEach(card => {
      card.style.position = "absolute";
      const minHeight = Math.min(...columnHeights);
      const shortestColumnIndex = columnHeights.indexOf(minHeight);
      card.style.top = `${minHeight}px`;
      if (numColumns > 1) {
        card.style.left = `${horizontalOffset + shortestColumnIndex * (cardWidth + gap)}px`;
        card.style.width = `${cardWidth}px`;
      } else {
        card.style.left = "";
        card.style.width = "";
      }
      columnHeights[shortestColumnIndex] += card.offsetHeight + gap;
    });
    const containerHeight = Math.max(...columnHeights);
    container.style.height = `${containerHeight - gap}px`;
  };

  // --- 自定义右键菜单模块 ---
  const contextMenu = document.getElementById("custom-context-menu");
  document.addEventListener("contextmenu", event => {
    const bookmarkItem = event.target.closest(".bookmark-item");
    if (bookmarkItem) {
      event.preventDefault();
      const url = bookmarkItem.getAttribute("href");
      const nameNode = bookmarkItem.cloneNode(true);
      const statusDot = nameNode.querySelector(".status-dot");
      if (statusDot) {
        nameNode.removeChild(statusDot);
      }
      const name = nameNode.textContent.trim();
      contextMenu.innerHTML = `<div class="context-menu-item" data-action="copy-name">复制名称: ${name}</div><div class="context-menu-item" data-action="copy-url">复制网址</div>`;
      contextMenu.style.top = `${event.clientY}px`;
      contextMenu.style.left = `${event.clientX}px`;
      contextMenu.style.display = "block";
      contextMenu.querySelector('[data-action="copy-name"]').addEventListener("click", () => {
        navigator.clipboard.writeText(name).then(() => hideContextMenu());
      });
      contextMenu.querySelector('[data-action="copy-url"]').addEventListener("click", () => {
        navigator.clipboard.writeText(url).then(() => hideContextMenu());
      });
    } else {
      hideContextMenu();
    }
  });
  document.addEventListener("click", () => {
    hideContextMenu();
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      hideContextMenu();
    }
  });
  function hideContextMenu() {
    if (contextMenu) {
      contextMenu.style.display = "none";
    }
  }

  // --- 事件监听与初始加载 ---
  setTimeout(applyMasonryLayout, 100);
  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(applyMasonryLayout, 75);
  });
});
