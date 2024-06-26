// static/js/modules/studios.js
import { DataTableManager } from '../common/datatable.js';
import { Utils } from '../common/utils.js';
import translations from '../l18n/en.js';

export default class Studios {
    constructor() {
        this.table = null;
    }

    init() {
        this.initializeDataTable();
    }

    initializeDataTable() {
        const config = {
            ajax: {
                url: '/api/studio',
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
            order: [[2, 'asc']],
            layout: {
                topStart: DataTableManager.returnDefaultLayout()
            },
            language: DataTableManager.returnDefaultLanguage()
        };
        this.table = DataTableManager.initializeDataTable('#studiosTable', config);
    }
}