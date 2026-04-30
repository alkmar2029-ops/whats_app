/* ==========================================================================
   Wasl.ai (smartsapp.net) Landing Page JavaScript
   Arabic RTL Real Estate WhatsApp AI Agent — Dark Theme
   ========================================================================== */

(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.addEventListener('DOMContentLoaded', function () {

    /* ======================================================================
       1. Scroll Reveal Animation
       ====================================================================== */
    try {
      var revealElements = document.querySelectorAll('.reveal');

      if (revealElements.length > 0 && 'IntersectionObserver' in window && !prefersReducedMotion) {
        var revealObserver = new IntersectionObserver(
          function (entries) {
            entries.forEach(function (entry) {
              if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
              }
            });
          },
          { threshold: 0.15 }
        );

        revealElements.forEach(function (el) {
          revealObserver.observe(el);
        });

        // Safety fallback: force all .reveal visible after 4 seconds (only if tab visible)
        setTimeout(function () {
          if (document.hidden) return;
          revealElements.forEach(function (el) {
            if (!el.classList.contains('visible')) {
              el.classList.add('visible');
            }
          });
        }, 4000);

      } else {
        // Reduced motion or no IntersectionObserver — show everything
        revealElements.forEach(function (el) {
          el.classList.add('visible');
        });
      }
    } catch (e) {
      console.warn('[Reveal]', e);
      document.querySelectorAll('.reveal').forEach(function (el) {
        el.classList.add('visible');
      });
    }


    /* ======================================================================
       2. Live Chat Demo Animation
       ====================================================================== */
    try {
      var chatScenarios = [
        {
          tag: 'مكتب عقاري — الرياض',
          messages: [
            { type: 'user', text: 'السلام عليكم، أبحث عن شقة 3 غرف في الرياض، ميزانيتي 30 ألف', delay: 0 },
            { type: 'bot', text: 'وعليكم السلام! \uD83C\uDFE0\nوجدت لك 3 خيارات:\n1\uFE0F\u20E3 حي النرجس — 28,000 ر.س/سنة\n2\uFE0F\u20E3 حي الملقا — 32,000 ر.س/سنة\n3\uFE0F\u20E3 حي العارض — 25,000 ر.س/سنة\nأي واحد يناسبك؟', delay: 1800 },
            { type: 'user', text: 'الأول \uD83D\uDC4D', delay: 3500 },
            { type: 'bot', text: '\u2705 تم حجز معاينة يوم الأحد 3:00 م\nسيتواصل معك المسوق أحمد خلال دقائق', delay: 5000 }
          ]
        },
        {
          tag: 'شركة تطوير — جدة',
          messages: [
            { type: 'user', text: '\uD83C\uDFA4 رسالة صوتية (0:12)', delay: 0, isVoice: true },
            { type: 'bot', text: 'فهمت طلبك — تبحث عن فيلا في شمال جدة،\n4 غرف نوم، ميزانية حوالي مليون ونص.\nعندي خيارين ممتازين:', delay: 2000 },
            { type: 'bot', text: '1\uFE0F\u20E3 فيلا حي الشاطئ — 1,400,000 ر.س\n2\uFE0F\u20E3 فيلا حي أبحر — 1,550,000 ر.س\nتبي تفاصيل أكثر؟', delay: 4000 },
            { type: 'user', text: 'الثانية، أبي أشوفها', delay: 5500 },
            { type: 'bot', text: '\u2705 تم حجز معاينة يوم الثلاثاء 5:00 م\nالموقع: أبحر الشمالية\nسيتواصل معك المستشار سعد', delay: 7000 }
          ]
        },
        {
          tag: 'وكالة عقارية — الدمام',
          messages: [
            { type: 'bot', text: 'مرحبا أخ فهد! بخصوص فيلا حي الياسمين\nاللي عجبتك أمس — المالك وافق على السعر.', delay: 0 },
            { type: 'bot', text: 'تبي نثبت الحجز اليوم؟ \uD83D\uDD11', delay: 1800 },
            { type: 'user', text: 'تمام، أبيها \uD83D\uDD25', delay: 3500 },
            { type: 'bot', text: 'ممتاز! حولت المحادثة للمستشار خالد\nلإتمام الإجراءات. سيتواصل معك الآن. \u2705', delay: 5000 }
          ]
        }
      ];

      function initChatDemo() {
        var container = document.querySelector('#hero-chat .phone-messages');
        var tagEl = document.querySelector('#hero-chat .chat-tag-text');
        if (!container) return;

        var scenarioIndex = 0;
        var timers = [];
        var isRunning = true;

        function clearTimers() {
          timers.forEach(function (t) { clearTimeout(t); });
          timers = [];
        }

        function createTypingIndicator() {
          var el = document.createElement('div');
          el.className = 'typing-indicator';
          el.innerHTML = '<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>';
          return el;
        }

        function createMessageEl(msg) {
          var msgEl = document.createElement('div');
          msgEl.className = 'msg msg-' + msg.type;

          if (msg.isVoice) {
            msgEl.innerHTML = '<div class="voice-msg">' +
              '<span class="voice-icon">\uD83C\uDFA4</span>' +
              '<span class="voice-wave">\u2581\u2583\u2585\u2587\u2585\u2583\u2581\u2583\u2585\u2587\u2585\u2583\u2581</span>' +
              '<span class="voice-time">0:12</span>' +
              '</div>';
          } else {
            // Preserve newlines
            var lines = msg.text.split('\n');
            lines.forEach(function (line, i) {
              msgEl.appendChild(document.createTextNode(line));
              if (i < lines.length - 1) {
                msgEl.appendChild(document.createElement('br'));
              }
            });
          }

          return msgEl;
        }

        function scrollToBottom() {
          container.scrollTop = container.scrollHeight;
        }

        function playScenario(scenario) {
          clearTimers();
          container.innerHTML = '';
          if (tagEl) tagEl.textContent = scenario.tag;

          scenario.messages.forEach(function (msg) {
            var typingDelay = Math.max(0, msg.delay - 800);

            // Show typing indicator before bot messages
            if (msg.type === 'bot') {
              timers.push(setTimeout(function () {
                if (!isRunning) return;
                var existing = container.querySelector('.typing-indicator');
                if (existing) existing.remove();
                container.appendChild(createTypingIndicator());
                scrollToBottom();
              }, typingDelay));
            }

            // Show the actual message
            timers.push(setTimeout(function () {
              if (!isRunning) return;
              var typing = container.querySelector('.typing-indicator');
              if (typing) typing.remove();

              var msgEl = createMessageEl(msg);
              container.appendChild(msgEl);

              // Double rAF for reliable animation trigger
              requestAnimationFrame(function () {
                requestAnimationFrame(function () {
                  msgEl.classList.add('visible');
                  scrollToBottom();
                });
              });
            }, msg.delay));
          });

          // Cycle to next scenario after last message + 4s pause
          var lastDelay = scenario.messages[scenario.messages.length - 1].delay;
          timers.push(setTimeout(function () {
            if (!isRunning) return;
            scenarioIndex = (scenarioIndex + 1) % chatScenarios.length;
            playScenario(chatScenarios[scenarioIndex]);
          }, lastDelay + 4000));
        }

        // Pause/resume on visibility change
        document.addEventListener('visibilitychange', function () {
          if (document.hidden) {
            isRunning = false;
            clearTimers();
          } else {
            isRunning = true;
            playScenario(chatScenarios[scenarioIndex]);
          }
        });

        playScenario(chatScenarios[0]);
      }

      // Reduced motion: show first scenario statically
      if (prefersReducedMotion) {
        var staticContainer = document.querySelector('#hero-chat .phone-messages');
        var staticTag = document.querySelector('#hero-chat .chat-tag-text');
        if (staticContainer) {
          if (staticTag) staticTag.textContent = chatScenarios[0].tag;
          chatScenarios[0].messages.forEach(function (msg) {
            var el = document.createElement('div');
            el.className = 'msg msg-' + msg.type + ' visible';
            msg.text.split('\n').forEach(function (line, i, arr) {
              el.appendChild(document.createTextNode(line));
              if (i < arr.length - 1) el.appendChild(document.createElement('br'));
            });
            staticContainer.appendChild(el);
          });
        }
      } else {
        initChatDemo();
      }
    } catch (e) {
      console.warn('[ChatDemo]', e);
    }


    /* ======================================================================
       3. Navbar Scroll Effect
       ====================================================================== */
    try {
      var navbar = document.querySelector('.navbar');
      var navTicking = false;

      function updateNavbar() {
        if (!navbar) return;
        if (window.scrollY > 50) {
          navbar.classList.add('scrolled');
        } else {
          navbar.classList.remove('scrolled');
        }
        navTicking = false;
      }

      window.addEventListener('scroll', function () {
        if (!navTicking) {
          requestAnimationFrame(updateNavbar);
          navTicking = true;
        }
      }, { passive: true });

      updateNavbar();
    } catch (e) {
      console.warn('[Navbar]', e);
    }


    /* ======================================================================
       4. Smooth Scroll for Anchor Links
       ====================================================================== */
    try {
      var NAV_OFFSET = 80;

      document.querySelectorAll('a[href^="#"]').forEach(function (link) {
        link.addEventListener('click', function (e) {
          var href = link.getAttribute('href');
          if (!href || href === '#') return;

          var target = document.querySelector(href);
          if (!target) return;

          e.preventDefault();
          var top = target.getBoundingClientRect().top + window.scrollY - NAV_OFFSET;

          if (prefersReducedMotion) {
            window.scrollTo(0, top);
          } else {
            window.scrollTo({ top: top, behavior: 'smooth' });
          }

          // Close mobile menu if open
          document.body.classList.remove('nav-open');
        });
      });
    } catch (e) {
      console.warn('[SmoothScroll]', e);
    }


    /* ======================================================================
       5. Pricing Toggle (Monthly / Yearly)
       ====================================================================== */
    try {
      var priceAmounts = document.querySelectorAll('[data-monthly][data-yearly]');
      var periodLabels = document.querySelectorAll('.price-period');
      var discountBadge = document.querySelector('.discount-badge');
      var periodBtns = document.querySelectorAll('[data-period]');

      function setPricing(isYearly) {
        periodBtns.forEach(function (btn) {
          var p = btn.getAttribute('data-period');
          btn.classList.toggle('active', (isYearly && p === 'yearly') || (!isYearly && p === 'monthly'));
        });

        priceAmounts.forEach(function (el) {
          el.textContent = isYearly ? el.getAttribute('data-yearly') : el.getAttribute('data-monthly');
        });

        periodLabels.forEach(function (el) {
          el.textContent = isYearly ? 'ر.س / سنوياً' : 'ر.س / شهرياً';
        });

        if (discountBadge) {
          discountBadge.style.opacity = isYearly ? '1' : '0.5';
        }
      }

      periodBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
          setPricing(btn.getAttribute('data-period') === 'yearly');
        });
      });
    } catch (e) {
      console.warn('[Pricing]', e);
    }


    /* ======================================================================
       6. FAQ Accordion
       ====================================================================== */
    try {
      var faqItems = document.querySelectorAll('.faq-item');

      faqItems.forEach(function (item) {
        var question = item.querySelector('.faq-question') || item.querySelector('summary');
        if (!question) return;

        if (item.tagName !== 'DETAILS') {
          // div-based accordion with max-height animation
          question.addEventListener('click', function () {
            var wasOpen = item.classList.contains('open');

            faqItems.forEach(function (other) {
              if (other !== item) {
                other.classList.remove('open');
                var ans = other.querySelector('.faq-answer');
                if (ans) ans.style.maxHeight = null;
              }
            });

            item.classList.toggle('open', !wasOpen);
            var answer = item.querySelector('.faq-answer');
            if (answer) {
              answer.style.maxHeight = !wasOpen ? answer.scrollHeight + 'px' : null;
            }
          });
        } else {
          // <details> element — close siblings on open
          question.addEventListener('click', function () {
            faqItems.forEach(function (other) {
              if (other !== item && other.hasAttribute('open')) {
                other.removeAttribute('open');
              }
            });
          });
        }
      });
    } catch (e) {
      console.warn('[FAQ]', e);
    }


    /* ======================================================================
       7. Animated Stat Counters
       ====================================================================== */
    try {
      var counterEls = document.querySelectorAll('.stat-value[data-counter], [data-target]');

      function easeOutQuart(t) {
        return 1 - Math.pow(1 - t, 4);
      }

      function animateCounter(el) {
        var target = parseFloat(el.getAttribute('data-counter') || el.getAttribute('data-target'));
        if (isNaN(target)) return;

        var suffix = el.getAttribute('data-suffix') || '';
        var prefix = el.getAttribute('data-prefix') || '';
        var duration = prefersReducedMotion ? 0 : 2000;
        var isFloat = target % 1 !== 0;

        function fmt(v) {
          return prefix + (isFloat ? v.toFixed(1) : Math.floor(v)) + suffix;
        }

        if (duration === 0) { el.textContent = fmt(target); return; }

        var start = null;
        function tick(ts) {
          if (!start) start = ts;
          var progress = Math.min((ts - start) / duration, 1);
          el.textContent = fmt(easeOutQuart(progress) * target);
          if (progress < 1) {
            requestAnimationFrame(tick);
          } else {
            el.textContent = fmt(target);
          }
        }
        requestAnimationFrame(tick);
      }

      if (counterEls.length > 0 && 'IntersectionObserver' in window) {
        var counterObserver = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              animateCounter(entry.target);
              counterObserver.unobserve(entry.target);
            }
          });
        }, { threshold: 0.15 });

        counterEls.forEach(function (el) { counterObserver.observe(el); });
      } else {
        counterEls.forEach(animateCounter);
      }
    } catch (e) {
      console.warn('[Counters]', e);
    }


    /* ======================================================================
       8. Dashboard Tabs
       ====================================================================== */
    try {
      var tabBtns = document.querySelectorAll('.tab-btn');
      var dashPanels = document.querySelectorAll('.dashboard-panel');

      if (tabBtns.length > 0) {
        tabBtns.forEach(function (btn) {
          btn.addEventListener('click', function () {
            var targetId = btn.getAttribute('data-tab') || btn.getAttribute('data-target');

            tabBtns.forEach(function (b) { b.classList.remove('active'); });
            dashPanels.forEach(function (p) { p.classList.remove('active'); });

            btn.classList.add('active');
            if (targetId) {
              var panel = document.querySelector(targetId) || document.getElementById(targetId);
              if (panel) panel.classList.add('active');
            }
          });
        });
      }
    } catch (e) {
      console.warn('[Tabs]', e);
    }


    /* ======================================================================
       9. Carousel for Chat Demos Section
       ====================================================================== */
    try {
      var track = document.querySelector('.chat-track');
      var prevBtn = document.querySelector('.carousel-btn-prev');
      var nextBtn = document.querySelector('.carousel-btn-next');
      var dots = document.querySelectorAll('.carousel-dot');

      if (track && track.children.length > 0) {
        var slideIndex = 0;
        var slideCount = track.children.length;
        var autoTimer = null;

        function getSlideWidth() {
          var card = track.children[0];
          var cs = getComputedStyle(card);
          return card.offsetWidth + parseInt(cs.marginLeft || 0) + parseInt(cs.marginRight || 0);
        }

        function moveCarousel() {
          var w = getSlideWidth();
          var isRTL = getComputedStyle(document.documentElement).direction === 'rtl';
          track.style.transform = isRTL
            ? 'translateX(' + (slideIndex * w) + 'px)'
            : 'translateX(-' + (slideIndex * w) + 'px)';

          dots.forEach(function (d, i) { d.classList.toggle('active', i === slideIndex); });
        }

        function next() { slideIndex = (slideIndex + 1) % slideCount; moveCarousel(); }
        function prev() { slideIndex = (slideIndex - 1 + slideCount) % slideCount; moveCarousel(); }

        function startAuto() {
          stopAuto();
          autoTimer = setInterval(next, 8000);
        }
        function stopAuto() {
          if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
        }

        if (nextBtn) nextBtn.addEventListener('click', function () { next(); startAuto(); });
        if (prevBtn) prevBtn.addEventListener('click', function () { prev(); startAuto(); });
        dots.forEach(function (d, i) {
          d.addEventListener('click', function () { slideIndex = i; moveCarousel(); startAuto(); });
        });

        moveCarousel();
        if (!prefersReducedMotion) startAuto();

        document.addEventListener('visibilitychange', function () {
          if (document.hidden) stopAuto();
          else if (!prefersReducedMotion) startAuto();
        });
      }
    } catch (e) {
      console.warn('[Carousel]', e);
    }


    /* ======================================================================
       10. Mobile Menu
       ====================================================================== */
    try {
      var menuToggle = document.querySelector('.menu-toggle') || document.querySelector('.mobile-toggle');
      var mobileMenu = document.querySelector('.mobile-menu');

      if (menuToggle) {
        function closeMobileMenu() {
          document.body.classList.remove('nav-open');
          menuToggle.setAttribute('aria-expanded', 'false');
          if (mobileMenu) mobileMenu.classList.remove('open');
        }

        menuToggle.addEventListener('click', function (e) {
          e.stopPropagation();
          var opening = !document.body.classList.contains('nav-open');
          document.body.classList.toggle('nav-open', opening);
          menuToggle.setAttribute('aria-expanded', opening ? 'true' : 'false');
          if (mobileMenu) mobileMenu.classList.toggle('open', opening);
          menuToggle.setAttribute('aria-expanded', String(document.body.classList.contains('nav-open')));
        });

        // Close on nav link click
        document.querySelectorAll('.mobile-menu a, .nav-links a').forEach(function (link) {
          link.addEventListener('click', closeMobileMenu);
        });

        // Close on outside click
        document.addEventListener('click', function (e) {
          if (!document.body.classList.contains('nav-open')) return;
          var nav = document.querySelector('.navbar');
          if (nav && !nav.contains(e.target)) closeMobileMenu();
        });

        // Close on Escape
        document.addEventListener('keydown', function (e) {
          if (e.key === 'Escape' && document.body.classList.contains('nav-open')) {
            closeMobileMenu();
            menuToggle.focus();
          }
        });

        // Close on resize past breakpoint
        window.addEventListener('resize', function () {
          if (window.innerWidth > 1024) closeMobileMenu();
        });
      }
    } catch (e) {
      console.warn('[MobileMenu]', e);
    }


    /* ======================================================================
       11. Active Nav Link Highlighting
       ====================================================================== */
    try {
      var sections = document.querySelectorAll('section[id]');
      var navAnchors = document.querySelectorAll('.nav-links a');

      if (sections.length > 0 && navAnchors.length > 0 && 'IntersectionObserver' in window) {
        var sectionObserver = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              var id = entry.target.getAttribute('id');
              navAnchors.forEach(function (a) {
                a.classList.toggle('active', a.getAttribute('href') === '#' + id);
              });
            }
          });
        }, { threshold: 0.3, rootMargin: '-80px 0px -40% 0px' });

        sections.forEach(function (s) { sectionObserver.observe(s); });
      }
    } catch (e) {
      console.warn('[ActiveNav]', e);
    }


    /* ======================================================================
       12. Back to Top Button
       ====================================================================== */
    try {
      var btt = document.querySelector('.back-to-top');
      if (btt) {
        var bttTicking = false;

        function checkBtt() {
          btt.classList.toggle('visible', window.scrollY > 500);
          bttTicking = false;
        }

        window.addEventListener('scroll', function () {
          if (!bttTicking) { requestAnimationFrame(checkBtt); bttTicking = true; }
        }, { passive: true });

        btt.addEventListener('click', function () {
          if (prefersReducedMotion) window.scrollTo(0, 0);
          else window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        checkBtt();
      }
    } catch (e) {
      console.warn('[BackToTop]', e);
    }


    /* ======================================================================
       13. Copyright Year Auto-Update
       ====================================================================== */
    try {
      var yr = new Date().getFullYear();
      document.querySelectorAll('[data-year], .footer-bottom span').forEach(function (el) {
        if (el.hasAttribute('data-year')) {
          el.textContent = yr;
        } else if (el.textContent.indexOf('\u00A9') !== -1) {
          el.textContent = el.textContent.replace(/\d{4}/, yr);
        }
      });
    } catch (e) { /* silent */ }

  }); // end DOMContentLoaded
})();
