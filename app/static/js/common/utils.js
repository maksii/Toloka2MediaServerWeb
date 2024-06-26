// static/js/common/utils.js
import translations from '../l18n/en.js';
export class Utils {
    static async fetchData(url, options = {}) {
        try {
            const response = await fetch(url, options);
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (error) {
            console.error('Error:', error);
            return null;
        }
    }

    static generateOperationResponseOffCanvas(response) {
        if (!response) return; // Exit if no response data
    
        // Determine alert and badge classes based on the response code
        const alertClass = response.response_code === 'SUCCESS' ? 'alert-success' :
                           response.response_code === 'FAILURE' ? 'alert-danger' : 'alert-warning';
        const badgeClass = response.response_code === 'SUCCESS' ? 'bg-success' :
                           response.response_code === 'FAILURE' ? 'bg-danger' : 'bg-warning';
    
        // Helper function to generate list items for accordion
        function generateListItems(items) {
            return items.map(item => `<li class="list-group-item">${item}</li>`).join('');
        }
    
        // Generate accordion HTML
        function generateAccordion(id, headingText, items) {
            return `
                <div class="accordion mt-3" id="${id}">
                    <div class="accordion-item">
                        <h2 class="accordion-header" id="${id}Heading">
                            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#${id}Collapse" aria-expanded="false" aria-controls="${id}Collapse">
                                ${headingText}
                            </button>
                        </h2>
                        <div id="${id}Collapse" class="accordion-collapse collapse" aria-labelledby="${id}Heading">
                            <div class="accordion-body">
                                <ul class="list-group">
                                    ${generateListItems(items)}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
    
        // Generate the entire card with accordions
        const cardHTML = `
            <div class="card alert ${alertClass}">
                <div class="card-body">
                    <h5 class="card-title">Operation Type: ${response.operation_type.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}</h5>
                    <p class="card-text">Response Code: <span class="badge ${badgeClass}">${response.response_code}</span></p>
                    <p class="card-text">Start Time: ${response.start_time}</p>
                    <p class="card-text">End Time: ${response.end_time}</p>
                    ${response.titles_references ? generateAccordion('TitlesAccordion', 'Titles References', response.titles_references) : ''}
                    ${response.torrent_references ? generateAccordion('torrentAccordion', 'Torrent References', response.torrent_references) : ''}
                    ${response.operation_logs ? generateAccordion('logsAccordion', 'Operation Logs', response.operation_logs) : ''}
                    <hr>
                    <p class="mb-0">${translations.labels.operationStatusGithub}</p>
                </div>
            </div>
        `;
    
        // Insert the generated HTML into a predefined container in your HTML
        document.getElementById('offcanvasBody').innerHTML = cardHTML;
    }

    static progressPercentage(progress) {
        const progressPercentage = Math.round(progress * 100);
        return progressPercentage;
    }

    static getColorForProgress(progress) {
        let r, g, b;
    
        if (progress >= 100) {
            r = 25; g = 135; b = 84; // Greenish color for progress >= 100
        } else if (progress >= 40) {
            // Interpolate between yellowish (255, 193, 7) and greenish (25, 135, 84)
            const factor = (progress - 40) / 60; // Adjusting factor to correctly interpolate from 40 to 100
            r = 255 + (25 - 255) * factor;
            g = 193 + (135 - 193) * factor;
            b = 7 + (84 - 7) * factor;
        } else if (progress >= 0) {
            // Interpolate between more intense reddish (255, 0, 0) and less intense reddish (220, 53, 69)
            const factor = progress / 40; // Adjusting factor for interpolation from 0 to 40
            r = 255 + (220 - 255) * factor;
            g = 0 + (53 - 0) * factor;
            b = 0 + (69 - 0) * factor;
        } else {
            r = 255; g = 193; b = 7; // Yellowish color for negative progress (fallback)
        }
    
        return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
    }

    static activeTooltips()
    {
        const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
        const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))
    }

    static downloadFile(url) {
        const link = document.createElement('a');
        link.href = url;
        link.download = true;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    static renderButtonSpinner()
    {
        return `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> ${translations.labels.buttonsLoadingText}`;
    }

    static renderActionButton(action, buttonClass, buttonState, buttonIcon, buttonText)
    {
        return `<button class="btn ${buttonClass} ${action}" ${buttonState}><span class="bi ${buttonIcon}" aria-hidden="true"></span><span class="visually-hidden" role="status">${buttonText}</span></button>`;
    }

    static hasParentWithClass(element, tillParent, classname) {
        while (element && element !== tillParent) {
            if (element.classList && element.classList.contains(classname)) {
                return true;
            }
            element = element.parentNode;
        }
        return false;
    }

    static addRelease()
    {
        const addReleaseModal = new bootstrap.Modal(document.querySelector('#addReleaseModal'), {
            keyboard: false
          });
        addReleaseModal.show();
    }

}

export class Backdrop {
    constructor() {
        this.apiUrl = '/api/tmdb/trending?type=tv';
        this.storageKey = 'tmdbTrendingTV';
        this.expiryTime = 12 * 60 * 60 * 1000; // 12 hours in milliseconds
    }

    fetchData() {
        // Check if data exists and hasn't expired
        const storedData = localStorage.getItem(this.storageKey);
        if (storedData) {
            const parsedData = JSON.parse(storedData);
            const now = new Date().getTime();
            if (now - parsedData.timestamp < this.expiryTime) {
                return Promise.resolve(parsedData.data);
            }
        }

        // Fetch new data if not stored or expired
        return fetch(this.apiUrl)
            .then(response => response.json())
            .then(data => {
                const dataToStore = {
                    timestamp: new Date().getTime(),
                    data: data
                };
                localStorage.setItem(this.storageKey, JSON.stringify(dataToStore));
                return data;
            });
    }

    setRandomBackdrop() {
        this.fetchData().then(data => {
            const results = data.results;
            const randomIndex = Math.floor(Math.random() * results.length);
            const backdropPath = results[randomIndex].backdrop_path;
            const imageUrl = `https://image.tmdb.org/t/p/original${backdropPath}`;
            //const fullUrl = `/image/?url=${encodeURIComponent(imageUrl)}`;

            document.body.style.backgroundImage = `url('${imageUrl}')`;
        }).catch(error => console.error('Error setting the background image:', error));
    }
}