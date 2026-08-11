(() => {
    const patches = [
        {
            key: 'tnd',
            status: 'Released \u00b7 July 2026',
            signal: 'ON AIR \u00b7 TND6480i',
            title: 'Tomorrow Never Dies 6480i Patch',
            description: 'A released 480i patch for Tomorrow Never Dies. Open the project page for the release and technical details.',
            action: 'Open patch on GitHub',
            href: 'https://github.com/Cyiatic/TND6480i',
            external: true,
            heroImage: 'images/tnd-bond-selector-full.webp',
            heroAlt: 'James Bond holding a silenced pistol for Tomorrow Never Dies 6480i',
            heroLogo: 'images/tnd6480i-logo.webp?v=20260723-cover',
            heroClass: 'is-tnd'
        },
        {
            key: 'cbfd',
            status: 'In development \u00b7 No public build',
            signal: 'NEXT SIGNAL \u00b7 CBFD480i',
            title: "Conker's Bad Fur Day 480i Patch",
            description: 'The next 480i project is on the bench. Public builds and project details will appear here when they are ready.',
            action: 'View project status',
            href: 'patches#cbfd480i',
            external: false,
            hash: '#cbfd480i',
            heroImage: 'images/cbfd480i-full-cigar.webp',
            heroAlt: "Conker's Bad Fur Day 480i project artwork",
            heroLogo: null,
            heroClass: 'is-cbfd'
        },
        {
            key: 'dkr',
            status: 'In development \u00b7 Signal locked',
            signal: 'ENCRYPTED SIGNAL \u00b7 DKR480i',
            title: 'Diddy Kong Racing 480i Patch',
            description: 'Diddy Kong Racing 480i remains under wraps. Public project details, releases, and downloads will transmit when the signal clears.',
            action: 'View classified signal',
            href: 'patches#dkr480i',
            external: false,
            hash: '#dkr480i',
            heroImage: 'images/dkr-diddy-plane.webp',
            heroAlt: 'Diddy Kong Racing 480i project, signal locked render',
            heroLogo: 'images/dkr-coming-soon.webp',
            heroClass: 'is-dkr'
        },
        {
            key: 'classified',
            status: 'In development \u00b7 Signal locked',
            signal: 'ENCRYPTED SIGNAL \u00b7 PERFECT DARK',
            title: 'Perfect Dark: 480i + Performance Patch',
            description: 'A combined 480i and performance patch remains under wraps. Release details and downloads will transmit when the signal clears.',
            action: 'Review the project timeline',
            href: 'patches#perfect-dark',
            external: false,
            heroImage: 'images/mystery-selector.webp',
            heroAlt: 'Perfect Dark 480i and performance project silhouette',
            heroLogo: 'images/perfect-dark-coming-soon.webp',
            heroClass: 'is-classified'
        }
    ];

    const getHashIndex = () => patches.findIndex((patch) => patch.hash === window.location.hash);

    document.querySelectorAll('[data-project-gallery]').forEach((gallery) => {
        const panel = gallery.querySelector('[data-gallery-panel]');
        const art = gallery.querySelector('[data-gallery-art]');
        const previous = gallery.querySelector('[data-gallery-previous]');
        const next = gallery.querySelector('[data-gallery-next]');
        const status = gallery.querySelector('[data-gallery-status]');
        const title = gallery.querySelector('[data-gallery-title]');
        const description = gallery.querySelector('[data-gallery-description]');
        const action = gallery.querySelector('[data-gallery-action]');
        const counter = gallery.querySelector('[data-gallery-counter]');
        const signal = gallery.querySelector('[data-gallery-signal]');
        const tabRail = gallery.querySelector('[role="tablist"]');
        const tabs = [...gallery.querySelectorAll('[data-patch-index]')];

        if (!panel || !art || !previous || !next || !status || !title || !description || !action || !counter || !signal || !tabRail || tabs.length !== patches.length) {
            return;
        }

        const requestedIndex = Number(gallery.dataset.initialIndex);
        const hashIndex = getHashIndex();
        let selected = Number.isInteger(requestedIndex) && requestedIndex >= 0 && requestedIndex < patches.length
            ? requestedIndex
            : hashIndex >= 0
                ? hashIndex
                : 0;
        let transitionTimer;
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

        const revealSelectedTab = (tab, animated) => {
            if (tabRail.scrollWidth <= tabRail.clientWidth) return;

            const target = Math.max(
                0,
                Math.min(
                    tab.offsetLeft - ((tabRail.clientWidth - tab.offsetWidth) / 2),
                    tabRail.scrollWidth - tabRail.clientWidth
                )
            );

            tabRail.scrollTo({
                left: target,
                behavior: animated && !reduceMotion.matches ? 'smooth' : 'auto'
            });
        };

        const renderArt = (patch) => {
            art.replaceChildren();
            art.className = `project-gallery__art ${patch.heroClass}`;

            const image = document.createElement('img');
            image.src = patch.heroImage;
            image.alt = '';
            image.decoding = 'async';
            art.append(image);

            if (!patch.heroLogo) return;

            const logo = document.createElement('img');
            logo.className = 'project-gallery__art-logo';
            logo.src = patch.heroLogo;
            logo.alt = '';
            logo.decoding = 'async';
            art.append(logo);
        };

        const render = (direction = 0) => {
            const patch = patches[selected];
            const activeTab = tabs[selected];

            gallery.dataset.activeProject = patch.key;
            status.textContent = patch.status;
            signal.textContent = patch.signal;
            title.textContent = patch.title;
            description.textContent = patch.description;
            counter.textContent = `${String(selected + 1).padStart(2, '0')} / ${String(patches.length).padStart(2, '0')}`;
            panel.setAttribute('aria-label', `Selected project: ${patch.title}. Use left and right arrow keys to change selection.`);
            panel.setAttribute('aria-labelledby', activeTab.id);

            action.replaceChildren(document.createTextNode(`${patch.action} `));
            const arrow = document.createElement('span');
            arrow.setAttribute('aria-hidden', 'true');
            arrow.textContent = patch.external ? '\u2197' : '\u2192';
            action.append(arrow);
            action.href = patch.href;

            if (patch.external) {
                action.target = '_blank';
                action.rel = 'noopener';
                action.setAttribute('aria-label', `${patch.action}. Opens GitHub in a new tab`);
            } else {
                action.removeAttribute('target');
                action.removeAttribute('rel');
                action.removeAttribute('aria-label');
            }

            renderArt(patch);

            tabs.forEach((tab, index) => {
                const isSelected = index === selected;
                tab.classList.toggle('is-selected', isSelected);
                tab.setAttribute('aria-selected', String(isSelected));
                tab.tabIndex = isSelected ? 0 : -1;
            });

            revealSelectedTab(activeTab, Boolean(direction));

            if (!direction || reduceMotion.matches) return;

            window.clearTimeout(transitionTimer);
            panel.classList.remove('is-changing-forward', 'is-changing-backward');
            void panel.offsetWidth;
            panel.classList.add(direction > 0 ? 'is-changing-forward' : 'is-changing-backward');
            transitionTimer = window.setTimeout(() => {
                panel.classList.remove('is-changing-forward', 'is-changing-backward');
            }, 340);
        };

        const move = (direction) => {
            selected = (selected + direction + patches.length) % patches.length;
            render(direction);
        };

        const select = (target, focusTab = false) => {
            if (!Number.isInteger(target) || target < 0 || target >= patches.length || target === selected) return;

            const forwardDistance = (target - selected + patches.length) % patches.length;
            const backwardDistance = (selected - target + patches.length) % patches.length;
            selected = target;
            render(forwardDistance <= backwardDistance ? 1 : -1);

            if (focusTab) tabs[target].focus();
        };

        previous.addEventListener('click', () => move(-1));
        next.addEventListener('click', () => move(1));

        tabs.forEach((tab, index) => {
            tab.addEventListener('click', () => select(index));
            tab.addEventListener('keydown', (event) => {
                let target;

                if (event.key === 'ArrowLeft') target = (index - 1 + patches.length) % patches.length;
                if (event.key === 'ArrowRight') target = (index + 1) % patches.length;
                if (event.key === 'Home') target = 0;
                if (event.key === 'End') target = patches.length - 1;
                if (target === undefined) return;

                event.preventDefault();
                select(target, true);
            });
        });

        panel.addEventListener('keydown', (event) => {
            if (event.key === 'ArrowLeft') {
                event.preventDefault();
                move(-1);
            }

            if (event.key === 'ArrowRight') {
                event.preventDefault();
                move(1);
            }
        });

        document.querySelectorAll(`[data-gallery-target="${gallery.id}"]`).forEach((button) => {
            button.addEventListener('click', () => {
                select(Number(button.dataset.selectPatch));
                panel.scrollIntoView({
                    behavior: reduceMotion.matches ? 'auto' : 'smooth',
                    block: 'center'
                });
                panel.focus({ preventScroll: true });
            });
        });

        window.addEventListener('hashchange', () => {
            const target = getHashIndex();
            if (target >= 0) select(target);
        });

        render();
    });
})();
