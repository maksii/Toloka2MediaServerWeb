// static/js/modules/anime.js
import { DataTableManager } from '../common/datatable.js';
import { Utils } from '../common/utils.js';
import translations from '../l18n/en.js';

export default class Anime {
    constructor() {
        this.table = null;
    }

    init() {
        this.initializeDataTable();
    }

    initializeDataTable() {
        const config = {
            ajax: {
                url: '/api/anime',
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
        this.table = DataTableManager.initializeDataTable('#animeTable', config);
    }

}