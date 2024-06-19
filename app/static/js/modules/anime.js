// static/js/modules/releases.js
import { DataTableManager } from '../common/datatable.js';
import { Utils } from '../common/utils.js';

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
                { data: "id", title: 'ID', render: function(data, type, row) {
                    return `<a href="/anime/${data}">${data}</a>`;
                }, visible: true },
                { data: 'titleUa', title: 'UA', visible: true },
                { data: 'titleEn', title: 'EN', visible: true },
                { data: 'season', title: 'Season', visible: true },
                { data: 'type.name', title: 'Type', visible: true },
                { data: 'status.name', title: 'Status', visible: true },
                { data: 'releaseDate', title: 'releaseDate', visible: true },
            ],
            order: [[6, 'des']],
            layout: {
                topStart: {
                    buttons: [
                        {
                            extend: 'colvis',
                            postfixButtons: ['colvisRestore'],
                            text: '<i class="bi bi-table"></i>',
                            titleAttr: 'Column Visibility'
                            
                        },
                        {
                            extend: 'searchPanes',
                            className: 'btn btn-secondary',
                            config: {
                                cascadePanes: true
                            }
                            
                        },
                        { 
                            action: function ( e, dt, node, config ) {dt.ajax.reload();},                        
                            text: '<i class="bi bi-arrow-clockwise"></i>',
                            titleAttr: 'Refresh'
                        },
                        {
                            extend: 'pageLength',
                            className: 'btn btn-secondary'
                        }
                    ]
                }
            },
            language: {
                search: "_INPUT_",
                searchPlaceholder: "Search records"
            }
        };
        this.table = DataTableManager.initializeDataTable('#animeTable', config);
    }

}