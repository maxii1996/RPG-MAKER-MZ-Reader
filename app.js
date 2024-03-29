document.addEventListener('dragover', function (e) {
    e.preventDefault();
});

document.addEventListener('drop', function (e) {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
});

function loadPreviousSession() {
    ['itemsSection', 'weaponsSection', 'armorsSection'].forEach(sectionId => {
        const data = localStorage.getItem(sectionId);
        if (data) {
            displayData(sectionId, JSON.parse(data));
        }
    });
}

function handleFiles(files) {
    for (const file of files) {
        if (file.name === "Items.json" || file.name === "Armors.json" || file.name === "Weapons.json") {
            const reader = new FileReader();
            reader.onload = function (event) {
                try {
                    let items = JSON.parse(event.target.result);
                    items = items.filter(item => item !== null && item.name && !item.name.startsWith("-"));
                    if (items.length > 0) {
                        const sectionId = determineSection(items);
                        localStorage.setItem(sectionId, JSON.stringify(items));
                        displayData(sectionId, items);
                    }
                } catch (err) {
                    console.error('Error parsing JSON:', err);
                }
            };
            reader.readAsText(file);
        }
    }
}

function determineSection(items) {
    if (items.some(item => 'wtypeId' in item)) {
        return 'weaponsSection';
    } else if (items.some(item => 'atypeId' in item)) {
        return 'armorsSection';
    } else {
        return 'itemsSection';
    }
}

function displayData(sectionId, items) {
    let contentHtml = '<div class="list-group">';
    items.forEach(item => {
        if(item && item.name) { // Asegurarse de que el ítem existe y tiene nombre
            const itemDetails = JSON.stringify(item, null, 4) // Mejorar la legibilidad
                                    .replace(/\n/g, "<br>")
                                    .replace(/ /g, "&nbsp;");
            contentHtml += `
                <div class="list-group-item" data-item-id="${item.id}">
                    <a href="#" class="toggle-details">ID: ${item.id}, Name: ${item.name}</a>
                    <div id="details-${sectionId}-${item.id}" class="item-details collapse">
                        <pre>${itemDetails}</pre>
                    </div>
                </div>
            `;
        }
    });
    contentHtml += '</div>';
    document.getElementById(sectionId).innerHTML = contentHtml;

    // Añadir evento de clic para expandir/contraer los detalles del ítem
    document.querySelectorAll(`#${sectionId} .list-group-item .toggle-details`).forEach(itemElement => {
        itemElement.addEventListener('click', function(event) {
            event.preventDefault(); // Prevenir el comportamiento por defecto del enlace
            const parent = this.parentElement;
            const details = parent.querySelector('.item-details');
            details.classList.toggle('show');
        });
    });
}



document.querySelectorAll('.file-upload-wrapper').forEach(wrapper => {
    const input = wrapper.querySelector('input[type="file"]');
    input.addEventListener('change', function () {
        handleFiles(this.files);
    });
});

document.getElementById('uploadFolder').addEventListener('change', function () {
    handleFiles(this.files);
});

document.addEventListener('DOMContentLoaded', loadPreviousSession);

document.getElementById('uploadFolder').addEventListener('change', function (e) {
    handleFiles(this.files);

    if (this.files.length > 0) {
        const folderPath = this.files[0].webkitRelativePath.split('/')[0];
        document.getElementById('folderPath').textContent = folderPath;
    }
});
