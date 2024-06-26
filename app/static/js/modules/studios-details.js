// static/js/modules/studio-details.js
import { DataTableManager } from '../common/datatable.js';
import { Utils } from '../common/utils.js';
import translations from '../l18n/en.js';

export default class StudiosDetails {
    constructor() {
        this.table = null;
    }

    init() {
        const url = new URL(window.location.href);
        const segments = url.pathname.split('/');
        const studioId = segments.pop();
    
        // Fetch and display studio details
        fetch(`../api/studio/${studioId}`)
            .then(response => response.json())
            .then(data => {
                document.querySelector('#studioName').textContent = data[0].name;
                document.querySelector('#studioTelegram').textContent = data[0].telegram;
            });
        this.initializeDataTable(studioId);
    }

    initializeDataTable(studioId) {
        const config = {
            ajax: {
                url:  `../api/studio/${studioId}/anime`,
                dataSrc: function(json) {
                    var result = [];
                    Object.keys(json).forEach(function(key) {
                        var item = json[key];
                        item.codename = key;
                        result.push(item);
                    });
                    return result;
                }
            },
            responsive: true,
            columns: [
                { data: "id", title: translations.tableHeaders.anime.id, render: function(data, type, row) {
                    return `<a href="/anime/${data}">${data}</a>`;
                }, visible: true },
                { data: 'titleUa', title: translations.tableHeaders.anime.titleUa, visible: true },
                { data: 'titleEn', title: translations.tableHeaders.anime.titleEn, visible: true },
                { data: 'releaseDate', title: translations.tableHeaders.anime.releaseDate, visible: true },
            ],
            order: [[3, 'des']],
            layout: {
                topStart: DataTableManager.returnDefaultLayout()
            },
            language: DataTableManager.returnDefaultLanguage()
        };
        this.table = DataTableManager.initializeDataTable('#titlesTable', config);
    }
}