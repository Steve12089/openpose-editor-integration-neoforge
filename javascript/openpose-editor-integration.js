(function () {
    const AllCnetTabs = new Set();

    function getPoseElements(generatedImageGroup) {
        const poseEl = generatedImageGroup.querySelector(".cnet-pose-json");
        if (!poseEl) return null;

        const poseTextbox = poseEl.tagName === "TEXTAREA" ? poseEl : poseEl.querySelector("textarea");
        const poseWrapper = poseEl.tagName === "TEXTAREA" ? poseEl.closest(".gr-textbox") : poseEl;
        const downloadLink = generatedImageGroup.querySelector(".cnet-download-pose a");
        const renderButton = generatedImageGroup.querySelector(".cnet-render-pose");
        const allowPreviewCheckbox = generatedImageGroup.closest(".tabitem").querySelector(".cnet-allow-preview input");

        return { poseTextbox, poseWrapper, downloadLink, renderButton, allowPreviewCheckbox };
    }

    function getPoseURL(poseTextbox, downloadLink) {
        if (poseTextbox && poseTextbox.value) return poseTextbox.value;
        if (downloadLink && downloadLink.href) return downloadLink.href;
        return "";
    }

    function applyPose(tab, generatedImageGroup, poseURL) {
        const elements = getPoseElements(generatedImageGroup);
        if (!elements || !elements.poseTextbox || !elements.renderButton) return;

        if (elements.allowPreviewCheckbox && !elements.allowPreviewCheckbox.checked) {
            elements.allowPreviewCheckbox.click();
        }
        if (elements.downloadLink) elements.downloadLink.href = poseURL;

        elements.poseTextbox.value = poseURL;
        updateInput(elements.poseTextbox);
        elements.renderButton.click();
    }

    function openEditor(tab, generatedImageGroup) {
        const elements = getPoseElements(generatedImageGroup);
        if (!elements) return;

        const poseURL = getPoseURL(elements.poseTextbox, elements.downloadLink);
        if (!poseURL) {
            console.log("[openpose-editor-integration] No OpenPose JSON found. Run an OpenPose preprocessor first.");
            alert("No OpenPose JSON found. Run an OpenPose preprocessor first.");
            return;
        }

        const inputImage = tab.querySelector(".cnet-input-image-group .cnet-image img.forge-image");
        const imageURL = inputImage ? inputImage.getAttribute("src") : undefined;

        const modalId = `openpose-editor-${Date.now()}`;
        const modal = document.createElement("div");
        modal.className = "openpose-editor-modal";

        const iframe = document.createElement("iframe");
        iframe.className = "openpose-editor-iframe";
        iframe.src = "openpose_editor_index";
        modal.appendChild(iframe);

        const closeButton = document.createElement("div");
        closeButton.className = "openpose-editor-modal-close";
        closeButton.title = "Close";
        closeButton.textContent = "✕";
        modal.appendChild(closeButton);

        document.body.appendChild(modal);

        function closeModal() {
            window.removeEventListener("message", onMessage);
            document.removeEventListener("keydown", onKeyDown);
            if (modal.parentElement) modal.parentElement.removeChild(modal);
        }

        function onMessage(event) {
            const data = event.data || {};
            if (data.ready === true) {
                iframe.contentWindow.postMessage({ modalId, poseURL, imageURL }, "*");
            }
            if (data.modalId === modalId && data.poseURL) {
                closeModal();
                applyPose(tab, generatedImageGroup, data.poseURL);
            }
        }

        function onKeyDown(event) {
            if (event.key === "Escape") closeModal();
        }

        closeButton.addEventListener("click", closeModal);
        window.addEventListener("message", onMessage);
        document.addEventListener("keydown", onKeyDown);
    }

    function setupOpenPoseEditorIntegration() {
        const tabs = document.querySelectorAll("#controlnet .tabitem");

        for (const tab of tabs) {
            if (AllCnetTabs.has(tab)) continue;
            AllCnetTabs.add(tab);

            const generatedImageGroup = tab.querySelector(".cnet-generated-image-group");
            if (!generatedImageGroup) continue;

            const controlGroup = generatedImageGroup.querySelector(".cnet-generated-image-control-group");
            if (!controlGroup) continue;

            const editLink = document.createElement("a");
            editLink.className = "cnet-edit-pose";
            editLink.title = "Edit Pose with OpenPose Editor";
            editLink.textContent = "编辑";
            editLink.addEventListener("click", (event) => {
                event.preventDefault();
                event.stopPropagation();
                openEditor(tab, generatedImageGroup);
            });
            controlGroup.appendChild(editLink);

            const typeFilterGroup = tab.querySelector(".controlnet_control_type_filter_group");
            const typeRadios = typeFilterGroup ? Array.from(typeFilterGroup.querySelectorAll("input[type='radio']")) : [];

            function isOpenPoseSelected() {
                const checked = typeFilterGroup ? typeFilterGroup.querySelector("input:checked") : null;
                return checked !== null && checked.value === "OpenPose";
            }

            function syncEditVisibility() {
                editLink.style.display = isOpenPoseSelected() ? "" : "none";
            }

            syncEditVisibility();
            for (const radio of typeRadios) {
                radio.addEventListener("change", syncEditVisibility);
            }
        }
    }

    onUiLoaded(setupOpenPoseEditorIntegration);
})();
