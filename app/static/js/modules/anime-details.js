// static/js/modules/anime-details.js
import { DataTableManager } from '../common/datatable.js';
import { Utils } from '../common/utils.js';
import translations from '../l18n/en.js';

export default class AnimeDetails {
    constructor() {
        this.relatedAnimeTable = null;
        this.studiosTable = null;
    }

    init() {
        const url = new URL(window.location.href);
        const segments = url.pathname.split('/');
        const animeId = segments.pop();
        
        this.initializerelatedAnimeTableDataTable(animeId);
        this.initializeStudiosDataTable(animeId);

        // Fetch and display anime details
        fetch(`../api/anime/${animeId}`)
            .then(response => response.json())
            .then(data => {
                document.querySelector('#animeTitle').textContent = data.titleEn;
                document.querySelector('#animeDescription').textContent = data.description;
                document.querySelector('#linkMal').href = `https://myanimelist.net/anime/${data.malId}`;
                document.querySelector('#linkImdb').href = `https://www.imdb.com/title/${data.ashdiId}`;
                // Additional links can be updated here
            });
    }

    initializerelatedAnimeTableDataTable(animeId) {
        const config = {
            ajax: {
                url:  `../api/anime/${animeId}/related`,
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
                { data: 'season', title: translations.tableHeaders.anime.season, visible: true },
                { data: 'type.name', title: translations.tableHeaders.anime.type, visible: true },
                { data: 'status.name', title: translations.tableHeaders.anime.status, visible: true },
                { data: 'releaseDate', title: translations.tableHeaders.anime.releaseDate, visible: true },
            ],
            order: [[6, 'des']],
            layout: {
                topStart: DataTableManager.returnDefaultLayout()
            },
            language: DataTableManager.returnDefaultLanguage()
        };

        this.relatedAnimeTable = DataTableManager.initializeDataTable('#relatedAnimeTable', config);
    }

    initializeStudiosDataTable(animeId) {
        const config = {
            ajax: {
                url:  `../api/anime/${animeId}/studios`,
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
                { data: "id", title: translations.tableHeaders.studioDetails.id, render: function(data, type, row) {
                    return `<a href="/studios/${data}">${data}</a>`;
                }, visible: true },
                { data: 'name', title: translations.tableHeaders.studioDetails.name, visible: true },
                { data: "telegram", title: translations.tableHeaders.studioDetails.telegram, render: function(data, type, row) {
                    return `<a href="${data}">${data}</a>`;
                }, visible: true },
            ],
            order: [[3, 'des']],
            layout: {
                topStart: DataTableManager.returnDefaultLayout()
            },
            language: DataTableManager.returnDefaultLanguage()
        };
    
        this.studiosTable = DataTableManager.initializeDataTable('#studiosTable', config);
    }

}