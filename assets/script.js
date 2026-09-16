(function(){
  // Theme (light/dark) + direction (LTR/RTL) toggles
  var root = document.documentElement;
  var THEME_KEY = 'vernis-theme';
  var DIR_KEY = 'vernis-dir';

  var themeBtn = document.getElementById('themeToggle');
  if(themeBtn){
    var currentTheme = root.getAttribute('data-theme');
    if(!currentTheme){
      currentTheme = (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
    }
    themeBtn.setAttribute('aria-pressed', currentTheme === 'dark' ? 'true' : 'false');

    themeBtn.addEventListener('click', function(){
      var cur = root.getAttribute('data-theme');
      if(!cur){
        cur = (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
      }
      var next = cur === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      themeBtn.setAttribute('aria-pressed', next === 'dark' ? 'true' : 'false');
      try{ localStorage.setItem(THEME_KEY, next); }catch(e){}
    });
  }

  var dirBtn = document.getElementById('dirToggle');
  if(dirBtn){
    var setDirLabel = function(dir){
      var label = dir === 'rtl' ? 'Switch to left-to-right layout' : 'Switch to right-to-left layout';
      dirBtn.title = label;
      dirBtn.setAttribute('aria-label', label);
      dirBtn.setAttribute('aria-pressed', dir === 'rtl' ? 'true' : 'false');
    };
    setDirLabel(root.getAttribute('dir') === 'rtl' ? 'rtl' : 'ltr');

    dirBtn.addEventListener('click', function(){
      var cur = root.getAttribute('dir') === 'rtl' ? 'rtl' : 'ltr';
      var next = cur === 'rtl' ? 'ltr' : 'rtl';
      root.setAttribute('dir', next);
      setDirLabel(next);
      try{ localStorage.setItem(DIR_KEY, next); }catch(e){}
    });
  }

  var toggle = document.getElementById('navToggle');
  var links = document.getElementById('navLinks');

  if(toggle && links){
    toggle.addEventListener('click', function(){
      var open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var form = document.getElementById('bookingForm');
  var confirmBox = document.getElementById('confirmBox');
  var confirmTitle = document.getElementById('confirmTitle');
  var confirmBody = document.getElementById('confirmBody');

  if(form && confirmBox){
    form.addEventListener('submit', function(e){
      e.preventDefault();
      if(!form.checkValidity()){ form.reportValidity(); return; }
      var data = new FormData(form);
      var name = (data.get('name') || '').toString().trim().split(' ')[0];
      var service = data.get('service');
      var date = data.get('date');
      var time = data.get('time');
      var prettyDate = '';
      try{
        var d = new Date(date + 'T00:00:00');
        prettyDate = d.toLocaleDateString('en-IN', { weekday:'short', day:'numeric', month:'short' });
      }catch(err){ prettyDate = date; }
      confirmTitle.textContent = 'Thanks, ' + (name || 'there') + ' — request received.';
      confirmBody.textContent = service + ' on ' + prettyDate + ' at ' + time + ". We'll confirm by call or WhatsApp within 2 hours at the number you shared.";
      form.style.display = 'none';
      confirmBox.style.display = 'block';
    });

    var again = document.getElementById('bookAnother');
    if(again){
      again.addEventListener('click', function(e){
        e.preventDefault();
        form.reset();
        form.style.display = 'flex';
        confirmBox.style.display = 'none';
      });
    }
  }

  // Gallery filter tabs
  var tabs = document.querySelectorAll('.filter-tab');
  var cards = document.querySelectorAll('.gallery-card');
  if(tabs.length && cards.length){
    tabs.forEach(function(tab){
      tab.addEventListener('click', function(){
        tabs.forEach(function(t){ t.classList.remove('active'); });
        tab.classList.add('active');
        var cat = tab.getAttribute('data-filter');
        cards.forEach(function(card){
          var match = cat === 'all' || card.getAttribute('data-category') === cat;
          card.hidden = !match;
        });
      });
    });
  }

  // Newsletter sign-up (client-side confirmation)
  var newsletterForm = document.getElementById('newsletterForm');
  if(newsletterForm){
    newsletterForm.addEventListener('submit', function(e){
      e.preventDefault();
      var input = newsletterForm.querySelector('input[type="email"]');
      var note = document.getElementById('newsletterNote');
      if(input && input.checkValidity() && note){
        note.textContent = "You're on the list — look out for the next drop in your inbox.";
        input.value = '';
      }
    });
  }

  // ---------- Animation: reduced-motion check ----------
  var reducedMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  // ---------- Nav shadow on scroll ----------
  var navEl = document.querySelector('.nav');
  if(navEl){
    var onNavScroll = function(){
      if(window.scrollY > 8){ navEl.classList.add('scrolled'); }
      else{ navEl.classList.remove('scrolled'); }
    };
    onNavScroll();
    window.addEventListener('scroll', onNavScroll, {passive:true});
  }

  // ---------- Back-to-top button (injected on every page) ----------
  var backToTop = document.createElement('button');
  backToTop.className = 'back-to-top';
  backToTop.type = 'button';
  backToTop.setAttribute('aria-label', 'Back to top');
  backToTop.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"></path></svg>';
  document.body.appendChild(backToTop);
  var toggleBackToTop = function(){
    if(window.scrollY > 480){ backToTop.classList.add('show'); }
    else{ backToTop.classList.remove('show'); }
  };
  toggleBackToTop();
  window.addEventListener('scroll', toggleBackToTop, {passive:true});
  backToTop.addEventListener('click', function(){
    window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
  });

  // ---------- Scroll-triggered reveal ----------
  var revealTargets = document.querySelectorAll(
    '.card, .gallery-card, .package-card, .team-card, .step, .value-item, .faq-item, .insta-tile, .section-head, .quote'
  );
  if(revealTargets.length){
    revealTargets.forEach(function(el){ el.classList.add('reveal'); });
    if('IntersectionObserver' in window && !reducedMotion){
      var revealIO = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if(entry.isIntersecting){
            entry.target.classList.add('revealed');
            revealIO.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
      revealTargets.forEach(function(el){ revealIO.observe(el); });

      // Safety net: an instant jump (keyboard End, dragging the scrollbar
      // thumb, an in-page link to the footer) can land the page past an
      // element without the browser ever rendering a frame where it crossed
      // the viewport, so IntersectionObserver never fires for it and it would
      // otherwise stay invisible forever. Sweep on scroll/resize and reveal
      // anything already at or above the fold.
      var pendingReveal = Array.prototype.slice.call(revealTargets);
      var sweepTicking = false;
      function sweepReveal(){
        sweepTicking = false;
        pendingReveal = pendingReveal.filter(function(el){
          if(el.classList.contains('revealed')){ return false; }
          var r = el.getBoundingClientRect();
          if(r.top < window.innerHeight){
            el.classList.add('revealed');
            revealIO.unobserve(el);
            return false;
          }
          return true;
        });
        if(!pendingReveal.length){
          window.removeEventListener('scroll', requestSweep);
          window.removeEventListener('resize', requestSweep);
        }
      }
      function requestSweep(){
        if(!pendingReveal.length || sweepTicking) return;
        sweepTicking = true;
        requestAnimationFrame(sweepReveal);
      }
      window.addEventListener('scroll', requestSweep, { passive: true });
      window.addEventListener('resize', requestSweep);
      requestSweep();
    } else {
      revealTargets.forEach(function(el){ el.classList.add('revealed'); });
    }
  }

  // ---------- Stat count-up ----------
  function animateStat(statEl){
    var b = statEl.querySelector('b');
    if(!b) return;
    var node = null;
    for(var i = 0; i < b.childNodes.length; i++){
      var n = b.childNodes[i];
      if(n.nodeType === 3 && n.textContent.trim().length){ node = n; break; }
    }
    if(!node) return;
    var raw = node.textContent;
    var match = raw.match(/^([\d,]+(?:\.\d+)?)/);
    if(!match){ return; }
    var numStr = match[1];
    var suffix = raw.slice(numStr.length);
    var decimals = (numStr.split('.')[1] || '').length;
    var hasComma = numStr.indexOf(',') > -1;
    var target = parseFloat(numStr.replace(/,/g, ''));
    if(isNaN(target)){ return; }
    var duration = 1100;
    var start = null;
    function step(ts){
      if(!start){ start = ts; }
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var current = target * eased;
      var text = decimals ? current.toFixed(decimals) : Math.round(current).toString();
      if(hasComma){ text = Math.round(current).toLocaleString('en-IN'); }
      node.textContent = text + suffix;
      if(progress < 1){ requestAnimationFrame(step); }
      else{ node.textContent = numStr + suffix; }
    }
    requestAnimationFrame(step);
  }

  var statTargets = document.querySelectorAll('.stat');
  if(statTargets.length){
    if('IntersectionObserver' in window && !reducedMotion){
      var statIO = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if(entry.isIntersecting){
            animateStat(entry.target);
            statIO.unobserve(entry.target);
          }
        });
      }, { threshold: 0.4 });
      statTargets.forEach(function(el){ statIO.observe(el); });
    }
  }

  // ---------- Service detail modal ----------
  var SERVICE_DATA = {
    'classic-manicure': {
      title: 'Classic Manicure', category: 'Manicure', image: 'images/service-manicure.png',
      duration: '40 min', price: '₹499',
      desc: "Our everyday reset — a full shape and cuticle tidy, a warm hand massage, and a polish of your choice from the studio's core colour wall. Nothing rushed, nothing overdone.",
      includes: ['Nail shaping to your preferred length', 'Cuticle care and gentle buffing', 'Warm hand & wrist massage', 'Classic polish, colour of your choice']
    },
    'gel-manicure': {
      title: 'Gel Manicure', category: 'Manicure', image: 'images/service-gel-manicure.png',
      duration: '50 min', price: '₹799',
      desc: 'Soak-off gel colour cured under LED for a chip-free finish that holds for a full two weeks. Includes everything from the Classic Manicure, plus the gel application and cure.',
      includes: ['Everything in the Classic Manicure', 'Soak-off gel base, colour & top coat', 'LED cure between each layer', 'Two-week wear, no chipping']
    },
    'luxe-spa-manicure': {
      title: 'Luxe Spa Manicure', category: 'Manicure', image: 'images/service-spa-manicure.png',
      duration: '65 min', price: '₹1,199',
      desc: 'The full ritual — sugar exfoliation to soften rough skin, a warm paraffin dip to lock in moisture, and an extended hand and forearm massage before your polish.',
      includes: ['Sugar scrub exfoliation', 'Warm paraffin wax dip', 'Extended hand & forearm massage', 'Finished with gel or classic polish']
    },
    'classic-pedicure': {
      title: 'Classic Pedicure', category: 'Pedicure', image: 'images/service-pedicure.png',
      duration: '45 min', price: '₹599',
      desc: 'A warm soak, full shape and cuticle care, followed by a polish of your choice — the foot equivalent of our Classic Manicure.',
      includes: ['Warm foot soak', 'Nail shaping & cuticle care', 'Callus check', 'Classic polish, colour of your choice']
    },
    'gel-pedicure': {
      title: 'Gel Pedicure', category: 'Pedicure', image: 'images/service-gel-pedicure.png',
      duration: '55 min', price: '₹899',
      desc: 'Long-hold gel colour on the toes, cured under LED — ideal before travel or for guests who want their pedicure to outlast sandal season.',
      includes: ['Everything in the Classic Pedicure', 'Soak-off gel colour & top coat', 'LED cure', 'Weeks of chip-free wear']
    },
    'luxe-spa-pedicure': {
      title: 'Luxe Spa Pedicure', category: 'Pedicure', image: 'images/service-spa-pedicure.png',
      duration: '75 min', price: '₹1,399',
      desc: 'Our most requested pedicure — a callus treatment, hot stone calf massage and a hydrating mask wrap, finished with your choice of polish.',
      includes: ['Callus treatment', 'Hot stone calf & foot massage', 'Hydrating mask wrap', 'Classic or gel polish finish']
    },
    'full-set': {
      title: 'Full Set — Gel Extensions', category: 'Gel Extensions', image: 'images/service-extensions.png',
      duration: '90 min', price: '₹1,999',
      desc: 'Apres soft-gel tips, applied and shaped to your preferred length — almond, coffin or square — built on your natural nail with no filing damage.',
      includes: ['Consultation on length & shape', 'Soft-gel tip application', 'Shaping — almond, coffin or square', 'Gel colour or French finish included']
    },
    'infill': {
      title: 'Infill / Rebalance', category: 'Gel Extensions', image: 'images/service-infill.png',
      duration: '60 min', price: '₹1,299',
      desc: 'A regrowth fill for existing extensions, recommended every 2–3 weeks to keep your set looking freshly done and structurally sound.',
      includes: ['Safe removal of lifted product', 'Regrowth area rebalanced', 'Shape refreshed', 'New colour or top coat']
    },
    'gelx-overlay': {
      title: 'Gel-X Overlay', category: 'Gel Extensions', image: 'images/service-gelx-overlay.png',
      duration: '100 min', price: '₹2,299',
      desc: 'A soft gel overlay on your natural nail — length without acrylic, for guests who want a strengthened, extended look with a lighter feel.',
      includes: ['Natural nail prep & strengthening', 'Soft gel overlay application', 'Custom length & shape', 'Finished with gel colour']
    },
    'accent-nail': {
      title: 'Accent Nail', category: 'Nail Art', image: 'images/service-nailart.png',
      duration: null, price: 'from ₹99',
      desc: 'One hand-painted accent nail, priced per nail — the easiest way to add a detail to an existing manicure without committing to a full set.',
      includes: ['Freehand design on one nail', 'Priced per nail, add as many as you like', 'Pairs with any manicure', 'Reference photos welcome']
    },
    'french-ombre': {
      title: 'French & Ombré', category: 'Nail Art', image: 'images/service-french-ombre.png',
      duration: null, price: 'from ₹399',
      desc: 'Choose a classic French tip or a hand-blended gradient fade, applied across a full set. A timeless option that pairs with almost anything.',
      includes: ['Full-set application', 'Classic French or gradient ombré', 'Custom tip colour available', 'Finished with high-gloss top coat']
    },
    'chrome-cateye': {
      title: 'Chrome / Cat-Eye', category: 'Nail Art', image: 'images/service-chrome-cateye.png',
      duration: null, price: 'from ₹599',
      desc: 'Mirror chrome powder or a magnetic cat-eye gel finish, applied across a full set for a statement look that catches the light.',
      includes: ['Full-set application', 'Mirror chrome or magnetic cat-eye finish', 'Base colour of your choice', 'Long-wear gel top coat']
    }
  };

  var serviceModal = document.getElementById('serviceModal');
  if(serviceModal){
    var modalImg = document.getElementById('serviceModalImg');
    var modalCat = document.getElementById('serviceModalCat');
    var modalTitle = document.getElementById('serviceModalTitle');
    var modalDuration = document.getElementById('serviceModalDuration');
    var modalPrice = document.getElementById('serviceModalPrice');
    var modalDesc = document.getElementById('serviceModalDesc');
    var modalIncludes = document.getElementById('serviceModalIncludes');
    var modalBook = document.getElementById('serviceModalBook');
    var lastFocused = null;

    function openServiceModal(id, triggerEl){
      var data = SERVICE_DATA[id];
      if(!data) return;
      lastFocused = triggerEl || document.activeElement;
      modalImg.src = data.image;
      modalImg.alt = data.title;
      modalCat.textContent = data.category;
      modalTitle.textContent = data.title;
      modalDuration.textContent = data.duration ? data.duration : data.category;
      modalDuration.style.display = data.duration ? '' : 'none';
      modalPrice.textContent = data.price;
      modalDesc.textContent = data.desc;
      modalIncludes.innerHTML = '';
      data.includes.forEach(function(item){
        var li = document.createElement('li');
        li.textContent = item;
        modalIncludes.appendChild(li);
      });
      modalBook.href = 'contact.html?service=' + encodeURIComponent(data.title.split(' — ')[0]);
      serviceModal.classList.add('open');
      serviceModal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-open');
      var closeBtn = serviceModal.querySelector('.service-modal-close');
      if(closeBtn){ closeBtn.focus(); }
    }

    function closeServiceModal(){
      serviceModal.classList.remove('open');
      serviceModal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('modal-open');
      if(lastFocused && typeof lastFocused.focus === 'function'){ lastFocused.focus(); }
    }

    document.querySelectorAll('[data-service]').forEach(function(card){
      card.addEventListener('click', function(){
        openServiceModal(card.getAttribute('data-service'), card);
      });
      card.addEventListener('keydown', function(e){
        if(e.key === 'Enter' || e.key === ' '){
          e.preventDefault();
          openServiceModal(card.getAttribute('data-service'), card);
        }
      });
    });

    serviceModal.querySelectorAll('[data-modal-close]').forEach(function(el){
      el.addEventListener('click', closeServiceModal);
    });

    document.addEventListener('keydown', function(e){
      if(e.key === 'Escape' && serviceModal.classList.contains('open')){
        closeServiceModal();
      }
    });
  }

  // ---------- Prefill booking form service from ?service= query param ----------
  var bookingSelect = document.querySelector('#bookingForm select[name="service"]');
  if(bookingSelect){
    var params = new URLSearchParams(window.location.search);
    var wanted = params.get('service');
    if(wanted){
      var options = bookingSelect.querySelectorAll('option');
      for(var oi = 0; oi < options.length; oi++){
        if(options[oi].textContent.indexOf(wanted) === 0){
          options[oi].selected = true;
          break;
        }
      }
      var bookingFormEl = document.getElementById('bookingForm');
      if(bookingFormEl){
        setTimeout(function(){
          bookingFormEl.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'center' });
        }, 300);
      }
    }
  }
})();
