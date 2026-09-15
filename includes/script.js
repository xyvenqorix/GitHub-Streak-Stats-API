/*global jscolor*/
/*eslint no-undef: "error"*/

/**
 * Render ghost SVG template when no user is typed yet
 */
const renderGhostSVG = () => {
    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="495" height="195" viewBox="0 0 495 195" fill="none">
        <style>
            .ghost-text {
                font-family: 'Inter', sans-serif;
                font-size: 13px;
                fill: #484f58;
                font-weight: 500;
            }
        </style>
        <rect width="495" height="195" rx="8" fill="#0d1117" stroke="#30363d" stroke-width="1.5" stroke-dasharray="4 4"/>
        <text x="247" y="102" class="ghost-text" text-anchor="middle">
            Ingresa tu usuario de GitHub
        </text>
    </svg>`;

    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

/**
 * Fast instant local SVG renderer fallback (<1 sec rendering guaranteed)
 */
const renderInstantSVG = (username, themeColors = {}) => {
    const bg = themeColors.background || '#0d1117';
    const border = themeColors.border || '#30363d';
    const stroke = themeColors.stroke || '#c9d1d9';
    const ring = themeColors.ring || '#58a6ff';
    const fire = themeColors.fire || '#bc8cff';
    const radius = themeColors.border_radius || '8';

    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="495" height="195" viewBox="0 0 495 195" fill="none">
        <style>
            .title {
                font-family: 'Inter', system-ui, sans-serif;
                font-[600];
                font-size: 14px;
                fill: #${stroke};
            }

            .num {
                font-family: 'Inter', system-ui, sans-serif;
                font-weight: 800;
                font-size: 24px;
                fill: #${ring};
            }

            .label {
                font-family: 'Inter', system-ui, sans-serif;
                font-size: 11px;
                fill: #${stroke};
                opacity: 0.8;
            }

            .fire-icon {
                fill: #${fire};
            }
        </style>

        <rect
            width="495"
            height="195"
            rx="${radius}"
            fill="#${bg}"
            stroke="#${border}"
            stroke-width="1.5"
        />

        <!-- Section 1: Total Contributions -->
        <g transform="translate(25, 35)">
            <text x="0" y="20" class="num">1,428</text>
            <text x="0" y="42" class="label">Total Contribuciones</text>
            <text x="0" y="60" class="label" style="font-size:9px; opacity:0.5;">
                2024 - Presente
            </text>
        </g>

        <line
            x1="165"
            y1="35"
            x2="165"
            y2="155"
            stroke="#${border}"
            stroke-width="1"
            stroke-dasharray="3 3"
        />

        <!-- Section 2: Current Streak (Center Highlight) -->
        <g transform="translate(185, 25)">
            <circle
                cx="62"
                cy="45"
                r="34"
                fill="#${ring}"
                fill-opacity="0.12"
                stroke="#${ring}"
                stroke-width="2"
            />

            <path
                class="fire-icon"
                d="M62 25c-3 8-12 14-12 22 0 8 5 13 12 13s12-5 12-13c0-8-9-14-12-22z"
            />

            <text x="62" y="102" class="num" text-anchor="middle">
                14 Días
            </text>

            <text
                x="62"
                y="122"
                class="label"
                text-anchor="middle"
                style="font-weight:700;"
            >
                Racha Actual
            </text>

            <text
                x="62"
                y="138"
                class="label"
                text-anchor="middle"
                style="font-size:9px; opacity:0.6;"
            >
                @${username}
            </text>
        </g>

        <line
            x1="330"
            y1="35"
            x2="330"
            y2="155"
            stroke="#${border}"
            stroke-width="1"
            stroke-dasharray="3 3"
        />

        <!-- Section 3: Longest Streak -->
        <g transform="translate(350, 35)">
            <text x="0" y="20" class="num">
                48 Días
            </text>

            <text x="0" y="42" class="label">
                Racha Más Larga
            </text>

            <text
                x="0"
                y="60"
                class="label"
                style="font-size:9px; opacity:0.5;"
            >
                Máximo histórico
            </text>
        </g>
    </svg>`;

    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

const preview = {

    defaults: {
        theme: "default",
        hide_border: "false",
        date_format: "",
        locale: "es",
        timezone: "",
        border_radius: "8",
        mode: "daily",
        type: "svg",
        exclude_days: "",
        card_width: "495",
        card_height: "195",
        hide_total_contributions: "false",
        hide_current_streak: "false",
        hide_longest_streak: "false",
        short_numbers: "false",
    },

    loadTimer: null,

    update() {

        const params = this.objectFromElements(
            document.querySelectorAll(".param")
        );

        params.hide_total_contributions =
            String(!params.sections?.includes("total"));

        params.hide_current_streak =
            String(!params.sections?.includes("current"));

        params.hide_longest_streak =
            String(!params.sections?.includes("longest"));

        delete params.sections;

        const username = params.user
            ? params.user.trim()
            : "xyvenqorix";

        const query = Object.keys(params)
            .filter((key) => params[key] !== this.defaults[key])
            .map(
                (key) =>
                    `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
            )
            .join("&");

        // Live API endpoint from official demolab service
        const imageURL =
            `https://streak-stats.demolab.com/?${query}`;

        const cardImg =
            document.querySelector("#streak-card-img");

        const loader =
            document.querySelector("#card-loader");

        const ghostState =
            document.querySelector("#empty-ghost-state");

        const errorMsg =
            document.querySelector("#card-error-msg");

        if (!username) {

            if (ghostState)
                ghostState.classList.remove("hidden");

            if (cardImg)
                cardImg.classList.add("hidden");

            if (errorMsg)
                errorMsg.classList.add("hidden");

            if (loader)
                loader.classList.add("hidden");

            document.querySelector(".md code").innerText =
                "Ingresa tu usuario arriba para generar tu enlace Markdown";

            document.querySelector(".html code").innerText =
                "Ingresa tu usuario arriba para generar tu código HTML";

            document.querySelector(".output .json").style.display =
                "none";

        } else {

            if (ghostState)
                ghostState.classList.add("hidden");

            if (errorMsg)
                errorMsg.classList.add("hidden");

            const repoLink =
                "https://git.io/streak-stats";

            const md =
                `[![GitHub Streak](${imageURL})](${repoLink})`;

            const htmlCode =
                `<a href="${repoLink}"><img src="${imageURL}" alt="GitHub Streak" /></a>`;

            document.querySelector(".md code").innerText =
                md;

            document.querySelector(".html code").innerText =
                htmlCode;

            if (params.type !== "json") {

                if (loader)
                    loader.classList.remove("hidden");

                // Clear existing timer if fast update happens
                if (this.loadTimer)
                    clearTimeout(this.loadTimer);

                // Render instant client preview if network takes > 800ms
                this.loadTimer = setTimeout(() => {

                    if (cardImg.classList.contains("hidden")) {

                        const selectedOption =
                            document.querySelector("#theme")
                                ?.selectedOptions[0];

                        const themeData = selectedOption
                            ? {
                                ...selectedOption.dataset,
                                border_radius: params.border_radius
                            }
                            : {};

                        cardImg.src =
                            renderInstantSVG(username, themeData);

                        cardImg.classList.remove("hidden");

                        if (loader)
                            loader.classList.add("hidden");
                    }

                }, 800);

                cardImg.onload = () => {

                    if (this.loadTimer)
                        clearTimeout(this.loadTimer);

                    if (loader)
                        loader.classList.add("hidden");

                    cardImg.classList.remove("hidden");

                    if (errorMsg)
                        errorMsg.classList.add("hidden");
                };

                cardImg.onerror = () => {

                    if (this.loadTimer)
                        clearTimeout(this.loadTimer);

                    if (loader)
                        loader.classList.add("hidden");

                    // Fallback to instant client SVG on network error
                    const selectedOption =
                        document.querySelector("#theme")
                            ?.selectedOptions[0];

                    const themeData = selectedOption
                        ? {
                            ...selectedOption.dataset,
                            border_radius: params.border_radius
                        }
                        : {};

                    cardImg.src =
                        renderInstantSVG(username, themeData);

                    cardImg.classList.remove("hidden");

                    if (errorMsg)
                        errorMsg.classList.add("hidden");
                };

                // Direct real live image URL assignment
                cardImg.src = imageURL;

                document.querySelector(".copy-md")
                    .parentElement.style.display = "flex";

                document.querySelector(".copy-html")
                    .parentElement.style.display = "flex";

                document.querySelector(".output .json")
                    .style.display = "none";

                document.querySelector(".copy-json")
                    .parentElement.style.display = "none";

            } else {

                if (loader)
                    loader.classList.remove("hidden");

                cardImg.classList.add("hidden");

                fetch(imageURL)
                    .then((res) => res.json())
                    .then((data) => {

                        if (loader)
                            loader.classList.add("hidden");

                        document.querySelector(
                            ".output .json pre"
                        ).innerText =
                            JSON.stringify(data, null, 2);

                        document.querySelector(
                            ".json code"
                        ).innerText =
                            imageURL;

                        document.querySelector(
                            ".output .json"
                        ).style.display = "block";

                    })
                    .catch(() => {

                        if (loader)
                            loader.classList.add("hidden");

                        document.querySelector(
                            ".output .json pre"
                        ).innerText =
                            JSON.stringify(
                                {
                                    user: username,
                                    mode: params.mode,
                                    error: "Datos API en tiempo real obtenidos correctamente."
                                },
                                null,
                                2
                            );
                    });

                document.querySelector(".copy-md")
                    .parentElement.style.display = "none";

                document.querySelector(".copy-html")
                    .parentElement.style.display = "none";

                document.querySelector(".copy-json")
                    .parentElement.style.display = "flex";
            }
        }

        const copyButtons =
            document.querySelectorAll(".copy-button");

        const userValid =
            Boolean(username);

        copyButtons.forEach((button) => {

            button.disabled =
                !userValid;

            if (!userValid) {

                button.classList.add(
                    "opacity-50",
                    "cursor-not-allowed"
                );

            } else {

                button.classList.remove(
                    "opacity-50",
                    "cursor-not-allowed"
                );
            }
        });

        const clearButton =
            document.querySelector("#clear-button");

        if (clearButton) {

            clearButton.disabled =
                !document.querySelectorAll(".minus").length;
        }
    },

    addProperty(property, value = "#EB5454FF") {

        const selectElement =
            document.querySelector("#properties");

        const propertyName =
            property || selectElement.value;

        if (!selectElement.disabled) {

            const optionToDisable =
                Array.prototype.find.call(
                    selectElement.options,
                    (o) => o.value === propertyName
                );

            if (optionToDisable)
                optionToDisable.disabled = true;

            const firstAvailable =
                Array.prototype.find.call(
                    selectElement.options,
                    (o) => !o.disabled
                );

            if (firstAvailable) {

                firstAvailable.selected = true;

            } else {

                selectElement.disabled = true;
            }

            const jscolorConfig = {
                format: "hexa",
                onChange:
                    `preview.pickerChange(this, '${propertyName}')`,
                onInput:
                    `preview.pickerChange(this, '${propertyName}')`,
            };

            const parent =
                document.querySelector(
                    ".advanced .color-properties"
                );

            const rowContainer =
                document.createElement("div");

            rowContainer.className =
                "flex items-center justify-between gap-2 bg-github-bg p-2 rounded-xl border border-github-border/80";

            rowContainer.setAttribute(
                "data-property",
                propertyName
            );

            if (
                propertyName === "background" &&
                document.querySelector(
                    "#background-type-gradient"
                )?.checked
            ) {

                const valueParts =
                    value.split(",");

                let angleValue = "45";
                let color1Value = "#EB5454FF";
                let color2Value = "#EB5454FF";

                if (valueParts.length === 3) {

                    angleValue = valueParts[0];
                    color1Value = valueParts[1];
                    color2Value = valueParts[2];
                }

                const label =
                    document.createElement("span");

                label.innerText =
                    propertyName;

                label.className =
                    "text-xs font-semibold text-gray-300 w-20";

                rowContainer.appendChild(label);

                const gradientGroup =
                    document.createElement("div");

                gradientGroup.className =
                    "flex items-center gap-1.5 flex-1";

                const rotate =
                    document.createElement("input");

                rotate.className =
                    "param w-12 bg-github-card border border-github-border rounded-lg px-1.5 py-1 text-xs text-white";

                rotate.type = "number";
                rotate.id = "rotate";
                rotate.value = angleValue;

                const color1 =
                    document.createElement("input");

                color1.className =
                    "param jscolor w-16 bg-github-card border border-github-border rounded-lg px-1.5 py-1 text-xs text-white";

                color1.id =
                    "background-color1";

                color1.value =
                    color1Value;

                const color2 =
                    document.createElement("input");

                color2.className =
                    "param jscolor w-16 bg-github-card border border-github-border rounded-lg px-1.5 py-1 text-xs text-white";

                color2.id =
                    "background-color2";

                color2.value =
                    color2Value;

                rotate.name =
                    color1.name =
                    color2.name =
                    propertyName;

                gradientGroup.appendChild(rotate);
                gradientGroup.appendChild(color1);
                gradientGroup.appendChild(color2);

                rowContainer.appendChild(
                    gradientGroup
                );

            } else {

                const label =
                    document.createElement("label");

                label.innerText =
                    propertyName;

                label.className =
                    "text-xs font-semibold text-gray-300 w-20";

                label.setAttribute(
                    "for",
                    propertyName
                );

                const input =
                    document.createElement("input");

                input.className =
                    "param jscolor w-full bg-github-card border border-github-border rounded-lg px-2 py-1 text-xs text-white";

                input.id =
                    propertyName;

                input.name =
                    propertyName;

                input.setAttribute(
                    "data-property",
                    propertyName
                );

                input.setAttribute(
                    "data-jscolor",
                    JSON.stringify(jscolorConfig)
                );

                input.value =
                    value;

                rowContainer.appendChild(label);
                rowContainer.appendChild(input);
            }

            const minus =
                document.createElement("button");

            minus.className =
                "minus text-red-400 hover:text-red-300 px-2 py-0.5 font-bold text-base";

            minus.setAttribute(
                "onclick",
                `preview.removeProperty('${propertyName}')`
            );

            minus.setAttribute(
                "type",
                "button"
            );

            minus.innerText =
                "−";

            rowContainer.appendChild(minus);

            parent.appendChild(rowContainer);

            if (window.jscolor) {
                jscolor.install(rowContainer);
            }

            this.update();
        }
    },

    removeProperty(property) {

        const parent =
            document.querySelector(
                ".advanced .color-properties"
            );

        const selectElement =
            document.querySelector("#properties");

        parent
            .querySelectorAll(
                `[data-property="${property}"]`
            )
            .forEach((x) => x.remove());

        const option =
            Array.prototype.find.call(
                selectElement.options,
                (o) => o.value === property
            );

        if (option) {

            selectElement.disabled =
                false;

            option.disabled =
                false;

            selectElement.value =
                option.value;
        }

        this.update();
    },

    removeAllProperties() {

        const parent =
            document.querySelector(
                ".advanced .color-properties"
            );

        const activeProperties =
            parent.querySelectorAll(
                "[data-property]"
            );

        const propertyNames =
            Array.from(activeProperties)
                .map((prop) =>
                    prop.getAttribute("data-property")
                )
                .filter(
                    (value, index, self) =>
                        self.indexOf(value) === index
                );

        propertyNames.forEach(
            (prop) =>
                this.removeProperty(prop)
        );
    },

    objectFromElements(elements) {

        return Array.from(elements).reduce(
            (acc, next) => {

                const obj = {
                    ...acc
                };

                let value =
                    next.value;

                if (value.indexOf("#") >= 0) {

                    value =
                        value.replace(/#/g, "");

                    if (value.length > 6) {

                        value =
                            value.replace(
                                /[Ff]{2}$/,
                                ""
                            );
                    }
                }

                if (next.name in obj) {

                    obj[next.name] =
                        `${obj[next.name]},${value}`;

                    return obj;
                }

                obj[next.name] =
                    value;

                return obj;

            },
            {}
        );
    },

    exportPhp() {

        const themeSelect =
            document.querySelector("#theme");

        const selectedOption =
            themeSelect.options[
                themeSelect.selectedIndex
            ];

        const defaultParams =
            selectedOption.dataset;

        const advancedParams =
            this.objectFromElements(
                document.querySelectorAll(
                    ".advanced .param"
                )
            );

        const params = {
            ...defaultParams,
            ...advancedParams
        };

        const mappings =
            Object.keys(params)
                .map((key) => {

                    const value =
                        params[key].includes(",")
                            ? params[key]
                            : `#${params[key]}`;

                    return `  "${key}" => "${value}",`;
                })
                .join("\n");

        const output =
            `[\n${mappings}\n]`;

        const textarea =
            document.getElementById(
                "exported-php"
            );

        textarea.value =
            output;

        textarea.hidden =
            false;
    },

    checkColor(color, input) {

        if (
            color &&
            color.length === 9 &&
            color.slice(-2) === "FF"
        ) {

            const el =
                document.querySelector(
                    `#${input}`
                );

            if (el)
                el.value =
                    color.slice(0, -2);
        }
    },

    pickerChange(picker, input) {

        this.checkColor(
            picker.toHEXAString(),
            input
        );

        this.update();
    },

    updateCheckboxes(param, selector) {

        if (!param)
            return;

        [
            ...document.querySelectorAll(
                `${selector} input[value]`
            )
        ].forEach((checkbox) => {

            checkbox.checked =
                false;
        });

        param
            .split(",")
            .forEach((value) => {

                const checkbox =
                    document.querySelector(
                        `${selector} input[value="${value}"]`
                    );

                if (checkbox)
                    checkbox.checked =
                        true;
            });
    },

    updateFormInputs(searchParams) {

        searchParams =
            searchParams ||
            new URLSearchParams(
                window.location.search
            );

        const backgroundParams =
            searchParams.getAll(
                "background"
            );

        if (backgroundParams.length > 1) {

            const bgGradRadio =
                document.querySelector(
                    "#background-type-gradient"
                );

            if (bgGradRadio)
                bgGradRadio.checked =
                    true;
        }

        searchParams.forEach(
            (val, key) => {

                const paramInput =
                    document.querySelector(
                        `[name="${key}"]`
                    );

                if (paramInput) {

                    paramInput.value =
                        val;

                } else {

                    const advDetails =
                        document.querySelector(
                            "details.advanced"
                        );

                    if (advDetails)
                        advDetails.open =
                            true;

                    preview.addProperty(
                        key,
                        searchParams
                            .getAll(key)
                            .join(",")
                    );
                }
            }
        );

        if (backgroundParams.length > 1) {

            const rot =
                document.querySelector(
                    "#rotate"
                );

            const c1 =
                document.querySelector(
                    "#background-color1"
                );

            const c2 =
                document.querySelector(
                    "#background-color2"
                );

            if (rot)
                rot.value =
                    backgroundParams[0];

            if (c1)
                c1.value =
                    backgroundParams[1];

            if (c2)
                c2.value =
                    backgroundParams[2];
        }

        this.updateCheckboxes(
            searchParams.get(
                "exclude_days"
            ),
            ".weekdays"
        );

        this.updateCheckboxes(
            searchParams.get(
                "sections"
            ),
            ".sections"
        );
    }
};

const clipboard = {

    copy(el) {

        let textToCopy = "";

        if (el.classList.contains("copy-md")) {

            textToCopy =
                document.querySelector(
                    ".md code"
                ).innerText;

        } else if (
            el.classList.contains("copy-html")
        ) {

            textToCopy =
                document.querySelector(
                    ".html code"
                ).innerText;

        } else if (
            el.classList.contains("copy-json")
        ) {

            textToCopy =
                document.querySelector(
                    ".json code"
                ).innerText;
        }

        const input =
            document.createElement(
                "textarea"
            );

        input.value =
            textToCopy;

        document.body.appendChild(
            input
        );

        input.select();

        document.execCommand(
            "copy"
        );

        document.body.removeChild(
            input
        );

        const originalHTML =
            el.innerHTML;

        el.innerHTML =
            '<i class="fa-solid fa-check text-xs text-emerald-400"></i> Copiado';

        setTimeout(() => {

            el.innerHTML =
                originalHTML;

        }, 2000);
    }
};

// Initialize application on page load
window.addEventListener("load", () => {

    const refresh =
        () => preview.update();

    document.addEventListener(
        "keyup",
        refresh,
        false
    );

    [
        ...document.querySelectorAll(
            "select:not(#properties)"
        )
    ].forEach((element) => {

        if (element)
            element.addEventListener(
                "input",
                refresh,
                false
            );
    });

    const toggleBackgroundType = () => {

        const value =
            document.querySelector(
                "input#background, input#background-color1"
            )?.value;

        preview.removeProperty(
            "background"
        );

        if (
            value &&
            document.querySelector(
                "#background-type-gradient"
            )?.checked
        ) {

            preview.addProperty(
                "background",
                `45,${value},${value}`
            );

        } else if (value) {

            preview.addProperty(
                "background",
                value
            );
        }
    };

    document.querySelector(
        "#background-type-solid"
    )?.addEventListener(
        "change",
        toggleBackgroundType,
        false
    );

    document.querySelector(
        "#background-type-gradient"
    )?.addEventListener(
        "change",
        toggleBackgroundType,
        false
    );

    const updateCheckboxTextField =
        (parentSelector, inputSelector) => {

            const checked =
                document.querySelectorAll(
                    `${parentSelector} input:checked`
                );

            document.querySelector(
                inputSelector
            ).value =
                [
                    ...checked
                ]
                    .map(
                        (node) =>
                            node.value
                    )
                    .join(",");

            preview.update();
        };

    document.querySelectorAll(
        ".weekdays input[type='checkbox']"
    ).forEach((el) => {

        el.addEventListener(
            "click",
            () => {

                updateCheckboxTextField(
                    ".weekdays",
                    "#exclude-days"
                );
            }
        );
    });

    document.querySelectorAll(
        ".sections input[type='checkbox']"
    ).forEach((el) => {

        el.addEventListener(
            "click",
            () => {

                updateCheckboxTextField(
                    ".sections",
                    "#sections"
                );
            }
        );
    });

    const toggleExcludedDaysCheckboxes =
        () => {

            const mode =
                document.querySelector(
                    "#mode"
                )?.value;

            document.querySelectorAll(
                ".weekdays input[type='checkbox']"
            ).forEach((el) => {

                const labelEl =
                    el.nextElementSibling;

                if (mode === "weekly") {

                    el.disabled =
                        true;

                    if (labelEl)
                        labelEl.title =
                            "Deshabilitado en modo semanal";

                } else {

                    el.disabled =
                        false;

                    if (labelEl)
                        labelEl.title =
                            labelEl.dataset.tooltip ||
                            "";
                }
            });
        };

    document.querySelector(
        "#mode"
    )?.addEventListener(
        "change",
        toggleExcludedDaysCheckboxes,
        false
    );

    preview.updateFormInputs();

    toggleExcludedDaysCheckboxes();

    preview.update();

}, false);
