(() => {
    const patches = [
        {
            status: 'Released \u00b7 July 2026',
            signal: 'ON AIR \u00b7 TND6480i',
            title: 'Tomorrow Never Dies 6480i Patch',
            description: 'A released 480i patch for Tomorrow Never Dies. Open the project page for the release and technical details.',
            action: 'Open patch on GitHub',
            href: 'https://github.com/Cyiatic/TND6480i',
            external: true,
            logo: 'images/tnd6480i-logo-authentic.png',
            logoClass: 'is-wide'
        },
        {
            status: 'In development \u00b7 No public build',
            signal: 'NEXT SIGNAL \u00b7 CBFD480i',
            title: "Conker's Bad Fur Day 480i Patch",
            description: 'The next 480i project is on the bench. Public builds and project details will appear here when they are ready.',
            action: 'View project status',
            href: 'patches#cbfd480i',
            external: false,
            logo: 'images/cbfd480i-logo-authentic.png',
            logoClass: 'is-cbfd'
        },
        {
            status: 'Classified \u00b7 Signal locked',
            signal: 'ENCRYPTED SIGNAL \u00b7 COMING SOON',
            title: 'Classified 480i Project',
            description: 'A third signal is forming behind the static. Its identity and release details remain classified.',
            action: 'Review the project timeline',
            href: 'projects',
            external: false,
            logo: null,
            logoClass: ''
        }
    ];

    document.querySelectorAll('[data-patch-carousel]').forEach((carousel) => {
        const stage = carousel.querySelector('[data-carousel-stage]');
        const logo = carousel.querySelector('[data-carousel-logo]');
        const previous = carousel.querySelector('[data-carousel-previous]');
        const next = carousel.querySelector('[data-carousel-next]');
        const status = carousel.querySelector('[data-carousel-status]');
        const title = carousel.querySelector('[data-carousel-title]');
        const description = carousel.querySelector('[data-carousel-description]');
        const action = carousel.querySelector('[data-carousel-action]');
        const counter = carousel.querySelector('[data-carousel-counter]');
        const signal = carousel.querySelector('[data-carousel-signal]');
        const details = carousel.querySelector('[data-carousel-details]');
        const characters = [...carousel.querySelectorAll('[data-patch-index]')];

        if (!stage || !logo || !previous || !next || !status || !title || !description || !action || !counter || !signal || !details || characters.length !== patches.length) {
            return;
        }

        const requestedIndex = Number(carousel.dataset.initialIndex);
        let selected = Number.isInteger(requestedIndex) && requestedIndex >= 0 && requestedIndex < patches.length
            ? requestedIndex
            : window.location.hash === '#cbfd480i'
                ? 1
                : 0;
        let detailTimer;
        let rotationTimer;
        let rotationEndCharacter;
        let rotationEndHandler;
        let isRotating = false;
        let queuedIntent = null;
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        const motionDuration = 580;

        const detachRotationEnd = () => {
            if (rotationEndCharacter && rotationEndHandler) {
                rotationEndCharacter.removeEventListener('animationend', rotationEndHandler);
            }

            rotationEndCharacter = undefined;
            rotationEndHandler = undefined;
        };

        const runQueuedIntent = () => {
            const intent = queuedIntent;
            queuedIntent = null;

            if (!intent) return;

            window.requestAnimationFrame(() => {
                if (intent.type === 'select') {
                    requestSelection(intent.target);
                } else {
                    requestMove(intent.direction);
                }
            });
        };

        const finishRotation = () => {
            if (!isRotating) return;

            window.clearTimeout(rotationTimer);
            detachRotationEnd();
            characters.forEach((character) => character.removeAttribute('data-motion'));
            isRotating = false;
            runQueuedIntent();
        };

        const animateSlotChanges = (slotChanges) => {
            if (reduceMotion.matches) return;

            const movingCharacters = slotChanges.filter(({ from, to }) => from !== to);
            if (!movingCharacters.length) return;

            isRotating = true;
            movingCharacters.forEach(({ character, from, to }) => {
                character.dataset.motion = `${from}-to-${to}`;
            });

            const incoming = movingCharacters.find(({ to }) => to === 'front');
            if (incoming) {
                rotationEndCharacter = incoming.character;
                rotationEndHandler = (event) => {
                    if (event.target === rotationEndCharacter && event.animationName.startsWith('spindle-')) {
                        finishRotation();
                    }
                };
                rotationEndCharacter.addEventListener('animationend', rotationEndHandler);
            }

            rotationTimer = window.setTimeout(finishRotation, motionDuration + 140);
        };

        const renderLogo = (patch) => {
            logo.replaceChildren();
            logo.className = `patch-entry__logo ${patch.logoClass || ''}`.trim();
            logo.hidden = !patch.logo;

            if (!patch.logo) return;

            const image = document.createElement('img');
            image.src = patch.logo;
            image.alt = '';
            logo.append(image);
        };

        const render = (direction) => {
            const patch = patches[selected];
            status.textContent = patch.status;
            signal.textContent = patch.signal;
            title.textContent = patch.title;
            description.textContent = patch.description;
            action.replaceChildren(document.createTextNode(`${patch.action} `));

            const arrow = document.createElement('span');
            arrow.setAttribute('aria-hidden', 'true');
            arrow.textContent = patch.external ? '\u2197' : '\u2192';
            action.append(arrow);
            action.href = patch.href;

            if (patch.external) {
                action.target = '_blank';
                action.rel = 'noopener';
            } else {
                action.removeAttribute('target');
                action.removeAttribute('rel');
            }

            renderLogo(patch);
            counter.textContent = `${String(selected + 1).padStart(2, '0')} / ${String(patches.length).padStart(2, '0')}`;
            stage.setAttribute('aria-label', `Selection ${selected + 1} of ${patches.length}: ${patch.title}. Use left and right arrow keys to change selection.`);

            const slotChanges = characters.map((character, index) => {
                const relativePosition = (index - selected + patches.length) % patches.length;
                const slot = ['front', 'rear-right', 'rear-left'][relativePosition];
                const from = character.dataset.slot;
                character.dataset.slot = slot;
                character.setAttribute('aria-pressed', String(relativePosition === 0));
                return { character, from, to: slot };
            });

            if (!direction) return;

            animateSlotChanges(slotChanges);
            details.classList.remove('is-entering-left', 'is-entering-right');
            void details.offsetWidth;
            details.classList.add(direction > 0 ? 'is-entering-right' : 'is-entering-left');
            window.clearTimeout(detailTimer);
            detailTimer = window.setTimeout(() => {
                details.classList.remove('is-entering-left', 'is-entering-right');
            }, 280);
        };

        const startMove = (direction) => {
            selected = (selected + direction + patches.length) % patches.length;
            render(direction);
        };

        const requestMove = (direction) => {
            if (isRotating) {
                queuedIntent = { type: 'move', direction };
                return;
            }

            startMove(direction);
        };

        const requestSelection = (target) => {
            if (!Number.isInteger(target) || target < 0 || target >= patches.length) return;

            if (isRotating) {
                queuedIntent = target === selected ? null : { type: 'select', target };
                return;
            }

            if (target === selected) return;

            const direction = (target - selected + patches.length) % patches.length === 1 ? 1 : -1;
            selected = target;
            render(direction);
        };

        previous.disabled = false;
        next.disabled = false;
        previous.addEventListener('click', () => requestMove(-1));
        next.addEventListener('click', () => requestMove(1));

        characters.forEach((character) => {
            character.addEventListener('click', () => {
                requestSelection(Number(character.dataset.patchIndex));
            });
        });

        document.querySelectorAll(`[data-carousel-target="${carousel.id}"]`).forEach((button) => {
            button.addEventListener('click', () => {
                requestSelection(Number(button.dataset.selectPatch));

                stage.scrollIntoView({
                    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
                    block: 'center'
                });
                stage.focus({ preventScroll: true });
            });
        });

        stage.addEventListener('keydown', (event) => {
            if (event.key === 'ArrowLeft') {
                event.preventDefault();
                if (!event.repeat || !isRotating) requestMove(-1);
            }
            if (event.key === 'ArrowRight') {
                event.preventDefault();
                if (!event.repeat || !isRotating) requestMove(1);
            }
        });

        const handleMotionPreference = (event) => {
            if (event.matches) finishRotation();
        };

        if (typeof reduceMotion.addEventListener === 'function') {
            reduceMotion.addEventListener('change', handleMotionPreference);
        } else if (typeof reduceMotion.addListener === 'function') {
            reduceMotion.addListener(handleMotionPreference);
        }

        render();
    });
})();
